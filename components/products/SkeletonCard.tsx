export default function SkeletonCard() {
  return (
    <div
      className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-border-subtle bg-surface"
      aria-hidden="true"
    >
      <div className="aspect-video w-full bg-surface-muted" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="h-4 w-20 rounded-full bg-surface-muted" />
        <div className="h-5 w-3/4 rounded-full bg-surface-muted" />
        <div className="h-3 w-full rounded-full bg-surface-muted" />
        <div className="h-3 w-5/6 rounded-full bg-surface-muted" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="h-5 w-16 rounded-full bg-surface-muted" />
          <div className="h-4 w-12 rounded-full bg-surface-muted" />
        </div>
        <div className="flex gap-2 pt-1">
          <div className="h-9 flex-1 rounded-full bg-surface-muted" />
          <div className="h-9 flex-1 rounded-full bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
