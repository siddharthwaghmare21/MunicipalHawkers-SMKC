'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface VerifyClientProps {
  hawker: any;
  license: any;
  photoUrl: string | null;
}

export default function VerifyClient({ hawker, license, photoUrl }: VerifyClientProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const safeStr = (val: any) => val ? String(val) : '-';
  const safeDate = (val: any) => val ? new Date(val).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}) : '-';

  const generatePDF = async () => {
    if (!contentRef.current) return;
    setIsGenerating(true);
    
    try {
      const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Hawker-Verification-${hawker.enrollmentNo}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center p-4 sm:p-8 font-sans">
      
      <div className="w-full max-w-md mb-6 flex justify-center">
        <button 
          onClick={generatePDF}
          disabled={isGenerating}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center space-x-2 transition-transform active:scale-95 disabled:opacity-70"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span>{isGenerating ? 'Generating PDF...' : 'Download Verified PDF'}</span>
        </button>
      </div>

      <div 
        ref={contentRef}
        className="w-full max-w-md bg-white overflow-hidden mt-2 relative"
        style={{ width: '800px', maxWidth: '100%', padding: '20px' }}
      >
        <div className="border-4 border-emerald-600 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-8 text-center text-white relative">
            <h1 className="text-3xl font-bold uppercase tracking-wide">Hawker Verification Record</h1>
            <p className="text-emerald-100 text-lg mt-2">Sangli, Miraj & Kupwad City Corporation</p>
          </div>

          {/* Profile Image & Name */}
          <div className="flex flex-col items-center -mt-16 px-6 relative z-10">
            <div className="w-32 h-32 bg-white rounded-full p-2 shadow-xl border-4 border-white">
              {photoUrl ? (
                <div className="w-full h-full relative rounded-full overflow-hidden bg-slate-100">
                  <Image 
                    src={photoUrl} 
                    alt={hawker.fullName} 
                    fill 
                    className="object-cover"
                    unoptimized
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-medium">
                  No Photo
                </div>
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mt-4 text-center">{hawker.fullName}</h2>
            <p className="text-slate-500 text-lg font-medium uppercase tracking-wider">{safeStr(hawker.businessType)}</p>
          </div>

          {/* Details Grid */}
          <div className="px-8 py-8 mt-4">
            <div className="space-y-6">
              
              <div className="flex justify-between border-b-2 border-slate-100 pb-3">
                <span className="text-slate-500 text-lg">Enrollment No.</span>
                <span className="font-bold text-slate-800 text-lg">{safeStr(hawker.enrollmentNo)}</span>
              </div>

              <div className="flex justify-between border-b-2 border-slate-100 pb-3">
                <span className="text-slate-500 text-lg">License Number</span>
                <span className="font-bold text-slate-800 text-lg">{license ? license.licenseNumber : 'Pending'}</span>
              </div>

              <div className="flex justify-between border-b-2 border-slate-100 pb-3">
                <span className="text-slate-500 text-lg">Validity</span>
                <span className="font-bold text-slate-800 text-lg">
                  {license ? `${safeDate(license.issueDate)} - ${safeDate(license.expiryDate)}` : '-'}
                </span>
              </div>

              <div className="flex justify-between border-b-2 border-slate-100 pb-3">
                <span className="text-slate-500 text-lg">Aadhar Number</span>
                <span className="font-bold text-slate-800 text-lg">{safeStr(hawker.aadharNo)}</span>
              </div>

              <div className="flex justify-between border-b-2 border-slate-100 pb-3">
                <span className="text-slate-500 text-lg">Mobile Number</span>
                <span className="font-bold text-slate-800 text-lg">{safeStr(hawker.mobileNumber)}</span>
              </div>

              <div className="flex flex-col border-b-2 border-slate-100 pb-3">
                <span className="text-slate-500 text-lg mb-2">Vending Address</span>
                <span className="font-bold text-slate-800 text-lg leading-relaxed">{safeStr(hawker.address)}</span>
              </div>

              <div className="flex justify-between pb-2">
                <span className="text-slate-500 text-lg">Vending Timing</span>
                <span className="font-bold text-slate-800 text-lg">{safeStr(hawker.businessTime)}</span>
              </div>

            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-slate-50 p-6 text-center border-t-2 border-slate-200">
            <p className="text-sm text-slate-500 font-medium">This certified digital record is generated directly from the SMKC database.</p>
            <p className="text-xs text-slate-400 mt-2">Generated on: {new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
