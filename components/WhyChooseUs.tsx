"use client";

import { motion } from "framer-motion";
import {
  Gem,
  KeyRound,
  LifeBuoy,
  Rocket,
  ShieldCheck,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

interface Reason {
  icon: LucideIcon;
  title: string;
  description: string;
}

const REASONS: Reason[] = [
  {
    icon: Gem,
    title: "Premium Digital Products",
    description:
      "A curated catalog of high-quality templates, kits, and assets — nothing generic.",
  },
  {
    icon: KeyRound,
    title: "Secure OTP Verification",
    description:
      "Every account is protected with one-time password verification at sign up.",
  },
  {
    icon: Rocket,
    title: "Instant Access",
    description:
      "No waiting on approvals — your purchase unlocks the moment payment clears.",
  },
  {
    icon: ShieldCheck,
    title: "Encrypted Payments",
    description:
      "Bank-grade encryption keeps your card and billing details fully protected.",
  },
  {
    icon: LifeBuoy,
    title: "Professional Support",
    description:
      "A dedicated team ready to help before, during, and after every purchase.",
  },
  {
    icon: Wallet,
    title: "Money Safe Checkout",
    description:
      "Transparent pricing and a secure checkout flow with no hidden charges.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.07 },
  }),
};

export default function WhyChooseUs() {
  return (
    <section id="about" className="scroll-mt-20 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why choose us"
          title="Built for buyers who expect more"
          description="We combine premium curation with airtight security so every purchase feels effortless."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <motion.div
                key={reason.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-500/10"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand-50 to-accent-400/10 ring-1 ring-brand-500/20">
                  <Icon
                    className="h-6 w-6 text-brand-600 dark:text-brand-400"
                    aria-hidden="true"
                  />
                </span>
                <h3 className="text-lg font-semibold">{reason.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/65">
                  {reason.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
