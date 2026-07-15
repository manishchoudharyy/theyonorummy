"use client";

import { useState } from "react";

export default function FaqAccordion({ faqs = [] }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-2.5">
      {faqs.map((f, i) => {
        const isOpen = open === i;
        return (
          <div
            key={f.question}
            className="rounded-xl border border-slate-200 bg-white"
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex min-h-12 w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              <span className="text-[15px] font-semibold text-slate-900">
                {f.question}
              </span>
              <svg
                aria-hidden
                viewBox="0 0 12 7"
                className={`h-[7px] w-3 shrink-0 stroke-slate-500 transition-transform motion-reduce:transition-none ${
                  isOpen ? "rotate-180" : ""
                }`}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M1 1l5 5 5-5" />
              </svg>
            </button>
            {isOpen && (
              <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">
                {f.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
