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
      <div className="p-3 bg-green-50/20 dark:bg-green-900/10 rounded-md border border-green-200/20 dark:border-green-800/20 backdrop-blur-md">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-600 dark:text-green-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-green-700 dark:text-green-400 text-sm">
            {eventName} ticket verification complete!
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary-color to-accent-color bg-clip-text text-transparent glow-text">
          Verify Your {eventName} Ticket
        </h2>
        <p className="text-slate-600 dark:text-slate-300 max-w-2xl mx-auto text-sm">
          Privacy-preserving verification using zero-knowledge proofs to validate your ticket without revealing sensitive information.
        </p>
      </div>
      
      <div className="bg-amber-50/10 dark:bg-amber-950/10 p-3 rounded-md border border-amber-200/20 dark:border-amber-800/20 mb-6 backdrop-blur-md">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-amber-100/30 dark:bg-amber-900/20 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-600 dark:text-amber-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <p className="text-amber-800 dark:text-amber-300 font-medium text-sm">Privacy Guarantee</p>
            <p className="text-amber-700 dark:text-amber-400 text-xs">
              Your email ticket is processed locally and secured by zero-knowledge cryptography.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white/30 dark:bg-slate-800/30 rounded-md shadow-sm border border-slate-200/20 dark:border-slate-700/20 p-4 mb-6 backdrop-blur-xl">
        <p className="mb-3 text-slate-700 dark:text-slate-300 text-sm">
          Upload your {eventName} ticket email file (.eml format) to verify your participation eligibility.
        </p>
        
        <div className="bg-teal-50/10 dark:bg-teal-950/10 p-3 rounded-md border border-teal-200/20 dark:border-teal-800/20 mb-4 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-teal-800 dark:text-teal-300 mb-1 flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-teal-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Demo Option
              </h3>
              <p className="text-teal-700 dark:text-teal-400 text-xs">
                Download a sample ticket file to test the verification process
              </p>
            </div>
            <div>
              <a 
                href="/sample-ethglobal-ticket.eml" 
                download
                className="flex items-center space-x-2 bg-white/30 dark:bg-slate-800/30 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-teal-200/30 dark:border-teal-800/30 text-teal-700 dark:text-teal-300 font-medium py-1.5 px-3 rounded-md cursor-pointer text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                <span>Download Sample File</span>
              </a>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50/10 dark:bg-blue-950/10 p-3 rounded-md border border-blue-200/20 dark:border-blue-800/20 mb-4 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300 mb-1 flex items-center text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Email Ticket File
              </h3>
              <p className="text-blue-700 dark:text-blue-400 text-xs">
                Save your ticket email as .eml file and upload it here
              </p>
            </div>
            <div>
              <label 
                htmlFor="eml-upload"
                className="flex items-center space-x-2 bg-white/30 dark:bg-slate-800/30 hover:bg-white/50 dark:hover:bg-slate-800/50 border border-blue-200/30 dark:border-blue-800/30 text-blue-700 dark:text-blue-300 font-medium py-1.5 px-3 rounded-md cursor-pointer text-sm transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <span>{fileContent ? "Change File" : "Upload .eml"}</span>
              </label>
              <input
                id="eml-upload"
                type="file"
                accept=".eml"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
        
        {fileContent && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-4 items-center">
              <button
                onClick={generateProofLocally}
                disabled={isLoadingClient || isLoadingServer}
                className="btn-primary text-sm flex items-center"
              >
                {isLoadingClient ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Verify Locally</>
                )}
              </button>
              <span className="text-slate-500 dark:text-slate-400 text-xs">or</span>
              <button
                onClick={generateProofRemotely}
                disabled={isLoadingClient || isLoadingServer}
                className="bg-white/30 dark:bg-slate-800/30 hover:bg-white/50 dark:hover:bg-slate-800/50 text-sm text-blue-700 dark:text-blue-300 font-medium py-1.5 px-3 rounded-md border border-blue-200/30 dark:border-blue-800/30 flex items-center transition-colors"
              >
                {isLoadingServer ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Verify via API</>
                )}
              </button>
            </div>
            
            {verificationMessage && (
              <div className={`p-3 rounded-md ${
                isVerified 
                  ? "bg-green-50/20 dark:bg-green-900/10 border border-green-200/20 dark:border-green-800/20" 
                  : "bg-red-50/20 dark:bg-red-900/10 border border-red-200/20 dark:border-red-800/20"
              }`}>
                <div className="flex items-start">
                  {isVerified ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                  <span className={`text-sm ${isVerified ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}>
                    {verificationMessage}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {proof && !hideResults && (
          <div className="animate-fade-in">
            <div className="mb-2 flex items-center">
              <div className="h-px flex-grow bg-slate-200/30 dark:bg-slate-700/30"></div>
              <span className="px-2 text-slate-500 dark:text-slate-400 text-xs">Proof Details</span>
              <div className="h-px flex-grow bg-slate-200/30 dark:bg-slate-700/30"></div>
            </div>
            
            <div className="bg-slate-50/30 dark:bg-slate-900/30 rounded-md border border-slate-200/20 dark:border-slate-700/20 p-3">
              <div className="font-mono text-xs overflow-x-auto text-slate-700 dark:text-slate-300 whitespace-pre">
                {formatProofAsStr(proof)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 