"use client";

import { useState } from "react";
import EmptyState from "@/components/products/EmptyState";
import SkeletonCard from "@/components/products/SkeletonCard";
import PurchaseCard from "@/components/account/PurchaseCard";
import PurchaseDetailModal from "@/components/account/PurchaseDetailModal";
import { useMyPurchases } from "@/hooks/useMyPurchases";
import { flattenPurchases, type PurchaseLineItem } from "@/types/purchase";

const SKELETON_COUNT = 6;

export default function PurchasesPage() {
  const { purchases, loading, error } = useMyPurchases();
  const [activePurchase, setActivePurchase] = useState<PurchaseLineItem | null>(null);

  const lineItems = flattenPurchases(purchases);

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-16 lg:px-8 lg:py-24">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Purchases</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Every tool you&apos;ve bought, in one place.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-600">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      ) : lineItems.length === 0 ? (
        <EmptyState
          title="No purchases yet"
          message="Once you buy a tool, it'll show up here with a download link."
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {lineItems.map((item) => (
            <PurchaseCard
              key={item.key}
              purchase={item}
              onClick={() => setActivePurchase(item)}
            />
          ))}
        </div>
      )}

      <PurchaseDetailModal purchase={activePurchase} onClose={() => setActivePurchase(null)} />
    </div>
  );
}
