import nodemailer from 'nodemailer';

const allowMethods = ['POST'];

export default async function handler(req, res) {
  if (!allowMethods.includes(req.method)) {
    res.setHeader('Allow', allowMethods);
    return res.status(405).json({ message: 'Method not allowed.' });
  }

  const {
    name,
    email,
    subject,
    message,
    formType = 'contact',
    toolName = '',
    rating = '',
    pageUrl = '',
  } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ message: 'Please fill in all required fields.' });
  }

  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = Number(process.env.SMTP_PORT || 465);
  const smtpSecure = String(process.env.SMTP_SECURE || 'true').toLowerCase() === 'true';
  const smtpUser = process.env.SMTP_USER || 'pixelcodewizard@gmail.com';
  const smtpPass = process.env.SMTP_PASS;
  const mailFrom = process.env.MAIL_FROM || smtpUser;
  const recipientEmail = process.env.CONTACT_TO_EMAIL || 'wajidmarslan@gmail.com';

  if (!smtpPass) {
    return res.status(500).json({
      message:
        'Contact form is not configured yet. Add SMTP_PASS in the server environment to enable email sending.',
    });
  }

  const normalizedSubject =
    subject ||
    (formType === 'tool-feedback'
      ? `Tool Feedback: ${toolName || 'Tuitility Tool'}`
      : 'New contact message from Tuitility');

  const safeMessage = String(message).replace(/[<>]/g, '');
  const feedbackDetails =
    formType === 'tool-feedback'
      ? `\nTool: ${toolName || 'Tuitility Tool'}\nRating: ${rating || 'N/A'}\nPage: ${pageUrl || 'N/A'}\n`
      : '\n';

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: { user: smtpUser, pass: smtpPass },
    });

    await transporter.sendMail({
      from: `"Tuitility Forms" <${mailFrom}>`,
      replyTo: email,
      to: recipientEmail,
      subject: `[Tuitility] ${normalizedSubject}`,
      text: `Form Type: ${formType}\nName: ${name}\nEmail: ${email}\nSubject: ${normalizedSubject}${feedbackDetails}\n${safeMessage}`,
      html: `
        <h2>Tuitility Form Submission</h2>
        <p><strong>Form Type:</strong> ${formType}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${normalizedSubject}</p>
        ${
          formType === 'tool-feedback'
            ? `
        <p><strong>Tool:</strong> ${toolName || 'Tuitility Tool'}</p>
        <p><strong>Rating:</strong> ${rating || 'N/A'} / 5</p>
        <p><strong>Page URL:</strong> ${pageUrl || 'N/A'}</p>
        `
            : ''
        }
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br />')}</p>
      `,
    });

    return res.status(200).json({ message: 'Message sent successfully.' });
  } catch (error) {
    return res.status(500).json({
      message: 'Unable to send email right now.',
      error: error.message,
    });
  }
}
