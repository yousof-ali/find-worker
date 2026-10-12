import { withAuth } from "@/lib/withAuth";
import { getWorker, updateWorker, deleteWorker, updateWorkerStatus } from "@/controllers/workerController";
export const GET = withAuth(getWorker, ["admin"]);
export const PUT = withAuth(updateWorker, ["admin"]);
export const DELETE = withAuth(deleteWorker, ["admin"]);
export const PATCH = withAuth(updateWorkerStatus, ["admin"]);