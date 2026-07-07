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
  { label: "Products", type: "route", href: "/products" },
  { label: "How it works", type: "scroll", id: "how-it-works" },
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
  const [activeId, setActiveId] = useState("home");

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
      <header className="sticky top-0 z-50 w-full bg-plum text-cream shadow-sm">
        <nav
          aria-label="Primary"
          className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8"
        >
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            onClick={(event) => handleScrollLinkClick(event, "home")}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-coral text-white shadow-md shadow-coral/30">
              <Layers className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-tight text-cream">
              Elicso
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
                      ? "text-coral"
                      : "text-cream/70 hover:text-cream"
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
                      ? "text-coral"
                      : "text-cream/70 hover:text-cream"
                  }`}
                >
                  {link.label}
                </Link>
              ),
            )}
          </div>

          {/* <div className="hidden items-center gap-3 lg:flex">
            <Button
              variant="primary"
              size="md"
              icon={<LogIn className="h-4 w-4" aria-hidden="true" />}
              onClick={() => setIsLoginOpen(true)}
            >
              Admin Login
            </Button>
          </div> */}

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cream/20 text-cream lg:hidden"
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
              className="overflow-hidden border-t border-cream/10 bg-plum lg:hidden"
            >
              <div className="flex flex-col gap-1 px-6 py-4">
                {NAV_LINKS.map((link) =>
                  link.type === "route" ? (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-cream/80 hover:bg-plum-light"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      key={link.label}
                      href={`/#${link.id}`}
                      onClick={(event) => handleScrollLinkClick(event, link.id)}
                      className="rounded-xl px-4 py-3 text-sm font-medium text-cream/80 hover:bg-plum-light"
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
