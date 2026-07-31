// src/pages/Home.jsx

import StarField from "../components/ui/StarField.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import FadeInSection from "../components/transitions/FadeInSection.jsx";
import MagicCrystal from "../components/3d-components/MagicCrystal1.jsx";
import MagicCrystal2 from "../components/3d-components/MagicCrystal2.jsx";

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
      <FadeInSection>
        <section
          id="hero"
          className="flex h-screen flex-col items-center justify-center relative z-0 overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <StarField />
          </div>

          {/* Fade the starfield into the next section's background color */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-80 z-[5] bg-gradient-to-b from-transparent to-[#07040f]" />

          <div ref={containerRef} className="relative text-neutral-100">
            {/* Scroll-driven darkening overlay */}
            <motion.div
              className="fixed inset-0 pointer-events-none z-10 bg-black"
              style={{ opacity: overlayOpacity }}
            />

            <section className="h-screen flex flex-col items-center justify-center relative z-0">
              <motion.h1
                style={{ opacity: heroOpacity }}
                className="text-4xl mx-10 font-cinzel md:text-7xl tracking-tight font-cinzel-regular text-center"
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

              <div
                id="herp-crystal-container"
                className="absolute inset-0 z-[800] flex items-center justify-center pointer-events-none"
              >
                <MagicCrystal2 className="h-80 w-80" />
              </div>
            </section>
          </div>
        </section>
      </FadeInSection>

      <FadeInSection>
        <section id="about-sec">
          <section className="relative min-h-screen overflow-hidden bg-[#05030D]  px-6 py-24 sm:px-12 lg:px-20">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full  blur-[120px]" />
              <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl">
              {/* Headline */}
              <h1 className="mx-auto max-w-4xl text-center font-serif text-4xl leading-tight tracking-wide text-slate-100 sm:text-5xl">
                I design digital experiences that feel alive and make an impact.
              </h1>

              {/* Content row: portrait on the left, copy + button on the right */}
              <div className="relative mt-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                {/* Left column: portrait with glow */}
                <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
                  {/* Soft glow behind the portrait */}
                  <div className="absolute h-56 w-56 rounded-full bg-purple-500/40 blur-3xl" />

                  {/* Portrait */}
                  <img
                    src={avatarSrc}
                    alt="Portrait"
                    className="relative z-10 h-48 w-48 rounded-full object-cover ring-1 ring-purple-500/30 sm:h-56 sm:w-56"
                  />
                </div>

                {/* Right column */}
                <div className="max-w-md">
                  <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
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
      </FadeInSection>

      {/* ---------------------------------------------------------
          Two crystals, staggered diagonally: Graphic Designs
          (top-left) and UI/UX Designs (bottom-right), each with
          its heading tucked partly behind the crystal's glow.
      --------------------------------------------------------- */}
      <section
        id="project-button-sec"
        className="relative bg-[#05030D] overflow-hidden"
      >
        {/* Graphic Designs — crystal upper-left, text trailing below-right of it */}
        <div className="relative h-[440px] w-[440px]">
          <div className="absolute left-40 top-[4%] z-10 h-[500px] w-[300px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px] cursor-pointer">
            <MagicCrystal className="h-full w-full" />
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
        <div className="relative h-[90vh] w-full">
          <div className="absolute right-50 top-[30%] z-10 h-[500px] w-[300px] sm:h-[500px] sm:w-[500px] lg:h-[800px] lg:w-[800px] cursor-pointer">
            <MagicCrystal2 className="h-full w-full" />

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

      <FadeInSection>
        <section id="about-sec">
          <section className="relative min-h-screen overflow-hidden bg-[#05030D]  px-6 py-24 sm:px-12 lg:px-20">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full  blur-[120px]" />
              <div className="absolute right-0 top-1/3 h-[400px] w-[400px] rounded-full bg-fuchsia-600/10 blur-[100px]" />
            </div>

            <div className="relative mx-auto max-w-6xl">
              {/* Headline */}
              <h1 className="mx-auto max-w-4xl text-center font-serif text-4xl leading-tight tracking-wide text-slate-100 sm:text-5xl">
                I design digital experiences that feel alive and make an impact.
              </h1>

              {/* Content row: copy + button on the left, portrait on the right */}
              <div className="relative mt-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2">
                {/* Left column */}
                <div className="max-w-md">
                  <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
                    I create interactive interfaces that feel alive, combining
                    thoughtful design and technology to create experiences that
                    make an impact.
                  </p>

                  <button className="mt-6 rounded-full border border-slate-500/60 px-5 py-2 text-sm text-slate-200 transition hover:border-purple-400 hover:bg-purple-400/10">
                    Learn more
                  </button>
                </div>

                {/* Right column: portrait with glow + squiggle */}
                <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
                  {/* Soft glow behind the portrait */}
                  <div className="absolute h-56 w-56 rounded-full bg-purple-500/40 blur-3xl" />

                  {/* Portrait */}
                  <img
                    src={avatarSrc}
                    alt="Portrait"
                    className="relative z-10 h-48 w-48 rounded-full object-cover ring-1 ring-purple-500/30 sm:h-56 sm:w-56"
                  />
                </div>
              </div>

              {/* Bottom-right supporting paragraph */}
              <p className="mt-12 max-w-sm text-right text-sm leading-relaxed text-slate-300 sm:ml-auto sm:text-base">
                I also explore how AI can be integrated into the industry to
                enhance digital experiences, streamline creative processes, and
                shape the future of interactive design.
              </p>
            </div>
          </section>
        </section>
      </FadeInSection>
    </>
  );
}
