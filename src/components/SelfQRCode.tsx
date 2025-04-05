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
      <div className="bg-red-50/20 dark:bg-red-900/10 border border-red-200/20 dark:border-red-800/20 rounded-md p-3 backdrop-blur-md">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <div>
            <h3 className="text-xs font-medium text-red-800 dark:text-red-300">Error Loading QR Code</h3>
            <div className="mt-1 text-xs text-red-700 dark:text-red-400">
              <p>{error}</p>
              <p className="mt-1">Please try the fallback QR code instead.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!QRComponent) {
    return (
      <div className="relative flex flex-col items-center justify-center rounded-md bg-white/20 dark:bg-slate-800/20 p-3 border border-slate-200/20 dark:border-slate-700/20 w-[250px] h-[250px] overflow-hidden backdrop-blur-xl">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-[180px] h-[180px] bg-slate-200/30 dark:bg-slate-700/30 rounded mb-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-100/50 dark:via-slate-600/50 to-transparent blur-sm animate-shimmer"></div>
          </div>
          <div className="h-3 w-28 bg-slate-200/30 dark:bg-slate-700/30 rounded"></div>
        </div>
        <div className="absolute bottom-2 text-xs text-slate-500 dark:text-slate-400">Loading QR code...</div>
      </div>
    );
  }

  // Render the Self QR code component with customized styling
  const QR = QRComponent;
  return (
    <div className="rounded-md p-3 bg-white/30 dark:bg-slate-900/30 border border-slate-200/20 dark:border-slate-700/20 flex flex-col items-center backdrop-blur-xl">
      <div className="mb-2 text-center">
        <span className="text-xs text-slate-500 dark:text-slate-400">Scan with Self App</span>
      </div>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-md shadow-sm">
        <QR
          selfApp={selfApp}
          onSuccess={onSuccess}
          size={220}
        />
      </div>
      <div className="mt-3 text-center">
        <span className="text-xs bg-primary-color/5 dark:bg-primary-color/10 text-primary-color dark:text-primary-hover px-2 py-1 rounded-full font-medium text-xs">
          QR Code Ready
        </span>
      </div>
    </div>
  );
} 