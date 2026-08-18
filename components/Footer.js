import Link from "next/link";

const legalLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms", href: "/terms" },
  { label: "Responsible Gaming", href: "/responsible-gaming" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center">
        <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-medium text-slate-500 hover:text-emerald-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-xs text-slate-400">
          © 2026 All Rights Reserved theyonorummy.com
        </p>
      </div>
    </footer>
  );
}
