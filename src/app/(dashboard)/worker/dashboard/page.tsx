import PersonalInformation from "@/components/dashboard/worker/PersonalInformation";
import WorkerProfileForm from "@/components/dashboard/worker/WorkProfileForm";


export default async function Page() {
  return (
    <div>
        <PersonalInformation/>
        <WorkerProfileForm />
    </div>
  );
}