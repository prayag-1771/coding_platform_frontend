import mongoose from "mongoose";

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    deadline: {
      type: Date,
      required: true
    },

    problems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
        required: true
      }
    ],

    isPublished: {
      type: Boolean,
      default: false
    }

  },
  {
    timestamps: true
  }
);

export default mongoose.models.Assignment ||
  mongoose.model("Assignment", AssignmentSchema);
