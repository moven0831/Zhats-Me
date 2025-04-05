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
      <div className="bg-red-50/30 dark:bg-red-900/10 border border-red-200/30 dark:border-red-800/30 rounded-xl p-4 shadow-sm backdrop-blur-md">
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
      <div className="relative flex flex-col items-center justify-center rounded-xl bg-gradient-to-r from-slate-100/50 to-gray-100/50 dark:from-slate-800/50 dark:to-gray-900/50 p-4 shadow-sm border border-slate-200/30 dark:border-slate-700/30 w-[280px] h-[280px] overflow-hidden backdrop-blur-xl neon-border">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-[200px] h-[200px] bg-slate-300/50 dark:bg-slate-700/50 rounded-lg mb-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-slate-200/70 dark:via-slate-600/70 to-transparent blur-sm animate-shimmer"></div>
          </div>
          <div className="h-4 w-32 bg-slate-300/50 dark:bg-slate-700/50 rounded"></div>
        </div>
        <div className="absolute bottom-3 text-xs text-slate-500 dark:text-slate-400">Loading QR code...</div>
      </div>
    );
  }

  // Render the Self QR code component with customized styling
  const QR = QRComponent;
  return (
    <div className="rounded-xl p-4 bg-white/50 dark:bg-slate-900/50 shadow-md border border-slate-200/30 dark:border-slate-700/30 flex flex-col items-center backdrop-blur-xl neon-border">
      <div className="mb-2 text-center">
        <span className="text-sm text-slate-500 dark:text-slate-400 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-gradient-to-r after:from-primary-color after:to-accent-color">Scan with Self App</span>
      </div>
      <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm futuristic-chip">
        <QR
          selfApp={selfApp}
          onSuccess={onSuccess}
          size={250}
        />
      </div>
      <div className="mt-4 text-center">
        <span className="text-xs bg-primary-color/10 dark:bg-primary-color/20 text-primary-color dark:text-primary-hover px-3 py-1.5 rounded-full font-medium backdrop-blur-md">
          QR Code Ready
        </span>
      </div>
    </div>
  );
} 