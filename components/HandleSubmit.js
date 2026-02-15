import { runTestsJS } from "./runTestsJS";
import { runRemoteTests } from "./runRemoteTests";
import { saveBestScore } from "./bestScore";

export async function handleSubmit(
  setIsTerminalOpen,
  setOutput,
  language,
  editorRef,
  currentProblem,
  accessToken
) {
  setIsTerminalOpen(true);
  setOutput("> Submitting...\n");

  const code = editorRef.current.getValue();
  const compareMode = currentProblem.compareMode || "strict";

  if (language === "javascript") {
    try {
      const result = runTestsJS(
        code,
        currentProblem.testcases,
        compareMode
      );

      setOutput(
        formatJudgeOutput(result, language, currentProblem) +
          "\n\nSubmission finished."
      );

      saveBestScore(
        currentProblem._id,
        result.score,
        result.total
      );

      return result;  

    } catch (e) {
      setOutput("Runtime error:\n" + e.message);
      return null;
    }
  }

  if (!accessToken) {
    setOutput("Not authenticated.");
    return null;
  }

  const execLanguage =
    language === "cpp" ? "c" : language;

  try {
    setOutput("> Running testcases on server...\n");

    const summary = await runRemoteTests({
      language: execLanguage,
      code,
      tests: currentProblem.testcases,
      accessToken,
      compareMode
    });

    setOutput(
      formatJudgeOutput(summary, language, currentProblem) +
        "\n\nSubmission finished."
    );

    saveBestScore(
      currentProblem._id,
      summary.score,
      summary.total
    );

    return summary;  

  } catch (e) {
    setOutput("Execution failed:\n" + e.message);
    return null;
  }
}

function formatJudgeOutput(result, language, problem) {
  let text = `Verdict: ${result.verdict}\n`;
  text += `Score: ${result.score} / ${result.total}\n\n`;

  text += `Language: ${language}\n`;
  text += `Time Limit: ${problem.timeLimitMs} ms\n`;
  text += `Memory Limit: ${problem.memoryLimitMb} MB\n\n`;

  if (result.totalTime !== undefined) {
    text += `Total Time: ${result.totalTime} ms\n`;
  }

  if (result.maxMemory !== undefined) {
    text += `Max Memory: ${result.maxMemory} KB\n`;
  }

  text += "\n";

  for (const r of result.results) {
    if (r.isHidden) {
      text += `Hidden Test ${r.id}: ${r.passed ? "PASS" : "FAIL"}`;
      if (r.executionTime != null)
        text += ` (${r.executionTime} ms)`;
      text += "\n\n";
      continue;
    }

    text += `Sample Test ${r.id}: ${r.passed ? "PASS" : "FAIL"}`;
    if (r.executionTime != null)
      text += ` (${r.executionTime} ms)`;
    text += "\n";

    if (!r.passed) {
      if (r.input !== undefined)
        text += `Input:\n${r.input}\n`;

      if (r.expected !== undefined)
        text += `Expected:\n${r.expected}\n`;

      if (r.output !== undefined)
        text += `Actual:\n${r.output}\n`;
    }

    text += "\n";
  }

  return text;
}
