"use client";

import { Layers } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FacebookIcon,
  GithubIcon,
  InstagramIcon,
  LinkedinIcon,
  TwitterIcon,
} from "./icons/SocialIcons";

type ScrollLink = { label: string; type: "scroll"; id: string };
type RouteLink = { label: string; type: "route"; href: string };

const QUICK_LINKS: (ScrollLink | RouteLink)[] = [
  { label: "Home", type: "scroll", id: "home" },
  { label: "Products", type: "route", href: "/products" },
  { label: "About", type: "scroll", id: "about" },
  { label: "Contact", type: "scroll", id: "contact" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const SOCIAL_LINKS = [
  { label: "Twitter", icon: TwitterIcon, href: "https://twitter.com" },
  { label: "Facebook", icon: FacebookIcon, href: "https://facebook.com" },
  { label: "Instagram", icon: InstagramIcon, href: "https://instagram.com" },
  { label: "LinkedIn", icon: LinkedinIcon, href: "https://linkedin.com" },
  { label: "GitHub", icon: GithubIcon, href: "https://github.com" },
];

export default function Footer() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const year = new Date().getFullYear();

  const handleScrollClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    if (isHome) {
      event.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/30">
                <Layers className="h-5 w-5" aria-hidden="true" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Digiora</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-foreground/65">
              A premium marketplace for templates, source code, UI kits, and
              digital assets — secure payments, instant delivery.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border-subtle text-foreground/60 transition-colors hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  {link.type === "route" ? (
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/65 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      href={`/#${link.id}`}
                      onClick={(event) => handleScrollClick(event, link.id)}
                      className="text-sm text-foreground/65 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Legal</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-foreground/65 transition-colors hover:text-brand-600 dark:hover:text-brand-400"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold">Contact</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-foreground/65">
              <li>support@digiora.com</li>
              <li>+1 (555) 012-3456</li>
              <li>148 Market Street, San Francisco, CA 94105</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-border-subtle pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-foreground/55">
            © {year} Digiora. All rights reserved.
          </p>
          <p className="text-xs text-foreground/55">
            Built for creators who ship premium digital products.
          </p>
        </div>
      </div>
    </footer>
  );
}
