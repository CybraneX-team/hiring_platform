"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useUser } from "@/app/context/UserContext";

export default function AuthSuccessPage() {
  const router = useRouter();
  const {
    setuser,
    setprofile,
  } = useUser();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const userData = urlParams.get("user");
    const profileData : any = urlParams.get("profile");
    if (token && userData && profileData) {
      try {
        const user = JSON.parse(decodeURIComponent(userData));
        const profileD = JSON.parse(decodeURIComponent(profileData));
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("profile", JSON.stringify(profileD));
        setuser(user);
        setprofile(profileD);
        toast.success("Successfully signed in with Google!");
        router.push("/profile");
      } catch (error) {
        toast.error("Error processing Google sign-in");
        router.push("/signin");
      }
    } else {
      toast.error("Authentication failed");
      router.push("/signin");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Processing authentication...</p>
      </div>
    </div>
  );
}
