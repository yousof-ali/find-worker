import { getSession } from "@/lib/auth";
import Link from "next/link";


export default async function ForbiddenPage() {
  const session = await getSession();
  const home = !session
    ? "/login"
    : session.role === "admin"
      ? "/admin/dashboard"
      : "/user/dashboard";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl font-black text-slate-900">403</div>
        <h1 className="text-xl font-bold text-slate-900">Access Forbidden</h1>
        <p className="text-sm text-slate-500">
          You don&apos;t have permission to view this page.
        </p>
        <Link
          href={home}
          className="inline-block px-6 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
        >
          {session ? "Go to my dashboard" : "Go to login"}
        </Link>
      </div>
    </div>
  );
}