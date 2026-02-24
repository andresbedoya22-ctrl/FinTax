"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  openValues: Set<string>;
  toggle: (value: string) => void;
};

const AccordionContext = React.createContext<AccordionContextValue | null>(null);
const AccordionItemContext = React.createContext<{ value: string; open: boolean } | null>(null);

function useAccordionContext() {
  const ctx = React.useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion components must be used within <Accordion />");
  return ctx;
}

function useAccordionItemContext() {
  const ctx = React.useContext(AccordionItemContext);
  if (!ctx) throw new Error("Accordion child must be used within <AccordionItem />");
  return ctx;
}

export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
}

function toSet(value: string | string[] | undefined, type: AccordionType) {
  if (type === "single") return new Set(typeof value === "string" && value ? [value] : []);
  return new Set(Array.isArray(value) ? value : []);
}

function Accordion({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  className,
  ...props
}: AccordionProps) {
  const [internal, setInternal] = React.useState<Set<string>>(() => toSet(defaultValue, type));
  const openValues = React.useMemo(() => (value === undefined ? internal : toSet(value, type)), [internal, type, value]);

  const toggle = React.useCallback(
    (itemValue: string) => {
      const next = new Set(openValues);
      if (type === "single") {
        if (next.has(itemValue)) next.clear();
        else {
          next.clear();
          next.add(itemValue);
        }
      } else if (next.has(itemValue)) next.delete(itemValue);
      else next.add(itemValue);

      if (value === undefined) setInternal(next);
      if (onValueChange) onValueChange(type === "single" ? [...next][0] ?? "" : [...next]);
    },
    [onValueChange, openValues, type, value],
  );

  return (
    <AccordionContext.Provider value={{ type, openValues, toggle }}>
      <div className={cn("space-y-3", className)} {...props} />
    </AccordionContext.Provider>
  );
}

interface AccordionItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

function AccordionItem({ className, value, ...props }: AccordionItemProps) {
  const { openValues } = useAccordionContext();
  const open = openValues.has(value);
  return (
    <AccordionItemContext.Provider value={{ value, open }}>
      <div className={cn("editorial-frame overflow-hidden bg-surface/60", className)} data-state={open ? "open" : "closed"} {...props} />
    </AccordionItemContext.Provider>
  );
}

function AccordionTrigger({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { toggle } = useAccordionContext();
  const item = useAccordionItemContext();
  return (
    <button
      type="button"
      onClick={() => toggle(item.value)}
      aria-expanded={item.open}
      className={cn(
        "flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-secondary transition hover:bg-white/5 hover:text-text focus-ring",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <ChevronDown
        className={cn("h-4 w-4 shrink-0 text-muted transition duration-200", item.open && "rotate-180 text-copper")}
      />
    </button>
  );
}

function AccordionContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { open } = useAccordionItemContext();
  if (!open) return null;
  return (
    <div className={cn("border-t border-border/40 px-5 pb-5 pt-4 text-sm leading-6 text-muted", className)} {...props}>
      {children}
    </div>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
