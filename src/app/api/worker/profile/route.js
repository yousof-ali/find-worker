import { withAuth } from "@/lib/withAuth";

import {
  getMyWorkerProfile,
  updateMyWorkerProfile,
} from "@/controllers/workerController";

export const GET = withAuth(
  getMyWorkerProfile,
  ["worker"],
);

export const PUT = withAuth(
  updateMyWorkerProfile,
  ["worker"],
);