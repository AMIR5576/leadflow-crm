// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LeadFlow CRM — Mobile-First Lead Management",
  description:
    "Convert more leads into clients. Instant alerts, WhatsApp outreach, automated follow-ups — all from your phone.",
  keywords: "CRM, lead management, WhatsApp CRM, mobile CRM, sales automation",
  openGraph: {
    title: "LeadFlow CRM",
    description: "Mobile-first CRM for B2C sales professionals",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
