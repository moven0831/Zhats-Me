import { NextRequest, NextResponse } from 'next/server';
import { createVerificationToken, sendVerificationEmail, verifyEmailConfig } from '@/lib/email';

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = NextResponse.json({});
  return setCorsHeaders(response);
}

export async function POST(req: NextRequest) {
  try {
    // First verify the email configuration
    const configCheck = await verifyEmailConfig();
    if (!configCheck.success) {
      console.error('Email configuration error:', configCheck.message);
      return NextResponse.json({ 
        success: false, 
        message: configCheck.message
      }, { status: 500 });
    }
    
    const data = await req.json();
    const { email } = data;
    
    if (!email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is required' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Create a verification token
    const token = await createVerificationToken(email);
    
    // Send the verification email
    const emailResult = await sendVerificationEmail(email, token);
    
    if (emailResult.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Verification email sent successfully' 
      });
    } else {
      console.error('Failed to send email:', emailResult.message);
      return NextResponse.json({ 
        success: false, 
        message: emailResult.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error sending verification email:', error);
    let errorMessage = 'An error occurred while sending the verification email';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json({ 
      success: false, 
      message: errorMessage
    }, { status: 500 });
  }
} 