'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

export default function RenewLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [license, setLicense] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expiryDate, setExpiryDate] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [status, setStatus] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    async function fetchLicense() {
      try {
        const res = await fetch(`/api/licenses/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch license details');
        }
        const json = await res.json();
        if (json.data) {
          setLicense(json.data);
          
          const baseDate = json.data.expiryDate ? new Date(json.data.expiryDate) : new Date();
          baseDate.setFullYear(baseDate.getFullYear() + 5);
          setExpiryDate(baseDate.toISOString().split('T')[0]);
          setLicenseType(json.data.licenseType || 'Standard');
          setStatus(json.data.status || 'Active');
        } else {
          setError('License not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching license');
      } finally {
        setLoading(false);
      }
    }
    fetchLicense();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to renew this license? This will log a historical record.')) {
      return;
    }

    try {
      const payload = {
        licenseId: id,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        licenseType,
        status,
        remarks
      };

      const res = await fetch('/api/renewals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat().join(' ');
            throw new Error(errorMessages);
        }
        throw new Error(errorData.message || errorData.error || 'Failed to renew license');
      }

      router.push(`/licenses/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to submit renewal');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>;
  }

  if (error && !license) {
    return <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Licenses', href: '/licenses' },
        { label: 'View License', href: `/licenses/${id}` },
        { label: 'Renew' }
      ]} />
      
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Renew License</h1>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Card>
        <div className="mb-6 bg-slate-50 p-4 rounded-md border border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Current License Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-500">Hawker Name</p>
              <p className="font-medium text-slate-800">{license.hawkerId || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">License Number</p>
              <p className="font-medium text-slate-800">{license.licenseNumber}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Existing Expiry Date</p>
              <p className="font-medium text-slate-800">
                {license.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">New Expiry Date</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">License Type</label>
              <select
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
              >
                <option value="Standard">Standard</option>
                <option value="Temporary">Temporary</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Status</label>
              <select
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Remarks</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add any remarks for this renewal..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push(`/licenses/${id}`)}
              className="px-4 py-2.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none w-full sm:w-auto text-center"
            >
              Confirm Renewal
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
