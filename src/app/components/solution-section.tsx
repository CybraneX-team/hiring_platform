export default function SolutionsSection() {
  const solutions = [
    {
      title: "Hydrogen Production",
      description:
        "Advanced electrolysis technology for clean hydrogen generation from renewable sources.",
      bgColor: "bg-teal-800",
    },
    {
      title: "Wind Energy Systems",
      description:
        "High-efficiency wind turbines designed for optimal energy capture and conversion.",
      bgColor: "bg-teal-800",
    },
    {
      title: "Advanced Energy Storage",
      description:
        "Cutting-edge storage solutions for reliable renewable energy distribution.",
      bgColor: "bg-teal-800",
    },
    {
      title: "Solar Power",
      description:
        "Seamless integration of solar technology with hydrogen production systems.",
      bgColor: "bg-blue-600",
      image: "/solar-panels-on-roof.png",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-16">
          <div>
            <p className="text-[#76FF83] font-medium mb-6 text-sm uppercase tracking-wide">
              OUR SOLUTIONS
            </p>
            <h2 className="text-4xl md:text-5xl font-medium text-gray-900 leading-tight">
              Our solutions, your
              <br />
              sustainable future.
            </h2>
          </div>
          <button className=" text-black font-medium rounded-lg transition-colors">
            View all
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`${solution.bgColor} text-white p-8 rounded-2xl relative overflow-hidden`}
            >
              {solution.image && (
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-30"
                  style={{
                    backgroundImage: `url('${solution.image}')`,
                  }}
                ></div>
              )}
              <div className="relative z-10">
                <h3 className="text-xl mb-4">{solution.title}</h3>
                <p className="text-sm text-gray-200 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <button className="text-[#76FF83] font-medium text-sm hover:underline">
                  Learn more →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
