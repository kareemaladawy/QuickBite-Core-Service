import { renderEmailLayout, renderOtpBlock, emailTheme } from "../../../lib/email/base.template";

export const MemberInvitationEmail = (otp: string, name?: string): { subject: string, html: string } => {
    const greeting = name ? `Hi ${name},` : "Hi there,";

    const bodyHtml = `
<p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:${emailTheme.TEXT_COLOR};">
${greeting} you've been invited to join a restaurant team on ${emailTheme.BRAND_NAME}. Use the code below to activate your account.
</p>
${renderOtpBlock(otp)}
<p style="margin:0; font-size:14px; line-height:1.6; color:${emailTheme.MUTED_COLOR};">
This code expires in <strong>15 minutes</strong>. If you weren't expecting this invitation, you can safely ignore this email.
</p>
`;

    return {
        subject: "You've been invited to QuickBite",
        html: renderEmailLayout({
            preheader: `Your invitation code is ${otp}`,
            heading: "You're invited",
            bodyHtml,
        }),
    };
};
