import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "iGaming LLM Gateway",
  description: "Unified LLM Node Orchestrator & Rate Management Panel",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
