export default function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/news.png')]">
        <div className="absolute inset-0 bg-[#00000040] bg-opacity-50"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center text-white">
        <h2 className="text-4xl md:text-3xl font-semibold  ">
          Subscribe to our Newsletter
        </h2>
        {/* <p className="text-lg mb-12 text-gray-200 max-w-2xl mx-auto leading-relaxed">
          Ready to make the switch to clean renewable energy? Get started today
          and transform your energy future with our sustainable solutions.
        </p> */}

        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto mt-28">
          <input
            type="email"
            placeholder="Enter your email"
            className="text-white border-0 flex-1 h-12 px-4 py-4 backdrop-blur-sm rounded-sm focus:outline-none  bg-[#ffffff4d] "
          />
          <button className="bg-[#000000] text-white font-light px-8 py-3 h-12 rounded-sm transition-colors text-sm">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
