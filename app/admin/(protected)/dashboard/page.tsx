"use client";

import { motion } from "framer-motion";
import { DollarSign, Package, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import DashboardCard from "@/components/admin/DashboardCard";
import MonthlySalesChart from "@/components/admin/charts/MonthlySalesChart";
import ProductSalesChart from "@/components/admin/charts/ProductSalesChart";
import StatusBadge from "@/components/admin/StatusBadge";
import { useAdminProducts } from "@/hooks/useAdminProducts";
import { useMessages } from "@/hooks/useMessages";
import { useOrders } from "@/hooks/useOrders";
import {
  getMonthlySales,
  getProductSales,
  getTotalRevenue,
} from "@/services/orderService";

export default function AdminDashboardPage() {
  const { products } = useAdminProducts();
  const { orders } = useOrders();
  const { messages } = useMessages();

  const revenue = getTotalRevenue(orders);
  const monthlySales = getMonthlySales(orders);
  const productSales = getProductSales(orders);

  const latestOrders = orders.slice(0, 5);
  const recentMessages = messages.slice(0, 5);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          label="Total Products"
          value={products.length.toString()}
          icon={Package}
          index={0}
        />
        <DashboardCard
          label="Orders"
          value={orders.length.toString()}
          icon={ShoppingCart}
          accent="from-accent-500 to-brand-600"
          index={1}
        />
        <DashboardCard
          label="Customers"
          value="Coming soon"
          icon={Users}
          accent="from-brand-400 to-brand-700"
          index={2}
        />
        <DashboardCard
          label="Revenue"
          value={`$${revenue.toFixed(2)}`}
          icon={DollarSign}
          accent="from-emerald-500 to-accent-500"
          index={3}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel title="Monthly Sales">
          <MonthlySalesChart data={monthlySales} />
        </Panel>
        <Panel title="Product Sales">
          <ProductSalesChart data={productSales} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Panel
          title="Latest Orders"
          className="lg:col-span-2"
          action={
            <Link
              href="/admin/orders"
              className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              View all
            </Link>
          }
        >
          {latestOrders.length === 0 ? (
            <EmptyPanelState message="No orders yet." />
          ) : (
            <ul className="flex flex-col divide-y divide-border-subtle">
              {latestOrders.map((order) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {order.customerName || order.customerEmail}
                    </span>
                    <span className="text-xs text-foreground/50">
                      {order.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      ${order.amount.toFixed(2)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title="Recent Messages"
          action={
            <Link
              href="/admin/messages"
              className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              View all
            </Link>
          }
        >
          {recentMessages.length === 0 ? (
            <EmptyPanelState message="No messages yet." />
          ) : (
            <ul className="flex flex-col divide-y divide-border-subtle">
              {recentMessages.map((message) => (
                <li key={message.id} className="flex flex-col gap-1 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{message.name}</span>
                    <StatusBadge status={message.status} />
                  </div>
                  <p className="line-clamp-1 text-xs text-foreground/60">
                    {message.message}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent Customers">
        <EmptyPanelState message="Customer insights are coming soon." />
      </Panel>
    </div>
  );
}

function Panel({
  title,
  action,
  className = "",
  children,
}: {
  title: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm ${className}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyPanelState({ message }: { message: string }) {
  return <p className="py-8 text-center text-sm text-foreground/50">{message}</p>;
}
