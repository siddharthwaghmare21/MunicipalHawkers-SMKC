// frontend/src/app/verify/page.tsx
import React from 'react';
import { IDCard } from '@/components/hawkers/IDCard';

async function getPublicHawker(licenseNumber: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://municipalhawkers-smkc.onrender.com';
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
  // Header / Footer Reusables
  // -------------------------------------------------------------------
  const renderHeader = () => (
    <header className="text-center mb-8">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">SMKC Hawker</h1>
      <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">Digital Verification</h2>
    </header>
  );

  const renderFooter = () => (
    <footer className="text-center text-xs text-slate-500 dark:text-slate-400 max-w-md mt-auto pt-8 pb-4">
      This digital record is generated dynamically from the Sangli Miraj &amp; Kupwad City Municipal Corporation official registry.
    </footer>
  );

  // -------------------------------------------------------------------
  // Missing or invalid QR code handling
  // -------------------------------------------------------------------
  if (!licenseNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 font-sans">
        {renderHeader()}
        
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700/50 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Invalid QR Code</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            The license number is missing. Please scan a valid official hawker QR code.
          </p>
        </div>
        
        {renderFooter()}
      </div>
    );
  }

  const hawker = await getPublicHawker(licenseNumber);

  // -------------------------------------------------------------------
  // Hawker not found handling
  // -------------------------------------------------------------------
  if (!hawker) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 font-sans">
        {renderHeader()}
        
        <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 dark:text-rose-400 mb-5">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">Hawker Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 text-center">
            The unique vendor ID does not match any registered hawker profile.
          </p>
          <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-100 dark:border-slate-700 w-full text-center">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">Attempted Lookup</span>
            <code className="text-sm text-slate-700 dark:text-slate-300 font-mono break-all">{licenseNumber}</code>
          </div>
        </div>
        
        {renderFooter()}
      </div>
    );
  }

  const license = hawker.licenses && hawker.licenses.length > 0 ? hawker.licenses[0] : null;
  const expiryDate = license?.expiryDate;
  const issueDate = license?.issueDate;

  // -------------------------------------------------------------------
  // Verified hawker view – professional, clean, mobile-first
  // -------------------------------------------------------------------
  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-slate-50 dark:bg-slate-900 py-10 px-4 sm:px-6 font-sans">
      {renderHeader()}

      {/* Verification status badge */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center text-emerald-500 dark:text-emerald-400 mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="text-center">
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block mb-1">
            VERIFIED HAWKER IDENTITY
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Officially verified record
          </span>
        </div>
      </div>

      {/* Central ID Card */}
      <div className="w-full max-w-md flex justify-center mb-8 overflow-x-auto">
        <div className="flex-shrink-0">
          <IDCard hawker={hawker} licenseNumber={hawker.licenseNumber} issueDate={issueDate} expiryDate={expiryDate} />
        </div>
      </div>

      {renderFooter()}
    </div>
  );
}
