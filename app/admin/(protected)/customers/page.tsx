import { Users } from "lucide-react";

export default function AdminCustomersPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border-subtle bg-surface px-6 py-20 text-center">
      <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-surface-muted">
        <Users className="h-8 w-8 text-foreground/40" aria-hidden="true" />
      </span>
      <h2 className="text-lg font-semibold">Customer insights coming soon</h2>
      <p className="max-w-sm text-sm text-foreground/60">
        Once checkout and orders are wired up, customer profiles, purchase
        history, and lifetime value will show up here automatically.
      </p>
    </div>
  );
}
