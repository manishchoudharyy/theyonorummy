"use client";

import { useId } from "react";

export default function StarRating({ rating, size = "h-4 w-4" }) {
  const uid = useId();

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const full = s <= Math.floor(rating);
        const half = !full && s === Math.ceil(rating) && rating % 1 >= 0.5;
        const gradientId = `star-half-${uid}-${s}`;
        return (
          <svg key={s} viewBox="0 0 20 20" className={size}>
            {half ? (
              <>
                <defs>
                  <linearGradient id={gradientId}>
                    <stop offset="50%" stopColor="#FBBF24" />
                    <stop offset="50%" stopColor="#E2E8F0" />
                  </linearGradient>
                </defs>
                <path
                  fill={`url(#${gradientId})`}
                  d="M10 1l2.4 5 5.6.8-4 3.9.9 5.5L10 13.5l-4.9 2.7.9-5.5L2 6.8l5.6-.8z"
                />
              </>
            ) : (
              <path
                fill={full ? "#FBBF24" : "#E2E8F0"}
                d="M10 1l2.4 5 5.6.8-4 3.9.9 5.5L10 13.5l-4.9 2.7.9-5.5L2 6.8l5.6-.8z"
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}
