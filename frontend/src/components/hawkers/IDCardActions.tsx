'use client';

import React, { useRef, useState, useEffect } from 'react';
import { IDCard } from './IDCard';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export function IDCardActions({ hawker }: { hawker: any }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    const fetchPhoto = async () => {
      let docs = hawker?.documents;
      
      // Always fetch latest documents if list is empty or documents property missing
      if ((!docs || docs.length === 0) && hawker?.id) {
        try {
          const res = await fetch(`/api/documents/hawker/${hawker.id}`);
          if (res.ok) {
            const json = await res.json();
            docs = json.data || (Array.isArray(json) ? json : []);
          }
        } catch (e) {
          console.error("Failed to fetch documents for photo", e);
        }
      }

      if (docs && Array.isArray(docs)) {
        const photoDoc = docs.find((d: any) => {
          const typeName = (d.documentType?.name || d.documentTypeName || '').toLowerCase();
          const fileName = (d.originalFileName || d.fileName || '').toLowerCase();
          const contentType = (d.contentType || '').toLowerCase();
          const isImage = contentType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(fileName);
          return typeName.includes('photo') || typeName.includes('image') || isImage;
        });

        if (photoDoc) {
          try {
            const imgRes = await fetch(`/api/documents/download/${photoDoc.id}`);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const reader = new FileReader();
              reader.onloadend = () => {
                if (isMounted && typeof reader.result === 'string') {
                  setPhotoUrl(reader.result);
                }
              };
              reader.readAsDataURL(blob);
            } else if (photoDoc.filePath) {
              setPhotoUrl(photoDoc.filePath);
            }
          } catch (err) {
            console.error("Error loading photo data url:", err);
            if (photoDoc.filePath) {
              setPhotoUrl(photoDoc.filePath);
            }
          }
        }
      }
    };

    fetchPhoto();
    return () => { isMounted = false; };
  }, [hawker]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow && cardRef.current) {
      const html = cardRef.current.outerHTML;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print ID Card</title>
            <style>
              @media print {
                @page { size: auto; margin: 0; }
                body { margin: 1cm; display: flex; justify-content: center; }
              }
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                background-color: #f8fafc;
              }
            </style>
          </head>
          <body>
            ${html}
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                }, 300);
              };
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

  const license = hawker?.licenses && hawker.licenses.length > 0 ? hawker.licenses[0] : null;
  const expiryDate = license?.expiryDate || hawker?.licenseExpiryDate || hawker?.expiryDate;
  const issueDate = license?.issueDate || hawker?.issueDate || hawker?.createdDate;
  const licenseNumber = license?.licenseNumber || hawker?.activeLicenseNumber || hawker?.enrollmentNo;

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
          licenseNumber={licenseNumber}
          issueDate={issueDate}
          expiryDate={expiryDate}
        />
      </div>
    </>
  );
}
