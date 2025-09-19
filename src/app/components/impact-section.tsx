import Link from "next/link";

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
            <div className="absolute inset-0 bg-[#3EA442] bg-opacity-90 flex items-center justify-center mb-20 rounded-2xl">
              <div className="text-center text-black max-w-2xl">
                <p className=" font-semibold mb-6 uppercase tracking-wide text-white text-xl">
                 Projectmatch an ambitious initiative by Compscope
                </p>
                <p className="text-lg mb-8 text-white font-light">
                  Created to redefine how energy  professionals and organizations connect, collaborate, and execute projects with precision and  excellence. Leveraging decades of expertise in hydrocarbon industrial projects, inspection, and  advanced energy solutions, Compscope ensures that every connection on Projectmatch is backed  by trust, technical depth, and verified credibility.
                </p>
                <Link href="/signup">
                <button className="bg-black  text-white font-medium px-8 py-3 rounded-lg transition-colors">
                  Get started
                </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
