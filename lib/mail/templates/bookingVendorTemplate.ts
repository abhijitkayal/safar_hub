type BookingVendorTemplateParams = {
  vendorName: string;
  vendorEmail: string;
  serviceType: "stay" | "tour" | "adventure" | "vehicle";
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  checkInOutText: string;
  totalAmount: number;
  currency: string;
};

const bookingVendorTemplate = ({
  vendorName,
  vendorEmail,
  serviceType,
  referenceCode,
  customerName,
  customerEmail,
  customerPhone,
  checkInOutText,
  totalAmount,
  currency,
}: BookingVendorTemplateParams) => {
  const greetingName = vendorName?.trim() || vendorEmail || "Partner";
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
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 36px;background:#0f172a;color:#ffffff;">
                <h2 style="margin:0;font-size:22px;">You have a new SafarHub booking</h2>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">A traveler just booked one of your listings.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px;color:#0f172a;">
                <p style="font-size:15px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:14px;line-height:1.6;margin:0 0 14px;">
                  A new <strong>${humanService}</strong> booking has been created. Here are the details:
                </p>
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;margin-bottom:12px;">
                  <tr>
                    <td style="padding:4px 0;width:140px;font-weight:600;">Reference</td>
                    <td>${referenceCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Guest</td>
                    <td>${customerName} &lt;${customerEmail}&gt;</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Guest phone</td>
                    <td>${customerPhone || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Dates</td>
                    <td>${checkInOutText}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Total amount</td>
                    <td>${formattedTotal}</td>
                  </tr>
                </table>
                <p style="font-size:13px;line-height:1.6;margin:12px 0 0;color:#475569;">
                  Please review this booking in your vendor dashboard and contact the traveler if you need any additional information.
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

export default bookingVendorTemplate;


