import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinTax",
  description: "FinTax web app",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
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
