import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; status?: string };
}) {
  const token = cookies().get('token')?.value;
  const page = searchParams.page || '1';
  const search = searchParams.search || '';
  const status = searchParams.status || '';

  const queryParams = new URLSearchParams({
    page,
    pageSize: '10',
    ...(search && { search }),
    ...(status && { status }),
  });

  let licenses: any[] = [];
  let error = '';
  let totalCount = 0;

  try {
    const res = await fetch(`http://localhost:5109/api/licenses?${queryParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        licenses = json.data.items || [];
        totalCount = json.data.totalCount || 0;
      }
    } else {
      error = 'Failed to fetch licenses';
    }
  } catch (err) {
    console.error('Error fetching licenses:', err);
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
      <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Licenses' }]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">License Management</h1>
        <Link 
          href="/licenses/add" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
        >
          Issue New License
        </Link>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      ) : (
        <Card>
          <div className="flex flex-col md:flex-row justify-between mb-4 space-y-3 md:space-y-0">
            <form className="relative w-full md:w-64" method="GET">
              <input 
                type="hidden"
                name="status"
                value={status}
              />
              <input 
                type="text" 
                name="search"
                defaultValue={search}
                placeholder="Search licenses..." 
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm outline-none"
              />
              <button type="submit" className="absolute left-3 top-2.5">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            <div className="flex space-x-2">
              <form method="GET" className="flex space-x-2">
                <input type="hidden" name="search" value={search} />
                <select 
                  name="status" 
                  defaultValue={status} 
                  onChange={(e) => e.target.form?.submit()}
                  className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-700"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
              </form>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">License No</th>
                  <th className="px-4 py-3">License Type</th>
                  <th className="px-4 py-3">Hawker ID</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.length > 0 ? (
                  licenses.map((lic: any, idx: number) => (
                    <tr key={lic.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-blue-600">{lic.licenseNumber}</td>
                      <td className="px-4 py-3 text-slate-800">{lic.licenseType}</td>
                      <td className="px-4 py-3 text-slate-800">{lic.hawkerId}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {lic.issueDate ? new Date(lic.issueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={getStatusVariant(lic.status)}>
                          {lic.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-right space-x-3">
                        <Link href={`/licenses/${lic.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">View</Link>
                        <Link href={`/licenses/${lic.id}/edit`} className="text-blue-600 hover:text-blue-800 font-medium text-sm">Edit</Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No licenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {totalCount > 0 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-slate-500">Showing {(parseInt(page) - 1) * 10 + 1} to {Math.min(parseInt(page) * 10, totalCount)} of {totalCount} entries</span>
              <div className="flex space-x-1">
                <Link 
                  href={`?page=${Math.max(1, parseInt(page) - 1)}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                  className={`px-3 py-1 border border-slate-300 rounded text-sm ${parseInt(page) === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Prev
                </Link>
                <span className="px-3 py-1 bg-slate-100 border border-slate-300 rounded text-sm text-slate-600">
                  {page} / {Math.max(1, Math.ceil(totalCount / 10))}
                </span>
                <Link 
                  href={`?page=${Math.min(Math.ceil(totalCount / 10), parseInt(page) + 1)}${search ? `&search=${search}` : ''}${status ? `&status=${status}` : ''}`}
                  className={`px-3 py-1 border border-slate-300 rounded text-sm ${parseInt(page) >= Math.ceil(totalCount / 10) ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
