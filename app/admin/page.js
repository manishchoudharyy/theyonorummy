import Link from "next/link";
import dbConnect from "../../lib/db";
import App from "../../models/App";
import AdminShell from "../../components/AdminShell";

export default async function AdminDashboard() {
  await dbConnect();

  const [total, active, trending, newApps, recentApps] = await Promise.all([
    App.countDocuments({}),
    App.countDocuments({ isActive: true }),
    App.countDocuments({ isTrending: true }),
    App.countDocuments({ isNewApp: true }),
    App.find({}).sort({ lastUpdated: -1 }).limit(6).lean(),
  ]);

  const stats = [
    ["Total Apps", total],
    ["Active", active],
    ["Trending", trending],
    ["New", newApps],
  ];

  return (
    <AdminShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/apps/new"
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            + Add App
          </Link>
          <Link
            href="/admin/apps"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Manage Apps
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <p className="text-2xl font-bold text-emerald-600">{value}</p>
            <p className="text-xs font-medium text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Recently updated apps */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recently Updated</h2>
          <Link
            href="/admin/apps"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentApps.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Bonus</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentApps.map((app) => (
                  <tr key={app._id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3 font-semibold text-slate-900">{app.name}</td>
                    <td className="px-4 py-3">{app.bonus}</td>
                    <td className="px-4 py-3">{app.rating}</td>
                    <td className="px-4 py-3">
                      {app.isActive ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(app.lastUpdated).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/apps/${app._id}`}
                        className="text-xs font-semibold text-blue-600 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
            No apps yet.{" "}
            <Link href="/admin/apps/new" className="font-semibold text-emerald-600 hover:underline">
              Add your first app
            </Link>
            .
          </p>
        )}
      </div>
    </AdminShell>
  );
}
