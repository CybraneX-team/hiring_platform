"use client";

import type { Company } from "../../../types";
import CompanyCard from "../companyCards";

interface CompaniesViewProps {
  companies: Company[];
  onCompanySelect: (company: Company) => void;
}

export default function CompaniesView({
  companies,
  onCompanySelect,
}: CompaniesViewProps) {
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {companies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            index={index}
            onSelect={onCompanySelect}
          />
        ))}
      </div>
    </div>
  );
}
