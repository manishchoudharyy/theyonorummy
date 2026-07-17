"use client";

import Link from "next/link";
import { useTransition } from "react";
import { moveAppPosition } from "../app/admin/actions";

export default function AppsTable({ apps }) {
  const [isPending, startTransition] = useTransition();

  const handleMove = (id, direction) => {
    startTransition(() => {
      moveAppPosition(id, direction);
    });
  };

  return (
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
          {apps.map((app, i) => (
            <tr key={app._id} className="border-b border-slate-100 last:border-0">
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
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
                    disabled={isPending || i === apps.length - 1}
                    onClick={() => handleMove(app._id, "down")}
                    className="rounded border border-slate-200 px-1.5 py-0.5 text-xs disabled:opacity-30"
                  >
                    ↓
                  </button>
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
  );
}
