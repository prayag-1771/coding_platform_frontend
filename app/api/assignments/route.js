export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";

import Assignment from "@/models/Assignment";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const assignments = await Assignment.find()
      .populate("problems", "title difficulty")
      .sort({ createdAt: -1 });

    return NextResponse.json(assignments);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { title, description, deadline, problems } = body;

    if (!title || !deadline || !Array.isArray(problems)) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    for (let id of problems) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json(
          { error: "Invalid problem ID: " + id },
          { status: 400 }
        );
      }
    }

    const assignment = await Assignment.create({
      title,
      description,
      deadline,
      problems
    });

    return NextResponse.json(assignment, { status: 201 });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create assignment" },
      { status: 500 }
    );
  }
}
