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
import "./v9-cta-visibility.css";
import "./new850-8k.css";
import "./world-class-finance.css";
import "./responsive-hardening.css";
import "./new850-unified-polish.css";
import "./auth-premium.css";
import "./cinematic-v10.css";
import type { Metadata, Viewport } from "next";
import { ReferenceAppFrame } from "@/components/reference-app-frame";
import { GlobalLanguageSwitcher } from "@/components/global-language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalHomeButton } from "@/components/global-home-button";

// Production release marker: world-class financial design + imagery.
export const metadata: Metadata = {
  metadataBase: new URL("https://new850.com"),
  title: { default: "New850.com | Financial Readiness", template: "%s | New850.com" },
  description: "Measure financial readiness, identify controllable blockers, and build a documented plan before shopping for loans, vehicles, mortgages, or business funding.",
  applicationName: "New850 Financial Readiness",
  keywords: ["financial readiness", "approval preparation", "credit readiness", "mortgage readiness", "auto financing readiness", "business funding readiness"],
  openGraph: {
    type: "website",
    siteName: "New850.com",
    title: "Know what is holding you back. Apply better prepared.",
    description: "A measurable, compliance-first financial readiness platform for your next financing goal.",
    images: [{ url: "/cinematic/generated/human-home-readiness-v1.png", width: 1672, height: 941, alt: "Family reviewing a financial readiness plan together" }]
  },
  twitter: { card: "summary_large_image", title: "New850 Financial Readiness", description: "Prepare before you apply.", images: ["/cinematic/generated/human-home-readiness-v1.png"] },
  robots: { index: true, follow: true }
};

export const viewport: Viewport = { themeColor: "#02060b", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ReferenceAppFrame>{children}</ReferenceAppFrame>
        <ThemeToggle />
        <GlobalHomeButton />
        <GlobalLanguageSwitcher />
      </body>
    </html>
  );
}
