"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { moveAppPosition, deleteApp } from "../app/admin/actions";
import Toast from "./Toast";

export default function AppsTable({ apps, justUpdated }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!justUpdated) return;
    setToast({ type: "success", message: "App updated successfully." });
    router.replace("/admin/apps", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justUpdated]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const query = search.trim().toLowerCase();
  const filteredApps = query
    ? apps.filter(
        (app) =>
          app.name.toLowerCase().includes(query) ||
          app.slug.toLowerCase().includes(query)
      )
    : apps;
  const isFiltered = Boolean(query);

  const handleMove = (id, direction) => {
    startTransition(async () => {
      try {
        await moveAppPosition(id, direction);
      } catch (error) {
        setToast({ type: "error", message: "Couldn't reorder that app. Try again." });
      }
    });
  };

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteApp(id);
        setToast({ type: "success", message: `"${name}" deleted.` });
      } catch (error) {
        setToast({ type: "error", message: `Couldn't delete "${name}". Try again.` });
      }
      setDeletingId(null);
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search apps by name or slug…"
        className="w-full max-w-sm rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Pos</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Bonus</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Active</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredApps.map((app, i) => (
              <tr key={app._id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {!isFiltered && (
                      <>
                        <button
                          type="button"
                          disabled={isPending || i === 0}
                          onClick={() => handleMove(app._id, "up")}
                          className="rounded border border-slate-200 px-1.5 py-0.5 text-xs disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={isPending || i === filteredApps.length - 1}
                          onClick={() => handleMove(app._id, "down")}
                          className="rounded border border-slate-200 px-1.5 py-0.5 text-xs disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </>
                    )}
                    <span className="ml-1 text-xs text-slate-400">{app.position}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-900">{app.name}</td>
                <td className="px-4 py-3 text-slate-500">{app.slug}</td>
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
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/apps/${app._id}`}
                      className="text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      disabled={deletingId === app._id}
                      onClick={() => handleDelete(app._id, app.name)}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-40"
                    >
                      {deletingId === app._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredApps.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-500">
                  No apps match &quot;{search}&quot;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
