"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 py-8 sm:py-10 md:py-12 lg:py-14">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12">
          <div className="flex-1">
            <button onClick={scrollToTop} className="mb-3 sm:mb-4 block cursor-pointer">
              <div className="flex items-center gap-1 -mt-5 -ml-5">
                <Image
                  src="/black_logo.png"
                  alt="ProjectMATCH by Compscope"
                  width={200}
                  height={80}
                  className="h-16 sm:h-20 md:h-24 w-auto"
                  priority
                />
                <div className="leading-tight text-[#163A33]">
                  <div className="text-xs sm:text-sm md:text-base lg:text-2xl font-black">ProjectMATCH</div>
                  <div className="text-[10px] sm:text-xs md:text-sm text-gray-600"><span className="text-[#3EA442] -ml-16 font-bold">by Compscope</span></div>
                </div>
              </div>
            </button>
            <p className="text-gray-600 text-xs sm:text-sm mb-4 sm:mb-5 leading-relaxed">
              Connecting talent to the projects — securely and efficiently.
            </p>
            <Link
              href="https://www.linkedin.com/company/compscope-nonmetallics-technology-solutions/"
              target="_blank"
              className="text-xs sm:text-sm text-[#17181D] ring-1 ring-gray-300 rounded-md px-2.5 sm:px-3 py-1 sm:py-1.5 inline-block hover:bg-gray-50 transition-colors"
            >
              LinkedIn
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-6 sm:gap-8 lg:gap-4">
            <div className="text-center lg:text-left">
              <h3 className="font-semibold mb-3 sm:mb-4 text-[#17181D] text-sm sm:text-base">Quick Links</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                <li>
                  <Link href="/news" className="text-gray-600 hover:text-[#17181D] transition-colors">
                    News & Blogs
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-gray-600 hover:text-[#17181D] transition-colors">
                    Support
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-7 md:pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-gray-600">© 2025 Compscope Non Metallics. All rights reserved.</p>
          <div className="flex items-center gap-3 sm:gap-4 text-[10px] sm:text-xs">
            <Link href="/privacy" className="text-gray-600 hover:text-[#17181D]">Privacy</Link>
            <span className="text-gray-300">|</span>
            <Link href="/terms" className="text-gray-600 hover:text-[#17181D]">Terms</Link>
            <span className="text-gray-300">|</span>
            <Link href="/cookies" className="text-gray-600 hover:text-[#17181D]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
