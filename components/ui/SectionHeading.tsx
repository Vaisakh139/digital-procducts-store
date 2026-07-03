"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className = "",
}: SectionHeadingProps) {
  const alignment =
    align === "center"
      ? "items-center text-center mx-auto"
      : "items-start text-left";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`flex max-w-2xl flex-col gap-4 ${alignment} ${className}`}
    >
      {eyebrow ? (
        <span className="inline-flex w-fit items-center rounded-full border border-border-subtle bg-surface-muted px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="text-base leading-relaxed text-foreground/70 sm:text-lg">
          {description}
        </p>
      ) : null}
    </motion.div>
  );
}
