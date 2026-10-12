import { getCategoryById } from "@/controllers/categoryController";
export const GET = async (req, { params }) => getCategoryById((await params).id);