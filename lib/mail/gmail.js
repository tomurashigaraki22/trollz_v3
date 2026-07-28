import "server-only";
import nodemailer from "nodemailer";

export const GMAIL_FROM = "trollz.mallstore@gmail.com";

function getTransporter() {
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!pass) {
    throw new Error("GMAIL_APP_PASSWORD is not configured.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_FROM,
      pass,
    },
  });
}

export async function sendGmail({ to, subject, html, text }) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: `"TrollzStore" <${GMAIL_FROM}>`,
    to,
    subject,
    html,
    text,
  });
}
