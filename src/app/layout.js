import "./globals.css";
import { Suspense } from "react";
import { AppProviders } from "@/providers/app-providers";
import { TopNav } from "@/shared/ui/top-nav";

export const metadata = {
  title: {
    default: "Frontend Architecture Prototypes",
    template: "%s | Frontend Architecture Prototypes",
  },
  description: "RBAC, ecommerce, reusable data layer, and dashboard builder prototypes with local persistence and SEO-ready routes.",
  keywords: ["frontend architecture", "ecommerce", "RBAC", "dashboard", "data layer"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppProviders>
          <div className="min-h-screen bg-grid-radial">
            <Suspense fallback={null}>
              <TopNav />
            </Suspense>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
          </div>
        </AppProviders>
      </body>
    </html>
  );
}