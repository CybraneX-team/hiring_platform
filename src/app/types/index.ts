export interface Company {
  id: number;
  name: string;
  logo: string;
  activeRoles: number;
  totalApplications: number;
  location: string;
  industry: string;
}

export interface Role {
  id: number;
  title: string;
  department: string;
  applications: number;
  salary: string;
  type: string;
  posted: string;
  status: string;
}

export interface Application {
  id: number;
  name: string;
  email: string;
  phone: string;
  experience: string;
  status: "selected" | "pending";
  appliedDate: string;
  avatar: string;
  location: string;
  currentRole: string;
}

export interface DocumentType {
  id: number;
  name: string;
  required: boolean;
}

export interface SubmittedDocument {
  id: number;
  name: string;
  status: "submitted" | "approved" | "rejected";
  file: string;
}

export interface AnalyticsData {
  totalCompanies: number;
  totalRoles: number;
  totalApplications: number;
  selectedCandidates: number;
  pendingApplications: number;
  documentsVerified: number;
  documentsPending: number;
  averageApplicationsPerRole: number;
  topCompanies: Array<{
    name: string;
    applications: number;
    roles: number;
  }>;
  rolesByDepartment: Array<{
    department: string;
    count: number;
    percentage: number;
  }>;
}

export type ViewType =
  | "companies"
  | "roles"
  | "applications"
  | "applicant-details"
  | "request-documents"
  | "document-verification"
  | "analytics";
