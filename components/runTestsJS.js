import { compare } from "./comparator";

export function runTestsJS(userCode, testcases, compareMode = "strict") {
  let total = 0;
  let score = 0;
  const results = [];

  for (let i = 0; i < testcases.length; i++) {
    const tc = testcases[i];

    const weight = tc.weight ?? 1;
    total += weight;

    const input = String(tc.stdin ?? "");
    const expected = String(tc.expected ?? "");

    let actual = "";
    let passed = false;
    let runtimeError = null;

    const start = performance.now();

    try {
      actual = simulateIO(userCode, input);
      passed = compare(expected, actual, compareMode);
    } catch (e) {
      runtimeError = e.message;
      actual = "Runtime Error: " + e.message;
      passed = false;
    }

    const end = performance.now();
    const executionTime = Math.round(end - start);

    if (passed) score += weight;

    const isHidden = tc.visibility === "hidden";

    results.push({
      id: i + 1,
      passed,
      weight,
      isHidden,
      input: isHidden ? undefined : input,
      expected: isHidden ? undefined : expected,
      output: isHidden ? undefined : actual,
      executionTime,
      memoryUsed: null,
      error: runtimeError
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

function simulateIO(userCode, input) {
  let output = "";

  const originalLog = console.log;

  console.log = (...args) => {
    output += args.join(" ") + "\n";
  };

  const mockRequire = (name) => {
    if (name === "fs") {
      return {
        readFileSync: () => input
      };
    }
    throw new Error("Module not allowed");
  };

  try {
    const wrapped = `
      (function(require){
        ${userCode}
      })(mockRequire);
    `;
    eval(wrapped);
  } finally {
    console.log = originalLog;
  }

  return output;
}
