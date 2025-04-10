"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
// Configure nodemailer with test account or env variables
// For development/testing, we'll use Ethereal Email
const createTransporter = () => __awaiter(void 0, void 0, void 0, function* () {
    // For production, use your own SMTP settings
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            console.log('Using production email configuration');
            // Get port and secure settings
            const port = parseInt(process.env.EMAIL_PORT || '587');
            const secure = process.env.EMAIL_SECURE === 'true';
            console.log(`Email config: host=${process.env.EMAIL_HOST}, port=${port}, secure=${secure}`);
            // Create transport with SSL/TLS options
            return nodemailer_1.default.createTransport({
                host: process.env.EMAIL_HOST,
                port: port,
                secure: secure,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
                // Add this option to ignore SSL certificate errors for testing
                tls: {
                    rejectUnauthorized: process.env.NODE_ENV === 'production'
                }
            });
        }
        catch (error) {
            console.error('Failed to create email transport with production settings:', error);
            console.log('Falling back to Ethereal test account');
            // Fall through to Ethereal
        }
    }
    // For development, create a test account using Ethereal
    try {
        console.log('Attempting to create Ethereal test email account');
        const testAccount = yield nodemailer_1.default.createTestAccount();
        console.log('Ethereal account created successfully');
        return nodemailer_1.default.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
    catch (error) {
        console.error('Failed to create Ethereal test account:', error);
        console.log('Falling back to mock email implementation');
        // Fallback to a mock implementation if Ethereal fails
        return createMockTransporter();
    }
});
// Create a mock transporter that saves emails to files
const createMockTransporter = () => {
    return {
        sendMail: (mailOptions) => __awaiter(void 0, void 0, void 0, function* () {
            const mockFilePath = path_1.default.join(process.cwd(), 'mock-emails');
            // Create directory if it doesn't exist
            if (!fs_1.default.existsSync(mockFilePath)) {
                fs_1.default.mkdirSync(mockFilePath, { recursive: true });
            }
            // Generate a unique ID for this email
            const emailId = Date.now().toString();
            const filePath = path_1.default.join(mockFilePath, `email-${emailId}.html`);
            // Create email content
            const emailContent = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .email-container { border: 1px solid #ddd; padding: 20px; border-radius: 5px; }
              .header { border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 20px; }
              .footer { border-top: 1px solid #eee; padding-top: 10px; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="header">
                <strong>From:</strong> ${mailOptions.from}<br>
                <strong>To:</strong> ${mailOptions.to}<br>
                <strong>Subject:</strong> ${mailOptions.subject}
              </div>
              
              <div class="body">
                ${mailOptions.html || `<pre>${mailOptions.text}</pre>` || '(No content)'}
              </div>
              
              <div class="footer">
                This is a mock email created by Test Genie application.<br>
                Generated at: ${new Date().toISOString()}
              </div>
            </div>
          </body>
        </html>
      `;
            // Write email to file
            fs_1.default.writeFileSync(filePath, emailContent);
            console.log(`Mock email saved to: ${filePath}`);
            // Return mock info
            return {
                messageId: `mock-${emailId}@testgenie.com`,
                testMessageUrl: `file://${filePath}`
            };
        })
    };
};
// Email sending function
const sendEmail = (options) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const transporter = yield createTransporter();
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Test Genie <noreply@testgenie.com>',
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };
        console.log(`Sending email to: ${options.to}, subject: ${options.subject}`);
        const info = yield transporter.sendMail(mailOptions);
        // For Ethereal emails, return the URL to view the test email
        if (info.messageId && info.testMessageUrl) {
            console.log('Email sent successfully, preview URL:', info.testMessageUrl);
            return info.testMessageUrl;
        }
        console.log('Email sent successfully:', info.messageId);
        return info;
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
});
exports.sendEmail = sendEmail;
