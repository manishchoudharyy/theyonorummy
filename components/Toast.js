"use client";

export default function Toast({ toast }) {
  if (!toast) return null;
  const isError = toast.type === "error";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg transition ${
        isError ? "bg-red-600" : "bg-emerald-600"
      }`}
    >
      {toast.message}
    </div>
  );
}
