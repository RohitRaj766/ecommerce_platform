import permissions from "@/mock/permissions.json";
import { normalizeRole } from "@/modules/rbac/config/permissions-config";

export async function fetchPermissionsForRole(role) {
  const normalizedRole = normalizeRole(role);

  return new Promise((resolve) => {
    setTimeout(() => resolve(permissions[normalizedRole] ?? permissions.user ?? []), 250);
  });
}