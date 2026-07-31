import { motion } from 'framer-motion'

export default function About() {
  return (
    <motion.div
      className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-xl">
        <motion.h1
          className="text-3xl md:text-5xl font-semibold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          About Me
        </motion.h1>
        <motion.p
          className="text-neutral-400 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          I'm a second-year IT student specializing in Mobile and Web
          Applications, and a freelance designer exploring UI/UX, front-end
          development, and branding. This site is part portfolio, part
          playground for learning new front-end techniques.
        </motion.p>
      </div>
    </motion.div>
  )
}