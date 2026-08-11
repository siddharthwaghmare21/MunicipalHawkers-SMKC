import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';
import { RejectButton } from '@/components/RejectButton';

export default async function ViewLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  let license: any = null;
  let renewals: any[] = [];
  let error = '';

  try {
    const res = await fetch(`http://localhost:5109/api/licenses/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        license = json.data;
      }
    } else {
      error = 'Failed to fetch license details';
    }

    const renewalsRes = await fetch(`http://localhost:5109/api/renewals/license/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });

    if (renewalsRes.ok) {
      const json = await renewalsRes.json();
      if (json.data) {
        renewals = json.data;
      }
    }
  } catch (err: any) {
    console.error('Error fetching license:', err);
    error = 'An error occurred while fetching data';
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Expired': return 'warning';
      case 'Pending': return 'info';
      case 'Rejected':
      case 'Cancelled':
      case 'Suspended': return 'danger';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Licenses', href: '/licenses' },
        { label: 'View License' }
      ]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">License Details</h1>
        <div className="flex space-x-3">
          {license?.status !== 'Rejected' && (
            <RejectButton entityId={id} entityType="licenses" />
          )}
          <Link
            href={`/licenses/${id}/renew`}
            className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium shadow-sm"
          >
            Renew License
          </Link>
          <Link
            href={`/licenses/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            Edit License
          </Link>
          <Link
            href="/licenses"
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Back to List
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      ) : license ? (
        <>
          {license.status === 'Rejected' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="text-lg font-bold text-red-800">License Rejected</h3>
              </div>
              <div className="text-sm text-red-700 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div><span className="font-semibold">Reason:</span> {license.rejectionReason || 'N/A'}</div>
                <div><span className="font-semibold">Remarks:</span> {license.remarks || 'N/A'}</div>
                <div><span className="font-semibold">Rejected By:</span> {license.rejectedBy || 'N/A'}</div>
                <div><span className="font-semibold">Date:</span> {license.rejectedDate ? new Date(license.rejectedDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          )}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0">
                <span className="text-sm font-medium text-slate-500">License Number</span>
                <span className="text-slate-800 font-medium text-lg">{license.licenseNumber || 'N/A'}</span>
              </div>
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0">
                <span className="text-sm font-medium text-slate-500">License Type</span>
                <span className="text-slate-800 font-medium">{license.licenseType || 'N/A'}</span>
              </div>
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0">
                <span className="text-sm font-medium text-slate-500">Status</span>
                <div>
                  <Badge variant={getStatusVariant(license.status)}>
                    {license.status || 'Unknown'}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0">
                <span className="text-sm font-medium text-slate-500">Issue Date</span>
                <span className="text-slate-800 font-medium">
                  {license.issueDate ? new Date(license.issueDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0">
                <span className="text-sm font-medium text-slate-500">Expiry Date</span>
                <span className="text-slate-800 font-medium">
                  {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0">
                <span className="text-sm font-medium text-slate-500">Hawker ID</span>
                <span className="text-slate-800 font-medium">
                  {license.hawkerId ? (
                    <Link href={`/hawkers/${license.hawkerId}`} className="text-blue-600 hover:underline">
                      {license.hawkerId}
                    </Link>
                  ) : 'N/A'}
                </span>
              </div>
              <div className="flex flex-col space-y-1 pb-4 border-b border-slate-100 md:border-0 md:col-span-2 lg:col-span-3">
                <span className="text-sm font-medium text-slate-500">Remarks</span>
                <span className="text-slate-800">{license.remarks || 'No remarks provided.'}</span>
              </div>
            </div>
          </Card>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Renewal History</h2>
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                    <tr>
                      <th className="px-4 py-3">Renewal Date</th>
                      <th className="px-4 py-3">New Expiry Date</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Renewed By</th>
                      <th className="px-4 py-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {renewals.length > 0 ? (
                      renewals.map((r: any) => (
                        <tr key={r.id} className="border-b border-slate-100">
                          <td className="px-4 py-3">{new Date(r.renewalDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3 font-medium">{new Date(r.expiryDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">
                            <Badge variant={getStatusVariant(r.status)}>{r.status}</Badge>
                          </td>
                          <td className="px-4 py-3">{r.username || 'N/A'}</td>
                          <td className="px-4 py-3 text-slate-500">{r.remarks || '-'}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                          No renewal history found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      ) : (
        <Card>
          <div className="p-8 text-center text-slate-500">No license details found.</div>
        </Card>
      )}
    </div>
  );
}
