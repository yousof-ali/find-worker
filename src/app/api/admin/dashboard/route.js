import { getAdminDashboardStats } from "@/controllers/adminDashboardController";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(getAdminDashboardStats, ["admin"]);
