"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { routes } from "@/shared/constants/routes";

const items = [
  { label: "Home", href: routes.home },
  { label: "RBAC", href: routes.rbac },
  { label: "Ecommerce", href: routes.ecommerce },
  { label: "Data Layer", href: routes.dataLayer },
  { label: "Dashboard", href: routes.dashboard },
];

export function TopNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (pathname === routes.dashboard && searchParams.get("view") === "shared") {
    return null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">Architecture Lab</p>
          <p className="mt-1 text-sm text-slate-500">Jump between prototypes from here</p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 transition hover:border-sky-200 hover:bg-sky-50 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}