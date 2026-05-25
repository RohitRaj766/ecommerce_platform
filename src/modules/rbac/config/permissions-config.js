export const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    permission: "dashboard:view",
  },
  {
    label: "Products",
    href: "/ecommerce",
    permission: "products:view",
  },
  {
    label: "Admin Panel",
    href: "/rbac",
    permission: "users:view",
  },
];

export const roleOptions = ["admin", "manager", "user"];

export const roleLabels = {
  admin: "Admin",
  manager: "Manager",
  user: "User",
};

export const legacyRoleAliases = {
  editor: "manager",
  viewer: "user",
};

export function normalizeRole(role) {
  return legacyRoleAliases[role] ?? role ?? "user";
}