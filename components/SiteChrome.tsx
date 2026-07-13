"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";

export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isChromeless =
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup";

  if (isChromeless) {
    return <>{children}</>;
  }

  // The dashboard keeps the top navbar (for Products/Logout) but drops the
  // marketing footer — it doesn't belong below account/purchase management.
  const hideFooter = pathname?.startsWith("/account");

  return (
    <>
      <Navbar />
      <main className="flex-1">{children}</main>
      {hideFooter ? null : <Footer />}
    </>
  );
}
