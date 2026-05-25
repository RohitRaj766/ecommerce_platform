"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { PermissionGate } from "@/modules/rbac/components/permission-gate";
import { RoleSidebar } from "@/modules/rbac/components/role-sidebar";
import { roleOptions } from "@/modules/rbac/config/permissions-config";
import { usePermissionContext } from "@/modules/rbac/provider/permission-provider";

const permissionMatrix = [
  { section: "Dashboard", permission: "dashboard:view", note: "Can open analytics screens" },
  { section: "Dashboard edit", permission: "dashboard:edit", note: "Can move and save widgets" },
  { section: "Dashboard share", permission: "dashboard:share", note: "Can copy and share dashboard layout links" },
  { section: "Products", permission: "products:view", note: "Can browse catalog data" },
  { section: "Product add", permission: "products:add", note: "Can create new product cards" },
  { section: "Product edit", permission: "products:edit", note: "Can change product actions" },
  { section: "Product delete", permission: "products:delete", note: "Can remove products from the catalog" },
  { section: "Cart management", permission: "cart:manage", note: "Can manage purchase actions" },
  { section: "User admin", permission: "users:view", note: "Can access admin-only area" },
  { section: "RBAC policy editor", permission: "rbac:edit", note: "Can change role guidance notes" },
  { section: "Checkout purchase", permission: "checkout:purchase", note: "Can purchase items in ecommerce" },
  { section: "Coupon and payment simulation", permission: "checkout:coupon", note: "Can apply coupons and simulate payment" },
];

const rolePermissions = {
  admin: [
    "dashboard:view",
    "dashboard:edit",
    "dashboard:share",
    "products:view",
    "products:add",
    "products:edit",
    "products:delete",
    "cart:manage",
    "users:view",
    "rbac:edit",
    "checkout:purchase",
    "checkout:coupon",
    "checkout:simulate",
  ],
  manager: [
    "dashboard:view",
    "dashboard:share",
    "products:view",
    "products:edit",
    "checkout:purchase",
    "checkout:coupon",
    "checkout:simulate",
  ],
  user: ["dashboard:view", "products:view", "checkout:purchase", "checkout:coupon", "checkout:simulate"],
};

export function RbacPage() {
  const { role, setRole, permissions } = usePermissionContext();
  const allowedSections = permissionMatrix.filter((item) => permissions.includes(item.permission));
  const [savedPolicyNote, setSavedPolicyNote] = useState("Use the policy editor to document what each role can do.");
  const [draftPolicyNote, setDraftPolicyNote] = useState(savedPolicyNote);

  const canRoleAccess = (roleName, permission) => rolePermissions[roleName].includes(permission);
  const canEditRbac = permissions.includes("rbac:edit");

  return (
    <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
      <RoleSidebar />
      <div className="space-y-6">
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">RBAC System</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-950">Permission-driven UI without hardcoded role checks</h1>
            </div>
            <div className="grid min-w-[220px] gap-3 sm:grid-cols-3 xl:min-w-[320px] xl:grid-cols-1">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Current role</p>
                <Badge className="mt-2 !bg-emerald-100 !text-emerald-700 ring-1 ring-inset ring-emerald-200">{role}</Badge>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Allowed sections</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{allowedSections.length}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total permissions</p>
                <p className="mt-2 text-lg font-semibold text-slate-950">{permissions.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {roleOptions.map((option) => (
              <Button
                key={option}
                variant="secondary"
                className={role === option ? "!bg-emerald-600 !text-white hover:!bg-emerald-700" : ""}
                onClick={() => setRole(option)}
              >
                {option}
              </Button>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <Badge key={permission}>{permission}</Badge>
            ))}
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <h2 className="text-lg font-semibold text-slate-950">Protected actions</h2>
            <p className="mt-2 text-sm text-slate-600">Buttons are enabled only when the permission exists.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PermissionGate permission="products:edit" fallback={<Button disabled>Edit products</Button>}>
                <Button>Edit products</Button>
              </PermissionGate>
              <PermissionGate permission="cart:manage" fallback={<Button disabled>Add to cart</Button>}>
                <Button>Add to cart</Button>
              </PermissionGate>
              <PermissionGate permission="dashboard:edit" fallback={<Button disabled>Save dashboard</Button>}>
                <Button>Save dashboard</Button>
              </PermissionGate>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-slate-950">Allowed sections</h2>
            <div className="mt-4 space-y-3">
              {allowedSections.map((item) => (
                <div key={item.permission} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{item.section}</p>
                    <Badge className="bg-emerald-100 text-emerald-700">Allowed</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{item.note}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">RBAC policy editor</h2>
              <p className="mt-2 text-sm text-slate-600">
                This gives the prototype a real edit surface when the active role has <span className="font-medium">rbac:edit</span>.
              </p>
            </div>
            <Badge className={canEditRbac ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}>
              {canEditRbac ? "Editable" : "Read only"}
            </Badge>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Policy notes</label>
              <textarea
                value={draftPolicyNote}
                onChange={(event) => setDraftPolicyNote(event.target.value)}
                disabled={!canEditRbac}
                rows={5}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  disabled={!canEditRbac}
                  onClick={() => {
                    if (!canEditRbac) return;
                    setSavedPolicyNote(draftPolicyNote);
                  }}
                >
                  Save policy notes
                </Button>
                <Button
                  variant="secondary"
                  disabled={!canEditRbac}
                  onClick={() => setDraftPolicyNote(savedPolicyNote)}
                >
                  Reset draft
                </Button>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Saved note</p>
              <p className="mt-3 text-sm leading-6 text-slate-700">{savedPolicyNote}</p>
              {!canEditRbac ? <p className="mt-4 text-sm text-slate-500">Switch to admin or manager to edit user guidance here.</p> : null}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-slate-950">Permission matrix</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
            <div className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr] bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span>Section</span>
              <span>Admin</span>
              <span>Manager</span>
              <span>User</span>
            </div>
            {permissionMatrix.map((item) => (
              <div key={item.permission} className="grid grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr] border-t border-slate-200 px-4 py-3 text-sm">
                <span className="font-medium text-slate-900">{item.section}</span>
                <span>{canRoleAccess("admin", item.permission) ? "Yes" : "No"}</span>
                <span>{canRoleAccess("manager", item.permission) ? "Yes" : "No"}</span>
                <span>{canRoleAccess("user", item.permission) ? "Yes" : "No"}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}