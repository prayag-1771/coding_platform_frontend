import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "";

function getJwtSecret() {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  return JWT_SECRET;
}

export type TokenPayload = {
  _id: string;
  role: "student" | "teacher" | "author";
};

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
  } catch {
    return null;
  }
}