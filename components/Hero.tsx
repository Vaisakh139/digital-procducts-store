"use client";

import { motion } from "framer-motion";
import { ArrowRight, CreditCard, Download, ShieldCheck, Sparkles } from "lucide-react";
import Button from "./ui/Button";

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function scrollToFeatures() {
  document.getElementById("features")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative scroll-mt-20 overflow-hidden bg-gradient-to-b from-brand-50 via-background to-background dark:from-brand-100/40"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-blob"
          aria-hidden="true"
        />
        <motion.div
          className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-accent-400/25 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl animate-blob"
          style={{ animationDelay: "6s" }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,var(--border-subtle)_1px,transparent_0)] bg-size-[32px_32px] opacity-40"
          aria-hidden="true"
        />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 py-28 lg:grid-cols-2 lg:gap-12 lg:py-36 lg:px-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col items-start gap-6"
        >
          <motion.span
            variants={item}
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface/80 px-4 py-1.5 text-xs font-semibold text-brand-600 shadow-sm backdrop-blur-sm dark:text-brand-400"
          >
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Trusted Digital Marketplace
          </motion.span>

          <motion.h1
            variants={item}
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            Buy Premium Digital Products{" "}
            <span className="bg-gradient-to-r from-brand-500 to-accent-500 bg-clip-text text-transparent">
              Securely &amp; Instantly
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-lg leading-relaxed text-foreground/70"
          >
            Purchase premium templates, source code, UI kits, ebooks, digital
            assets and more with secure payments and instant delivery.
          </motion.p>

          <motion.div variants={item} className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              href="/products"
              variant="primary"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
            >
              Browse Products
            </Button>
            <Button variant="secondary" size="lg" onClick={scrollToFeatures}>
              Learn More
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto h-80 w-full max-w-md sm:h-96 lg:h-[26rem]"
        >
          <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-brand-500 to-accent-500 opacity-90 shadow-2xl shadow-brand-500/30" />

          <div className="absolute inset-0 rounded-[2rem] border border-white/20 bg-surface/70 shadow-xl backdrop-blur-xl">
            <div className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="h-24 w-full rounded-xl bg-gradient-to-br from-brand-100 to-accent-400/20" />
                <div className="h-3 w-3/4 rounded-full bg-foreground/10" />
                <div className="h-3 w-1/2 rounded-full bg-foreground/10" />
                <div className="mt-auto flex items-center justify-between rounded-xl bg-surface-muted p-3">
                  <div className="h-3 w-16 rounded-full bg-foreground/15" />
                  <div className="h-8 w-20 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                </div>
              </div>
            </div>
          </div>

          <motion.div
            className="absolute -top-6 -left-8 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-sm animate-float-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <ShieldCheck className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span className="text-sm font-medium">Secure Payment</span>
          </motion.div>

          <motion.div
            className="absolute top-1/3 -right-8 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-sm animate-float-slower"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <Download className="h-5 w-5 text-accent-500" aria-hidden="true" />
            <span className="text-sm font-medium">Instant Delivery</span>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 left-1/4 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-sm animate-float-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{ animationDelay: "1.5s" }}
          >
            <CreditCard className="h-5 w-5 text-brand-600 dark:text-brand-400" aria-hidden="true" />
            <span className="text-sm font-medium">Encrypted Checkout</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
