"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Messages", href: "/admin/messages", icon: MessageSquare },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdminAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 items-center gap-2.5 px-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/30">
          <Layers className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="text-lg font-semibold tracking-tight">Digiora</span>
      </div>

      <nav aria-label="Admin" className="flex flex-1 flex-col gap-1 px-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-sm"
                  : "text-foreground/70 hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border-subtle p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
        >
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle bg-surface lg:block">
        {navContent}
      </aside>

      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              aria-hidden="true"
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-2xl lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close sidebar"
                className="absolute top-5 right-5 inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-surface-muted"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
              {navContent}
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
