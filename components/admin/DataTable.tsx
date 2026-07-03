"use client";

import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId: (row: T) => string;
  searchPlaceholder?: string;
  searchFn?: (row: T, term: string) => boolean;
  filters?: ReactNode;
  pageSize?: number;
  emptyMessage?: string;
  isLoading?: boolean;
}

export default function DataTable<T>({
  data,
  columns,
  getRowId,
  searchPlaceholder = "Search...",
  searchFn,
  filters,
  pageSize = 10,
  emptyMessage = "No records found.",
  isLoading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim() || !searchFn) return data;
    const term = search.trim().toLowerCase();
    return data.filter((row) => searchFn(row, term));
  }, [data, search, searchFn]);

  const resetKey = `${search}|${filtered.length}`;
  const [syncedResetKey, setSyncedResetKey] = useState(resetKey);
  if (resetKey !== syncedResetKey) {
    setSyncedResetKey(resetKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {searchFn ? (
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground/40"
              aria-hidden="true"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-10 w-full rounded-full border border-border-subtle bg-surface pr-4 pl-9 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30"
            />
          </div>
        ) : (
          <div />
        )}
        {filters ? (
          <div className="flex flex-wrap items-center gap-2">{filters}</div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border-subtle">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-border-subtle bg-surface-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-xs font-semibold tracking-wide text-foreground/60 uppercase ${column.className ?? ""}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-4">
                      <div className="h-4 w-full max-w-[120px] animate-pulse rounded-full bg-surface-muted" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-12 text-center text-sm text-foreground/50"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="bg-surface transition-colors hover:bg-surface-muted/60"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-4 py-3 align-middle ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm text-foreground/60">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              disabled={page === totalPages}
              aria-label="Next page"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border-subtle transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
