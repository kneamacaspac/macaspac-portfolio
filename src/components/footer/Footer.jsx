// components/sections/Footer.jsx

const leftLinks = ["Home", "About", "Designs", "Skills", "Contact"];
const rightLinks = ["Social Media", "Email", "Figma", "Github", "LinkedIn"];

export default function Footer() {
  return (
    <footer className="relative h-full w-full z-10 flex flex-col items-center justify-center gap-8 px-6 py-24 text-center">
      <h2 className="font-cinzel max-w-3xl text-3xl leading-snug text-white sm:text-5xl">
        Have an idea? Let&apos;s bring it to life.
      </h2>

      <div className="flex w-full max-w-5xl flex-col items-center justify-between gap-8 sm:flex-row sm:items-center">
        {/* Left nav */}
        <ul className="flex flex-col gap-2 text-sm text-neutral-300 sm:text-base">
          {leftLinks.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="transition hover:text-white"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Right nav */}
        <ul className="flex flex-col gap-2 text-sm text-neutral-300 sm:text-base">
          {rightLinks.map((link) => (
            <li key={link}>
              <a
                href={`#${link.toLowerCase().replace(/\s+/g, "-")}`}
                className="transition hover:text-white"
              >
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <h2 className="font-cinzel max-w-3xl text-3xl leading-snug text-white sm:text-5xl">
        Let&apos;s create something worth remembering.
      </h2>
    </footer>
  );
}
