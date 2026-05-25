"use client";

import Link from "next/link";
import { Badge } from "@/shared/ui/badge";
import { navigationItems } from "@/modules/rbac/config/permissions-config";
import { usePermissionContext } from "@/modules/rbac/provider/permission-provider";

export function RoleSidebar() {
  const { can, role } = usePermissionContext();

  return (
    <aside className="sticky top-24 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Dynamic Sidebar</p>
      <p className="mt-1 text-sm text-slate-600">
        Active role: <span className="inline-block align-middle"> <Badge className="!bg-emerald-100 !text-emerald-700 ring-1 ring-inset ring-emerald-200">{role}</Badge> </span>
      </p>
      <div className="mt-4 space-y-2">
        {navigationItems.map((item) => {
          const enabled = can(item.permission);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-disabled={!enabled}
              className={`block rounded-xl px-4 py-3 text-sm transition ${enabled ? "bg-slate-50 text-slate-900 hover:bg-sky-50" : "cursor-not-allowed bg-slate-100 text-slate-400"}`}
              onClick={(event) => {
                if (!enabled) {
                  event.preventDefault();
                }
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}