type BookingAdminTemplateParams = {
  serviceType: "stay" | "tour" | "adventure" | "vehicle";
  referenceCode: string;
  customerName: string;
  customerEmail: string;
  vendorName: string;
  vendorEmail: string;
  totalAmount: number;
  currency: string;
};

const bookingAdminTemplate = ({
  serviceType,
  referenceCode,
  customerName,
  customerEmail,
  vendorName,
  vendorEmail,
  totalAmount,
  currency,
}: BookingAdminTemplateParams) => {
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
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#020617;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 36px;background:#020617;color:#ffffff;">
                <h2 style="margin:0;font-size:22px;">SafarHub booking created</h2>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">A new ${humanService} was just booked.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 36px;color:#0f172a;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;">
                  <tr>
                    <td style="padding:4px 0;width:150px;font-weight:600;">Reference</td>
                    <td>${referenceCode}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Service type</td>
                    <td>${humanService}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Customer</td>
                    <td>${customerName} &lt;${customerEmail}&gt;</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Vendor</td>
                    <td>${vendorName} &lt;${vendorEmail}&gt;</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;font-weight:600;">Total</td>
                    <td>${formattedTotal}</td>
                  </tr>
                </table>
                <p style="margin-top:22px;font-size:13px;color:#475569;">
                  You can view full details and payment status in the admin dashboard.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default bookingAdminTemplate;


