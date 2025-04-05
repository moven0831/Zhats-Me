import { NextRequest, NextResponse } from 'next/server';
import { verifyProof } from '@/lib/verification';

export async function POST(req: NextRequest) {
  console.log('API route called (POST)');
  try {
    const data = await req.json();
    
    // Log the received data for debugging
    console.log('Received verification data:', JSON.stringify(data, null, 2));
    
    // Use our verification utility to verify the proof
    const verificationResult = await verifyProof(data);
    
    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred during verification' 
    }, { status: 500 });
  }
}

// Handle GET requests for the fallback QR code
export async function GET(req: NextRequest) {
  console.log('API route called (GET)');
  try {
    const id = req.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        success: false,
        message: 'Missing ID parameter'
      }, { status: 400 });
    }
    
    console.log('Received verification request for ID:', id);
    
    // Use our verification utility for the fallback flow
    const verificationResult = await verifyProof({ id });
    
    return NextResponse.json(verificationResult);
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred during verification' 
    }, { status: 500 });
  }
} 