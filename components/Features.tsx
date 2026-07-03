"use client";

import { motion } from "framer-motion";
import {
  Headset,
  Lock,
  MailCheck,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "./ui/SectionHeading";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Zap,
    title: "Instant Delivery",
    description:
      "Get your files immediately after checkout — no waiting, no delays, ever.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description:
      "Every transaction is encrypted end-to-end and processed through trusted gateways.",
  },
  {
    icon: Star,
    title: "Verified Products",
    description:
      "Each listing is manually reviewed and verified for quality before it goes live.",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    description:
      "Hand-picked templates, source code, and assets built by professional creators.",
  },
  {
    icon: MailCheck,
    title: "Email Verification",
    description:
      "OTP-based email verification keeps every account and purchase protected.",
  },
  {
    icon: Headset,
    title: "24/7 Support",
    description:
      "Our support team is available around the clock to help with anything you need.",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const, delay: i * 0.08 },
  }),
};

export default function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why creators trust us"
          title="Everything you need to buy digital products with confidence"
          description="From checkout to download, every step is designed to be fast, safe, and effortless."
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={index}
                variants={cardVariants}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                whileHover={{ y: -6 }}
                className="group relative overflow-hidden rounded-2xl border border-border-subtle bg-surface p-7 shadow-sm transition-shadow hover:shadow-xl hover:shadow-brand-500/10"
              >
                <div className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-accent-500 transition-transform duration-300 group-hover:scale-x-100" />
                <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-md shadow-brand-500/20 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/65">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
