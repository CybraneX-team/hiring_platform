export default function HeroSection() {
  return (
    <div
      className="m-3 bg-[#F4FFF5] rounded-xl"
      style={{ height: "calc(100vh - 120px)" }}
    >
      <div className="flex flex-col items-center justify-center h-full px-8">
        <h1 className="text-black text-4xl md:text-5xl lg:text-6xl font-medium text-center mb-12 max-w-4xl leading-tight">
          Sourcing talent. Crafting an innovative future
        </h1>

        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-[#76FF83] text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-[#6ef07a] transition-colors">
            Hire engineers
          </button>
          <button className="bg-[#D2FFD6] text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-[#c5f2ca] transition-colors">
            Apply for a Job
          </button>
        </div>
      </div>
    </div>
  );
}
