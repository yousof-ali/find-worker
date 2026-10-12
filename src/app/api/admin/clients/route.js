import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { withAuth } from "@/lib/withAuth";
import mongoose from "mongoose";
import Review from "@/models/Review";
import Worker from "@/models/Worker";
import BlogComment from "@/models/BlogComment";
import { removeFile } from "@/lib/upload";

async function getClients() {
  try {
    await dbConnect();
    const clients = await User.find({ role: "user" })
      .select("firstName lastName email avatar company country talentDomain createdAt")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      { clients },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Get admin clients error:", error);
    return NextResponse.json(
      { message: "Failed to load clients" },
      { status: 500 },
    );
  }
}

export const GET = withAuth(getClients, ["admin"]);

async function deleteClient(req, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ message: "Invalid client id" }, { status: 400 });
    }

    await dbConnect();
    const client = await User.findOneAndDelete({ _id: id, role: "user" });
    if (!client) {
      return NextResponse.json({ message: "Client not found" }, { status: 404 });
    }

    const affectedWorkers = await Review.distinct("worker", { user: id });
    await Promise.all([
      Review.deleteMany({ user: id }),
      BlogComment.deleteMany({ user: id }),
    ]);
    await Promise.all(affectedWorkers.map(async (workerId) => {
      const [summary] = await Review.aggregate([
        { $match: { worker: workerId } },
        { $group: { _id: null, rating: { $avg: "$rating" }, count: { $sum: 1 } } },
      ]);
      await Worker.updateOne(
        { _id: workerId },
        { $set: { rating: summary?.rating || 0, reviewsCount: summary?.count || 0 } },
      );
    }));
    await removeFile(client.avatar);

    return NextResponse.json({ message: "Client deleted" });
  } catch (error) {
    console.error("Delete admin client error:", error);
    return NextResponse.json({ message: "Failed to delete client" }, { status: 500 });
  }
}

export const DELETE = withAuth(deleteClient, ["admin"]);
