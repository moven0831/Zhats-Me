'use client';

import { useEffect, useState } from 'react';

interface SelfQRCodeProps {
  selfApp: any;
  onSuccess: () => void;
}

export default function SelfQRCode({ selfApp, onSuccess }: SelfQRCodeProps) {
  const [QRComponent, setQRComponent] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load the Self QR code component dynamically
    const loadQRCode = async () => {
      try {
        // Import the Self QR code component
        const SelfQRcodeModule = await import('@selfxyz/qrcode');
        
        // Get the default export (QR code component)
        const SelfQRcodeWrapper = SelfQRcodeModule.default;
        
        if (!SelfQRcodeWrapper) {
          throw new Error('Failed to load Self QR code component');
        }
        
        setQRComponent(() => SelfQRcodeWrapper);
      } catch (err: any) {
        console.error('Error loading Self QR code:', err);
        setError(`Failed to load QR code: ${err.message}`);
      }
    };

    loadQRCode();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Error Loading QR Code</h3>
            <div className="mt-1 text-sm text-red-700 dark:text-red-400">
              <p>{error}</p>
              <p className="mt-2">Please try the fallback QR code instead.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!QRComponent) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-xl bg-gradient-to-r from-slate-100 to-gray-100 dark:from-slate-800 dark:to-gray-900 p-4 shadow-sm border border-slate-200 dark:border-slate-700 w-[280px] h-[280px] overflow-hidden">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-[200px] h-[200px] bg-slate-300 dark:bg-slate-700 rounded-lg mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-200 dark:via-slate-600 to-transparent blur-sm animate-shimmer"></div>
          </div>
          <div className="h-4 w-32 bg-slate-300 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="absolute bottom-3 text-xs text-slate-500 dark:text-slate-400">Loading QR code...</div>
      </div>
    );
  }

  // Render the Self QR code component with customized styling
  const QR = QRComponent;
  return (
    <div className="rounded-xl p-4 bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 flex flex-col items-center">
      <div className="mb-2 text-center">
        <span className="text-sm text-slate-500 dark:text-slate-400">Scan with Self App</span>
      </div>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <QR
          selfApp={selfApp}
          onSuccess={onSuccess}
          size={250}
        />
      </div>
      <div className="mt-4 text-center">
        <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-full font-medium">
          QR Code Loaded Successfully
        </span>
      </div>
    </div>
  );
} 