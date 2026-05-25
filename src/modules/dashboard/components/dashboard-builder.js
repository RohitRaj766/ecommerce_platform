"use client";

import { useEffect, useMemo, useState } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import dashboardLayouts from "@/mock/dashboard-layouts.json";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { createShareableLayoutUrl } from "@/modules/dashboard/services/layout-storage-service";
import { widgetRegistry } from "@/modules/dashboard/registry/widget-registry";
import { usePermissionContext } from "@/modules/rbac/provider/permission-provider";
import {
  addDashboardWidget,
  deleteDashboardWidget,
  updateDashboardWidget,
} from "@/modules/dashboard/services/dashboard-action-service";
import {
  loadWidgetState,
  saveWidgetState,
} from "@/modules/dashboard/services/widget-state-service";
import { loadLayout } from "@/modules/dashboard/services/layout-storage-service";
import widgetSeed from "@/mock/dashboard-widgets.json";

const ResponsiveGridLayout = WidthProvider(Responsive);

function WidgetShell({ title, children, onDelete, onEdit, canEdit }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 text-sm font-medium text-slate-600">
        <span className="dashboard-drag-handle min-w-0 flex-1 cursor-move select-none pr-2">{title}</span>
        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap">
          <span>{canEdit ? "Drag / Resize" : "Read only"}</span>
          {canEdit && onEdit ? (
            <Button
              variant="ghost"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onEdit();
              }}
            >
              Edit
            </Button>
          ) : null}
          {canEdit && onDelete ? (
            <Button
              variant="ghost"
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                onDelete();
              }}
            >
              Delete
            </Button>
          ) : null}
        </div>
      </div>
      <div className="h-[calc(100%-48px)] p-3">{children}</div>
    </div>
  );
}

