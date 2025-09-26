import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white text-black border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="text-2xl font-semibold mb-4 block text-[#17181D]">
              ProjectMATCH <br />
              <span className="text-sm font-medium block text-gray-600">By <span className="text-[#69a34b] font-bold">Comscope</span></span>
            </Link>
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
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Our team
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  News
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#17181D]">Sectors</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#sectors" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Solar Power
                </Link>
              </li>
              <li>
                <Link href="#sectors" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Wind Energy
                </Link>
              </li>
              <li>
                <Link href="#sectors" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Energy Storage
                </Link>
              </li>
              <li>
                <Link href="#sectors" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Smart Grid
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-[#17181D]">Resources</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Case Studies
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Support
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-600 hover:text-[#17181D] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">© 2025 Compscope. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link href="#" className="text-gray-600 hover:text-[#17181D]">Privacy</Link>
            <span className="text-gray-300">|</span>
            <Link href="#" className="text-gray-600 hover:text-[#17181D]">Terms</Link>
            <span className="text-gray-300">|</span>
            <Link href="#" className="text-gray-600 hover:text-[#17181D]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
