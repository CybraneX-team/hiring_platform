"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PostRole from "../new-role/page";
import { toast } from "react-toastify";

function EditRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const [jobData, setJobData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!jobId) {
      toast.error("Job ID is missing");
      router.push("/company/profile");
      return;
    }

    const fetchJobData = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/jobs/${jobId}/edit`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch job data");
        }

        const data = await response.json();
        setJobData(data);
      } catch (error: any) {
        console.error("Error fetching job data:", error);
        toast.error(error.message || "Failed to load job data");
        router.push("/company/profile");
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobData();
  }, [jobId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return null;
  }

  return <PostRole initialData={jobData} isEditMode={true} jobId={jobId!} />;
}

export default function EditRole() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F5F5] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <EditRoleContent />
    </Suspense>
  );
}
