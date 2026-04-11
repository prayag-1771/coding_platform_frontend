import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Set MONGODB_URI in .env.local first");
  process.exit(1);
}

const TestcaseSchema = new mongoose.Schema(
  {
    stdin: { type: String, required: true },
    expected: { type: String, required: true },
    visibility: { type: String, enum: ["sample", "hidden"], default: "hidden" },
    weight: { type: Number, default: 1 },
  },
  { _id: false }
);

const ProblemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    statement: { type: String, required: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    visibility: { type: String, enum: ["private", "classroom", "public"], default: "private" },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    tags: { type: [String], default: [] },
    timeLimitMs: { type: Number, default: 1000 },
    memoryLimitMb: { type: Number, default: 64 },
    compareMode: { type: String, enum: ["strict", "trimmed", "ignore-whitespace"], default: "trimmed" },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
    testcases: { type: [TestcaseSchema], default: [] },
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", ProblemSchema);

// Dummy owner ID (no real user needed for public problems)
const dummyOwnerId = new mongoose.Types.ObjectId();

const problems = [
  {
    title: "Sum of Two Numbers",
    statement:
      "Given two integers a and b, print their sum.\n\nInput: Two space-separated integers a and b.\nOutput: A single integer — the sum of a and b.\n\nConstraints:\n-10^9 <= a, b <= 10^9",
    ownerId: dummyOwnerId,
    visibility: "public",
    difficulty: "easy",
    tags: ["math", "basics"],
    compareMode: "trimmed",
    starterCode: {
      javascript:
        "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf8').trim().split(' ');\nconst a = Number(input[0]);\nconst b = Number(input[1]);\n// Print the sum\n",
      python: "a, b = map(int, input().split())\n# Print the sum\n",
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    int a, b;\n    cin >> a >> b;\n    // Print the sum\n    return 0;\n}',
    },
    testcases: [
      { stdin: "1 2\n", expected: "3", visibility: "sample", weight: 1 },
      { stdin: "0 0\n", expected: "0", visibility: "sample", weight: 1 },
      { stdin: "-5 10\n", expected: "5", visibility: "hidden", weight: 1 },
      { stdin: "1000000000 1000000000\n", expected: "2000000000", visibility: "hidden", weight: 1 },
      { stdin: "-1000000000 -1000000000\n", expected: "-2000000000", visibility: "hidden", weight: 1 },
    ],
  },
  {
    title: "Reverse a String",
    statement:
      "Given a string s, print it in reverse order.\n\nInput: A single string s (1 <= |s| <= 1000).\nOutput: The reversed string.\n\nExample:\nInput: hello\nOutput: olleh",
    ownerId: dummyOwnerId,
    visibility: "public",
    difficulty: "easy",
    tags: ["strings", "basics"],
    compareMode: "trimmed",
    starterCode: {
      javascript:
        "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\n// Reverse and print the string\n",
      python: "s = input()\n# Reverse and print the string\n",
      cpp: '#include <iostream>\n#include <algorithm>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    // Reverse and print the string\n    return 0;\n}',
    },
    testcases: [
      { stdin: "hello\n", expected: "olleh", visibility: "sample", weight: 1 },
      { stdin: "abcdef\n", expected: "fedcba", visibility: "sample", weight: 1 },
      { stdin: "a\n", expected: "a", visibility: "hidden", weight: 1 },
      { stdin: "racecar\n", expected: "racecar", visibility: "hidden", weight: 1 },
      { stdin: "OpenAI\n", expected: "IAnepO", visibility: "hidden", weight: 1 },
    ],
  },
  {
    title: "FizzBuzz",
    statement:
      "Given an integer n, print numbers from 1 to n. But for multiples of 3, print \"Fizz\" instead of the number. For multiples of 5, print \"Buzz\". For multiples of both 3 and 5, print \"FizzBuzz\".\n\nInput: A single integer n (1 <= n <= 100).\nOutput: n lines, each containing the number or the appropriate word.\n\nExample:\nInput: 5\nOutput:\n1\n2\nFizz\n4\nBuzz",
    ownerId: dummyOwnerId,
    visibility: "public",
    difficulty: "easy",
    tags: ["loops", "conditionals"],
    compareMode: "trimmed",
    starterCode: {
      javascript:
        "const fs = require('fs');\nconst n = Number(fs.readFileSync(0, 'utf8').trim());\n// Print FizzBuzz from 1 to n\n",
      python: "n = int(input())\n# Print FizzBuzz from 1 to n\n",
      cpp: '#include <iostream>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    // Print FizzBuzz from 1 to n\n    return 0;\n}',
    },
    testcases: [
      { stdin: "5\n", expected: "1\n2\nFizz\n4\nBuzz", visibility: "sample", weight: 1 },
      { stdin: "15\n", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz", visibility: "sample", weight: 1 },
      { stdin: "1\n", expected: "1", visibility: "hidden", weight: 1 },
      { stdin: "3\n", expected: "1\n2\nFizz", visibility: "hidden", weight: 1 },
      { stdin: "30\n", expected: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz", visibility: "hidden", weight: 1 },
    ],
  },
  {
    title: "Find Maximum Element",
    statement:
      "Given an array of n integers, find and print the maximum element.\n\nInput:\nFirst line: integer n (1 <= n <= 10^5)\nSecond line: n space-separated integers.\n\nOutput: A single integer — the maximum element.\n\nExample:\nInput:\n5\n3 1 4 1 5\nOutput: 5",
    ownerId: dummyOwnerId,
    visibility: "public",
    difficulty: "easy",
    tags: ["arrays", "basics"],
    compareMode: "trimmed",
    starterCode: {
      javascript:
        "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split('\\n');\nconst n = Number(lines[0]);\nconst arr = lines[1].split(' ').map(Number);\n// Find and print the maximum\n",
      python: "n = int(input())\narr = list(map(int, input().split()))\n# Find and print the maximum\n",
      cpp: '#include <iostream>\n#include <vector>\n#include <algorithm>\nusing namespace std;\nint main() {\n    int n;\n    cin >> n;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    // Find and print the maximum\n    return 0;\n}',
    },
    testcases: [
      { stdin: "5\n3 1 4 1 5\n", expected: "5", visibility: "sample", weight: 1 },
      { stdin: "1\n42\n", expected: "42", visibility: "sample", weight: 1 },
      { stdin: "3\n-1 -2 -3\n", expected: "-1", visibility: "hidden", weight: 1 },
      { stdin: "4\n0 0 0 0\n", expected: "0", visibility: "hidden", weight: 1 },
      { stdin: "6\n1000000 999999 1000001 500000 999998 1000000\n", expected: "1000001", visibility: "hidden", weight: 1 },
    ],
  },
  {
    title: "Palindrome Check",
    statement:
      "Given a string s consisting of lowercase English letters, determine if it is a palindrome. A palindrome reads the same forwards and backwards.\n\nInput: A single string s (1 <= |s| <= 10^5).\nOutput: Print \"YES\" if s is a palindrome, otherwise print \"NO\".\n\nExample:\nInput: racecar\nOutput: YES",
    ownerId: dummyOwnerId,
    visibility: "public",
    difficulty: "medium",
    tags: ["strings", "two-pointers"],
    compareMode: "trimmed",
    starterCode: {
      javascript:
        "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf8').trim();\n// Check if palindrome and print YES or NO\n",
      python: "s = input()\n# Check if palindrome and print YES or NO\n",
      cpp: '#include <iostream>\n#include <string>\nusing namespace std;\nint main() {\n    string s;\n    cin >> s;\n    // Check if palindrome and print YES or NO\n    return 0;\n}',
    },
    testcases: [
      { stdin: "racecar\n", expected: "YES", visibility: "sample", weight: 1 },
      { stdin: "hello\n", expected: "NO", visibility: "sample", weight: 1 },
      { stdin: "a\n", expected: "YES", visibility: "hidden", weight: 1 },
      { stdin: "abba\n", expected: "YES", visibility: "hidden", weight: 1 },
      { stdin: "abcd\n", expected: "NO", visibility: "hidden", weight: 1 },
    ],
  },
  {
    title: "Two Sum",
    statement:
      "Given an array of n integers and a target integer t, find two distinct indices i and j such that arr[i] + arr[j] = t. Print the two indices (0-based, space-separated, smaller index first). It is guaranteed that exactly one solution exists.\n\nInput:\nFirst line: integers n and t (2 <= n <= 10^4)\nSecond line: n space-separated integers.\n\nOutput: Two space-separated indices.\n\nExample:\nInput:\n4 9\n2 7 11 15\nOutput: 0 1",
    ownerId: dummyOwnerId,
    visibility: "public",
    difficulty: "medium",
    tags: ["arrays", "hash-map"],
    compareMode: "trimmed",
    starterCode: {
      javascript:
        "const fs = require('fs');\nconst lines = fs.readFileSync(0, 'utf8').trim().split('\\n');\nconst [n, t] = lines[0].split(' ').map(Number);\nconst arr = lines[1].split(' ').map(Number);\n// Find two indices that sum to t\n",
      python: "n, t = map(int, input().split())\narr = list(map(int, input().split()))\n# Find two indices that sum to t\n",
      cpp: '#include <iostream>\n#include <vector>\n#include <unordered_map>\nusing namespace std;\nint main() {\n    int n, t;\n    cin >> n >> t;\n    vector<int> arr(n);\n    for (int i = 0; i < n; i++) cin >> arr[i];\n    // Find two indices that sum to t\n    return 0;\n}',
    },
    testcases: [
      { stdin: "4 9\n2 7 11 15\n", expected: "0 1", visibility: "sample", weight: 1 },
      { stdin: "3 6\n3 2 4\n", expected: "1 2", visibility: "sample", weight: 1 },
      { stdin: "2 6\n3 3\n", expected: "0 1", visibility: "hidden", weight: 1 },
      { stdin: "5 10\n1 2 3 4 6\n", expected: "3 4", visibility: "hidden", weight: 1 },
    ],
  },
];

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  // Check which problems already exist by title to avoid duplicates
  const existingTitles = (await Problem.find({}, "title").lean()).map(p => p.title);
  console.log(`Found ${existingTitles.length} existing problems`);

  const newProblems = problems.filter(p => !existingTitles.includes(p.title));

  if (newProblems.length === 0) {
    console.log("All problems already exist. Nothing to add.");
    await mongoose.disconnect();
    return;
  }

  const inserted = await Problem.insertMany(newProblems);
  console.log(`Seeded ${inserted.length} problems successfully!`);

  for (const p of inserted) {
    console.log(`  - [${p.difficulty}] ${p.title} (${p._id})`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
