import nodemailer from 'nodemailer';
import emailjs from '@emailjs/nodejs';
import dotenv from 'dotenv';

dotenv.config();
const envData = dotenv.config();
console.log("DOTENV PARSE RESULT:", envData);

// Check if we're in production or local
const isProduction = process.env.NODE_ENV === 'production';

console.log(`🚀 EMAIL SERVICE MODE: ${isProduction ? 'EMAILJS (Production)' : 'NODEMAILER (Local)'}`);

class EmailService {
  constructor() {
    console.log("Checking Email Credentials...");

    if (isProduction) {
      // ✅ PRODUCTION: EmailJS
      console.log("Public Key:", process.env.EMAILJS_PUBLIC_KEY ? "Loaded ✅" : "Missing ❌");
      console.log("Private Key:", process.env.EMAILJS_PRIVATE_KEY ? "Loaded ✅" : "Missing ❌");
      console.log("Service ID:", process.env.EMAILJS_SERVICE_ID ? "Loaded ✅" : "Missing ❌");
      console.log("Template ID (Contact):", process.env.EMAILJS_TEMPLATE_ID_CONTACT ? "Loaded ✅" : "Missing ❌");
      console.log("Template ID (AutoReply):", process.env.EMAILJS_TEMPLATE_ID_AUTOREPLY ? "Loaded ✅" : "Missing ❌");

      // Initialize EmailJS
      emailjs.init({
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      });
    } else {
      // ✅ LOCAL: Nodemailer
      console.log("User:", process.env.GMAIL_USER ? "Loaded ✅" : "Missing ❌");
      console.log("Pass:", process.env.GMAIL_PASS ? "Loaded ✅" : "Missing ❌");

      this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        family: 4
      });
    }
  }

  async sendContactEmail(contactData) {
    if (isProduction) {
      return this.sendContactEmailEmailJS(contactData);
    } else {
      return this.sendContactEmailNodemailer(contactData);
    }
  }

  async sendAutoReply(toEmail, name) {
    if (isProduction) {
      return this.sendAutoReplyEmailJS(toEmail, name);
    } else {
      return this.sendAutoReplyNodemailer(toEmail, name);
    }
  }

  // ============================================
  // NODEMAILER METHODS (Local)
  // ============================================

  async sendContactEmailNodemailer(contactData) {
    try {
      const mailOptions = {
        from: `"${contactData.name} via Portfolio" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        replyTo: contactData.email,
        subject: contactData.title,
        html: this.generateEmailTemplate(contactData)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ [Nodemailer] Contact email sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ [Nodemailer] Contact email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendAutoReplyNodemailer(toEmail, name) {
    try {
      const mailOptions = {
        from: process.env.GMAIL_USER,
        to: toEmail,
        subject: 'Thank you for your message - Om Prakash',
        html: this.generateAutoReplyTemplate(name)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ [Nodemailer] Auto-reply sent:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ [Nodemailer] Auto-reply failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  generateEmailTemplate(contactData) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Form Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .field { margin-bottom: 15px; }
          .label { font-weight: bold; color: #374151; }
          .value { color: #6b7280; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Message</h1>
          </div>
          <div class="content">
            <div class="field">
              <div class="label">Name:</div>
              <div class="value">${contactData.name}</div>
            </div>
            <div class="field">
              <div class="label">Email:</div>
              <div class="value">${contactData.email}</div>
            </div>
            <div class="field">
              <div class="label">Message:</div>
              <div class="value">${contactData.message.replace(/\n/g, '<br>')}</div>
            </div>
            <div class="field">
              <div class="label">Submitted At:</div>
              <div class="value">${new Date().toLocaleString()}</div>
            </div>
            <div class="field">
              <div class="label">IP Address:</div>
              <div class="value">${contactData.ipAddress}</div>
            </div>
          </div>
          <div class="footer">
            <p>This message was sent from your portfolio contact form.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateAutoReplyTemplate(name) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Thank you for your message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 20px; }
          .footer { background: #e5e7eb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank you for your message!</h1>
          </div>
          <div class="content">
            <p>Dear ${name},</p>
            <p>Thank you for reaching out to me through my portfolio website. I have received your message and will get back to you as soon as possible.</p>
            <p>In the meantime, feel free to check out my latest projects and skills on my portfolio.</p>
            <p>Best regards,<br>Om Prakash Parida</p>
          </div>
          <div class="footer">
            <p>This is an automated response. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // ============================================
  // EMAILJS METHODS (Production)
  // ============================================

  async sendContactEmailEmailJS(contactData) {
    try {
      const response = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID_CONTACT,
        {
          to_email: process.env.GMAIL_USER,
          title: contactData.title,
          sender_name: contactData.name,
          sender_email: contactData.email,
          message: contactData.message,
          ip_address: contactData.ipAddress,
          submitted_at: new Date().toLocaleString(),
        }
      );

      console.log('✅ [EmailJS] Contact email sent:', response.status);
      return { success: true, messageId: response.status };
    } catch (error) {
      console.error('❌ [EmailJS] Contact email failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  async sendAutoReplyEmailJS(toEmail, name) {
    try {
      const response = await emailjs.send(
        process.env.EMAILJS_SERVICE_ID,
        process.env.EMAILJS_TEMPLATE_ID_AUTOREPLY,
        {
          to_email: toEmail,
          recipient_name: name,
        }
      );

      console.log('✅ [EmailJS] Auto-reply sent:', response.status);
      return { success: true, messageId: response.status };
    } catch (error) {
      console.error('❌ [EmailJS] Auto-reply failed:', error.message);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();