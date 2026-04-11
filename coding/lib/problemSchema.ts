export function createEmptyProblem() {
  return {
    id: "",
    title: "",
    statement: "",
    difficulty: "easy", 
    tags: [],

    timeLimitMs: 1000,
    memoryLimitMb: 256,

    starterCode: {
      cpp: "",
      python: "",
      java: ""
    },

    testcases: []
  };
}
