export default function SolutionsSection() {
  const solutions = [
    {
      title: "Oil & Gas",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns,  inspections, maintenance, and execution.",
      bgColor: "bg-teal-800",
    },
    {
      title: "Solar Energy",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns,  inspections, maintenance, and execution.",
      bgColor: "bg-teal-800",
    },
    {
      title: "Offshore Projects",
      description:
        "Commissioning, shutdowns, and infrastructure development.",
      bgColor: "bg-teal-800",
    },
    {
      title: "Nuclear Power",
      description:
        "Full lifecycle support: upstream, midstream, downstream projects, shutdowns,  inspections, maintenance, and execution.",
      bgColor: "bg-blue-600",
      image: "/solar-panels-on-roof.png",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-16">
          <div>
            {/* <p className="text-[#76FF83] font-medium mb-6 text-sm uppercase tracking-wide">
              OUR SOLUTIONS
            </p> */}
            <h2 className="text-4xl md:text-5xl font-medium text-gray-900 leading-tight">
              Core Sectors
            </h2>
          </div>
          <button className=" text-black font-light text-sm rounded-lg transition-colors">
            View all →
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`bg-[#3EA442] text-white p-8 rounded-2xl relative overflow-hidden`}
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
                <h3 className="text-xl mb-4 font-semibold">{solution.title}</h3>
                <p className="text-sm text-white mb-6 leading-relaxed">
                  {solution.description}
                </p>
              
              </div>
            </div>
          ))}
        </div>
         <button className="bg-transparent text-black border border-black rounded-md px-10 py-3 w-44 transition-colors text-sm font-medium mt-10">
                  View Roles {" "} →
                </button>
      </div>
      
    </section>
  );
}
