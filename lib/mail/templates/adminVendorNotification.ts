type AdminVendorNotificationParams = {
  fullName: string;
  email: string;
  contactNumber: string;
  age: number;
  vendorServices: string[];
};

const adminVendorNotification = ({
  fullName,
  email,
  contactNumber,
  age,
  vendorServices,
}: AdminVendorNotificationParams) => {
  const services =
    vendorServices?.length > 0
      ? vendorServices.map((service) => `<li style="margin-bottom:4px;">${service}</li>`).join("")
      : "<li>None provided</li>";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="padding:28px 36px;background:#0f172a;color:#ffffff;">
                <h2 style="margin:0;font-size:22px;">New vendor application on SafarHub</h2>
                <p style="margin:6px 0 0;font-size:14px;opacity:0.85;">Submitted moments ago via signup.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 36px;color:#0f172a;">
                <table width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.6;">
                  <tr>
                    <td style="padding:6px 0;width:140px;font-weight:600;">Full name</td>
                    <td>${fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-weight:600;">Email</td>
                    <td>${email}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-weight:600;">Phone</td>
                    <td>${contactNumber || "N/A"}</td>
                  </tr>
                  <tr>
                    <td style="padding:6px 0;font-weight:600;">Age</td>
                    <td>${age || "N/A"}</td>
                  </tr>
                </table>
                <div style="margin-top:24px;">
                  <p style="margin:0 0 8px;font-weight:600;">Requested services</p>
                  <ul style="padding-left:18px;margin:0;color:#0f172a;">${services}</ul>
                </div>
                <p style="margin-top:28px;font-size:14px;color:#475569;">Review this profile in the admin dashboard to approve vendor access.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default adminVendorNotification;

