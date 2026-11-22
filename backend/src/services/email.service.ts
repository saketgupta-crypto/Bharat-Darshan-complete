// import nodemailer from 'nodemailer';

// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
//   port: Number(process.env.SMTP_PORT) || 2525,
//   auth: {
//     user: process.env.SMTP_USER || '',
//     pass: process.env.SMTP_PASS || '',
//   },
// });

// export const sendVerificationEmail = async (toEmail: string, verificationToken: string, name: string) => {
//   const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
//   const verifyLink = `${frontendUrl}/verify-email?token=${verificationToken}`;

//   const htmlContent = `
//     <div style="font-family: 'Plus Jakarta Sans', Arial, sans-serif; background-color: #FAF8F5; padding: 40px; color: #1E293B;">
//       <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E2E8F0;">
//         <div style="background: linear-gradient(135deg, #D97706, #EA580C); padding: 30px; text-align: center; color: #ffffff;">
//           <h1 style="margin: 0; font-size: 24px; font-family: Georgia, serif;">Bharat Darshan</h1>
//           <p style="margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Soul of India</p>
//         </div>
//         <div style="padding: 40px 30px;">
//           <h2 style="margin-top: 0; color: #0F172A; font-size: 20px;">Namaste ${name},</h2>
//           <p style="line-height: 1.6; color: #475569; font-size: 15px;">
//             Thank you for registering with Bharat Darshan! Please verify your email address to unlock AI trip planning, heritage stays, and verified local guides.
//           </p>
//           <div style="text-align: center; margin: 35px 0;">
//             <a href="${verifyLink}" style="background-color: #EA580C; color: #ffffff; padding: 14px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(234,88,12,0.3);">
//               Verify Email Address
//             </a>
//           </div>
//           <p style="font-size: 13px; color: #94A3B8; line-height: 1.5; word-break: break-all;">
//             If the button doesn't work, copy and paste this link into your browser:<br/>
//             <a href="${verifyLink}" style="color: #D97706;">${verifyLink}</a>
//           </p>
//         </div>
//         <div style="background: #F8FAFC; padding: 20px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #E2E8F0;">
//           &copy; ${new Date().getFullYear()} Bharat Darshan. All rights reserved.
//         </div>
//       </div>
//     </div>
//   `;

//   await transporter.sendMail({
//     from: process.env.SMTP_FROM || '"Bharat Darshan" <no-reply@bharatdarshan.com>',
//     to: toEmail,
//     subject: 'Verify your Bharat Darshan account',
//     html: htmlContent,
//   });
// };

// // ---- Functions used by auth.service.ts and contact.controller.ts (SMTP via the transporter above) ----
// const escapeHtml = (s: string) =>
//   s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

// const wrap = (title: string, body: string) =>
//   `<div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px"><h2 style="color:#c2410c">Bharat Darshan</h2><h3>${title}</h3>${body}</div>`;

// /** Sends via SMTP. In dev without SMTP credentials it logs instead of failing, so local flows keep working. */
// export async function sendEmail(to: string, subject: string, html: string) {
//   if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
//     if (process.env.NODE_ENV === "production") throw new Error("Email provider not configured");
//     if (process.env.NODE_ENV !== "test") console.warn(`[email:dev] to=${to} subject="${subject}"\n${html.replace(/<[^>]+>/g, " ")}`);
//     return;
//   }
//   await transporter.sendMail({
//     from: process.env.SMTP_FROM || '"Bharat Darshan" <no-reply@bharatdarshan.com>',
//     to, subject, html,
//   });
// }

// export const sendOtpEmail = (to: string, name: string, otp: string) =>
//   sendEmail(to, "Verify your email", wrap("Verify your email", `<p>Hi ${escapeHtml(name)},</p><p>Your verification code is:</p><p style="font-size:28px;letter-spacing:6px"><b>${otp}</b></p><p>It expires in 10 minutes.</p>`));

// export const sendResetEmail = (to: string, name: string, link: string) =>
//   sendEmail(to, "Reset your password", wrap("Reset your password", `<p>Hi ${escapeHtml(name)},</p><p><a href="${link}">Click here to reset your password</a>. This link expires in 30 minutes.</p><p>If you did not request this, ignore this email.</p>`));

// export const sendContactConfirmation = (to: string, name: string) =>
//   sendEmail(to, "We received your message", wrap("Thanks for reaching out", `<p>Hi ${escapeHtml(name)}, we have received your message and will reply soon.</p>`));

import nodemailer from 'nodemailer';

// ==========================================
// BREVO SMTP CONFIGURATION
// ==========================================

const SMTP_HOST =
  process.env.SMTP_HOST || 'smtp-relay.brevo.com';

const SMTP_PORT =
  Number(process.env.SMTP_PORT) || 2525;

const SMTP_USER =
  process.env.SMTP_USER || '';

const SMTP_PASS =
  process.env.SMTP_PASS || '';

const SMTP_FROM =
  process.env.SMTP_FROM ||
  `"Bharat Darshan" <${process.env.SMTP_FROM_EMAIL || 'no-reply@example.com'}>`;

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,

  // Port 2525 uses STARTTLS
  secure: process.env.SMTP_SECURE === 'true',

  // Require STARTTLS for Brevo
  requireTLS: SMTP_HOST === 'smtp-relay.brevo.com',

  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },

  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

