'use client';

import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

export function HawkerQRCode({ licenseNumber }: { licenseNumber: string }) {
  if (!licenseNumber) return null;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://municipal-hawkers-smkc.vercel.app');
  const verifyUrl = `${baseUrl}/verify?licenseNumber=${encodeURIComponent(licenseNumber)}`;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Verification QR Code</h3>
      <div className="bg-white p-3 rounded-lg border-2 border-dashed border-gray-200">
        <QRCodeSVG 
          value={verifyUrl} 
          size={160} 
          level="M" 
          includeMargin={true}
        />
      </div>
      <p className="text-xs text-gray-500 mt-4 text-center max-w-xs">Scan this QR code from any mobile device to verify this hawker's digital identity and license validity.</p>
    </div>
  );
}

