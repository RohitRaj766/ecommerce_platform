export function buildPermissionSet(permissionList = []) {
  return new Set(permissionList);
}

export function hasPermission(permissionSet, permission) {
  return permissionSet.has(permission);
}