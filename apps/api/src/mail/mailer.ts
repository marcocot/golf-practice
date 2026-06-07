import { createTransport, type Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

let transporter: Transporter | undefined;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = createTransport({
      host: process.env.MAIL_HOST ?? 'localhost',
      port: Number(process.env.MAIL_PORT ?? 1025),
      secure: false,
    });
  }
  return transporter;
}

export async function sendMail(message: MailMessage): Promise<void> {
  await getTransporter().sendMail({
    from: process.env.MAIL_FROM ?? 'Golf Practice <no-reply@golf.local>',
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
