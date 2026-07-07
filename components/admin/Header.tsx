"use client";

import { Bell, LogOut, Menu } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useMessages } from "@/hooks/useMessages";

const PAGE_TITLES: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/messages": "Messages",
  "/admin/settings": "Settings",
};

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminProfile, logout } = useAdminAuth();
  const { messages } = useMessages();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = messages.filter((message) => message.status === "unread").length;
  const title = PAGE_TITLES[pathname ?? ""] ?? "Admin";

  useEffect(() => {
    if (!isProfileOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!profileRef.current?.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  return (
    <header className="sticky top-0 z-20 flex h-20 items-center justify-between gap-4 border-b border-border-subtle bg-background/80 px-6 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle transition-colors hover:bg-surface-muted lg:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
          onClick={() => router.push("/admin/messages")}
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle transition-colors hover:bg-surface-muted"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 ? (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen((open) => !open)}
            aria-expanded={isProfileOpen}
            className="flex items-center gap-2 rounded-full border border-border-subtle py-1 pr-3 pl-1 transition-colors hover:bg-surface-muted"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral text-xs font-semibold text-white">
              {(adminProfile?.name ?? "A").charAt(0).toUpperCase()}
            </span>
            <span className="hidden text-sm font-medium sm:block">
              {adminProfile?.name ?? "Admin"}
            </span>
          </button>

          {isProfileOpen ? (
            <div className="absolute top-full right-0 z-30 mt-2 w-52 rounded-2xl border border-border-subtle bg-surface p-2 shadow-xl">
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">
                  {adminProfile?.name ?? "Admin"}
                </p>
                <p className="truncate text-xs text-foreground/50">
                  {adminProfile?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-500/10"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
