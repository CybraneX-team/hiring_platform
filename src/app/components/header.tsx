"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Only runs on the client
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { user, setuser, setprofile } = useUser();
  
  const handleLogout = () => {
    // Clear token
    setToken(null);

    // Clear user context data
    setuser(null);
    setprofile(null);

    // Clear all localStorage items
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("profileData");

    // Optional: Clear any other session data
    sessionStorage.clear();

    // Redirect to signin
    router.push("/signin");
  };

  return (
    <nav
      className={`flex items-center justify-between px-8 md:px-16 pt-1 fixed w-full transition-colors duration-300 z-50
        ${isScrolled ? "bg-white pt-1" : "bg-transparent"}
      `}
    >
      <Link href="/" className="flex items-center gap-1">
        <Image
          src={isScrolled ? "/logo.png" : "/logo.png"}
          alt="ProjectMATCH by Compscope"
          width={200}
          height={80}
          className="h-8 md:h-20 w-auto"
          priority
        />
        <div className="hidden md:block">
          <h1 className="text-lg font-black text-[#163A33]">ProjectMATCH</h1>
          <p className="text-sm text-gray-600">by <span className="text-[#98f831] font-bold">Compscope</span></p>
        </div>
      </Link>

      <div className="cursor-pointer flex items-center gap-4">
        {!token && (
          <Link href="/signin">
            <button className="cursor-pointer bg-[#9ff64f] text-black px-6 py-2.5 rounded-lg font-medium hover:bg-[#69a34b] transition-colors hidden md:block">
              Login
            </button>
          </Link>
        )}

        {token && (
          <Link href="/profile">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-cyan-300 text-black text-xl cursor-pointer">
              <span>{user?.name ? user.name.charAt(0) : "NA"}</span>
            </div>
          </Link>
        )}
        
        {token && (
          <button
            className="bg-[#D2FFD6] text-black px-6 py-2.5 rounded-xl font-medium hover:bg-[#c5f2ca] transition-colors hidden md:block"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}