"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { useRouter, usePathname } from "next/navigation";
import { handleLogout } from "../Helper/logout";

export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";
  
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

  // Prefetch homepage for instant navigation when clicking the logo
  useEffect(() => {
    try {
      (router as any)?.prefetch?.("/");
    } catch (_) {}
  }, [router]);

  const { user, setuser, setprofile } = useUser();
  
  return (
    <nav
      className={`relative z-[200] flex items-center justify-between px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pt-1 w-full transition-colors duration-300 bg-transparent`}
    >
      <Link href="/" prefetch className="flex items-center gap-1">
        <Image
          src={isHome ? "/logo.png" : "/black_logo.png"}
          alt="ProjectMATCH by Compscope"
          width={200}
          height={80}
          className="h-16 sm:h-16 md:h-16 lg:h-16 xl:h-28 w-auto"
          priority
        />
        <div className={`leading-tight ${isHome ? "text-white" : "text-black"}`}>
          <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">
            ProjectMATCH
          </div>
          <div className="text-[10px] sm:text-xs md:text-sm text-gray-600">
            <span className="text-[#3EA442] font-bold">by Compscope</span>
          </div>
        </div>
      </Link>

      <div className="cursor-pointer flex items-center gap-2 sm:gap-3 md:gap-4">
        {!token && (
          <Link
            href="/signin"
            className="inline-block pointer-events-auto cursor-pointer bg-[#3EA442] text-white px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2.5 rounded-lg font-medium hover:bg-[#69a34b] transition-colors text-xs sm:text-sm md:text-base"
          >
            Login
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