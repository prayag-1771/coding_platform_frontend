 export function handleSubmit() {
  setIsTerminalOpen(true);
  setOutput("> Submitting...\n\n");

  setTimeout(() => {
    if (language !== "javascript") {
      setOutput("> Submission supports JavaScript only for now.\n");
      return;
    }

    const code = editorRef.current.getValue();

    const fnName =
      currentQuestion.starterCode.javascript
        .match(/function\s+([a-zA-Z0-9_]+)/)?.[1];

    const result = runTestsJS(
      code,
      currentQuestion.tests,
      fnName
    );

    setOutput(
      result + "\n\nSubmission finished."
    );
  }, 300);
}
