import React, { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  AnimatePresence,
} from "framer-motion";

function useLocalProgress(scrollYProgress, start, end) {
  return useTransform(scrollYProgress, [start, end], [0, 1], {
    clamp: true,
  });
}

function IntroFadeOverlay() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 4.1, delay: 0.8, ease: "easeInOut" }}
          onAnimationComplete={() => setVisible(false)}
          className="intro-fade-overlay"
        />
      )}
    </AnimatePresence>
  );
}

const INTRO_LINES = [
  {
    text: "DIGITAL EXPERIENCES THAT LEAVE A LASTING IMPRESSION.",
    align: "left",
  },
  {
    text: "WHERE THOUGHTFUL DESIGN MEETS INTERACTIVE TECHNOLOGY.",
    align: "right",
  },
  { text: "FOUR PHASES AND INFINITE POSSIBILITIES.", align: "left" },
];

// Total scroll distance for this section is 600vh. The reveal timing
// below is scaled by 420/600 = 0.7 so every line still appears at the
// exact same absolute scroll distance as the original 420vh version.
// The extra 180vh is spent entirely on a hold plateau (0.686 -> 0.92)
// where the text just sits fully visible with no motion, before the
// fade finally runs over the last 8% of the wrapper.
const INTRO_BEATS = {
  sectionEntrance: [1, 1],
  lines: [
    [0.056, 0.21],
    [0.224, 0.378],
    [0.392, 0.686],
  ],
  // Hold: 0.686 -> 0.92 (text fully visible, no fade). Fade: 0.92 -> 1.0.
  fadeOut: [0.92, 1.0],
};

const CHAR_STAGGER_FRACTION = 0.7;
const CHAR_DURATION_FRACTION = 0.35;

function AnimatedChar({ scrollYProgress, start, end, char }) {
  const local = useLocalProgress(scrollYProgress, start, end);

  const opacity = useTransform(local, [0, 1], [0, 1]);
  const y = useTransform(local, [0, 1], [10, 0]);
  const blurPx = useTransform(local, [0, 1], [6, 0]);
  const filter = useMotionTemplate`blur(${blurPx}px)`;

  return (
    <motion.span
      style={{ opacity, y, filter, display: "inline-block" }}
      className="intro-char"
    >
      {char === " " ? "\u00A0" : char}
    </motion.span>
  );
}

function IntroLine({ scrollYProgress, range, text, align }) {
  const [start, end] = range;
  const rangeSpan = end - start;

  const [foStart, foEnd] = INTRO_BEATS.fadeOut;
  const opacityOut = useTransform(scrollYProgress, [foStart, foEnd], [1, 0], {
    clamp: true,
  });

  const lineLocal = useLocalProgress(scrollYProgress, start, end);
  const lineY = useTransform(lineLocal, [0, 1], [6, 0]);

  const words = text.split(" ");
  const totalChars = text.replace(/ /g, "").length || 1;
  let charIndex = 0;

  return (
    <motion.p
      style={{ opacity: opacityOut, y: lineY }}
      className={`intro-line intro-line--${align}`}
    >
      {words.map((word, wi) => {
        const letters = word.split("").map((char, ci) => {
          const i = charIndex;
          charIndex += 1;

          const charStart =
            start + (i / totalChars) * (rangeSpan * CHAR_STAGGER_FRACTION);
          const charEnd = Math.min(
            end,
            charStart + rangeSpan * CHAR_DURATION_FRACTION,
          );

          return (
            <AnimatedChar
              key={`${wi}-${ci}`}
              scrollYProgress={scrollYProgress}
              start={charStart}
              end={charEnd}
              char={char}
            />
          );
        });

        return (
          <React.Fragment key={wi}>
            <span className="intro-word">{letters}</span>
            {wi < words.length - 1 ? " " : ""}
          </React.Fragment>
        );
      })}
    </motion.p>
  );
}

function IntroTextSection({ scrollYProgress }) {
  const [entStart, entEnd] = INTRO_BEATS.sectionEntrance;
  const sectionOpacity = useTransform(
    scrollYProgress,
    [entStart, entEnd],
    [0, 1],
    {
      clamp: true,
    },
  );
  const sectionY = useTransform(scrollYProgress, [entStart, entEnd], [40, 0], {
    clamp: true,
  });

  return (
    <motion.div
      style={{ opacity: sectionOpacity, y: sectionY }}
      className="intro-panel"
    >
      {INTRO_LINES.map((line, i) => (
        <IntroLine
          key={line.text}
          scrollYProgress={scrollYProgress}
          range={INTRO_BEATS.lines[i]}
          text={line.text}
          align={line.align}
        />
      ))}
    </motion.div>
  );
}

