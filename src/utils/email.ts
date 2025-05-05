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
  subject: "Verify Email Address",
  text: `Click on the link to verify your email address: ${url}`,
  html: `<!doctype html><html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <title>Verify Email Address</title>
    <meta name="description" content="Verify your email.">
    <style type="text/css">a:hover{text-decoration:underline!important}</style>
  </head>
  <body style="margin:0; background-color:#f2f3f8;">
    <table width="100%" bgcolor="#f2f3f8" style="font-family: 'Open Sans', sans-serif;">
      <tr><td>
        <table style="max-width:670px; margin:0 auto; background:#fff; border-radius:3px; text-align:center; box-shadow:0 6px 18px rgba(0,0,0,.06);" width="100%">
          <tr><td style="height:40px;">&nbsp;</td></tr>
          <tr><td style="padding:0 35px;">
            <h1 style="color:#1e1e2d; font-weight:500; font-size:32px;">Please verify your email address</h1>
            <span style="display:inline-block; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
            <p style="color:#455056; font-size:15px;">Click the link below to verify your email.</p>
            <a href="${url}" target="_blank" style="background:#2f89ff; color:#fff; padding:10px 24px; border-radius:50px; text-transform:uppercase; text-decoration:none;">Verify Email Address</a>
          </td></tr>
          <tr><td style="height:40px;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="max-width:670px; margin:20px auto; text-align:center;">
          <tr>
            <td style="font-size:14px; color:#455056;">
              &copy; Momo E-Commerce
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body></html>`,
});

export const getPasswordResetTemplate = (url: string) => ({
  subject: "Password Reset Request",
  text: `You requested a password reset. Click on the link to reset your password: ${url}`,
  html: `<!doctype html><html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type"/>
    <title>Password Reset</title>
    <meta name="description" content="Reset your password.">
    <style type="text/css">a:hover{text-decoration:underline!important}</style>
  </head>
  <body style="margin:0; background-color:#f2f3f8;">
    <table width="100%" bgcolor="#f2f3f8" style="font-family: 'Open Sans', sans-serif;">
      <tr><td>
        <table style="max-width:670px; margin:0 auto; background:#fff; border-radius:3px; text-align:center; box-shadow:0 6px 18px rgba(0,0,0,.06);" width="100%">
          <tr><td style="height:40px;">&nbsp;</td></tr>
          <tr><td style="padding:0 35px;">
            <h1 style="color:#1e1e2d; font-weight:500; font-size:32px;">You requested to reset your password</h1>
            <span style="display:inline-block; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
            <p style="color:#455056; font-size:15px;">Click the link below to reset your password.</p>
            <a href="${url}" target="_blank" style="background:#2f89ff; color:#fff; padding:10px 24px; border-radius:50px; text-transform:uppercase; text-decoration:none;">Reset Password</a>
          </td></tr>
          <tr><td style="height:40px;">&nbsp;</td></tr>
        </table>
        <table width="100%" style="max-width:670px; margin:20px auto; text-align:center;">
          <tr>
            <td style="font-size:14px; color:#455056;">
              &copy; Momo E-Commerce
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body></html>`,
});
