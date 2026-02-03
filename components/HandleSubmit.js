import { runTestsJS } from "./runTestsJS";
import { runRemoteTests } from "./runRemoteTests";
import { saveBestScore } from "./bestScore";



export async function handleSubmit(
  setIsTerminalOpen,
  setOutput,
  language,
  editorRef,
  currentQuestion,
  accessToken,
  stdin
) {
  setIsTerminalOpen(true);
  setOutput("> Submitting...\n");

  const code = editorRef.current.getValue();

  if (language === "javascript") {
    try {
      const fnName =
        currentQuestion.starterCode.javascript
          .match(/function\s+([a-zA-Z0-9_]+)/)?.[1];

      const result = runTestsJS(
        code,
        currentQuestion.tests,
        fnName
      );

      setOutput(result + "\n\nSubmission finished.");
      saveBestScore(
  currentQuestion.id,
  currentQuestion.tests.length,
  currentQuestion.tests.length
);

    } catch (e) {
      setOutput("Runtime error:\n" + e.message);
    }

    return;
  }

  if (!accessToken) {
    setOutput("Not authenticated.");
    return;
  }

  const execLanguage =
    language === "cpp" ? "c" : language;

  try {
    setOutput("> Running testcases on server...\n");

    const summary = await runRemoteTests({
  language: execLanguage,
  code,
  tests: currentQuestion.tests,
  accessToken,
  onProgress: (msg) => {
    setOutput(prev => prev + msg);
  }
});

saveBestScore(
  currentQuestion.id,
  summary.passed,
  summary.total
);

    setOutput(prev => prev + "\nSubmission finished.");

  } catch (e) {
    setOutput("Execution failed:\n" + e.message);
  }
}
