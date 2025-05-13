"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Editor from "@monaco-editor/react";
import { useGetRoomQuery } from "@/store/slices/roomsSlice";
import { getSocket } from "../../lib/socket";
import TerminalOutput from "../__components/TerminalOutput";

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
  const [userList, setUserList] = useState<
    { id: string; nickname: string; color: string }[]
  >([]);
  const [showUserList, setShowUserList] = useState(false);
  const userListModalRef = useRef<HTMLDivElement>(null);
  const [isRemoteUpdate, setIsRemoteUpdate] = useState(false);
  const [roomFull, setRoomFull] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<
    {
      nickname: string;
      color: string;
      message: string;
      timestamp: number;
    }[]
  >([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [unseenChatCount, setUnseenChatCount] = useState(0);
  const [output, setOutput] = useState("");
  const [outputLoading, setOutputLoading] = useState(false);
  const [outputError, setOutputError] = useState<string | undefined>(undefined);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    // Connect to socket, setup listeners
    // Runs only when stuff that matters change
    if (!roomCode || showNameModal) return;
    const socket = getSocket();
    socket.connect();
    socket.emit("join-room", { roomCode, nickname });

    // Listen for user-list updates
    const handleUserList = (
      users: { id: string; nickname: string; color: string }[]
    ) => {
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

    // Listen for room-full
    const handleRoomFull = () => {
      setRoomFull(true);
    };
    socket.on("room-full", handleRoomFull);

    // Listen for run-result
    const handleRunResult = (result: { output: string; error?: string }) => {
      setOutput(result.output);
      setOutputError(result.error);
      setOutputLoading(false);
      setShowOutput(true);
    };
    socket.on("run-result", handleRunResult);

    return () => {
      socket.off("user-list", handleUserList);
      socket.off("language-change", handleLanguageChange);
      socket.off("code-update", handleCodeUpdate);
      socket.off("room-full", handleRoomFull);
      socket.off("run-result", handleRunResult);
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

  // Chat socket logic
  useEffect(() => {
    if (!roomCode || showNameModal) return;
    const socket = getSocket();
    const handleChatMessage = (msg: {
      nickname: string;
      color: string;
      message: string;
      timestamp: number;
    }) => {
      setChatMessages((prev) => [...prev, msg]);
      if (!showChat) setUnseenChatCount((c) => c + 1);
    };
    socket.on("chat-message", handleChatMessage);
    return () => {
      socket.off("chat-message", handleChatMessage);
    };
  }, [roomCode, showNameModal, showChat]);

  // Reset unseen count when chat is opened
  useEffect(() => {
    if (showChat) setUnseenChatCount(0);
  }, [showChat]);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, showChat]);

  const sendChat = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;
    getSocket().emit("chat-message", {
      roomCode,
      nickname,
      color: userList.find((u) => u.id === getSocket().id)?.color || "#fff",
      message: chatInput.trim(),
    });
    setChatInput("");
  };

  const handleRunCode = async () => {
    setOutputLoading(true);
    setOutput("");
    setOutputError(undefined);
    setShowOutput(true);

    try {
      // Create submission
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_JUDGE0_URL}/submissions?base64_encoded=false&wait=false`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source_code: code,
            language_id: getJudge0LanguageId(language),
            stdin: "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create submission");
      }

      const { token } = await response.json();
      if (!token) {
        throw new Error("No submission token received");
      }

      // Poll for results
      let resultData;
      while (true) {
        const resultRes = await fetch(
          `${process.env.NEXT_PUBLIC_JUDGE0_URL}/submissions/${token}?base64_encoded=false`
        );

        if (!resultRes.ok) {
          throw new Error("Failed to fetch submission status");
        }

        resultData = await resultRes.json();
        const statusId = resultData.status?.id;

        if (statusId === 1 || statusId === 2) {
          // Still in queue or processing
          await new Promise((resolve) => setTimeout(resolve, 1000));
          continue;
        }
        break;
      }

      // Handle final status
      const finalStatus = resultData.status?.id;
      let output = "";
      let error = undefined;

      switch (finalStatus) {
        case 3: // Accepted
          output = resultData.stdout || "";
          break;
        case 4: // Wrong Answer
          error = "Wrong Answer: output did not match expected output";
          break;
        case 5: // Time Limit Exceeded
          error = "Time Limit Exceeded";
          break;
        case 6: // Compilation Error
          error = resultData.compile_output || "Compilation Error";
          break;
        case 13: // Internal Error
          error = "Internal Error. Please try again later";
          break;
        default:
          output = resultData.stdout || "";
          error = resultData.stderr || resultData.message || "Execution failed";
      }

      setOutput(output);
      setOutputError(error);
      setOutputLoading(false);

      // Broadcast to room
      getSocket().emit("run-result", { roomCode, output, error });
    } catch (err: any) {
      setOutputError(`Error: ${err.message}`);
      setOutputLoading(false);
      getSocket().emit("run-result", {
        roomCode,
        output: "",
        error: `Error: ${err.message}`,
      });
    }
  };

  function getJudge0LanguageId(lang: string) {
    switch (lang) {
      case "javascript":
        return 63;
      case "typescript":
        return 74;
      case "python":
        return 71;
      case "java":
        return 62;
      case "csharp":
        return 51;
      case "cpp":
        return 54;
      case "go":
        return 60;
      case "rust":
        return 73;
      default:
        return 63;
    }
  }

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

  if (roomFull) {
    return (
      <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] text-white flex items-center justify-center">
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
            Room Full
          </h1>
          <p className="text-xl text-gray-300">
            Room <span className="text-white font-medium">{roomCode}</span> is
            full
          </p>
          <p className="text-gray-400 max-w-md mx-auto">
            This room has reached the maximum of 20 users. Please try joining
            another room or create a new one.
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
                className="bg-gradient-to-r from-fuchsia-500 to-cyan-400 hover:from-fuchsia-600 hover:to-cyan-500 text-white px-3 py-2 rounded-r-lg font-bold transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-cyan-400 cursor-pointer"
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
                className="ml-3 px-5 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white font-semibold shadow hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-cyan-400 disabled:opacity-50 cursor-pointer"
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
              className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl font-bold focus:outline-none cursor-pointer"
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
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: user.color }}
                    />
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
      {/* Chatroom Sidebar */}
      {showChat && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[350px] z-[300] flex flex-col bg-gradient-to-br from-[#18122B] via-[#22223B] to-[#0F1021] border-l border-white/10 shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
            <span className="font-bold text-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
              Room Chat
            </span>
            <button
              className="text-2xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              onClick={() => setShowChat(false)}
              aria-label="Close chat">
              ×
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
            {chatMessages.length === 0 ? (
              <div className="text-gray-400 text-center mt-8">
                No messages yet.
              </div>
            ) : (
              chatMessages.map((msg, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="w-2 h-2 mt-2 rounded-full"
                    style={{ backgroundColor: msg.color }}
                  />
                  <div>
                    <span
                      className="font-semibold text-sm"
                      style={{ color: msg.color }}>
                      {msg.nickname}
                    </span>
                    <span className="ml-2 text-xs text-gray-500">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    <div className="text-gray-200 text-sm break-words max-w-[250px]">
                      {msg.message}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>
          <form
            onSubmit={sendChat}
            className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-3 py-2 rounded-lg bg-white/10 text-white border-none placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-400/30 text-sm"
              maxLength={200}
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white font-semibold shadow hover:opacity-90 transition-opacity cursor-pointer"
              disabled={!chatInput.trim()}>
              Send
            </button>
          </form>
        </div>
      )}
      {/* Terminal Output at bottom */}
      {showOutput && (
        <div className="fixed left-0 right-0 bottom-0 z-40 px-8 pb-4">
          <div className="max-w-5xl mx-auto relative">
            <button
              onClick={() => setShowOutput(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors cursor-pointer"
              title="Close terminal">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <TerminalOutput
              output={output}
              loading={outputLoading}
              error={outputError}
            />
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
                        SyncSpark.net
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
                      } border cursor-pointer`}>
                      {room.isPublic ? "Public" : "Private"}
                    </span>
                    <span className="text-sm text-gray-300">{room.name}</span>
                    <button
                      className="ml-2 flex items-center gap-1 px-3 py-1 rounded bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white text-xs font-semibold shadow hover:opacity-90 transition-opacity focus:outline-none cursor-pointer"
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
                  {/* Chat Icon */}
                  <button
                    className="flex items-center justify-center p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer relative"
                    title="Chat"
                    type="button"
                    onClick={() => setShowChat(true)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 text-cyan-300">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v6a2.25 2.25 0 01-2.25 2.25H6.25L2.75 20.25V6.75A2.25 2.25 0 015 4.5h14.5a2.25 2.25 0 012.25 2.25z"
                      />
                    </svg>
                    {unseenChatCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white shadow-md">
                        {unseenChatCount > 99 ? "99+" : unseenChatCount}
                      </span>
                    )}
                  </button>
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
                  {/* Run Code Button */}
                  <button
                    onClick={handleRunCode}
                    className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-white font-semibold shadow hover:opacity-90 transition-opacity focus:outline-none cursor-pointer flex items-center gap-2"
                    disabled={outputLoading}
                    title="Run code in terminal">
                    {outputLoading ? (
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 17v-2a4 4 0 014-4h8"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7h8m0 0v8m0-8l-8 8"
                        />
                      </svg>
                    )}
                    <span>Run Code</span>
                  </button>
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
