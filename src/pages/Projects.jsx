import StarField from '../components/ui/StarField.jsx'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'

export default function Projects({
    avatarSrc = "src/assets/images/nea-photo.png",
}) {

    const containerRef = useRef(null)

  // Tracks scroll progress (0 to 1) of the whole page
    const { scrollYProgress } = useScroll()

  // Map scroll progress -> opacity (hero fades as you scroll down)
    const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])

  // Map scroll progress -> a dark overlay that gets stronger as you scroll
    const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.85])

    

    return (
        <>
        <section id="hero" className="flex h-screen flex flex-col items-center justify-center relative z-0">
            <div className="absolute inset-0 z-0">
                <StarField />
             </div>
            
    <div ref={containerRef} className="relative absolute text-neutral-100">

      {/* Dark overlay that grows as you scroll, sitting above the background */}
      <motion.div
        className="fixed inset-0 pointer-events-none z-10"
        style={{ opacity: overlayOpacity }}
      />

      {/* Hero section */}
      
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
      </section>
    </div>
        </section>

        <section id="about-sec">
             <section className="relative min-h-screen overflow-hidden bg-[#07040f] px-6 py-24 sm:px-12 lg:px-20">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-purple-700/20 blur-[120px]" />
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
 
            {/* Squiggle line (SVG), sits behind/around the circle */}
            <svg
              viewBox="0 0 400 260"
              className="absolute -bottom-6 left-1/2 h-40 w-[26rem] -translate-x-1/2"
              fill="none"
            >
              <path
                d="M20 120 C 90 40, 160 200, 210 120 S 340 20, 380 110"
                stroke="url(#squiggleGradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_rgba(192,132,252,0.8)]"
              />
              <defs>
                <linearGradient id="squiggleGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
                  <stop offset="50%" stopColor="#d8b4fe" stopOpacity="1" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
 
            {/* Portrait */}
            <img
              src={avatarSrc}
              alt="Portrait"
              className="relative z-10 h-48 w-48 rounded-full object-cover ring-1 ring-purple-300/30 sm:h-56 sm:w-56"
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
        </>
    );

}