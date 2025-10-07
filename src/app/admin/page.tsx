"use client";

import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  FormEvent,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import type {
  ViewType,
  Company,
  Role,
  Application,
  DocumentType,
  SubmittedDocument,
  AnalyticsData,
} from "../types";
import { toast } from "react-toastify";
import Header from "../components/Admin/Header";
import CompaniesView from "../components/Admin/views/CompaniesDetail";
import RolesView from "../components/Admin/views/Roles";
import ApplicationsView from "../components/Admin/views/ApplicationsDetail";
import ApplicantDetailsView from "../components/Admin/views/ApplicantsDetail";
import RequestDocumentsView from "../components/Admin/views/reqDoc";
import DocumentVerificationView from "../components/Admin/views/docVerification";
import AnalyticsView from "../components/Admin/views/AnalyticsView";
import InspectView from "../components/Admin/views/InspectView";
import Companyapplicants from "../components/Companyapplicants";

const FALLBACK_DOCUMENT_TYPES: DocumentType[] = [
  { id: 1, name: "Aadhar Card", required: true },
  { id: 2, name: "PAN Card", required: true },
  { id: 3, name: "Resume/CV", required: true },
  { id: 4, name: "Educational Certificates", required: false },
  { id: 5, name: "Experience Letters", required: false },
  { id: 6, name: "Portfolio/Work Samples", required: false },
];

