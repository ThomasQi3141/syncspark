"use client";

import { motion } from "framer-motion";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-30 w-full bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 py-4">
      <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent tracking-tight select-none">
        CodeSync.io
      </span>
      <div className="flex items-center gap-8">
        <a
          href="#about"
          className="hover:text-fuchsia-400 transition-colors duration-700">
          About
        </a>
        <a
          href="#features"
          className="hover:text-cyan-400 transition-colors duration-700">
          Features
        </a>
        <a href="#get-started">
          <button className="ml-4 px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-700">
            Get Started
          </button>
        </a>
      </div>
    </nav>
  );
}
