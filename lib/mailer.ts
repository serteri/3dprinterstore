import "server-only";

import { EmailParams, MailerSend, Recipient, Sender } from "mailersend";

type SendTransactionalEmailInput = {
  toEmail: string;
  toName: string;
  subject: string;
  html: string;
  text: string;
  tag: "order-success" | "order-shipped" | "custom-inquiry";
};

type SendTransactionalEmailOptions = {
  throwOnError?: boolean;
};

const APP_FROM_EMAIL = "info@peradynamics.com";
const APP_FROM_NAME = "Pera Dynamics";

export async function sendTransactionalEmail(
  input: SendTransactionalEmailInput,
  options: SendTransactionalEmailOptions = {},
) {
  const { throwOnError = true } = options;

  if (process.env.NODE_ENV === "development") {
    console.log("[MAIL_PREVIEW_DEVELOPMENT]", {
      tag: input.tag,
      from: APP_FROM_EMAIL,
      to: input.toEmail,
      subject: input.subject,
      bodyHtml: input.html,
      bodyText: input.text,
    });
    return;
  }

  const mailerSendApiKey = process.env.MAILSENDER_API_KEY;
  if (!mailerSendApiKey) {
    throw new Error("MAILSENDER_API_KEY is missing.");
  }

  const mailerSend = new MailerSend({ apiKey: mailerSendApiKey });
  const sentFrom = new Sender(APP_FROM_EMAIL, APP_FROM_NAME);
  const recipients = [new Recipient(input.toEmail, input.toName)];

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject(input.subject)
    .setHtml(input.html)
    .setText(input.text);

  try {
    await mailerSend.email.send(emailParams);
  } catch (error) {
    // Keep the full provider payload in logs for debugging approval and domain issues.
    console.error("[MAILERSEND_SEND_ERROR]", {
      tag: input.tag,
      from: APP_FROM_EMAIL,
      to: input.toEmail,
      subject: input.subject,
      error,
    });

    if (throwOnError) {
      throw error;
    }
  }
}
