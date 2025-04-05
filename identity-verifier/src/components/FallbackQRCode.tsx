'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface FallbackQRCodeProps {
  value: string;
  size?: number;
  onScan?: () => void;
}

export default function FallbackQRCode({ value, size = 250, onScan }: FallbackQRCodeProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setError('No value provided for QR code');
      return;
    }

    const generateQRCode = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(value, {
          margin: 1,
          width: size,
          color: {
            dark: '#000000',
            light: '#ffffff'
          }
        });
        setQrCodeUrl(dataUrl);
        setError(null);
      } catch (err) {
        console.error('Error generating QR code:', err);
        setError('Failed to generate QR code');
      }
    };

    generateQRCode();
  }, [value, size]);

  if (error) {
    return (
      <div className="bg-red-100 p-4 rounded-lg">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!qrCodeUrl) {
    return (
      <div className="animate-pulse bg-gray-200 w-[250px] h-[250px] flex items-center justify-center">
        <p>Generating QR code...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <img 
        src={qrCodeUrl} 
        alt="QR Code" 
        width={size} 
        height={size} 
        onClick={onScan}
        className="cursor-pointer"
      />
      <p className="mt-2 text-sm text-gray-600">
        Scan with Self app
      </p>
    </div>
  );
} 