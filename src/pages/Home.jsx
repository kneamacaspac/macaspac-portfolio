// src/pages/Home.jsx

import StarField from "../components/ui/StarField.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useEffect } from "react";
import FadeInSection from "../components/transitions/FadeInSection.jsx";
import MagicCrystal from "../components/3d-components/MagicCrystal1.jsx";
import MagicCrystal2 from "../components/3d-components/MagicCrystal2.jsx";
import BlurTextEffect from "../components/ui/BlurTextEffect.jsx";
import VaporTextEffect from "../components/ui/VaporTextEffect.jsx";
import ScrollStorySection from "../components/ui/ScrollStorySection.jsx";
import Footer from "../components/footer/Footer.jsx";
import SplashCursor from "../components/cursors/SplashCursor.jsx";

export default function Home({
  avatarSrc = "src/assets/images/nea-photo.png",
}) {
  const containerRef = useRef(null);

  // Tracks scroll progress (0 to 1) of the whole page
  const { scrollYProgress } = useScroll();

  // Map scroll progress -> opacity (hero fades as you scroll down)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Map scroll progress -> a dark overlay that gets stronger as you scroll
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.85]);

  return (
    <>
      <div className="fixed inset-0 z-0">
        <StarField />
      </div>

      <SplashCursor
        DENSITY_DISSIPATION={2.5}
        VELOCITY_DISSIPATION={2.5}
        PRESSURE={0.35}
        CURL={3}
        SPLAT_RADIUS={0.38}
        SPLAT_FORCE={6500}
        COLOR_UPDATE_SPEED={5}
        SHADING
        RAINBOW_MODE={false}
        COLOR="#5b0da480"
      />

      <FadeInSection>
        <section
          id="hero"
          className="flex h-screen flex-col items-center justify-center relative z-10 overflow-hidden"
        >
          <div ref={containerRef} className="relative text-neutral-100">
            {/* Scroll-driven darkening overlay */}
            <motion.div
              className="fixed inset-0 pointer-events-none z-10 bg-black"
              style={{ opacity: overlayOpacity }}
            />

            <section className="h-screen flex flex-col items-center justify-center relative z-0">
              <motion.h1
                style={{ opacity: heroOpacity }}
                className="text-4xl mx-10 font-cinzel md:text-8xl ld:6xl tracking-tight font-cinzel-regular text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Crafting Designs that Feel like Magic
              </motion.h1>
              <motion.p
                style={{ opacity: heroOpacity }}
                className="mt-4 text-neutral-400 text-sm md:text-base tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Scroll to begin your journey ↓
              </motion.p>
            </section>
          </div>
        </section>
      </FadeInSection>

      <section className="mb-90">
        <section className="relative min-h-screen z-10 overflow-hidden px-6 py-54 sm:px-12 lg:px-20">
          {/* <VaporTextEffect className="mx-auto mt-50 z-20 max-w-4xl text-center font-cinzel text-4xl leading-tight tracking-wide text-slate-100 sm:text-5xl">
              I design digital experiences that feel alive and make an impact.
            </VaporTextEffect> */}

          <VaporTextEffect
            texts={["Welcome"]}
            font={{
              fontFamily: "Sansation Light",
              fontSize: "48px",
              fontWeight: 300,
            }}
          />

          <div className="relative mx-auto max-w-6xl mt-[30%]">
            {/* Content row: portrait on the left, copy + button on the right */}
            <div className="relative mt-30 grid grid-cols-1 items-center gap-20 md:grid-cols-2 ">
              {/* Left column: portrait with glow */}
              <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80 lg:h-150 lg:w-150">
                {/* Soft glow behind the portrait */}
                <div className="absolute h-156 w-156 rounded-full bg-purple-500/10 blur-3xl " />

                {/* Portrait */}
                <img
                  src={avatarSrc}
                  alt="Portrait"
                  data-star-target
                  className="relative z-10 h-64 w-64 rounded-full object-cover ring-1 ring-purple-500/30 sm:h-72 sm:w-72 lg:h-86 lg:w-86"
                />
              </div>

              {/* Right column */}
              <div>
                <p className="text-sm leading-relaxed lg:text-2xl text-slate-300 w-full sm:text-base">
                  I create interactive interfaces that feel alive, combining
                  thoughtful design and technology to create experiences that
                  make an impact.
                </p>

                <button className="mt-6 rounded-full border border-slate-500/60 px-5 py-2 text-sm text-slate-200 transition hover:border-purple-400 hover:bg-purple-400/10">
                  Learn more
                </button>
              </div>
            </div>
          </div>
        </section>
      </section>

      {/* Project Crystals */}
      <section className="relative overflow-hidden pb-40">
        {/* Graphic Designs — crystal upper-left, text trailing below-right of it */}
        <div className="relative h-[440px] w-[440px]">
          <div className="absolute left-40 top-[4%] z-10 h-[500px] w-[300px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px] cursor-pointer">
            <a href="/projects">
              <MagicCrystal className="h-full w-full" />
            </a>
            <div className="absolute left-[6%] top-[8%] z-0 max-w-sm sm:top-[10%] sm:left-[8%]">
              <h2 className="font-cinzel text-4xl leading-tight text-white sm:text-6xl">
                Graphic
                <br />
                Designs
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-300 sm:text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                hendrerit purus feugiat.
              </p>
            </div>
          </div>
        </div>

        {/* UI/UX Designs — crystal lower-right, text trailing below-left of it */}
        <div className="relative h-[90vh] w-full mb-40">
          <div className="absolute right-50 top-[30%] z-10 h-[500px] w-[500px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px] cursor-pointer">
            <a href="/projects">
              <MagicCrystal2 className="h-full w-full" />
            </a>

            <div className="absolute right-[8%] top-[38%] z-0 max-w-sm text-right sm:right-[10%] sm:top-[42%]">
              <h2 className="font-cinzel text-4xl leading-tight text-white sm:text-6xl">
                UI/UX
                <br />
                Designs
              </h2>
              <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-300 sm:text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                hendrerit purus feugiat.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="h-full w-full relative z-10">
        <ScrollStorySection />
      </section>

      <Footer />
    </>
  );
}
