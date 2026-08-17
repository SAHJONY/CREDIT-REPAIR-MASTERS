import "./globals.css";
import "./v6.css";
import "./ultra-premium.css";
import "./cinematic.css";
import "./cinematic-global.css";
import "./cinematic-everywhere.css";
import "./all-pages-cinematic-lock.css";
import "./reference-landing.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Repair Masters",
  description: "Secure credit improvement operating system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}