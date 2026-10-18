import { MailjetEmailProvider } from "../../pkg/email/mailjet";
import { env } from "../config/env";

export const emailProvider = new MailjetEmailProvider({
    fromName: env.mailjet.fromName as string,
    fromEmail: env.mailjet.fromEmail as string,
    apiKey: env.mailjet.apiKey as string,
    apiSecret: env.mailjet.apiSecret as string
});