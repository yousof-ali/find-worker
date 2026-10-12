import { withAuth } from "@/lib/withAuth";
import { getAdminReviews } from "@/controllers/reviewController";

export const GET = withAuth(getAdminReviews, ["admin"]);