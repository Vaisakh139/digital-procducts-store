"use client";

import { motion } from "framer-motion";
import { ArrowRight, Calculator, RefreshCw, Wallet } from "lucide-react";
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

function scrollToHowItWorks() {
  document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function Hero() {
  return (
    <section
      id="home"
      className="relative scroll-mt-20 overflow-hidden bg-cream"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-coral/20 blur-3xl animate-blob"
          aria-hidden="true"
        />
        <motion.div
          className="absolute top-1/3 -right-32 h-[28rem] w-[28rem] rounded-full bg-gold/20 blur-3xl animate-blob"
          style={{ animationDelay: "3s" }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-sage/15 blur-3xl animate-blob"
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
            className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-white px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-coral-dark shadow-sm"
          >
            Tools that fix real frustrations
          </motion.span>

          <motion.h1
            variants={item}
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            You didn&apos;t quit tracking.{" "}
            <span className="text-coral">Your tracker quit on you.</span>
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-lg leading-relaxed text-charcoal/70"
          >
            Free templates are static, the math is manual, and most trackers
            get abandoned by week two. Elicso builds budget, habit, and goal
            trackers that actually do the work — automatic calculations,
            visual feedback, built to last past month one.
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
            <Button variant="outline" size="lg" onClick={scrollToHowItWorks}>
              See how it works
            </Button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto h-80 w-full max-w-md sm:h-96 lg:h-[26rem]"
        >
          <div className="absolute inset-6 rounded-[2rem] bg-plum opacity-90 shadow-2xl shadow-plum/30" />

          <div className="absolute inset-0 rounded-[2rem] border border-white/20 bg-surface/70 shadow-xl backdrop-blur-xl">
            <div className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-coral" />
                <span className="h-2.5 w-2.5 rounded-full bg-gold" />
                <span className="h-2.5 w-2.5 rounded-full bg-sage" />
              </div>
              <div className="flex flex-1 flex-col gap-3">
                <div className="h-24 w-full rounded-xl bg-cream-dim" />
                <div className="h-3 w-3/4 rounded-full bg-foreground/10" />
                <div className="h-3 w-1/2 rounded-full bg-foreground/10" />
                <div className="mt-auto flex items-center justify-between rounded-xl bg-surface-muted p-3">
                  <div className="h-3 w-16 rounded-full bg-foreground/15" />
                  <div className="h-8 w-20 rounded-full bg-coral" />
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
            <Calculator className="h-5 w-5 text-coral-dark" aria-hidden="true" />
            <span className="text-sm font-medium">No manual math</span>
          </motion.div>

          <motion.div
            className="absolute top-1/3 -right-8 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-sm animate-float-slower"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <RefreshCw className="h-5 w-5 text-sage" aria-hidden="true" />
            <span className="text-sm font-medium">Still works in month two</span>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 left-1/4 flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface/90 px-4 py-3 shadow-lg backdrop-blur-sm animate-float-slow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            style={{ animationDelay: "1.5s" }}
          >
            <Wallet className="h-5 w-5 text-coral-dark" aria-hidden="true" />
            <span className="text-sm font-medium">Buy once, own it</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
