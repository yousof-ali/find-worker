import { notFound } from "next/navigation";

import { getWorkerData } from "@/controllers/workerController";
import WorkerViewClient from "./workerViewClient";



interface WorkerViewPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkerViewPage({
  params,
}: WorkerViewPageProps) {
  const { id } = await params;

  const worker = await getWorkerData(id);

  if (!worker) {
    notFound();
  }

  return <WorkerViewClient worker={worker} />;
}