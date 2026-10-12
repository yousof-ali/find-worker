import { withAuth } from "@/lib/withAuth";
import { deleteBlog, updateBlog } from "@/controllers/blogController";

export const PUT = withAuth(updateBlog, ["admin"]);
export const DELETE = withAuth(deleteBlog, ["admin"]);
