import { withAuth } from "@/lib/withAuth";
import { createCategory } from "@/controllers/categoryController";
export const POST = withAuth(createCategory, ["admin"]);