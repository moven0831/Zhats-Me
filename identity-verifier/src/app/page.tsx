'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FallbackQRCode from '@/components/FallbackQRCode';
import { v4 as uuidv4 } from 'uuid';

// Dynamically import the Self components with SSR disabled
const SelfQRcodeWrapper = dynamic(
  () => import('@selfxyz/qrcode').then(mod => mod.default),
  { ssr: false }
);

export default function Home() {
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [selfApp, setSelfApp] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [qrValue, setQrValue] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Generate a user ID when the component mounts
    setUserId(uuidv4());
  }, []);

  useEffect(() => {
    // Only run on client-side if we have a userId
    if (typeof window !== 'undefined' && userId) {
      setIsLoading(true);
      
      // For the fallback QR code, generate a simple verification URL
      const fallbackValue = `${window.location.origin}/api/verify?id=${userId}`;
      setQrValue(fallbackValue);
      
      // Try to dynamically import SelfAppBuilder
      import('@selfxyz/qrcode').then((mod) => {
        const { SelfAppBuilder } = mod;
        
        try {
          // Initialize Self protocol app
          const app = new SelfAppBuilder({
            appName: "Identity Verifier",
            scope: "identity-verification-scope",
            endpoint: `${window.location.origin}/api/verify`,
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
          setUseFallback(true);
        } finally {
          setIsLoading(false);
        }
      }).catch(err => {
        console.error("Failed to load Self SDK:", err);
        setIsLoading(false);
        setUseFallback(true);
      });
    }
  }, [userId]);

  const handleVerificationSuccess = () => {
    try {
      setVerificationStatus('pending');
      
      // In a real application, the verification happens on the server
      // This is a simplified client-side feedback for demo purposes
      console.log("Verification successful!");
      setVerificationStatus('success');
    } catch (error) {
      console.error('Error verifying identity:', error);
      setVerificationStatus('error');
    }
  };

  const handleFallbackScan = async () => {
    try {
      setVerificationStatus('pending');
      
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setVerificationStatus('success');
    } catch (error) {
      console.error('Error in fallback verification:', error);
      setVerificationStatus('error');
    }
  };

  const toggleQRMode = () => {
    setUseFallback(!useFallback);
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
            Scan the QR code below with the Self app to verify your identity.
          </p>
          
          <div className="flex justify-center mb-6">
            {isLoading ? (
              <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
                <p>Loading QR code...</p>
              </div>
            ) : useFallback ? (
              <FallbackQRCode 
                value={qrValue} 
                size={250} 
                onScan={handleFallbackScan} 
              />
            ) : selfApp ? (
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleVerificationSuccess}
                size={250}
              />
            ) : (
              <div className="bg-red-100 p-4 rounded-lg">
                <p className="text-red-500">Failed to initialize Self app.</p>
                <p className="text-sm mt-2">Check console for details.</p>
              </div>
            )}
          </div>
          
          {renderStatus()}
          
          <button 
            onClick={toggleQRMode}
            className="mt-4 text-blue-500 text-sm underline"
          >
            {useFallback ? "Try Self SDK QR Code" : "Use fallback QR code"}
          </button>
          
          {userId && (
            <p className="mt-4 text-sm text-gray-500">
              User ID: {userId.substring(0, 8)}...
            </p>
          )}
          
          <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            <p>Privacy-first identity verification powered by Self Protocol.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
