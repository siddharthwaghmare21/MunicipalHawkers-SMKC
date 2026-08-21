'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function RejectButton({ 
  entityId, 
  entityType 
}: { 
  entityId: string | number; 
  entityType: 'hawkers' | 'licenses' 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleReject = async () => {
    if (!reason.trim()) {
      setError('Rejection reason is required.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1] || '';
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}/api/${entityType}/${entityId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejectionReason: reason,
          remarks: remarks
        })
      });

      if (res.ok) {
        setIsOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to reject.');
      }
    } catch (err: any) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
      >
        Reject
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Reject {entityType === 'hawkers' ? 'Hawker' : 'License'}</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="e.g. Invalid documents"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Remarks
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={3}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setIsOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 border border-slate-300 rounded text-slate-700 hover:bg-slate-50 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center"
                >
                  {loading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
