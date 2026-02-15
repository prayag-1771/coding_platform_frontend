import mongoose from "mongoose";

const AssignmentSubmissionSchema = new mongoose.Schema(
  {
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    score: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.models.AssignmentSubmission ||
  mongoose.model("AssignmentSubmission", AssignmentSubmissionSchema);
