export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Sustainability Director",
      company: "GreenTech Corp",
      content:
        "Compscope was one of the first renewable solutions we tried for our facility. The team was extremely knowledgeable and professional in their approach. Our energy costs have decreased by 45% since implementation.",
      avatar: "/professional-woman-avatar.png",
    },
    {
      name: "Michael Rodriguez",
      role: "Operations Manager",
      company: "EcoManufacturing",
      content:
        "Working with Compscope was seamless from start to finish. The team was extremely knowledgeable and professional in their approach. Our facility now runs on 100% clean energy.",
      avatar: "/professional-man-avatar.png",
    },
    {
      name: "Emily Johnson",
      role: "CEO",
      company: "CleanEnergy Solutions",
      content:
        "The renewable systems from Compscope have transformed our operations. We've seen significant cost savings and our carbon footprint has been reduced by over 60%.",
      avatar: "/professional-woman-ceo-avatar.png",
    },
    {
      name: "David Park",
      role: "Facility Manager",
      company: "Industrial Dynamics",
      content:
        "Compscope's team provided excellent support throughout our transition to renewable power. The reliability and efficiency of their systems exceeded our expectations.",
      avatar: "/professional-man-manager-avatar.png",
    },
    {
      name: "Lisa Wang",
      role: "Environmental Officer",
      company: "TechCorp Industries",
      content:
        "The solar integration project was handled flawlessly. Compscope delivered on time and within budget, and our energy independence has never been better.",
      avatar: "/professional-woman-environmental-officer.png",
    },
    {
      name: "James Thompson",
      role: "Plant Director",
      company: "Manufacturing Plus",
      content:
        "Outstanding service and cutting-edge technology. Compscope helped us achieve our sustainability goals while reducing operational costs significantly.",
      avatar: "/professional-man-plant-director.png",
    },
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-[#76FF83] font-medium mb-6 text-sm uppercase tracking-wide">
            TESTIMONIALS
          </p>
          <h2 className="text-4xl md:text-5xl font-medium text-gray-900">
            What customers say.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center mb-6">
                <div
                  className="w-12 h-12 bg-cover bg-center rounded-full mr-4 flex-shrink-0"
                  style={{
                    backgroundImage: `url('${testimonial.avatar}')`,
                  }}
                ></div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">
                    {testimonial.name}
                  </h4>
                  <p className="text-xs text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-[#76FF83] font-medium">
                    {testimonial.company}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">
                {testimonial.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
