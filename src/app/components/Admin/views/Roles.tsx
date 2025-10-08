"use client";

import type { Company, Role } from "../../../types";
import RoleCard from "../RoleCards";

interface RolesViewProps {
  selectedCompany: Company;
  roles: Role[];
  onRoleSelect: (role: Role) => void;
  onPayoffUpdate?: (roleId: string, newPercentage: number) => void;
}

export default function RolesView({
  selectedCompany,
  roles,
  onRoleSelect,
  onPayoffUpdate,
}: RolesViewProps) {
  { console.log("roles", roles)}
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-medium text-black line-clamp-1">
            {selectedCompany.name}
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">Active Job Roles</p>
        </div>
        <div className="text-sm text-gray-500">{roles.length} active roles</div>
      </div>

      <div className="space-y-4">
        {roles.length === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-500">
            No roles found for this company.
          </div>
        ) : (
          roles.map((role, index) => (
            <RoleCard
              key={role.id}
              role={role}
              index={index}
              onSelect={onRoleSelect}
              onPayoffUpdate={onPayoffUpdate}
            />
          ))
        )}
      </div>
    </div>
  );
}
