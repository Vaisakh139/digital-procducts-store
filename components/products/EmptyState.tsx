"use client";

import { motion } from "framer-motion";
import { PackageSearch } from "lucide-react";
import Button from "@/components/ui/Button";

interface EmptyStateProps {
  title?: string;
  message?: string;
  onClearFilters?: () => void;
}

export default function EmptyState({
  title = "No Products Found",
  message = "We couldn't find any products matching your criteria. Try adjusting your search or filters.",
  onClearFilters,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border-subtle bg-surface px-6 py-20 text-center"
    >
      <span className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-surface-muted">
        <PackageSearch
          className="h-10 w-10 text-foreground/40"
          aria-hidden="true"
        />
      </span>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="max-w-sm text-sm leading-relaxed text-foreground/60">
        {message}
      </p>
      {onClearFilters ? (
        <Button variant="outline" size="md" onClick={onClearFilters}>
          Clear Filters
        </Button>
      ) : null}
    </motion.div>
  );
}
