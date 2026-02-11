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
  "id": string,
  "title": string,
  "statement": string,
  "difficulty": "easy" | "medium" | "hard",
  "tags": string[],
  "timeLimitMs": number,
  "memoryLimitMb": number,
  "starterCode": {
    "cpp": string,
    "python": string,
    "java": string
  },
  "testcases": [
    {
      "id": string,
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
- At least 2 sample testcases
- At least 5 hidden testcases
- The problem must be original
- Testcases must match the statement exactly
`;

    const userPrompt = `
Problem idea / text:
${text}

Difficulty: ${difficulty || "medium"}
Preferred language: ${language || "cpp"}
`;

    // mock LLM call for now
    const aiResponse = await callYourLLM(systemPrompt, userPrompt);

    let problem;
    try {
      problem = JSON.parse(aiResponse);
    } catch (e) {
      return NextResponse.json(
        { error: "AI did not return valid JSON", raw: aiResponse },
        { status: 500 }
      );
    }

    return NextResponse.json(problem);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}


/*
 Temporary mock LLM.
 This lets you test your UI and flow before wiring a real AI API.
*/
async function callYourLLM(systemPrompt, userPrompt) {
  return JSON.stringify({
    id: "sample-1",
    title: "Sum of two numbers",
    statement: "Given two integers, print their sum.",
    difficulty: "easy",
    tags: ["math", "io"],
    timeLimitMs: 1000,
    memoryLimitMb: 256,
    starterCode: {
      cpp:
        "#include <bits/stdc++.h>\nusing namespace std;\nint main(){int a,b;cin>>a>>b;cout<<a+b;return 0;}",
      python:
        "a,b=map(int,input().split())\nprint(a+b)",
      java:
        "import java.util.*;\npublic class Main{\n  public static void main(String[] args){\n    Scanner sc=new Scanner(System.in);\n    int a=sc.nextInt();\n    int b=sc.nextInt();\n    System.out.print(a+b);\n  }\n}"
    },
    testcases: [
      { id: "t1", stdin: "1 2\n", expected: "3", visibility: "sample", weight: 1 },
      { id: "t2", stdin: "5 7\n", expected: "12", visibility: "sample", weight: 1 },

      { id: "h1", stdin: "10 20\n", expected: "30", visibility: "hidden", weight: 1 },
      { id: "h2", stdin: "0 0\n", expected: "0", visibility: "hidden", weight: 1 },
      { id: "h3", stdin: "-1 1\n", expected: "0", visibility: "hidden", weight: 1 },
      { id: "h4", stdin: "100 200\n", expected: "300", visibility: "hidden", weight: 1 },
      { id: "h5", stdin: "999 1\n", expected: "1000", visibility: "hidden", weight: 1 }
    ]
  });
}
