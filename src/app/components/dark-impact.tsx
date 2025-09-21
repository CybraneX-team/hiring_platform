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
    <section className="py-24 bg-[#17181D] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-900"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-xl md:text-4xl font-medium mb-6 leading-tight max-w-4xl mx-auto">
         Core Disciplines & On-Site Capabilities
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {stats.map((stat, index) => (
            <div key={index} className="text-center md:text-left">
              <h3 className="md:text-xl text-base font-medium mb-4">{stat.title}</h3>
              <p className="text-gray-200 md:text-base text-sm leading-relaxed font-light">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

      
      </div>
    </section>
  );
}
