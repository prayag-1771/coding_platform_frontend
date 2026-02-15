import mongoose from "mongoose";

const TestcaseSchema = new mongoose.Schema(
  {
    stdin: {
      type: String,
      required: true,
    },
    expected: {
      type: String,
      required: true,
    },
    visibility: {
      type: String,
      enum: ["sample", "hidden"],
      default: "hidden",
    },
    weight: {
      type: Number,
      default: 1,
    },
  },
  { _id: false }
);

const ProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    statement: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    tags: {
      type: [String],
      default: [],
    },
    timeLimitMs: {
      type: Number,
      default: 1000,
    },
    memoryLimitMb: {
      type: Number,
      default: 64,
    },
    compareMode: {
      type: String,
      enum: ["strict", "trimmed", "ignore-whitespace"],
      default: "trimmed",
    },
    starterCode: {
      javascript: { type: String, default: "" },
      python: { type: String, default: "" },
      cpp: { type: String, default: "" },
    },
    testcases: {
      type: [TestcaseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Problem ||
  mongoose.model("Problem", ProblemSchema);
