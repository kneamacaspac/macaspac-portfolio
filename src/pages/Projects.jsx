import StarField from "../components/ui/StarField.jsx";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export default function Projects({
  avatarSrc = "src/assets/images/nea-photo.png",
}) {
  const containerRef = useRef(null);

  // Tracks scroll progress (0 to 1) of the whole page
  const { scrollYProgress } = useScroll();

  // Map scroll progress -> opacity (hero fades as you scroll down)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  // Map scroll progress -> a dark overlay that gets stronger as you scroll
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 0.85]);

  return <></>;
}
