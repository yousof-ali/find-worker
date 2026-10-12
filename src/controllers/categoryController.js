import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DOMPurify from "isomorphic-dompurify";
import dbConnect from "@/lib/db";
import Category from "@/models/Category";
import Worker from "@/models/Worker";

const MAX_SVG_LENGTH = 20000;

const badId = (id) => !mongoose.isValidObjectId(id);

// Returns sanitized SVG string, or null if the input is not a valid SVG
const cleanSvg = (input) => {
  if (typeof input !== "string" || input.length > MAX_SVG_LENGTH) return null;

  const stripped = input
    .replace(/<\?xml[\s\S]*?\?>/gi, "")
    .replace(/<!DOCTYPE[\s\S]*?>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .trim();

  if (!/^<svg[\s>]/i.test(stripped)) return null;

  const clean = DOMPurify.sanitize(stripped, {
    USE_PROFILES: { svg: true, svgFilters: true },
  }).trim();

  return /^<svg[\s>]/i.test(clean) ? clean : null;
};

const format = (c, count) => ({
  _id: String(c._id),
  name: c.name,
  icon: c.icon,
  count,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt,
});

/* ---------- READ (all) ---------- */
// Public: GET /api/categories
export async function getCategories() {
  try {
    await dbConnect();

    const [categories, counts] = await Promise.all([
      Category.find().sort({ createdAt: 1 }).lean(),
      Worker.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    ]);

    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    return NextResponse.json(
      categories.map((c) => format(c, countMap.get(String(c._id)) || 0))
    );
  } catch (err) {
    console.error("Get categories error:", err);
    return NextResponse.json({ message: "Internal Server error" }, { status: 500 });
  }
}

/* ---------- READ (one) ---------- */
// Public: GET /api/categories/[id]
export async function getCategoryById(id) {
  try {
    if (badId(id)) return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
    await dbConnect();

    const category = await Category.findById(id).lean();
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    const count = await Worker.countDocuments({ category: id });
    return NextResponse.json(format(category, count));
  } catch (err) {
    console.error("Get category error:", err);
    return NextResponse.json({ message: "Internal Server error" }, { status: 500 });
  }
}

/* ---------- CREATE ---------- */
// Admin: POST /api/admin/categories
export async function createCategory(req) {
  try {
    await dbConnect();
    const { name, icon } = await req.json();

    const cleanName = typeof name === "string" ? name.trim() : "";
    if (!cleanName)
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    if (cleanName.length > 60)
      return NextResponse.json({ message: "Category name is too long (max 60)" }, { status: 400 });

    const cleanIcon = cleanSvg(icon);
    if (!cleanIcon)
      return NextResponse.json({ message: "A valid SVG icon is required (max 20KB)" }, { status: 400 });

    const category = await Category.create({ name: cleanName, icon: cleanIcon });

    return NextResponse.json(format(category, 0), { status: 201 });
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ message: "Category already exists" }, { status: 409 });
    console.error("Create category error:", err);
    return NextResponse.json({ message: "Internal Server error" }, { status: 500 });
  }
}

/* ---------- UPDATE ---------- */
// Admin: PUT /api/admin/categories/[id]
export async function updateCategory(req, id) {
  try {
    if (badId(id)) return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
    await dbConnect();

    const body = await req.json();
    const update = {};

    if (body.name !== undefined) {
      const cleanName = typeof body.name === "string" ? body.name.trim() : "";
      if (!cleanName)
        return NextResponse.json({ message: "Category name is required" }, { status: 400 });
      if (cleanName.length > 60)
        return NextResponse.json({ message: "Category name is too long (max 60)" }, { status: 400 });
      update.name = cleanName;
    }

    if (body.icon !== undefined) {
      const cleanIcon = cleanSvg(body.icon);
      if (!cleanIcon)
        return NextResponse.json({ message: "A valid SVG icon is required (max 20KB)" }, { status: 400 });
      update.icon = cleanIcon;
    }

    if (Object.keys(update).length === 0)
      return NextResponse.json({ message: "Nothing to update" }, { status: 400 });

    const category = await Category.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    }).lean();
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    const count = await Worker.countDocuments({ category: id });
    return NextResponse.json(format(category, count));
  } catch (err) {
    if (err.code === 11000)
      return NextResponse.json({ message: "Category already exists" }, { status: 409 });
    console.error("Update category error:", err);
    return NextResponse.json({ message: "Internal Server error" }, { status: 500 });
  }
}

/* ---------- DELETE ---------- */
// Admin: DELETE /api/admin/categories/[id]
export async function deleteCategory(id) {
  try {
    if (badId(id)) return NextResponse.json({ message: "Invalid category id" }, { status: 400 });
    await dbConnect();

    const count = await Worker.countDocuments({ category: id });
    if (count > 0)
      return NextResponse.json(
        {
          message: `This category is used by ${count} ${count === 1 ? "worker" : "workers"}. Move or delete them first.`,
        },
        { status: 400 }
      );

    const category = await Category.findByIdAndDelete(id);
    if (!category) return NextResponse.json({ message: "Category not found" }, { status: 404 });

    return NextResponse.json({ message: "Category deleted" });
  } catch (err) {
    console.error("Delete category error:", err);
    return NextResponse.json({ message: "Internal Server error" }, { status: 500 });
  }
}