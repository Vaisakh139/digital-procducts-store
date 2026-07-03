"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface DashboardCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  accent?: string;
  index?: number;
}

export default function DashboardCard({
  label,
  value,
  icon: Icon,
  accent = "from-brand-500 to-accent-500",
  index = 0,
}: DashboardCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
      className="flex items-center gap-4 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
    >
      <span
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accent} text-white shadow-md`}
      >
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col">
        <span className="text-sm text-foreground/60">{label}</span>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
      </div>
    </motion.div>
  );
}
