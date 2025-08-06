"use client";

import type { Application, Role } from "../../../types";
import ApplicationCard from "../applicationCard";

interface ApplicationsViewProps {
  selectedRole: Role;
  applications: Application[];
  onApplicantSelect: (applicant: Application) => void;
}

export default function ApplicationsView({
  selectedRole,
  applications,
  onApplicantSelect,
}: ApplicationsViewProps) {
  const selectedApplications = applications.filter(
    (app) => app.status === "selected"
  );
  const pendingApplications = applications.filter(
    (app) => app.status === "pending"
  );
  const sortedApplications = [...selectedApplications, ...pendingApplications];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-black line-clamp-1">
            {selectedRole.title}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Applications</p>
        </div>
        <div className="text-sm text-gray-500">
          {applications.length} applications
        </div>
      </div>

      <div className="space-y-4">
        {sortedApplications.map((applicant, index) => (
          <ApplicationCard
            key={applicant.id}
            applicant={applicant}
            index={index}
            onSelect={onApplicantSelect}
          />
        ))}
      </div>
    </div>
  );
}
