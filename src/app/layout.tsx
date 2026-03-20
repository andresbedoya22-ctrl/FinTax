import type { Metadata } from "next";
import "./globals.css";

import { getConfiguredBaseUrl } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: getConfiguredBaseUrl() ?? new URL("http://localhost:3000"),
  title: {
    default: "FinTax",
    template: "%s",
  },
  description: "Structured tax and benefits support for international households in the Netherlands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-bg text-text antialiased">
        {children}
      </body>
    </html>
  );
}
