"use client";

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const showGetStarted = pathname !== "/new-room";
  const isInRoom = pathname.length === 5; // Room codes are 4 characters + leading slash
  const isRoomsPage = pathname === "/rooms";

  if (isInRoom) return null;

  return (
    <nav className="sticky top-0 z-30 w-full bg-white/5 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-8 py-4">
      <span
        onClick={() => router.push("/")}
        className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent tracking-tight select-none hover:opacity-80 transition-opacity cursor-pointer">
        CodeSync.io
      </span>
      <div className="flex items-center gap-8">
        {!isRoomsPage && (
          <button
            onClick={() => router.push("/rooms")}
            className="ml-4 px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-700 cursor-pointer">
            Browse Rooms
          </button>
        )}
        {showGetStarted && (
          <button
            onClick={() => router.push("/new-room")}
            className="ml-4 px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-700 cursor-pointer">
            Create a Room
          </button>
        )}
      </div>
    </nav>
  );
}
