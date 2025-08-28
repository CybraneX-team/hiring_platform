export default function ImpactSection() {
  return (
    <section className="py-0 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <div
            className="w-full h-[600px] bg-cover bg-center rounded-2xl relative overflow-hidden"
            style={{
              backgroundImage: "url('/large-solar-panel-installation.png')",
            }}
          >
            <div className="absolute inset-0 bg-[#76FF83] bg-opacity-90 flex items-center justify-center mb-20 rounded-2xl">
              <div className="text-center text-black max-w-2xl">
                <p className="text-sm font-medium mb-6 uppercase tracking-wide">
                  OUR COMMITMENT TO CLEAN ENERGY
                </p>
                <p className="text-lg mb-8 leading-relaxed">
                  We are committed to clean energy solutions that make a real
                  difference. Our renewable technology helps reduce emissions
                  while providing reliable, sustainable power for communities
                  worldwide.
                </p>
                <button className="bg-black hover:bg-gray-800 text-white font-medium px-8 py-3 rounded-lg transition-colors">
                  Get started
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
