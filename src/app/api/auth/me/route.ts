import { withAuth } from "@/lib/withAuth";
import { me } from "@/controllers/authController";

export const GET = withAuth(me);