"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

import React from "react";
import Link from "next/link";
import Header from "./header";

// export default function HeroSection() {

//   return (
//     <div
//       className="m-3 bg-[#F4FFF5] rounded-xl"
//       style={{ height: "calc(100vh - 120px)" }}
//     >
//       <div className="flex flex-col items-center justify-center h-full px-8">
//         <h1 className="text-black text-4xl md:text-5xl lg:text-6xl font-medium text-center mb-12 max-w-4xl leading-tight">
//           Sourcing talent. Crafting an innovative future
//         </h1>

//         <div className="flex flex-col sm:flex-row gap-4">
//           <Link href="/company/signup">
//             <button className="bg-[#76FF83] cursor-pointer text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-[#6ef07a] transition-colors">
//               Hire engineers
//             </button>
//           </Link>
//           <Link href="/signup">
//             <button className="bg-[#D2FFD6] cursor-pointer text-black px-8 py-3 rounded-xl font-medium text-lg hover:bg-[#c5f2ca] transition-colors">
//               Apply for a Job
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

export default function HeroSection() {
  return (
    <>
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/hero.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-[#01010162]">
        {" "}
        <Header />
      </div>

      <section className="relative h-screen flex items-center justify-start">
        <div className="relative z-10 text-white max-w-[90%] mx-auto px-6 w-full">
          <div className="max-w-2xl mt-40">
            <h1 className="text-5xl md:text-6xl font-semibold mb-6 leading-tight">
              A <span className="text-[#48FF58]"> workforce </span> for
              <br />
              better tomorrow
            </h1>
            <p className="text-lg mb-8 text-white leading-relaxed">
              Harness the power of renewable energy for a sustainable future.
              Clean energy solutions that power tomorrow with innovative
              technology.
            </p>
            <div className="flex gap-4">
              <Link href="/signup">
                <button className="bg-[#76FF83] hover:bg-[#6ef07a] text-black font-medium px-10 py-2.5 w-40 transition-colors">
                  Find a job
                </button>
              </Link>
              <Link href="/company/signup">
                <button className="bg-white text-black px-10 py-3 w-48 transition-colors text-sm font-semibold">
                  Hire an Engineer
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
