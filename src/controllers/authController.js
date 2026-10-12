import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { signToken, setAuthCookie, getSession } from "@/lib/auth";
import Worker from "@/models/Worker";
import Category from "@/models/Category";
import { hasUpload, removeFile, saveFile } from "@/lib/upload";

export async function register(req) {
  try {
    await dbConnect();

    const {
      firstName,
      lastName,
      email,
      password,
      companyName,
      talentDomain,
      country,
      category,
      role,
    } = await req.json();

    // Basic validation
    if (
      !firstName?.trim() ||
      !lastName?.trim() ||
      !email?.trim() ||
      !password ||
      password.length < 8 ||
      !["user", "worker"].includes(role)
    ) {
      return NextResponse.json(
        {
          message:
            "First name, last name, email, password and valid role are required",
        },
        { status: 400 },
      );
    }

    if (role === "worker" && !category) {
  return NextResponse.json(
    { message: "Category is required for worker registration" },
    { status: 400 },
  );
}

if (role === "worker") {
  const categoryExists = await Category.findById(category);

  if (!categoryExists) {
    return NextResponse.json(
      { message: "Invalid category" },
      { status: 400 },
    );
  }
}

    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicate email
    if (await User.findOne({ email: normalizedEmail })) {
      return NextResponse.json(
        { message: "Email already exists" },
        { status: 409 },
      );
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      company: companyName?.trim() || "",
      talentDomain: talentDomain?.trim() || "",
      country: country?.trim() || "",
      password: await bcrypt.hash(password, 10),
      role,
    });

    if (role === "worker") {
  await Worker.create({
    user: user._id,
    category,
    status: "pending",
    createdBy: "worker",
  });
}

    const token = await signToken({
      id: user._id.toString(),
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    const res = NextResponse.json(
      {
        message: "Registered",

        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },

        redirectTo:
          user.role === "worker" ? "/worker/dashboard" : "/",
      },
      { status: 201 },
    );

    setAuthCookie(res, token);

    return res;
  } catch (err) {
    console.error("Register error:", err);

    return NextResponse.json(
      { message: "Internal Server error" },
      { status: 500 },
    );
  }
}
// login, logout, me: ager message er code ei file e pore add korbo

export async function login(req) {
  try {
    await dbConnect();
    const { email, password, rememberMe = true } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { message: "Email ar password Required" },
        { status: 400 },
      );

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return NextResponse.json(
        { message: "Invalid information" },
        { status: 401 },
      );

    const token = await signToken(
      {
        id: user._id.toString(),
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      rememberMe ? "30d" : "8h",
    );

    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      redirectTo:
        user.role === "admin"
          ? "/admin/dashboard"
          : user.role === "worker"
            ? "/worker/dashboard"
            : "/",
    });
    setAuthCookie(res, token, rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8);
    return res;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json(
      { message: "Internal Server error" },
      { status: 500 },
    );
  }
}

export async function updateMyAccount(req, ctx, session) {
    let newAvatar = null;
    try {
      await dbConnect();

      const user = await User.findById(session.id);
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }

      const formData = await req.formData();
      const firstName = String(formData.get("firstName") ?? "").trim();
      const lastName = String(formData.get("lastName") ?? "").trim();
      const requestedEmail = String(formData.get("email") ?? "").trim().toLowerCase();
      const password = String(formData.get("password") ?? "");
      const avatar = formData.get("avatar");

      if (!firstName || firstName.length > 50) {
        return NextResponse.json(
          { message: "First name is required and must be at most 50 characters" },
          { status: 400 },
        );
      }
      if (!lastName || lastName.length > 50) {
        return NextResponse.json(
          { message: "Last name is required and must be at most 50 characters" },
          { status: 400 },
        );
      }
      if (user.role === "admin") {
        if (!requestedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(requestedEmail)) {
          return NextResponse.json(
            { message: "Enter a valid email address" },
            { status: 400 },
          );
        }
      }
      if (password && password.length < 8) {
        return NextResponse.json(
          { message: "Password must be at least 8 characters" },
          { status: 400 },
        );
      }

      if (hasUpload(avatar)) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(avatar.type)) {
          return NextResponse.json(
            { message: "Avatar must be a JPG, PNG, WEBP or GIF image" },
            { status: 400 },
          );
        }
        if (avatar.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { message: "Avatar is too large (max 5MB)" },
            { status: 400 },
          );
        }
        newAvatar = await saveFile(avatar, "workers");
      }

      const oldAvatar = user.avatar;
      user.firstName = firstName;
      user.lastName = lastName;
      if (user.role === "admin") user.email = requestedEmail;
      if (password) user.password = await bcrypt.hash(password, 10);
      if (newAvatar) user.avatar = newAvatar;
      await user.save();

      if (newAvatar && oldAvatar) await removeFile(oldAvatar);

      return NextResponse.json({
        message: "Profile updated successfully",
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar || "",
        },
      });
    } catch (err) {
      if (err?.code === 11000 && (err?.keyPattern?.email || err?.keyValue?.email)) {
        if (newAvatar) await removeFile(newAvatar);
        return NextResponse.json(
          { message: "An account with this email already exists" },
          { status: 409 },
        );
      }
      if (newAvatar) await removeFile(newAvatar);
      console.error("Update account error:", err);
      return NextResponse.json(
        { message: "Failed to update profile" },
        { status: 500 },
      );
  }
}

export async function logout() {
  const res = NextResponse.json({ message: "Logged out" });
  res.cookies.set("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}

export async function me() {
  try {
    const session = await getSession();

    const headers = {
      "Cache-Control": "no-store",
    };

    if (!session) {
      return NextResponse.json({ user: null }, { headers });
    }

    await dbConnect();

    const user = await User.findById(session.id).select(
      "firstName lastName email role company country talentDomain avatar createdAt",
    );

    if (!user) {
      return NextResponse.json({ user: null }, { headers });
    }

    let worker = null;

    if (user.role === "worker") {
      worker = await Worker.findOne({ user: user._id })
        .select(
          "gender status createdBy language badge category rating reviewsCount location dateOfBirth marketplaceBadges about education experience skills linkedProfiles createdAt",
        )
        .populate("category", "name")
        .lean();
    }

    return NextResponse.json(
      {
        user: {
          id: user._id.toString(),
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.avatar || "",
          company: user.company || null,
          country: user.country || null,
          talentDomain: user.talentDomain || null,
          createdAt: user.createdAt,

          ...(user.role === "worker"
            ? {
                worker,
              }
            : {}),
        },
      },
      { headers },
    );
  } catch (err) {
    console.error("Me error:", err);

    return NextResponse.json(
      { user: null },
      { status: 500 },
    );
  }
}
