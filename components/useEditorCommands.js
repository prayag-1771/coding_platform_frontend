export default function useEditorCommands({
  setEditorFocus,
  setQuestionFocus,
  setIsTerminalOpen,
  setLanguage,
  handleRun
}) {
  return [
    {
      id: "focus-editor",
      label: "Focus editor",
      action: () => {
        setQuestionFocus(false);
        setEditorFocus(true);
      }
    },
    {
      id: "focus-question",
      label: "Focus question",
      action: () => {
        setEditorFocus(false);
        setQuestionFocus(true);
      }
    },
    {
      id: "exit-focus",
      label: "Exit focus",
      action: () => {
        setEditorFocus(false);
        setQuestionFocus(false);
      }
    },
    {
      id: "run",
      label: "Run code",
      action: () => handleRun()
    },
    {
      id: "toggle-terminal",
      label: "Toggle terminal",
      action: () => setIsTerminalOpen(v => !v)
    },
    {
      id: "lang-js",
      label: "Change language → JavaScript",
      action: () => setLanguage("javascript")
    },
    {
      id: "lang-py",
      label: "Change language → Python",
      action: () => setLanguage("python")
    },
    {
      id: "lang-cpp",
      label: "Change language → C++",
      action: () => setLanguage("cpp")
    }
  ];
}
