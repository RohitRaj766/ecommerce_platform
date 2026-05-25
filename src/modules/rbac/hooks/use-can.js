"use client";

import { useMemo } from "react";
import { usePermissionContext } from "@/modules/rbac/provider/permission-provider";

export function useCan(permission) {
  const { can } = usePermissionContext();
  return useMemo(() => can(permission), [can, permission]);
}