import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  const response = NextResponse.json({});
  return setCorsHeaders(response);
}

// Store a verification result for a user ID
export async function storeVerificationResult(userId: string, result: any) {
  console.log(`Storing verification result for user ${userId}:`, result);
  await kv.set(userId, result);
}

// Get verification status by user ID
export async function GET(req: NextRequest) {
  console.log('Status API route called (GET)', new Date().toISOString());
  
  try {
    const userId = req.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      const response = NextResponse.json({
        success: false,
        message: 'Missing user ID parameter'
      }, { status: 400 });
      return setCorsHeaders(response);
    }
    
    console.log('Checking verification status for user:', userId);
    
    // Get the stored verification result for this user from our shared KV store
    const result = await kv.get(userId);
    
    if (result) {
      console.log('Found verification result:', result);
      const response = NextResponse.json({
        success: true,
        message: 'Verification completed',
        ...result
      });
      return setCorsHeaders(response);
    } else {
      console.log('No verification result found for user:', userId);
      const response = NextResponse.json({
        success: false,
        message: 'Verification pending or not started'
      }, { status: 404 });
      return setCorsHeaders(response);
    }
  } catch (error) {
    console.error('Status check error:', error);
    const response = NextResponse.json({ 
      success: false, 
      message: 'An error occurred checking verification status' 
    }, { status: 500 });
    return setCorsHeaders(response);
  }
} 