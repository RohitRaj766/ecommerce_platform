import { updateMock } from "@/shared/services/api-client";

export function addDashboardWidget({ layout, widget }) {
  return updateMock(
    () => ({
      message: `Added ${widget.title}.`,
      layout: [...layout, widget],
    }),
    { delay: 500 }
  );
}

export function updateDashboardWidget({ layout, widgetId, title }) {
  return updateMock(
    () => ({
      message: `Updated ${title}.`,
      layout: layout.map((item) => (item.i === widgetId ? { ...item, title } : item)),
    }),
    { delay: 500 }
  );
}

export function deleteDashboardWidget({ layout, widgetId }) {
  return updateMock(
    () => ({
      message: "Deleted widget.",
      layout: layout.filter((item) => item.i !== widgetId),
    }),
    { delay: 500 }
  );
}