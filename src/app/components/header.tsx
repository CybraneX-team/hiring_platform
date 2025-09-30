"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter } from "next/navigation";
import { handleLogout } from "../Helper/logout";

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
  
  return (
    <nav
      className={`flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-1 fixed w-full transition-colors duration-300 z-50
        ${isScrolled ? "bg-white pt-1" : "bg-transparent"}
      `}
    >
      <Link href="/" className="flex items-center gap-1 sm:gap-2 md:gap-3">
        <Image
          src={isScrolled ? "/logo.png" : "/logo.png"}
          alt="ProjectMATCH by Compscope"
          width={200}
          height={80}
          className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-20 w-auto"
          priority
        />
        <div className="block">
          <h1 className={`text-xs sm:text-sm md:text-base lg:text-lg font-black ${isScrolled ? "text-black" : "text-white"}`}>ProjectMATCH</h1>
          <p className={`text-xs sm:text-xs md:text-sm text-gray-600 ${isScrolled ? "text-black" : "text-white"}`}>by <span className="text-[#98f831] font-bold">Compscope</span></p>
        </div>
      </Link>

      <div className="cursor-pointer flex items-center gap-2 sm:gap-3 md:gap-4">
        {!token && (
          <Link href="/signin">
            <button className="cursor-pointer bg-[#9ff64f] text-black px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 rounded-lg font-medium hover:bg-[#69a34b] transition-colors text-xs sm:text-sm md:text-base">
              Login
            </button>
          </Link>
        )}

        {token && (
          <Link href="/profile">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center bg-cyan-300 text-black text-sm sm:text-lg md:text-xl cursor-pointer">
              <span>{user?.name ? user.name.charAt(0) : "NA"}</span>
            </div>
          </Link>
        )}
        
        {token && (
          <button
            className="bg-[#D2FFD6] cursor-pointer text-black px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 rounded-xl font-medium hover:bg-[#c5f2ca] transition-colors text-xs sm:text-sm md:text-base"
            onClick={()=>{
              handleLogout(setToken ,setuser, setprofile, router)
            }}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}