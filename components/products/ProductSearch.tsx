"use client";

import { Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

const DEBOUNCE_MS = 250;

export default function ProductSearch({ value, onChange }: ProductSearchProps) {
  const [term, setTerm] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setTerm(value);
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (term !== value) onChange(term);
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  return (
    <div className="relative w-full">
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-foreground/40"
        aria-hidden="true"
      />
      <input
        type="text"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Search by title, description, or category..."
        aria-label="Search products"
        className="h-11 w-full rounded-full border border-border-subtle bg-surface pr-9 pl-10 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
      />
      {term ? (
        <button
          type="button"
          onClick={() => setTerm("")}
          aria-label="Clear search"
          className="absolute top-1/2 right-3 -translate-y-1/2 text-foreground/40 hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
