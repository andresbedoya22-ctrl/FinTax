"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/cn";

type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type ToastContextValue = {
  toasts: ToastItem[];
  toast: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextValue | null>(null);

export interface ToastProviderProps {
  children: React.ReactNode;
  maxToasts?: number;
}

function ToastProvider({ children, maxToasts = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback(
    (nextToast: Omit<ToastItem, "id">) => {
      const id = crypto.randomUUID();
      const duration = nextToast.duration ?? 5000;
      setToasts((current) => [{ ...nextToast, id, duration }, ...current].slice(0, maxToasts));
      if (duration > 0) {
        window.setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss, maxToasts],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastViewport />
    </ToastContext.Provider>
  );
}

function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider />");
  return ctx;
}

function ToastViewport() {
  const ctx = React.useContext(ToastContext);
  if (!ctx || ctx.toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2.5">
      {ctx.toasts.map((toast) => (
        <ToastCard key={toast.id} item={toast} onDismiss={() => ctx.dismiss(toast.id)} />
      ))}
    </div>
  );
}

function ToastCard({ item, onDismiss }: { item: ToastItem; onDismiss: () => void }) {
  const toneClass =
    item.variant === "success"
      ? "border-green/35"
      : item.variant === "error"
        ? "border-error/35"
        : "border-copper/25";
  return (
    <div
      className={cn(
        "pointer-events-auto editorial-frame bg-mesh-subtle overflow-hidden p-4 shadow-floating",
        "animate-[fadeUp_220ms_ease-out]",
        toneClass,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-1 h-2 w-2 rounded-full",
            item.variant === "success" && "bg-green",
            item.variant === "error" && "bg-error",
            (!item.variant || item.variant === "default") && "bg-copper",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-text">{item.title}</p>
          {item.description ? <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p> : null}
          {item.actionLabel ? (
            <button
              type="button"
              onClick={item.onAction}
              className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-green transition hover:text-green-hover"
            >
              {item.actionLabel}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="focus-ring grid h-7 w-7 place-items-center rounded-full border border-border/60 bg-surface/65 text-muted transition hover:text-text"
          aria-label="Dismiss notification"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

export { ToastProvider, ToastViewport, useToast };
