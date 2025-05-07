"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { PulseLoader } from "react-spinners";
import Navbar from "../__components/Navbar";
import { useCreateRoomMutation } from "@/store/slices/roomsSlice";

export default function NewRoom() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [createRoom, { isLoading }] = useCreateRoomMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createRoom({
        name: roomName,
        isPublic,
      }).unwrap();

      // Navigate to the room page
      router.push(`/${result.code}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    }
  };

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

          <div className="max-w-2xl mx-auto px-4 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
              <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                Create New Room
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="roomName"
                    className="block text-sm font-medium text-gray-300 mb-2">
                    Room Name
                  </label>
                  <input
                    type="text"
                    id="roomName"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 outline-none transition-all duration-300"
                    placeholder="Enter room name"
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-sm font-medium text-gray-300">
                    Public Room?
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsPublic(!isPublic)}
                    disabled={isLoading}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500/20"
                    style={{
                      backgroundColor: isPublic ? "#8B5CF6" : "#374151",
                    }}>
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPublic ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
                <div className="text-sm text-gray-400">
                  {isPublic ? (
                    <span>Anyone can join</span>
                  ) : (
                    <span>Only users with room code can join</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-6 py-3 rounded-lg font-semibold bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:shadow-lg hover:shadow-fuchsia-500/30 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <PulseLoader
                        color="#ffffff"
                        size={10}
                        margin={4}
                        speedMultiplier={0.8}
                      />
                      <span className="ml-2">Creating Room...</span>
                    </div>
                  ) : (
                    "Create Room"
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
}
