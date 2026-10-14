import Mailjet from "node-mailjet";
import { IEmailProvider } from "./email.interface";
import { injectable } from "tsyringe";

export interface MailjetEmailProviderConfig {
    fromName: string;
    fromEmail: string;
    apiKey: string;
    apiSecret: string;
}

@injectable()
export class MailjetEmailProvider implements IEmailProvider {
    constructor(private config: MailjetEmailProviderConfig) { }

    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        const client = new Mailjet({
            apiKey: this.config.apiKey,
            apiSecret: this.config.apiSecret
        });

        await client
            .post("send", { version: "v3.1" })
            .request({
                Messages: [
                    {
                        From: {
                            Email: this.config.fromEmail,
                            Name: this.config.fromName,
                        },
                        To: [{ Email: to }],
                        Subject: subject,
                        HTMLPart: body,
                    },
                ],
            });
    }
}