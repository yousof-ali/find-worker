import { createBlogComment } from "@/controllers/blogController";
import { withAuth } from "@/lib/withAuth";

export const POST = withAuth(createBlogComment, ["user", "worker"]);
