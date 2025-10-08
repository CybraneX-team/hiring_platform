"use client"
import React, { useEffect } from "react";
import JobComponent from "../components/jobs";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/app/context/UserContext";
function page() {
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    if (user && user.signedUpAs !== "Inspector") {
      toast.error("Access denied. Only Inspectors can view this page.");
      router.push("/company/profile");
    }
  }, [user, router]);

  if (!user || user.signedUpAs !== "Inspector") {
    return null;
  }

  return (
    <div>
      <JobComponent />
    </div>
  );
}

export default page;
