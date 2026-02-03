import { submitJob, pollJobResult } from "./codeExecutorApi";

export async function runRemoteTests({
  language,
  code,
  tests,
  accessToken,
  onProgress
}) {

  const inputs = tests.map(t =>
    String(t?.input ?? "")
  );

  onProgress?.(`> Sending ${inputs.length} testcases to server...\n`);

  const jobId = await submitJob(
    accessToken,
    language,
    code,
    inputs
  );

  const data = await pollJobResult(accessToken, jobId);

  const results = data.results || [];

  let passed = 0;

  for (let i = 0; i < tests.length; i++) {

    const expected = String(tests[i]?.output ?? "").trim();
    const r = results[i];

    if (!r) {
      onProgress?.(`✗ Test ${i + 1} missing result\n`);
      continue;
    }

    const stdout = String(r.stdout ?? "").trim();

    if (r.status === "ACCEPTED" && stdout === expected) {
      passed++;
      onProgress?.(`✓ Test ${i + 1} passed\n`);
    } else if (r.status !== "ACCEPTED") {

      onProgress?.(
        `✗ Test ${i + 1} error: ${r.status}\n` +
        (r.stderr || "") + "\n"
      );

    } else {
      onProgress?.(
        `✗ Test ${i + 1} failed\n` +
        `  Expected: ${expected}\n` +
        `  Got:      ${stdout}\n`
      );
    }
  }

  onProgress?.(`\n${passed}/${tests.length} tests passed\n`);

  return {
    passed,
    total: tests.length,
    metrics: data.metrics
  };
}
