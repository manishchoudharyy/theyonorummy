"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const navLinks = [
  { label: "All Yono Games", href: "/" },
  { label: "Yono Rummy", href: "/" },
  { label: "Yono Slots", href: "/" },
  { label: "Yono 777", href: "/" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-3.5 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:py-5">

          {/* Logo + hamburger */}
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <img
                src="/logo.webp"
                alt="The Yono Rummy"
                className="h-8 w-8 rounded-[10px] object-cover"
              />
              <span className="text-lg font-bold text-slate-900">The Yono Rummy</span>
            </Link>

            {/* Hamburger — mobile only */}
            <button
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-sidebar"
              onClick={() => setOpen(true)}
              className="flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 lg:hidden"
            >
              <span className="h-0.5 w-[18px] rounded-full bg-slate-900 transition-all" />
              <span className="h-0.5 w-[18px] rounded-full bg-slate-900 transition-all" />
              <span className="h-0.5 w-[18px] rounded-full bg-slate-900 transition-all" />
            </button>
          </div>

          {/* Search bar */}
          <form
            action="/"
            method="GET"
            className="flex cursor-text items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-[0_2px_10px_rgba(15,23,42,0.08)] transition focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 lg:w-96 lg:py-2.5"
          >
            <svg
              aria-hidden
              viewBox="0 0 18 18"
              className="h-[18px] w-[18px] shrink-0 stroke-slate-500"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="8" cy="8" r="6" />
              <path d="M12.5 12.5L17 17" />
            </svg>
            <input
              type="search"
              name="q"
              placeholder="Search verified all yono games..."
              className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
          </form>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 lg:flex">
            {navLinks.map(({ label, href }) => (
              <Link key={label} href={href} className="hover:text-slate-900">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* ===================== SIDEBAR OVERLAY ===================== */}

      {/* Backdrop */}
      <div
        aria-hidden
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        id="mobile-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-white shadow-[4px_0_24px_rgba(15,23,42,0.12)] transition-transform duration-300 ease-in-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
          >
            <img
              src="/logo.webp"
              alt="TheYonoRummy"
              className="h-8 w-8 rounded-[10px] object-cover"
            />
            <span className="text-lg font-bold text-slate-900">The Yono Rummy</span>
          </Link>

          {/* Close button */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <svg
              aria-hidden
              viewBox="0 0 14 14"
              className="h-3.5 w-3.5 stroke-slate-700"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="mt-4 flex flex-col px-3">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Browse
          </p>
          {navLinks.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}