// ==========================================
// HTML HELPERS
// ==========================================

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[c]!
  );

const wrap = (title: string, body: string) => `
<div style="
  font-family: Arial, sans-serif;
  background-color: #FAF8F5;
  padding: 30px;
  color: #1E293B;
">

  <div style="
    max-width: 560px;
    margin: auto;
    background: white;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid #E2E8F0;
  ">

    <div style="
      background: linear-gradient(135deg, #D97706, #EA580C);
      padding: 25px;
      text-align: center;
      color: white;
    ">
      <h1 style="font-family: Georgia, serif;">
        Bharat Darshan
      </h1>

      <p style="letter-spacing: 2px;">
        SOUL OF INDIA
      </p>
    </div>

    <div style="padding: 30px;">
      <h2>${title}</h2>
      ${body}
    </div>

    <div style="
      background: #F8FAFC;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #94A3B8;
    ">
      © ${new Date().getFullYear()} Bharat Darshan
    </div>

  </div>
</div>
`;

// ==========================================
// COMMON EMAIL SENDER
// ==========================================

export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  if (!SMTP_USER || !SMTP_PASS || !process.env.SMTP_FROM_EMAIL) {

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Brevo SMTP is not configured');
    }

    if (process.env.NODE_ENV !== 'test') {
      console.warn(
        `[email:dev] to=${to} subject="${subject}"`
      );
    }

    return;
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', info.messageId);

    return info;

  } catch (error) {
    console.error('Brevo SMTP Error:', error);

    throw new Error('Unable to send email. Please try again later.');
  }
}

// ==========================================
// EMAIL VERIFICATION
// ==========================================

export const sendVerificationEmail = async (
  toEmail: string,
  verificationToken: string,
  name: string
) => {

  const frontendUrl =
    process.env.FRONTEND_URL || 'http://localhost:5173';

  const verifyLink =
    `${frontendUrl}/verify-email?token=${encodeURIComponent(verificationToken)}`;

  const htmlContent = wrap(
    'Verify Your Email Address',

    `
    <h2>Namaste ${escapeHtml(name)},</h2>

    <p>
      Thank you for registering with Bharat Darshan!
      Please verify your email address to unlock AI trip planning,
      heritage stays and local guides.
    </p>

    <div style="text-align:center;margin:30px 0;">

      <a href="${escapeHtml(verifyLink)}"
      style="
        background:#EA580C;
        color:white;
        padding:14px 30px;
        border-radius:10px;
        text-decoration:none;
        font-weight:bold;
      ">
        Verify Email Address
      </a>

    </div>

    <p style="font-size:13px;color:#64748B;">
      If the button doesn't work, copy this link:
    </p>

    <a href="${escapeHtml(verifyLink)}">
      ${escapeHtml(verifyLink)}
    </a>
    `
  );

  return sendEmail(
    toEmail,
    'Verify your Bharat Darshan account',
    htmlContent
  );
};

// ==========================================
// OTP EMAIL
// ==========================================

export const sendOtpEmail = (
  to: string,
  name: string,
  otp: string
) => {

  const html = wrap(
    'Verify Your Email',

    `
    <p>Namaste ${escapeHtml(name)},</p>

    <p>Your verification code is:</p>

    <h1 style="
      color:#EA580C;
      letter-spacing:8px;
      text-align:center;
    ">
      ${escapeHtml(otp)}
    </h1>

    <p>This OTP expires in 10 minutes.</p>

    <p>If you did not request this, ignore this email.</p>
    `
  );

  return sendEmail(
    to,
    'Bharat Darshan - Email Verification OTP',
    html
  );
};

// ==========================================
// PASSWORD RESET EMAIL
// ==========================================

export const sendResetEmail = (
  to: string,
  name: string,
  link: string
) => {

  const safeLink = escapeHtml(link);

  const html = wrap(
    'Reset Your Password',

    `
    <p>Namaste ${escapeHtml(name)},</p>

    <p>
      We received a request to reset your password.
    </p>

    <div style="text-align:center;margin:30px 0;">

      <a href="${safeLink}"
      style="
        background:#EA580C;
        color:white;
        padding:14px 25px;
        text-decoration:none;
        border-radius:8px;
        font-weight:bold;
      ">
        Reset Password
      </a>

    </div>

    <p>This link expires in 30 minutes.</p>

    <p>If you did not request this, ignore this email.</p>
    `
  );

  return sendEmail(
    to,
    'Bharat Darshan - Password Reset',
    html
  );
};

// ==========================================
// CONTACT CONFIRMATION
// ==========================================

export const sendContactConfirmation = (
  to: string,
  name: string
) => {

  const html = wrap(
    'Thank You for Contacting Us',

    `
    <p>Namaste ${escapeHtml(name)},</p>

    <p>
      We have successfully received your enquiry.
    </p>

    <p>
      Our Bharat Darshan team will get back to you soon.
    </p>
    `
  );

  return sendEmail(
    to,
    'Bharat Darshan - Enquiry Received',
    html
  );
};

// ==========================================
// SMTP CONNECTION VERIFICATION
// ==========================================

export const verifyEmailTransport = async () => {
  if (!SMTP_USER || !SMTP_PASS) {
    throw new Error('SMTP credentials are missing');
  }

  return transporter.verify();
};