export const questions = [
  {
    id: "two-sum",
    title: "Two Sum",
    description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    starterCode: {
      javascript: `function twoSum(nums, target) {\n\n}`,
      python: `def twoSum(nums, target):\n    pass`,
      cpp: `vector<int> twoSum(vector<int>& nums, int target) {\n\n}`
    },
    tests: [
      { input: [[2,7,11,15], 9], output: [0,1] },
      { input: [ [3,2,4], 6 ], output: [1,2] }
    ]
  },

  {
    id: "reverse-string",
    title: "Reverse String",
    description: "Reverse the input string.",
    starterCode: {
      javascript: `function reverseString(s) {\n\n}`,
      python: `def reverseString(s):\n    pass`,
      cpp: `string reverseString(string s) {\n\n}`
    },
    tests: [
      { input: ["hello"], output: "olleh" },
      { input: ["abc"], output: "cba" }
    ]
  }
];
