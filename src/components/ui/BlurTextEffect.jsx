"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const BlurTextEffect = ({ children, className = "" }) => {
  const containerRef = useRef(null);
  const text = typeof children === "string" ? children : String(children);

  useGSAP(
    () => {
      const chars = containerRef.current.querySelectorAll("span.char");
      if (!chars.length) return;

      gsap.fromTo(
        chars,
        { opacity: 0, y: 10, filter: "blur(8px)" },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.015,
          clearProps: "filter",
        },
      );
    },
    { scope: containerRef, dependencies: [text] },
  );

  return (
    <span className={`inline-block ${className}`} ref={containerRef}>
      {text.split("").map((char, i) => (
        <span
          key={`${char}-${i}`}
          className="char inline-block"
          style={{ whiteSpace: "pre" }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
};

export default BlurTextEffect;
