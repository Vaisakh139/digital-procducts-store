"use client";

import { motion } from "framer-motion";
import { Calculator, Infinity as InfinityIcon, MessageCircle, type LucideIcon } from "lucide-react";

interface TrustItem {
  icon: LucideIcon;
  label: string;
  description: string;
}

const TRUST_ITEMS: TrustItem[] = [
  {
    icon: InfinityIcon,
    label: "Buy once",
    description: "No subscriptions. Pay once and the file is yours for good.",
  },
  {
    icon: Calculator,
    label: "Zero manual math",
    description: "Every tracker calculates automatically — no formulas to fix yourself.",
  },
  {
    icon: MessageCircle,
    label: "Real replies",
    description: "Questions go to an actual inbox, not a support bot.",
  },
];

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

export default function TrustStrip() {
  return (
    <section className="bg-cream-dim py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          {TRUST_ITEMS.map((trustItem, index) => {
            const Icon = trustItem.icon;
            return (
              <motion.div
                key={trustItem.label}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                className="flex items-start gap-4"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-coral-dark shadow-sm">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs font-medium uppercase tracking-wider text-coral-dark">
                    {trustItem.label}
                  </span>
                  <p className="text-sm leading-relaxed text-charcoal/75">
                    {trustItem.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
