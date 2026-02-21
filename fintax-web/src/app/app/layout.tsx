import type { Metadata } from "next";

import { DashboardShell } from "@/components/fintax/dashboard";

export const metadata: Metadata = {
  title: "FinTax Dashboard",
  description: "Track your tax and benefits case progress in one place.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
