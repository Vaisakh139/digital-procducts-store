"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import AdminLoginModal from "./AdminLoginModal";
import Image from "next/image";
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
  { label: "Products", type: "route", href: "/products" },
  { label: "How it works", type: "scroll", id: "how-it-works" },
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
  const [isLoginOpen, setIsLoginOpen] = useState(false);

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
    <footer className="bg-plum text-cream">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-[25px] w-48 items-center justify-center rounded-xl text-white">
                <Image
                  src="/logo1.svg"
                  alt="Logo"
                  width={200}
                  height={200}
                  className="object-contain"
                />
              </div>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-cream/65">
              Trackers, templates, and tiny tools built to fix specific
              everyday frustrations — not another generic productivity app.
            </p>
            <div className="flex items-center gap-2 pt-2">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-cream/20 text-cream/60 transition-colors hover:border-coral hover:text-coral"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream">Quick Links</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  {link.type === "route" ? (
                    <Link
                      href={link.href}
                      className="text-sm text-cream/65 transition-colors hover:text-coral"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <Link
                      href={`/#${link.id}`}
                      onClick={(event) => handleScrollClick(event, link.id)}
                      className="text-sm text-cream/65 transition-colors hover:text-coral"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream">Legal</h3>
            <ul className="mt-4 flex flex-col gap-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-cream/65 transition-colors hover:text-coral"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cream">Contact</h3>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-cream/65">
              <li>hello@elicso.com</li>
              <li>
                <button type="button" onClick={() => setIsLoginOpen(true)}>
                  Admin Login
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-cream/10 pt-8 sm:flex-row sm:justify-between">
          <p className="text-xs text-cream/55">
            © {year} Elicso. All rights reserved.
          </p>
          <p className="font-mono text-xs text-cream/55">
            Tools that fix specific everyday frustrations.
          </p>
        </div>
      </div>

      <AdminLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />
    </footer>
  );
}
