"use client";

export default function CTASection() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-[url('/images/news.png')]">
        <div className="absolute inset-0 bg-[#00000066]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-white">
        <div className="rounded-2xl backdrop-blur-md bg-white/5 ring-1 ring-white/15 p-6 md:p-10 text-center">
          <p className="text-[11px] md:text-xs uppercase tracking-[0.18em] text-white/80 mb-2">Stay informed</p>
          <h2 className="text-2xl md:text-4xl font-semibold leading-tight">Subscribe to our Newsletter</h2>
          <p className="text-sm md:text-base text-white/85 mt-3 md:mt-4 max-w-2xl mx-auto">
            Insights on energy projects, compliance, and field execution—delivered occasionally.
          </p>

          <form className="mt-6 md:mt-8" action="#" method="post" onSubmit={(e) => e.preventDefault()}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-sm md:max-w-lg mx-auto">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="Enter your email"
                className="placeholder-white/70 text-white border-0 flex-1 h-12 md:h-12 px-4 md:px-4 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 backdrop-blur-sm bg-white/20"
              />
              <button
                type="submit"
                className="h-12 md:h-12 rounded-md px-6 md:px-8 text-sm md:text-base font-medium bg-white text-[#17181D] hover:bg-white/95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
              >
                Subscribe
              </button>
            </div>
            <p className="mt-3 text-[11px] md:text-xs text-white/70">
              We respect your inbox. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
