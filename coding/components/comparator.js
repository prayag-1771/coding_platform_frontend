export function compare(expected, actual, mode = "trimmed") {
  const e = normalize(expected);
  const a = normalize(actual);

  if (mode === "strict") {
    return e === a;
  }

  if (mode === "trimmed") {
    return e.trimEnd() === a.trimEnd();
  }

  if (mode === "ignore-whitespace") {
    return collapse(e) === collapse(a);
  }

  return e.trimEnd() === a.trimEnd();
}

function normalize(str) {
  return String(str ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

function collapse(str) {
  return normalize(str)
    .replace(/\s+/g, " ")
    .trim();
}
