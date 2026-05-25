import widgetSeed from "@/mock/dashboard-widgets.json";

const STORAGE_KEY = "dashboard-widgets";

function readWidgetState() {
  if (typeof window === "undefined") {
    return widgetSeed;
  }

  const rawState = window.localStorage.getItem(STORAGE_KEY);
  if (!rawState) {
    return widgetSeed;
  }

  try {
    const parsedState = JSON.parse(rawState);
    return Array.isArray(parsedState) ? parsedState : widgetSeed;
  } catch {
    return widgetSeed;
  }
}

function writeWidgetState(widgetState) {
  if (typeof window === "undefined") {
    return widgetState;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(widgetState));
  return widgetState;
}

export function loadWidgetState() {
  return readWidgetState();
}

export function saveWidgetState(widgetState) {
  return writeWidgetState(widgetState);
}

export function addWidgetToState(widgetState, widget) {
  const nextState = [...widgetState.filter((item) => item.id !== widget.id), widget];
  return writeWidgetState(nextState);
}

export function updateWidgetInState(widgetState, widgetId, changes) {
  const nextState = widgetState.map((item) => (item.id === widgetId ? { ...item, ...changes } : item));
  return writeWidgetState(nextState);
}

export function deleteWidgetFromState(widgetState, widgetId) {
  const nextState = widgetState.filter((item) => item.id !== widgetId);
  return writeWidgetState(nextState);
}