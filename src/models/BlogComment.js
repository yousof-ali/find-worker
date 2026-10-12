import mongoose from "mongoose";

const BlogCommentSchema = new mongoose.Schema(
  {
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    authorName: { type: String, required: true, trim: true },
    authorAvatar: { type: String, default: "" },
    authorRole: { type: String, required: true },
    content: { type: String, required: true, trim: true, maxlength: 2000 },
  },
  { timestamps: true },
);

export default mongoose.models.BlogComment ||
  mongoose.model("BlogComment", BlogCommentSchema);
