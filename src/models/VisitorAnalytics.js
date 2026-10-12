import mongoose from "mongoose";

const VisitorAnalyticsSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    firstSeenAt: { type: Date, required: true, default: Date.now },
    lastSeenAt: { type: Date, required: true, default: Date.now },
    pageViews: { type: Number, default: 0 },
    pages: [
      {
        path: { type: String, required: true },
        visitedAt: { type: Date, required: true, default: Date.now },
        referrer: { type: String, default: "" },
      },
    ],
    browser: { type: String, default: "Unknown" },
    operatingSystem: { type: String, default: "Unknown" },
    deviceType: { type: String, default: "Unknown" },
    ipAddress: { type: String, default: "" },
    language: { type: String, default: "" },
    languages: { type: [String], default: [] },
    timezone: { type: String, default: "" },
    screen: {
      width: { type: Number, default: null },
      height: { type: Number, default: null },
      colorDepth: { type: Number, default: null },
    },
    viewport: {
      width: { type: Number, default: null },
      height: { type: Number, default: null },
    },
    platform: { type: String, default: "" },
  },
  { timestamps: true },
);

VisitorAnalyticsSchema.index({ lastSeenAt: -1 });

export default mongoose.models.VisitorAnalytics ||
  mongoose.model("VisitorAnalytics", VisitorAnalyticsSchema);
