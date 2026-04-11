export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Problem from "@/models/Problem";
import "@/models/register";
import { cookies } from "next/headers";
import { verifyToken, type TokenPayload } from "@/lib/jwt";
import mongoose from "mongoose";
import { getCsrfError } from "@/lib/csrf";

const ALLOWED_PROBLEM_FIELDS = [
  "title",
  "statement",
  "difficulty",
  "tags",
  "timeLimitMs",
  "memoryLimitMb",
  "compareMode",
  "starterCode",
  "testcases",
] as const;

function pickAllowedProblemFields(body: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};

  for (const key of ALLOWED_PROBLEM_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(body, key)) {
      payload[key] = body[key];
    }
  }

  return payload;
}

function normalizeTestcases(testcases: unknown) {
  if (!Array.isArray(testcases)) {
    return { error: "Testcases must be an array" as const };
  }

  const normalized = [];

  for (let index = 0; index < testcases.length; index += 1) {
    const testcase = testcases[index];

    if (!testcase || typeof testcase !== "object") {
      return { error: `Invalid testcase at index ${index}` as const };
    }

    const record = testcase as Record<string, unknown>;
    const input = record.input ?? record.stdin ?? "";
    const expectedOutput = record.expectedOutput ?? record.expected ?? "";
    const visibility = record.visibility;
    const weight = record.weight;

    if (typeof input !== "string" || typeof expectedOutput !== "string") {
      return { error: `Invalid testcase values at index ${index}` as const };
    }

    if (visibility !== undefined && visibility !== "sample" && visibility !== "hidden") {
      return { error: `Invalid testcase visibility at index ${index}` as const };
    }

    if (weight !== undefined && (typeof weight !== "number" || !Number.isFinite(weight) || weight <= 0)) {
      return { error: `Invalid testcase weight at index ${index}` as const };
    }

    normalized.push({
      id: typeof record.id === "string" && record.id.trim() ? record.id : `t${index + 1}`,
      input,
      expectedOutput,
      visibility: visibility === "sample" ? "sample" : "hidden",
      weight: typeof weight === "number" ? weight : 1,
    });
  }

  return { testcases: normalized } as const;
}



/* =========================
   GET PROBLEMS
========================= */
export async function GET(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies(); // ✅ Next.js 16 requires await
    const token = cookieStore.get("token")?.value;

    const { searchParams } = new URL(req.url);
    const visibility = searchParams.get("visibility");
    const scope = searchParams.get("scope");

    let filter: Record<string, unknown> = {};

    // 🔓 GUEST → only public
    if (!token) {
      filter = { visibility: "public" };
    } else {
      let user: TokenPayload | null = null;

      try {
        user = verifyToken(token);
      } catch {
        user = null;
      }

      if (!user) {
        filter = { visibility: "public" };
      }

      else if (user.role === "teacher") {

        const ownerId = new mongoose.Types.ObjectId(user._id);

        if (scope === "all") {
          filter = {
            $or: [
              { ownerId },
              { visibility: "public" }
            ]
          };
        }

        else if (scope === "private") {
          filter = {
            ownerId,
            visibility: "private"
          };
        }

        else if (scope === "assignable") {
          filter = {
            $or: [
              { ownerId, visibility: "private" },
              { visibility: "public" }
            ]
          };
        }

        else {
          filter = { ownerId };
        }
      }

      else if (user.role === "student") {
        filter = { visibility: "public" };
      }

      else if (user.role === "author") {
        filter = visibility ? { visibility } : {};
      }

      else {
        filter = { visibility: "public" };
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



/* =========================
   CREATE PROBLEM
========================= */
export async function POST(req: Request) {
  const csrfError = getCsrfError(req);

  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  try {
    await connectDB();

    const cookieStore = await cookies(); // ✅ Next.js 16
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let user: TokenPayload | null = null;

    try {
      user = verifyToken(token);
    } catch {
      user = null;
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }

    const body = await req.json();

    const testcaseValidation = normalizeTestcases(body.testcases);

    if ("error" in testcaseValidation) {
      return NextResponse.json(
        { error: testcaseValidation.error },
        { status: 400 }
      );
    }

    let visibility = "private";

    if (user.role === "author") {
      visibility = body.visibility === "public" ? "public" : "private";
    }

    else if (user.role === "teacher") {
      visibility =
        body.visibility === "classroom" ? "classroom" : "private";
    }

    else if (user.role === "student") {
      visibility = "private";
    }

    const safeBody = pickAllowedProblemFields(body);

    safeBody.testcases = testcaseValidation.testcases;

    const problem = await Problem.create({
      ...safeBody,
      visibility,
      ownerId: new mongoose.Types.ObjectId(user._id),
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