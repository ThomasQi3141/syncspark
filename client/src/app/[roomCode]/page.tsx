"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useGetRoomQuery } from "@/store/slices/roomsSlice";
import { getSocket } from "../../lib/socket";

const languages = [
  { id: "javascript", name: "JavaScript" },
  { id: "typescript", name: "TypeScript" },
  { id: "python", name: "Python" },
  { id: "java", name: "Java" },
  { id: "csharp", name: "C#" },
  { id: "cpp", name: "C++" },
  { id: "go", name: "Go" },
  { id: "rust", name: "Rust" },
];

const themes = [
  { id: "vs-dark", name: "Dark" },
  { id: "light", name: "Light" },
  { id: "hc-black", name: "High Contrast" },
];

function generateGuestName() {
  return `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
}

export default function RoomCode() {
  const pathname = usePathname();
  const router = useRouter();
  const roomCode = pathname.slice(1); // Remove the leading slash
  const { data: room, isLoading, error } = useGetRoomQuery(roomCode);
  const [code, setCode] = useState("// Start coding here...");
  const [language, setLanguage] = useState("javascript");
  const [theme, setTheme] = useState("vs-dark");
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [nickname, setNickname] = useState(generateGuestName());
  const [showNameModal, setShowNameModal] = useState(true);
  const [userList, setUserList] = useState<{ id: string; nickname: string }[]>(
    []
  );
  const [showUserList, setShowUserList] = useState(false);
  const userListModalRef = useRef<HTMLDivElement>(null);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);

  useEffect(() => {
    if (!roomCode || showNameModal) return;
    const socket = getSocket();
    socket.connect();
    socket.emit("join-room", { roomCode, nickname });

    // Listen for user-list updates
    const handleUserList = (users: { id: string; nickname: string }[]) => {
      setUserList(users);
    };
    socket.on("user-list", handleUserList);

    // Listen for language-change
    const handleLanguageChange = (newLanguage: string) => {
      setLanguage(newLanguage);
    };
    socket.on("language-change", handleLanguageChange);

    // Listen for code-update
    const handleCodeUpdate = (newCode: string) => {
      setIsRemoteUpdate(true);
      setCode(newCode);
    };
    socket.on("code-update", handleCodeUpdate);

    return () => {
      socket.off("user-list", handleUserList);
      socket.off("language-change", handleLanguageChange);
      socket.off("code-update", handleCodeUpdate);
    };
  }, [roomCode, showNameModal, nickname]);

  // Close modal when clicking outside
  useEffect(() => {
    if (!showUserList) return;
    function handleClick(e: MouseEvent) {
      if (
        userListModalRef.current &&
        !userListModalRef.current.contains(e.target as Node)
      ) {
        setShowUserList(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserList]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value);
      if (!isRemoteUpdate) {
        getSocket().emit("code-change", { roomCode, code: value });
      }
      setIsRemoteUpdate(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] text-white flex items-center justify-center">
        <div className="text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
          Loading room...
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            404
          </h1>
          <p className="text-xl text-gray-300">
            Room <span className="text-white font-medium">{roomCode}</span> not
            found
          </p>
          <p className="text-gray-400 max-w-md mx-auto">
            The room you're looking for doesn't exist or has been deleted.
            Create a new room to start coding.
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white font-medium hover:opacity-90 transition-opacity cursor-pointer">
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Name Modal */}
      {showNameModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] rounded-2xl shadow-2xl p-8 min-w-[340px] flex flex-col items-center border border-white/10">
            <label className="mb-3 text-white font-semibold text-xl tracking-wide">
              Enter your nickname
            </label>
            <div className="flex w-full items-center">
              <input
                className="flex-1 px-4 py-2 rounded-l-lg bg-white/10 text-white border-none placeholder:text-gray-400 text-base font-medium focus:outline-none"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                autoFocus
                placeholder="Your nickname"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && nickname.trim())
                    setShowNameModal(false);
                }}
              />
              <button
                className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-600 hover:to-cyan-500 text-white px-3 py-2 rounded-r-lg font-bold transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-400"
                onClick={() => setNickname(generateGuestName())}
                title="Randomize name"
                type="button"
                tabIndex={0}>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582M20 20v-5h-.581M5 9A7.003 7.003 0 0112 5c1.657 0 3.156.576 4.354 1.536M19 15a7.003 7.003 0 01-7 4c-1.657 0-3.156-.576-4.354-1.536"
                  />
                </svg>
              </button>
              <button
                className="ml-3 px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white font-semibold shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50"
                onClick={() => nickname.trim() && setShowNameModal(false)}
                disabled={!nickname.trim()}
                tabIndex={0}>
                OK
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400 text-center max-w-xs">
              This name will be visible to others in the room. You can randomize
              it or enter your own.
            </p>
          </div>
        </div>
      )}
      {/* User List Modal */}
      {showUserList && (
        <div className="fixed inset-0 z-[201] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            ref={userListModalRef}
            className="bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] rounded-2xl shadow-2xl p-8 min-w-[340px] max-w-full w-full sm:w-[400px] flex flex-col items-center border border-white/10 relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none"
              onClick={() => setShowUserList(false)}
              aria-label="Close user list">
              ×
            </button>
            <h2 className="mb-4 text-white font-semibold text-2xl tracking-wide text-center">
              Users in Room
            </h2>
            <ul className="w-full space-y-2">
              {userList.length === 0 ? (
                <li className="text-gray-400 text-center">No users</li>
              ) : (
                userList.map((user) => (
                  <li
                    key={user.id}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                    {user.nickname}
                    {user.id === getSocket().id && (
                      <span className="ml-2 text-xs text-fuchsia-400">
                        (You)
                      </span>
                    )}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] text-white">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="flex flex-col h-screen">
            {/* Room Header */}
            <div className="px-8 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                      <span className="text-xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                        CodeSync.io
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-300">{room.code}</span>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                        />
                      </svg>
                    </button>
                    {/* Tooltip */}
                    <div
                      className={`absolute left-0 -bottom-8 px-2 py-1 text-xs bg-gray-800 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap ${
                        showTooltip ? "opacity-100" : ""
                      }`}>
                      {showTooltip ? "Copied!" : "Click to copy link"}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        room.isPublic
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                      } border`}>
                      {room.isPublic ? "Public" : "Private"}
                    </span>
                    <span className="text-sm text-gray-300">{room.name}</span>
                    <button
                      className="ml-2 flex items-center gap-1 px-3 py-1 rounded bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white text-xs font-semibold shadow hover:opacity-90 transition-opacity focus:outline-none"
                      onClick={() => setShowUserList(true)}
                      title="Show users in room">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                      {userList.length}
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Language Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsLanguageOpen(!isLanguageOpen);
                        setIsThemeOpen(false);
                      }}
                      className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center space-x-2 cursor-pointer">
                      <span>
                        {languages.find((l) => l.id === language)?.name}
                      </span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isLanguageOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isLanguageOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#22223B] border border-white/10 shadow-xl z-[100]">
                        {languages.map((lang) => (
                          <button
                            key={lang.id}
                            onClick={() => {
                              setLanguage(lang.id);
                              getSocket().emit("language-change", {
                                roomCode,
                                language: lang.id,
                              });
                              setIsLanguageOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors cursor-pointer ${
                              language === lang.id ? "text-fuchsia-400" : ""
                            }`}>
                            {lang.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Theme Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsThemeOpen(!isThemeOpen);
                        setIsLanguageOpen(false);
                      }}
                      className="px-4 py-2 text-sm rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center space-x-2 cursor-pointer">
                      <span>{themes.find((t) => t.id === theme)?.name}</span>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          isThemeOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                    {isThemeOpen && (
                      <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[#22223B] border border-white/10 shadow-xl z-[100]">
                        {themes.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => {
                              setTheme(t.id);
                              setIsThemeOpen(false);
                            }}
                            className={`w-full px-4 py-2 text-sm text-left hover:bg-white/10 transition-colors cursor-pointer ${
                              theme === t.id ? "text-fuchsia-400" : ""
                            }`}>
                            {t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Editor Container */}
            <div className="flex-1 relative z-0">
              <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                theme={theme}
                value={code}
                onChange={handleEditorChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: "on",
                  lineNumbers: "on",
                  renderWhitespace: "selection",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  padding: { top: 16, bottom: 16 },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
