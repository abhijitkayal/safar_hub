//app/api/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();

  // ✅ Delete token cookie
  cookieStore.delete("token");

  // ✅ Build response
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  // ✅ Explicitly expire cookie (defense-in-depth)
  response.cookies.set({
    name: "token",
    value: "",
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
