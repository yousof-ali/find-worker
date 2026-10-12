import { withAuth } from "@/lib/withAuth";
import { deleteReview } from "@/controllers/reviewController";

export const DELETE = withAuth(deleteReview, ["admin"]);