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

  if (language === "javascript") {
    try {
      const result = runTestsJS(
        code,
        currentProblem.testcases
      );

      setOutput(formatJudgeOutput(result) + "\n\nSubmission finished.");

      saveBestScore(
        currentProblem.id,
        result.score,
        result.total
      );

    } catch (e) {
      setOutput("Runtime error:\n" + e.message);
    }

    return;
  }

  // TEMPORARY: force local execution for all languages
const result = runTestsJS(
  code,
  currentProblem.testcases
);

setOutput(formatJudgeOutput(result));
saveBestScore(
  currentProblem.id,
  result.score,
  result.total
);
return;


  const execLanguage =
    language === "cpp" ? "c" : language;

  try {
    setOutput("> Running testcases on server...\n");

    const summary = await runRemoteTests({
      language: execLanguage,
      code,
      tests: currentProblem.testcases,
      accessToken,
      onProgress: (msg) => {
        setOutput(prev => prev + msg);
      }
    });

    saveBestScore(
      currentProblem.id,
      summary.score ?? summary.passed,
      summary.total
    );

    setOutput(prev => prev + "\nSubmission finished.");

  } catch (e) {
    setOutput("Execution failed:\n" + e.message);
  }
}

function formatJudgeOutput(result) {
  let text = `Verdict: ${result.verdict}\n`;
  text += `Score: ${result.score} / ${result.total}\n\n`;

  for (const r of result.results) {
    text += `Test ${r.id}: ${r.passed ? "PASS" : "FAIL"}\n`;

    if (!r.passed) {
      text += `Input:\n${r.input}\n`;
      text += `Expected:\n${r.expected}\n`;
      text += `Actual:\n${r.actual}\n\n`;
    }
  }

  return text;
}
