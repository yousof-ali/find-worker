import { withAuth } from "@/lib/withAuth";
import { updateCategory, deleteCategory } from "@/controllers/categoryController";

export const PUT = withAuth(
  async (req, { params }) => updateCategory(req, (await params).id),
  ["admin"]
);

export const DELETE = withAuth(
  async (req, { params }) => deleteCategory((await params).id),
  ["admin"]
);