// @ts-ignore
import { NextRequest, NextResponse, waitUntil } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      subject,
      message,
      formType = 'contact',
      toolName = '',
      rating = '',
      pageUrl = '',
    } = body || {};

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
    }

    const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpSecure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
    const smtpUser = process.env.SMTP_USER || 'pixelcodewizard@gmail.com';
    const smtpPass = process.env.SMTP_PASS;
    const mailFrom = process.env.MAIL_FROM || smtpUser;
    const recipientEmail = process.env.CONTACT_TO_EMAIL || 'wajidmarslan@gmail.com';

    if (!smtpPass) {
      return NextResponse.json({
        error: 'Contact form is not configured yet. Add SMTP_PASS in the server environment to enable email sending.',
      }, { status: 500 });
    }

    const normalizedSubject =
      subject ||
      (formType === 'tool-feedback'
        ? `Tool Feedback: ${toolName || 'Tuitility Tool'}`
        : 'New contact message from Tuitility');

    const safeMessage = String(message).replace(/[<>]/g, '');
    const feedbackDetails =
      formType === 'tool-feedback' || toolName
        ? `\nTool: ${toolName || 'Tuitility Tool'}\nRating: ${rating || 'N/A'}\nPage: ${pageUrl || 'N/A'}\n`
        : '\n';

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    const mailPromise = transporter.sendMail({
      from: `"Tuitility" <${mailFrom}>`,
      replyTo: email,
      to: recipientEmail,
      subject: `[Tuitility] ${normalizedSubject}`,
      text: `Form Type: ${formType}\nName: ${name}\nEmail: ${email}\nSubject: ${normalizedSubject}${feedbackDetails}\n${safeMessage}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 32px 16px; margin: 0; min-height: 100%;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0;">
            <!-- Header -->
            <div style="border: 1px solid  #1a1a1a; padding: 24px; text-align: center;">
              <a href="https://tuitility.vercel.app" target="_blank" style="text-decoration: none; display: inline-block;">
                <img src="https://tuitility.vercel.app/images/logo.png" alt="Tuitility" style="height: 36px; display: block; margin: 0 auto; filter: brightness(0) invert(1);" />
              </a>
            </div>
            
            <!-- Body -->
            <div style="padding: 32px 24px;">
              <div style="margin-bottom: 24px;">
                <span style="display: inline-block; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 9999px; padding: 4px 12px; font-size: 11px; font-weight: bold; color: #334155; text-transform: uppercase; letter-spacing: 0.05em;">
                  ${formType.replace('-', ' ')}
                </span>
              </div>
              
              <h2 style="font-size: 20px; font-weight: 800; color: #1a1a1a; margin-top: 0; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9; padding-bottom: 12px; letter-spacing: -0.02em;">
                New Form Submission
              </h2>
              
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; width: 100px; vertical-align: top;">Name:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; vertical-align: top;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; vertical-align: top;">Email:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; vertical-align: top;">
                    <a href="mailto:${email}" style="color: #1a1a1a; text-decoration: underline;">${email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; vertical-align: top;">Subject:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; vertical-align: top;">${normalizedSubject}</td>
                </tr>
                ${
                  formType === 'tool-feedback' || toolName
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; vertical-align: top;">Tool:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; vertical-align: top;">${toolName || 'Tuitility Tool'}</td>
                </tr>
                ${
                  rating
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; vertical-align: top;">Rating:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; vertical-align: top;">${rating} / 5 ⭐</td>
                </tr>
                `
                    : ''
                }
                ${
                  pageUrl
                    ? `
                <tr>
                  <td style="padding: 8px 0; font-size: 13px; font-weight: bold; color: #64748b; vertical-align: top;">Page URL:</td>
                  <td style="padding: 8px 0; font-size: 14px; font-weight: 600; color: #1a1a1a; vertical-align: top;">
                    <a href="${pageUrl}" target="_blank" style="color: #64748b; text-decoration: underline; font-size: 12px;">${pageUrl}</a>
                  </td>
                </tr>
                `
                    : ''
                }
                `
                    : ''
                }
              </table>
              
              <div style="background-color: #f8fafc; border-left: 4px solid #1a1a1a; border-radius: 8px; padding: 16px; margin-top: 24px;">
                <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 12px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">Message</h3>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-wrap;">${safeMessage}</p>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #f1f5f9; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #64748b; font-weight: 500;">
                This is an automated message sent from the <a href="https://tuitility.vercel.app" target="_blank" style="color: #475569; font-weight: bold; text-decoration: none;">Tuitility</a> contact form handler.
              </p>
              <p style="margin: 4px 0 0 0; font-size: 10px; color: #94a3b8;">
                © 2026 Tuitility. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `,
    }).then((info) => {
      console.log('Email sent successfully in background:', info.messageId);
    }).catch((err) => {
      console.error('Email background error:', err);
    });

    // Signal the server environment to keep executing the promise in the background
    if (typeof waitUntil === 'function') {
      waitUntil(mailPromise);
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unable to send email right now.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
