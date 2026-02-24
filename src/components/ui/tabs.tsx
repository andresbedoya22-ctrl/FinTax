"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/cn";

type TabsContextValue = {
  value: string;
  setValue: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs />");
  return ctx;
}

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ value, defaultValue, onValueChange, className, ...props }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = value ?? internalValue;

  const setValue = React.useCallback(
    (nextValue: string) => {
      if (value === undefined) setInternalValue(nextValue);
      onValueChange?.(nextValue);
    },
    [onValueChange, value],
  );

  return (
    <TabsContext.Provider value={{ value: activeValue, setValue }}>
      <div className={cn("w-full", className)} {...props} />
    </TabsContext.Provider>
  );
}

const tabsListVariants = cva(
  "inline-flex h-auto w-fit items-center gap-1 rounded-[var(--radius-pill)] border border-border/65 bg-surface/70 p-1 shadow-glass-soft",
  {
    variants: {
      size: {
        sm: "p-1",
        md: "p-1.5",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof tabsListVariants> {}

function TabsList({ className, size, ...props }: TabsListProps) {
  return <div role="tablist" className={cn(tabsListVariants({ size }), className)} {...props} />;
}

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

function TabsTrigger({ className, value, ...props }: TabsTriggerProps) {
  const { value: activeValue, setValue } = useTabsContext();
  const isActive = activeValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      data-state={isActive ? "active" : "inactive"}
      onClick={() => setValue(value)}
      className={cn(
        "rounded-[var(--radius-pill)] px-3.5 py-2 text-xs font-medium tracking-[0.08em] uppercase transition focus-ring",
        isActive
          ? "border border-copper/30 bg-gradient-to-b from-copper/14 to-copper/6 text-text shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]"
          : "border border-transparent text-muted hover:text-secondary",
        className,
      )}
      {...props}
    />
  );
}

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function TabsContent({ className, value, ...props }: TabsContentProps) {
  const { value: activeValue } = useTabsContext();
  if (activeValue !== value) return null;
  return (
    <div role="tabpanel" className={cn("mt-4 outline-none", className)} {...props} />
  );
}

export { Tabs, TabsContent, TabsList, TabsTrigger };
