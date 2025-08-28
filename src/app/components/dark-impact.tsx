export default function DarkImpactSection() {
  const stats = [
    {
      title: "Over 100,000 Systems Processed",
      description:
        "Our renewable energy systems have been successfully deployed across residential and commercial properties worldwide.",
    },
    {
      title: "Industry Recognition",
      description:
        "Compscope has been recognized as a leader in renewable energy innovation by industry experts and environmental organizations.",
    },
    {
      title: "99% Uptime CO2 Reduction",
      description:
        "Our systems maintain exceptional reliability while significantly reducing carbon emissions for our clients.",
    },
    {
      title: "Strong Partnerships",
      description:
        "We've built strategic partnerships with leading technology companies to deliver cutting-edge renewable solutions.",
    },
  ];

  return (
    <section className="py-24 bg-teal-800 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-teal-600 to-teal-900"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight max-w-4xl mx-auto">
            We're proud to advance renewable innovation, making a real impact on
            communities and the environment.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center md:text-left">
              <h3 className="text-xl font-medium mb-4">{stat.title}</h3>
              <p className="text-gray-200 leading-relaxed font-light">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-[#76FF83] hover:bg-[#6ef07a] text-black font-medium px-8 py-3 rounded-lg transition-colors">
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
}
