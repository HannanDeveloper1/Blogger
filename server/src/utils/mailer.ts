import nodemailer, { SendMailOptions } from "nodemailer";
import env from "../config/env";

export const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure: Number(env.SMTP_PORT) === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

// verify connection at startup
transporter
  .verify()
  .then(() => {
    console.log("✅ Mailer connected");
  })
  .catch((err: unknown) => {
    if (err instanceof Error) {
      console.error("❌ Mailer failed to connect", err.message);
    }
  });

// Send an email
export async function sendMail(opts: SendMailOptions) {
  const info = await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
  return info;
}
