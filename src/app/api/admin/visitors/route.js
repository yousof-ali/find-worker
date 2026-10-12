import { getVisitorAnalytics } from "@/controllers/visitorAnalyticsController";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(getVisitorAnalytics, ["admin"]);
