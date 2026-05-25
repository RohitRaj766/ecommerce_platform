"use client";

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/query-client/query-client";

export function QueryProvider({ children }) {
  const [client] = useState(() => createQueryClient());
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}