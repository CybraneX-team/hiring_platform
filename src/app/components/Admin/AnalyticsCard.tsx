"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface AnalyticsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  index: number;
}

export default function AnalyticsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  index,
}: AnalyticsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,0.1)" }}
      className="bg-white rounded-xl p-4 sm:p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A]"
        >
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
        {trend && (
          <div
            className={`text-xs sm:text-sm font-medium ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "+" : ""}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </h3>
        <div className="text-2xl sm:text-3xl font-bold text-black">{value}</div>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-400">{subtitle}</p>
        )}
      </div>
    </motion.div>
  );
}
