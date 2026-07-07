const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600",
  draft: "bg-amber-500/10 text-amber-600",
  pending: "bg-amber-500/10 text-amber-600",
  paid: "bg-blue-500/10 text-blue-600",
  fulfilled: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-600",
  refunded: "bg-foreground/10 text-foreground/60",
  unread: "bg-brand-500/10 text-brand-600",
  read: "bg-foreground/10 text-foreground/60",
  replied: "bg-emerald-500/10 text-emerald-600",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export default function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const styles = STATUS_STYLES[status] ?? "bg-surface-muted text-foreground/60";

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${styles} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {status}
    </span>
  );
}
