const nodemailer = require('nodemailer');

// Create email transporter
let transporter = null;
let emailMethod = 'none';

function initializeTransporter() {
  // Method 1: Gmail with App Password (recommended for Google Cloud)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Initializing Gmail transporter with App Password...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS // Gmail App Password
      }
    });
    emailMethod = 'gmail-app-password';
    return transporter;
  }

  // Method 2: Gmail OAuth2 (for Google Cloud with service accounts)
  if (process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET && process.env.GMAIL_REFRESH_TOKEN) {
    console.log('Initializing Gmail transporter with OAuth2...');
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN
      }
    });
    emailMethod = 'gmail-oauth2';
    return transporter;
  }

  // Method 3: SendGrid (popular on Google Cloud)
  if (process.env.SENDGRID_API_KEY) {
    console.log('Initializing SendGrid transporter...');
    transporter = nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    });
    emailMethod = 'sendgrid';
    return transporter;
  }

  // Method 4: Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    console.log('Initializing custom SMTP transporter...');
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    emailMethod = 'custom-smtp';
    return transporter;
  }

  console.log('⚠️  No email credentials configured. Will use test account for development.');
  emailMethod = 'none';
  return null;
}

// Initialize on load
initializeTransporter();
console.log(`📧 Email service initialized using: ${emailMethod}`);

/**
 * Send email to candidate
 */
async function sendEmail(to, subject, body, fromName = 'XYZ Pvt. Limited') {
  // If no transporter, create test account
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
  }

  const mailOptions = {
    from: `"${fromName}" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
    to,
    subject,
    text: body,
    html: body.replace(/\n/g, '<br>')
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If using test account, return preview URL
  if (info.messageId.includes('ethereal')) {
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  }

  return {
    success: true,
    messageId: info.messageId
  };
}

/**
 * Send bulk emails
 */
async function sendBulkEmails(recipients, subject, template) {
  const results = [];
  
  for (const recipient of recipients) {
    try {
      const personalizedBody = template.replace(/{{name}}/g, recipient.name);
      const result = await sendEmail(recipient.email, subject, personalizedBody);
      results.push({
        email: recipient.email,
        success: true,
        messageId: result.messageId,
        previewUrl: result.previewUrl
      });
    } catch (error) {
      results.push({
        email: recipient.email,
        success: false,
        error: error.message
      });
    }
  }

  return results;
}

module.exports = {
  sendEmail,
  sendBulkEmails,
  isConfigured: () => transporter !== null
};
