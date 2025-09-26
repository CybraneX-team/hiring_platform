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
                  <button className="bg-[#17181D] text-white font-medium md:px-8 py-3 px-5 text-sm md:text-base rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#17181D]/30">
                    About Comscope
                  </button>
                </Link>
              </div>
            </div>

            {/* Right: assurance list */}
            <div className="p-8 md:p-14 bg-[#F8FAF9] border-t md:border-t-0 md:border-l border-gray-200">
              <h4 className="text-base md:text-lg font-medium text-[#17181D] mb-4">
                What this means for your projects
              </h4>
              <ul className="space-y-3 text-gray-700 text-sm md:text-base leading-relaxed">
                <li>
                  — Verified professionals and compliance-ready profiles aligned to energy-sector standards.
                </li>
                <li>
                  — Proven methods from shutdowns, inspections, commissioning, and large infrastructure execution.
                </li>
                <li>
                  — Transparent workflows: scoped work orders, milestone tracking, and secure documentation.
                </li>
              </ul>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-white ring-1 ring-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Assurance</div>
                  <div className="text-sm md:text-base text-[#17181D] font-medium">Credential checks & region-specific compliance</div>
                </div>
                <div className="rounded-lg bg-white ring-1 ring-gray-200 p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Templates</div>
                  <div className="text-sm md:text-base text-[#17181D] font-medium">Sector-ready roles and scopes for energy projects</div>
                </div>
                <div className="rounded-lg bg-white ring-1 ring-gray-200 p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Governance</div>
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
