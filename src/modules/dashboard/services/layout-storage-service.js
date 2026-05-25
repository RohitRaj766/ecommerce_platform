const STORAGE_KEY = "dashboard-layout";

function getEncodedLayout(layout) {
  return encodeURIComponent(JSON.stringify(layout));
}

function getDecodedLayout(encodedLayout) {
  try {
    return JSON.parse(decodeURIComponent(encodedLayout));
  } catch {
    return null;
  }
}

export function loadLayout(defaultLayout) {
  if (typeof window === "undefined") {
    return { layout: defaultLayout, isSharedLayout: false };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const sharedLayout = searchParams.get("layout");
  if (sharedLayout) {
    const parsedLayout = getDecodedLayout(sharedLayout);
    if (parsedLayout) {
      return { layout: parsedLayout, isSharedLayout: true };
    }
  }

  const rawLayout = window.localStorage.getItem(STORAGE_KEY);
  return { layout: rawLayout ? JSON.parse(rawLayout) : defaultLayout, isSharedLayout: false };
}

export function saveLayout(layout) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
}

export function resetLayout() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function createShareableLayoutUrl(layout) {
  if (typeof window === "undefined") {
    return "";
  }

  const encodedLayout = getEncodedLayout(layout);
  return `${window.location.origin}${window.location.pathname}?layout=${encodedLayout}&view=shared`;
}