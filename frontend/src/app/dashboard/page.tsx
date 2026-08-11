import React from 'react';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import Link from 'next/link';
import { Badge } from '@/components/Badge';
import { cookies } from 'next/headers';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let stats = {
    totalHawkers: 0,
    activeLicenses: 0,
    pendingLicenses: 0,
    rejectedHawkers: 0,
    expiredLicenses: 0,
    renewedLicenses: 0,
    pendingRenewals: 0,
    recentlyAddedHawkers: [] as any[],
    recentlyRenewedHawkers: [] as any[]
  };

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109';

  try {
    const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (res.ok) {
      stats = await res.json();
    }
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
  }

  const summaryCards = [
    { title: 'Total Hawkers', value: stats.totalHawkers, color: 'border-blue-500' },
    { title: 'Active Licenses', value: stats.activeLicenses, color: 'border-green-500' },
    { title: 'Pending Licenses', value: stats.pendingLicenses, color: 'border-amber-500' },
    { title: 'Rejected Hawkers', value: stats.rejectedHawkers, color: 'border-red-500' },
    { title: 'Expired Licenses', value: stats.expiredLicenses, color: 'border-red-700' },
    { title: 'Renewed Licenses', value: stats.renewedLicenses, color: 'border-emerald-500' },
    { title: 'Pending Renewals', value: stats.pendingRenewals, color: 'border-orange-500' },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home' }, { label: 'Dashboard' }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map((card, idx) => (
          <div key={idx} className={`bg-white rounded-lg shadow-sm border-l-4 ${card.color} p-4 flex flex-col justify-between`}>
            <p className="text-sm text-slate-500 font-medium">{card.title}</p>
            <p className="text-2xl font-bold text-slate-800 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Recently Added Hawkers">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">ID / Enrollment No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Mobile</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentlyAddedHawkers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No recent hawkers found.
                      </td>
                    </tr>
                  ) : stats.recentlyAddedHawkers.map((hawker: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-blue-600">
                         {hawker.enrollmentNo || `HWK-${hawker.id}`}
                      </td>
                      <td className="px-4 py-3 text-slate-800">{hawker.fullName}</td>
                      <td className="px-4 py-3 text-slate-600">{hawker.mobileNumber || '-'}</td>
                      <td className="px-4 py-3">
                        <Badge variant={hawker.status === 'Active' ? 'success' : hawker.status === 'Pending' ? 'warning' : 'danger'}>
                          {hawker.status || 'Unknown'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <Card title="Recently Renewed Licenses">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                  <tr>
                    <th className="px-4 py-3">License No</th>
                    <th className="px-4 py-3">Hawker Name</th>
                    <th className="px-4 py-3">Renewal Date</th>
                    <th className="px-4 py-3">New Expiry</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentlyRenewedHawkers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                        No recent renewals found.
                      </td>
                    </tr>
                  ) : stats.recentlyRenewedHawkers.map((renewal: any, idx: number) => (
                    <tr key={idx} className="border-b border-slate-100">
                      <td className="px-4 py-3 font-medium text-blue-600">{renewal.licenseNumber}</td>
                      <td className="px-4 py-3 text-slate-800">{renewal.hawkerName}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(renewal.renewalDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-slate-600">{new Date(renewal.expiryDate).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="flex flex-col space-y-3">
              <Link href="/hawkers/new" className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add New Hawker
              </Link>
              <Link href="/hawkers" className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                View Hawkers
              </Link>
              <Link href="/licenses?filter=renewals" className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 mr-3 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                Renewals
              </Link>
              <Link href="/reports" className="flex items-center p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors text-slate-700 font-medium text-sm">
                <svg className="w-5 h-5 mr-3 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Reports
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
