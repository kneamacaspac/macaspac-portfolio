// components/cursors/SmokeCursor.jsx
"use client";

import { useEffect, useRef } from "react";

// Module-level constants — stable references across renders,
// so they don't trigger the effect to restart.
const DEFAULT_COLORS = ["#ff6ec7", "#7afcff", "#a685ff", "#ffd36e", "#6effa1"];

const SmokeCursor = ({
  colors = DEFAULT_COLORS,
  particlesPerMove = 2,
  minSize = 8,
  maxSize = 22,
  growth = 0.35,
  fadeSpeed = 0.012,
  drift = 0.6,
  spread = 6,
  blendMode = "lighter",
  zIndex = 9999, // above everything else on the page by default
  burstOnClick = 18,
  className = "",
  debug = false, // set true to prove the canvas is wired up correctly
}) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const pickColor = () => colors[Math.floor(Math.random() * colors.length)];

    const spawnPuff = (x, y) => {
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -Math.random() * drift - 0.2,
        size: minSize + Math.random() * (maxSize - minSize),
        alpha: 0.5 + Math.random() * 0.3,
        color: pickColor(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
      });
    };

    const handleMove = (e) => {
      const { x: lastX, y: lastY } = mouseRef.current;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      const steps = Math.max(1, Math.min(8, Math.floor(dist / 10)));
      for (let i = 0; i < steps; i++) {
        const t = i / steps;
        const px = lastX + (e.clientX - lastX) * t;
        const py = lastY + (e.clientY - lastY) * t;
        for (let j = 0; j < particlesPerMove; j++) spawnPuff(px, py);
      }
    };

    const handleClick = (e) => {
      if (!burstOnClick) return;
      for (let i = 0; i < burstOnClick; i++) spawnPuff(e.clientX, e.clientY);
    };

    window.addEventListener("mousemove", handleMove);
    if (burstOnClick) window.addEventListener("click", handleClick);

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (debug) {
        // Static marker — if you see this, the canvas itself is
        // correctly mounted, sized, and stacked above everything.
        ctx.fillStyle = "magenta";
        ctx.beginPath();
        ctx.arc(60, 60, 20, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = blendMode;

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.vy -= 0.002;
        p.size += growth;
        p.alpha -= fadeSpeed;
        p.rotation += p.rotationSpeed;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.size,
        );
        gradient.addColorStop(0, hexToRgba(p.color, p.alpha));
        gradient.addColorStop(0.6, hexToRgba(p.color, p.alpha * 0.35));
        gradient.addColorStop(1, hexToRgba(p.color, 0));

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.globalCompositeOperation = "source-over";
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      if (burstOnClick) window.removeEventListener("click", handleClick);
      particlesRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <- run once. colors/sizes/etc are read fresh via closures on each mount;
  //    if you need them to update live without remounting, use refs instead.

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none fixed inset-0 block h-full w-full ${className}`}
      style={{ zIndex, background: "transparent" }}
    />
  );
};

function hexToRgba(hex, alpha) {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default SmokeCursor;
