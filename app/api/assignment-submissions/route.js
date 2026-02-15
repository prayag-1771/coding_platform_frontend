export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AssignmentSubmission from "@/models/AssignmentSubmission";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { assignmentId, problemId, score, total } = body;

    const userId = "demo-user";

    await AssignmentSubmission.create({
      assignmentId,
      problemId,
      userId,
      score,
      total
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}
