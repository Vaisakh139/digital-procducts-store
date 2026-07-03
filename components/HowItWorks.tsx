"use client";

import { motion } from "framer-motion";
import {
  CreditCard,
  DownloadCloud,
  MailCheck,
  Search,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

interface Step {
  icon: LucideIcon;
  title: string;
  description: string;
}

const STEPS: Step[] = [
  {
    icon: Search,
    title: "Browse Products",
    description:
      "Explore templates, source code, UI kits, and ebooks curated from top creators.",
  },
  {
    icon: MailCheck,
    title: "Verify Email",
    description:
      "Confirm your email with a quick OTP to keep your account safe and secure.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description:
      "Checkout with confidence using encrypted, industry-standard payment processing.",
  },
  {
    icon: DownloadCloud,
    title: "Instant Download",
    description:
      "Access your purchase immediately from your dashboard — anytime, anywhere.",
  },
];

const stepVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.1 },
  }),
};

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 bg-surface-muted py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Simple process"
          title="How it works"
          description="From browsing to downloading, get your digital products in four simple steps."
        />

        <div className="relative mt-20">
          <div
            className="absolute top-8 right-0 left-0 hidden h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent lg:block"
            aria-hidden="true"
          />

          <ol className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.li
                  key={step.title}
                  custom={index}
                  variants={stepVariants}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: "-60px" }}
                  className="relative flex flex-col items-center gap-4 text-center lg:items-start lg:text-left"
                >
                  <div className="relative z-10">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-subtle bg-surface shadow-md">
                      <Icon
                        className="h-7 w-7 text-brand-600 dark:text-brand-400"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-semibold text-white shadow-sm">
                      {index + 1}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-foreground/65">
                    {step.description}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
