export const runtime = "nodejs";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { checkRateLimit } from "@/lib/rateLimit";
import { getCsrfError } from "@/lib/csrf";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

function isStrongPassword(password) {
  return (
    password.length >= PASSWORD_MIN_LENGTH &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export async function POST(req) {
  const csrfError = getCsrfError(req);

  if (csrfError) {
    return NextResponse.json({ error: csrfError }, { status: 403 });
  }

  try {
    await connectDB();

    const rateLimit = checkRateLimit(req, {
      keyPrefix: "auth:register",
      limit: 5,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const { name, email, password, role } =
      await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters and include uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const allowedRoles = ["student", "teacher", "author"];

    const finalRole = allowedRoles.includes(role)
      ? role
      : "student";

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashed,
      role: finalRole,
    });

    return NextResponse.json(
      { message: "Registration successful" },
      { status: 201 }
    );

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}