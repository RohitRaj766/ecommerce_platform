"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buildPermissionSet, hasPermission } from "@/shared/utils/permissions";
import { fetchPermissionsForRole } from "@/modules/rbac/services/permission-service";
import { normalizeRole } from "@/modules/rbac/config/permissions-config";

const PermissionContext = createContext(null);
const STORAGE_KEY = "rbac-role";

export function PermissionProvider({ children }) {
  const [role, setRoleState] = useState("user");
  const [permissions, setPermissions] = useState([]);

  const setRole = (nextRole) => {
    setRoleState(normalizeRole(nextRole));
  };

  useEffect(() => {
    const savedRole = window.localStorage.getItem(STORAGE_KEY);
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  useEffect(() => {
    let active = true;

    fetchPermissionsForRole(role).then((permissionList) => {
      if (active) {
        setPermissions(permissionList);
        window.localStorage.setItem(STORAGE_KEY, role);
      }
    });

    return () => {
      active = false;
    };
  }, [role]);

  const permissionSet = useMemo(() => buildPermissionSet(permissions), [permissions]);

  const value = useMemo(
    () => ({
      role,
      setRole,
      permissions,
      can: (permission) => hasPermission(permissionSet, permission),
    }),
    [role, permissions, permissionSet]
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermissionContext must be used inside PermissionProvider");
  }
  return context;
}