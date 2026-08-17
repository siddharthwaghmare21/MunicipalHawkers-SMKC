import React, { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface IDCardProps {
  hawker: any;
  licenseNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  photoUrl?: string; 
}

export const IDCard = forwardRef<HTMLDivElement, IDCardProps>(({ hawker, licenseNumber, issueDate, expiryDate, photoUrl }, ref) => {
  // Safe default formatting
  const safeStr = (val: any) => (val ? String(val) : '-');
  const safeDate = (val: any) => (val ? new Date(val).toLocaleDateString('en-IN', {day: '2-digit', month: 'short', year: 'numeric'}) : '-');
  
  // Format Gender (M/F)
  const formatGender = (gender: string) => {
    if (!gender) return '-';
    if (gender.toLowerCase().startsWith('m')) return 'M';
    if (gender.toLowerCase().startsWith('f')) return 'F';
    return gender;
  };

  return (
    <div 
      ref={ref}
      style={{
        width: '85.6mm', 
        height: '54mm', 
        fontFamily: "'Arial', sans-serif",
        backgroundColor: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        borderRadius: '8px'
      }}
    >
      {/* Dark blue left edge stripe */}
      <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: '3mm', backgroundColor: '#1a2b56', zIndex: 10 }}></div>
      
      {/* Bottom right geometric shape */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '45mm', height: '6mm', backgroundColor: '#1a2b56', zIndex: 0, clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 15% 0)' }}></div>
      <div style={{ position: 'absolute', bottom: 0, right: '35mm', width: '20mm', height: '4mm', backgroundColor: '#2293c6', zIndex: 0, clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 20% 0)' }}></div>

      <div style={{ paddingLeft: '5mm', paddingRight: '2mm', paddingTop: '2mm', height: '100%', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9px', fontWeight: 'bold', color: '#c92027', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>
              SANGLI, MIRAJ & KUPWAD CITY CORPORATION, SANGLI
            </div>
            <div style={{ backgroundColor: '#e2e8f0', display: 'inline-block', padding: '1px 3px', marginTop: '2px' }}>
              <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TEMPORARY VENDOR IDENTITY
              </div>
            </div>
            {/* DAY-NULM */}
            <div style={{ marginTop: '2px' }}>
              <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#2b4c8a', display: 'block', lineHeight: '1' }}>DAY-NULM</span>
              <span style={{ fontSize: '4.5px', color: '#475569', display: 'block', lineHeight: '1.2' }}>Deendayal Antyodaya Yojana-<br/>National Urban Livelihoods Mission</span>
            </div>
          </div>
          {/* Logo Placeholder */}
          <div style={{ width: '12mm', height: '12mm', border: '1px solid #dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginLeft: '4px' }}>
            <div style={{ width: '10mm', height: '10mm', border: '1px solid #ef4444', backgroundColor: '#fef2f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '5px', color: '#dc2626', fontWeight: 'bold' }}>SMKC</span>
            </div>
          </div>
        </div>

        {/* Body Area */}
        <div style={{ display: 'flex', flex: 1, marginTop: '2px' }}>
          {/* Left Fields */}
          <div style={{ flex: 1, fontSize: '6.5px', lineHeight: '1.4', color: '#0f172a', paddingRight: '4px', zIndex: 10 }}>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Unique ID of Vendor</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(licenseNumber !== 'LIC-PENDING' ? licenseNumber : hawker.enrollmentNo)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Aadhar No.</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker.aadharNo)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Gender</span>
              <span style={{ fontWeight: 'bold' }}>: {formatGender(hawker.gender)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Date of Birth</span>
              <span style={{ fontWeight: 'bold' }}>: {safeDate(hawker.dob)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Father / Husband Name</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker.fatherHusbandName)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Address of Vending</span>
              <span style={{ fontWeight: 'bold', lineHeight: '1.1', width: '35mm' }}>: {safeStr(hawker.address)}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '1px' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Vending Product</span>
              <span style={{ fontWeight: 'bold', lineHeight: '1.1', width: '35mm' }}>: {safeStr(hawker.businessType)}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '1px' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Category of Vending</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker.locationType || 'Fixed')}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Timing of Vending</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker.businessTime)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Mobile Number</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker.mobileNumber)}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '1px' }}>
              <span style={{ fontWeight: 'bold', width: '23mm' }}>Valid Upto</span>
              <span style={{ fontWeight: 'bold' }}>: {safeDate(expiryDate)}</span>
            </div>
          </div>

          {/* Right Bottom Area: Photo & Signature */}
          <div style={{ width: '20mm', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', paddingBottom: '4px', zIndex: 10, flexShrink: 0 }}>
            {/* Hawker Name */}
            <div style={{ fontSize: '6px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.1', marginBottom: '2px', width: '22mm' }}>
              {safeStr(hawker.fullName)}
            </div>
            
            {/* Photo */}
            <div style={{ width: '18mm', height: '22mm', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '2px' }}>
              {photoUrl ? (
                <img src={photoUrl} alt="Hawker" style={{ width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center' }} />
              ) : (
                <span style={{ fontSize: '6px', color: '#64748b' }}>Photo</span>
              )}
            </div>
          </div>
        </div>

        {/* Commissioner Signature */}
        <div style={{ position: 'absolute', bottom: '2mm', left: '5mm', fontSize: '6.5px', fontWeight: 'bold', color: '#1e293b', zIndex: 10 }}>
          <div style={{ width: '15mm', height: '6mm', borderBottom: '1px solid #94a3b8', marginBottom: '1px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            {/* Signature scribble placeholder */}
            <svg viewBox="0 0 100 40" style={{ width: '12mm', height: '5mm', opacity: 0.4 }}>
              <path d="M10,25 C20,10 30,30 40,20 C50,10 60,35 70,15 C80,-5 90,30 95,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          Commissioner S.M.K.C.C
        </div>

        {/* QR Code */}
        {hawker.enrollmentNo && (
          <div style={{ position: 'absolute', bottom: '2mm', right: '35mm', zIndex: 10, backgroundColor: 'white', padding: '1px' }}>
            <QRCodeSVG 
              value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify/${hawker.enrollmentNo}`} 
              size={45} 
              level="M" 
              includeMargin={false}
            />
          </div>
        )}

      </div>
    </div>
  );
});

IDCard.displayName = 'IDCard';
