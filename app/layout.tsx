import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import SiteChrome from "@/components/SiteChrome";
import { CustomerAuthProvider } from "@/contexts/CustomerAuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Elicso — Tools That Fix Specific Everyday Frustrations",
  description:
    "Elicso builds trackers, templates, and tiny tools that actually work — no manual math, no abandoned spreadsheets, no generic productivity fluff.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${spaceGrotesk.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ToastProvider>
          <CustomerAuthProvider>
            <SiteChrome>{children}</SiteChrome>
          </CustomerAuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
