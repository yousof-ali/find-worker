'use client';

import WorkerForm from '@/components/dashboard/admin/WorkerForm';
import { useParams } from 'next/navigation';


export default function EditWorkerPage() {
  const { id } = useParams<{ id: string }>();
  return <WorkerForm workerId={id} />;
}