"use client";

import { useState } from "react";

const ACCENT = "#76FF83";

export default function BenefitsSection() {
  const [open, setOpen] = useState<number | null>(null);

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
    <section className="bg-white py-24 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] md:gap-x-12">
          {/* Left rail */}
          <aside className="order-2 md:order-1 mt-5">
            {/* small label */}
            <p className="text-sm text-gray-500 mb-6 md:mb-0">
              <span className="align-middle">•</span>
              <span className="mx-2 align-middle">Our benefits</span>
              <span className="align-middle">•</span>
            </p>

            {/* Push the blurb down on desktop to mirror visual rhythm */}
            <div className="mt-10 md:mt-48">
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

          {/* Right content */}
          <div className="order-1 md:order-2">
            {/* Heading exactly like reference: "Benefits of [glyph] Sunergy" */}
            <div className="mb-10 md:mb-12">
              <h2 className="flex items-baseline gap-3 text-[#163A33]">
                <span className="text-4xl md:text-5xl font-semibold leading-tight">
                  Benefits of
                </span>
                <SunergyGlyph className="h-8 w-8 md:h-9 md:w-9 text-[#163A33]" />
                <span className="text-4xl md:text-5xl font-semibold leading-tight">
                  Compscope
                </span>
              </h2>
            </div>

            {/* Accordion with top and bottom borders; uniform row padding and clean dividers */}
            <div className="border-y border-gray-200">
              {benefits.map((b, i) => {
                const isOpen = open === i;
                return (
                  <div key={b.num} className="border-b border-gray-200">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="w-full grid grid-cols-[56px_1fr_24px] items-center gap-4 py-7 pl-8 pr-6 text-left hover:bg-gray-50 transition-colors"
                      aria-expanded={isOpen}
                      aria-controls={`benefit-panel-${i}`}
                    >
                      <span className="text-base font-medium tracking-[0.08em] text-gray-400">
                        {b.num}
                      </span>
                      <span className="text-lg md:text-xl font-medium text-gray-900">
                        {b.title}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 justify-self-end text-gray-600 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
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

            {/* Large image directly below rows, aligned to right column */}
            <div className="mt-8 md:mt-10">
              <img
                src="/images/about.png"
                alt="Solar panels under a blue sky"
                className="h-80 w-full object-cover md:h-[420px] rounded-xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Minimal inline chevron (no UI libs)
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

// Simple four‑leaf Sunergy‑style glyph to place between words
function SunergyGlyph({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <circle cx="8" cy="8" r="4" />
      <circle cx="16" cy="8" r="4" />
      <circle cx="8" cy="16" r="4" />
      <circle cx="16" cy="16" r="4" />
    </svg>
  );
}
