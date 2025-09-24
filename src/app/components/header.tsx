"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
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
      className={`flex items-center justify-between px-8 md:px-16 py-3 fixed w-full transition-colors duration-300 z-50
        ${isScrolled ? "bg-white pt-3" : "bg-transparent"}
      `}
    >
      <Link href="/" className="flex flex-col">
        <span className={`md:text-2xl text-xl font-semibold transition-colors duration-300 ${
          isScrolled ? "text-black " : "text-white"
        }`}>
          Project Match
        </span>
        <span className={`text-sm font-medium transition-colors duration-300 ${
          isScrolled ? "text-black" : "text-white"
        }`}>
          by Comscope
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {!token && (
          <Link href="/signin">
            <button className="bg-[#D2FFD6] text-black px-6 py-2.5 rounded-xl font-medium hover:bg-[#c5f2ca] transition-colors hidden md:block">
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