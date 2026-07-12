"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProductSalesPoint } from "@/services/orderService";

interface ProductSalesChartProps {
  data: ProductSalesPoint[];
}

export default function ProductSalesChart({ data }: ProductSalesChartProps) {
  const hasData = data.length > 0;

  return (
    <div className="relative h-72 w-full">
      {!hasData ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-foreground/40">
          No product sales yet
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="title"
            stroke="var(--foreground)"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-15}
            textAnchor="end"
            height={50}
          />
          <YAxis
            stroke="var(--foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `$${value}`}
            width={48}
          />
          <Tooltip
            formatter={(value) => [`$${Number(value ?? 0)}`, "Revenue"]}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border-subtle)",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} fill="var(--color-accent-500)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
