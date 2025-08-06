"use client";

import {
  Building,
  Briefcase,
  Users,
  UserCheck,
  Clock,
  FileCheck,
  FileClock,
  BarChart3,
} from "lucide-react";
import type { AnalyticsData } from "@/app/types";
import AnalyticsCard from "../AnalyticsCard";
import TopCompaniesCard from "../TopCompanies";
import DepartmentBreakdownCard from "../DeptBreakdown";

interface AnalyticsViewProps {
  analyticsData: AnalyticsData;
}

export default function AnalyticsView({ analyticsData }: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-medium text-black">
          Analytics Dashboard
        </h1>
        <div className="text-sm text-gray-500">Real-time hiring insights</div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnalyticsCard
          title="Total Companies"
          value={analyticsData.totalCompanies}
          icon={Building}
          trend={{ value: 12, isPositive: true }}
          index={0}
        />
        <AnalyticsCard
          title="Active Roles"
          value={analyticsData.totalRoles}
          icon={Briefcase}
          trend={{ value: 8, isPositive: true }}
          index={1}
        />
        <AnalyticsCard
          title="Total Applications"
          value={analyticsData.totalApplications}
          icon={Users}
          trend={{ value: 15, isPositive: true }}
          index={2}
        />
        <AnalyticsCard
          title="Selected Candidates"
          value={analyticsData.selectedCandidates}
          icon={UserCheck}
          trend={{ value: 23, isPositive: true }}
          index={3}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <AnalyticsCard
          title="Pending Applications"
          value={analyticsData.pendingApplications}
          icon={Clock}
          index={4}
        />
        <AnalyticsCard
          title="Documents Verified"
          value={analyticsData.documentsVerified}
          icon={FileCheck}
          trend={{ value: 5, isPositive: true }}
          index={5}
        />
        <AnalyticsCard
          title="Documents Pending"
          value={analyticsData.documentsPending}
          icon={FileClock}
          index={6}
        />
        <AnalyticsCard
          title="Avg Applications/Role"
          value={analyticsData.averageApplicationsPerRole}
          icon={BarChart3}
          trend={{ value: 3, isPositive: true }}
          index={7}
        />
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopCompaniesCard topCompanies={analyticsData.topCompanies} />
        <DepartmentBreakdownCard
          departments={analyticsData.rolesByDepartment}
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black">Selection Rate</h3>
              <p className="text-2xl font-bold text-green-600">
                {Math.round(
                  (analyticsData.selectedCandidates /
                    analyticsData.totalApplications) *
                    100
                )}
                %
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {analyticsData.selectedCandidates} out of{" "}
            {analyticsData.totalApplications} applications selected
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black">Avg Roles/Company</h3>
              <p className="text-2xl font-bold text-blue-600">
                {Math.round(
                  analyticsData.totalRoles / analyticsData.totalCompanies
                )}
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Average number of open positions per company
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-black">Document Completion</h3>
              <p className="text-2xl font-bold text-purple-600">
                {Math.round(
                  (analyticsData.documentsVerified /
                    (analyticsData.documentsVerified +
                      analyticsData.documentsPending)) *
                    100
                )}
                %
              </p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Documents verified vs pending verification
          </p>
        </div>
      </div>
    </div>
  );
}
