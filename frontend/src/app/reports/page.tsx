import React from 'react';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function ReportsPage() {
  const reportsList = [
    { title: 'Monthly Revenue Collection', desc: 'Summary of all license fees and penalties collected in the last month.' },
    { title: 'Hawker Zone Distribution', desc: 'Analytics on hawker density across different municipal zones.' },
    { title: 'Expiring Licenses (Next 30 Days)', desc: 'List of all hawker licenses scheduled to expire shortly.' },
    { title: 'New Registrations', desc: 'Detailed report on new hawkers registered over the current fiscal year.' }
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports' }]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Reports & Analytics</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportsList.map((report, idx) => (
          <Card key={idx} className="flex flex-col h-full">
            <h3 className="text-lg font-medium text-slate-800 mb-2">{report.title}</h3>
            <p className="text-sm text-slate-600 flex-grow mb-4">{report.desc}</p>
            <div className="mt-auto">
              <button className="flex items-center text-red-600 hover:text-red-800 font-medium text-sm transition-colors">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Export PDF
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
