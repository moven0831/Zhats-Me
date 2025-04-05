'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('Verifying your identity...');
  
  // Verify the token and continue with verification
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setVerificationStatus('error');
        setMessage('Invalid verification link. Please check your email and try again.');
        return;
      }
      
      try {
        // Verify the token with our API
        const response = await fetch(`/api/verify-token?token=${token}`);
        const data = await response.json();
        
        if (data.success && data.email) {
          setEmail(data.email);
          setVerificationStatus('success');
          
          // Generate a user ID
          const newUserId = `0x${uuidv4().replace(/-/g, '')}`;
          setUserId(newUserId);
          
          setMessage(`Email verified successfully (${data.email}). You can now proceed with identity verification.`);
        } else {
          setVerificationStatus('error');
          setMessage(data.message || 'Invalid or expired verification link.');
        }
      } catch (error) {
        console.error('Error verifying token:', error);
        setVerificationStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    }
    
    verifyToken();
  }, [token]);
  
  // Redirect back to home with verified status
  const handleContinue = () => {
    if (email && userId) {
      router.push(`/?verified=true&email=${encodeURIComponent(email)}&userId=${userId}`);
    }
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono flex flex-col">
        <h1 className="page-title">ID verification with Self Protocol</h1>
        
        <div className="card w-full max-w-md p-8 animate-fade-in">
          <h2 className="text-2xl font-semibold mb-4">Email Authentication</h2>
          
          {verificationStatus === 'loading' && (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="spin h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4 rounded-full"></div>
              <p className="text-center">{message}</p>
            </div>
          )}
          
          {verificationStatus === 'success' && (
            <div className="flex flex-col items-center justify-center p-6 animate-fade-in">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-center mb-6">{message}</p>
              <p className="text-center text-gray-600 text-sm mb-6">
                You're one step closer to secure verification. In the next step, you'll use the Self app to verify your identity while keeping your credentials private.
              </p>
              <button
                onClick={handleContinue}
                className="btn-primary"
              >
                Continue to Identity Verification
              </button>
            </div>
          )}
          
          {verificationStatus === 'error' && (
            <div className="flex flex-col items-center justify-center p-6 animate-fade-in">
              <div className="bg-red-100 rounded-full p-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <p className="text-center mb-6">{message}</p>
              <p className="text-center text-gray-600 text-sm mb-6">
                The verification link may have expired or is invalid. Please request a new verification email to continue.
              </p>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Return to Homepage
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 