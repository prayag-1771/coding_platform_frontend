export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { text, difficulty, language } = body;

    if (!text) {
      return NextResponse.json(
        { error: "text is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `
You are a coding problem author.

Convert the given idea into a VALID JSON object with this exact structure:

{
  "title": string,
  "statement": string,
  "difficulty": "easy" | "medium" | "hard",
  "tags": string[],
  "timeLimitMs": number,
  "memoryLimitMb": number,
  "starterCode": {
    "javascript": string,
    "cpp": string,
    "python": string
  },
  "testcases": [
    {
      "stdin": string,
      "expected": string,
      "visibility": "sample" | "hidden",
      "weight": number
    }
  ]
}

Rules:
- Return ONLY JSON
- No markdown
- No explanations
- At least 2 sample testcases
- At least 5 hidden testcases
- Testcases must strictly match the statement
- starterCode.javascript must be a valid JS function template
- The response must start with { and end with }
`;

    const userPrompt = `
Problem idea:
${text}

Difficulty: ${difficulty || "medium"}
Preferred language: ${language || "javascript"}
`;

    const aiResponse = await callYourLLM(systemPrompt, userPrompt);

    let problem;

    try {
      problem = JSON.parse(aiResponse);
    } catch (err) {
      console.error("OLLAMA PARSE ERROR:", aiResponse);
      return NextResponse.json(
        { error: "Model did not return valid JSON", raw: aiResponse },
        { status: 500 }
      );
    }

    // 🔥 NORMALIZATION LAYER (VERY IMPORTANT)

    problem.compareMode = "trimmed";

    if (!problem.tags) problem.tags = [];
    if (!problem.timeLimitMs) problem.timeLimitMs = 1000;
    if (!problem.memoryLimitMb) problem.memoryLimitMb = 64;

    if (!problem.starterCode) {
      problem.starterCode = {
        javascript: "",
        cpp: "",
        python: ""
      };
    }

    // Remove unsupported languages if present
    delete problem.starterCode.java;

    // Normalize testcases
    if (Array.isArray(problem.testcases)) {
      problem.testcases = problem.testcases.map((tc) => ({
        stdin: tc.stdin || "",
        expected: tc.expected || "",
        visibility:
          tc.visibility === "sample" ? "sample" : "hidden",
        weight:
          typeof tc.weight === "number" ? tc.weight : 1
      }));
    } else {
      problem.testcases = [];
    }

    return NextResponse.json(problem);

  } catch (err) {
    console.error("OLLAMA ERROR:", err);
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}

async function callYourLLM(systemPrompt, userPrompt) {
  const prompt = `${systemPrompt}\n\n${userPrompt}`;

  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: false,
      options: {
        temperature: 0.2
      }
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error("Ollama error: " + t);
  }

  const data = await res.json();

  return data.response.trim();
}
