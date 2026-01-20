type BookingStatusUpdateParams = {
  fullName: string;
  email: string;
  serviceType: "stay" | "tour" | "adventure" | "vehicle";
  referenceCode: string;
  newStatus: string;
};

const bookingStatusUpdateTemplate = ({
  fullName,
  email,
  serviceType,
  referenceCode,
  newStatus,
}: BookingStatusUpdateParams) => {
  const greetingName = fullName?.trim() || email || "Traveler";

  const humanService =
    serviceType === "stay"
      ? "stay"
      : serviceType === "tour"
      ? "tour"
      : serviceType === "adventure"
      ? "adventure"
      : "vehicle rental";

  const humanStatus =
    newStatus === "pending"
      ? "Pending"
      : newStatus === "confirmed"
      ? "Confirmed"
      : newStatus === "completed"
      ? "Completed"
      : newStatus === "cancelled"
      ? "Cancelled"
      : newStatus;

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#22c55e,#0ea5e9);color:#ffffff;">
                <h1 style="margin:0;font-size:24px;">Your SafarHub booking was updated</h1>
                <p style="margin:8px 0 0;font-size:14px;opacity:0.9;">The status of your booking has changed.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px;color:#0f172a;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">
                  The status of your <strong>${humanService}</strong> booking has been updated to
                  <strong>${humanStatus}</strong>.
                </p>
                <table cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;line-height:1.6;margin:16px 0 8px;">
                  <tr>
                    <td style="padding:4px 0;width:150px;font-weight:600;">Reference</td>
                    <td>${referenceCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">New status</td>
                    <td>${humanStatus}</td>
                  </tr>
                </table>
                <p style="font-size:14px;line-height:1.6;margin:18px 0 0;">
                  If you weren’t expecting this change or have questions, please contact support or reply to this email.
                </p>
                <p style="font-size:15px;line-height:1.6;margin:24px 0 0;">— The SafarHub Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default bookingStatusUpdateTemplate;


