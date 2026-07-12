"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthlySalesPoint } from "@/services/orderService";

interface MonthlySalesChartProps {
  data: MonthlySalesPoint[];
}

export default function MonthlySalesChart({ data }: MonthlySalesChartProps) {
  const hasData = data.some((point) => point.total > 0);

  return (
    <div className="relative h-72 w-full">
      {!hasData ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-foreground/40">
          No sales data yet
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="monthlySalesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-brand-500)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--color-brand-500)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
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
          <Area
            type="monotone"
            dataKey="total"
            stroke="var(--color-brand-500)"
            strokeWidth={2}
            fill="url(#monthlySalesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
