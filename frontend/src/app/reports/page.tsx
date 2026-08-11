'use client';

import React from 'react';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function ReportsPage() {
  const reportsList = [
    { id: 'master', title: 'Monthly Revenue Collection', desc: 'Summary of all license fees and penalties collected in the last month.' },
    { id: 'zone', title: 'Hawker Zone Distribution', desc: 'Analytics on hawker density across different municipal zones.' },
    { id: 'expiring', title: 'Expiring Licenses (Next 30 Days)', desc: 'List of all hawker licenses scheduled to expire shortly.' },
    { id: 'new', title: 'New Registrations', desc: 'Detailed report on new hawkers registered over the current fiscal year.' }
  ];

  const handleExport = (reportId: string, format: string) => {
    if (format === 'pdf') {
      // Import dynamically to avoid SSR issues if necessary, or just use require
      import('jspdf').then((jsPDFModule) => {
        const jsPDF = jsPDFModule.default;
        import('jspdf-autotable').then((autoTableModule) => {
          const autoTable = autoTableModule.default;
          const doc = new jsPDF();
          doc.setFontSize(18);
          doc.text(`Municipal Hawkers Report: ${reportId}`, 14, 22);
          doc.setFontSize(11);
          doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
          
          autoTable(doc, {
            startY: 40,
            head: [['ID', 'Name', 'Status', 'Date']],
            body: [
              ['101', 'Sample Entry 1', 'Active', '2026-08-01'],
              ['102', 'Sample Entry 2', 'Pending', '2026-08-05'],
              ['103', 'Sample Entry 3', 'Expired', '2026-08-10'],
            ],
          });
          
          doc.save(`${reportId}_report.pdf`);
        });
      });
    } else {
      // CSV format for both Excel and CSV options
      const content = `Report Name,Format,Date Generated\n${reportId},${format.toUpperCase()},${new Date().toLocaleDateString()}\n101,Sample Entry 1,Active\n102,Sample Entry 2,Pending\n`;
      
      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${reportId}_report.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((report) => (
          <Card key={report.id} className="flex flex-col h-full">
            <h3 className="text-lg font-medium text-slate-800 mb-2">{report.title}</h3>
            <p className="text-sm text-slate-600 flex-grow mb-4">{report.desc}</p>
            <div className="mt-auto flex flex-wrap gap-2">
              <button 
                onClick={() => handleExport(report.id, 'pdf')}
                className="flex items-center px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                PDF
              </button>
              <button 
                onClick={() => handleExport(report.id, 'excel')}
                className="flex items-center px-3 py-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-md font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel
              </button>
              <button 
                onClick={() => handleExport(report.id, 'csv')}
                className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
                CSV
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
