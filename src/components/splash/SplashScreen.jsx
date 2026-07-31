import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Show the splash for 2 seconds, then start fading out
    const timer = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950"
      initial={{ opacity: 1 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      // Once the fade-out finishes, tell the parent we're done
      onAnimationComplete={() => {
        if (!visible) onFinish()
      }}
    >
      <motion.h1
        className="text-3xl md:text-5xl font-cinzel tracking-wide text-neutral-100"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        Nea Macaspac
      </motion.h1>
    </motion.div>
  )
}