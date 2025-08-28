export default function StatsSection() {
  const stats = [
    { value: "70%", label: "Efficiency increase" },
    { value: "100%", label: "Clean energy" },
    { value: "50K+", label: "Tons CO2 saved" },
    { value: "30%", label: "Cost reduction" },
    { value: "$3M", label: "Annual savings" },
    { value: "10M+", label: "kWh generated" },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
