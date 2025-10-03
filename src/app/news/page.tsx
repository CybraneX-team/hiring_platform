"use client";

import Header from "../components/header";
import Footer from "../components/Footer";

export default function NewsPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h1 className="text-[#163A33] font-bold tracking-tight text-2xl sm:text-3xl md:text-5xl">
              News & Blogs — Coming Soon!
            </h1>
            <p className="mt-3 text-sm sm:text-base md:text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We’re curating insights on energy, infrastructure, and project execution — from field-tested workflows to AI-powered best practices. Check back soon for updates, case studies, and product news.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}


