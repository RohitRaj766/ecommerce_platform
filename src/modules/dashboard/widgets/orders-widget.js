"use client";

const orders = [
  { label: "New order", value: "18" },
  { label: "Pending", value: "07" },
  { label: "Shipped", value: "22" },
];

export function OrdersWidget() {
  return (
    <div className="h-full rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-medium text-slate-500">Orders</p>
      <div className="mt-4 space-y-3">
        {orders.map((order) => (
          <div key={order.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-sm text-slate-600">{order.label}</span>
            <span className="text-lg font-semibold text-slate-950">{order.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}