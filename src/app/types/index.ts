export interface Company {
  id: string;
  name: string;
  logo?: string;
  logoUrl?: string | null;
  activeRoles: number;
  totalApplications: number;
  location?: string;
  industry?: string;
  orgSize?: string;
  createdAt?: string | null;
}

export interface Role {
  id: string;
  title: string;
  department?: string;
  applications: number;
  salary: string;
  type: string;
  posted: string;
  status: string;
  experienceLevel?: string;
  location?: string;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  phone?: string;
  experience?: string;
  status: string;
  appliedDate: string;
  avatar?: string;
  location?: string;
  currentRole?: string;
  matchScore?: number;
}

export interface DocumentType {
  id: number;
  name: string;
  required: boolean;
}

export interface SubmittedDocument {
  id: number;
  name: string;
  status: "requested" | "submitted" | "approved" | "rejected";
  file?: string | null;
  fileUrl?: string | null;
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

export interface InspectItem {
  id: string;
  name: string;
  company?: string;
  no? :  string;
  status: "active" | "pending" | "completed";
  lastActivity?: string;
  role?: string;
  email?: string;
  location?: string;
  yearsOfExp?: string;
  matchScore?: number;
  profile ?: unknown;
}

export type ViewType =
  | "companies"
  | "roles"
  | "applications"
  | "applications-list"
  | "application-detail"
  | "applicant-details"
  | "request-documents"
  | "document-verification"
  | "analytics"
  | "inspect"
  | "inspect-detail";
