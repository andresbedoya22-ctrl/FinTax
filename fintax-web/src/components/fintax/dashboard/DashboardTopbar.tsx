import { Bell, ChevronDown, Languages, Menu, Settings } from "lucide-react";

import { Button } from "@/components/fintax/Button";

export interface DashboardTopbarProps {
  onOpenSidebar: () => void;
}

export function DashboardTopbar({ onOpenSidebar }: DashboardTopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border/70 bg-surface2 text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg lg:hidden"
          onClick={onOpenSidebar}
          aria-label="Open sidebar"
        >
          <Menu className="size-5" />
        </button>

        <h1 className="font-heading text-2xl font-semibold text-text">Dashboard</h1>

        <button
          type="button"
          className="ml-2 inline-flex items-center gap-2 rounded-md border border-border/70 bg-surface2 px-3 py-2 text-sm text-secondary transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Current Case
          <ChevronDown className="size-4" />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <Button type="button" variant="ghost" size="sm" className="!px-2.5">
            <Bell className="size-4" aria-hidden="true" />
          </Button>
          <Button type="button" variant="ghost" size="sm" className="!px-2.5">
            <Settings className="size-4" aria-hidden="true" />
          </Button>
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-surface2 px-2.5 py-1 text-xs font-medium text-secondary">
            <Languages className="size-3.5 text-teal" />
            EN
          </span>
        </div>
      </div>
    </header>
  );
}
