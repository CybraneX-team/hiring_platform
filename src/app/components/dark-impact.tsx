export default function DarkImpactSection() {
  const stats = [
    {
      title: "Mechanical & Industrial Systems",
      description:
        "Equipment inspection, maintenance, execution",
    },
    {
      title: "Metallurgical & Materials Engineering",
      description:
        "Material quality verification, NDT, coating and lining  inspections.",
    },
    {
      title: "Process & Operations Engineering",
      description:
        "Plant/process inspections, commissioning, and  operational support.",
    },
    {
      title: "Electrical & Instrumentation Systems",
      description:
        "Installation supervision, field testing, and  troubleshooting.",
    },
    {
      title: "Civil & Structural Engineering",
      description:
        "On-site supervision, structural inspections, and EPC project  execution.",
    },
    {
      title: "Welding, Piping & Tanks Inspection",
      description:
        "Verification of weld quality, piping systems, pressure  vessels, and storage tanks.",
    },
    {
      title: "QA/QC & Inspection",
      description:
        "Ensuring quality, compliance, integrity",
    },
    {
      title: "Expediting & Follow-Up",
      description:
        "Procurement tracking, vendor deliverables, on-call support",
    },
    {
      title: "Project & Safety Management",
      description:
        "Risk, HS&E compliance, team coordination",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-[#17181D] text-white relative overflow-hidden mt-16">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-900"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-6 mt-10">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 lg:mb-16">
          <p className="text-[10px] sm:text-[11px] md:text-xs uppercase tracking-[0.18em] text-white/70 mb-2 sm:mb-3">Core field disciplines</p>
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-5xl font-semibold leading-tight max-w-4xl mx-auto">
            Core Disciplines & On-Site Capabilities
          </h2>
          <div className="mt-3 sm:mt-4 h-px w-16 sm:w-20 md:w-24 mx-auto bg-white/15"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-8 sm:mb-10 md:mb-12 lg:mb-14">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-xl ring-1 ring-white/10 bg-white/5 hover:bg-white/7 transition-colors duration-200 p-4 sm:p-5 md:p-6 h-full"
            >
              <h3 className="text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-2.5 text-white">
                {stat.title}
              </h3>
              <p className="text-gray-300 text-xs sm:text-[13px] md:text-sm leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
