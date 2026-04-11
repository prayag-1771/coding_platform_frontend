import { submitJob, pollJobResult } from "./codeExecutorApi";
import { compare } from "./comparator";

function normalizeStatus(status) {
  if (!status) return "Unknown";
  if (status === "ACCEPTED") return "OK";
  if (status === "TLE") return "Time Limit Exceeded";
  if (status === "MLE") return "Memory Limit Exceeded";
  if (status === "CE") return "Compilation Error";
  if (status === "RE") return "Runtime Error";
  return status;
}

function normalizeNewlines(str) {
  return String(str ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

export async function runRemoteTests({
  language,
  code,
  tests,
  accessToken,
  compareMode = "trimmed",
  onProgress
}) {
  if (!tests || !Array.isArray(tests)) {
    throw new Error("Tests not provided to runRemoteTests");
  }

  const inputs = tests.map(t => String(t.stdin ?? ""));

  onProgress?.(`> Sending ${inputs.length} testcases to server...\n`);

  const jobId = await submitJob(accessToken, language, code, inputs);
  const data = await pollJobResult(accessToken, jobId);
  const remoteResults = data.results || [];

  let total = 0;
  let score = 0;
  let anyRuntimeError = false;
  let anyCompilationError = false;

  const results = [];

  for (let i = 0; i < tests.length; i++) {
    const tc = tests[i];
    const r = remoteResults[i];

    const weight = tc.weight ?? 1;
    total += weight;

    const input = String(tc.stdin ?? "");
    const expectedRaw = String(tc.expected ?? "");

    let passed = false;
    let actual = "";
    let runtimeError = null;

    const executionTime = r?.time ?? 0;
    const memoryUsed = r?.memory ?? 0;

    if (!r) {
      actual = "No result returned";
      runtimeError = "No result";
      anyRuntimeError = true;
    } else {
      const status = normalizeStatus(r.status);
      const stdoutRaw = String(r.stdout ?? "");

      const expected = normalizeNewlines(expectedRaw);
      const stdout = normalizeNewlines(stdoutRaw);

      if (status !== "OK") {
        runtimeError = r.stderr || status;
        actual = `Error: ${runtimeError}`;

        if (status === "Compilation Error")
          anyCompilationError = true;
        else
          anyRuntimeError = true;
      } else {
        actual = stdout;
        passed = compare(expected, stdout, compareMode);

        if (passed) score += weight;
      }
    }

    const isHidden = tc.visibility === "hidden";

    results.push({
      id: i + 1,
      passed,
      weight,
      isHidden,
      input: isHidden ? undefined : input,
      expected: isHidden ? undefined : expectedRaw,
      output: isHidden ? undefined : actual,
      executionTime,
      memoryUsed,
      error: runtimeError
    });
  }

  const totalTime = results.reduce((s, r) => s + (r.executionTime ?? 0), 0);
  const maxMemory = Math.max(...results.map(r => r.memoryUsed ?? 0), 0);

  let verdict = "Wrong Answer";

  if (anyCompilationError) verdict = "Compilation Error";
  else if (anyRuntimeError && score === 0) verdict = "Runtime Error";
  else if (score === total) verdict = "Accepted";
  else if (score > 0) verdict = "Partial";

  return {
    verdict,
    score,
    total,
    results,
    totalTime,
    maxMemory
  };
}
