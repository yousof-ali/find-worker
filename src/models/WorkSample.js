import mongoose from "mongoose";

const WorkSampleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subTitle: { type: String, trim: true, default: "" },
    tools: { type: [String], default: [] },
    // Client information
    clientName: {
      type: String,
      required: true,
      trim: true,
    },

    deliveryDate: {
      type: Date,
      required: true,
    },
    // design = Design & UI (image preview), video = video preview
    projectType: { type: String, enum: ["design", "video"], required: true },
    preview: { type: String, required: true }, // e.g. /uploads/work-samples/xxx.png
    // Ekta work sample max ekjon seller er. null = ekhono kono seller e add hoy ni
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Worker",
      default: null,
      index: true,
    },
    createdByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.WorkSample ||
  mongoose.model("WorkSample", WorkSampleSchema);
