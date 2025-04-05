'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'next/navigation';

// Dynamically import the Self QR code component
const SelfQRcodeWrapper = dynamic(
  () => import('@selfxyz/qrcode').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 w-[300px] h-[300px] flex items-center justify-center rounded-xl">
        <div className="text-center p-4">
          <div className="spin h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto mb-3 rounded-full"></div>
          <p>Loading Self QR code...</p>
        </div>
      </div>
    )
  }
);

export default function Home() {
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  const emailFromParam = searchParams.get('email');
  const userIdFromParam = searchParams.get('userId');

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [isLoading, setIsLoading] = useState(true);
  const [qrValue, setQrValue] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selfApp, setSelfApp] = useState<any>(null);
  const [timer, setTimer] = useState<number>(0);
  
  // Email verification states
  const [email, setEmail] = useState<string>('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState<string>('');

  // URL for the ngrok tunnel - ensure no trailing slash
  const NGROK_URL = "https://7694-111-235-226-130.ngrok-free.app";

  useEffect(() => {
    // Check if we're returning from email verification
    if (isVerified && emailFromParam && userIdFromParam) {
      setEmail(emailFromParam);
      setUserId(userIdFromParam);
      
      // For the QR code, generate a verification URL
      const fallbackValue = `${NGROK_URL}/api/verify?id=${userIdFromParam}`;
      setQrValue(fallbackValue);
      
      setIsLoading(false);
    } else {
      // Generate a user ID when the component mounts
      const newUserId = `0x${uuidv4().replace(/-/g, '')}`;
      setUserId(newUserId);
      
      // For the QR code, generate a verification URL
      const fallbackValue = `${NGROK_URL}/api/verify?id=${newUserId}`;
      setQrValue(fallbackValue);
      
      setIsLoading(false);
    }
  }, [NGROK_URL, isVerified, emailFromParam, userIdFromParam]);

  useEffect(() => {
    // Initialize Self app
    if (userId && (isVerified || emailVerificationStatus === 'success')) {
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
  }, [userId, emailVerificationStatus, isVerified, NGROK_URL]);

  // Handle email form submission
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setEmailMessage('Please enter your email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailMessage('Please enter a valid email address');
      return;
    }
    
    setEmailVerificationStatus('pending');
    setEmailMessage('Sending verification email...');
    
    try {
      // First test the email configuration
      const configTest = await fetch('/api/test-email-config');
      const configResult = await configTest.json();
      
      if (!configResult.success) {
        setEmailVerificationStatus('error');
        setEmailMessage(`Email configuration error: ${configResult.message}`);
        console.error('Email configuration error:', configResult);
        return;
      }
      
      // Send the verification email
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setEmailVerificationStatus('success');
        setEmailMessage('Verification email sent. Please check your inbox and follow the link to verify.');
      } else {
        setEmailVerificationStatus('error');
        setEmailMessage(data.message || 'Failed to send verification email. Please try again.');
        
        // If Gmail login is the issue, show help instructions
        if (data.message && (
            data.message.includes('authentication failed') || 
            data.message.includes('Username and Password not accepted')
          )) {
          setEmailMessage(`${data.message} Please check the README for setup instructions.`);
        }
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      setEmailVerificationStatus('error');
      setEmailMessage('An error occurred. Please try again.');
    }
  };

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
    
    // Reset email verification if needed
    if (!isVerified) {
      setEmailVerificationStatus('idle');
      setEmail('');
    }
  };

  const renderStatus = () => {
    switch (verificationStatus) {
      case 'pending':
        return (
          <div className="mt-4 flex flex-col items-center justify-center">
            <div className="flex items-center mb-2">
              <div className="spin h-5 w-5 border-t-2 border-b-2 border-yellow-500 mr-2 rounded-full"></div>
              <p className="text-yellow-500">Securely verifying your credentials...</p>
            </div>
            <p className="text-xs text-gray-500">Time elapsed: {timer}s</p>
          </div>
        );
      case 'success':
        return <p className="mt-4 text-green-500 font-medium text-center">Identity verified successfully! Your credentials have been securely validated.</p>;
      case 'error':
        return <p className="mt-4 text-red-500 font-medium text-center">Verification could not be completed. Please ensure you have the required credentials in your Self app and try again.</p>;
      default:
        return null;
    }
  };

  const renderQrCodeSection = () => {
    // Only show QR code section if user has verified their email through the link
    // This checks if they've been redirected back from the verification page
    if (!isVerified) return null;
    
    return (
      <div className="w-full animate-fade-in">
        <h2 className="text-2xl font-semibold mb-4">Secure Identity Verification</h2>
        <p className="mb-4 text-light-text">
          {verificationStatus === 'success' 
            ? 'Congratulations! Your identity has been securely verified through Self Protocol.'
            : 'Complete your verification by scanning the QR code below with your Self app. This ensures your credentials remain private and secure.'}
        </p>
        
        <div className="bg-yellow-50 p-3 rounded-md mb-6">
          <p className="text-yellow-800 text-sm">
            <span className="font-semibold">✓ Privacy Guarantee:</span> Your actual ID document never leaves your device. Only your verified name is shared to match with your ETHGlobal ticket.
          </p>
        </div>
        
        <div className="flex justify-center mb-6">
          {isLoading ? (
            <div className="animate-pulse bg-gray-200 w-[300px] h-[300px] flex items-center justify-center rounded-xl">
              <div className="text-center p-4">
                <div className="spin h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto mb-3 rounded-full"></div>
                <p>Loading QR code...</p>
              </div>
            </div>
          ) : verificationStatus === 'success' ? (
            <div className="bg-green-100 w-[300px] h-[300px] flex items-center justify-center rounded-xl shadow-md">
              <div className="text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="mt-4 font-medium text-green-700">Verification Successful</p>
              </div>
            </div>
          ) : selfApp ? (
            <div className="rounded-xl shadow-md overflow-hidden border border-gray-200 p-6 bg-white flex flex-col items-center">
              <p className="mb-4 text-sm text-gray-600">Open your Self app and scan this QR code</p>
              <SelfQRcodeWrapper
                selfApp={selfApp}
                type="websocket"
                onSuccess={handleSelfVerification}
                size={250}
              />
              <p className="mt-4 text-xs text-gray-500">Your data remains private and controlled by you</p>
            </div>
          ) : (
            <div className="animate-pulse bg-gray-200 w-[300px] h-[300px] flex items-center justify-center rounded-xl">
              <div className="text-center p-4">
                <div className="spin h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto mb-3 rounded-full"></div>
                <p>Initializing secure connection...</p>
              </div>
            </div>
          )}
        </div>
        
        {renderStatus()}
        
        {debugInfo && verificationStatus !== 'pending' && (
          <div className={`mt-4 p-4 rounded-md ${
            verificationStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            <p className="text-sm">{debugInfo}</p>
          </div>
        )}
        
        {verificationStatus !== 'idle' && verificationStatus !== 'pending' && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={resetVerification}
              className="btn-primary"
            >
              Begin New Verification
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono flex flex-col">
        <h1 className="page-title">Zhat's Me</h1>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md w-full text-center">
          <h2 className="font-semibold text-blue-800 mb-2">ETHGlobal Hackathon Ticket Verification</h2>
          <p className="text-blue-700 text-sm">
            Securely verify your identity to claim your ETHGlobal Hackathon ticket. We'll confirm your name matches your ID (passport or ID card) without revealing or storing your actual identification document.
          </p>
        </div>
        
        <div className="card w-full max-w-md p-8 animate-fade-in">
          {/* If user is verified through email link, show verified banner */}
          {isVerified && (
            <div className="mb-6 bg-green-100 p-4 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">
                <span className="font-semibold">Email verified:</span> {email}
              </p>
            </div>
          )}
          
          {/* If user is not verified via email yet */}
          {!isVerified && (
            <>
              {/* Email success state - Show after sending email */}
              {emailVerificationStatus === 'success' ? (
                <div className="mb-8 w-full animate-fade-in">
                  <div className="bg-blue-50 p-6 rounded-lg text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                    <h2 className="text-2xl font-semibold mb-2">Check Your Email</h2>
                    <p className="mb-4 text-gray-700">
                      We've sent a verification link to: <strong>{email}</strong>
                    </p>
                    <p className="mb-6 text-gray-600">
                      Please check your inbox and click the verification link to continue with your secure identity verification process. If you don't see the email, please check your spam folder.
                    </p>
                    <button
                      onClick={() => {
                        setEmailVerificationStatus('idle');
                        setEmailMessage('');
                      }}
                      className="btn-primary"
                    >
                      Use a different email
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-8 w-full animate-fade-in">
                  <h2 className="text-2xl font-semibold mb-4">Begin Your Verification</h2>
                  <p className="mb-4 text-light-text">
                    Verify your identity to claim your ETHGlobal Hackathon ticket with Self Protocol. This process will:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-light-text space-y-1">
                    <li>Confirm your name matches what appears on your ID</li>
                    <li>Generate a QR code to scan at the event</li>
                    <li>Protect your privacy - your actual ID never leaves your device</li>
                  </ul>
                  <p className="mb-4 text-light-text">
                    Please enter your email address below to start the verification process.
                  </p>
                  
                  <form onSubmit={handleEmailSubmit} className="w-full">
                    <div className="mb-4">
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    {emailMessage && (
                      <p className={`text-sm mb-4 ${
                        emailVerificationStatus === 'error' ? 'text-red-500' : 
                        'text-gray-500'
                      }`}>
                        {emailMessage}
                      </p>
                    )}
                    
                    <button
                      type="submit"
                      disabled={emailVerificationStatus === 'pending'}
                      className="btn-primary w-full py-3"
                    >
                      {emailVerificationStatus === 'pending' ? (
                        <span className="flex items-center justify-center">
                          <span className="spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                          Sending...
                        </span>
                      ) : 'Start Verification Process'}
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
          
          {/* Only show QR code section if user has verified their email */}
          {isVerified && renderQrCodeSection()}
        </div>
      </div>
    </main>
  );
}
