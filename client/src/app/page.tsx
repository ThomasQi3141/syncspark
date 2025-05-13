"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "./__components/Navbar";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <>
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] text-white">
        <div className="absolute inset-0 overflow-y-auto">
          <Navbar />

          {/* Hero Section */}
          <section className="flex flex-col items-center justify-center text-center py-28 px-4 relative">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
              className="text-5xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
              Pair Programming, <br /> Real-Time. Effortless.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-lg md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto">
              SyncSpark lets you collaborate, code, and create
              together—instantly. Secure, fast, and beautifully simple.
            </motion.p>
            <motion.a
              href="/new-room"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="inline-block px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-700"
              onClick={() => {
                router.push("/new-room");
              }}>
              Get Started
            </motion.a>
            <div className="absolute left-0 top-0 w-full h-full pointer-events-none select-none opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-fuchsia-500/20 via-transparent to-transparent" />
          </section>

          {/* Stats/Features Section */}
          <section
            id="features"
            className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay: 0.2 + i * 0.15 }}
                className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-8 flex flex-col items-center shadow-lg hover:scale-105 transition-all duration-700">
                <span className={`text-3xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </span>
                <span className="text-lg font-semibold mb-1">{stat.title}</span>
                <span className="text-gray-300 text-sm text-center">
                  {stat.desc}
                </span>
              </motion.div>
            ))}
          </section>

          {/* Why Choose Section */}
          <section id="about" className="max-w-5xl mx-auto px-4 py-12">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-center mb-10">
              Why Choose{" "}
              <span className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                SyncSpark?
              </span>
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {whyChoose.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.2 + i * 0.15 }}
                  className="rounded-2xl bg-white/5 border border-white/10 p-6 shadow-md hover:bg-white/10 transition-all duration-700">
                  <span className={`font-bold text-lg ${item.color}`}>
                    {item.title}
                  </span>
                  <p className="text-gray-300 mt-2">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section id="get-started" className="py-16 px-4 text-center">
            <motion.h3
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.2 }}
              className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Code Together?
            </motion.h3>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.4 }}
              className="text-gray-300 mb-8">
              Join developers collaborating in real-time with CodeSync.
            </motion.p>
            <motion.a
              href="#"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.6 }}
              className="inline-block px-8 py-4 rounded-full font-bold text-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-700"
              onClick={() => {
                router.push("/new-room");
              }}>
              Start Coding Now
            </motion.a>
          </section>

          {/* Footer */}
          <footer className="w-full border-t border-white/10 bg-white/5 backdrop-blur-md py-6 flex items-center justify-between px-8 text-sm text-gray-400">
            <span>
              &copy; {new Date().getFullYear()} CodeSync. All rights reserved.
            </span>
            <span className="flex items-center gap-1">
              Built by
              <a
                href="https://www.thomasqi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent ml-1 hover:opacity-80 transition-opacity">
                Thomas Qi
              </a>
            </span>
          </footer>
        </div>
      </div>
    </>
  );
}

const stats = [
  {
    value: "100%",
    title: "Live Sync",
    desc: "Instant code updates across all collaborators.",
    color: "text-fuchsia-400",
  },
  {
    value: "24/7",
    title: "Availability",
    desc: "Collaborate anytime, anywhere.",
    color: "text-cyan-400",
  },
  {
    value: "Secure",
    title: "End-to-End",
    desc: "Encrypted sessions for your privacy.",
    color: "text-pink-400",
  },
];

const whyChoose = [
  {
    title: "Real-Time Collaboration",
    desc: "See changes instantly as your team members code, with seamless cursor tracking and presence awareness.",
    color: "text-fuchsia-400",
  },
  {
    title: "Lightning Fast",
    desc: "Built with WebSocket technology for minimal latency, ensuring your coding session stays in sync.",
    color: "text-cyan-400",
  },
  {
    title: "Developer Experience",
    desc: "Syntax highlighting, auto-completion, and familiar IDE features make coding together feel natural.",
    color: "text-pink-400",
  },
  {
    title: "Easy to Use",
    desc: "No complex setup required. Just share a link and start coding together instantly.",
    color: "text-blue-400",
  },
];
