import nodemailer from "nodemailer";
import dbConnect from "@/lib/config/database";
import Contact from "@/models/Contact";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { name, email, countryCode, contact, service, requirement } = body;

    // Validation
    if (!name || !email || !countryCode || !contact || !service || !requirement) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (!/^\d{10}$/.test(contact)) {
      return NextResponse.json({ error: "Contact number must be exactly 10 digits" }, { status: 400 });
    }

    if (!countryCode.startsWith("+")) {
      return NextResponse.json({ error: "Invalid country code" }, { status: 400 });
    }

    // Persist to database
    let savedContact;
    try {
      savedContact = await Contact.create({
        name,
        email,
        countryCode,
        contact,
        service,
        requirement,
        status: "new"
      });
    } catch (dbErr) {
      console.error("Database save error:", dbErr);
      // We continue to try sending email even if DB fails, or we could fail here.
      // Usually, DB is primary, so let's fail if DB fails to ensure data integrity.
      throw new Error("Failed to save contact inquiry");
    }

    const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
      console.warn("Missing email environment variables - enquiry saved to DB but email not sent");
      return NextResponse.json({
        success: true,
        message: "Enquiry saved successfully! (Notification email pending setup)",
        contactId: savedContact._id
      });
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: 465,
      secure: true,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"Contact Form" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      replyTo: email,
      subject: `New Inquiry: ${service} – ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; max-width:600px;">
          <h2 style="color:#0ebac7;">🚀 New Contact Form Submission</h2>
          <hr style="border:1px solid #eee; margin:20px 0;" />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${countryCode} ${contact}</p>
         
          <p><strong>Requirement:</strong></p>
          <blockquote style="background:#f9f9f9; padding:12px; border-left:4px solid #0ebac7; margin:16px 0;">
            ${requirement?.replace(/\n/g, "<br>")}
          </blockquote>
          <hr style="border:1px solid #eee; margin:20px 0;" />
          <p style="font-size: 12px; color: #999;">Reference ID: ${savedContact._id}</p>
          <small style="color:#777;">Sent via website contact form</small>
        </div>
      `,
      text: `
New Contact Form Submission

Reference ID: ${savedContact._id}
Name: ${name}
Email: ${email}
Phone: ${countryCode} ${contact}
Requirement: ${requirement}

Sent via website contact form
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "Mail sent and enquiry saved successfully!",
      contactId: savedContact._id
    });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json({
      success: false,
      error: err?.message || "Internal server error",
      message: "Failed to process enquiry.",
    }, { status: 500 });
  }
}
