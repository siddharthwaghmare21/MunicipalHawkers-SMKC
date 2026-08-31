import React from 'react';
import { IDCard } from '@/components/hawkers/IDCard';

async function getPublicHawker(licenseNumber: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109';
    const res = await fetch(`${backendUrl}/api/hawkers/public/${licenseNumber}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch public hawker ${licenseNumber}: HTTP ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching public hawker data:", error);
    return null;
  }
}

export default async function VerifyHawkerPage({ searchParams }: { searchParams: Promise<{ licenseNumber?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const licenseNumber = resolvedSearchParams?.licenseNumber ? decodeURIComponent(resolvedSearchParams.licenseNumber) : '';

  if (!licenseNumber) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 z-0"></div>
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-slate-700/50 z-10">
          <div className="w-16 h-16 bg-amber-500/20 border border-amber-500/30 rounded-full flex items-center justify-center text-amber-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-2">Invalid QR Code</h2>
          <p className="text-slate-400 text-sm">The license number is missing. Please scan a valid official hawker QR code.</p>
        </div>
      </div>
    );
  }

  const hawker = await getPublicHawker(licenseNumber);

  if (!hawker) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-900 to-slate-950 z-0"></div>
        <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 text-center border border-slate-700/50 z-10">
          <div className="w-16 h-16 bg-rose-500/20 border border-rose-500/30 rounded-full flex items-center justify-center text-rose-400 mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-2">Hawker Not Found</h2>
          <p className="text-slate-400 text-sm mb-4">The unique vendor ID does not match any registered hawker profile.</p>
          <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-700/40 text-left">
            <span className="text-xs text-slate-500 block mb-1">Attempted Lookup:</span>
            <code className="text-xs text-rose-400 font-mono break-all">{licenseNumber}</code>
          </div>
        </div>
      </div>
    );
  }

  const license = hawker.licenses && hawker.licenses.length > 0 ? hawker.licenses[0] : null;
  const expiryDate = license?.expiryDate;
  const issueDate = license?.issueDate;

  const photoDoc = hawker.documents?.find((d: any) => {
    const name = d.documentType?.name?.toLowerCase() || '';
    return name.includes('photo') || name.includes('image') || d.contentType?.startsWith('image/');
  });
  const photoUrl = photoDoc ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}${photoDoc.filePath}` : '';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-slate-900 to-slate-950 z-0"></div>
      
      <div className="w-full max-w-md bg-slate-800/80 backdrop-blur-md rounded-3xl shadow-2xl p-6 border border-slate-700/50 z-10 flex flex-col items-center">
        
        {/* Verification Status Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Verified Hawker Identity
          </span>
          <h1 className="text-lg font-bold text-slate-200 mt-2 text-center">Sangli, Miraj & Kupwad City Corporation</h1>
        </div>

        {/* Dynamic ID Card Display Container */}
        <div className="w-full flex justify-center items-center py-4 overflow-hidden">
          <div className="max-w-full origin-center select-none shadow-xl rounded-lg">
            <IDCard 
              hawker={hawker} 
              licenseNumber={hawker.licenseNumber} 
              issueDate={issueDate} 
              expiryDate={expiryDate} 
              photoUrl={photoUrl} 
            />
          </div>
        </div>

        {/* Verification Footer Text */}
        <div className="mt-6 text-center border-t border-slate-700/60 pt-4 w-full">
          <p className="text-xs text-slate-400 font-medium">This digital record is generated dynamically from the SMKC official registry. Scan the QR code to re-authenticate at any time.</p>
        </div>

      </div>
    </div>
  );
}
