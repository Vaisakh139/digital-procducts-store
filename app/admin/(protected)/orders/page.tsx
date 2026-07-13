"use client";

import { useState } from "react";
import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminOrders } from "@/hooks/useAdminOrders";
import { ORDER_STATUSES, type AdminOrder, type OrderStatus } from "@/types/adminOrder";

export default function AdminOrdersPage() {
  const { orders, loading, error } = useAdminOrders();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "All">("All");

  const filtered = orders.filter(
    (order) => statusFilter === "All" || order.status === statusFilter,
  );

  const columns: DataTableColumn<AdminOrder>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (order) => (
        <div className="flex flex-col">
          <span className="font-medium">{order.customer.name}</span>
          <span className="text-xs text-foreground/50">{order.customer.email}</span>
        </div>
      ),
    },
    {
      key: "products",
      header: "Products",
      render: (order) => (
        <span className="line-clamp-1 text-foreground/70">
          {order.items.map((item) => item.product.title).join(", ") || "—"}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (order) => <span className="font-medium">${order.amount.toFixed(2)}</span>,
    },
    {
      key: "paymentId",
      header: "Payment ID",
      render: (order) => (
        <span className="font-mono text-xs text-foreground/60">
          {order.payment?.razorpayPaymentId ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: "date",
      header: "Date",
      render: (order) => (
        <span className="text-foreground/70">{order.createdAt.toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-foreground/60">Track and review customer orders.</p>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <DataTable
        data={filtered}
        columns={columns}
        getRowId={(order) => order.id}
        isLoading={loading}
        searchPlaceholder="Search orders..."
        searchFn={(order, term) =>
          order.customer.name.toLowerCase().includes(term) ||
          order.customer.email.toLowerCase().includes(term) ||
          (order.payment?.razorpayPaymentId ?? "").toLowerCase().includes(term)
        }
        emptyMessage="No orders yet. Orders will appear here once checkout is implemented."
        filters={
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as OrderStatus | "All")}
            className="h-10 rounded-full border border-border-subtle bg-surface px-4 text-sm capitalize outline-none focus:border-brand-500"
          >
            <option value="All">All Statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status}
              </option>
            ))}
          </select>
        }
      />
    </div>
  );
}
