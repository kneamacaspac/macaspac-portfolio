// src/components/ui/FadeInSection.jsx
import { motion } from "framer-motion";

export default function FadeInSection({
  children,
  className = "",
  y = 30,
  duration = 1,
  delay = 0,
  once = false, // ← changed default so it replays on scroll-back
  amount = 0.2,
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
