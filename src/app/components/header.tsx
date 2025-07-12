import { Menu } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <nav className="flex items-center justify-between px-8 md:px-16 py-3 mt-3">
      <div className="text-white text-2xl font-semibold">Logo</div>
      <div className="flex items-center gap-4">
        <Link href="/signin">
          <button className="bg-[#D2FFD6] text-black p-3 rounded-xl font-medium hover:bg-[#c5f2ca] transition-colors w-40 hidden md:block">
            Login
          </button>
        </Link>
        <Menu className="w-6 h-6 text-white ml-10" />
      </div>
    </nav>
  );
}
