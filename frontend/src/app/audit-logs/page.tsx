import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

interface AuditLog {
  id: number;
  userId: number | null;
  username: string | null;
  action: string;
  entityName: string | null;
  entityId: string | null;
  details: string;
  timestamp: string;
}

export default async function AuditLogsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const page = parseInt((searchParams.page as string) || '1');
  const pageSize = 15;
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('pageSize', pageSize.toString());

  let data = { items: [], totalCount: 0, page: 1, pageSize };
  let errorMsg = '';
  
  try {
    const res = await fetch(`http://localhost:5109/api/auditlogs?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (res.status === 401 || res.status === 403) {
      errorMsg = 'You are not authorized to view this page. IT_ADMIN role is required.';
    } else if (res.ok) {
      const json = await res.json();
      if (json.data) {
        data = json.data;
      }
    } else {
      errorMsg = 'Failed to fetch audit logs.';
    }
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    errorMsg = 'An error occurred while fetching audit logs.';
  }

  const { items, totalCount } = data;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Audit Logs' }]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Audit Logs</h1>
      </div>

      {errorMsg ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{errorMsg}</span>
        </div>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No audit logs found.</td>
                  </tr>
                ) : items.map((log: AuditLog) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                      {log.username || 'System'} {log.userId && <span className="text-xs text-slate-400 font-normal ml-1">(ID: {log.userId})</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-brand-primary-dark">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {log.entityName} {log.entityId && <span className="text-slate-400">#{log.entityId}</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-600 break-words max-w-sm">
                      {log.details}
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
                  href={`?page=${Math.max(1, page - 1)}`}
                  className={`px-3 py-1 border border-slate-300 rounded text-sm ${page === 1 ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  Prev
                </Link>
                <span className="px-3 py-1 bg-slate-100 border border-slate-300 rounded text-sm text-slate-600">
                  {page} / {Math.max(1, totalPages)}
                </span>
                <Link 
                  href={`?page=${Math.min(totalPages, page + 1)}`}
                  className={`px-3 py-1 border border-slate-300 rounded text-sm ${page >= totalPages ? 'text-slate-300 pointer-events-none' : 'text-slate-500 hover:bg-slate-50'}`}
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

