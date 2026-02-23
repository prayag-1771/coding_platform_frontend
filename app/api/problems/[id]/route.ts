export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import "@/models/register";
import mongoose from "mongoose";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid problem ID" },
        { status: 400 }
      );
    }

    const problem = await Problem.findById(id).lean();

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      if (problem.visibility !== "public") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
    } else {
      let user: any = null;

      try {
        user = verifyToken(token);
      } catch {
        user = null;
      }

      if (!user) {
        return NextResponse.json(
          { error: "Invalid token" },
          { status: 403 }
        );
      }
      if (user.role === "teacher") {
        if (
          problem.ownerId?.toString() !== user._id &&
          problem.visibility !== "public"
        ) {
          return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          );
        }
      }

      if (user.role === "student") {
        if (problem.visibility !== "public") {
          return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          );
        }
      }

    }
    return NextResponse.json(problem);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch problem" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    if (problem.ownerId?.toString() !== user._id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    delete body.ownerId;

    Object.assign(problem, body);
    await problem.save();

    return NextResponse.json(problem);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update problem" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return NextResponse.json(
        { error: "Problem not found" },
        { status: 404 }
      );
    }

    if (problem.ownerId?.toString() !== user._id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await problem.deleteOne();

    return NextResponse.json({
      message: "Deleted successfully",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete problem" },
      { status: 500 }
    );
  }
}