const STEPS = [
  {
    title: "Discover",
    desc: "Research the project's goals, audience, and inspiration to establish a strong creative direction before designing.",
  },
  {
    title: "Design",
    desc: "Shape intuitive user interfaces through thoughtful layouts, visual hierarchy, and consistent design systems.",
  },
  {
    title: "Develop",
    desc: "Transform concepts into responsive, interactive experiences using modern front-end technologies and smooth motion.",
  },
  {
    title: "Refine",
    desc: "Optimize performance, improve accessibility, polish animations, and ensure every detail is ready for deployment.",
  },
];

// Wrapper grew from 380vh to 740vh (+360vh, roughly +4s of extra dwell
// time at the ~90vh/sec rate implied by the intro section's hold
// plateau). Every point below is scaled by 380/740 (~0.5135) so nodes
// still activate at the same absolute scroll distance as before. Unlike
// the old version (which just held at full opacity until the wrapper
// ended), this section now has an actual fade-out over the last 8% of
// the wrapper, mirroring the intro section's convention.
const NODE_POINTS = [0.0606, 0.1705, 0.2758, 0.3728];
const ACTIVATION_WINDOW = 0.0257;

// Pure-opacity fade in, then a long hold, then a pure-opacity fade out.
// No y movement on either edge, so the panel materializes and
// dematerializes in place rather than sliding.
const PANEL_FADE_IN = [0, 0.077];
const PANEL_FADE_OUT = [0.92, 1.0];

function TimelineNode({ scrollYProgress, point, step, index }) {
  const activation = useTransform(
    scrollYProgress,
    [point - ACTIVATION_WINDOW, point],
    [0, 1],
    { clamp: true },
  );

  const dotScale = useTransform(activation, [0, 1], [1, 1.25]);
  const dotColor = useTransform(
    activation,
    [0, 1],
    ["rgba(120,120,130,0.5)", "#8B5CF6"],
  );
  const glow = useTransform(
    activation,
    [0, 1],
    ["0 0 0px rgba(139,92,246,0)", "0 0 22px rgba(139,92,246,0.85)"],
  );
  const titleColor = useTransform(activation, [0, 1], ["#6b6b74", "#ffffff"]);
  const descOpacity = useTransform(activation, [0, 1], [0.15, 1]);
  const descY = useTransform(activation, [0, 1], [6, 0]);

  const isTop = index % 2 === 0;

  return (
    <div className={`timeline-node timeline-node--${isTop ? "top" : "bottom"}`}>
      {isTop && (
        <motion.div
          style={{ color: titleColor, opacity: descOpacity, y: descY }}
          className="timeline-copy"
        >
          <div className="timeline-title">{step.title}</div>
          <p className="timeline-desc">{step.desc}</p>
        </motion.div>
      )}

      <motion.div
        style={{ scale: dotScale, backgroundColor: dotColor, boxShadow: glow }}
        className="timeline-dot"
      />

      {!isTop && (
        <motion.div
          style={{ color: titleColor, opacity: descOpacity, y: descY }}
          className="timeline-copy"
        >
          <div className="timeline-title">{step.title}</div>
          <p className="timeline-desc">{step.desc}</p>
        </motion.div>
      )}
    </div>
  );
}

