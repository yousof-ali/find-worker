import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import WorkSample from "@/models/WorkSample";
import Worker from "@/models/Worker"; // populate("seller") er jonno model register
import { hasUpload, saveFile, removeFile } from "@/lib/upload";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

/* ---------------- helpers ---------------- */

const fail = (message, status = 400) =>
  NextResponse.json({ message }, { status });

// Mongoose validation/cast error = client er vul (400), baki sob 500
const handleError = (err, label) => {
  if (err.name === "ValidationError" || err.name === "CastError")
    return fail(err.message, 400);
  console.error(`${label} error:`, err);
  return fail("Internal Server error", 500);
};

const parseTools = (v) =>
  String(v ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

const isValidType = (t) => t === "design" || t === "video";

// design -> image/*, video -> video/*
const fileMatchesType = (file, type) =>
  type === "design"
    ? file.type.startsWith("image/")
    : file.type.startsWith("video/");

const typeError = (type) =>
  type === "video"
    ? "Please upload a video file"
    : "Please upload an image file";

/* ---------------- controllers ---------------- */

// POST /api/work-samples  (multipart/form-data)
export async function createWorkSample(req) {
  let savedPath = null;
  try {
    await dbConnect();

    const fd = await req.formData();
    const title = String(fd.get("title") ?? "").trim();
    const subTitle = String(fd.get("subTitle") ?? "").trim();
    const clientName = String(fd.get("clientName") ?? "").trim();
    const deliveryDate = String(fd.get("deliveryDate") ?? "").trim();

    const projectType = String(fd.get("projectType") ?? "");
    const file = fd.get("preview");

    if (!title) return fail("Title is required");
    if (!isValidType(projectType)) return fail("Invalid project type");
    if (!hasUpload(file)) return fail("Preview file is required");
    if (file.size > MAX_FILE_SIZE) return fail("File too large (max 100MB)");
    if (!fileMatchesType(file, projectType))
      return fail(typeError(projectType));

    savedPath = await saveFile(file, "work-samples");
    const workSample = await WorkSample.create({
      title,
      subTitle,
      tools: parseTools(fd.get("tools")),
      projectType,
      clientName,
      deliveryDate: new Date(deliveryDate),
      preview: savedPath,
    });

    return NextResponse.json(
      { message: "Work sample created", workSample },
      { status: 201 },
    );
  } catch (err) {
    await removeFile(savedPath);
    return handleError(err, "Create work sample");
  }
}

export async function getWorkSamples() {
  try {
    await dbConnect();

    const workSamples = await WorkSample.find()
      .populate("seller", "name avatar")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      { workSamples },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    console.error("Get work samples error:", err);

    return NextResponse.json(
      {
        message: err?.message || "Internal Server error",
      },
      { status: 500 },
    );
  }
}

// export async function getWorkSamples() {
//   try {
//     await dbConnect();

//     const workSamples = await WorkSample.find()
//       .sort({ createdAt: -1 });

//     return NextResponse.json(
//       { workSamples },
//       {
//         headers: {
//           "Cache-Control": "no-store",
//         },
//       }
//     );
//   } catch (err) {
//     console.error("Get work samples error:", err);

//     return NextResponse.json(
//       {
//         message: err?.message || "Internal Server error",
//       },
//       { status: 500 }
//     );
//   }
// }

// GET /api/work-samples/available?sellerId=xxx
// Shudhu unassigned (+ sellerId er nijer gulo, seller edit form er jonno)
export async function getAvailableWorkSamples(req) {
  try {
    await dbConnect();

    const sellerId = new URL(req.url).searchParams.get("sellerId");
    const filter = sellerId
      ? { $or: [{ seller: null }, { seller: sellerId }] }
      : { seller: null };

    const workSamples = await WorkSample.find(filter).sort({ createdAt: -1 });
    return NextResponse.json(
      { workSamples },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleError(err, "Get available work samples");
  }
}

// GET /api/work-samples/:id
export async function getWorkSample(req, { params }) {
  try {
    const { id } = await params; // Next 15 e Promise, Next 14 e plain object, duto tei kaj kore
    await dbConnect();

    let q = WorkSample.findById(id);
    q = q.populate("seller", "name avatar");
    const workSample = await q;
    if (!workSample) return fail("Work sample not found", 404);

    return NextResponse.json({ workSample });
  } catch (err) {
    return handleError(err, "Get work sample");
  }
}

// PUT /api/work-samples/:id  (multipart/form-data, preview optional)
export async function updateWorkSample(req, { params }) {
  let newPath = null;
  try {
    const { id } = await params;
    await dbConnect();

    const workSample = await WorkSample.findById(id);
    if (!workSample) return fail("Work sample not found", 404);

    const fd = await req.formData();
    const title = fd.get("title");
    const subTitle = fd.get("subTitle");
    const clientName = fd.get("clientName");
    const deliveryDate = fd.get("deliveryDate");

    const tools = fd.get("tools");
    const projectType = String(fd.get("projectType") ?? workSample.projectType);
    const file = fd.get("preview");
    const fileProvided = hasUpload(file);

    if (!isValidType(projectType)) return fail("Invalid project type");
    if (title !== null && !String(title).trim())
      return fail("Title is required");
    if (projectType !== workSample.projectType && !fileProvided)
      return fail("Upload a new preview when changing project type");

    if (fileProvided) {
      if (file.size > MAX_FILE_SIZE) return fail("File too large (max 100MB)");
      if (!fileMatchesType(file, projectType))
        return fail(typeError(projectType));
      newPath = await saveFile(file, "work-samples");
    }

    const oldPreview = workSample.preview;
    if (title !== null) workSample.title = String(title).trim();
    if (subTitle !== null) workSample.subTitle = String(subTitle).trim();
    if (tools !== null) workSample.tools = parseTools(tools);
    workSample.projectType = projectType;
    if (newPath) workSample.preview = newPath;
    if (clientName !== null) {
      workSample.clientName = String(clientName).trim();
    }

    if (deliveryDate !== null) {
      workSample.deliveryDate = new Date(String(deliveryDate));
    }

    await workSample.save();
    if (newPath) await removeFile(oldPreview); // save success hole purono file muche felo

    return NextResponse.json({ message: "Work sample updated", workSample });
  } catch (err) {
    await removeFile(newPath);
    return handleError(err, "Update work sample");
  }
}

// DELETE /api/work-samples/:id
export async function deleteWorkSample(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();

    const workSample = await WorkSample.findById(id);
    if (!workSample) return fail("Work sample not found", 404);
    if (workSample.seller)
      return fail(
        "This work sample is assigned to a seller. Remove it from the seller profile first.",
      );

    await workSample.deleteOne();
    await removeFile(workSample.preview);

    return NextResponse.json({ message: "Work sample deleted" });
  } catch (err) {
    return handleError(err, "Delete work sample");
  }
}

export async function getMyWorkSamples(req, ctx, user) {
  try {
    await dbConnect();

    const worker = await Worker.findOne({ user: user.id }).select("_id").lean();
    if (!worker) return fail("Worker profile not found", 404);

    const workSamples = await WorkSample.find({
      $or: [{ createdByUser: user.id }, { seller: worker._id }],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        workSamples: workSamples.map((sample) => ({
          ...sample,
          canSelect: String(sample.createdByUser) === String(user.id),
          selected: String(sample.seller) === String(worker._id),
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (err) {
    return handleError(err, "Get worker work samples");
  }
}

export async function createMyWorkSample(req, ctx, user) {
  let savedPath = null;
  try {
    await dbConnect();

    const workerExists = await Worker.exists({ user: user.id });
    if (!workerExists) return fail("Worker profile not found", 404);

    const fd = await req.formData();
    const title = String(fd.get("title") ?? "").trim();
    const subTitle = String(fd.get("subTitle") ?? "").trim();
    const clientName = String(fd.get("clientName") ?? "").trim();
    const deliveryDate = String(fd.get("deliveryDate") ?? "").trim();
    const projectType = String(fd.get("projectType") ?? "");
    const file = fd.get("preview");
    const parsedDeliveryDate = new Date(deliveryDate);

    if (!title) return fail("Title is required");
    if (!clientName) return fail("Client name is required");
    if (!deliveryDate || Number.isNaN(parsedDeliveryDate.getTime()))
      return fail("A valid delivery date is required");
    if (!isValidType(projectType)) return fail("Invalid project type");
    if (!hasUpload(file)) return fail("Preview file is required");
    if (file.size > MAX_FILE_SIZE) return fail("File too large (max 100MB)");
    if (!fileMatchesType(file, projectType))
      return fail(typeError(projectType));

    savedPath = await saveFile(file, "work-samples");
    const workSample = await WorkSample.create({
      title,
      subTitle,
      tools: parseTools(fd.get("tools")),
      projectType,
      clientName,
      deliveryDate: parsedDeliveryDate,
      preview: savedPath,
      createdByUser: user.id,
    });

    return NextResponse.json(
      { message: "Work sample created", workSample },
      { status: 201 },
    );
  } catch (err) {
    await removeFile(savedPath);
    return handleError(err, "Create worker work sample");
  }
}

export async function updateMyWorkSampleSelection(req, ctx, user) {
  try {
    await dbConnect();

    const worker = await Worker.findOne({ user: user.id }).select("_id").lean();
    if (!worker) return fail("Worker profile not found", 404);

    let body;
    try {
      body = await req.json();
    } catch {
      return fail("Invalid request body");
    }

    const sampleIds = body?.sampleIds;
    if (
      !Array.isArray(sampleIds) ||
      sampleIds.some(
        (id) => typeof id !== "string" || !mongoose.isValidObjectId(id),
      )
    ) {
      return fail("Work samples list is invalid");
    }

    const ids = [...new Set(sampleIds)];
    const ownedSamples = await WorkSample.find({
      _id: { $in: ids },
      createdByUser: user.id,
    })
      .select("_id seller")
      .lean();

    if (ownedSamples.length !== ids.length)
      return fail("You can only select work samples you created", 403);
    if (
      ownedSamples.some(
        (sample) =>
          sample.seller && String(sample.seller) !== String(worker._id),
      )
    ) {
      return fail("A selected work sample belongs to another worker", 409);
    }

    if (ids.length) {
      const claimResult = await WorkSample.updateMany(
        {
          _id: { $in: ids },
          createdByUser: user.id,
          $or: [{ seller: null }, { seller: worker._id }],
        },
        { seller: worker._id },
      );
      if (claimResult.matchedCount !== ids.length)
        return fail("Work samples changed. Refresh and try again.", 409);
    }

    await WorkSample.updateMany(
      {
        createdByUser: user.id,
        seller: worker._id,
        _id: { $nin: ids },
      },
      { seller: null },
    );

    return NextResponse.json({ message: "Work samples updated" });
  } catch (err) {
    return handleError(err, "Update worker work samples");
  }
}
