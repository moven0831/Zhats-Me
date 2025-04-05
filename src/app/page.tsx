'use client';

import { useState, useEffect, useContext, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { useSearchParams } from 'next/navigation';
import { EventContext } from '@/lib/context/EventContext';
import { SelfApp } from '@selfxyz/qrcode';

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

// Dynamically import the ZkEmail component
const ZkEmailVerifier = dynamic(
  () => import('../components/ZkEmailVerifier'),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-gray-200 w-full p-6 flex items-center justify-center rounded-xl">
        <div className="text-center p-4">
          <div className="spin h-8 w-8 border-t-2 border-b-2 border-gray-500 mx-auto mb-3 rounded-full"></div>
          <p>Loading ZK Email verifier...</p>
        </div>
      </div>
    )
  }
);

// Combined verification results component
interface VerificationResultsProps {
  selfVerified: boolean;
  zkEmailVerified: boolean;
  userData?: {
    name?: string;
    dateOfBirth?: string;
    [key: string]: any;
  };
  onReset: () => void;
  eventName: string;
}

function VerificationResults({ selfVerified, zkEmailVerified, userData, onReset, eventName }: VerificationResultsProps) {
  const allVerified = selfVerified && zkEmailVerified;
  
  if (!selfVerified && !zkEmailVerified) {
    return null; // Don't show anything if neither verification is complete
  }
  
  return (
    <div className="mt-6 w-full animate-fade-in">
      <div className={`rounded-md p-4 border ${
        allVerified 
          ? 'bg-green-50/20 dark:bg-green-900/20 border-green-200/20 dark:border-green-800/20' 
          : 'bg-blue-50/20 dark:bg-blue-900/20 border-blue-200/20 dark:border-blue-800/20'
      } backdrop-blur-md`}>
        <div className="flex items-start">
          <div className={`p-2 rounded-full mr-3 ${
            allVerified 
              ? 'bg-green-100/50 dark:bg-green-900/30' 
              : 'bg-blue-100/50 dark:bg-blue-900/30'
          }`}>
            {allVerified ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className={`text-lg font-bold ${
              allVerified 
                ? 'text-green-800 dark:text-green-300' 
                : 'text-blue-800 dark:text-blue-300'
            }`}>
              {allVerified 
                ? 'Verification Complete!' 
                : 'Verification In Progress'}
            </h3>
            
            <div className="mt-3 space-y-2">
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                  selfVerified 
                    ? 'bg-green-500 dark:bg-green-600' 
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                  {selfVerified && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${selfVerified 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Identity verification {selfVerified ? 'complete' : 'pending'}
                </span>
              </div>
              
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center mr-2 ${
                  zkEmailVerified 
                    ? 'bg-green-500 dark:bg-green-600' 
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}>
                  {zkEmailVerified && (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-2.5 h-2.5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${zkEmailVerified 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
                }`}>
                  Ticket verification {zkEmailVerified ? 'complete' : 'pending'}
                </span>
              </div>
            </div>
            
            {allVerified && (
              <div className="mt-4 p-3 bg-white/40 dark:bg-slate-800/40 rounded-md border border-green-200/20 dark:border-green-800/20">
                <h4 className="font-medium text-green-800 dark:text-green-300 text-sm mb-1">You're all set for {eventName}!</h4>
                <p className="text-xs text-green-700 dark:text-green-400">
                  Your identity and ticket have been verified. We look forward to seeing you at the event!
                </p>
                
                {userData && Object.keys(userData).length > 0 && (
                  <div className="mt-2 pt-2 border-t border-green-200/20 dark:border-green-800/20">
                    <p className="text-xs text-green-600 dark:text-green-500 mb-1">Verified information:</p>
                    <div className="space-y-1">
                      {userData.name && (
                        <p className="text-xs text-green-700 dark:text-green-400">Name: <span className="font-medium">{userData.name}</span></p>
                      )}
                      {userData.dateOfBirth && (
                        <p className="text-xs text-green-700 dark:text-green-400">Date of Birth: <span className="font-medium">{userData.dateOfBirth}</span></p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {selfVerified && !zkEmailVerified && (
              <div className="mt-3">
                <p className="text-blue-700 dark:text-blue-400 text-xs">
                  Please complete the ticket verification step below.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {allVerified && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={onReset}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-xs font-medium transition-colors"
            >
              Start New Verification
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Home />
    </Suspense>
  );
}

// Actual Home component implementation
function Home() {
  const { selectedEvent } = useContext(EventContext);
  const searchParams = useSearchParams();
  const isVerified = searchParams.get('verified') === 'true';
  const emailFromParam = searchParams.get('email');
  const userIdFromParam = searchParams.get('userId');
  
  // Define fallback QR code value for when the Self app isn't initialized yet
  const fallbackValue = 'placeholder-qr-value';

  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [_isLoading, _setIsLoading] = useState(true);
  const [_qrValue, _setQrValue] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [selfApp, setSelfApp] = useState<SelfApp | null>(null);
  const [timer, setTimer] = useState<number>(0);
  
  // Email verification states
  const [email, setEmail] = useState<string>('');
  const [emailVerificationStatus, setEmailVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [emailMessage, setEmailMessage] = useState<string>('');
  
  // Combined verification states
  const [selfVerified, setSelfVerified] = useState(false);
  const [zkEmailVerified, setZkEmailVerified] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Reset all verification states
  const resetVerification = () => {
    setVerificationStatus('idle');
    setSelfVerified(false);
    setZkEmailVerified(false);
    setUserData(null);
    setDebugInfo('');
  };

  useEffect(() => {
    // Check if we're returning from email verification
    if (isVerified && emailFromParam && userIdFromParam) {
      setEmail(emailFromParam);
      setUserId(userIdFromParam);
    
      _setQrValue(fallbackValue);
      
      _setIsLoading(false);
    } else {
      // Generate a user ID when the component mounts
      const newUserId = `0x${uuidv4().replace(/-/g, '')}`;
      setUserId(newUserId);
    
      _setQrValue(fallbackValue);
      
      _setIsLoading(false)
    }
  }, [isVerified, emailFromParam, userIdFromParam, _setQrValue, _setIsLoading]);

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
            appName: "Zhat's Me Verifier",
            userId,
            userIdType: "hex",
            disclosures: { 
              name: true,
              date_of_birth: true
            },
            scope: appScope,
            devMode: true,
          }).build();

          console.log("Self app initialized:", app);
          setSelfApp(app);
        } catch (error) {
          console.error("Error building Self app:", error);
        }
      };
      
      initSelfApp()
    }
  }, [userId, isVerified, emailVerificationStatus, setSelfApp]);

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
            // Fetch verification status
            const response = await fetch('/api/verify-status');
            const result = await response.json();
            
            console.log(`Verification status attempt ${i+1}:`, result);
            
            if (result && result.success) {
              clearInterval(timerInterval); // Stop the timer
              setVerificationStatus('success');
              setSelfVerified(true);
              
              if (result.credentialSubject) {
                const info = Object.entries(result.credentialSubject)
                  .filter(([key, value]) => value !== undefined)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(', ');
                
                setDebugInfo(info);
                setUserData(result.credentialSubject);
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
      
      checkStatus();
    } catch (error) {
      clearInterval(timerInterval); // Stop timer on error
      console.error('Error during verification:', error);
      setVerificationStatus('error');
      setDebugInfo(error instanceof Error ? error.message : 'Unknown error');
    }
  };

  // Separate function for updating user data that doesn't need parameters
  const handleZkEmailSuccess = () => {
    setZkEmailVerified(true);
    setEmailVerificationStatus('success');
    // Just set some basic data since we don't have the actual verification data here
    setUserData((prevData: Record<string, unknown> | null) => ({ 
      ...prevData, 
      verification: "ETHGlobal Taipei Ticket Verified" 
    }));
  };

  const renderStatus = () => {
    if (verificationStatus === 'idle') return null;
    
    if (verificationStatus === 'pending') {
      return (
        <div className="mt-4 p-4 bg-blue-50 rounded-md animate-pulse">
          <p className="flex items-center text-blue-700">
            <span className="spin h-4 w-4 border-t-2 border-b-2 border-blue-500 rounded-full mr-2"></span>
            <span>Waiting for verification ({timer}s)...</span>
          </p>
          <p className="text-blue-600 text-sm mt-1">
            Please follow the instructions in your Self app
          </p>
        </div>
      );
    }
    
    return null;
  };

  const renderQrCodeSection = () => {
    return (
      <div className="w-full animate-fade-in">
        <h2 className="text-xl font-semibold mb-6">Step 1: Verify Your Identity with Self Protocol</h2>
        
        <div className="flex flex-col justify-between items-center gap-8">
          <div className="w-full">
            <div className="mb-6">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 rounded-full p-1.5 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium">How it works</span>
              </div>
              <ol className="list-decimal pl-8 text-sm text-light-text space-y-1.5">
                <li>Scan this QR code with your Self app</li>
                <li>Allow Self to confirm your verified details</li>
                <li>Wait for confirmation to proceed</li>
              </ol>
            </div>
          </div>

          <div className="flex justify-center items-center">
            {verificationStatus === 'pending' ? (
              <div className="animate-pulse bg-blue-50 w-[300px] h-[300px] flex items-center justify-center rounded-xl">
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
              <div className="rounded-xl shadow-md overflow-hidden border border-gray-200 p-4 bg-white flex flex-col items-center">
                <p className="mb-3 text-sm text-gray-600">Open your Self app and scan this QR code</p>
                <SelfQRcodeWrapper
                  selfApp={selfApp}
                  type="websocket"
                  onSuccess={handleSelfVerification}
                  size={200}
                />
                <p className="mt-3 text-xs text-gray-500">Your data remains private and controlled by you</p>
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
        </div>
        
        {renderStatus()}
        
        {debugInfo && verificationStatus !== 'pending' && verificationStatus !== 'success' && (
          <div className="mt-4 p-4 rounded-md bg-red-50 text-red-700">
            <p className="text-sm">{debugInfo}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6 md:p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono flex flex-col">
        <h1 className="page-title">Zhat's Me</h1>
        <p className="subtitle mb-5 text-center text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500">Prove ETHGlobal Tickets Ownership Without Revealing Your ID</p>
        
        <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md w-full text-center">
          <h2 className="font-semibold text-blue-800 mb-2">
            {selectedEvent.name} Ticket Verification
          </h2>
          <p className="text-blue-700 text-sm">
            Verify your identity for your {selectedEvent.name} ticket without revealing your ID document.
          </p>
        </div>
        
        {/* Combined verification results */}
        <VerificationResults 
          selfVerified={selfVerified}
          zkEmailVerified={zkEmailVerified}
          userData={userData}
          onReset={resetVerification}
          eventName={selectedEvent.name}
        />
        
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
                  <h2 className="text-2xl font-semibold mb-4">Begin Verification</h2>
                  <p className="mb-4 text-light-text">
                    Verify your identity to claim your ETHGlobal ticket. This process:
                  </p>
                  <ul className="list-disc pl-5 mb-4 text-light-text space-y-1">
                    <li>Confirms your name on your ID</li>
                    <li>Generates an event QR code</li>
                    <li>Keeps your ID private</li>
                  </ul>
                  <p className="mb-4 text-light-text">
                    Enter the email you used to receive your ETHGlobal ticket
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
          
          {/* Only show QR code section if user has verified their email and not both verifications are complete */}
          {isVerified && !(selfVerified && zkEmailVerified) && renderQrCodeSection()}
        </div>
        
        {/* Show ZkEmail verification section after successful Self verification */}
        {selfVerified && !zkEmailVerified && (
          <div className="card w-full max-w-4xl p-8 mt-8 animate-fade-in">
            <h2 className="text-xl font-semibold mb-2">Step 2: Verify Your {selectedEvent.name} Ticket</h2>
            <p className="mb-6 text-light-text">
              Upload your {selectedEvent.name} ticket email to complete verification.
            </p>
            {/* Hide the individual verification results by passing the success callback */}
            <ZkEmailVerifier 
              onVerificationSuccess={handleZkEmailSuccess} 
              hideResults={true}
              eventName={selectedEvent.name}
            />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
          By verifying, you confirm that you&apos;re eligible to attend this event.
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-500">
          <a href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Privacy Policy</a> | <a href="/terms" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">Terms of Service</a>
        </p>
      </div>
    </main>
  );
}
