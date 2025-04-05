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
      <div className="p-4 bg-green-50/30 dark:bg-green-900/10 rounded-lg border border-green-200/30 dark:border-green-800/30 backdrop-blur-md neon-border">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-3 text-green-600 dark:text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-700 dark:text-green-400 text-glow">
            {eventName} ticket verification complete!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary-color to-accent-color bg-clip-text text-transparent text-glow">
          Verify Your {eventName} Ticket
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Privacy-preserving verification using zero-knowledge proofs to validate your ticket without revealing sensitive information.
        </p>
      </div>
      
      <div className="bg-gradient-to-r from-amber-50/30 to-yellow-50/30 dark:from-amber-950/20 dark:to-yellow-950/20 p-4 rounded-xl border border-amber-200/30 dark:border-amber-800/30 mb-8 shadow-sm backdrop-blur-md futuristic-chip">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-amber-100/50 dark:bg-amber-900/30 rounded-full">
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
      
      <div className="bg-white/50 dark:bg-slate-800/50 rounded-xl shadow-md border border-slate-200/30 dark:border-slate-700/30 p-6 mb-8 backdrop-blur-xl neon-border">
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          Upload your {eventName} ticket email file (.eml format) to verify your participation eligibility.
        </p>
        
        <div className="bg-gradient-to-r from-blue-50/30 to-indigo-50/30 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-xl border border-blue-200/30 dark:border-blue-800/30 mb-6 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Upload Ticket Email
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Select the .eml file you received from the {eventName} team
              </p>
            </div>
            <div>
              <label className="relative inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-color hover:bg-primary-hover rounded-md shadow-sm cursor-pointer transition-all duration-150 ease-in-out overflow-hidden group">
                <span className="relative z-10">Select Email File</span>
                <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-300 ease-out"></span>
                <input
                  type="file"
                  accept=".eml"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
          {fileContent && (
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-blue-800/30">
              <div className="flex items-center text-green-600 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm">Email file loaded successfully</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={generateProofLocally}
            disabled={!fileContent || isLoadingClient || isLoadingServer}
            className="w-full relative btn-primary group"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoadingClient ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying Locally...
                </>
              ) : (
                <>Verify Locally</>
              )}
            </span>
            <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-300 ease-out"></span>
          </button>
          <button
            onClick={generateProofRemotely}
            disabled={!fileContent || isLoadingClient || isLoadingServer}
            className="w-full relative bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-150 ease-in-out group"
          >
            <span className="relative z-10 flex items-center justify-center">
              {isLoadingServer ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying on Server...
                </>
              ) : (
                <>Verify on Server</>
              )}
            </span>
            <span className="absolute inset-0 bg-white/10 w-0 group-hover:w-full transition-all duration-300 ease-out"></span>
          </button>
        </div>
        
        {verificationMessage && (
          <div className={`mt-4 p-4 rounded-lg backdrop-blur-md ${isVerified ? 'text-green-700 bg-green-50/50 dark:text-green-400 dark:bg-green-900/20 border border-green-200/30 dark:border-green-800/30' : 'text-red-700 bg-red-50/50 dark:text-red-400 dark:bg-red-900/20 border border-red-200/30 dark:border-red-800/30'}`}>
            <div className="flex">
              {isVerified ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500 dark:text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-500 dark:text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{verificationMessage}</span>
            </div>
          </div>
        )}
        
        {proof && !hideResults && (
          <div className="mt-6">
            <h3 className="font-medium text-slate-800 dark:text-slate-200 mb-2">Proof Details</h3>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-700/30 rounded-md shadow-inner p-3 overflow-auto text-xs font-mono">
              <pre>{formatProofAsStr(proof)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 