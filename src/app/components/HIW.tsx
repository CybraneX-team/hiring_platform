export default function WorksSection() {
  const stats = [
    {
      title: "Collaborate & Deliver",
      description:
        "Track milestones, communicate, and complete payments securely.",
    },
    {
      title: "Define Your Project",
      description:
        " Share scope, timeline, and budget.",
    },
    {
      title: "AI Talent Match",
      description:
        "Instantly connects you with verified experts.",
    },
  ];

  return (
    <section className="py-24 bg-[#F5F5F5] text-black relative overflow-hidden ">
      <div className="absolute inset-0 opacity-10">
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-medium mb-6 leading-tight max-w-4xl mx-auto">
         How it Works?
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center gap-12 ">
          {stats.map((stat, index) => (
            <div key={index} className="text-center ">
              <h3 className="text-xl font-bold mb-4">{stat.title}</h3>
              <p className="text-black text-2xl font-light">
                {stat.description}
              </p>
            </div>
          ))}
        </div>

       
      </div>
    </section>
  );
}
