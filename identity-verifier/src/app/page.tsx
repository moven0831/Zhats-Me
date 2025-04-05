'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import the Self QR code component
const SelfQRcodeWrapper = dynamic(
  () => import('@selfxyz/qrcode').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
        <p>Loading Self QR code...</p>
      </div>
    )
  }
);

export default function Home() {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [qrValue, setQrValue] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selfApp, setSelfApp] = useState<any>(null);
  const [timer, setTimer] = useState<number>(0);

  // URL for the ngrok tunnel - ensure no trailing slash
  const NGROK_URL = "https://7694-111-235-226-130.ngrok-free.app";

  useEffect(() => {
    // Generate a user ID when the component mounts
    const newUserId = `0x${uuidv4().replace(/-/g, '')}`;
    setUserId(newUserId);
    
    // For the QR code, generate a verification URL
    const fallbackValue = `${NGROK_URL}/api/verify?id=${newUserId}`;
    setQrValue(fallbackValue);
    
    setIsLoading(false);
  }, [NGROK_URL]);

  useEffect(() => {
    // Initialize Self app
    if (userId) {
      const initSelfApp = async () => {
        try {
          // Dynamically import SelfAppBuilder
          const { SelfAppBuilder } = await import('@selfxyz/qrcode');
          
          // Use direct scope string for off-chain verification
          const appScope = 'self-verification-scope';
          
          // Initialize Self protocol app with configuration for off-chain verification
          const app = new SelfAppBuilder({
            appName: "Self Verifier",
            scope: appScope, 
            endpoint: `${NGROK_URL}/api/verify`,
            userId,
            userIdType: "hex",
            disclosures: { 
              name: true,
              date_of_birth: true
            },
            devMode: true,
          }).build();

          console.log("Self app initialized:", app);
          setSelfApp(app);
        } catch (error) {
          console.error("Error building Self app:", error);
        }
      };
      
      initSelfApp();
    }
  }, [userId, NGROK_URL]);

  // Fixing the type by matching the pattern from the example
  // The onSuccess handler should be called with no parameters
  const handleSelfVerification = async () => {
    setVerificationStatus('pending');
    setTimer(0);
    
    // Start timer
    const timerInterval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    
    try {
      console.log('Verification initiated');
      
      // More robust approach - poll the status endpoint a few times
      const checkStatus = async (retries = 5, delay = 1000) => {
        for (let i = 0; i < retries; i++) {
          try {
            const response = await fetch(`${NGROK_URL}/api/verify/status?userId=${userId}`);
            const result = await response.json();
            
            console.log(`Verification status attempt ${i+1}:`, result);
            
            if (result && result.success) {
              clearInterval(timerInterval); // Stop the timer
              setVerificationStatus('success');
              
              if (result.credentialSubject) {
                const info = Object.entries(result.credentialSubject)
                  .filter(([key, value]) => value !== undefined)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ');
                
                setDebugInfo(info);
              }
              return true;
            } else if (i === retries - 1) {
              // Only set error on last retry
              clearInterval(timerInterval); // Stop the timer
              setVerificationStatus('error');
              let errorMessage = result?.message || 'Unknown verification error';
              
              if (result?.status === 'proof_generation_failed' || 
                  (result?.message && result.message.includes('proof generation'))) {
                errorMessage = 'Proof generation failed. Please ensure you have the required credentials in the Self app.';
              }
              
              setDebugInfo(errorMessage);
            }
          } catch (error) {
            console.error(`Error checking verification status (attempt ${i+1}):`, error);
            if (i === retries - 1) {
              clearInterval(timerInterval); // Stop the timer
              setVerificationStatus('error');
              setDebugInfo(error instanceof Error ? error.message : 'Unknown error');
            }
          }
          
          if (i < retries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
        return false;
      };
      
      // Wait a short time for the API to process before starting polling
      await new Promise(resolve => setTimeout(resolve, 500));
      checkStatus();
      
    } catch (error) {
      clearInterval(timerInterval); // Stop the timer
      console.error('Error handling verification:', error);
      setVerificationStatus('error');
      setDebugInfo(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Handle errors from the Self QR code component
  const handleSelfError = (error: any) => {
    console.error('Self verification error:', error);
    setVerificationStatus('error');
    
    let errorMessage = 'Unknown error during verification';
    
    if (typeof error === 'string') {
      errorMessage = error;
    } else if (error && error.message) {
      errorMessage = error.message;
    } else if (error && error.status) {
      errorMessage = `Status: ${error.status}`;
      if (error.reason) {
        errorMessage += ` - Reason: ${error.reason}`;
      }
    }
    
    setDebugInfo(errorMessage);
  };

  // Add resetVerification function
  const resetVerification = () => {
    // Generate new userId
    const newUserId = `0x${uuidv4().replace(/-/g, '')}`;
    setUserId(newUserId);
    
    // Reset verification status and debug info
    setVerificationStatus('idle');
    setDebugInfo('');
    
    // Update QR value
    const fallbackValue = `${NGROK_URL}/api/verify?id=${newUserId}`;
    setQrValue(fallbackValue);
  };

  const renderStatus = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="mt-4 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-yellow-500 mr-2"></div>
              <p className="text-yellow-500">Verifying your identity...</p>
            </div>
            <p className="text-xs text-gray-500">Time elapsed: {timer}s</p>
          </div>
        );
      case 'success':
        return <p className="mt-4 text-green-500">Identity verified successfully!</p>;
      case 'error':
        return <p className="mt-4 text-red-500">Error verifying identity. Please try again.</p>;
      default:
        return null;
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm flex flex-col">
        <h1 className="text-4xl font-bold mb-8">Identity Verification</h1>
        
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Verify Your Identity</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            {verificationStatus === 'success' 
              ? 'Your identity has been successfully verified!'
              : 'Scan the QR code below with the Self app to verify your identity.'}
          </p>
          
          <div className="flex justify-center mb-6">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
                <p>Loading QR code...</p>
              </div>
            ) : verificationStatus === 'success' ? (
              <div className="bg-green-100 w-[250px] h-[250px] flex items-center justify-center rounded-lg">
                <div className="text-center p-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="mt-4 font-medium text-green-700">Verification Successful</p>
                </div>
              </div>
            ) : selfApp ? (
              <SelfQRcodeWrapper
                selfApp={selfApp}
                type="websocket"
                onSuccess={handleSelfVerification}
                size={250}
              />
            ) : (
              <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
                <p>Initializing Self app...</p>
              </div>
            )}
          </div>
          
          {renderStatus()}
          
          {(verificationStatus === 'success' || verificationStatus === 'error') && (
            <div className="mt-4 text-center">
              <button
                onClick={resetVerification}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                {verificationStatus === 'success' ? 'Verify Another Identity' : 'Try Again'}
              </button>
            </div>
          )}
          
          {debugInfo && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              <p className="font-semibold">Debug Info:</p>
              <p>{debugInfo}</p>
            </div>
          )}
          
          {userId && (
            <p className="mt-4 text-sm text-gray-500">
              User ID: {userId.substring(0, 8)}...
            </p>
          )}
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Privacy-first identity verification powered by Self Protocol.</p>
            <p className="mt-1 text-xs">Using ngrok URL: {NGROK_URL}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
