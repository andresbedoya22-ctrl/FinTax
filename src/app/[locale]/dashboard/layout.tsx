import type { Metadata } from "next";

import { AuthenticatedRouteTransition } from "@/components/fintax/motion/AuthenticatedRouteTransition";
import { DashboardShell } from "@/components/fintax/dashboard";

export const metadata: Metadata = {
  title: "FinTax Dashboard",
  description: "Track your tax and benefits case progress in one place.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell><AuthenticatedRouteTransition>{children}</AuthenticatedRouteTransition></DashboardShell>;
}
