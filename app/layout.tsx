import "./globals.css";
import "./v6.css";
import "./ultra-premium.css";
import "./cinematic.css";
import "./cinematic-global.css";
import "./cinematic-everywhere.css";
import "./all-pages-cinematic-lock.css";
import "./reference-landing.css";
import "./reference-app-frame.css";
import type { Metadata } from "next";
import { ReferenceAppFrame } from "@/components/reference-app-frame";

export const metadata: Metadata = {
  title: "Credit Repair Masters",
  description: "Secure credit improvement operating system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><ReferenceAppFrame>{children}</ReferenceAppFrame></body>
    </html>
  );
}