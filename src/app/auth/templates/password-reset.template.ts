import { renderEmailLayout, renderOtpBlock, emailTheme } from "../../../lib/email/base.template";

export const PasswordResetEmail = (otp: string, name?: string): { subject: string, html: string } => {
    const greeting = name ? `Hi ${name},` : "Hi there,";

    const bodyHtml = `
<p style="margin:0 0 20px; font-size:15px; line-height:1.6; color:${emailTheme.TEXT_COLOR};">
${greeting} we received a request to reset your password. Use the code below to continue.
</p>
${renderOtpBlock(otp)}
<p style="margin:0; font-size:14px; line-height:1.6; color:${emailTheme.MUTED_COLOR};">
This code expires in <strong>5 minutes</strong>. If you didn't request a password reset, you can ignore this email and your password will remain unchanged.
</p>
`;

    return {
        subject: "Reset your password",
        html: renderEmailLayout({
            preheader: `Your password reset code is ${otp}`,
            heading: "Reset your password",
            bodyHtml,
        }),
    };
};
