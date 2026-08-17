'use client';

import React, { useRef, useState, useEffect } from 'react';
import { IDCard } from './IDCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function IDCardActions({ hawker }: { hawker: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  // Find the photo document from hawker's documents if it exists
  useEffect(() => {
    if (hawker?.documents) {
      const photoDoc = hawker.documents.find((d: any) => d.documentType?.name === 'Photo');
      if (photoDoc) {
        setPhotoUrl(`http://localhost:5109${photoDoc.filePath}`);
      }
    }
  }, [hawker]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && cardRef.current) {
      // Need to capture the styles and HTML
      const html = cardRef.current.outerHTML;
      printWindow.document.write(`
        <html>
          <head>
            <title>Print ID Card</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
              @media print {
                @page { size: auto; margin: 0; }
                body { margin: 1cm; display: flex; justify-content: center; }
              }
            </style>
          </head>
          <body>
            ${html}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleExportPDF = async () => {
    if (!cardRef.current) return;
    
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, useCORS: true });
      if (!canvas || canvas.width === 0) {
        throw new Error('Canvas rendering failed. The element may be disconnected from the DOM.');
      }
      
      // CR80 dimensions in mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54]
      });
      
      // Pass the canvas directly to jsPDF to avoid PNG signature parsing errors
      pdf.addImage(canvas, 'PNG', 0, 0, 85.6, 54);
      pdf.save(`Hawker-IDCard-${hawker.enrollmentNo || hawker.id}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // We need to fetch the license info. We can assume the first license.
  const license = hawker?.licenses && hawker.licenses.length > 0 ? hawker.licenses[0] : null;

  return (
    <>
      <div className="flex space-x-3">
        <button
          onClick={handlePrint}
          className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print ID Card
        </button>
        <button
          onClick={handleExportPDF}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm flex items-center"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export PDF
        </button>
      </div>

      {/* Hidden ID Card for capturing */}
      <div style={{ position: 'absolute', top: 0, left: 0, zIndex: -50 }}>
        <IDCard 
          ref={cardRef}
          hawker={hawker}
          photoUrl={photoUrl}
          licenseNumber={license?.licenseNumber}
          issueDate={license?.issueDate}
          expiryDate={license?.expiryDate}
        />
      </div>
    </>
  );
}
