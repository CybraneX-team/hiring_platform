import Link from "next/link";

export default function ImpactSection() {
  return (
    <section className="py-10 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative">
          <div
            className="w-full md:h-[450px] h-[400px] bg-cover bg-center rounded-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[#3EA442] bg-opacity-90 flex pt-10 justify-center mb-20 rounded-2xl p-3">
              <div className="text-center text-black max-w-2xl">
                <p className=" font-semibold mb-6 uppercase tracking-wide text-white text-base md:text-xl">
                 Projectmatch an ambitious initiative by Compscope
                </p>
                <p className="md:text-lg text-xs mb-8 text-white ">
                  Created to redefine how energy  professionals and organizations connect, collaborate, and execute projects with precision and  excellence. Leveraging decades of expertise in hydrocarbon industrial projects, inspection, and  advanced energy solutions, Compscope ensures that every connection on Projectmatch is backed  by trust, technical depth, and verified credibility.
                </p>
                <Link href="/signup">
                <button className="bg-black  text-white md:font-medium md:px-8 md:py-3 px-5 py-2 rounded-lg text-xs md:text-base transition-colors">
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
