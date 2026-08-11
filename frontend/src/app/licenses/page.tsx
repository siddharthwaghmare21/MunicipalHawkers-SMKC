import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';

export default async function LicensesPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  const page = (searchParams.page as string) || '1';
  const search = (searchParams.search as string) || '';
  const status = (searchParams.status as string) || '';

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
      case 'Pending': return 'default';
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
          className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark transition-colors text-sm font-medium shadow-sm"
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
          <div className="flex flex-col md:flex-row justify-between mb-4 space-y-3 md:space-y-0 gap-2">
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
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm outline-none"
              />
              <button type="submit" className="absolute left-3 top-2.5">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </button>
            </form>
            <div className="w-full md:w-auto">
              <form method="GET" className="flex flex-col sm:flex-row gap-2">
                <input type="hidden" name="search" value={search} />
                <select 
                  name="status" 
                  defaultValue={status} 
                  className="w-full sm:w-auto border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Expired">Expired</option>
                </select>
                <button type="submit" className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Filter
                </button>
              </form>
            </div>
          </div>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-center">License No</th>
                  <th className="px-4 py-3 text-center">License Type</th>
                  <th className="px-4 py-3 text-center">Hawker ID</th>
                  <th className="px-4 py-3 text-center">Issue Date</th>
                  <th className="px-4 py-3 text-center">Expiry Date</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {licenses.length > 0 ? (
                  licenses.map((lic: any, idx: number) => (
                    <tr key={lic.id || idx} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-brand-primary text-center">{lic.licenseNumber}</td>
                      <td className="px-4 py-3 text-slate-800 text-center">{lic.licenseType}</td>
                      <td className="px-4 py-3 text-slate-800 text-center">{lic.hawkerId}</td>
                      <td className="px-4 py-3 text-slate-600 text-center">
                        {lic.issueDate ? new Date(lic.issueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-center">
                        {lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Badge variant={getStatusVariant(lic.status)}>
                          {lic.status || 'Unknown'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 flex justify-center space-x-3 items-center h-full">
                        <Link href={`/licenses/${lic.id}`} className="relative group text-lg hover:scale-110 transition-transform grayscale hover:grayscale-0">
                          <span>👁️</span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">View</span>
                        </Link>
                        <Link href={`/licenses/${lic.id}/edit`} className="relative group text-lg hover:scale-110 transition-transform grayscale hover:grayscale-0">
                          <span>✏️</span>
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">Edit</span>
                        </Link>
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
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
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

