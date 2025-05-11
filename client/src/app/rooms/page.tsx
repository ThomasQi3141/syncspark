"use client";

import React, { useState } from "react";
import Navbar from "../__components/Navbar";
import { useGetRoomsQuery } from "@/store/slices/roomsSlice";
import { useRouter, usePathname } from "next/navigation";

const ROOM_COLORS = [
  "bg-fuchsia-200/60 border-fuchsia-400/30",
  "bg-cyan-200/60 border-cyan-400/30",
  "bg-amber-200/60 border-amber-400/30",
  "bg-pink-200/60 border-pink-400/30",
  "bg-blue-200/60 border-blue-400/30",
  "bg-green-200/60 border-green-400/30",
  "bg-purple-200/60 border-purple-400/30",
  "bg-rose-200/60 border-rose-400/30",
  "bg-lime-200/60 border-lime-400/30",
  "bg-orange-200/60 border-orange-400/30",
];

export default function RoomsPage() {
  const { data: rooms = [], isLoading, isError, refetch } = useGetRoomsQuery();
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  // Filter rooms by name or code
  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] text-white">
      <div className="absolute inset-0 overflow-y-auto">
        <Navbar key={pathname} />
        <div className="max-w-5xl mx-auto pt-12 pb-12 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              Public Rooms
            </h1>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter rooms..."
                className="px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30 transition-all duration-200 w-full md:w-56"
              />
              <button
                onClick={() => refetch()}
                className="ml-2 px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white shadow-xl hover:shadow-fuchsia-500/30 transition-all duration-700 cursor-pointer">
                Refresh
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center text-lg text-gray-300 py-20">
              Loading rooms...
            </div>
          ) : isError ? (
            <div className="text-center text-lg text-red-400 py-20">
              Failed to load rooms.
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center text-lg text-gray-400 py-20">
              No public rooms found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredRooms.map((room, i) => (
                <button
                  key={room.code}
                  onClick={() => router.push(`/${room.code}`)}
                  className={`relative flex flex-col items-start border-2 rounded-2xl shadow-xl p-6 cursor-pointer hover:scale-105 transition-transform duration-300 ${
                    ROOM_COLORS[i % ROOM_COLORS.length]
                  }`}
                  style={{ minHeight: 120 }}>
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-lg font-bold text-gray-800 truncate max-w-[70%]">
                      {room.name}
                    </span>
                    <span className="ml-2 px-2 py-1 rounded-full bg-white/80 text-gray-700 text-xs font-semibold">
                      {room.users.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <span className="font-mono tracking-widest text-base text-gray-700 bg-white/70 px-2 py-0.5 rounded">
                      {room.code}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {room.isPublic ? "Public" : "Private"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Created {new Date(room.createdAt).toLocaleString()}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
