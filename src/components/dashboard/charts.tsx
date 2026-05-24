"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { currency } from "@/lib/utils";

const colors = ["#12B6FF", "#22C55E", "#F97316", "#8B5CF6", "#F43F5E", "#F43F5E"];

export function RevenueChart({ data }: { data: Array<{ name: string; sales: number; orders: number }> }) {
  return (
    <div className="glass-panel p-5">
      <div className="mb-5">
        <h3 className="font-display text-xl font-semibold">Revenue Momentum</h3>
        <p className="section-subtitle">Daily sales and order throughput across all business counters</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#12B6FF" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#12B6FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(148,163,184,0.16)" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `₹${Math.round(value / 1000)}k`} tickLine={false} axisLine={false} />
            <Tooltip formatter={(value: number) => currency(value)} />
            <Area type="monotone" dataKey="sales" stroke="#12B6FF" strokeWidth={3} fill="url(#salesFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function CategoryChart({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="glass-panel p-5">
      <div className="mb-5">
        <h3 className="font-display text-xl font-semibold">Business Mix</h3>
        <p className="section-subtitle">Category contribution across grocery, retail, food, and services</p>
      </div>
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={70} outerRadius={108} paddingAngle={5}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value}%`} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {data.map((item, index) => (
          <div key={item.name} className="rounded-2xl bg-slate-900/5 px-4 py-3 dark:bg-white/5">
            <div className="flex items-center justify-between text-sm">
              <span>{item.name}</span>
              <span style={{ color: colors[index % colors.length] }}>{item.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
