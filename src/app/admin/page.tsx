"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { ViewType, Company, Role, Application } from "../types";
import {
  companies,
  activeRoles,
  applications,
  documentTypes,
  submittedDocuments,
} from "../components/Admin/mockData";
import { generateAnalyticsData } from "../components/Admin/analyticsData";
import Header from "../components/Admin/Header";
import CompaniesView from "../components/Admin/views/CompaniesDetail";
import RolesView from "../components/Admin/views/Roles";
import ApplicationsView from "../components/Admin/views/ApplicationsDetail";
import ApplicantDetailsView from "../components/Admin/views/ApplicantsDetail";
import RequestDocumentsView from "../components/Admin/views/reqDoc";
import DocumentVerificationView from "../components/Admin/views/docVerification";
import AnalyticsView from "../components/Admin/views/AnalyticsView";
import InspectView from "../components/Admin/views/InspectView";

export default function AdminPanel() {
  const [currentView, setCurrentView] = useState<ViewType>("companies");
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedApplicant, setSelectedApplicant] =
    useState<Application | null>(null);
  const [selectedApplicantId, setSelectedApplicantId] = useState<string | null>(
    null
  ); // Added for new application detail view
  const [searchQuery, setSearchQuery] = useState("");
  const [requestedDocs, setRequestedDocs] = useState<number[]>([]);
  const [submittedDocs, setSubmittedDocs] = useState(submittedDocuments);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [analyticsData] = useState(generateAnalyticsData());
  const [selectedInspectItem, setSelectedInspectItem] = useState<string | null>(
    null
  ); // Added state for selected inspect item

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCurrentView("roles");
  };

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setCurrentView("applications");
  };

  const handleApplicantSelect = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setCurrentView("applicant-details");
  };

  const handleViewApplications = () => {
    setCurrentView("applications-list");
  };

  const handleOpenApplication = (applicantId: string) => {
    setSelectedApplicantId(applicantId);
    setCurrentView("application-detail");
  };

  const handleRequestDocuments = () => {
    setCurrentView("request-documents");
  };

  const handleDocumentVerification = () => {
    setCurrentView("document-verification");
  };

  const handleDocumentRequest = (docIds: number[]) => {
    setRequestedDocs(docIds);
    setSelectedDocs([]);
    setCurrentView("applicant-details");
  };

  const handleDocumentApproval = (docId: number, approved: boolean) => {
    setSubmittedDocs((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? { ...doc, status: approved ? "approved" : "rejected" }
          : doc
      )
    );
  };

  const handleToggleDoc = (docId: number) => {
    setSelectedDocs((prev) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
  };

  const handleInspectItemSelect = (item: any) => {
    // Added handler for inspect item selection
    setSelectedInspectItem(item.id);
    setCurrentView("inspect-detail");
  };

  const goBack = () => {
    switch (currentView) {
      case "roles":
        setCurrentView("companies");
        setSelectedCompany(null);
        break;
      case "applications":
        setCurrentView("roles");
        setSelectedRole(null);
        break;
      case "applications-list":
        setCurrentView("applications");
        break;
      case "application-detail":
        setCurrentView("applications-list");
        setSelectedApplicantId(null);
        break;
      case "applicant-details":
        setCurrentView("applications");
        setSelectedApplicant(null);
        break;
      case "request-documents":
        setCurrentView("applicant-details");
        break;
      case "document-verification":
        setCurrentView("applicant-details");
        break;
      case "inspect-detail": // Added inspect detail back navigation
        setCurrentView("inspect");
        setSelectedInspectItem(null);
        break;
      default:
        setCurrentView("companies");
    }
  };

  const handleNavigate = (view: ViewType) => {
    setCurrentView(view);
    // Reset states when navigating to main views
    if (view === "companies" || view === "analytics" || view === "inspect") {
      // Added inspect to reset condition
      setSelectedCompany(null);
      setSelectedRole(null);
      setSelectedApplicant(null);
      setSelectedApplicantId(null);
      setSelectedInspectItem(null); // Added reset for inspect item
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "companies":
        return (
          <CompaniesView
            companies={companies}
            onCompanySelect={handleCompanySelect}
          />
        );
      case "roles":
        return selectedCompany ? (
          <RolesView
            selectedCompany={selectedCompany}
            roles={activeRoles}
            onRoleSelect={handleRoleSelect}
          />
        ) : null;
      case "applications":
        return selectedRole ? (
          <ApplicationsView
            selectedRole={selectedRole}
            applications={applications}
            onApplicantSelect={handleApplicantSelect}
          />
        ) : null;
      case "applicant-details":
        return selectedApplicant && selectedRole ? (
          <ApplicantDetailsView
            selectedApplicant={selectedApplicant}
            selectedRole={selectedRole}
            requestedDocs={requestedDocs}
            documentTypes={documentTypes}
            onRequestDocuments={handleRequestDocuments}
            onDocumentVerification={handleDocumentVerification}
          />
        ) : null;
      case "request-documents":
        return selectedApplicant ? (
          <RequestDocumentsView
            selectedApplicant={selectedApplicant}
            documentTypes={documentTypes}
            selectedDocs={selectedDocs}
            onToggleDoc={handleToggleDoc}
            onCancel={goBack}
            onSendRequest={handleDocumentRequest}
          />
        ) : null;
      case "document-verification":
        return selectedApplicant ? (
          <DocumentVerificationView
            selectedApplicant={selectedApplicant}
            submittedDocs={submittedDocs}
            onDocumentApproval={handleDocumentApproval}
            onDone={goBack}
          />
        ) : null;
      case "analytics":
        return <AnalyticsView analyticsData={analyticsData} />;
      case "inspect": // Added inspect view case
        return <InspectView onItemSelect={handleInspectItemSelect} />;
      // case "inspect-detail": // Added inspect detail view case
      //   return selectedInspectItem ? <InspectDetailView itemId={selectedInspectItem} onBack={goBack} /> : null
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Header
        currentView={currentView}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onBack={goBack}
        onNavigate={handleNavigate}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
