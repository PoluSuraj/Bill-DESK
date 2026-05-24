"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { DashboardMetric } from "@/types";

const accentStyles = {
  brand: "from-brand-500/20 to-brand-100/20 text-brand-700 dark:text-brand-100",
  accent: "from-emerald-500/20 to-emerald-100/20 text-emerald-700 dark:text-emerald-100",
  warn: "from-orange-500/20 to-orange-100/20 text-orange-700 dark:text-orange-100"
};

export function StatCard({ metric, index }: { metric: DashboardMetric; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={cn(
        "glass-panel relative overflow-hidden p-5",
        "bg-gradient-to-br",
        accentStyles[metric.accent]
      )}
    >
      <div className="absolute right-4 top-4 rounded-full border border-white/30 bg-white/30 p-2 dark:bg-white/10">
        <ArrowUpRight className="h-4 w-4" />
      </div>
      <p className="text-sm font-medium opacity-80">{metric.label}</p>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight">{metric.value}</p>
      <p className="mt-2 text-sm opacity-80">{metric.delta}</p>
    </motion.div>
  );
}
