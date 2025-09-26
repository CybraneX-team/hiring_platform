export default function WorksSection() {
  const stats = [
    {
      title: "Collaborate & Deliver",
      description:
        "Track milestones, communicate, and complete payments securely. Share documents, approve deliverables, and maintain a clean audit trail.",
    },
    {
      title: "Define Your Project",
      description:
        "Share scope, timeline, and budget. Attach drawings/specs and clarify acceptance criteria to avoid rework.",
    },
    {
      title: "AI Talent Match",
      description:
        "Instantly connects you with verified experts. Results are ranked by skills, certifications, availability, and project fit.",
    },
  ];

  return (
    <section className="py-20 md:py-24 bg-[#F7F7F7] text-black relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-gray-500 mb-3">Fast, clear, secure</p>
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight max-w-4xl mx-auto">How it works</h2>
        </div>

        {/* Steps timeline */}
        <div className="relative">
          {/* connector line on desktop */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-12 w-[85%] h-px bg-gray-200" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="relative">
                {/* step badge */}
                <div className="flex md:block items-center md:items-start">
                  <div className="relative z-10 mx-auto md:mx-0 flex h-10 w-10 items-center justify-center rounded-full bg-white ring-1 ring-gray-300 text-sm font-semibold text-gray-900">
                    {(index + 1).toString().padStart(2, '0')}
                  </div>
                </div>

                <div className="mt-3 md:mt-6 rounded-xl bg-white ring-1 ring-gray-200 p-5 md:p-6 shadow-sm hover:shadow transition-shadow">
                  <h3 className="text-base md:text-lg font-medium text-gray-900 mb-1.5">{stat.title}</h3>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary and key benefits */}
        <div className="mt-10 md:mt-14 max-w-3xl mx-auto text-center">
          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            From scope definition to milestone delivery, ProjectMATCH aligns project needs with verified expertise and keeps your execution on track.
          </p>
        </div>

      </div>
    </section>
  );
}
