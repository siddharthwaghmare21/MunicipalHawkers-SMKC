import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const fetchLogoAsBase64 = async (): Promise<string> => {
  try {
    const response = await fetch('/smkc-logo.png');
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Failed to load logo for PDF', e);
    return '';
  }
};

interface ReportOptions {
  reportId: string;
  reportTitle: string;
  headers: string[][];
  body: any[][];
  orientation?: 'p' | 'portrait' | 'l' | 'landscape';
  autoPrint?: boolean;
}

export const generateProfessionalPDF = async (options: ReportOptions) => {
  const { reportId, reportTitle, headers, body, orientation = 'p', autoPrint = false } = options;
  
  const doc = new jsPDF(orientation, 'pt', 'a4');
  const logoBase64 = await fetchLogoAsBase64();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const reportNumber = `Hawkers-SMKC-${reportId.toUpperCase()}-Report${Math.floor(Math.random() * 900) + 100}`;
  
  autoTable(doc, {
    head: headers,
    body: body,
    startY: 120, // Start below the header
    styles: { fontSize: 9 },
    headStyles: { fillColor: [44, 62, 80] }, // Professional dark blue/slate
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { top: 120, bottom: 60 },
    
    // Header & Footer hooks
    didDrawPage: (data) => {
      // --- HEADER ---
      // Draw Logo
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 40, 30, 50, 50);
      }
      
      // Municipal Corporation Name
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(33, 37, 41);
      doc.text('SANGLI, MIRAJ & KUPWAD CITY CORPORATION, SANGLI', 100, 50);
      
      // Sub Header (DAY-NULM & Report Title)
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(73, 80, 87);
      doc.text('DAY-NULM - Municipal Hawkers Management', 100, 65);
      
      // Document Title
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(41, 128, 185); // Blue title
      doc.text(reportTitle, 100, 85);
      
      // Draw line below header
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(1);
      doc.line(40, 100, pageWidth - 40, 100);
      
      // --- FOOTER ---
      const footerY = pageHeight - 40;
      doc.setDrawColor(200, 200, 200);
      doc.line(40, footerY - 10, pageWidth - 40, footerY - 10);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      
      // Left side: Report Number and Date
      const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      doc.text(`${reportNumber} | Generated: ${dateStr}`, 40, footerY);
      
      // Right side: Page X of Y
      const str = `Page ${data.pageNumber}`;
      doc.text(str, pageWidth - 40 - doc.getTextWidth(str), footerY);
    }
  });

  if (autoPrint) {
    doc.autoPrint();
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(blobUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        URL.revokeObjectURL(blobUrl);
      };
    }
  } else {
    doc.save(`${reportNumber}.pdf`);
  }
};
