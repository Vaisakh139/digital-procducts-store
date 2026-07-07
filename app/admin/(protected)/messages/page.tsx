"use client";

import { Mail, Reply, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import { useMessages } from "@/hooks/useMessages";
import { deleteMessage, updateMessageStatus } from "@/services/messageService";
import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from "@/types/message";

export default function AdminMessagesPage() {
  const { messages, loading, error } = useMessages();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MessageStatus | "All">("All");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return messages.filter((message) => {
      const matchesSearch =
        !term ||
        message.name.toLowerCase().includes(term) ||
        message.email.toLowerCase().includes(term) ||
        message.message.toLowerCase().includes(term);
      const matchesStatus = statusFilter === "All" || message.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [messages, search, statusFilter]);

  const handleReply = (message: ContactMessage) => {
    const subject = encodeURIComponent("Re: Your message to Elicso");
    const body = encodeURIComponent(`Hi ${message.name},\n\n`);
    // Opens the user's mail client — an intentional imperative navigation,
    // not a render-time mutation.
    // eslint-disable-next-line react-hooks/immutability
    window.location.href = `mailto:${message.email}?subject=${subject}&body=${body}`;
    updateMessageStatus(message.id, "replied").catch(() => {});
  };

  const handleMarkRead = (message: ContactMessage) => {
    if (message.status !== "unread") return;
    updateMessageStatus(message.id, "read").catch(() => {});
  };

  const handleDelete = (id: string) => {
    deleteMessage(id).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search messages..."
          aria-label="Search messages"
          className="h-10 w-full rounded-full border border-border-subtle bg-surface px-4 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 sm:max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as MessageStatus | "All")}
          className="h-10 rounded-full border border-border-subtle bg-surface px-4 text-sm capitalize outline-none focus:border-brand-500"
        >
          <option value="All">All</option>
          {MESSAGE_STATUSES.map((status) => (
            <option key={status} value={status} className="capitalize">
              {status}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-surface-muted" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border-subtle bg-surface px-6 py-16 text-center">
          <Mail className="h-8 w-8 text-foreground/30" aria-hidden="true" />
          <p className="text-sm text-foreground/50">No messages found.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((message) => (
            <li
              key={message.id}
              onClick={() => handleMarkRead(message)}
              className="flex flex-col gap-3 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-semibold text-white">
                    {message.name.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{message.name}</p>
                    <p className="text-xs text-foreground/50">{message.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={message.status} />
                  <span className="text-xs text-foreground/40">
                    {message.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              <p className="text-sm leading-relaxed text-foreground/70">
                {message.message}
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleReply(message);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md"
                >
                  <Reply className="h-3.5 w-3.5" aria-hidden="true" />
                  Reply
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(message.id);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle px-4 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
