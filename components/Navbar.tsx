"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Layers, LogIn, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLoginModal from "./AdminLoginModal";
import Button from "./ui/Button";

type ScrollLink = { label: string; type: "scroll"; id: string };
type RouteLink = { label: string; type: "route"; href: string };
type NavLink = ScrollLink | RouteLink;

const NAV_LINKS: NavLink[] = [
  { label: "Home", type: "scroll", id: "home" },
  { label: "Products", type: "route", href: "/products" },
  { label: "About", type: "scroll", id: "about" },
  { label: "Contact", type: "scroll", id: "contact" },
];

const OBSERVED_SECTION_IDS = [
  "home",
  "features",
  "how-it-works",
  "about",
  "testimonials",
  "faq",
  "contact",
];

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeId, setActiveId] = useState("home");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );

    OBSERVED_SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isHome]);

  useEffect(() => {
    if (isHome && window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) {
        requestAnimationFrame(() =>
          el.scrollIntoView({ behavior: "smooth", block: "start" }),
        );
      }
    }
  }, [isHome]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(id);
  };

  const handleScrollLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (isHome) {
      event.preventDefault();
      scrollToSection(id);
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-colors duration-300 ${
          isScrolled
            ? "border-b border-border-subtle bg-background/70 backdrop-blur-xl"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            onClick={(event) => handleScrollLinkClick(event, "home")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/30">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              Digiora
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((link) =>
              link.type === "route" ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.label}
                  href={`/#${link.id}`}
                  onClick={(event) => handleScrollLinkClick(event, link.id)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isHome && activeId === link.id
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            <Button
              variant="outline"
              size="md"
              icon={<LogIn className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setIsLoginOpen(true)}
            >
              Admin Login
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle text-foreground lg:hidden"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </nav>

        <AnimatePresence>
          {isMobileMenuOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden border-t border-border-subtle bg-background/95 backdrop-blur-xl lg:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {NAV_LINKS.map((link) =>
                  link.type === "route" ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-surface-muted"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      key={link.label}
                      href={`/#${link.id}`}
                      onClick={(event) => handleScrollLinkClick(event, link.id)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 hover:bg-surface-muted"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
                <Button
                  variant="primary"
                  size="md"
                  className="mt-2 w-full"
                  icon={<LogIn className="h-4 w-4" aria-hidden="true" />}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsLoginOpen(true);
                  }}
                >
                  Admin Login
                </Button>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </header>

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </>
  );
}
