import { NextRequest, NextResponse } from 'next/server';
import { verifyProof } from '@/lib/verification';

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

export async function POST(req: NextRequest) {
  console.log('API route called (POST)', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    const data = await req.json();
    
    // Log the received data for debugging
    console.log('Received verification data:', JSON.stringify(data, null, 2));
    
    // Use our verification utility to verify the proof
    const verificationResult = await verifyProof(data);
    console.log('Verification result:', JSON.stringify(verificationResult, null, 2));
    
    const response = NextResponse.json(verificationResult);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Verification error:', error);
    const response = NextResponse.json({ 
      success: false, 
      message: 'An error occurred during verification' 
    }, { status: 500 });
    return setCorsHeaders(response);
  }
}

// Handle GET requests for the fallback QR code
export async function GET(req: NextRequest) {
  console.log('API route called (GET)', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  try {
    const id = req.nextUrl.searchParams.get('id');
    
    if (!id) {
      const response = NextResponse.json({
        success: false,
        message: 'Missing ID parameter'
      }, { status: 400 });
      return setCorsHeaders(response);
    }
    
    console.log('Received verification request for ID:', id);
    
    // Use our verification utility for the fallback flow
    const verificationResult = await verifyProof({ id });
    console.log('Verification result:', JSON.stringify(verificationResult, null, 2));
    
    const response = NextResponse.json(verificationResult);
    return setCorsHeaders(response);
  } catch (error) {
    console.error('Verification error:', error);
    const response = NextResponse.json({ 
      success: false, 
      message: 'An error occurred during verification' 
    }, { status: 500 });
    return setCorsHeaders(response);
  }
} 