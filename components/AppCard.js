import Link from "next/link";

export default function AppCard({ app }) {
  return (
    <Link
      href={`/${app.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(15,23,42,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
    >
      {/* New / Trending badge */}
      {(app.isNewApp || app.isTrending) && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
          {app.isNewApp ? "New" : "Trending"}
        </span>
      )}

      {/* ── Full-width image banner ── */}
      <div className="relative h-32 w-full overflow-hidden bg-slate-100">
        <img
          src={app.logo}
          alt={app.name}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-3">
        {/* App name */}
        <h3 className="truncate text-[15px] font-bold text-slate-900">
          {app.name}
        </h3>

        {/* Rating + size */}
        <p className="text-xs font-medium text-slate-500">
          {app.rating.toFixed(1)} ★&nbsp;&nbsp;|&nbsp;&nbsp;{app.appSize}
        </p>

        {/* Download button */}
        <span className="mt-1 inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-500 text-[15px] font-semibold text-white transition group-hover:bg-emerald-600">
          Download
        </span>
      </div>
    </Link>
  );
}