export default function AdminPanel() {
  const [currentView, setCurrentView] = useState<ViewType>("companies");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<Application | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [documentTypesData, setDocumentTypesData] = useState<DocumentType[]>(
    FALLBACK_DOCUMENT_TYPES
  );
  const [submittedDocs, setSubmittedDocs] = useState<SubmittedDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentMutationLoading, setDocumentMutationLoading] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);
  const [analyticsInitialized, setAnalyticsInitialized] = useState(false);
  const [selectedInspectItem, setSelectedInspectItem] = useState<any>(null);
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState<string | null>(null);
  const [applicationsData, setApplicationsData] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [applicationsError, setApplicationsError] = useState<string | null>(
    null
  );
  const [adminPassword, setAdminPassword] = useState("");
  const [authPasswordInput, setAuthPasswordInput] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const bootstrapAttemptedRef = useRef(false);

  const normalizeDocuments = useCallback(
    (docs: any[]): SubmittedDocument[] =>
      docs.map((doc: any) => ({
        id: Number(doc.id),
        name: String(doc.name || `Document ${doc.id}`),
        status: (doc.status || "requested") as SubmittedDocument["status"],
        file: doc.file ?? null,
        fileUrl: doc.fileUrl ?? null,
      })),
    []
  );

  const fetchAnalytics = useCallback(
    async (passwordOverride?: string) => {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        setAnalyticsError("API base URL is not configured.");
        setAnalyticsLoading(false);
        throw new Error("API base URL is not configured.");
      }

      const passToUse = passwordOverride ?? adminPassword;
      if (!passToUse) {
        setAnalyticsError("Admin password not provided.");
        setAnalyticsLoading(false);
        throw new Error("Admin password not provided.");
      }

      try {
        const response = await fetch(`${baseUrl}/admin/analytics`, {
          headers: {
            "x-admin-password": passToUse,
          },
        });

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Unauthorized: invalid admin password"
              : `Failed to fetch analytics (status ${response.status})`
          );
        }

        const result = await response.json();
        if (result?.data) {
          setAnalyticsData(result.data as AnalyticsData);
        } else {
          setAnalyticsData(null);
        }
        return result?.data as AnalyticsData;
      } catch (error) {
        console.error("Failed to fetch analytics", error);
        setAnalyticsError(
          error instanceof Error ? error.message : "Failed to fetch analytics"
        );
        setAnalyticsData(null);
        throw error;
      } finally {
        setAnalyticsLoading(false);
        setAnalyticsInitialized(true);
      }
    }, [adminPassword]);

  const attemptAdminLogin = useCallback(
    async (password: string) => {
      setAuthLoading(true);
      setAuthError(null);
      try {
        await fetchAnalytics(password);
        setAdminPassword(password);
        setIsAdminAuthenticated(true);
        if (typeof window !== "undefined") {
          window.localStorage.setItem("adminPassword", password);
        }
        return true;
      } catch (error) {
        console.error("Admin authentication failed", error);
        setAuthError(
          error instanceof Error ? error.message : "Failed to authenticate"
        );
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("adminPassword");
        }
        return false;
      } finally {
        setAuthLoading(false);
      }
    },
    [fetchAnalytics]
  );

  const handleAdminLoginSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = authPasswordInput.trim();
      if (!trimmed) {
        setAuthError("Password is required.");
        return;
      }

      const success = await attemptAdminLogin(trimmed);
      if (success) {
        setAuthPasswordInput("");
      }
    },
    [authPasswordInput, attemptAdminLogin]
  );

  const fetchCompanies = useCallback(async () => {
    setCompaniesLoading(true);
    setCompaniesError(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      setCompaniesError("API base URL is not configured.");
      setCompaniesLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/company/`);

      if (!response.ok) {
        throw new Error(`Failed to fetch companies (status ${response.status})`);
      }

      const result = await response.json();
      const rawCompanies = Array.isArray(result?.data) ? result.data : [];

      const normalizedCompanies: Company[] = rawCompanies.map(
        (company: any, index: number) => {
          const name =
            typeof company?.name === "string" && company.name.trim().length > 0
              ? company.name.trim()
              : "Unnamed Company";

          const fallbackInitial = name.trim().charAt(0).toUpperCase() || "C";
          const logoValue =
            typeof company?.logo === "string" && company.logo.trim().length > 0
              ? company.logo.trim()
              : fallbackInitial;

          const identifier =
            company?.id ?? company?._id ?? `company-${index.toString()}`;

          return {
            id: String(identifier),
            name,
            logo: logoValue,
            logoUrl:
              typeof company?.logoUrl === "string" &&
              company.logoUrl.trim().length > 0
                ? company.logoUrl
                : null,
            activeRoles: Number.isFinite(company?.activeRoles)
              ? Number(company.activeRoles)
              : 0,
            totalApplications: Number.isFinite(company?.totalApplications)
              ? Number(company.totalApplications)
              : 0,
            location:
              typeof company?.location === "string"
                ? company.location
                : "",
            industry:
              typeof company?.industry === "string"
                ? company.industry
                : "",
            orgSize:
              typeof company?.orgSize === "string" ? company.orgSize : "",
            createdAt: company?.createdAt
              ? String(company.createdAt)
              : null,
          };
        }
      );

      setCompaniesData(normalizedCompanies);
    } catch (error) {
      console.error("Failed to fetch companies", error);
      setCompaniesError(
        error instanceof Error ? error.message : "Failed to fetch companies"
      );
      setCompaniesData([]);
    } finally {
      setCompaniesLoading(false);
    }
  }, []);

  const formatRelative = useCallback((dateInput: string) => {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) return "Unknown";

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 0) return "In the future";

    const seconds = Math.floor(diffMs / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return days === 1 ? "1 day ago" : `${days} days ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return months === 1 ? "1 month ago" : `${months} months ago`;
    const years = Math.floor(days / 365);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  }, []);

  const requestedDocIds = useMemo(
    () =>
      submittedDocs
        .filter((doc) => doc.status === "requested")
        .map((doc) => doc.id),
    [submittedDocs]
  );

  const fetchDocumentTypes = useCallback(async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      setDocumentsError("API base URL is not configured.");
      setDocumentTypesData(FALLBACK_DOCUMENT_TYPES);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/application/document-types`);
      if (!response.ok) {
        throw new Error(`Failed to fetch document types (status ${response.status})`);
      }

      const result = await response.json();
      const types = Array.isArray(result?.data) ? result.data : [];
      setDocumentTypesData(
        types.length > 0
          ? types.map((type: any) => ({
              id: Number(type.id),
              name: String(type.name || "Document"),
              required: Boolean(type.required),
            }))
          : FALLBACK_DOCUMENT_TYPES
      );
      setDocumentsError(null);
    } catch (error) {
      console.error("Failed to fetch document types", error);
      setDocumentsError(
        error instanceof Error ? error.message : "Failed to fetch document types"
      );
      setDocumentTypesData(FALLBACK_DOCUMENT_TYPES);
    }
  }, []);

  const fetchApplicationDocuments = useCallback(
    async (applicationId: string) => {
      setDocumentsLoading(true);
      setDocumentsError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        setDocumentsError("API base URL is not configured.");
        setDocumentsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/application/${applicationId}/documents`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch application documents (status ${response.status})`
          );
        }

        const result = await response.json();
        const rawDocuments = Array.isArray(result?.data?.documents)
          ? result.data.documents
          : [];

        setSubmittedDocs(normalizeDocuments(rawDocuments));
      } catch (error) {
        console.error("Failed to fetch application documents", error);
        setDocumentsError(
          error instanceof Error
            ? error.message
            : "Failed to fetch application documents"
        );
        setSubmittedDocs([]);
      } finally {
        setDocumentsLoading(false);
      }
    },
    [formatRelative, normalizeDocuments]
  );

  const fetchRoles = useCallback(async (companyId: string) => {
    setRolesLoading(true);
    setRolesError(null);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    if (!baseUrl) {
      setRolesError("API base URL is not configured.");
      setRolesLoading(false);
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/company/${companyId}/jobs`);

      if (!response.ok) {
        throw new Error(`Failed to fetch roles (status ${response.status})`);
      }

      const result = await response.json();
      try {
        // eslint-disable-next-line no-console
        console.log("[Admin][fetchRoles] API result:", result);
      } catch {}
      const rawRoles = Array.isArray(result?.roles)
        ? result.roles
        : Array.isArray(result?.data?.roles)
        ? result.data.roles
        : [];
      try {
        // eslint-disable-next-line no-console
        console.log("[Admin][fetchRoles] rawRoles (count):", rawRoles.length, rawRoles[0]);
      } catch {}

      const normalizedRoles: Role[] = rawRoles.map((role: any, index: number) => {
        const title =
          typeof role?.title === "string" && role.title.trim().length > 0
            ? role.title.trim()
            : "Untitled Role";

        const identifier =
          role?.id ?? role?._id ?? `role-${companyId}-${index.toString()}`;

        const mapped: Role = {
          id: String(identifier),
          title,
          department:
            typeof role?.department === "string" ? role.department : undefined,
          applications: Number.isFinite(role?.applications)
            ? Number(role.applications)
            : 0,
          salary:
            typeof role?.salary === "string" && role.salary.trim().length > 0
              ? role.salary
              : "Not disclosed",
          type:
            typeof role?.type === "string" && role.type.trim().length > 0
              ? role.type
              : "Unknown",
          payRangeType: typeof role?.payRangeType === "string" ? role.payRangeType : undefined,
          posted:
            typeof role?.posted === "string" && role.posted.trim().length > 0
              ? role.posted
              : "Unknown",
          status:
            typeof role?.status === "string" && role.status.trim().length > 0
              ? role.status
              : "Unknown",
          experienceLevel:
            typeof role?.experienceLevel === "string"
              ? role.experienceLevel
              : undefined,
          location:
            typeof role?.location === "string" ? role.location : undefined,
        };
        try {
          // eslint-disable-next-line no-console
          console.log("[Admin][fetchRoles] mapped role snapshot:", {
            id: mapped.id,
            title: mapped.title,
            salary: mapped.salary,
            type: mapped.type,
            payRangeType: role?.payRangeType,
          });
        } catch {}
        return mapped;
      });

      setRolesData(normalizedRoles);
    } catch (error) {
      console.error("Failed to fetch roles", error);
      setRolesError(
        error instanceof Error ? error.message : "Failed to fetch roles"
      );
      setRolesData([]);
    } finally {
      setRolesLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(
    async (jobId: string) => {
      setApplicationsLoading(true);
      setApplicationsError(null);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        setApplicationsError("API base URL is not configured.");
        setApplicationsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}/application/job/${jobId}?limit=100&sortBy=appliedDate&sortOrder=desc`
        );

        if (!response.ok) {
          throw new Error(
            `Failed to fetch job applications (status ${response.status})`
          );
        }

        const result = await response.json();
        const rawApplications = Array.isArray(result?.data?.applications)
          ? result.data.applications
          : Array.isArray(result?.applications)
          ? result.applications
          : [];

        const normalizedApplications: Application[] = rawApplications.map(
          (app: any, index: number) => {
            const profile = app?.profile ?? {};
            const applicantInfo = app?.applicant ?? {};
            const appliedDateSource =
              app?.appliedDate ?? app?.createdAt ?? new Date().toISOString();
            const appliedDateString =
              typeof appliedDateSource === "string"
                ? appliedDateSource
                : new Date(appliedDateSource).toISOString();

            const yearsOfExpRaw =
              profile?.yearsOfExp ?? profile?.experience ?? app?.yearsOfExp;

            const experienceLabel =
              typeof yearsOfExpRaw === "number"
                ? `${yearsOfExpRaw} years`
                : typeof yearsOfExpRaw === "string" &&
                  yearsOfExpRaw.trim().length > 0
                ? yearsOfExpRaw
                : undefined;

            const matchScoreRaw =
              typeof app?.matchScore === "number"
                ? app.matchScore
                : typeof app?.matchDetails?.overallScore === "number"
                ? app.matchDetails.overallScore
                : undefined;

            return {
              id: String(app?._id ?? app?.id ?? applicantInfo?._id ?? index),
              name:
                typeof applicantInfo?.name === "string" &&
                applicantInfo.name.trim().length > 0
                  ? applicantInfo.name
                  : typeof profile?.name === "string" &&
                    profile.name.trim().length > 0
                  ? profile.name
                  : `Applicant ${index + 1}`,
              email:
                typeof applicantInfo?.email === "string"
                  ? applicantInfo.email
                  : typeof profile?.user?.email === "string"
                  ? profile.user.email
                  : "",
              phone:
                (profile?.contactNumber ||
                  profile?.phoneNumber ||
                  profile?.phone ||
                  "") as string,
              experience: experienceLabel,
              status:
                typeof app?.status === "string" ? app.status : "pending",
              appliedDate: formatRelative(appliedDateString),
              avatar:
                (profile?.avatar ||
                  profile?.profilePicture ||
                  applicantInfo?.name?.charAt(0)?.toUpperCase() ||
                  profile?.name?.charAt(0)?.toUpperCase()) ?? undefined,
              location:
                (profile?.location ||
                  applicantInfo?.location ||
                  app?.job?.location ||
                  "") as string,
              currentRole:
                (profile?.WorkExperience?.[0]?.title ||
                  profile?.currentRole ||
                  app?.job?.title) ?? undefined,
              matchScore:
                typeof matchScoreRaw === "number"
                  ? Math.round(matchScoreRaw)
                  : undefined,
            };
          }
        );

        setApplicationsData(normalizedApplications);
      } catch (error) {
        console.error("Failed to fetch applications", error);
        setApplicationsError(
          error instanceof Error
            ? error.message
            : "Failed to fetch applications"
        );
        setApplicationsData([]);
      } finally {
        setApplicationsLoading(false);
      }
    },
    [formatRelative]
  );

  const handleCompanySelect = useCallback((company: Company) => {
    setSelectedCompany(company);
    setCurrentView("roles");
    setSelectedRole(null);
    setRolesData([]);
    setApplicationsData([]);
    setSelectedApplicant(null);
    setSelectedApplicantId(null);
    setSubmittedDocs([]);
    setSelectedDocs([]);
    setDocumentsError(null);
  }, []);

  const handleCompanyDelete = useCallback(async (companyId: string) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const deleteUrl = `${baseUrl}/company/delete/${companyId}`;
      console.log('Attempting to delete company:', { companyId, baseUrl, deleteUrl });
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Delete response:', result);

      // Remove the company from the local state
      setCompaniesData(prev => prev.filter(company => company.id !== companyId));
      
      // If the deleted company was selected, reset the selection
      if (selectedCompany?.id === companyId) {
        setSelectedCompany(null);
        setCurrentView("companies");
        setSelectedRole(null);
        setRolesData([]);
        setApplicationsData([]);
        setSelectedApplicant(null);
        setSelectedApplicantId(null);
        setSubmittedDocs([]);
        setSelectedDocs([]);
        setDocumentsError(null);
      }

      toast.success('Company deleted successfully');
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete company. Please try again.';
      toast.error(errorMessage);
    }
  }, [selectedCompany]);

  const handleRoleSelect = useCallback((role: Role) => {
    setSelectedRole(role);
    setCurrentView("applications");
    setApplicationsData([]);
    setSelectedApplicant(null);
    setSelectedApplicantId(null);
    setSubmittedDocs([]);
    setSelectedDocs([]);
  }, []);

  const handleApplicantSelect = useCallback(
    (applicant: Application) => {
      setSelectedApplicant(applicant);
      setSelectedApplicantId(applicant.id);
      setCurrentView("applicant-details");
      setSelectedDocs([]);
      setDocumentsError(null);
    },
    []
  );

  const handleToggleDoc = useCallback((docId: number) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  }, []);

  const handleSendDocumentRequest = useCallback(
    async (docIds: number[]) => {
      if (!selectedApplicantId) {
        toast.error("No applicant selected.");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        toast.error("API base URL is not configured.");
        return;
      }

      setDocumentMutationLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/application/${selectedApplicantId}/request-documents`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ docIds }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to request documents (status ${response.status})`
          );
        }

        const result = await response.json();
        if (Array.isArray(result?.data?.documents)) {
          setSubmittedDocs(normalizeDocuments(result.data.documents));
        } else {
          await fetchApplicationDocuments(selectedApplicantId);
        }

        setSelectedDocs([]);
        toast.success("Document request sent successfully.");
        setCurrentView("applicant-details");
      } catch (error) {
        console.error("Failed to request documents", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to request documents"
        );
      } finally {
        setDocumentMutationLoading(false);
      }
    },
    [
      selectedApplicantId,
      normalizeDocuments,
      fetchApplicationDocuments,
    ]
  );

  const handleDocumentApproval = useCallback(
    async (docId: number, approved: boolean) => {
      if (!selectedApplicantId) {
        toast.error("No applicant selected.");
        return;
      }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!baseUrl) {
        toast.error("API base URL is not configured.");
        return;
      }

      setDocumentMutationLoading(true);
      try {
        const response = await fetch(
          `${baseUrl}/application/${selectedApplicantId}/documents/${docId}/status`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: approved ? "approved" : "rejected",
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `Failed to update document status (status ${response.status})`
          );
        }

        const result = await response.json();
        if (Array.isArray(result?.data?.documents)) {
          setSubmittedDocs(normalizeDocuments(result.data.documents));
        } else {
          await fetchApplicationDocuments(selectedApplicantId);
        }

        toast.success(
          approved
            ? "Document approved successfully."
            : "Document rejected."
        );
      } catch (error) {
        console.error("Failed to update document status", error);
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to update document status"
        );
      } finally {
        setDocumentMutationLoading(false);
      }
    },
    [
      selectedApplicantId,
      normalizeDocuments,
      fetchApplicationDocuments,
    ]
  );

  const handleVerificationDone = useCallback(() => {
    setCurrentView("applicant-details");
  }, []);

  const handleNavigate = useCallback((view: ViewType) => {
    // Clear search when switching to analytics (where search is disabled)
    if (view === "analytics") {
      setSearchQuery("");
      setCurrentView("analytics");
      return;
    }

    if (view === "companies") {
      setCurrentView("companies");
      return;
    }

    if (view === "inspect") {
      setCurrentView("inspect");
    }
  }, []);

  const handleBack = useCallback(() => {
    switch (currentView) {
      case "roles":
        setCurrentView("companies");
        setSelectedCompany(null);
        setRolesData([]);
        break;
      case "applications":
      case "applications-list":
        setCurrentView("roles");
        setSelectedRole(null);
        setApplicationsData([]);
        break;
      case "applicant-details":
      case "application-detail":
      case "request-documents":
      case "document-verification":
        setCurrentView("applications");
        setSelectedApplicant(null);
        setSelectedApplicantId(null);
        setSubmittedDocs([]);
        setSelectedDocs([]);
        break;
      case "analytics":
        setCurrentView(selectedCompany ? "roles" : "companies");
        break;
      case "inspect-detail":
        setCurrentView("inspect");
        setSelectedInspectItem(null);
        break;
      default:
        setCurrentView("companies");
    }
  }, [currentView, selectedCompany]);

  const handleInspectItemSelect = useCallback((profile: unknown) => {
    setSelectedInspectItem(profile);
    setCurrentView("inspect-detail");
  }, []);

  const handleRetryAnalytics = useCallback(() => {
    if (analyticsLoading) {
      return;
    }
    setAnalyticsInitialized(false);
    fetchAnalytics().catch((error) => {
      console.error("Retry analytics failed", error);
    });
  }, [analyticsLoading, fetchAnalytics]);

  const filteredCompanies = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return companiesData;
    }

    return companiesData.filter((company) => {
      const haystack = [company.name, company.industry, company.location]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.toLowerCase());
      return haystack.some((value) => value.includes(query));
    });
  }, [companiesData, searchQuery]);

  const filteredRoles = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return rolesData;
    }

    return rolesData.filter((role) => {
      const title = role.title.toLowerCase();
      const department = role.department?.toLowerCase() ?? "";
      const location = role.location?.toLowerCase() ?? "";
      return (
        title.includes(query) ||
        department.includes(query) ||
        location.includes(query)
      );
    });
  }, [rolesData, searchQuery]);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return applicationsData;
    }

    return applicationsData.filter((application) => {
      const name = application.name.toLowerCase();
      const email = application.email.toLowerCase();
      const role = application.currentRole?.toLowerCase() ?? "";
      return name.includes(query) || email.includes(query) || role.includes(query);
    });
  }, [applicationsData, searchQuery]);

  useEffect(() => {
    fetchCompanies();
    fetchDocumentTypes();
  }, [fetchCompanies, fetchDocumentTypes]);

  useEffect(() => {
    if (selectedCompany) {
      fetchRoles(selectedCompany.id);
    }
  }, [selectedCompany, fetchRoles]);

  useEffect(() => {
    if (selectedRole) {
      fetchApplications(selectedRole.id);
    }
  }, [selectedRole, fetchApplications]);

  useEffect(() => {
    if (selectedApplicantId) {
      fetchApplicationDocuments(selectedApplicantId);
    } else {
      setSubmittedDocs([]);
    }
  }, [selectedApplicantId, fetchApplicationDocuments]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (bootstrapAttemptedRef.current) {
      return;
    }

    const storedPassword = window.localStorage.getItem("adminPassword");
    if (!storedPassword) {
      bootstrapAttemptedRef.current = true;
      return;
    }

    const bootstrapAuth = async () => {
      bootstrapAttemptedRef.current = true;
      try {
        setAuthLoading(true);
        await fetchAnalytics(storedPassword);
        setAdminPassword(storedPassword);
        setIsAdminAuthenticated(true);
      } catch (error) {
        console.error("Stored admin password invalid", error);
        window.localStorage.removeItem("adminPassword");
      } finally {
        setAuthLoading(false);
      }
    };

    bootstrapAuth();
  }, [fetchAnalytics]);

  useEffect(() => {
    if (
      currentView === "analytics" &&
      isAdminAuthenticated &&
      !analyticsLoading &&
      (!analyticsInitialized || !analyticsData)
    ) {
      fetchAnalytics().catch((error) => {
        console.error("Failed to load analytics", error);
      });
    }
  }, [
    currentView,
    isAdminAuthenticated,
    analyticsLoading,
    analyticsInitialized,
    analyticsData,
    fetchAnalytics,
  ]);

  const renderContent = () => {
    switch (currentView) {
      case "roles":
        if (!selectedCompany) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Select a company to view its active roles.
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {rolesError && (
              <div className="bg-white border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                {rolesError}
              </div>
            )}
            {rolesLoading ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                Loading roles...
              </div>
            ) : (
              <RolesView
                selectedCompany={selectedCompany}
                roles={filteredRoles}
                onRoleSelect={handleRoleSelect}
              />
            )}
          </div>
        );

      case "applications":
      case "applications-list":
        if (!selectedRole) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Select a role to view applications.
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {applicationsError && (
              <div className="bg-white border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                {applicationsError}
              </div>
            )}
            {applicationsLoading ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                Loading applications...
              </div>
            ) : (
              <ApplicationsView
                selectedRole={selectedRole}
                applications={filteredApplications}
                onApplicantSelect={handleApplicantSelect}
              />
            )}
          </div>
        );

      case "applicant-details":
      case "application-detail":
        if (!selectedApplicant || !selectedRole) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Select an applicant to view their details.
            </div>
          );
        }

        return (
          <ApplicantDetailsView
            selectedApplicant={selectedApplicant}
            selectedRole={selectedRole}
            requestedDocs={requestedDocIds}
            documentTypes={documentTypesData}
            onRequestDocuments={() => setCurrentView("request-documents")}
            onDocumentVerification={() =>
              setCurrentView("document-verification")
            }
          />
        );

      case "request-documents":
        if (!selectedApplicant) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Select an applicant before requesting documents.
            </div>
          );
        }

        return (
          <RequestDocumentsView
            selectedApplicant={selectedApplicant}
            documentTypes={documentTypesData}
            selectedDocs={selectedDocs}
            existingDocs={submittedDocs}
            onToggleDoc={handleToggleDoc}
            onCancel={() => setCurrentView("applicant-details")}
            onSendRequest={handleSendDocumentRequest}
            isSubmitting={documentMutationLoading}
          />
        );

      case "document-verification":
        if (!selectedApplicant) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Select an applicant before verifying documents.
            </div>
          );
        }

        return (
          <div className="space-y-4">
            {documentsError && (
              <div className="bg-white border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                {documentsError}
              </div>
            )}
            {documentsLoading ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                Loading documents...
              </div>
            ) : (
              <DocumentVerificationView
                selectedApplicant={selectedApplicant}
                submittedDocs={submittedDocs}
                onDocumentApproval={handleDocumentApproval}
                onDone={handleVerificationDone}
                isUpdating={documentMutationLoading}
              />
            )}
          </div>
        );

      case "analytics":
        if (analyticsLoading && !analyticsData) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Loading analytics...
            </div>
          );
        }

        if (analyticsError) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 space-y-4">
              <p className="text-red-600">{analyticsError}</p>
              <button
                type="button"
                onClick={handleRetryAnalytics}
                className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#76FF82] text-black font-medium"
              >
                Retry
              </button>
            </div>
          );
        }

        if (!analyticsData) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Analytics data unavailable.
            </div>
          );
        }

        return <AnalyticsView analyticsData={analyticsData} />;

      case "inspect":
        return <InspectView onItemSelect={handleInspectItemSelect} searchQuery={searchQuery} />;

      case "inspect-detail":
        if (!selectedInspectItem) {
          return (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500">
              Select a profile to inspect.
            </div>
          );
        }

        return (
          <Companyapplicants
            itemId={selectedInspectItem}
            onBack={() => setCurrentView("inspect")}
          />
        );

      case "companies":
      default:
        return (
          <div className="space-y-4">
            {companiesError && (
              <div className="bg-white border border-red-100 text-red-600 rounded-xl p-4 text-sm">
                {companiesError}
              </div>
            )}
            {companiesLoading ? (
              <div className="bg-white rounded-xl p-6 text-center text-gray-500">
                Loading companies...
              </div>
            ) : (
              <CompaniesView
                companies={filteredCompanies}
                onCompanySelect={handleCompanySelect}
                onCompanyDelete={handleCompanyDelete}
              />
            )}
          </div>
        );
    }
  };

  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center p-6">
        <form
          onSubmit={handleAdminLoginSubmit}
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6"
        >
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold text-black">Admin Access</h1>
            <p className="text-sm text-gray-500">
              Enter the admin password to access the dashboard.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={authPasswordInput}
              onChange={(event) => setAuthPasswordInput(event.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#76FF82]"
              placeholder="Enter password"
              disabled={authLoading}
            />
            {authError && (
              <p className="text-sm text-red-600">{authError}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-[#76FF82] text-black font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {authLoading ? "Verifying..." : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      <Header
        currentView={currentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={handleBack}
        onNavigate={handleNavigate}
      />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
