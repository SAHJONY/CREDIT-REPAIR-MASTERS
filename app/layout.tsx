import "./globals.css";
import "./v6.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Credit Repair Masters OS",
  description: "Controlled autonomous credit improvement operating system"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}