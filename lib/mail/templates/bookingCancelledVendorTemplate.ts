type BookingCancelledVendorParams = {
  vendorName: string;
  vendorEmail: string;
  serviceType: "stay" | "tour" | "adventure" | "vehicle";
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  reason: string;
};

const bookingCancelledVendorTemplate = ({
  vendorName,
  vendorEmail,
  serviceType,
  referenceCode,
  customerName,
  customerEmail,
  customerPhone,
  reason,
}: BookingCancelledVendorParams) => {
  const greetingName = vendorName?.trim() || vendorEmail || "Partner";

  const humanService =
    serviceType === "stay"
      ? "stay"
      : serviceType === "tour"
      ? "tour"
      : serviceType === "adventure"
      ? "adventure"
      : "vehicle rental";

  const safeReason = reason?.trim() || "No reason provided by the guest.";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 36px;background:#0f172a;color:#ffffff;">
                <h2 style="margin:0;font-size:22px;">A SafarHub booking was cancelled</h2>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">The traveler cancelled their ${humanService} booking.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px;color:#0f172a;">
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
                  The following booking has been cancelled by the guest:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;margin-bottom:12px;">
                  <tr>
                    <td style="padding:4px 0;width:140px;font-weight:600;">Reference</td>
                    <td>${referenceCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Service</td>
                    <td>${humanService}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Guest</td>
                    <td>${customerName} &lt;${customerEmail}&gt;</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Guest phone</td>
                    <td>${customerPhone || "N/A"}</td>
                  </tr>
                </table>
                <p style="font-size:14px;line-height:1.6;margin:16px 0 6px;font-weight:600;">Guest's cancellation reason</p>
                <p style="font-size:14px;line-height:1.6;margin:0 0 12px;border-left:3px solid #e5e7eb;padding-left:10px;color:#374151;">
                  ${safeReason}
                </p>
                <p style="font-size:13px;line-height:1.6;margin:16px 0 0;color:#475569;">
                  You can review this booking in your vendor dashboard for any further action.
                </p>
                <p style="font-size:14px;line-height:1.6;margin:20px 0 0;">— SafarHub Vendor Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default bookingCancelledVendorTemplate;


