"use client";

import { QueryProvider } from "@/providers/query-provider";
import { PermissionProvider } from "@/modules/rbac/provider/permission-provider";

export function AppProviders({ children }) {
  return (
    <QueryProvider>
      <PermissionProvider>{children}</PermissionProvider>
    </QueryProvider>
  );
}