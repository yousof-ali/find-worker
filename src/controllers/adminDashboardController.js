import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import Category from "@/models/Category";
import User from "@/models/User";
import WorkSample from "@/models/WorkSample";
import Worker from "@/models/Worker";

export async function getAdminDashboardStats() {
  try {
    await dbConnect();

    const [totalUsers, totalFreelancers, approvedFreelancers, pendingFreelancers, totalWorkSamples, totalCategories, totalBlogs, roleCounts, topFreelancers, monthlySignups] =
      await Promise.all([
        User.countDocuments({ role: "user" }),
        Worker.countDocuments(),
        Worker.countDocuments({ status: "approved" }),
        Worker.countDocuments({ status: "pending" }),
        WorkSample.countDocuments(),
        Category.countDocuments(),
        Blog.countDocuments(),
        User.aggregate([{ $group: { _id: "$role", count: { $sum: 1 } } }]),
        Worker.find({ status: "approved" })
          .sort({ rating: -1, reviewsCount: -1, createdAt: -1 })
          .limit(5)
          .populate("user", "firstName lastName avatar")
          .lean(),
        getMonthlySignups(),
      ]);

    const usersByRole = { admin: 0, user: 0, worker: 0 };
    roleCounts.forEach(({ _id, count }) => {
      if (_id in usersByRole) usersByRole[_id] = count;
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalFreelancers,
        approvedFreelancers,
        pendingFreelancers,
        totalWorkSamples,
        totalCategories,
        totalBlogs,
      },
      usersByRole,
      monthlySignups,
      topFreelancers: topFreelancers.map((worker) => ({
        _id: String(worker._id),
        name: [worker.user?.firstName, worker.user?.lastName].filter(Boolean).join(" ") || "Unnamed Freelancer",
        avatar: worker.user?.avatar || "",
        rating: worker.rating || 0,
        reviewsCount: worker.reviewsCount || 0,
        badge: worker.badge || "",
      })),
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Get admin dashboard stats error:", error);
    return NextResponse.json({ message: "Failed to load dashboard statistics" }, { status: 500 });
  }
}

async function getMonthlySignups() {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      start: date,
      end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
      label: date.toLocaleString("en-US", { month: "short" }),
    };
  });

  return Promise.all(months.map(async ({ start, end, label }) => ({
    month: label,
    count: await User.countDocuments({
      role: "user",
      createdAt: { $gte: start, $lt: end },
    }),
  })));
}
