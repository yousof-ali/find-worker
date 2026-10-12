import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import bcrypt from "bcryptjs";
import Worker from "@/models/Worker";
import Category from "@/models/Category";
import WorkSample from "@/models/WorkSample";
import { hasUpload, saveFile, removeFile } from "@/lib/upload";
import Review from "@/models/Review";
import User from "@/models/User";

const AVATAR_MAX = 5 * 1024 * 1024; // 5MB
const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_ITEMS = 20;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

/* ---------------- errors ---------------- */

class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const fail = (message, status = 400) =>
  NextResponse.json({ message }, { status });

const handleError = (err, label) => {
  if (err instanceof HttpError) return fail(err.message, err.status);
  if (err.name === "ValidationError" || err.name === "CastError")
    return fail(err.message, 400);
  console.error(`${label} error:`, err);
  return fail("Internal Server error", 500);
};

const badId = (id) => !mongoose.isValidObjectId(id);

/* ---------------- validation helpers ---------------- */

const str = (v, max, label, { required = false } = {}) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (required && !s) throw new HttpError(`${label} is required`);
  if (s.length > max) throw new HttpError(`${label} is too long (max ${max})`);
  return s;
};

// Only http/https allowed (javascript: etc. block)
const url = (v, label, { required = false } = {}) => {
  const s = str(v, 500, label, { required });
  if (!s) return "";
  let u;
  try {
    u = new URL(s);
  } catch {
    throw new HttpError(`${label} must be a valid URL`);
  }
  if (!["http:", "https:"].includes(u.protocol))
    throw new HttpError(`${label} must start with http:// or https://`);
  return s;
};

const month = (v, label) => {
  const s = str(v, 7, label);
  if (s && !MONTH_RE.test(s))
    throw new HttpError(`${label} must be in YYYY-MM format`);
  return s;
};

const checkRange = (start, end, label) => {
  if (start && end && start > end)
    throw new HttpError(`${label}: end date can't be before start date`);
};

// JSON array field -> rows (completely blank rows are dropped)
const parseList = (raw, label) => {
  if (raw === null || raw === undefined || raw === "") return [];
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    throw new HttpError(`${label} is invalid`);
  }
  if (!Array.isArray(arr)) throw new HttpError(`${label} is invalid`);
  const rows = arr.filter(
    (r) =>
      r &&
      typeof r === "object" &&
      Object.values(r).some((v) => String(v ?? "").trim()),
  );
  if (rows.length > MAX_ITEMS)
    throw new HttpError(`${label}: max ${MAX_ITEMS} items allowed`);
  return rows;
};

const parseIds = (raw) => {
  if (!raw) return [];
  let arr;
  try {
    arr = JSON.parse(raw);
  } catch {
    throw new HttpError("Work samples list is invalid");
  }
  if (!Array.isArray(arr) || arr.some((x) => typeof x !== "string" || badId(x)))
    throw new HttpError("Work samples list is invalid");
  const ids = [...new Set(arr)];
  if (ids.length > 50) throw new HttpError("Too many work samples (max 50)");
  return ids;
};

