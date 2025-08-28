export default function AboutSection() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#76FF83] font-medium mb-6 text-sm uppercase tracking-wide">
              ABOUT Compscope
            </p>
            <h2 className="text-4xl md:text-5xl font-medium text-gray-900 mb-8 leading-tight">
              We are dedicated to making clean power accessible, affordable, and
              effective.
            </h2>
            <button className="bg-[#76FF83] hover:bg-[#6ef07a] text-black font-medium px-8 py-3 rounded-lg transition-colors">
              Learn more
            </button>
          </div>

          <div className="relative">
            <div className="w-full h-96 bg-cover bg-center rounded-2xl z-50 bg-[url('/images/about.png')]"></div>
            <div className="absolute -bottom-16 -right-6 bg-[#76FF83] text-black p-6 rounded-xl max-w-sm">
              <p className="font-medium text-sm leading-relaxed mb-3">
                Compscope was founded with a vision to drive sustainable
                solutions that empower communities and protect our planet.
              </p>
              <button className="text-black font-medium text-sm hover:underline">
                Learn more →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
