import Link from "next/link";
import { Card } from "@/shared/ui/card";

const prototypeRoutes = [
  { title: "RBAC System", href: "/rbac" },
  { title: "Ecommerce Frontend", href: "/ecommerce" },
  { title: "Reusable Data Layer", href: "/data-layer" },
  { title: "Dashboard Builder", href: "/dashboard" },
];

const prototypes = [
  {
    title: "RBAC System",
    description: "Dynamic sidebar, protected actions, and a permission matrix driven by mock JSON.",
    note: "/rbac",
  },
  {
    title: "Ecommerce Frontend",
    description: "Product listing, filters, cart, wishlist, totals, and item state stored in Zustand.",
    note: "/ecommerce",
  },
  {
    title: "Reusable Data Layer",
    description: "Centralized query and mutation abstractions with caching, retries, cancellation, and optimistic updates.",
    note: "/data-layer",
  },
  {
    title: "Dashboard Builder",
    description: "Registry-based widgets, drag/resize layout, presets, and local persistence.",
    note: "/dashboard",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-700">Frontend Architectures</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Four simple, modular prototypes.
        </h1>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        {prototypes.map((prototype) => (
          <Card key={prototype.title} className="h-full">
            <h2 className="text-xl font-semibold text-slate-900">{prototype.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{prototype.description}</p>
            <div className="mt-5 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-sky-700">Route: {prototype.note}</p>
              <Link
                href={prototype.note}
                className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
              >
                Go to prototype
              </Link>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}