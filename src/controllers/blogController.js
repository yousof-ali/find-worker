import { NextResponse } from "next/server";
import mongoose from "mongoose";
import DOMPurify from "isomorphic-dompurify";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import BlogComment from "@/models/BlogComment";
import User from "@/models/User";
import { hasUpload, removeFile, saveFile } from "@/lib/upload";

const fail = (message, status = 400) => NextResponse.json({ message }, { status });
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

function createSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function getBlogFields(formData) {
  const content = String(formData.get("content") ?? "").trim();
  return {
    title: String(formData.get("title") ?? "").trim(),
    subtitle: String(formData.get("subtitle") ?? "").trim(),
    content: DOMPurify.sanitize(content, { USE_PROFILES: { html: true } }),
    category: String(formData.get("category") ?? "").trim(),
    authorName: String(formData.get("authorName") ?? "").trim(),
    authorRole: String(formData.get("authorRole") ?? "").trim(),
    commentsEnabled: formData.get("commentsEnabled") === "true",
  };
}

function validateFields(fields) {
  for (const field of ["title", "subtitle", "content", "category", "authorName", "authorRole"]) {
    if (!fields[field]) return `${field[0].toUpperCase()}${field.slice(1)} is required`;
  }
  const contentText = fields.content.replace(/<[^>]*>/g, "").replace(/&nbsp;/gi, " ").trim();
  if (!contentText && !/<img\b/i.test(fields.content)) return "Article content is required";
  return null;
}

function handleError(error, label) {
  if (error.name === "ValidationError" || error.name === "CastError") {
    return fail(error.message);
  }
  console.error(`${label} error:`, error);
  return fail("Internal server error", 500);
}

export async function listAdminBlogs() {
  try {
    await dbConnect();
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ blogs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleError(error, "List blogs");
  }
}

export async function createBlog(req) {
  let imagePath = null;
  let avatarPath = null;
  try {
    await dbConnect();
    const formData = await req.formData();
    const fields = getBlogFields(formData);
    const validationError = validateFields(fields);
    if (validationError) return fail(validationError);

    const image = formData.get("image");
    const authorAvatar = formData.get("authorAvatar");
    if (!hasUpload(image)) return fail("Blog image is required");
    if (!image.type.startsWith("image/")) return fail("Blog image must be an image file");
    if (image.size > MAX_IMAGE_SIZE) return fail("Blog image must be 10MB or smaller");
    if (hasUpload(authorAvatar)) {
      if (!authorAvatar.type.startsWith("image/")) return fail("Author avatar must be an image file");
      if (authorAvatar.size > MAX_IMAGE_SIZE) return fail("Author avatar must be 10MB or smaller");
    }

    imagePath = await saveFile(image, "blogs");
    if (hasUpload(authorAvatar)) avatarPath = await saveFile(authorAvatar, "blogs");

    const baseSlug = createSlug(fields.title) || "blog";
    let slug = baseSlug;
    let suffix = 2;
    while (await Blog.exists({ slug })) slug = `${baseSlug}-${suffix++}`;

    const blog = await Blog.create({
      ...fields,
      slug,
      image: imagePath,
      authorAvatar: avatarPath || "",
    });
    return NextResponse.json({ blog }, { status: 201 });
  } catch (error) {
    await Promise.all([removeFile(imagePath), removeFile(avatarPath)]);
    return handleError(error, "Create blog");
  }
}

export async function updateBlog(req, { params }) {
  let newImagePath = null;
  let newAvatarPath = null;
  let previousImage = null;
  let previousAvatar = null;
  try {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return fail("Invalid blog id", 400);
    const blog = await Blog.findById(id);
    if (!blog) return fail("Blog not found", 404);
    previousImage = blog.image;
    previousAvatar = blog.authorAvatar;

    const formData = await req.formData();
    const fields = getBlogFields(formData);
    const validationError = validateFields(fields);
    if (validationError) return fail(validationError);

    const image = formData.get("image");
    const authorAvatar = formData.get("authorAvatar");
    if (hasUpload(image)) {
      if (!image.type.startsWith("image/")) return fail("Blog image must be an image file");
      if (image.size > MAX_IMAGE_SIZE) return fail("Blog image must be 10MB or smaller");
      newImagePath = await saveFile(image, "blogs");
      fields.image = newImagePath;
    }
    if (hasUpload(authorAvatar)) {
      if (!authorAvatar.type.startsWith("image/")) return fail("Author avatar must be an image file");
      if (authorAvatar.size > MAX_IMAGE_SIZE) return fail("Author avatar must be 10MB or smaller");
      newAvatarPath = await saveFile(authorAvatar, "blogs");
      fields.authorAvatar = newAvatarPath;
    } else {
      fields.authorAvatar = blog.authorAvatar;
    }

    fields.slug = blog.slug;
    Object.assign(blog, fields);
    await blog.save();
    if (newImagePath) await removeFile(previousImage);
    if (newAvatarPath) await removeFile(previousAvatar);
    return NextResponse.json({ blog });
  } catch (error) {
    await Promise.all([removeFile(newImagePath), removeFile(newAvatarPath)]);
    return handleError(error, "Update blog");
  }
}

export async function deleteBlog(req, { params }) {
  try {
    await dbConnect();
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return fail("Invalid blog id", 400);
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) return fail("Blog not found", 404);
    await BlogComment.deleteMany({ blog: id });
    await Promise.all([removeFile(blog.image), removeFile(blog.authorAvatar)]);
    return NextResponse.json({ message: "Blog deleted" });
  } catch (error) {
    return handleError(error, "Delete blog");
  }
}

export async function getPublicBlogs() {
  try {
    await dbConnect();
    const blogs = await Blog.find().select("-content").sort({ createdAt: -1 }).lean();
    return NextResponse.json({ blogs }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return handleError(error, "Get public blogs");
  }
}

export async function getPublicBlog(req, { params }) {
  try {
    await dbConnect();
    const { slug } = await params;
    const blog = await Blog.findOne({ slug }).lean();
    if (!blog) return fail("Blog not found", 404);
    const comments = await BlogComment.find({ blog: blog._id })
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(
      { blog, comments },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return handleError(error, "Get public blog");
  }
}

export async function createBlogComment(req, { params }, authUser) {
  try {
    await dbConnect();
    const { slug } = await params;
    const blog = await Blog.findOne({ slug }).select("_id commentsEnabled");
    if (!blog) return fail("Blog not found", 404);
    if (!blog.commentsEnabled) return fail("Comments are disabled for this blog", 403);

    const body = await req.json();
    const content = String(body.content ?? "").trim();
    if (!content) return fail("Comment is required");
    if (content.length > 2000) return fail("Comment must be 2,000 characters or fewer");

    const user = await User.findById(authUser.id).select("firstName lastName avatar role").lean();
    if (!user) return fail("User not found", 401);
    const comment = await BlogComment.create({
      blog: blog._id,
      user: user._id,
      authorName: `${user.firstName} ${user.lastName}`.trim(),
      authorAvatar: user.avatar || "",
      authorRole: user.role,
      content,
    });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return handleError(error, "Create blog comment");
  }
}
