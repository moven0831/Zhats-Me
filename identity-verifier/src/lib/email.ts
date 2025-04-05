import nodemailer from 'nodemailer';
import { nanoid } from 'nanoid';
import { kv } from '@vercel/kv';

// Email configuration
const createTransporter = () => {
  try {
    // Validate required email configuration
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    
    if (!emailUser || !emailPassword) {
      throw new Error('EMAIL_USER and EMAIL_PASSWORD environment variables must be set');
    }
    
    if (emailPassword === 'your-16-character-app-password') {
      throw new Error('Please replace the placeholder email password with your actual Gmail App Password');
    }
    
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPassword,
      },
    });
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
};

// Lazily initialize the transporter when needed
let transporter: nodemailer.Transporter | null = null;

// Get the transporter, creating it if needed
const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

// Verify email configuration is working
export async function verifyEmailConfig(): Promise<{ success: boolean; message: string }> {
  try {
    const transport = getTransporter();
    
    if (!transport) {
      return { 
        success: false, 
        message: 'Email configuration is invalid. Check your environment variables.' 
      };
    }
    
    await transport.verify();
    
    return { 
      success: true, 
      message: 'Email configuration is valid' 
    };
  } catch (error) {
    console.error('Email configuration verification failed:', error);
    
    // Format the error message in a more user-friendly way
    let errorMessage = 'Email configuration failed';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
        errorMessage = 'Email authentication failed. If using Gmail, make sure you\'re using an App Password, not your regular password.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
}

// Create and store a verification token
export async function createVerificationToken(email: string): Promise<string> {
  const token = nanoid(32);
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
  
  await kv.set(`email:${token}`, {
    email,
    expiresAt
  });
  
  return token;
}

// Verify a token and get the associated email
export async function verifyToken(token: string): Promise<string | null> {
  const data = await kv.get(`email:${token}`) as { email: string, expiresAt: number } | null;
  
  if (!data) {
    return null;
  }
  
  if (data.expiresAt < Date.now()) {
    // Token expired, clean it up
    await kv.del(`email:${token}`);
    return null;
  }
  
  // Valid token, return the email
  return data.email;
}

// Send a verification email
export async function sendVerificationEmail(email: string, token: string): Promise<{ success: boolean; message: string }> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${token}`;
  
  try {
    // First verify the email configuration
    const configCheck = await verifyEmailConfig();
    if (!configCheck.success) {
      return configCheck;
    }
    
    const transport = getTransporter();
    if (!transport) {
      return { 
        success: false, 
        message: 'Email configuration is invalid'
      };
    }
    
    await transport.sendMail({
      from: process.env.EMAIL_FROM || `"Identity Verifier" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your identity',
      text: `Please click the link below to verify your identity:\n\n${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Identity Verification</h2>
          <p>Please click the button below to verify your identity:</p>
          <div style="margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              Verify Identity
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p>${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
        </div>
      `,
    });
    
    return { 
      success: true, 
      message: 'Email sent successfully'
    };
  } catch (error) {
    console.error('Error sending verification email:', error);
    
    // Format the error message in a more user-friendly way
    let errorMessage = 'Failed to send email';
    
    if (error instanceof Error) {
      if (error.message.includes('Invalid login') || error.message.includes('Username and Password not accepted')) {
        errorMessage = 'Email authentication failed. If using Gmail, make sure you\'re using an App Password, not your regular password.';
      } else {
        errorMessage = error.message;
      }
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
} 