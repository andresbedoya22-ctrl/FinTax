import {
  BadgeDollarSign,
  FileText,
  Gift,
  LayoutDashboard,
  Landmark,
  Settings,
} from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/cn";

const navItems = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard, active: true },
  { label: "Tax return", href: "#tax-return", icon: FileText },
  { label: "Benefits", href: "#benefits", icon: Gift },
  { label: "Income", href: "#income", icon: BadgeDollarSign },
  { label: "Government", href: "#government", icon: Landmark },
  { label: "Settings", href: "#settings", icon: Settings },
];

export interface DashboardSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function DashboardSidebar({ className, onNavigate }: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        "h-full w-72 border-r border-border/60 bg-surface/70 px-4 py-5 backdrop-blur-xl",
        className
      )}
    >
      <Link
        href="/"
        className="mb-6 flex items-center rounded-md px-2 py-2 font-heading text-lg font-semibold text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
      >
        FinTax
      </Link>

      <nav className="space-y-1" aria-label="Sidebar navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                item.active
                  ? "bg-surface2 text-text shadow-glass-soft"
                  : "text-secondary hover:bg-surface2 hover:text-text"
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
