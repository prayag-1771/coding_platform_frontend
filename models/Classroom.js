import mongoose from "mongoose";

const ClassroomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Classroom ||
  mongoose.model("Classroom", ClassroomSchema);
