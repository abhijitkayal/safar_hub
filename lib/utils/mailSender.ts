import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const mailSender = async (email: string, title: string, body: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"Hello" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
    });
    console.log("Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("mailSender error:", error);
    throw error;
  }
};