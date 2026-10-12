import { updateMyAccount } from "@/controllers/authController";
import { withAuth } from "@/lib/withAuth";

export const PUT = withAuth(updateMyAccount, ["user", "worker", "admin"]);
