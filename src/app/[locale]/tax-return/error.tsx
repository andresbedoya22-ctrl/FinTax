"use client";

import { FlowErrorState } from "@/components/fintax/flows/FlowErrorState";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return <FlowErrorState flow="tax-return" error={error} onRetry={reset} />;
}
