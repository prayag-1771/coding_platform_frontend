export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import "@/models/register"; // STAR_PROBLEM safe
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET() {
  try {
    await connectDB();

    const problems = await Problem.find().select(
      "_id title difficulty"
    );

    return NextResponse.json(problems);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
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
    if (!user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const problem = await Problem.create({
      ...body,
      ownerId: user._id, 
    });

    return NextResponse.json(problem, { status: 201 });

  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to create problem" },
      { status: 500 }
    );
  }
}