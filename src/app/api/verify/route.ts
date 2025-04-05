import { NextRequest, NextResponse } from 'next/server';
import { verifyProof, getUserIdentifier } from '@/lib/verification';
import { storeVerificationResult } from '@/lib/store-verification';

// Helper function to set CORS headers
function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle preflight requests
export async function OPTIONS(_request: NextRequest) {
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
    
    // Extract user ID directly from the proof data if available
    let userId = data.userId;
    
    // Use our verification utility to verify the proof
    const verificationResult = await verifyProof(data);
    console.log('Verification result:', JSON.stringify(verificationResult, null, 2));
    
    // If userId wasn't provided in the request, try to extract it from the proof
    if (!userId && data.publicSignals) {
      try {
        userId = await getUserIdentifier(data.publicSignals);
        console.log('Extracted userId from verification data:', userId);
      } catch (err) {
        console.error('Failed to extract userId from publicSignals:', err);
      }
    }
    
    // Fallback to 'unknown' if we still don't have a userId
    userId = userId || 'unknown';
    
    // Store the result for later retrieval by the status endpoint
    await storeVerificationResult(userId, verificationResult);
    console.log(`Stored verification result for user ${userId}`);
    
    const response = NextResponse.json({
      ...verificationResult,
      userId // Include the userId in the response for client reference
    });
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
    
    // Store the result for later retrieval
    await storeVerificationResult(id, verificationResult);
    
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