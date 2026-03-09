import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SynapseForge ⚡ — We forge the AI stack so you don't have to.",
  description:
    "Deploy, manage, and scale AI instances with SynapseForge. From LLM integrations to custom agent deployment — we handle the stack.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
