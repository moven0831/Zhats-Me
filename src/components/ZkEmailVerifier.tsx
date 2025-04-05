"use client";

import { useState } from 'react';
import zkeSdk, { Proof } from "@zk-email/sdk";

const blueprintSlug = "moven0831/ETHGlobalTicket_Basic@v3";

export default function ZkEmailVerifier() {
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
        setVerificationMessage("Your ETHGlobal Taipei ticket has been successfully verified!");
      } else {
        setVerificationMessage("Proof verification failed. Please ensure you're using a valid ETHGlobal Taipei ticket email.");
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
        setVerificationMessage("Your ETHGlobal Taipei ticket has been successfully verified!");
      } else {
        setVerificationMessage("Proof verification failed. Please ensure you're using a valid ETHGlobal Taipei ticket email.");
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

  return (
    <div className="w-full animate-fade-in">
      <h2 className="text-2xl font-semibold mb-4">Verify Your ETHGlobal Taipei Ticket</h2>
      
      <div className="bg-yellow-50 p-3 rounded-md mb-6">
        <p className="text-yellow-800 text-sm">
          <span className="font-semibold">✓ Privacy Guarantee:</span> Your email ticket is processed securely using Zero-Knowledge proofs.
        </p>
      </div>
      
      <div className="mb-6">
        <p className="mb-4">
          Upload your ETHGlobal Taipei ticket email file (.eml format) to verify your participation eligibility.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-blue-800 mb-1">Don't have your ticket email?</h3>
              <p className="text-blue-700 text-sm">
                Download our sample ticket for testing the verification process.
              </p>
            </div>
            <a 
              href="/sample-ethglobal-ticket.eml" 
              download
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 text-center"
            >
              Download Sample Ticket
            </a>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4">
          <input
            type="file"
            accept=".eml"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          />
          
          {fileContent && (
            <div className="text-sm text-green-600">
              ✓ Email file loaded successfully
            </div>
          )}
          
          <div className="flex flex-wrap gap-4 mt-2">
            <button
              onClick={generateProofLocally}
              disabled={isLoadingClient || isLoadingServer || !fileContent}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isLoadingClient || isLoadingServer || !fileContent
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoadingClient ? (
                <span className="flex items-center">
                  <span className="spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Generating Proof Locally...
                </span>
              ) : (
                'Generate Proof Locally'
              )}
            </button>
            
            <button
              onClick={generateProofRemotely}
              disabled={isLoadingClient || isLoadingServer || !fileContent}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                isLoadingClient || isLoadingServer || !fileContent
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              {isLoadingServer ? (
                <span className="flex items-center">
                  <span className="spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full mr-2"></span>
                  Generating Proof Remotely...
                </span>
              ) : (
                'Generate Proof Remotely'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isLoadingClient && (
        <div className="p-4 bg-blue-50 rounded-md mb-4">
          <p className="text-blue-700 text-sm">
            Generating proof locally. This may take several minutes depending on your device...
          </p>
        </div>
      )}
      
      {verificationMessage && (
        <div className={`p-4 rounded-md mb-4 ${
          isVerified ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          <p>{verificationMessage}</p>
        </div>
      )}
      
      {isVerified && (
        <div className="p-4 bg-green-50 rounded-md mb-4">
          <h3 className="font-medium text-green-800 mb-2">Verification Successful</h3>
          <p className="text-green-700 text-sm">
            Your ETHGlobal Taipei ticket has been verified using Zero-Knowledge proofs.
            You're all set to participate in the hackathon!
          </p>
        </div>
      )}
      
      {proof && (
        <div className="mt-6">
          <h3 className="font-medium mb-2">Proof Details</h3>
          <div className="p-4 bg-gray-50 rounded-lg overflow-auto max-h-60">
            <pre className="text-xs">{formatProofAsStr(proof)}</pre>
          </div>
        </div>
      )}
    </div>
  );
} 