'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function ReportsPage() {
  const reportsList = [
    { id: 'master', title: 'Master Hawker List', desc: 'Comprehensive directory of all registered and verified hawkers.', href: '/reports/master' },
    { id: 'zone', title: 'Hawker Zone Distribution', desc: 'Analytics on hawker density across different municipal zones and wards.' },
    { id: 'expiring', title: 'Expiring Licenses (Next 30 Days)', desc: 'List of all hawker licenses scheduled to expire shortly.', href: '/reports/renewed' },
    { id: 'new', title: 'New Registrations', desc: 'Detailed report on new hawkers registered over the current fiscal year.' },
    { id: 'pending', title: 'Pending Approvals', desc: 'List of hawker applications and documents waiting for admin verification.' },
    { id: 'category', title: 'Vending Category Distribution', desc: 'Breakdown of what hawkers are selling (e.g., Food, Vegetables, Goods).' },
    { id: 'audit', title: 'System Audit Logs', desc: 'Detailed logs of admin actions, approvals, and rejections for accountability.', href: '/audit-logs' }
  ];

  const handleExport = async (reportId: string, format: string) => {
    if (format === 'pdf' || format === 'print') {
      const { generateProfessionalPDF } = await import('@/utils/pdfGenerator');
      const reportTitle = reportsList.find(r => r.id === reportId)?.title || reportId;
      
      await generateProfessionalPDF({
        reportId,
        reportTitle,
        headers: [['ID', 'Name', 'Status', 'Date']],
        body: [
          ['101', 'Sample Entry 1', 'Active', '2026-08-01'],
          ['102', 'Sample Entry 2', 'Pending', '2026-08-05'],
          ['103', 'Sample Entry 3', 'Expired', '2026-08-10'],
        ],
        orientation: 'p',
        autoPrint: format === 'print'
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
              {report.href && (
                <Link
                  href={report.href}
                  className="flex items-center px-3 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-md font-medium text-sm transition-colors"
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  View Report
                </Link>
              )}
              <button 
                onClick={() => handleExport(report.id, 'print')}
                className="flex items-center px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md font-medium text-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Print
              </button>
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
