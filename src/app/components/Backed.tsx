import Link from "next/link";
export default function BackedSection() {
  return (
    <section className="py-0 md:py-0 bg-white text-black">
      <div className="w-full mx-auto px-6">
        <div className="relative">
          <div
            className="w-full h-[600px] bg-cover bg-center rounded-2xl relative overflow-hidden"
    
          >
            <div className="absolute inset-0  bg-opacity-90 flex items-center justify-center  rounded-2xl">
              <div className="text-center text-black max-w-2xl">
                <p className=" font-semibold mb-6 uppercase tracking-wide text-xl md:text-2xl  text-black">
                 Backed by Compscope
                </p>
                <p className="md:text-xl text-base mb-8 mt-12 font-light max-w-4xl w-full">
                “Projectmatch is an ambitious initiative by Compscope, created to redefine how energy  professionals and organizations connect, collaborate, and execute projects with precision and  excellence. Leveraging decades of expertise in hydrocarbon industrial projects, inspection, and  advanced energy solutions, Compscope ensures that every connection on Projectmatch is backed  by trust, technical depth, and verified credibility.”
                </p>
                
                <Link href="https://www.linkedin.com/company/compscope-nonmetallics-technology-solutions/">
                <button className="bg-black  text-white font-medium md:px-8 py-3 px-5 text-sm md:text-base transition-colors mt-10">
                About Comscope
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