async function buildData(fd, { isEdit = false } = {}) {
  const firstName = str(fd.get("firstName"), 50, "First name", {
    required: true,
  });

  const lastName = str(fd.get("lastName"), 50, "Last name", {
    required: true,
  });

  const email = str(fd.get("email"), 150, "Email", {
    required: true,
  }).toLowerCase();

  const password = str(fd.get("password"), 100, "Password");

  if (!isEdit && !password) {
    throw new HttpError("Password is required");
  }

  const createdBy = str(fd.get("createdBy"), 50, "Created by");
  const role = str(fd.get("role"), 20, "Role");
  const status = str(fd.get("status"), 20, "Status");

  const gender = str(fd.get("gender"), 20, "Gender");
  const language = str(fd.get("language"), 50, "Language");
  const badge = str(fd.get("badge"), 50, "Badge");
  const location = str(fd.get("location"), 100, "Location");
  const about = str(fd.get("about"), 5000, "About");

  const categoryId = String(fd.get("category") ?? "");
  if (badId(categoryId)) throw new HttpError("Please select a category");
  if (!(await Category.exists({ _id: categoryId })))
    throw new HttpError("Selected category does not exist");

  // date of birth
  const dobRaw = str(fd.get("dateOfBirth"), 10, "Date of birth");
  let dateOfBirth = null;
  if (dobRaw) {
    const d = new Date(dobRaw);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(dobRaw) ||
      isNaN(d) ||
      d > new Date() ||
      d.getUTCFullYear() < 1900
    )
      throw new HttpError("Date of birth is invalid");
    dateOfBirth = d;
  }

  // skills (comma separated)
  const seen = new Set();
  const skills = String(fd.get("skills") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => {
      const k = s.toLowerCase();
      if (!s || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  if (skills.length > 30) throw new HttpError("Too many skills (max 30)");
  if (skills.some((s) => s.length > 40))
    throw new HttpError("A skill is too long (max 40)");

  const marketplaceBadges = parseList(
    fd.get("marketplaceBadges"),
    "Marketplace badges",
  ).map((r, i) => {
    const l = `Marketplace badge #${i + 1}`;
    return {
      platform: str(r.platform, 40, `${l} platform`, { required: true }),
      badge: str(r.badge, 60, `${l} badge`),
      url: url(r.url, `${l} URL`, { required: true }),
    };
  });

  const education = parseList(fd.get("education"), "Education").map((r, i) => {
    const l = `Education #${i + 1}`;
    const startDate = month(r.startDate, `${l} start date`);
    const endDate = month(r.endDate, `${l} end date`);
    checkRange(startDate, endDate, l);
    return {
      degree: str(r.degree, 120, `${l} degree`, { required: true }),
      institute: str(r.institute, 120, `${l} institute`, { required: true }),
      startDate,
      endDate,
      description: str(r.description, 1000, `${l} description`),
    };
  });

  const experience = parseList(fd.get("experience"), "Experience").map(
    (r, i) => {
      const l = `Experience #${i + 1}`;
      const startDate = month(r.startDate, `${l} start date`);
      const endDate = month(r.endDate, `${l} end date`);
      checkRange(startDate, endDate, l);
      return {
        role: str(r.role, 120, `${l} job role`, { required: true }),
        company: str(r.company, 120, `${l} company name`, { required: true }),
        startDate,
        endDate,
        description: str(r.description, 1000, `${l} description`),
      };
    },
  );

  const linkedProfiles = parseList(
    fd.get("linkedProfiles"),
    "Linked profiles",
  ).map((r, i) => {
    const l = `Linked profile #${i + 1}`;
    return {
      platform: str(r.platform, 40, `${l} platform`, { required: true }),
      badge: str(r.badge, 60, `${l} badge`),
      title: str(r.title, 80, `${l} title`),
      subtitle: str(r.subtitle, 160, `${l} subtitle`),
      link: url(r.link, `${l} link`, { required: true }),
    };
  });

  const workSampleIds = parseIds(fd.get("workSamples"));

  const avatarFile = fd.get("avatar");
  if (hasUpload(avatarFile)) {
    if (!AVATAR_TYPES.includes(avatarFile.type))
      throw new HttpError("Avatar must be a JPG, PNG, WEBP or GIF image");
    if (avatarFile.size > AVATAR_MAX)
      throw new HttpError("Avatar is too large (max 5MB)");
  }

  return {
    fields: {
      firstName,
      lastName,
      email,
      password,
      role,
      status,
      createdBy,
      gender,
      language,
      badge,
      category: categoryId,
      location,
      dateOfBirth,
      about,
      skills,
      marketplaceBadges,
      education,
      experience,
      linkedProfiles,
    },
    workSampleIds,
    avatarFile: hasUpload(avatarFile) ? avatarFile : null,
  };
}

/* ---------------- work sample relation helpers ---------------- */

// Every id must exist and be free (or already owned by this worker)
async function ensureAvailable(ids, workerId) {
  if (!ids.length) return;
  const found = await WorkSample.find({ _id: { $in: ids } })
    .select("seller")
    .lean();
  if (found.length !== ids.length)
    throw new HttpError("One or more work samples no longer exist");
  const taken = found.filter(
    (w) => w.seller && String(w.seller) !== String(workerId),
  );
  if (taken.length)
    throw new HttpError(
      "One or more work samples are already assigned to another seller",
      409,
    );
}

// Atomic-ish claim: only samples with seller:null get assigned. Race hole rollback kore.
async function claim(ids, workerId) {
  if (!ids.length) return;
  const res = await WorkSample.updateMany(
    { _id: { $in: ids }, seller: null },
    { seller: workerId },
  );
  if (res.modifiedCount !== ids.length) {
    await WorkSample.updateMany(
      { _id: { $in: ids }, seller: workerId },
      { seller: null },
    );
    throw new HttpError(
      "Some work samples were just assigned to another seller. Refresh and try again.",
      409,
    );
  }
}

const release = (ids, workerId) =>
  ids.length
    ? WorkSample.updateMany(
        { _id: { $in: ids }, seller: workerId },
        { seller: null },
      )
    : null;

async function getFull(id) {
  const worker = await Worker.findById(id)
    .populate("category", "name")
    .populate("user", "firstName lastName email role avatar")
    .lean();

  if (!worker) return null;

  const workSamples = await WorkSample.find({
    seller: worker._id,
  }).lean();

  return {
    ...worker,
    workSamples,
  };
}

/* ---------------- controllers ---------------- */

// GET /api/admin/workers
export async function getWorkers() {
  try {
    await dbConnect();

    const [workers, counts] = await Promise.all([
      Worker.find()
        .populate("category", "name")
        .populate("user", "firstName lastName email role avatar")
        .select(
          "user badge status category location gender language rating reviewsCount createdAt",
        )
        .sort({ createdAt: -1 })
        .lean(),

      WorkSample.aggregate([
        {
          $match: {
            seller: { $ne: null },
          },
        },
        {
          $group: {
            _id: "$seller",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return NextResponse.json(
      {
        workers: workers.map((w) => ({
          ...w,

          workSamplesCount: countMap.get(String(w._id)) || 0,
        })),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    return handleError(err, "Get workers");
  }
}

// GET /api/admin/workers/:id
export async function getWorker(req, { params }) {
  try {
    const { id } = await params;
    if (badId(id)) return fail("Invalid worker id");
    await dbConnect();
    const worker = await getFull(id);
    if (!worker) return fail("Worker not found", 404);
    return NextResponse.json(
      { worker },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleError(err, "Get worker");
  }
}

// POST /api/admin/workers  (multipart/form-data)
export async function createWorker(req) {
  let avatarPath = null;
  let session;

  try {
    await dbConnect();

    session = await mongoose.startSession();

    const { fields, workSampleIds, avatarFile } = await buildData(
      await req.formData(),
    );

    await ensureAvailable(workSampleIds, null);

    if (avatarFile) {
      avatarPath = await saveFile(avatarFile, "workers");
    }

    const {
      firstName,
      lastName,
      email,
      password,
      role,

      ...workerFields
    } = fields;

    let worker;

    await session.withTransaction(async () => {
      const existingUser = await User.findOne({ email }).session(session);

      if (existingUser) {
        throw new Error("A user with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [user] = await User.create(
        [
          {
            firstName,
            lastName,
            email,
            password: hashedPassword,
            avatar: avatarPath || "",
            role,
          },
        ],
        { session },
      );

      [worker] = await Worker.create(
        [
          {
            ...workerFields,
            user: user._id,
          },
        ],
        { session },
      );

      await claim(workSampleIds, worker._id);
    });

    return NextResponse.json(
      {
        message: "Worker created successfully",
        worker: await getFull(worker._id),
      },
      { status: 201 },
    );
  } catch (err) {
    await removeFile(avatarPath);

    return handleError(err, "Create worker");
  } finally {
    if (session) {
      await session.endSession();
    }
  }
}

// PUT /api/admin/workers/:id  (multipart/form-data)
export async function updateWorker(req, { params }) {
  let newAvatar = null;

  try {
    const { id } = await params;

    if (badId(id)) {
      return fail("Invalid worker id");
    }

    await dbConnect();

    const worker = await Worker.findById(id);

    if (!worker) {
      return fail("Worker not found", 404);
    }

    const { fields, workSampleIds, avatarFile } = await buildData(
      await req.formData(),
      { isEdit: true },
    );

    await ensureAvailable(workSampleIds, id);

    const currentIds = (
      await WorkSample.find({ seller: id }).select("_id").lean()
    ).map((w) => String(w._id));

    const toClaim = workSampleIds.filter((x) => !currentIds.includes(x));

    const toRelease = currentIds.filter((x) => !workSampleIds.includes(x));

    await claim(toClaim, id);

    try {
      // ---------------- USER ----------------

      const user = await User.findById(worker.user);

      if (!user) {
        throw new HttpError("User not found", 404);
      }

      // Existing avatar User collection theke
      const oldAvatar = user.avatar;

      // New avatar upload
      if (avatarFile) {
        newAvatar = await saveFile(avatarFile, "workers");
      }

      const { firstName, lastName, email, password, role, ...workerFields } =
        fields;

      user.firstName = firstName;
      user.lastName = lastName;
      user.role = role;

      // Email update
      if (user.email !== email) {
        const existingUser = await User.findOne({
          email,
          _id: { $ne: user._id },
        });

        if (existingUser) {
          throw new HttpError("A user with this email already exists", 409);
        }

        user.email = email;
      }

      // Password only when new password provided
      if (password) {
        user.password = await bcrypt.hash(password, 12);
      }

      // Avatar only when new file uploaded
      if (newAvatar) {
        user.avatar = newAvatar;
      }

      await user.save();

      // ---------------- WORKER ----------------

      worker.set({
        ...workerFields,
      });

      await worker.save();

      // New avatar successfully save hole old avatar delete
      if (newAvatar && oldAvatar) {
        await removeFile(oldAvatar);
      }

      // Work samples release
      await release(toRelease, id);

      return NextResponse.json({
        message: "Seller updated",
        worker: await getFull(id),
      });
    } catch (err) {
      // New uploaded file DB update fail korle delete
      if (newAvatar) {
        await removeFile(newAvatar);
      }

      // Newly claimed samples release
      await release(toClaim, id);

      throw err;
    }
  } catch (err) {
    return handleError(err, "Update worker");
  }
}

// DELETE /api/admin/workers/:id
export async function deleteWorker(req, { params }) {
  try {
    const { id } = await params;

    if (badId(id)) {
      return fail("Invalid worker id");
    }

    await dbConnect();

    const worker = await Worker.findById(id);

    if (!worker) {
      return fail("Worker not found", 404);
    }

    const user = await User.findById(worker.user);

    // Work samples available kore dao
    await WorkSample.updateMany({ seller: id }, { seller: null });

    // Reviews delete
    await Review.deleteMany({
      worker: id,
    });

    // User avatar delete
    if (user?.avatar) {
      await removeFile(user.avatar);
    }

    // User delete
    if (user) {
      await user.deleteOne();
    }

    // Worker delete
    await worker.deleteOne();

    return NextResponse.json({
      message: "Seller deleted",
    });
  } catch (err) {
    return handleError(err, "Delete worker");
  }
}

const ALLOWED_STATUS = ["pending", "approved", "reject"];

export async function updateWorkerStatus(req, { params }) {
  try {
    const { id } = await params;

    if (mongoose.isValidObjectId(id) === false) {
      return fail("Invalid worker id");
    }

    await dbConnect();

    const worker = await Worker.findById(id);

    if (!worker) {
      return fail("Worker not found", 404);
    }

    const body = await req.json();
    const status = body?.status;

    if (typeof status !== "string" || !ALLOWED_STATUS.includes(status)) {
      return fail(
        "Invalid status. Status must be pending, approved or reject.",
      );
    }

    worker.status = status;
    await worker.save();

    return NextResponse.json({
      message: "Worker status updated successfully",
      worker: {
        _id: worker._id,
        status: worker.status,
      },
    });
  } catch (err) {
    return handleError(err, "Update worker status");
  }
}

export async function getWorkerData(id) {
  await dbConnect();

  if (!mongoose.isValidObjectId(id)) {
    return null;
  }

  return await getFull(id);
}

export async function getMyWorkerProfile(
  req,
  ctx,
  session,
) {
  try {
    await dbConnect();

    const worker = await Worker.findOne({
      user: session.id,
    })
      .populate("category", "name")
      .lean();

    if (!worker) {
      return NextResponse.json(
        { message: "Worker profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { worker },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    console.error("Get my worker profile:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}


export async function updateMyWorkerProfile(
  req,
  ctx,
  session,
) {
  try {
    await dbConnect();

    const body = await req.json();

    const {
      gender,
      language,
      badge,
      category,
      location,
      dateOfBirth,
      about,
      skills,
      marketplaceBadges,
      education,
      experience,
      linkedProfiles,
    } = body;

    if (!category) {
      return NextResponse.json(
        { message: "Category is required" },
        { status: 400 },
      );
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { message: "Invalid category" },
        { status: 400 },
      );
    }

    const categoryExists = await Category.exists({
      _id: category,
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 400 },
      );
    }

    const worker = await Worker.findOne({
      user: session.id,
    });

    if (!worker) {
      return NextResponse.json(
        { message: "Worker profile not found" },
        { status: 404 },
      );
    }

    worker.gender = gender?.trim() || "";
    worker.language = language?.trim() || "";
    worker.badge = badge?.trim() || "";
    worker.category = category;
    worker.location = location?.trim() || "";
    worker.dateOfBirth = dateOfBirth || null;
    worker.about = about?.trim() || "";

    worker.skills = Array.isArray(skills)
      ? skills
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

    worker.marketplaceBadges = Array.isArray(
      marketplaceBadges,
    )
      ? marketplaceBadges
      : [];

    worker.education = Array.isArray(education)
      ? education
      : [];

    worker.experience = Array.isArray(experience)
      ? experience
      : [];

    worker.linkedProfiles = Array.isArray(linkedProfiles)
      ? linkedProfiles
      : [];

    await worker.save();

    const updatedWorker = await Worker.findById(worker._id)
      .populate("category", "name")
      .lean();

    return NextResponse.json({
      message: "Worker profile updated successfully",
      worker: updatedWorker,
    });
  } catch (err) {
    console.error("Update my worker profile:", err);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}