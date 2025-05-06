import nodemailer from "nodemailer";
import { APP_PASSWORD, EMAIL_SENDER } from "../configs/env.config";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_SENDER,
    pass: APP_PASSWORD,
  },
});

type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export const sendEmail = async ({
  to,
  subject,
  html,
  text,
}: SendEmailParams) => {
  return await transporter.sendMail({
    from: `"Momo E-Commerce" <${EMAIL_SENDER}>`,
    to,
    subject,
    html,
    text,
    replyTo: EMAIL_SENDER,
  });
};

// email templates
export const getVerifyEmailTemplate = (url: string) => ({
  subject: "Verify Your Email Address",
  text: `Thank you for registering with Momo E-Commerce.\n\nPlease verify your email address by clicking the following link:\n\n${url}\n\nIf you did not sign up for this account, you can ignore this email.`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color:#53c2e7;">Welcome to Momo E-Commerce</h2>
      <p>Thank you for signing up. Please verify your email address to continue:</p>
      <p>
        <a href="${url}" style="background-color: #2e6c80; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
      </p>
      <p>If the button doesn't work, copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;">${url}</p>
      <hr style="margin: 30px 0;" />
      <small>If you didn’t create this account, you can safely ignore this email.</small>
    </div>
  `,
});

export const getPasswordResetTemplate = (url: string) => ({
  subject: "Reset Your Momo E-Commerce Password",
  text: `We received a request to reset your password.\n\nYou can reset your password by clicking the link below:\n\n${url}\n\nIf you did not request this, you can ignore this email.`,
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
      <h2 style="color: #53c2e7;">Reset Your Password</h2>
      <p>We received a request to reset your Momo E-Commerce account password.</p>
      <p>
        <a href="${url}" style="background-color: #d9534f; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      </p>
      <p>If the button doesn't work, copy and paste the link below into your browser:</p>
      <p style="word-break: break-all;">${url}</p>
      <hr style="margin: 30px 0;" />
      <small>If you did not request a password reset, no further action is needed.</small>
    </div>
  `,
});
