import Header from "./Header";
import Footer from "./Footer";

export default function LegalPage({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 lg:text-3xl">
            {title}
          </h1>
          {updated && (
            <p className="mt-1 text-xs text-slate-400">Last updated {updated}</p>
          )}
          <div className="prose-legal mt-6 flex flex-col gap-5 text-[14px] leading-relaxed text-slate-600 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_strong]:font-semibold [&_strong]:text-slate-900">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
