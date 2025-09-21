"use client";

import { useState } from "react";

const ACCENT = "#76FF83";

export default function BenefitsSection() {
  const [open, setOpen] = useState<number | null>(null);
   const [selectedSector, setSelectedSector] = useState(0)

  const sectors = [
  
    {
      title: "Oil and gas",
      image: "/images/Oil-gas.png",
    },
    {
      title: "Infrastructure projects",
      image: "/images/Infrastructure.png",
    },
    {
      title: "hydrogen",
      image: "/images/hydrogen.png",
    },
    {
      title: "solar and wind",
      image:
        "/images/solar-wind.png",
    },
  ]

  const benefits = [
    {
      num: "01",
      title: "AI-driven talent and project matching",
      content:
        "Reduce your energy expenses by up to 70% with our efficient renewable energy solutions and smart grid integration.",
    },
    {
      num: "02",
      title: "Verified professionals and compliance-ready profiles",
      content:
        "Contribute to a cleaner planet with zero‑emission technology that significantly reduces carbon footprint.",
    },
    {
      num: "03",
      title: "Industry-focused: Energy",
      content:
        "Increase your property value with sustainable energy infrastructure that appeals to environmentally conscious buyers.",
    },
    {
      num: "04",
      title: "Secure end-to-end project management",
      content:
        "Increase your property value with sustainable energy infrastructure that appeals to environmentally conscious buyers.",
    },
  ];

  return (
    <section className="bg-white py-5 md:py-18">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] md:gap-x-12">
          {/* Left rail */}
          <aside className="order-2 md:order-1 mt-5">
            {/* small label */}
            <div className="hidden md:block">
            <p className="text-sm text-gray-500 mb-6 md:mb-0">
              <span className="align-middle">•</span>
              <span className="mx-2 align-middle">Our benefits</span>
              <span className="align-middle">•</span>
            </p>

            {/* Push the blurb down on desktop to mirror visual rhythm */}
            <div className="mt-10 md:mt-60 ">
              <p className="text-[#8D8D8D] leading-relaxed md:pr-6">
                Highest level or transparency maintenance while simultaneously maintaining privacy for sophisticated documentation
              </p>

              <a
                href="#"
                className="mt-6 inline-flex h-10 items-center justify-center rounded px-5 text-sm font-medium text-white bg-[#17181D]"
                
              >
                Our approach
              </a>
            </div>
            </div>

             <div className="mt-10 md:mt-24">
              <div className="">
                 <span className="text-lg md:text-xl font-medium text-gray-900 ">
                      Compscope environment
                      </span>
                {sectors.map((sector, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSector(index)}
                    className={`block w-full text-left py-3 px-4 rounded-lg mt-5 text-sm md:text-base transition-all duration-200 ${
                      selectedSector === index
                        ? "bg-gray-100 text-gray-900 font-medium"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {sector.title}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right content */}
          <div className="order-1 md:order-2">
            {/* Heading exactly like reference: "Benefits of [glyph] Sunergy" */}
            <div className="mb-10 md:mb-12">
              <h2 className="flex items-baseline gap-3 text-[#163A33]">
                <span className="text-2xl md:text-4xl font-semibold leading-tight">
                  Benefits of   Compscope
                </span>
            
              
              </h2>
            </div>

         
            <div className="border-y border-gray-200">
              {benefits.map((b, i) => {
                const isOpen = open === i;
                return (
                  <div key={b.num} className="border-b border-gray-200">
                    <button
                      type="button"
                      // onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full grid grid-cols-[56px_1fr_24px] items-center gap-4 py-7 text-left hover:bg-gray-50 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`benefit-panel-${i}`}
                    >
                      <span className="text-base font-medium tracking-[0.08em] text-gray-400">
                        {b.num}
                      </span>
                      <span className="text-base md:text-xl font-medium text-gray-900 -ml-8">
                        {b.title}
                      </span>
                      {/* <ChevronDown
                        className={`h-5 w-5 justify-self-end text-gray-600 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      /> */}
                    </button>

                    {isOpen && (
                      <div id={`benefit-panel-${i}`} className="px-8 pb-7">
                        <p className="text-gray-600 leading-relaxed">
                          {b.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
             <aside className="order-2 md:order-1 mt-5 md:hidden">
            {/* small label */}
            <p className="text-sm text-gray-500 mb-6 md:mb-0">
              <span className="align-middle">•</span>
              <span className="mx-2 align-middle">Our benefits</span>
              <span className="align-middle">•</span>
            </p>

            {/* Push the blurb down on desktop to mirror visual rhythm */}
            <div className="mt-10 md:mt-48 ">
              <p className="text-[#8D8D8D] leading-relaxed md:pr-6">
                Highest level or transparency maintenance while simultaneously maintaining privacy for sophisticated documentation
              </p>

              <a
                href="#"
                className="mt-6 inline-flex h-10 items-center justify-center rounded px-5 text-sm font-medium text-white bg-[#17181D]"
                
              >
                Our approach
              </a>
            </div>

            
          </aside>
 <div className="mt-8 md:mt-10">
              <img
                src={sectors[selectedSector].image || "/placeholder.svg"}
                alt={`${sectors[selectedSector].title} sector visualization`}
                className="h-80 w-full object-cover md:h-[420px] rounded-xl transition-opacity duration-300 mt-16 md:mt-0"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


function ChevronDown({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

