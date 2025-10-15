"use client";

import type { Company } from "../../../types";
import CompanyCard from "../companyCards";

interface CompaniesViewProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
  onCompanyDelete: (companyId: string) => void;
}

export default function CompaniesView({
  companies,
  onCompanySelect,
  onCompanyDelete,
}: CompaniesViewProps) {
  console.log("companies", companies)
  return (
    
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-medium text-black">
          Companies
        </h1>
        <div className="text-sm text-gray-500">
          {companies.length} companies
        </div>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white rounded-xl p-6 text-center text-sm text-gray-500">
          No companies found. Try adjusting your search or refresh the list.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {companies.map((company : any, index) => (
            <CompanyCard
              key={company.id}
              company={company}
              index={index}
              onSelect={onCompanySelect}
              onDelete={onCompanyDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
