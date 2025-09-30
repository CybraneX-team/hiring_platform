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

  const scrollToSectors = () => {
    const sectorsSection = document.getElementById('sectors');
    if (sectorsSection) {
      sectorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    // Not on the home page; navigate to home and then scroll
    router.push('/#sectors');
    setTimeout(() => {
      const el = document.getElementById('sectors');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 600);
  };

  const scrollToSpecificSector = (sectorName: string) => {
    const sectorsSection = document.getElementById('sectors');
    if (sectorsSection) {
      sectorsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        const event = new CustomEvent('expandSector', { detail: { sectorName } });
        window.dispatchEvent(event);
      }, 500);
      return;
    }

    // If not on a page with sectors, navigate to home and then expand the sector
    try {
      sessionStorage.setItem('expandSector', sectorName);
    } catch (_) {}
    router.push('/#sectors');
    setTimeout(() => {
      const el = document.getElementById('sectors');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const event = new CustomEvent('expandSector', { detail: { sectorName } });
      window.dispatchEvent(event);
    }, 700);
  };
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-6 py-8 sm:py-10 md:py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
          <div className="sm:col-span-2 md:col-span-1">
            <button onClick={scrollToTop} className="mb-3 sm:mb-4 block cursor-pointer">
              <Image
                src="/logo.png"
                alt="ProjectMATCH by Compscope"
                width={140}
                height={50}
                className="h-16 sm:h-20 md:h-24 w-auto"
                priority
              />
              <p className={`text-xs mb-2 sm:text-xs md:text-sm text-gray-600 font-black -mt-1`}> <span className="text-[#000] font-bold">by Compscope</span></p>
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

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-[#17181D] text-sm sm:text-base">Company</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  About us <span className="text-[10px] sm:text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Our team <span className="text-[10px] sm:text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Careers <span className="text-[10px] sm:text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  News <span className="text-[10px] sm:text-xs">(coming soon)</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-[#17181D] text-sm sm:text-base">Sectors</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <button onClick={() => scrollToSpecificSector('Oil & Gas')} className="text-gray-600 cursor-pointer hover:text-[#17181D] transition-colors text-left">
                  Oil & Gas
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSpecificSector('Solar Energy')} className="text-gray-600 cursor-pointer hover:text-[#17181D] transition-colors text-left">
                  Solar Energy
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSpecificSector('Wind Energy')} className="text-gray-600 cursor-pointer hover:text-[#17181D] transition-colors text-left">
                  Wind Energy
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSpecificSector('Green Hydrogen')} className="text-gray-600 cursor-pointer hover:text-[#17181D] transition-colors text-left">
                  Green Hydrogen
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSpecificSector('Industrial Infrastructure')} className="text-gray-600 cursor-pointer hover:text-[#17181D] transition-colors text-left">
                  Industrial Infrastructure
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-[#17181D] text-sm sm:text-base">Resources</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Documentation <span className="text-[10px] sm:text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Case Studies <span className="text-[10px] sm:text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-7 md:pt-8 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="text-[10px] sm:text-xs text-gray-600">© 2025 Compscope. All rights reserved.</p>
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
