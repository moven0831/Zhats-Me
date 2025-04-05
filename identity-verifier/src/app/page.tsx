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

  // URL for the ngrok tunnel
  const NGROK_URL = "https://bf9c-111-235-226-130.ngrok-free.app";

  useEffect(() => {
    // Generate a user ID when the component mounts
    const newUserId = uuidv4();
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
          
          // Initialize Self protocol app
          const app = new SelfAppBuilder({
            appName: "Identity Verifier",
            scope: "identity-verification-scope",
            endpoint: `${NGROK_URL}/api/verify`,
            userId,
            disclosures: { 
              // Request passport information
              name: true,
              nationality: true,
              date_of_birth: true,
              
              // Set verification rules
              minimumAge: 18,
              excludedCountries: ["IRN", "PRK", "RUS"],
              ofac: true,
            },
            devMode: true, // Set to false for production
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

  const handleSelfVerification = () => {
    setVerificationStatus('pending');
    
    // Simulate successful verification
    setTimeout(() => {
      setVerificationStatus('success');
    }, 1500);
  };

  const renderStatus = () => {
    switch (verificationStatus) {
      case 'pending':
        return <p className="mt-4 text-yellow-500">Verifying your identity...</p>;
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
            Scan the QR code below with any QR code scanner to verify your identity.
          </p>
          
          <div className="flex justify-center mb-6">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
                <p>Loading QR code...</p>
              </div>
            ) : selfApp ? (
              <SelfQRcodeWrapper
                selfApp={selfApp}
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
