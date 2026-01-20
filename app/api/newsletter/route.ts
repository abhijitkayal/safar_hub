import { NextRequest, NextResponse } from "next/server";
import { mailSender } from "@/lib/utils/mailSender";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email?.trim();
    const consent = Boolean(body?.consent);

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ success: false, message: "Consent is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ success: false, message: "Please enter a valid email" }, { status: 400 });
    }

    const recipient = process.env.EMAIL_TO || process.env.EMAIL_USER;
    if (!recipient) {
      console.error("Newsletter: EMAIL_TO or EMAIL_USER env var missing");
      return NextResponse.json({ success: false, message: "Email destination is not configured" }, { status: 500 });
    }

    const title = "New Newsletter Subscription";
    const html = `
      <h3>New subscriber</h3>
      <p>Email: <strong>${email}</strong></p>
      <p>Consent provided: ${consent ? "Yes" : "No"}</p>
      <p>Received at: ${new Date().toLocaleString()}</p>
    `;

    await mailSender(recipient, title, html);

    return NextResponse.json({ success: true, message: "Subscription received" });
  } catch (error: any) {
    console.error("Newsletter subscription failed", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to submit subscription" },
      { status: 500 }
    );
  }
}


