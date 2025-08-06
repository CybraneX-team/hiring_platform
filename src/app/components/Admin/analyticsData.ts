import type { AnalyticsData } from "@/app/types";
import { companies, activeRoles, applications } from "./mockData";

export const generateAnalyticsData = (): AnalyticsData => {
  const totalCompanies = companies.length;
  const totalRoles = activeRoles.length;
  const totalApplications = applications.length;
  const selectedCandidates = applications.filter(
    (app) => app.status === "selected"
  ).length;
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  ).length;

  return {
    totalCompanies,
    totalRoles,
    totalApplications,
    selectedCandidates,
    pendingApplications,
    documentsVerified: 12,
    documentsPending: 8,
    averageApplicationsPerRole: Math.round(totalApplications / totalRoles),
    topCompanies: companies
      .map((company) => ({
        name: company.name,
        applications: company.totalApplications,
        roles: company.activeRoles,
      }))
      .sort((a, b) => b.applications - a.applications)
      .slice(0, 5),
    rolesByDepartment: [
      { department: "Engineering", count: 8, percentage: 53 },
      { department: "Product", count: 3, percentage: 20 },
      { department: "Design", count: 2, percentage: 13 },
      { department: "Marketing", count: 2, percentage: 14 },
    ],
  };
};
