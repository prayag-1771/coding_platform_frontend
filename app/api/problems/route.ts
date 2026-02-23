export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import "@/models/register"; 
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const visibility = searchParams.get("visibility");
    const scope = searchParams.get("scope");

    let filter: any = {};

    if (user.role === "teacher") {

      if (scope === "all") {
        filter = {
          $or: [
            { ownerId: user._id },
            { visibility: "public" }
          ]
        };
      }

      else if (scope === "private") {
        filter = {
          ownerId: user._id,
          visibility: "private"
        };
      }

      else if (scope === "assignable") {
        filter = {
          $or: [
            {
              ownerId: user._id,
              visibility: "private"
            },
            {
              visibility: "public"
            }
          ]
        };
      }

      else {
        filter = { ownerId: user._id };
      }
    }

    else if (user.role === "student") {
      filter = { visibility: "public" };
    }

    else if (user.role === "author") {
      if (visibility) {
        filter.visibility = visibility;
      }
    }

    const problems = await Problem.find(filter)
      .select("_id title difficulty visibility")
      .lean();

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();

    let visibility = "private"; 

    if (user.role === "author") {
      visibility = body.visibility === "public" ? "public" : "private";
    }

    if (user.role === "teacher") {
      visibility =
        body.visibility === "classroom" ? "classroom" : "private";
    }

    if (user.role === "student") {
      visibility = "private";
    }

    const problem = await Problem.create({
      ...body,
      visibility,
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