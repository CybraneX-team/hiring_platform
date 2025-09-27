import Link from "next/link";
export default function BackedSection() {
  return (
    <section className="py-16 md:py-24 bg-white text-black">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-2xl ring-1 ring-gray-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left: statement */}
            <div className="p-8 md:p-14 bg-white">
              <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-gray-500 mb-2">
                Backed by Compscope
              </p>
              <h3 className="text-2xl md:text-4xl font-semibold tracking-tight text-[#17181D] mb-5 mt-2">
                ProjectMATCH is backed by deep field experience and credibility
              </h3>
              <blockquote className="text-sm md:text-base text-gray-700 leading-relaxed md:max-w-xl mt-5">
                “ProjectMATCH is an ambitious initiative by Compscope, created to redefine how energy professionals and organizations connect, collaborate, and execute projects with precision and excellence. Leveraging decades of expertise in hydrocarbon industrial projects, inspection, and advanced energy solutions, Compscope ensures that every connection on ProjectMATCH is backed by trust, technical depth, and verified credibility.”
              </blockquote>

              <div className="mt-40">
                <Link href="https://www.linkedin.com/company/compscope-nonmetallics-technology-solutions/" className="inline-flex">
                  <button className="cursor-pointer bg-[#17181D] text-white font-medium md:px-8 py-3 px-5 text-sm md:text-base rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181D]/30">
                    About Compscope
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: assurance list */}
            <div className="p-8 md:p-14 bg-[#F8FAF9] border-t md:border-t-0 md:border-l border-gray-200">
              <h4 className="text-base md:text-lg font-medium text-[#17181D] mb-4">
                What this means for your projects
              </h4>
              <ul className="space-y-4 text-gray-700 text-sm md:text-base leading-relaxed">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#3EA442] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified professionals and compliance-ready profiles aligned to energy-sector standards.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#3EA442] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Proven methods from shutdowns, inspections, commissioning, and large infrastructure execution.</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#3EA442] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Transparent workflows: scoped work orders, milestone tracking, and secure documentation.</span>
                </li>
              </ul>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-white ring-1 ring-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-[#3EA442]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Assurance</div>
                  </div>
                  <div className="text-sm md:text-base text-[#17181D] font-medium">Credential checks & region-specific compliance</div>
                </div>
                <div className="rounded-lg bg-white ring-1 ring-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-[#3EA442]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Templates</div>
                  </div>
                  <div className="text-sm md:text-base text-[#17181D] font-medium">Sector-ready roles and scopes for energy projects</div>
                </div>
                <div className="rounded-lg bg-white ring-1 ring-gray-200 p-4 sm:col-span-2">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-[#3EA442]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-xs uppercase tracking-wide text-gray-500">Governance</div>
                  </div>
                  <div className="text-sm md:text-base text-[#17181D] font-medium">Auditable records, access controls, and clean handover packs</div>
                </div>
              </div>

              <div className="mt-8 h-px w-full bg-gray-200" />
              <p className="mt-4 text-xs md:text-sm text-gray-600">
                Compscope brings decades of practical know‑how so your teams can hire confidently and deliver with discipline.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
