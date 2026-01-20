type WelcomeTemplateParams = {
  fullName: string;
};

const welcomeUserTemplate = ({ fullName }: WelcomeTemplateParams) => {
  const greetingName = fullName?.trim() ? fullName.trim() : "Traveler";

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f7fb;padding:24px;font-family:'Segoe UI',Arial,sans-serif;">
      <tr>
        <td align="center">
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 10px 35px rgba(15,23,42,0.08);">
            <tr>
              <td style="padding:32px 40px;background:linear-gradient(135deg,#3b82f6,#22c55e);color:#ffffff;">
                <h1 style="margin:0;font-size:26px;">Welcome to SafarHub</h1>
                <p style="margin:8px 0 0;font-size:16px;opacity:0.9;">We're thrilled to have you on board!</p>
              </td>
            </tr>
            <tr>
              <td style="padding:32px 40px;color:#0f172a;">
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">Hi ${greetingName},</p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                  Thanks for creating your SafarHub account. You can now explore curated stays, unforgettable tours, and easy rentals all in one place.
                </p>
                <p style="font-size:16px;line-height:1.6;margin:0 0 16px;">
                  Head over to your dashboard, build your wishlist, and start planning your next escape.
                </p>
             
                <p style="font-size:15px;line-height:1.6;margin:0;">Safe SafarHub,<br/><strong>The SafarHub Team</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
};

export default welcomeUserTemplate;

