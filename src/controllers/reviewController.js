import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Worker from "@/models/Worker";

class HttpError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

const fail = (message, status = 400) =>
  NextResponse.json({ message }, { status });

const handleError = (err, label) => {
  if (err instanceof HttpError) {
    return fail(err.message, err.status);
  }

  if (err.code === 11000) {
    return fail(
      "You have already reviewed this worker",
      409,
    );
  }

  if (
    err.name === "ValidationError" ||
    err.name === "CastError"
  ) {
    return fail(err.message, 400);
  }

  console.error(`${label} error:`, err);

  return fail("Internal Server error", 500);
};

const badId = (id) => !mongoose.isValidObjectId(id);

const getRating = (value) => {
  const rating = Number(value);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new HttpError("Rating must be between 1 and 5");
  }

  return rating;
};

const getComment = (value) => {
  const comment =
    typeof value === "string" ? value.trim() : "";

  if (!comment) {
    throw new HttpError("Comment is required");
  }

  if (comment.length > 2000) {
    throw new HttpError(
      "Comment is too long (max 2000 characters)",
    );
  }

  return comment;
};

/* ---------------------------------------------
   GET /api/workers/:id/reviews
--------------------------------------------- */

export async function getWorkerReviews(req, { params }) {
  try {
    const { id } = await params;

    if (badId(id)) {
      return fail("Invalid worker id");
    }

    await dbConnect();

    const worker = await Worker.findById(id)
      .select("_id rating reviewsCount status")
      .lean();

    if (!worker || worker.status !== "approved") {
      return fail("Worker not found", 404);
    }

    const reviews = await Review.find({
      worker: id,
    })
      .populate("user", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .lean();

    const distribution = await Review.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(id),
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
    ]);

    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribution.forEach((item) => {
      ratingCounts[item._id] = item.count;
    });

    const totalReviews = reviews.length;

    const ratingBreakdown = [5, 4, 3, 2, 1].map(
      (star) => {
        const count = ratingCounts[star];

        return {
          star,
          count,
          percentage: totalReviews
            ? Math.round((count / totalReviews) * 100)
            : 0,
        };
      },
    );

    return NextResponse.json(
      {
        worker: {
          rating: worker.rating,
          reviewsCount: worker.reviewsCount,
        },

        reviews,

        ratingBreakdown,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    return handleError(err, "Get worker reviews");
  }
}

/* ---------------------------------------------
   POST /api/workers/:id/reviews
--------------------------------------------- */

export async function createWorkerReview(
  req,
  { params },
  user,
) {
  try {
    const { id } = await params;

    if (badId(id)) {
      return fail("Invalid worker id");
    }

    if (!user?.id) {
      return fail("Unauthorized", 401);
    }

    await dbConnect();

    const worker = await Worker.findById(id)
      .select("_id user status")
      .lean();

    if (!worker || worker.status !== "approved") {
      return fail("Worker not found", 404);
    }

    if (
      user.role === "worker" &&
      String(worker.user) === String(user.id)
    ) {
      return fail("You cannot review your own profile", 403);
    }

    let body;

    try {
      body = await req.json();
    } catch {
      throw new HttpError("Invalid request body");
    }

    const rating = getRating(body.rating);
    const comment = getComment(body.comment);

    const existingReview = await Review.findOne({
      worker: id,
      user: user.id,
    })
      .select("_id")
      .lean();

    if (existingReview) {
      return fail(
        "You have already reviewed this worker",
        409,
      );
    }

    const review = await Review.create({
      worker: id,
      user: user.id,
      rating,
      comment,
    });

    await updateWorkerRating(id);

    const populatedReview = await Review.findById(
      review._id,
    )
      .populate("user", "firstName lastName avatar")
      .lean();

    return NextResponse.json(
      {
        message: "Review posted successfully",
        review: populatedReview,
      },
      {
        status: 201,
      },
    );
  } catch (err) {
    return handleError(err, "Create worker review");
  }
}

/* ---------------------------------------------
   Update worker rating
--------------------------------------------- */

async function updateWorkerRating(workerId) {
  const result = await Review.aggregate([
    {
      $match: {
        worker: new mongoose.Types.ObjectId(workerId),
      },
    },
    {
      $group: {
        _id: "$worker",
        averageRating: {
          $avg: "$rating",
        },
        reviewsCount: {
          $sum: 1,
        },
      },
    },
  ]);

  if (!result.length) {
    await Worker.findByIdAndUpdate(workerId, {
      rating: 0,
      reviewsCount: 0,
    });

    return;
  }

  const averageRating = result[0].averageRating;

  await Worker.findByIdAndUpdate(workerId, {
    rating: Number(averageRating.toFixed(1)),
    reviewsCount: result[0].reviewsCount,
  });
}

/* ---------------------------------------------
   ADMIN: GET /api/admin/reviews?workerId=...
--------------------------------------------- */

export async function getAdminReviews(req) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const workerId = searchParams.get("workerId");

    // Left side worker list
    const workers = await Worker.find()
      .populate("category", "name")
      .populate("user", "firstName lastName avatar")
      .select("user category rating reviewsCount")
      .sort({ createdAt: -1 })
      .lean()
      .then((items) =>
        items.map((worker) => ({
          ...worker,
          name: [worker.user?.firstName, worker.user?.lastName]
            .filter(Boolean)
            .join(" "),
          avatar: worker.user?.avatar || "",
        })),
      );


    if (!workerId) {
      return NextResponse.json(
        {
          workers,
          selectedWorker: null,
          reviews: [],
          ratingBreakdown: [],
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (badId(workerId)) {
      return fail("Invalid worker id");
    }

    // Right side selected worker
    const selectedWorker = await Worker.findById(workerId)
      .populate("category", "name")
      .populate("user", "firstName lastName avatar")
      .select("user category rating reviewsCount")
      .lean();

    if (!selectedWorker) {
      return fail("Worker not found", 404);
    }
    selectedWorker.name = [
      selectedWorker.user?.firstName,
      selectedWorker.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    selectedWorker.avatar = selectedWorker.user?.avatar || "";

    // Selected worker reviews
    const reviews = await Review.find({
      worker: workerId,
    })
      .populate("user", "firstName lastName avatar")
      .sort({ createdAt: -1 })
      .lean();

    // Rating distribution
    const distribution = await Review.aggregate([
      {
        $match: {
          worker: new mongoose.Types.ObjectId(workerId),
        },
      },
      {
        $group: {
          _id: "$rating",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    const ratingCounts = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribution.forEach((item) => {
      ratingCounts[item._id] = item.count;
    });

    const totalReviews = reviews.length;

    const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
      const count = ratingCounts[star];

      return {
        star,
        count,
        percentage: totalReviews
          ? Math.round((count / totalReviews) * 100)
          : 0,
      };
    });

    return NextResponse.json(
      {
        workers,
        selectedWorker,
        reviews,
        ratingBreakdown,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    return handleError(err, "Get admin reviews");
  }
}


/* ---------------------------------------------
   ADMIN: DELETE /api/admin/reviews/:id
--------------------------------------------- */

export async function deleteReview(
  req,
  { params },
) {
  try {
    const { id } = await params;

    if (badId(id)) {
      return fail("Invalid review id");
    }

    await dbConnect();

    const review = await Review.findById(id);

    if (!review) {
      return fail("Review not found", 404);
    }

    // Worker id delete 
    const workerId = String(review.worker);

    await review.deleteOne();

    // Delete 
    await updateWorkerRating(workerId);

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (err) {
    return handleError(err, "Delete review");
  }
}