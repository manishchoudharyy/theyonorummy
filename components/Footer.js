import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Top row: brand + nav columns */}
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-8 w-8 rounded-[10px] bg-gradient-to-br from-emerald-400 to-emerald-600"
              />
              <span className="text-lg font-bold text-slate-900">FOSSHub</span>
            </Link>
            <p className="max-w-xs text-[13px] leading-relaxed text-slate-500">
              A hand-reviewed directory of free &amp; open-source Android games
              and tools. No ads, no trackers, no hidden costs.
            </p>
            {/* Trust badge */}
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-600">
              <svg
                aria-hidden
                viewBox="0 0 12 12"
                className="h-3 w-3 fill-emerald-500"
              >
                <path d="M6 0L7.63 4.37 12 6l-4.37 1.63L6 12 4.37 7.63 0 6l4.37-1.63z" />
              </svg>
              Community Verified
            </span>
          </div>

          {/* Nav columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Explore
              </h3>
              <ul className="flex flex-col gap-2.5">
                {["All Apps", "Games", "Tools", "New Arrivals", "Trending"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="/"
                        className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Info
              </h3>
              <ul className="flex flex-col gap-2.5">
                {["About", "How It Works", "Submit an App", "Contact"].map(
                  (item) => (
                    <li key={item}>
                      <Link
                        href="/"
                        className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
                      >
                        {item}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
                Legal
              </h3>
              <ul className="flex flex-col gap-2.5">
                {[
                  "Privacy Policy",
                  "Disclaimer",
                  "DMCA",
                  "Terms of Use",
                ].map((item) => (
                  <li key={item}>
                    <Link
                      href="/"
                      className="text-[13px] font-medium text-slate-600 hover:text-slate-900"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-slate-200" />

        {/* Bottom row: copyright + stats strip */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-slate-400">
            © 2026 FOSSHub. All rights reserved.
          </p>

          {/* Quick trust stats */}
          <div className="flex items-center gap-5">
            {[
              ["70+", "Apps"],
              ["100%", "Free"],
              ["0", "Ads"],
            ].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-sm font-bold text-emerald-600">{val}</p>
                <p className="text-[10px] font-medium text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}