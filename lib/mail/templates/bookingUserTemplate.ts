type BookingUserTemplateParams = {
  fullName: string;
  email: string;
  serviceType: "stay" | "tour" | "adventure" | "vehicle";
  referenceCode: string;
  checkInOutText: string;
  totalAmount: number;
  currency: string;
};

const bookingUserTemplate = ({
  fullName,
  email,
  serviceType,
  referenceCode,
  checkInOutText,
  totalAmount,
  currency,
}: BookingUserTemplateParams) => {
  const greetingName = fullName?.trim() || email || "Traveler";
  const formattedTotal = `${currency} ${totalAmount.toFixed(2)}`;

  const humanService =
    serviceType === "stay"
      ? "stay"
      : serviceType === "tour"
      ? "tour"
      : serviceType === "adventure"
      ? "adventure"
      : "vehicle rental";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#22c55e,#3b82f6);color:#ffffff;">
                <h1 style="margin:0;font-size:24px;">Your SafarHub booking is confirmed</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">Thanks for planning your journey with us.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px;color:#0f172a;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
                  We've received your booking for a <strong>${humanService}</strong>. Here are the key details:
                </p>
                <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6;margin:16px 0 8px;">
                  <tr>
                    <td style="padding:4px 0;width:130px;font-weight:600;">Reference</td>
                    <td>${referenceCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Dates</td>
                    <td>${checkInOutText}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Total</td>
                    <td>${formattedTotal}</td>
                  </tr>
                </table>
                <p style="font-size:14px;line-height:1.6;margin:16px 0 0;">
                  We'll also notify your host so they can prepare for your arrival. If you have any questions, simply reply to this email.
                </p>
                <p style="font-size:15px;line-height:1.6;margin:24px 0 0;">Have a great trip,<br/><strong>The SafarHub Team</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default bookingUserTemplate;


