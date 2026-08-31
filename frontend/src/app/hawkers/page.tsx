import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HawkersPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = parseInt((searchParams.page as string) || '1');
  const search = (searchParams.search as string) || '';
  const zone = (searchParams.zone as string) || '';
  const status = (searchParams.status as string) || '';
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('pageSize', '10');
  if (search) queryParams.append('search', search);
  if (zone) queryParams.append('zone', zone);
  if (status) queryParams.append('status', status);

  let data = { items: [], totalCount: 0, page: 1, pageSize: 10 };
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}/api/hawkers?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        data = json.data;
      }
    }
  } catch (error) {
    console.error('Error fetching hawkers:', error);
  }

  const { items, totalCount, pageSize } = data;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Hawkers' }]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Hawkers Management</h1>
        <Link href="/hawkers/add" className="bg-brand-primary text-white px-4 py-2 rounded-md hover:bg-brand-primary-dark transition-colors text-sm font-medium shadow-sm block text-center">
          + Add New Hawker
        </Link>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-3 md:space-y-0 gap-2">
          <form className="relative w-full md:w-64" method="GET">
            <input 
              type="hidden"
              name="zone"
              value={zone}
            />
            <input 
              type="hidden"
              name="status"
              value={status}
            />
            <input 
              type="text" 
              name="search"
              defaultValue={search}
              placeholder="Search hawkers..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-primary focus:border-brand-primary text-sm outline-none"
            />
            <button type="submit" className="absolute left-3 top-2.5">
              <i className="bi bi-search text-slate-400"></i>
            </button>
          </form>
          <div className="w-full md:w-auto">
            <form method="GET" className="flex flex-col sm:flex-row gap-2">
              <input type="hidden" name="search" value={search} />
              <select 
                name="zone" 
                defaultValue={zone} 
                className="w-full sm:w-auto border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700"
              >
                <option value="">All Zones</option>
                <option value="Zone A">Zone A</option>
                <option value="Zone B">Zone B</option>
                <option value="Zone C">Zone C</option>
                <option value="Zone D">Zone D</option>
              </select>
              <select 
                name="status" 
                defaultValue={status} 
                className="w-full sm:w-auto border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand-primary outline-none text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Rejected">Rejected</option>
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
                <th className="px-4 py-3 text-center">ID</th>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Mobile</th>
                <th className="px-4 py-3 text-center">Zone</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hawkers found.</td>
                </tr>
              ) : items.map((hawker: any) => (
                <tr key={hawker.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-brand-primary text-center">{hawker.licenseNumber || hawker.id}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium text-center">{hawker.fullName}</td>
                  <td className="px-4 py-3 text-slate-600 text-center">{hawker.mobileNumber}</td>
                  <td className="px-4 py-3 text-slate-600 text-center">{hawker.zone || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600 text-center">{hawker.businessType}</td>
                  <td className="px-4 py-3 flex justify-center space-x-3 items-center h-full">
                    <Link href={`/hawkers/${hawker.id}`} className="relative group text-lg hover:scale-110 transition-transform grayscale hover:grayscale-0">
                      <span>👁️</span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">View</span>
                    </Link>
                    <Link href={`/hawkers/${hawker.id}/edit`} className="relative group text-lg hover:scale-110 transition-transform grayscale hover:grayscale-0">
                      <span>✏️</span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">Edit</span>
                    </Link>

                    {hawker.activeLicenseId ? (
                      <Link href={`/licenses/${hawker.activeLicenseId}/renew`} className="relative group text-lg hover:scale-110 transition-transform grayscale hover:grayscale-0">
                        <span>🔄</span>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">Renew</span>
                      </Link>
                    ) : (
                      <div className="relative group text-lg grayscale opacity-50 cursor-not-allowed">
                        <span>🔄</span>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">No License</span>
                      </div>
                    )}
                    <button className="relative group text-lg hover:scale-110 transition-transform grayscale hover:grayscale-0 cursor-pointer">
                      <span>❌</span>
                      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-10">Reject</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalCount > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-3">
            <span className="text-sm text-slate-500">Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} entries</span>
            <div className="flex space-x-1">
              <Link 
                href={`?page=${Math.max(1, page - 1)}${search ? `&search=${search}` : ''}${zone ? `&zone=${zone}` : ''}${status ? `&status=${status}` : ''}`}
                className={`px-3 py-1 border border-slate-300 rounded text-sm ${page === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Prev
              </Link>
              <span className="px-3 py-1 bg-slate-100 border border-slate-300 rounded text-sm text-slate-600">
                {page} / {Math.max(1, totalPages)}
              </span>
              <Link 
                href={`?page=${Math.min(totalPages, page + 1)}${search ? `&search=${search}` : ''}${zone ? `&zone=${zone}` : ''}${status ? `&status=${status}` : ''}`}
                className={`px-3 py-1 border border-slate-300 rounded text-sm ${page >= totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Next
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
