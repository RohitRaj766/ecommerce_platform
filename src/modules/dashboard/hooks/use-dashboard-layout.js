"use client";

import { useEffect, useState } from "react";
import { loadLayout, resetLayout, saveLayout } from "@/modules/dashboard/services/layout-storage-service";

export function useDashboardLayout(defaultLayout) {
  const [layout, setLayout] = useState(defaultLayout);
  const [isSharedLayout, setIsSharedLayout] = useState(false);

  useEffect(() => {
    const loadedLayout = loadLayout(defaultLayout);
    setLayout(loadedLayout.layout);
    setIsSharedLayout(loadedLayout.isSharedLayout);
  }, [defaultLayout]);

  const persistLayout = (nextLayout) => {
    setLayout(nextLayout);
    if (!isSharedLayout) {
      saveLayout(nextLayout);
    }
  };

  const restoreDefaultLayout = () => {
    if (isSharedLayout) {
      return;
    }

    resetLayout();
    setLayout(defaultLayout);
  };

  return { layout, setLayout: persistLayout, restoreDefaultLayout, isSharedLayout };
}