import { withAuth } from "@/lib/withAuth";
import {
  getWorkerReviews,
  createWorkerReview,
} from "@/controllers/reviewController";

export const GET = getWorkerReviews;

export const POST = withAuth(
  createWorkerReview,
  ["user", "worker"],
);