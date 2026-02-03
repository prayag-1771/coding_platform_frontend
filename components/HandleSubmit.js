import { runTestsJS } from "./runTestsJS";
import { submitJob, pollJobResult } from "./codeExecutorApi.js";

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

    setOutput("> Running on server...\n");

    const jobId = await submitJob(
      accessToken,
      execLanguage,
      code,
      stdin
    );

    const result = await pollJobResult(
      accessToken,
      jobId
    );

    if (result.status === "ACCEPTED") {
      setOutput(
        (result.stdout || "") +
        "\n\nSubmission finished."
      );
      return;
    }

    if (
      result.status === "RUNTIME_ERROR" ||
      result.status === "COMPILE_ERROR" ||
      result.status === "TIME_LIMIT_EXCEEDED" ||
      result.status === "SYSTEM_ERROR"
    ) {
      setOutput(
        `[${result.status}]\n` +
        (result.stderr || "")
      );
      return;
    }

    setOutput(
      `[${result.status}]`
    );

  } catch (e) {
    setOutput("Execution failed:\n" + e.message);
  }
}
