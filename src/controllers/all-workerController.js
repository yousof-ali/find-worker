import { NextResponse } from "next/server";
import mongoose from "mongoose";
import WorkSample from "@/models/WorkSample";
import dbConnect from "@/lib/db";
import Worker from "@/models/Worker";

export async function getPublicWorkers(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    let workersQuery = Worker.find({ status: "approved" })
      .populate("category", "name")
      .populate("user", "firstName lastName avatar")
      .select("-__v");

    if (query === "top-rated") {
      workersQuery = workersQuery.sort({
        rating: -1,
        reviewsCount: -1,
      });
    }

    if (query === "top-level") {
      workersQuery = workersQuery
        .find({
          badge: {
            $in: [
              "Level 1 Seller",
              "Level 2 Seller",
              "Level 3 Seller",
              "Pro Seller",
            ],
          },
        })
        .sort({
          badge: -1,
        });
    }

    const workers = (await workersQuery.lean()).map((worker) => ({
      ...worker,
      firstName: worker.user?.firstName || "",
      lastName: worker.user?.lastName || "",
      avatar: worker.user?.avatar || "",
      name: [worker.user?.firstName, worker.user?.lastName]
        .filter(Boolean)
        .join(" "),
    }));

    return NextResponse.json({
      success: true,
      workers,
    });
  } catch (err) {
    console.error("Get public workers error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get workers",
      },
      { status: 500 }
    );
  }
}

export async function getPublicWorker(req, { params }) {
  try {
    const { id } = await params;

    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid worker id",
        },
        { status: 400 }
      );
    }

    await dbConnect();

    const worker = await Worker.findById(id)
      .populate("category", "name")
      .populate("user", "firstName lastName avatar")
      .lean();

    if (!worker || worker.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          message: "Worker not found",
        },
        { status: 404 }
      );
    }

    const workSamples = await WorkSample.find({
      seller: id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      worker: {
        ...worker,
        firstName: worker.user?.firstName || "",
        lastName: worker.user?.lastName || "",
        avatar: worker.user?.avatar || "",
        name: [worker.user?.firstName, worker.user?.lastName]
          .filter(Boolean)
          .join(" "),
        workSamples,
      },
    });
  } catch (err) {
    console.error("Get public worker error:", err);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get worker",
      },
      { status: 500 }
    );
  }
}