export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

import Assignment from "@/models/Assignment";
import mongoose from "mongoose";

export async function GET(req, context) {
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

    const user = verifyToken(token);

    if (!user || user.role !== "teacher") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const assignment = await Assignment.findById(id)
      .populate("problems");

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
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

    const user = verifyToken(token);

    if (!user || user.role !== "teacher") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { id } = await context.params;

    await Assignment.findByIdAndDelete(id);

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Delete failed" },
      { status: 500 }
    );
  }
}
