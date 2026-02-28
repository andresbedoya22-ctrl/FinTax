"use client";

import { FlowErrorState } from "@/components/fintax/flows/FlowErrorState";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <FlowErrorState flow="benefits" error={error} onRetry={reset} />;
}
