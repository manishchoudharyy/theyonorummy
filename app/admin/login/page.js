import { loginAction } from "../actions";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const hasError = resolvedSearchParams?.error === "1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-slate-900">Admin Login</h1>
        <p className="mt-1 text-sm text-slate-500">TheYonoRummy admin panel</p>

        {hasError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            Invalid username or password.
          </p>
        )}

        <form action={loginAction} className="mt-5 flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Username
            <input
              type="text"
              name="username"
              required
              autoComplete="username"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs font-semibold text-slate-600">
            Password
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal text-slate-900 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <button
            type="submit"
            className="mt-2 h-11 rounded-lg bg-emerald-500 text-sm font-semibold text-white hover:bg-emerald-600"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}
