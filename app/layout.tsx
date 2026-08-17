import "./globals.css";
import "./v6.css";
import "./ultra-premium.css";
import "./cinematic.css";
import "./cinematic-global.css";
import "./cinematic-everywhere.css";
import "./all-pages-cinematic-lock.css";
import "./reference-landing.css";
import "./reference-app-frame.css";
import "./v7-global.css";
import "./v7-consistency.css";
import type { Metadata } from "next";
import { ReferenceAppFrame } from "@/components/reference-app-frame";
import { GlobalLanguageSwitcher } from "@/components/global-language-switcher";

export const metadata: Metadata = {
  title: "Credit Repair Masters",
  description: "Global secure credit intelligence and client operating platform"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReferenceAppFrame>{children}</ReferenceAppFrame>
        <GlobalLanguageSwitcher />
      </body>
    </html>
  );
}