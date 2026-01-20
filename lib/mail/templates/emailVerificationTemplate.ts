export default function emailVerificationTemplate(otp: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Verify Your Email</title>
</head>
<body style="font-family: Arial, sans-serif; background:#f4f4f4; padding:20px;">
  <div style="max-width:600px; margin:auto; background:white; padding:30px; border-radius:12px; text-align:center;">
    <h3 style="color:#16A34A; font-size:28px;">SafarHub</h3>
    <h2 style="color:#5A189A;">Verify Your Email</h2>
    <p>Use the OTP below to complete signup:</p>
    <h1 style="font-size:36px; color:#16A34A; letter-spacing:8px;">${otp}</h1>
    <p style="color:#666; font-size:14px;">Valid for 5 minutes.</p>
    <hr style="margin:30px 0;">
    <p style="font-size:12px; color:#999;">
      Need help? <a href="mailto:support@Travels.com">support@Travels.com</a>
    </p>
  </div>
</body>
</html>`;
}