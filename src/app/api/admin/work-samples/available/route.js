import { getAvailableWorkSamples } from "@/controllers/workSampleContoller";
import { withAuth } from "@/lib/withAuth";

export const GET = withAuth(getAvailableWorkSamples, ["admin"]);