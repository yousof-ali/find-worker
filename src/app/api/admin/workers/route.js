import { withAuth } from "@/lib/withAuth";
import { getWorkers, createWorker } from "@/controllers/workerController";
export const GET = withAuth(getWorkers, ["admin"]);
export const POST = withAuth(createWorker, ["admin"]);