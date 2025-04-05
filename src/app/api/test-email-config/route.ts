import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailConfig } from '@/lib/email';

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle preflight requests
export async function OPTIONS(_request: NextRequest) {
  const response = NextResponse.json({});
  return setCorsHeaders(response);
}

export async function GET(_req: NextRequest) {
  try {
    // Verify email configuration
    const result = await verifyEmailConfig();
    
    if (result.success) {
      return NextResponse.json({ 
        success: true,
        message: result.message,
        config: {
          host: process.env.EMAIL_HOST || 'smtp.gmail.com',
          port: process.env.EMAIL_PORT || '587',
          secure: process.env.EMAIL_SECURE === 'true',
          user: process.env.EMAIL_USER ? `${process.env.EMAIL_USER.slice(0, 3)}...` : null, // Show just first few chars for security
          from: process.env.EMAIL_FROM || null,
          appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error testing email configuration:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error testing email configuration'
    }, { status: 500 });
  }
} 