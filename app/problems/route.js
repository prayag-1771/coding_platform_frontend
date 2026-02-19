export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const visibility = searchParams.get("visibility");

    let filter = {};

    if (visibility === "public") {
      filter.visibility = "public";
    }

    if (visibility === "private") {
      const token = cookies().get("token")?.value;

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
          { status: 401 }
        );
      }

      filter = {
        visibility: "private",
        ownerId: user.userId,
      };
    }

    const problems = await Problem.find(filter);

    return NextResponse.json(problems);

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}
