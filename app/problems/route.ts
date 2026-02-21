import jwt from "jsonwebtoken";

export interface JwtPayload {
  _id: string;
  role: "student" | "teacher" | "author";
}

export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
}