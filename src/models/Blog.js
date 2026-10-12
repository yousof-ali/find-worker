import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, index: true },
    content: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    authorName: { type: String, required: true, trim: true },
    authorRole: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: "" },
    image: { type: String, required: true },
    commentsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
