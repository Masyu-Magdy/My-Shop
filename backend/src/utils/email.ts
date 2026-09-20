import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailOptions): Promise<void> => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn(`✉️  EMAIL_USER/EMAIL_PASSWORD not set - skipping email to ${to}: "${subject}"`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

const shell = (title: string, bodyHtml: string) => `
  <div style="background:#f4f5f7;padding:32px 16px;font-family:'Segoe UI',Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
      <div style="background:#111827;padding:24px 32px;">
        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:0.5px;">MyShop</span>
      </div>
      <div style="padding:32px;color:#111827;">
        <h2 style="margin:0 0 16px;font-size:20px;">${title}</h2>
        ${bodyHtml}
      </div>
      <div style="padding:16px 32px;background:#f9fafb;color:#9ca3af;font-size:12px;">
        This is an automated message, please do not reply directly to this email.
      </div>
    </div>
  </div>
`;

const button = (url: string, label: string) => `
  <a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 28px;background:#111827;color:#ffffff;
    text-decoration:none;border-radius:8px;font-weight:600;font-size:14px;">${label}</a>
`;

export const emailTemplates = {
  welcome: (name: string) =>
    shell(
      `Welcome, ${name}! 👋`,
      `<p style="color:#4b5563;line-height:1.6;">Thanks for creating an account with us. We're excited to have you on board -
       browse our latest products and enjoy a smooth, secure shopping experience.</p>`
    ),

  verifyEmail: (name: string, verifyUrl: string) =>
    shell(
      `Confirm your email address`,
      `<p style="color:#4b5563;line-height:1.6;">Hi ${name}, please confirm this is your email address to activate your account.
       This link expires in 24 hours.</p>
       ${button(verifyUrl, "Verify my email")}
       <p style="color:#9ca3af;font-size:12px;margin-top:20px;">If the button doesn't work, copy this link into your browser:<br/>${verifyUrl}</p>`
    ),

  resetPassword: (name: string, resetUrl: string) =>
    shell(
      `Reset your password`,
      `<p style="color:#4b5563;line-height:1.6;">Hi ${name}, we received a request to reset your password. This link is valid for 1 hour.
       If you didn't request this, you can safely ignore this email.</p>
       ${button(resetUrl, "Reset my password")}
       <p style="color:#9ca3af;font-size:12px;margin-top:20px;">If the button doesn't work, copy this link into your browser:<br/>${resetUrl}</p>`
    ),

  orderConfirmation: (name: string, orderId: string, total: number, itemsCount: number) =>
    shell(
      `Order confirmed 🎉`,
      `<p style="color:#4b5563;line-height:1.6;">Hi ${name}, thanks for your order! We've received it and it's now being processed.</p>
       <table style="width:100%;margin-top:16px;border-collapse:collapse;">
         <tr><td style="padding:8px 0;color:#6b7280;">Order ID</td><td style="padding:8px 0;text-align:right;font-weight:600;">#${orderId}</td></tr>
         <tr><td style="padding:8px 0;color:#6b7280;">Items</td><td style="padding:8px 0;text-align:right;font-weight:600;">${itemsCount}</td></tr>
         <tr><td style="padding:8px 0;color:#6b7280;">Total</td><td style="padding:8px 0;text-align:right;font-weight:600;">$${total.toFixed(2)}</td></tr>
       </table>`
    ),
};
