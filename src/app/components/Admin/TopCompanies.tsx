"use client";

import { motion } from "framer-motion";
import { Building, Users, Briefcase } from "lucide-react";
import type { AnalyticsData } from "@/app/types";

interface TopCompaniesCardProps {
  topCompanies: AnalyticsData["topCompanies"];
}

export default function TopCompaniesCard({
  topCompanies,
}: TopCompaniesCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl p-4 sm:p-6"
    >
      <div className="flex items-center space-x-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="w-10 h-10 sm:w-12 sm:h-12 bg-[#C5BCFF] rounded-full flex items-center justify-center text-[#32343A]"
        >
          <Building className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-black">
            Top Companies
          </h3>
          <p className="text-sm text-gray-500">By total applications</p>
        </div>
      </div>

      <div className="space-y-4">
        {topCompanies.map((company, index) => (
          <motion.div
            key={company.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#76FF82] rounded-full flex items-center justify-center text-black font-medium text-sm">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-black text-sm sm:text-base line-clamp-1">
                  {company.name}
                </h4>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-3 h-3" />
                    <span>{company.roles} roles</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-black text-sm sm:text-base">
                {company.applications}
              </div>
              <div className="text-xs text-gray-500">applications</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
