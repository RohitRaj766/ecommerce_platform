"use client";

import { useCan } from "@/modules/rbac/hooks/use-can";

export function PermissionGate({ permission, fallback = null, children }) {
  const allowed = useCan(permission);
  return allowed ? children : fallback;
}