import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/email';

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = NextResponse.json({});
  return setCorsHeaders(response);
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    
    if (!token) {
      const response = NextResponse.json({ 
        success: false, 
        message: 'Token is required' 
      }, { status: 400 });
      return setCorsHeaders(response);
    }
    
    // Verify the token
    const email = await verifyToken(token);
    
    if (email) {
      const response = NextResponse.json({ 
        success: true, 
        email,
        message: 'Token verified successfully' 
      });
      return setCorsHeaders(response);
    } else {
      const response = NextResponse.json({ 
        success: false, 
        message: 'Invalid or expired token' 
      }, { status: 400 });
      return setCorsHeaders(response);
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    const response = NextResponse.json({ 
      success: false, 
      message: 'An error occurred while verifying the token' 
    }, { status: 500 });
    return setCorsHeaders(response);
  }
} 