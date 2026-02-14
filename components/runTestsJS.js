export function runTestsJS(userCode, testcases) {
  let total = 0;
  let score = 0;
  const results = [];

  for (const tc of testcases) {
    total += tc.weight ?? 1;

    let actual = "";
    let passed = false;

    try {
      actual = simulateIO(userCode, tc.input);

      passed =
        actual.trim() === tc.expectedOutput.trim();

    } catch (e) {
      actual = "Runtime Error: " + e.message;
      passed = false;
    }

    if (passed) score += tc.weight ?? 1;

    results.push({
      id: tc.id,
      passed,
      input: tc.input,
      expected: tc.expectedOutput,
      actual,
      weight: tc.weight ?? 1
    });
  }

  let verdict = "Wrong Answer";
  if (score === total) verdict = "Accepted";
  else if (score > 0) verdict = "Partial";

  return {
    verdict,
    score,
    total,
    results
  };
}
