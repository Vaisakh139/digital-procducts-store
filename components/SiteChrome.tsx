"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin") ?? false;

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
