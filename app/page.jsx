"use client";

import Editor from "@monaco-editor/react";
import Terminal from "../components/Terminal";
import { useState, useEffect } from "react";

export default function EditorPage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [output, setOutput] = useState("");
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  function handleRun() {
    setIsTerminalOpen(true);

    setOutput((prev) => {
      const runBlock =
        `\n\n--------------------\n` +
        `> Run at ${new Date().toLocaleTimeString()}\n` +
        `Running...\n` +
        `Output:\nHello World`;

      return prev + runBlock;
    });
  }


  useEffect(() => {
    function handleMouseMove(e) {
      if (!isResizing) return;

      setTerminalHeight((prev) => {
        const next = prev - e.movementY;

        if (next < 80) return 80;
        if (next > 400) return 400;

        return next;
      });
    }

    function handleMouseUp() {
      setIsResizing(false);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div className="h-screen bg-[#05060f] text-white flex">

      <div className="w-1/2 border-r border-white/10 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Two Sum</h1>

        <p className="text-gray-300 mb-4">
          Given an array of integers nums and an integer target, return
          indices of the two numbers such that they add up to target.
        </p>

        <h2 className="font-semibold mt-6 mb-2">Example</h2>
        <pre className="bg-black/30 p-4 rounded-xl text-sm">
          Input: nums = [2,7,11,15], target = 9
          Output: [0,1]
        </pre>

        <h2 className="font-semibold mt-6 mb-2">Constraints</h2>
        <ul className="text-gray-400 list-disc ml-6 text-sm">
          <li>2 ≤ nums.length ≤ 10⁴</li>
          <li>-10⁹ ≤ nums[i] ≤ 10⁹</li>
        </ul>
      </div>

      <div className="w-1/2 flex flex-col h-screen">

        <div className="shrink-0 p-4 border-b border-white/10 flex justify-between items-center">
          <span className="text-sm text-gray-400">JavaScript</span>

          <div className="space-x-3">
            <button
              className="px-4 py-2 rounded-lg bg-white/10"
              onClick={handleRun}
            >
              Run
            </button>
            <button className="px-4 py-2 rounded-lg bg-green-500 text-black font-semibold">
              Submit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            defaultLanguage="javascript"
            defaultValue={`// write your code here\n\nfunction twoSum(nums, target) {\n\n}`}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </div>

        {isTerminalOpen && (
          <>
            <div
              className="h-1 w-full bg-white/5 hover:bg-white/10 cursor-row-resize shrink-0"
              onMouseDown={() => setIsResizing(true)}
            />

            <Terminal
              output={output}
              height={terminalHeight}
              onClear={() => setOutput("")}
              onClose={() => setIsTerminalOpen(false)}
            />
          </>
        )}

      </div>
    </div>
  );
}
