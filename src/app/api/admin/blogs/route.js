import { withAuth } from "@/lib/withAuth";
import { createBlog, listAdminBlogs } from "@/controllers/blogController";

export const GET = withAuth(listAdminBlogs, ["admin"]);
export const POST = withAuth(createBlog, ["admin"]);
