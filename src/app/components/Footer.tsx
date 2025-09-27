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
      sectorsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToSpecificSector = (sectorName: string) => {
    const sectorsSection = document.getElementById('sectors');
    if (sectorsSection) {
      sectorsSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
      
      // Dispatch custom event to expand the specific sector card
      setTimeout(() => {
        const event = new CustomEvent('expandSector', { 
          detail: { sectorName } 
        });
        window.dispatchEvent(event);
      }, 500); // Small delay to ensure scroll completes
    }
  };
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <button onClick={scrollToTop} className="mb-4 block cursor-pointer">
              <Image
                src="/logo.png"
                alt="ProjectMATCH by Compscope"
                width={140}
                height={50}
                className="h-24 w-auto"
                priority
              />
            </button>
            <p className="text-gray-600 text-sm mb-5 leading-relaxed">
              Connecting talent to the projects — securely and efficiently.
            </p>
            <Link
              href="https://www.linkedin.com/company/compscope-nonmetallics-technology-solutions/"
              target="_blank"
              className="text-sm text-[#17181D] ring-1 ring-gray-300 rounded-md px-3 py-1.5 inline-block hover:bg-gray-50 transition-colors"
            >
              LinkedIn
            </Link>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#17181D]">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  About us <span className="text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Our team <span className="text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Careers <span className="text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  News <span className="text-xs">(coming soon)</span>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#17181D]">Sectors</h3>
            <ul className="space-y-3 text-sm">
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
            <h3 className="font-semibold mb-4 text-[#17181D]">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Documentation <span className="text-xs">(coming soon)</span>
                </span>
              </li>
              <li>
                <span className="text-gray-400 cursor-not-allowed">
                  Case Studies <span className="text-xs">(coming soon)</span>
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

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 Compscope. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
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
