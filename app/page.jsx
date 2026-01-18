"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Editor from "@monaco-editor/react";
import Terminal from "../components/Terminal";
import { useState, useEffect, useRef } from "react";
import gsap from "gsap";

export default function EditorPage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [output, setOutput] = useState("");
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const terminalWrapperRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);


  function handleRun() {
    if (isRunning) return;

    setIsRunning(true);
    setIsTerminalOpen(true);

    setOutput((prev) => prev + "\n\n> Running...\n");
    // simulation
    setTimeout(() => {
      setOutput((prev) => prev + "Hello World\n");
      setIsRunning(false);
    }, 800);
  }

  useEffect(() => {
    const el = terminalWrapperRef.current;
    if (!el) return;

    gsap.set(el, {
      opacity: 0,
      y: 20,
      pointerEvents: "none",
    });
  }, []);

  useEffect(() => {
    const el = terminalWrapperRef.current;
    if (!el) return;

    if (isTerminalOpen) {
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 0.25,
        ease: "power2.out",
        pointerEvents: "auto",
      });
    } else {
      gsap.to(el, {
        opacity: 0,
        y: 20,
        duration: 0.2,
        ease: "power2.in",
        pointerEvents: "none",
      });
    }
  }, [isTerminalOpen]);




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
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="
    w-36
    bg-black/40
    border border-white/10
    hover:bg-white/5
    transition-colors
  ">
              <SelectValue placeholder="Language" />
            </SelectTrigger>

            <SelectContent
              className="
      bg-[#0b0e14]
      border border-white/10
      shadow-2xl
      rounded-lg
      p-1
      animate-in  
      fade-in
      zoom-in-95
      text-white
    "
            >
              {["javascript", "python", "cpp"].map((lang) => (
                <SelectItem
                  key={lang}
                  value={lang}
                  className="
          rounded-md
          px-2 py-1.5
          hover:bg-white/10
          focus:bg-white/40
          cursor-pointer
          text-white
        "
                >
                  {lang === "cpp" ? "C++" : lang[0].toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>



          <div className="space-x-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`
    px-4 py-2 rounded-lg font-medium
    transition-all duration-200

    ${isRunning
                  ? "bg-white/10 text-gray-400 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20"
                }
  `}
            >
              {isRunning ? "Running..." : "Run"}
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
        <div
          ref={terminalWrapperRef}
        >
          {isTerminalOpen && (
            <>
              {/* Resize handle */}
              <div
                className="h-1 w-full bg-white/5 hover:bg-white/10 cursor-row-resize shrink-0"
                onMouseDown={() => setIsResizing(true)}
              />

              {/* Terminal */}
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
    </div>
  );
}
