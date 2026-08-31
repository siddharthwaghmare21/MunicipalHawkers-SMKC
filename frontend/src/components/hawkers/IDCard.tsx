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
  const safeStr = (val: any) => (val ? String(val) : '-');
  
  // Format Date: DD-MMM-YYYY (e.g., 29-Aug-1978)
  const formatAbbrDate = (val: any, isExpiryFallback = false) => {
    if (!val && !isExpiryFallback) return '-';
    let d: Date;
    if (val) {
      d = new Date(val);
      if (isNaN(d.getTime())) {
        if (isExpiryFallback) {
          const now = new Date();
          d = new Date(now.getFullYear() + 5, now.getMonth() + 1, 0);
        } else {
          return String(val);
        }
      }
    } else {
      const now = new Date();
      d = new Date(now.getFullYear() + 5, now.getMonth() + 1, 0);
    }
    const day = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };
  
  // Format Gender (M / F / Other)
  const formatGender = (gender: string) => {
    if (!gender) return '-';
    if (gender.toLowerCase().startsWith('m')) return 'M';
    if (gender.toLowerCase().startsWith('f')) return 'F';
    return gender;
  };

  const uniqueId = licenseNumber && licenseNumber !== 'LIC-PENDING' 
    ? licenseNumber 
    : (hawker?.activeLicenseNumber || hawker?.licenseNumber || '-');

  const resolvedPhotoUrl = photoUrl || hawker?.photoUrl || (() => {
    const docs = hawker?.documents;
    if (Array.isArray(docs)) {
      const photoDoc = docs.find((d: any) => {
        const typeName = (d.documentType?.name || d.documentTypeName || '').toLowerCase();
        const fileName = (d.originalFileName || d.fileName || '').toLowerCase();
        const contentType = (d.contentType || '').toLowerCase();
        const isImage = contentType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/i.test(fileName);
        return typeName.includes('photo') || typeName.includes('image') || isImage;
      });
      if (photoDoc) {
        if (photoDoc.filePath) {
          return photoDoc.filePath.startsWith('http') ? photoDoc.filePath : photoDoc.filePath;
        }
        return `/api/documents/download/${photoDoc.id}`;
      }
    }
    return '';
  })();

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
      
      {/* Bottom right geometric accent shapes */}
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40mm', height: '5mm', backgroundColor: '#1a2b56', zIndex: 0, clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 15% 0)' }}></div>
      <div style={{ position: 'absolute', bottom: 0, right: '30mm', width: '18mm', height: '3.5mm', backgroundColor: '#2293c6', zIndex: 0, clipPath: 'polygon(100% 0, 100% 100%, 0 100%, 20% 0)' }}></div>

      <div style={{ paddingLeft: '5mm', paddingRight: '2.5mm', paddingTop: '1.5mm', height: '100%', position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
        
        {/* Header Area: Logo on Left, Title in Middle, DAY-NULM on Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
          
          {/* Left: Official SMKC Emblem Logo */}
          <div style={{ width: '10.5mm', height: '10.5mm', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: '3px' }}>
            <img 
              src="/smkc-logo.png" 
              alt="SMKC Emblem" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
          </div>

          {/* Center Title */}
          <div style={{ flex: 1, paddingRight: '2px' }}>
            <div style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#c92027', lineHeight: '1.1', textTransform: 'uppercase', letterSpacing: '-0.2px' }}>
              SANGLI, MIRAJ & KUPWAD CITY CORPORATION, SANGLI
            </div>
            <div style={{ backgroundColor: '#e2e8f0', display: 'inline-block', padding: '0.5px 3px', marginTop: '1px' }}>
              <div style={{ fontSize: '6.5px', fontWeight: 'bold', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                TEMPORARY VENDOR IDENTITY
              </div>
            </div>
          </div>

          {/* Right Header: DAY-NULM */}
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <span style={{ fontSize: '8.5px', fontWeight: 'bold', color: '#2b4c8a', display: 'block', lineHeight: '1' }}>DAY-NULM</span>
            <span style={{ fontSize: '4px', color: '#475569', display: 'block', lineHeight: '1.1' }}>Deendayal Antyodaya Yojana-<br/>National Urban Livelihoods Mission</span>
          </div>
        </div>

        {/* Body Area: 11 Fields on Left, Photo + Name on Right */}
        <div style={{ display: 'flex', flex: 1, marginTop: '1px' }}>
          
          {/* Left: 11 Ordered Fields */}
          <div style={{ flex: 1, fontSize: '6px', lineHeight: '1.35', color: '#0f172a', paddingRight: '3px', zIndex: 10 }}>
            <div style={{ marginBottom: '1.5px' }}>
              <div style={{ fontWeight: 'bold', color: '#2b4c8a', textTransform: 'uppercase', fontSize: '5px', lineHeight: '1' }}>UNIQUE ID OF VENDOR</div>
              <div style={{ fontWeight: 'bold', fontSize: '7.5px', color: '#0f172a', lineHeight: '1.1' }}>{safeStr(uniqueId)}</div>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Aadhar No.</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker?.aadharNo)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Gender</span>
              <span style={{ fontWeight: 'bold' }}>: {formatGender(hawker?.gender)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Date of Birth</span>
              <span style={{ fontWeight: 'bold' }}>: {formatAbbrDate(hawker?.dob)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Father / Husband Name</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker?.fatherHusbandName)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Address of Vending</span>
              <span style={{ fontWeight: 'bold', lineHeight: '1.1', width: '36mm' }}>: {safeStr(hawker?.address)}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '0.5px' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Vending Product</span>
              <span style={{ fontWeight: 'bold', lineHeight: '1.1', width: '36mm' }}>: {safeStr(hawker?.businessType)}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '0.5px' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Category of Vending</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker?.locationType || 'Fixed')}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Timing of Vending</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker?.businessTime)}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Mobile Number</span>
              <span style={{ fontWeight: 'bold' }}>: {safeStr(hawker?.mobileNumber)}</span>
            </div>
            <div style={{ display: 'flex', marginTop: '0.5px' }}>
              <span style={{ fontWeight: 'bold', width: '22mm' }}>Valid Upto</span>
              <span style={{ fontWeight: 'bold' }}>: {formatAbbrDate(expiryDate || hawker?.licenseExpiryDate || hawker?.expiryDate || hawker?.licenses?.[0]?.expiryDate, true)}</span>
            </div>
          </div>

          {/* Right: Uploaded Photo on top, Full Name below it */}
          <div style={{ width: '19mm', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '1px', zIndex: 10, flexShrink: 0 }}>
            {/* Photo Box */}
            <div style={{ width: '17mm', height: '21mm', backgroundColor: '#e2e8f0', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', marginBottom: '2px', borderRadius: '2px' }}>
              {resolvedPhotoUrl ? (
                <img src={resolvedPhotoUrl} alt="Hawker" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
              ) : (
                <span style={{ fontSize: '6px', color: '#64748b' }}>Photo</span>
              )}
            </div>

            {/* Vendor Full Name Below Photo */}
            <div style={{ fontSize: '6px', fontWeight: 'bold', textAlign: 'center', lineHeight: '1.15', width: '21mm', color: '#0f172a' }}>
              {safeStr(hawker?.fullName)}
            </div>
          </div>
        </div>

        {/* Bottom Section: Signature on Left, QR Code on Right */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto', paddingBottom: '1.5mm', zIndex: 10 }}>
          
          {/* Deputy Commissioner Signature */}
          <div style={{ fontSize: '6px', fontWeight: 'bold', color: '#1e293b' }}>
            <div style={{ width: '18mm', height: '4.5mm', borderBottom: '1px solid #94a3b8', marginBottom: '1px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <svg viewBox="0 0 100 40" style={{ width: '14mm', height: '4mm', opacity: 0.45 }}>
                <path d="M10,25 C20,10 30,30 40,20 C50,10 60,35 70,15 C80,-5 90,30 95,20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            Deputy Commissioner S.M.K.C.C
          </div>

          {/* Verification QR Code */}
          {uniqueId && uniqueId !== '-' && (
            <div style={{ backgroundColor: 'white', padding: '1px', borderRadius: '2px', marginRight: '8mm' }}>
              <QRCodeSVG 
                value={`${process.env.NEXT_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://municipal-hawkers-smkc.vercel.app')}/verify?licenseNumber=${encodeURIComponent(uniqueId)}`}
                size={34} 
                level="M" 
                includeMargin={false}
              />
            </div>
          )}

        </div>

      </div>
    </div>
  );
});

IDCard.displayName = 'IDCard';
