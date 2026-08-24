import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';

async function getPublicHawker(enrollmentNo: string) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109';
    const res = await fetch(`${backendUrl}/api/hawkers/public/${encodeURIComponent(enrollmentNo)}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch public hawker ${enrollmentNo}: HTTP ${res.status}`);
      return null;
    }
    
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error fetching public hawker data:", error);
    return null;
  }
}

export default async function VerifyHawkerPage({ params }: { params: Promise<{ enrollmentNo: string }> }) {
  const resolvedParams = await params;
  const enrollmentNo = resolvedParams?.enrollmentNo ? decodeURIComponent(resolvedParams.enrollmentNo) : '';
  const hawker = enrollmentNo ? await getPublicHawker(enrollmentNo) : null;

  if (!hawker) {
    notFound();
  }

  const safeStr = (val: any) => val ? String(val) : '-';
  const safeDate = (val: any) => val ? new Date(val).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}) : '-';
  
  const license = hawker.licenses && hawker.licenses.length > 0 ? hawker.licenses[0] : null;
  const photoDoc = hawker.documents?.find((d: any) => d.documentType?.name === 'Photo');
  const photoUrl = photoDoc ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}${photoDoc.filePath}` : null;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mt-8">
        
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-center text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 px-2 py-1 rounded text-xs font-bold tracking-wider">
            VERIFIED
          </div>
          <h1 className="text-xl font-bold uppercase tracking-wide">Hawker License</h1>
          <p className="text-emerald-100 text-sm mt-1">Sangli, Miraj & Kupwad City Corporation</p>
        </div>

        {/* Profile Image & Name */}
        <div className="flex flex-col items-center -mt-10 px-6">
          <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md z-10 relative overflow-hidden border-4 border-white">
            {photoUrl ? (
              <Image 
                src={photoUrl} 
                alt={hawker.fullName} 
                fill 
                className="object-cover rounded-full"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500">
                No Photo
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mt-3 text-center">{hawker.fullName}</h2>
          <p className="text-slate-500 text-sm font-medium">{safeStr(hawker.businessType)}</p>
        </div>

        {/* Details Grid */}
        <div className="px-6 py-6 mt-2">
          <div className="space-y-4">
            
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Enrollment No.</span>
              <span className="font-semibold text-slate-800">{safeStr(hawker.enrollmentNo)}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">License Number</span>
              <span className="font-semibold text-slate-800 text-right">{license ? license.licenseNumber : 'Pending'}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Validity</span>
              <span className="font-semibold text-slate-800">
                {license ? `${safeDate(license.issueDate)} - ${safeDate(license.expiryDate)}` : '-'}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Aadhar Number</span>
              <span className="font-semibold text-slate-800">{safeStr(hawker.aadharNo)}</span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm">Mobile Number</span>
              <span className="font-semibold text-slate-800">{safeStr(hawker.mobileNumber)}</span>
            </div>

            <div className="flex flex-col border-b border-slate-100 pb-3">
              <span className="text-slate-500 text-sm mb-1">Vending Address</span>
              <span className="font-semibold text-slate-800 leading-snug">{safeStr(hawker.address)}</span>
            </div>

            <div className="flex justify-between pb-1">
              <span className="text-slate-500 text-sm">Vending Timing</span>
              <span className="font-semibold text-slate-800">{safeStr(hawker.businessTime)}</span>
            </div>

          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">This digital record is generated directly from SMKC database and is actively valid unless expired.</p>
        </div>

      </div>
    </div>
  );
}
