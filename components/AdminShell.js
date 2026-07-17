import Link from "next/link";
import { logoutAction } from "../app/admin/actions";

const navItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "Add App", href: "/admin/apps/new" },
  { label: "Manage Apps", href: "/admin/apps" },
];

export default function AdminShell({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <span className="text-base font-bold">TheYonoRummy Admin</span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Log Out
            </button>
          </form>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl gap-6 px-4 py-6">
        <nav className="hidden w-48 shrink-0 flex-col gap-1 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
