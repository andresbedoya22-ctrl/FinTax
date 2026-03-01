"use client";

import * as React from "react";

import { FlowErrorState } from "@/components/fintax/flows/FlowErrorState";
import { captureAppError } from "@/lib/observability/client";

export interface FlowErrorBoundaryProps {
  error: Error;
  reset: () => void;
  flow: "admin" | "tax-return" | "benefits" | "dashboard" | "settings";
}

export function FlowErrorBoundary({ error, reset, flow }: FlowErrorBoundaryProps) {
  React.useEffect(() => {
    captureAppError(error, {
      action: `${flow}.render`,
      env: process.env.NODE_ENV,
    });
  }, [error, flow]);

  return <FlowErrorState flow={flow === "settings" ? "dashboard" : flow} error={error} onRetry={reset} />;
}
