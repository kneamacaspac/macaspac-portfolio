// src/components/navigation/Navbar.jsx
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Projects", path: "/projects" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <>
      {/* Hamburger Button - fixed top right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-8 right-8 flex flex-col justify-center items-center w-10 h-10 gap-1.5 z-50 cursor-pointer"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span
          className={`block h-0.5 w-8 rounded transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2 bg-black" : "bg-white"
          }`}
        />
        <span
          className={`block h-0.5 w-8 rounded transition-all duration-300 ${
            isOpen ? "opacity-0 bg-black" : "opacity-100 bg-white"
          }`}
        />
        <span
          className={`block h-0.5 w-8 rounded transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2 bg-black" : "bg-white"
          }`}
        />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Slide-out Menu */}
      <nav
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <ul className="flex flex-col gap-6 mt-24 px-8">
          {links.map((link) => (
            <li key={link.name}>
              <Link
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
              >
                {link.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
