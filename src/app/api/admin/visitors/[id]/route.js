import { deleteVisitorAnalytics } from "@/controllers/visitorAnalyticsController";
import { withAuth } from "@/lib/withAuth";

export const DELETE = withAuth(deleteVisitorAnalytics, ["admin"]);
