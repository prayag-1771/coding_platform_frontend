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
import FocusActions from "../components/FocusedActions";
import CommandPalette from "../components/CommandPalette";
import useEditorCommands from "../components/useEditorCommands";



export default function EditorPage() {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [output, setOutput] = useState("");
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [language, setLanguage] = useState("javascript");
  const [isRunning, setIsRunning] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  
  const [editorFocus, setEditorFocus] = useState(false);
  const [questionFocus, setQuestionFocus] = useState(false);

  const commands = useEditorCommands({
  setEditorFocus,
  setQuestionFocus,
  setIsTerminalOpen,
  setLanguage,
  handleRun
});


  const editorWrapRef = useRef(null);
  const terminalWrapRef = useRef(null);
  const questionWrapRef = useRef(null);
  const focusActiveRef = useRef(false);

  function handleRun() {
    if (isRunning) return;

    setIsRunning(true);
    setIsTerminalOpen(true);

    setOutput((p) => p + "\n\n> Running...\n");

    setTimeout(() => {
      setOutput((p) => p + "Hello World\n");
      setIsRunning(false);
    }, 800);
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
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setPaletteOpen(true);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);


  useEffect(() => {
    const editorEl = editorWrapRef.current;
    const terminalEl = terminalWrapRef.current;
    const questionEl = questionWrapRef.current;

    if (!editorEl || !terminalEl || !questionEl) return;

    gsap.killTweensOf([editorEl, terminalEl, questionEl]);

    const getRectWithoutTransform = (el) => {
      const prev = el.style.transform;
      el.style.transform = "none";
      const rect = el.getBoundingClientRect();
      el.style.transform = prev;
      return rect;
    };

    const tl = gsap.timeline({
      defaults: { duration: 0.45, ease: "power3.inOut" },
    });

    if (questionFocus) {
      const qRect = getRectWithoutTransform(questionEl);

      const qTargetWidth = window.innerWidth * 0.6;
      const qScale = qTargetWidth / qRect.width;

      const qX =
        window.innerWidth / 2 - (qRect.left + qRect.width / 2);

      const qY =
        window.innerHeight * 0.75 - (qRect.top + qRect.height / 2);

      tl.to(
        questionEl,
        {
          x: qX,
          y: qY,
          scale: qScale,
          borderRadius: 11,
          transformOrigin: "center center",
        },
        0
      );

      tl.to(
        [editorEl, terminalEl],
        {
          x: 0,
          y: 0,
          scale: 1,
          borderRadius: 0,
        },
        0
      );

      tl.to([editorEl, terminalEl], { opacity: 0.4 }, 0);
      tl.to(questionEl, { opacity: 1 }, 0);
    } else if (editorFocus) {
      const qRect = getRectWithoutTransform(questionEl);
      const eRect = getRectWithoutTransform(editorEl);
      const tRect = getRectWithoutTransform(terminalEl);

      const qTargetWidth = window.innerWidth * 0.6;
      const qScale = qTargetWidth / qRect.width;

      const qX =
        window.innerWidth / 3.5 - (qRect.left + qRect.width / 2);

      const qY =
        window.innerHeight / 1.5 - (qRect.top + qRect.height / 2);

      const eTargetWidth = window.innerWidth * 0.6;
      const eScale = eTargetWidth / eRect.width;

      const eX =
        window.innerWidth / 2 - (eRect.left + eRect.width / 2);

      const eY =
        window.innerHeight / 2 - (eRect.top + eRect.height / 2);

      const visiblePart = 0.2;
      const visibleW = window.innerWidth * visiblePart;
      const visibleH = window.innerHeight * visiblePart;

      const targetCenterX =
        window.innerWidth - visibleW / 2;

      const targetCenterY =
        window.innerHeight - visibleH / 2;

      const tX =
        targetCenterX - (tRect.left + tRect.width / 2);

      const tY =
        targetCenterY - (tRect.top + tRect.height / 2);

      tl.to(
        editorEl,
        {
          x: eX,
          y: eY,
          scale: eScale,
          borderRadius: 11,
          transformOrigin: "center center",
        },
        0
      );

      tl.to(
        terminalEl,
        {
          x: tX,
          y: tY,
          scale: 1,
          borderRadius: 11,
          transformOrigin: "center center",
        },
        0
      );

      tl.to(
        questionEl,
        {
          x: qX,
          y: qY,
          scale: qScale,
          borderRadius: 11,
          transformOrigin: "center center",
        },
        0
      );

      tl.to(questionEl, { opacity: 0.4 }, 0);
      tl.to([editorEl, terminalEl], { opacity: 1 }, 0);
    } else {
      tl.to(
        [editorEl, terminalEl, questionEl],
        {
          x: 0,
          y: 0,
          scale: 1,
          borderRadius: 0,
          opacity: 1,
        },
        0
      );
    }

    focusActiveRef.current = editorFocus || questionFocus;

    return () => tl.kill();
  }, [editorFocus, questionFocus]);

  useEffect(() => {
    function handleResize() {
      if (!focusActiveRef.current) return;
      setEditorFocus((v) => v);
      setQuestionFocus((v) => v);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    function handleKey(e) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();

        if (questionFocus) {
          setQuestionFocus(false);
          setEditorFocus(true);
        } else if (editorFocus) {
          setEditorFocus(false);
          setQuestionFocus(true);
        } else {
          setEditorFocus(true);
        }
      }

      if (e.key === "Escape") {
        setEditorFocus(false);
        setQuestionFocus(false);
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [editorFocus, questionFocus]);

  return (
    <div className="h-screen bg-[#05060f] text-white flex relative overflow-hidden">
      <div
        ref={questionWrapRef}
        className={`w-1/2 relative z-10 p-6 overflow-y-auto ${editorFocus
            ? "blur-[2px] pointer-events-none"
            : questionFocus
              ? ""
              : "border-r border-white/15 pr-4"
          }`}
      >
        <h1 className="text-2xl font-bold mb-4">Two Sum</h1>

        <p className="text-gray-300 mb-4">
          Given an array of integers nums and an integer target, return indices
          of the two numbers such that they add up to target.
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

      <div className="w-1/2 flex flex-col h-screen relative pl-4">
        <div className="shrink-0 p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-36 bg-black/40 border border-white/10 hover:bg-white/5 transition-colors">
                <SelectValue placeholder="Language" />
              </SelectTrigger>

              <SelectContent className="bg-[#0b0e14] border border-white/10 shadow-2xl rounded-lg p-1 animate-in fade-in zoom-in-95 text-white">
                {["javascript", "python", "cpp"].map((lang) => (
                  <SelectItem
                    key={lang}
                    value={lang}
                    className="rounded-md px-2 py-1.5 hover:bg-white/10 focus:bg-white/40 cursor-pointer text-white"
                  >
                    {lang === "cpp"
                      ? "C++"
                      : lang[0].toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <button
              onClick={() => {
                if (questionFocus) {
                  setQuestionFocus(false);
                  setEditorFocus(true);
                } else if (editorFocus) {
                  setEditorFocus(false);
                  setQuestionFocus(true);
                } else {
                  setEditorFocus(true);
                }
              }}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
            >
              Focus
            </button>
          </div>

          <div className="space-x-3">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className={`px-4 py-2 rounded-lg font-medium ${isRunning
                  ? "bg-white/10 text-gray-400 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20"
                }`}
            >
              {isRunning ? "Running..." : "Run"}
            </button>

            <button className="px-4 py-2 rounded-lg bg-violet-400 text-black font-semibold" >
              Submit
            </button>
          </div>
        </div>

        <div
          ref={editorWrapRef}
          className={`flex-1 min-h-0 overflow-hidden relative z-20
    ${questionFocus ? "blur-[2px] pointer-events-none" : ""}
    border border-white/10 rounded-md
  `}
        >
          <Editor
            height="100%"
            language={language}
            defaultValue={`// write your code here\n\nfunction twoSum(nums, target) {\n\n}`}
            theme="vs-dark"
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              smoothScrolling: !editorFocus && !questionFocus,
              padding: { top: 12, bottom: 12 }
            }}
          />


        </div>

        {editorFocus && (
          <FocusActions
            onRun={handleRun}
            onSubmit={() => { }}
            disabled={isRunning}
          />
        )}

        <div
          ref={terminalWrapRef}
          className={`relative z-30 overflow-hidden
          ${questionFocus ? "blur-[2px] pointer-events-none" : ""}
          ${editorFocus || questionFocus ? "" : "mt-3 border border-white/10 rounded-md"}
        `}
        >
          {isTerminalOpen && (
            <>
              <div
                className="h-1 w-full bg-white/5 hover:bg-white/10 cursor-row-resize shrink-0"
                onMouseDown={() => {
                  if (editorFocus || questionFocus) return;
                  setIsResizing(true);
                }}
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

      <div
        onClick={() => {
          setEditorFocus(false);
          setQuestionFocus(false);
        }}
        className={`fixed inset-0 z-10 bg-black/40 transition-opacity ${editorFocus || questionFocus
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
          }`}
      />
      <CommandPalette
  open={paletteOpen}
  onClose={() => setPaletteOpen(false)}
  commands={commands}
/>


    </div>
  );
}
