"use client";

import { FlowErrorBoundary } from "@/components/fintax/errors/FlowErrorBoundary";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <FlowErrorBoundary flow="dashboard" error={error} reset={reset} />;
}
