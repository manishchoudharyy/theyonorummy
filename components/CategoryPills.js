import Link from "next/link";

export default function CategoryPills({
  categories = ["All"],
  activeCategory = "All",
  inPlace = false,
}) {
  return (
    <div
      className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-1 sm:mx-0 sm:px-0"
      role="tablist"
      aria-label="App categories"
    >
      {categories.map((c) => {
        const isActive = c.toLowerCase() === activeCategory.toLowerCase();
        const href =
          c === "All" ? "/" : inPlace ? `/?category=${c}` : `/category/${c}`;
        return (
          <Link
            key={c}
            href={href}
            role="tab"
            aria-selected={isActive}
            className={`shrink-0 rounded-full px-[18px] py-3 text-sm capitalize transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 ${
              isActive
                ? "bg-emerald-500 font-semibold text-white"
                : "bg-slate-100 font-medium text-slate-600 hover:bg-slate-200"
            }`}
          >
            {c}
          </Link>
        );
      })}
    </div>
  );
}
