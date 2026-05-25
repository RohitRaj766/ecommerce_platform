import dynamic from "next/dynamic";
import { RevenueWidget } from "@/modules/dashboard/widgets/revenue-widget";

const widgetLoaders = {
  sales: dynamic(() => import("@/modules/dashboard/widgets/sales-widget").then((module) => module.SalesWidget), {
    loading: () => <div className="h-full rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">Loading sales widget...</div>,
    ssr: false,
  }),
  orders: dynamic(() => import("@/modules/dashboard/widgets/orders-widget").then((module) => module.OrdersWidget), {
    loading: () => <div className="h-full rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">Loading orders widget...</div>,
    ssr: false,
  }),
  traffic: dynamic(() => import("@/modules/dashboard/widgets/traffic-widget").then((module) => module.TrafficWidget), {
    loading: () => <div className="h-full rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">Loading traffic widget...</div>,
    ssr: false,
  }),
};

export const widgetRegistry = [
  { id: "sales", title: "Sales snapshot", component: widgetLoaders.sales },
  { id: "orders", title: "Orders list", component: widgetLoaders.orders },
  { id: "traffic", title: "Traffic trend", component: widgetLoaders.traffic },
  { id: "revenue", title: "Revenue performance", component: RevenueWidget },
];