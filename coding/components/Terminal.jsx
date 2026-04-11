import { useEffect, useRef } from "react";

export default function Terminal({ output, height, onClear, onClose }) {
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop =
        terminalRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div
      className="bg-zinc-900 border-t border-white/10 flex flex-col"
      style={{ height }}
    >
      <div className="shrink-0 flex justify-between items-center px-3 py-2 bg-black/40 text-xs text-gray-300">
        <span>Terminal</span>

        <div className="space-x-2">
          <button
            onClick={onClear}
            className="px-2 py-1 hover:bg-white/10 rounded"
          >
            Clear
          </button>
          <button
            onClick={onClose}
            className="px-2 py-1 hover:bg-white/10 rounded"
          >
            ✕
          </button>
        </div>
      </div>

      <div
        ref={terminalRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-sm text-gray-200"
      >
        <pre className="whitespace-pre-wrap">
          {output || " "}
        </pre>
      </div>
    </div>
  );
}
