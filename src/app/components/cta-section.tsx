export default function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/join.avif')]">
        <div className="absolute inset-0 bg-[#0000008b] bg-opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Join the renewable energy
          <br />
          movement with Compscope.
        </h2>
        <p className="text-lg mb-12 text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Ready to make the switch to clean renewable energy? Get started today
          and transform your energy future with our sustainable solutions.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-white text-black border-0 flex-1 h-12 px-4 py-4  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#76FF83]"
          />
          <button className="bg-[#76FF83] hover:bg-[#6ef07a] text-black font-medium px-8 py-3 h-12 rounded-lg transition-colors">
            Join the movement
          </button>
        </div>
      </div>
    </section>
  );
}
