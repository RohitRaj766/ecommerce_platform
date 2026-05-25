import dynamic from "next/dynamic";

const DashboardBuilder = dynamic(
  () => import("@/modules/dashboard/components/dashboard-builder").then((module) => module.DashboardBuilder),
  { ssr: false }
);

export default function Page() {
  return <DashboardBuilder />;
}