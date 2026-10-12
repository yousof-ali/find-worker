import { withAuth } from "@/lib/withAuth";
import {createWorkSample,getWorkSamples} from "@/controllers/workSampleContoller"

export const GET = withAuth(getWorkSamples, ["admin"]);
export const POST = withAuth(createWorkSample, ["admin"]);