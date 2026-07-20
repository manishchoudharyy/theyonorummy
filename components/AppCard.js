import Link from "next/link";
import Image from "next/image";
import StarRating from "./StarRating";

export default function AppCard({ app }) {
  return (
    <Link
      href={`/${app.slug}`}
      title={app.name}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(15,23,42,0.1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
    >
      {/* New / Trending badge */}
      {(app.isNewApp || app.isTrending) && (
        <span className="absolute right-2.5 top-2.5 z-10 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
          {app.isNewApp ? "New" : "Trending"}
        </span>
      )}

      {/* ── Square logo (1:1), capped size so it doesn't balloon on wide columns ── */}
      <div className="flex justify-center pt-2">
        <div className="relative aspect-square w-full max-w-[70px] overflow-hidden rounded-xl bg-slate-100">
          <Image
            src={app.logo}
            alt={app.name}
            fill
            sizes="80px"
            className="object-contain p-0 transition duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="flex flex-col gap-0.5 px-0 pb-0 pt-1">
        {/* App name */}
        <h3 className="truncate text-[15px] px-2 font-bold text-slate-900 text-center">
          {app.name}
        </h3>

        {/* Signup bonus */}
        <p className="text-center text-xs font-semibold text-emerald-600">
          {app.bonus} Bonus
        </p>

        {/* Star rating */}
        <div className="flex justify-center">
          <StarRating rating={app.rating} size="h-3.5 w-3.5" />
        </div>

        {/* Download button */}
        <span className="mt-0.5 inline-flex h-9 w-full rounded-tl-none rounded-tr-none items-center justify-center rounded-lg bg-emerald-500 text-sm font-semibold text-white transition group-hover:bg-emerald-600">
          Download
        </span>
      </div>
    </Link>
  );
}