"use client";

import { motion } from "framer-motion";
import {
  Gem,
  Hammer,
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
    title: "Built to solve one frustration",
    description:
      "Every tool exists because a generic template or app didn't cut it — for us, or for someone who asked.",
  },
  {
    icon: Hammer,
    title: "Made to be used, not admired",
    description:
      "No 47-tab template you'll never finish setting up. Open it, plug in your numbers, done.",
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
    title: "Real replies",
    description:
      "Questions go to a real inbox, not a support ticket queue.",
  },
  {
    icon: Wallet,
    title: "Buy once, keep forever",
    description:
      "No subscriptions, no recurring fees. Pay once and the file is yours for good.",
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
          eyebrow="About Elicso"
          title="Built by people who got frustrated first"
          description="We make the tool we wished existed — then make it available in case you're stuck on the same problem."
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
                className="flex flex-col items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-8 text-center shadow-sm transition-shadow hover:shadow-xl hover:shadow-coral/10"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 ring-1 ring-coral/20">
                  <Icon
                    className="h-6 w-6 text-coral-dark"
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
