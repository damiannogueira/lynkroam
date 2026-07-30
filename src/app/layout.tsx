import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { GlobalNav } from "@/components/global-nav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lynkroam.vercel.app"),
  title: {
    default: "Lynkroam",
    template: "%s | Lynkroam",
  },
  description:
    "Lynkroam is a visual travel research workspace that helps travelers turn scattered travel links into organized trip decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <Link className="skip-link" href="#main-content">
          Skip to main content
        </Link>
        <header className="border-b border-border bg-surface/95 shadow-elevated">
          <div className="mx-auto flex w-full max-w-page flex-col gap-3 px-page-gutter py-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              className="w-fit rounded-control text-heading font-semibold tracking-[-0.03em] text-ink"
              href="/"
            >
              Lynkroam
            </Link>
            <GlobalNav />
          </div>
        </header>
        <main id="main-content" className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
