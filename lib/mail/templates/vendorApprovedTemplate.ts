type VendorApprovedParams = {
  fullName: string;
};

const vendorApprovedTemplate = ({ fullName }: VendorApprovedParams) => {
  const greetingName = fullName?.trim() ? fullName.trim() : "Partner";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://safarhub.com";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#22c55e,#3b82f6);color:#ffffff;">
                <h1 style="margin:0;font-size:26px;">Your SafarHub vendor access is live</h1>
                <p style="margin:8px 0 0;font-size:16px;opacity:0.9;">Go ahead and publish your first listing.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;color:#0f172a;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                  Great news—your vendor dashboard has been unlocked. You now have full access to manage listings, respond to travelers, and track bookings.
                </p>
                <div style="text-align:center;margin:28px 0;">
                  <a href="${appUrl}/vendor" style="background:#22c55e;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;display:inline-block;">
                    Open Vendor Dashboard
                  </a>
                </div>
                <p style="font-size:15px;line-height:1.6;margin:0;">Need help getting started? Reply to this email and our team will guide you.<br/><br/>— The SafarHub Vendor Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default vendorApprovedTemplate;

