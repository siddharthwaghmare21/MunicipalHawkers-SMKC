// frontend/src/app/verify/page.tsx
import React from 'react';
import { IDCard } from '@/components/hawkers/IDCard';

async function getPublicHawker(licenseNumber: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://municipal-hawkers-smkc.onrender.com';
    const encodedLicense = encodeURIComponent(licenseNumber);
    const res = await fetch(`${backendUrl}/api/hawkers/public?licenseNumber=${encodedLicense}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      console.error(`Failed to fetch public hawker ${licenseNumber}: HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('Error fetching public hawker data:', error);
    return null;
  }
}

export default async function VerifyHawkerPage({
  searchParams,
}: {
  searchParams: Promise<{ licenseNumber?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const licenseNumber = resolvedSearchParams?.licenseNumber
    ? decodeURIComponent(resolvedSearchParams.licenseNumber)
    : '';

  // -------------------------------------------------------------------
  // Missing or invalid QR code handling
  // -------------------------------------------------------------------
  if (!licenseNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 font-sans">
        <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Invalid QR Code</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm text-center max-w-sm">
          The license number is missing. Please scan a valid official hawker QR code.
        </p>
      </div>
    );
  }

  const hawker = await getPublicHawker(licenseNumber);

  // -------------------------------------------------------------------
  // Hawker not found handling
  // -------------------------------------------------------------------
  if (!hawker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-slate-900 p-4 font-sans">
        <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">Hawker Not Found</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4 text-center max-w-sm">
          The unique vendor ID does not match any registered hawker profile.
        </p>
        <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-3 border border-slate-300 dark:border-slate-600 w-full max-w-sm text-left">
          <span className="text-xs text-slate-500 block mb-1">Attempted Lookup:</span>
          <code className="text-xs text-rose-400 font-mono break-all">{licenseNumber}</code>
        </div>
      </div>
    );
  }

  const license = hawker.licenses && hawker.licenses.length > 0 ? hawker.licenses[0] : null;
  const expiryDate = license?.expiryDate;
  const issueDate = license?.issueDate;

  // -------------------------------------------------------------------
  // Verified hawker view – premium, clean, mobile‑first
  // -------------------------------------------------------------------
  return (
    <section className="min-h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-slate-900 py-6 px-4 font-sans">
      {/* Header */}
      <header className="text-center mb-6">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">SMKC Hawker</h1>
        <h2 className="text-xl text-slate-600 dark:text-slate-300">Digital Verification</h2>
      </header>

      {/* Verification status badge */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-600">
          VERIFIED HAWKER IDENTITY
        </span>
        <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">Officially verified record</p>
      </div>

      {/* Central ID Card */}
      <div className="w-full max-w-md mb-6">
        <IDCard hawker={hawker} licenseNumber={hawker.licenseNumber} issueDate={issueDate} expiryDate={expiryDate} />
      </div>

      {/* Footer disclaimer */}
      <footer className="text-center text-xs text-slate-600 dark:text-slate-400 max-w-md">
        This digital record is generated dynamically from the Sangli Miraj &amp; Kupwad City Municipal Corporation official registry.
      </footer>
    </section>
  );
}
