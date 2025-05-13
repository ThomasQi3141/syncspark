import React from "react";

interface TerminalOutputProps {
  output: string;
  loading: boolean;
  error?: string;
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({
  output,
  loading,
  error,
}) => {
  return (
    <div className="w-full bg-black text-green-400 font-mono rounded-b-xl p-4 min-h-[120px] max-h-60 overflow-y-auto border-t border-white/10 text-sm">
      {loading ? (
        <div className="flex items-center gap-2 text-cyan-300 animate-pulse">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          Running code...
        </div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <pre className="whitespace-pre-wrap break-words">
          {output || "Output will appear here."}
        </pre>
      )}
    </div>
  );
};

export default TerminalOutput;
