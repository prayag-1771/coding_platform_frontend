export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AssignmentSubmission from "@/models/AssignmentSubmission";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCsrfError } from "@/lib/csrf";

export async function POST(req) {
  const csrfError = getCsrfError(req);

  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  const rateLimit = checkRateLimit(req, {
    keyPrefix: "assignment:submit",
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many submission attempts. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
        },
      }
    );
  }

  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let user;
    try {
      user = verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    if (!user || user.role !== "student") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { assignmentId, problemId, score, total } = body;

    if (!assignmentId || !problemId) {
      return NextResponse.json(
        { error: "Invalid submission data" },
        { status: 400 }
      );
    }

    const Assignment = (await import("@/models/Assignment")).default;
    const Classroom = (await import("@/models/Classroom")).default;

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    if (new Date(assignment.deadline) < new Date()) {
      return NextResponse.json(
        { error: "Assignment deadline has passed" },
        { status: 403 }
      );
    }

    const problemExists = assignment.problems.some(
      (p) => p.toString() === problemId
    );

    if (!problemExists) {
      return NextResponse.json(
        { error: "Problem not part of this assignment" },
        { status: 403 }
      );
    }

    const classroom = await Classroom.findById(assignment.classroomId);

    if (!classroom) {
      return NextResponse.json(
        { error: "Classroom not found" },
        { status: 404 }
      );
    }

    const isEnrolled = classroom.students.some(
      (s) => s.toString() === user._id
    );

    if (!isEnrolled) {
      return NextResponse.json(
        { error: "Not enrolled in this classroom" },
        { status: 403 }
      );
    }

    const parsedScore = Number(score);
    const parsedTotal = Number(total);

    if (!Number.isFinite(parsedScore) || !Number.isFinite(parsedTotal)) {
      return NextResponse.json(
        { error: "Invalid score payload" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(parsedScore) || !Number.isInteger(parsedTotal)) {
      return NextResponse.json(
        { error: "Score and total must be integers" },
        { status: 400 }
      );
    }

    if (parsedTotal <= 0 || parsedScore < 0 || parsedScore > parsedTotal) {
      return NextResponse.json(
        { error: "Score range is invalid" },
        { status: 400 }
      );
    }

    await AssignmentSubmission.create({
      assignmentId,
      problemId,
      userId: user._id,
      score: parsedScore,
      total: parsedTotal,
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
