import { deleteWorkSample, getWorkSample, updateWorkSample } from "@/controllers/workSampleContoller";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(getWorkSample, ["admin"]);
export const PUT = withAuth(updateWorkSample, ["admin"]);
export const DELETE = withAuth(deleteWorkSample, ["admin"]);