function ProcessTimeline({ scrollYProgress }) {
  // Fade in, hold, fade out — all pure opacity, no y transform, so it
  // never reads as "sliding," just materializing and dematerializing.
  const [fadeInStart, fadeInEnd] = PANEL_FADE_IN;
  const [fadeOutStart, fadeOutEnd] = PANEL_FADE_OUT;

  const panelOpacity = useTransform(
    scrollYProgress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0],
    { clamp: true },
  );

  const lineWidth = useTransform(
    scrollYProgress,
    [0.0205, 0.3749],
    ["0%", "100%"],
    {
      clamp: true,
    },
  );

  return (
    <motion.div style={{ opacity: panelOpacity }} className="timeline-panel">
      <div className="timeline-track">
        <div className="timeline-track-bg" />
        <motion.div
          style={{ width: lineWidth }}
          className="timeline-track-fill"
        />

        <div className="timeline-nodes">
          {STEPS.map((step, i) => (
            <TimelineNode
              key={step.title}
              scrollYProgress={scrollYProgress}
              point={NODE_POINTS[i]}
              step={step}
              index={i}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function ScrollStorySection() {
  const introRef = useRef(null);
  const timelineRef = useRef(null);

  const { scrollYProgress: introProgress } = useScroll({
    target: introRef,
    offset: ["start start", "end end"],
  });

  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start start", "end end"],
  });

  return (
    <>
      <style>{`
.scroll-story-root {
  position: relative;
  z-index: 1;
  color: #fff;
  background: linear-gradient(
      to bottom,
    transparent 0,
    #000 60vh,
    #000 calc(100% - 60vh),
    transparent 100%);
}

.intro-fade-overlay {
  position: fixed;
  inset: 0;
  background: #000;
  z-index: 9999;
  pointer-events: none;
}

.intro-scroll-wrapper {
  position: relative;
  height: 600vh;
}
.intro-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.intro-panel {
  width: 100%;
  max-width: 1100px;
  padding: 0 22px;
  display: flex;
  flex-direction: column;
  gap: clamp(28px, 6vh, 64px);
}
.intro-line {
  margin: 0;
  font-family: "Cinzel Regular", sans-serif;
  font-weight: 400;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: clamp(1rem, 2.4vw, 1.65rem);
  line-height: 1.5;
  max-width: 720px;
  will-change: opacity, transform;
}
.intro-word {
  display: inline-block;
}
.intro-char {
  will-change: opacity, transform, filter;
}
.intro-line--left {
  text-align: left;
  margin-right: auto;
}
.intro-line--right {
  text-align: right;
  margin-left: auto;
}

@media (max-width: 640px) {
  .intro-line--left,
  .intro-line--right {
    text-align: left;
    margin: 0;
    max-width: 100%;
  }
}

.timeline-scroll-wrapper {
  position: relative;
  height: 740vh;
}
.timeline-sticky {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.timeline-panel {
  width: 100%;
  max-width: 1200px;
  padding: 0 32px;
  will-change: opacity;
}
.timeline-track {
  position: relative;
  display: flex;
  align-items: center;
}
.timeline-track-bg {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  background: rgba(255, 255, 255, 0.12);
  transform: translateY(-50%);
}
.timeline-track-fill {
  position: absolute;
  left: 0;
  top: 50%;
  height: 2px;
  background: linear-gradient(90deg, #6d28d9, #8b5cf6);
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.6);
  transform: translateY(-50%);
}
.timeline-nodes {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.timeline-node {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
}
.timeline-node--top {
  justify-content: flex-end;
}
.timeline-dot {
  width: 14px;
  height: 14px;
  border-radius: 999px;
  margin: 18px 0;
}
.timeline-copy {
  text-align: center;
  will-change: opacity, transform;
}
.timeline-title {
  font-family: "Cinzel Regular", sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  margin-bottom: 6px;
}
.timeline-desc {
  font-family: "Sansation Light", sans-serif;
  font-size: 0.78rem;
  line-height: 1.45;
  color: rgb(255, 255, 255);
  margin: 0;
}

@media (max-width: 900px) {
  .timeline-nodes {
    flex-direction: column;
    align-items: flex-start;
    gap: 48px;
  }
  .timeline-track-bg,
  .timeline-track-fill {
    top: 0;
    bottom: 0;
    left: 6px;
    width: 2px;
    height: auto;
    right: auto;
  }
  .timeline-node {
    flex-direction: row;
    align-items: center;
    width: 100%;
    text-align: left;
  }
  .timeline-node--top,
  .timeline-node--bottom {
    justify-content: flex-start;
  }
  .timeline-copy {
    text-align: left;
    margin-left: 16px;
  }
}
      `}</style>

      <div className="scroll-story-root">
        <IntroFadeOverlay />

        <div ref={introRef} className="intro-scroll-wrapper">
          <div className="intro-sticky">
            <IntroTextSection scrollYProgress={introProgress} />
          </div>
        </div>

        <div ref={timelineRef} className="timeline-scroll-wrapper">
          <div className="timeline-sticky">
            <ProcessTimeline scrollYProgress={timelineProgress} />
          </div>
        </div>
      </div>
    </>
  );
}
