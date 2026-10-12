import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: String,
    company: String,
    country: String,
    talentDomain: String,
    role: { type: String, enum: ["admin", "user","worker"], default: "user" },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
