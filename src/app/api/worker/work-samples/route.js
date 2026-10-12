import { withAuth } from "@/lib/withAuth";
import {
  createMyWorkSample,
  getMyWorkSamples,
  updateMyWorkSampleSelection,
} from "@/controllers/workSampleContoller";

export const GET = withAuth(getMyWorkSamples, ["worker"]);
export const POST = withAuth(createMyWorkSample, ["worker"]);
export const PUT = withAuth(updateMyWorkSampleSelection, ["worker"]);
