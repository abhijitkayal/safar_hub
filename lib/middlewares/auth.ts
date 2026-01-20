// lib/middlewares/auth.ts
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const auth = (
  handler: (req: NextRequest, context?: any) => Promise<Response>
) => {
  return async (req: NextRequest, context?: any) => {
    try {
      const authHeader = req.headers.get("authorization");
      const tokenFromHeader = authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

      const tokenFromCookie = req.cookies.get("token")?.value;
      const token = tokenFromHeader || tokenFromCookie;

      if (!token) {
        return NextResponse.json(
          { success: false, message: "Unauthorized" },
          { status: 401 }
        );
      }

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET not defined");
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;

      (req as any).user = decoded;

      return handler(req, context);
    } catch (error) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
        { status: 401 }
      );
    }
  };
};
