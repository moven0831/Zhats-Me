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
      <div className="bg-red-100 p-4 rounded-lg">
        <p className="text-red-500">{error}</p>
        <p className="text-sm mt-2">Please try the fallback QR code instead.</p>
      </div>
    );
  }

  if (!QRComponent) {
    return (
      <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
        <p>Loading QR code component...</p>
      </div>
    );
  }

  // Render the Self QR code component
  const QR = QRComponent;
  return (
    <QR
      selfApp={selfApp}
      onSuccess={onSuccess}
      size={250}
    />
  );
} 