export function DashboardBuilder() {
  const defaultLayout = useMemo(() => dashboardLayouts.default, []);
  const { can, role } = usePermissionContext();
  const canEditDashboard = can("dashboard:edit");
  const canShareDashboard = can("dashboard:share");
  const [shareLink, setShareLink] = useState("");
  const [shareStatus, setShareStatus] = useState("idle");
  const [actionState, setActionState] = useState({ status: "idle", type: "", widgetId: "", message: "" });
  const [editTarget, setEditTarget] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [layout, setLayout] = useState(defaultLayout);
  const [isSharedLayout, setIsSharedLayout] = useState(false);
  const [resizeMode, setResizeMode] = useState(false);
  const canModifyLayout = canEditDashboard && !isSharedLayout;

  const persistLayoutState = (nextLayout) => {
    setLayout(nextLayout);
    if (!isSharedLayout) {
      saveWidgetState(nextLayout);
    }
  };

  const syncLayoutFromGrid = (currentLayout) => {
    const nextLayout = currentLayout.map((layoutItem) => {
      const existingWidget = layout.find((item) => item.i === layoutItem.i);
      const registryWidget = widgetRegistry.find((item) => item.id === layoutItem.i);

      return {
        ...(existingWidget ?? {}),
        ...layoutItem,
        title: existingWidget?.title ?? registryWidget?.title ?? layoutItem.i,
      };
    });

    persistLayoutState(nextLayout);
  };

  useEffect(() => {
    const loadedLayout = loadLayout(defaultLayout);
    if (loadedLayout.isSharedLayout) {
      setLayout(loadedLayout.layout);
      setIsSharedLayout(true);
      return;
    }

    setLayout(loadWidgetState());
    setIsSharedLayout(false);
  }, [defaultLayout]);

  const widgetCount = layout.length;
  const activeWidgetIds = useMemo(() => layout.map((item) => item.i), [layout]);
  const activeWidgets = useMemo(
    () =>
      layout
        .map((layoutItem) => {
          const widget = widgetRegistry.find((candidate) => candidate.id === layoutItem.i);
          if (!widget) return null;

          return {
            ...widget,
            title: layoutItem.title ?? widget.title,
            layoutItem,
          };
        })
        .filter(Boolean),
    [layout]
  );
  const hiddenWidgets = useMemo(
    () => widgetRegistry.filter((widget) => !activeWidgetIds.includes(widget.id)),
    [activeWidgetIds]
  );

  const addWidget = async (widgetId) => {
    if (!canModifyLayout) return;

    const widget = widgetRegistry.find((candidate) => candidate.id === widgetId);
    if (!widget) return;

    const template = dashboardLayouts.default.find((item) => item.i === widgetId) ?? {
      i: widgetId,
      x: 0,
      y: layout.reduce((max, item) => Math.max(max, item.y + item.h), 0),
      w: 4,
      h: 4,
      title: widget.title,
    };

    if (activeWidgetIds.includes(widgetId)) return;

    setActionState({ status: "loading", type: "add", widgetId, message: `Adding ${widget.title}...` });

    try {
      const response = await addDashboardWidget({ layout, widget: template });
      persistLayoutState(response.layout);
      setActionState({ status: "success", type: "add", widgetId, message: response.message });
    } catch {
      setActionState({ status: "error", type: "add", widgetId, message: "Unable to add the widget right now." });
    }
  };

  const openEditWidget = (widget) => {
    if (!canModifyLayout) return;

    setEditTarget(widget);
    setEditTitle(widget.title);
  };

  const saveWidgetEdit = async () => {
    if (!canModifyLayout || !editTarget) return;

    const nextTitle = editTitle.trim();
    if (!nextTitle) return;

    setActionState({ status: "loading", type: "edit", widgetId: editTarget.id, message: `Updating ${nextTitle}...` });

    try {
      const response = await updateDashboardWidget({ layout, widgetId: editTarget.id, title: nextTitle });
      persistLayoutState(response.layout);
      setEditTarget(null);
      setActionState({ status: "success", type: "edit", widgetId: editTarget.id, message: response.message });
    } catch {
      setActionState({ status: "error", type: "edit", widgetId: editTarget.id, message: "Unable to update the widget right now." });
    }
  };

  const deleteWidget = async (widgetId) => {
    if (!canModifyLayout) return;

    setActionState({ status: "loading", type: "delete", widgetId, message: "Deleting widget..." });

    try {
      const response = await deleteDashboardWidget({ layout, widgetId });
      persistLayoutState(response.layout);
      if (editTarget?.id === widgetId) {
        setEditTarget(null);
      }
      setActionState({ status: "success", type: "delete", widgetId, message: response.message });
    } catch {
      setActionState({ status: "error", type: "delete", widgetId, message: "Unable to delete the widget right now." });
    }
  };

  const copyShareLink = async () => {
    if (!canShareDashboard) return;

    const nextShareLink = createShareableLayoutUrl(layout);
    setShareStatus("loading");
    setShareLink(nextShareLink);

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(nextShareLink);
    }

    setShareStatus("idle");
  };

  if (isSharedLayout) {
    return (
      <div className="space-y-4">
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={80}
          onLayoutChange={() => {}}
          draggableHandle=".dashboard-drag-handle"
          compactType={null}
          isResizable={false}
          isDraggable={false}
        >
          {activeWidgets.map((widget) => {
            const WidgetComponent = widget.component;
            return (
              <div key={widget.id}>
                <WidgetShell title={widget.title} canEdit={false}>
                  <WidgetComponent />
                </WidgetShell>
              </div>
            );
          })}
        </ResponsiveGridLayout>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Configurable Dashboard Builder</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Widgets registry + drag and resize + local persistence</h1>
            <p className="mt-2 text-sm text-slate-600">
              Admin can add, edit, and delete widgets. Manager inherits user access plus product edit and can share a dashboard link.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="!bg-emerald-100 !text-emerald-700 ring-1 ring-inset ring-emerald-200">Role: {role}</Badge>
            <Button variant="secondary" onClick={() => persistLayoutState(dashboardLayouts.compact)} disabled={!canModifyLayout}>
              Compact
            </Button>
            <Button variant="secondary" onClick={() => persistLayoutState(dashboardLayouts.expanded)} disabled={!canModifyLayout}>
              Expanded
            </Button>
            <Button variant="secondary" onClick={() => persistLayoutState(widgetSeed)} disabled={!canModifyLayout}>
              Reset layout
            </Button>
            <Button variant="secondary" onClick={() => setResizeMode((current) => !current)} disabled={!canModifyLayout}>
              {resizeMode ? "Done resizing" : "Resize widgets"}
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Widgets</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{widgetCount}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Persistence</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">localStorage</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Rendering</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">Lazy loaded</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Widget controls</h2>
            <p className="mt-2 text-sm text-slate-600">Add a hidden widget back into the dashboard or remove an active widget.</p>
          </div>
          {canShareDashboard ? (
            <Button variant="secondary" onClick={copyShareLink} disabled={shareStatus === "loading"}>
              {shareStatus === "loading" ? "Generating..." : "Generate share link"}
            </Button>
          ) : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {hiddenWidgets.map((widget) => (
            <Button key={widget.id} onClick={() => addWidget(widget.id)} disabled={actionState.status === "loading"}>
              {actionState.status === "loading" && actionState.type === "add" && actionState.widgetId === widget.id
                ? "Adding..."
                : `Add ${widget.title}`}
            </Button>
          ))}
          {hiddenWidgets.length === 0 ? <p className="text-sm text-slate-500">All widgets are already on the board.</p> : null}
        </div>
        {actionState.message ? <p className="mt-4 text-sm text-slate-600">{actionState.message}</p> : null}
        {shareLink ? <p className="mt-4 break-all rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">Shared link: {shareLink}</p> : null}
      </Card>

      <ResponsiveGridLayout
        className="layout"
        layouts={{ lg: layout }}
        breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
        cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        rowHeight={80}
        onLayoutChange={(currentLayout) => syncLayoutFromGrid(currentLayout)}
        draggableHandle=".dashboard-drag-handle"
        compactType={null}
        isResizable={resizeMode}
        isDraggable
        resizeHandles={resizeMode ? ["e", "w", "s", "n", "se", "sw", "ne", "nw"] : []}
      >
        {activeWidgets.map((widget) => {
          const WidgetComponent = widget.component;
          return (
            <div key={widget.id} data-widget-id={widget.id}>
              <WidgetShell title={widget.title} canEdit onEdit={() => openEditWidget(widget)} onDelete={() => deleteWidget(widget.id)}>
                <WidgetComponent />
              </WidgetShell>
            </div>
          );
        })}
      </ResponsiveGridLayout>

      {editTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Edit widget</p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-950">Rename {editTarget.title}</h3>
            <label className="mt-5 block text-sm font-medium text-slate-700">Widget title</label>
            <input
              value={editTitle}
              onChange={(event) => setEditTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-sky-400"
            />
            <div className="mt-5 flex flex-wrap gap-2">
              <Button onClick={saveWidgetEdit} disabled={actionState.status === "loading"}>
                {actionState.status === "loading" && actionState.type === "edit" ? "Saving..." : "Save changes"}
              </Button>
              <Button variant="secondary" onClick={() => setEditTarget(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}