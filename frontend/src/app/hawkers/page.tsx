import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';

export default async function HawkersPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; zone?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const search = searchParams.search || '';
  const zone = searchParams.zone || '';
  const status = searchParams.status || '';
  
  const token = cookies().get('token')?.value;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('pageSize', '10');
  if (search) queryParams.append('search', search);
  if (zone) queryParams.append('zone', zone);
  if (status) queryParams.append('status', status);

  let data = { items: [], totalCount: 0, page: 1, pageSize: 10 };
  
  try {
    const res = await fetch(`http://localhost:5109/api/hawkers?${queryParams.toString()}`, {
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
        <Link href="/hawkers/add" className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium shadow-sm block text-center">
          + Add New Hawker
        </Link>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row justify-between mb-4 space-y-3 md:space-y-0">
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
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm outline-none"
            />
            <button type="submit" className="absolute left-3 top-2.5">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>
          <div className="flex space-x-2">
            <form method="GET" className="flex space-x-2">
              <input type="hidden" name="search" value={search} />
              <select 
                name="zone" 
                defaultValue={zone} 
                onChange={(e) => e.target.form?.submit()}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
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
                onChange={(e) => e.target.form?.submit()}
                className="border border-slate-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none text-slate-700"
              >
                <option value="">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Rejected">Rejected</option>
              </select>
            </form>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Zone</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No hawkers found.</td>
                </tr>
              ) : items.map((hawker: any) => (
                <tr key={hawker.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-blue-600">{hawker.enrollmentNo || hawker.id}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{hawker.fullName}</td>
                  <td className="px-4 py-3 text-slate-600">{hawker.mobileNumber}</td>
                  <td className="px-4 py-3 text-slate-600">{hawker.zone || 'N/A'}</td>
                  <td className="px-4 py-3 text-slate-600">{hawker.businessType}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/hawkers/${hawker.id}`} className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-3">View</Link>
                    <Link href={`/hawkers/${hawker.id}/edit`} className="text-slate-500 hover:text-slate-700 font-medium text-sm">Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {totalCount > 0 && (
          <div className="flex items-center justify-between mt-4">
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
