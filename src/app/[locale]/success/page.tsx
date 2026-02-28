import { Suspense } from "react";
import type { Metadata } from "next";

import { StripeSuccessScreen } from "@/components/fintax/flows/StripeSuccessScreen";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function SuccessPage() {
  return (
    <Suspense fallback={null}>
      <StripeSuccessScreen />
    </Suspense>
  );
}
