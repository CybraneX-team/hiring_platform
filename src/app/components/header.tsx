"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import {useRouter} from "next/navigation"
export default function Header() {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter()
  useEffect(() => {
    // Only runs on the client
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);
  const {user} = useUser()
  return (
    <nav className="flex items-center justify-between px-8 md:px-16 py-3 mt-3">
      <div className="text-white text-2xl font-semibold">Logo</div>
      <div className="flex items-center gap-4">
        {!token && (
          <Link href="/signin">
            <button className="bg-[#D2FFD6] text-black p-3 rounded-xl font-medium hover:bg-[#c5f2ca] transition-colors w-40 hidden md:block">
              Login
            </button>
          </Link>
        )}

        <Menu className="w-6 h-6 text-white ml-10" />

        {token && (
          <div className="w-10 h-10 rounded-full text-center flex items-center justify-center bg-cyan-300 text-black text-xl cursor-pointer">
            <span>
            {
              user?.name ?  user.name.charAt(0) : "NA"
            }
            </span>
          </div>
        )}
        {token && (
            <button 
            className="bg-[#D2FFD6] text-black p-3 rounded-xl font-medium hover:bg-[#c5f2ca] 
            transition-colors w-40 hidden md:block"
            onClick={()=>{
              setToken(null)
              localStorage.removeItem("token")
              router.push("/signin")
            }}
            >
              Logout
            </button>
        )}
      </div>
    </nav>
  );
}
