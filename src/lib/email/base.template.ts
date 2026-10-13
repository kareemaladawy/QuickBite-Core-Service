export interface EmailLayoutOptions {
    preheader: string;
    heading: string;
    bodyHtml: string;
}

const BRAND_NAME = "QuickBite";
const BRAND_COLOR = "#FF5A1F";
const TEXT_COLOR = "#1F2328";
const MUTED_COLOR = "#6B7280";
const BORDER_COLOR = "#EDEDED";
const BG_COLOR = "#F5F5F5";

export const renderEmailLayout = ({ preheader, heading, bodyHtml }: EmailLayoutOptions): string => `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${BRAND_NAME}</title>
</head>
<body style="margin:0; padding:0; background-color:${BG_COLOR}; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<span style="display:none; max-height:0; overflow:hidden; opacity:0;">${preheader}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG_COLOR}; padding:32px 16px;">
<tr>
<td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#ffffff; border-radius:12px; overflow:hidden; border:1px solid ${BORDER_COLOR};">
<tr>
<td style="padding:28px 32px; border-bottom:1px solid ${BORDER_COLOR};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr>
<td style="font-size:20px; font-weight:700; color:${BRAND_COLOR}; letter-spacing:-0.3px;">${BRAND_NAME}</td>
</tr>
</table>
</td>
</tr>
<tr>
<td style="padding:32px;">
<h1 style="margin:0 0 16px; font-size:20px; line-height:1.4; color:${TEXT_COLOR};">${heading}</h1>
${bodyHtml}
</td>
</tr>
<tr>
<td style="padding:20px 32px; background-color:${BG_COLOR}; border-top:1px solid ${BORDER_COLOR};">
<p style="margin:0; font-size:12px; line-height:1.6; color:${MUTED_COLOR};">
This is an automated message from ${BRAND_NAME}. If you didn't expect this email, you can safely ignore it.
</p>
</td>
</tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
<tr>
<td style="padding:16px 32px; text-align:center; font-size:12px; color:${MUTED_COLOR};">
&copy; ${new Date().getFullYear()} ${BRAND_NAME}. All rights reserved.
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>
`;

export const renderOtpBlock = (otp: string): string => `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
<tr>
<td align="center" style="background-color:${BG_COLOR}; border-radius:10px; padding:20px;">
<span style="display:inline-block; font-size:32px; font-weight:700; letter-spacing:8px; color:${TEXT_COLOR};">${otp}</span>
</td>
</tr>
</table>
`;

export const emailTheme = {
    BRAND_NAME,
    BRAND_COLOR,
    TEXT_COLOR,
    MUTED_COLOR,
    BORDER_COLOR,
    BG_COLOR,
};
