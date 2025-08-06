"use client";

import { motion } from "framer-motion";
import { PieChart } from "lucide-react";
import type { AnalyticsData } from "@/app/types";

interface DepartmentBreakdownCardProps {
  departments: AnalyticsData["rolesByDepartment"];
}

export default function DepartmentBreakdownCard({
  departments,
}: DepartmentBreakdownCardProps) {
  const colors = ["#76FF82", "#3159AB", "#C5BCFF", "#FFB366"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-xl p-4 sm:p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A]"
        >
          <PieChart className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-black">
            Roles by Department
          </h3>
          <p className="text-sm text-gray-500">
            Distribution of open positions
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {departments.map((dept, index) => (
          <motion.div
            key={dept.department}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="font-medium text-black text-sm sm:text-base">
                  {dept.department}
                </span>
              </div>
              <div className="text-right">
                <span className="font-semibold text-black text-sm sm:text-base">
                  {dept.count}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({dept.percentage}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dept.percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="h-2 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
