import { DashboardShell } from "@/components/fintax/dashboard";

export default function TaxReturnLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
