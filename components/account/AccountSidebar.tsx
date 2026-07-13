"use client";

import { LogOut, Receipt, User } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";

const NAV_ITEMS = [
  { label: "Profile", href: "/account", icon: User },
  { label: "Purchases", href: "/account/purchases", icon: Receipt },
];

export default function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useCustomerAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-border-subtle bg-surface p-4 lg:w-60 lg:border-r lg:border-b-0 lg:p-6">
      <nav aria-label="Account" className="flex flex-row gap-1 lg:flex-col">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-coral/10 text-coral-dark"
                  : "text-foreground/70 hover:bg-surface-muted"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" aria-hidden="true" />
        Logout
      </button>
    </aside>
  );
}
