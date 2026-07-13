"use client";

import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import { getOptimizedImageUrl } from "@/lib/cloudinaryUrl";
import type { PurchaseLineItem } from "@/types/purchase";

interface PurchaseCardProps {
  purchase: PurchaseLineItem;
  onClick: () => void;
}

export default function PurchaseCard({ purchase, onClick }: PurchaseCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface text-left shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-surface-muted">
        {purchase.product.thumbnailUrl ? (
          <Image
            src={getOptimizedImageUrl(purchase.product.thumbnailUrl, { width: 480 })}
            alt={purchase.product.title}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-foreground/30">
            <ShoppingBag className="h-8 w-8" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold">{purchase.product.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-foreground/60">
          {purchase.product.description}
        </p>
        <div className="mt-2 flex items-center justify-between text-xs text-foreground/50">
          <span>{purchase.purchaseDate.toLocaleDateString()}</span>
          <span className="text-sm font-semibold text-brand-600">
            ${purchase.amountPaid.toFixed(2)}
          </span>
        </div>
      </div>
    </button>
  );
}
