"use client";

import DataTable, { type DataTableColumn } from "@/components/admin/DataTable";
import { useAdminCustomers } from "@/hooks/useAdminCustomers";
import type { AdminCustomer } from "@/types/adminCustomer";

export default function AdminCustomersPage() {
  const { customers, loading, error } = useAdminCustomers();

  const columns: DataTableColumn<AdminCustomer>[] = [
    {
      key: "name",
      header: "Name",
      render: (customer) => <span className="font-medium">{customer.name}</span>,
    },
    {
      key: "email",
      header: "Email",
      render: (customer) => <span className="text-foreground/70">{customer.email}</span>,
    },
    {
      key: "phone",
      header: "Phone",
      render: (customer) => (
        <span className="text-foreground/70">{customer.phone ?? "—"}</span>
      ),
    },
    {
      key: "orders",
      header: "Orders",
      render: (customer) => (
        <span className="text-foreground/70">{customer._count.orders}</span>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (customer) => (
        <span className="text-foreground/70">{customer.createdAt.toLocaleDateString()}</span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-foreground/60">
        Everyone who has checked out or created an account.
      </p>

      {error ? (
        <p className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      ) : null}

      <DataTable
        data={customers}
        columns={columns}
        getRowId={(customer) => customer.id}
        isLoading={loading}
        searchPlaceholder="Search customers..."
        searchFn={(customer, term) =>
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term)
        }
        emptyMessage="No customers yet."
      />
    </div>
  );
}
