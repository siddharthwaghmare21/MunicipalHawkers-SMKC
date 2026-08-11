import React from 'react';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function DocumentsPage() {
  const mockDocs = [
    { name: 'Aadhar Card_Ramesh.pdf', type: 'PDF', size: '1.2 MB', date: '10 Aug 2026' },
    { name: 'Photo_Sita.jpg', type: 'Image', size: '450 KB', date: '08 Aug 2026' },
    { name: 'NOC_ZoneB.pdf', type: 'PDF', size: '2.1 MB', date: '01 Aug 2026' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Documents' }]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Document Management</h1>
        <button className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium shadow-sm">
          Upload Document
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3">File Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Upload Date</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDocs.map((doc, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    {doc.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{doc.type}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.size}</td>
                  <td className="px-4 py-3 text-slate-600">{doc.date}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-brand-primary hover:text-brand-primary-dark font-medium text-sm mr-3">Download</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

