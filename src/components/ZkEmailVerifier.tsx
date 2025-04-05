"use client";

import { useState } from 'react';
import zkeSdk, { Proof } from "@zk-email/sdk";

const blueprintSlug = "moven0831/ETHGlobalTicket_Basic@v3";

interface ZkEmailVerifierProps {
  onVerificationSuccess?: () => void;
  hideResults?: boolean;
  eventName?: string;
}

export default function ZkEmailVerifier({ 
  onVerificationSuccess, 
  hideResults = false,
  eventName = "ETHGlobal Taipei 2025" // Default fallback
}: ZkEmailVerifierProps) {
  const sdk = zkeSdk();
  
  const [fileContent, setFileContent] = useState("");
  const [isLoadingClient, setIsLoadingClient] = useState(false);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [proof, setProof] = useState<Proof | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setFileContent(text);
      // Reset states when new file is uploaded
      setProof(null);
      setIsVerified(false);
      setVerificationMessage("");
    };
    reader.readAsText(file);
  };

  const generateProofLocally = async () => {
    if (!fileContent) {
      setVerificationMessage("Please upload an email (.eml) file first");
      return;
    }
    
    setProof(null);
    setIsVerified(false);
    setVerificationMessage("");
    setIsLoadingClient(true);
    
    try {
      // Fetch blueprint
      const blueprint = await sdk.getBlueprint(blueprintSlug);

      // Initialize local prover
      const prover = blueprint.createProver({ isLocal: true });

      // Create proof passing email content
      const proof = await prover.generateProof(fileContent);
      setProof(proof);

      // Verify proof
      const verification = await blueprint.verifyProofOnChain(proof);
      
      if (verification) {
        setIsVerified(true);
        setVerificationMessage(`Your ${eventName} ticket has been successfully verified!`);
        
        // Call success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        setVerificationMessage(`Proof verification failed. Please ensure you're using a valid ${eventName} ticket email.`);
      }
      
    } catch (err) {
      console.error("Error generating proof locally:", err);
      setVerificationMessage(`Error: ${err instanceof Error ? err.message : "Could not generate proof"}`);
    }
    
    setIsLoadingClient(false);
  };

  const generateProofRemotely = async () => {
    if (!fileContent) {
      setVerificationMessage("Please upload an email (.eml) file first");
      return;
    }
    
    setProof(null);
    setIsVerified(false);
    setVerificationMessage("");
    setIsLoadingServer(true);
    
    try {
      // Fetch blueprint
      const blueprint = await sdk.getBlueprint(blueprintSlug);

      // Initialize remote prover
      const prover = blueprint.createProver();

      // Create proof passing email content
      const proof = await prover.generateProof(fileContent);
      setProof(proof);

      // Verify proof
      const verification = await blueprint.verifyProofOnChain(proof);
      
      if (verification) {
        setIsVerified(true);
        setVerificationMessage(`Your ${eventName} ticket has been successfully verified!`);
        
        // Call success callback if provided
        if (onVerificationSuccess) {
          onVerificationSuccess();
        }
      } else {
        setVerificationMessage(`Proof verification failed. Please ensure you're using a valid ${eventName} ticket email.`);
      }
      
    } catch (err) {
      console.error("Error generating proof remotely:", err);
      setVerificationMessage(`Error: ${err instanceof Error ? err.message : "Could not generate proof"}`);
    }
    
    setIsLoadingServer(false);
  };

  function formatProofAsStr(proof: Proof) {
    return JSON.stringify(
      {
        proofData: proof.props.proofData,
        publicData: proof.props.publicData,
        externalInputs: proof.props.externalInputs,
        isLocal: proof.props.isLocal,
      },
      null,
      2
    );
  }

  // Don't render individual verification results if hideResults is true and verification is successful
  if (hideResults && isVerified) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-green-600 dark:text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-700 dark:text-green-400">
            {eventName} ticket verification complete!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Verify Your {eventName} Ticket
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Privacy-preserving verification using zero-knowledge proofs to validate your ticket without revealing sensitive information.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800 mb-8 shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-amber-100 dark:bg-amber-900/50 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-amber-600 dark:text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-amber-800 dark:text-amber-300 font-medium">Privacy Guarantee</p>
            <p className="text-amber-700 dark:text-amber-400 text-sm">
              Your email ticket is processed locally and secured by zero-knowledge cryptography.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6 mb-8">
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Upload your {eventName} ticket email file (.eml format) to verify your participation eligibility.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Don't have your ticket email?
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-sm">
                Download our sample ticket for testing the verification process.
              </p>
            </div>
            <a 
              href="/sample-ethglobal-ticket.eml" 
              download
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-all shadow-sm hover:shadow flex items-center justify-center whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Sample Ticket
            </a>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="group relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 transition-all hover:border-indigo-400 dark:hover:border-indigo-500 focus-within:border-indigo-400 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-400/20 dark:focus-within:ring-indigo-500/20">
            <input
              type="file"
              accept=".eml"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mx-auto h-12 w-12 text-slate-400 group-hover:text-indigo-500 transition-all">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              <div className="mt-4 flex text-sm leading-6 text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 transition-all">Click to upload</span>
                <span className="pl-1">or drag and drop</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">
                {eventName} email ticket in .eml format
              </p>
            </div>
          </div>
          
          {fileContent && (
            <div className="flex items-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Email file loaded successfully
            </div>
          )}
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generateProofLocally}
              disabled={isLoadingClient || isLoadingServer || !fileContent}
              className={`relative px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                isLoadingClient || isLoadingServer || !fileContent
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
              }`}
            >
              {isLoadingClient ? (
                <span className="flex items-center">
                  <span className="spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Generating Proof Locally...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                  Generate Proof Locally
                </span>
              )}
            </button>
            
            <button
              onClick={generateProofRemotely}
              disabled={isLoadingClient || isLoadingServer || !fileContent}
              className={`relative px-5 py-3 rounded-lg text-sm font-medium transition-all ${
                isLoadingClient || isLoadingServer || !fileContent
                  ? 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow'
              }`}
            >
              {isLoadingServer ? (
                <span className="flex items-center">
                  <span className="spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Generating Proof Remotely...
                </span>
              ) : (
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                  Generate Proof Remotely
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isLoadingClient && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl mb-6 animate-pulse">
          <div className="flex items-center">
            <span className="spin h-5 w-5 border-t-2 border-b-2 border-blue-600 dark:border-blue-400 rounded-full mr-3"></span>
            <p className="text-blue-700 dark:text-blue-400">
              Generating proof locally. This may take several minutes depending on your device...
            </p>
          </div>
        </div>
      )}
      
      {verificationMessage && (
        <div className={`p-4 rounded-xl mb-6 animate-fade-in ${
          isVerified 
          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
          : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
        }`}>
          <div className="flex items-start">
            {isVerified ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-green-600 dark:text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-red-600 dark:text-red-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            )}
            <p>{verificationMessage}</p>
          </div>
        </div>
      )}
      
      {isVerified && !hideResults && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-xl border border-green-200 dark:border-green-800 mb-6 shadow-md animate-fade-in">
          <div className="flex items-center mb-3">
            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-xl text-green-800 dark:text-green-300">Verification Successful</h3>
              <p className="text-green-700 dark:text-green-400">
                Your {eventName} ticket has been verified using Zero-Knowledge proofs.
              </p>
            </div>
          </div>
          <div className="pl-16">
            <p className="text-green-700 dark:text-green-400 text-sm">
              You're all set to participate in the hackathon! Your eligibility has been confirmed without exposing personal data.
            </p>
          </div>
        </div>
      )}
      
      {proof && !hideResults && (
        <div className="mt-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden animate-slide-in-right">
          <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-mono text-sm font-medium text-slate-700 dark:text-slate-300">Proof Details</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(formatProofAsStr(proof))}
              className="text-xs bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 px-2 py-1 rounded transition-colors"
            >
              Copy to clipboard
            </button>
          </div>
          <pre className="p-4 overflow-auto text-xs font-mono text-slate-700 dark:text-slate-300 max-h-60">
            {formatProofAsStr(proof)}
          </pre>
        </div>
      )}
    </div>
  );
} 