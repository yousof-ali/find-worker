import mongoose from "mongoose";

const str = (extra = {}) => ({
  type: String,
  trim: true,
  default: "",
  ...extra,
});

const MarketplaceBadgeSchema = new mongoose.Schema(
  {
    platform: str({ required: true }),
    badge: str(),
    url: str({ required: true }),
  },
  { _id: false },
);

const EducationSchema = new mongoose.Schema(
  {
    degree: str({ required: true }),
    institute: str({ required: true }),
    startDate: str(), // "YYYY-MM"
    endDate: str(), // "YYYY-MM", empty = ongoing
    description: str(),
  },
  { _id: false },
);

const ExperienceSchema = new mongoose.Schema(
  {
    role: str({ required: true }),
    company: str({ required: true }),
    startDate: str(),
    endDate: str(),
    description: str(),
  },
  { _id: false },
);

const LinkedProfileSchema = new mongoose.Schema(
  {
    platform: str({ required: true }), // Upwork
    badge: str(), // Top Rated Plus
    title: str(), // 100% Job Success
    subtitle: str(), // $100k+ Earned • 84 Projects Completed
    link: str({ required: true }),
  },
  { _id: false },
);

const WorkerSchema = new mongoose.Schema(
  {
    // name: str({ required: true }),
    // avatar: str(),
    gender: str(),
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "suspended"],
      default: "pending",
      index: true,
    },
    createdBy: {
      type: String,
      enum: ["worker", "admin"],
      required: true,
    },
    language: str(),
    badge: str(), // Pro Seller, Top Rated ...
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },

    // Review collection toiri hole ei duto auto update hobe (read-only, admin form e edit hoy na)
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewsCount: { type: Number, default: 0, min: 0 },

    location: str(),
    dateOfBirth: { type: Date, default: null },
    marketplaceBadges: { type: [MarketplaceBadgeSchema], default: [] },
    about: str(),
    education: { type: [EducationSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    skills: { type: [String], default: [] },
    linkedProfiles: { type: [LinkedProfileSchema], default: [] },
    // Work samples: WorkSample.seller diye relation, ekhane store hoy na
    // Project statistics: Project collection toiri hole oikhan theke calculate hobe
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.models.Worker || mongoose.model("Worker", WorkerSchema);
