type VendorPendingParams = {
  fullName: string;
};

const vendorPendingTemplate = ({ fullName }: VendorPendingParams) => {
  const greetingName = fullName?.trim() ? fullName.trim() : "Partner";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#0ea5e9,#22c55e);color:#ffffff;">
                <h1 style="margin:0;font-size:26px;">Thanks for joining SafarHub</h1>
                <p style="margin:8px 0 0;font-size:16px;opacity:0.9;">Your vendor dashboard is almost ready.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;color:#0f172a;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                  We received your vendor registration and locked your dashboard while our partnerships team reviews your details. 
                </p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                  Expect a follow-up from us soon. Once approved, you’ll get another email letting you know access is open.
                </p>
                <p style="font-size:15px;line-height:1.6;margin:0;">In the meantime, feel free to reply to this email if you have any questions.<br/><br/>— The SafarHub Vendor Team</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default vendorPendingTemplate;

