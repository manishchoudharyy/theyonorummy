import Link from "next/link";
import dbConnect from "../../../lib/db";
import App from "../../../models/App";
import AdminShell from "../../../components/AdminShell";
import AppsTable from "../../../components/AppsTable";

export default async function ManageAppsPage() {
  await dbConnect();
  const apps = await App.find({}).sort({ position: 1 }).lean();

  return (
    <AdminShell>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Manage Apps</h1>
        <Link
          href="/admin/apps/new"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          + Add App
        </Link>
      </div>
      <div className="mt-4">
        <AppsTable apps={JSON.parse(JSON.stringify(apps))} />
      </div>
    </AdminShell>
  );
}
