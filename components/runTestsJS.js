export function runTestsJS(userCode, tests, fnName) {
  const logs = [];

  try {
    const fn = new Function(
      userCode + `\nreturn ${fnName};`
    )();

    tests.forEach((t, i) => {
      const result = fn(...t.input);

      const pass =
        JSON.stringify(result) === JSON.stringify(t.output);

      logs.push(
        `Test ${i + 1}: ${pass ? "PASS" : "FAIL"}\n` +
        `  input: ${JSON.stringify(t.input)}\n` +
        `  expected: ${JSON.stringify(t.output)}\n` +
        `  received: ${JSON.stringify(result)}\n`
      );
    });

  } catch (e) {
    logs.push("Runtime error:\n" + e.message);
  }

  return logs.join("\n");
}
