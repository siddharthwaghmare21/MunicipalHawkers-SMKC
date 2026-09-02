'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';

export default function RenewLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);

  const [license, setLicense] = useState<any>(null);
  const [hawker, setHawker] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [expiryDate, setExpiryDate] = useState('');
  const [licenseType, setLicenseType] = useState('Standard');
  const [status, setStatus] = useState('Active');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchLicenseAndHawker() {
      try {
        const res = await fetch(`/api/licenses/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch license details');
        }
        const json = await res.json();
        if (json.data) {
          const lic = json.data;
          setLicense(lic);
          
          // Calculate EXACTLY +5 years from Current Expiry Date
          const baseDate = lic.expiryDate ? new Date(lic.expiryDate) : new Date();
          baseDate.setFullYear(baseDate.getFullYear() + 5);
          setExpiryDate(baseDate.toISOString().split('T')[0]);
          setLicenseType(lic.licenseType || 'Standard');
          setStatus(lic.status || 'Active');

          if (lic.hawkerId) {
            try {
              const hawkerRes = await fetch(`/api/hawkers/${lic.hawkerId}`);
              if (hawkerRes.ok) {
                const hawkerJson = await hawkerRes.json();
                if (hawkerJson.data) {
                  setHawker(hawkerJson.data);
                }
              }
            } catch (hErr) {
              console.warn('Could not load detailed hawker data:', hErr);
            }
          }
        } else {
          setError('License not found');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching license');
      } finally {
        setLoading(false);
      }
    }
    fetchLicenseAndHawker();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!window.confirm('Are you sure you want to process this 5-Year hawker license renewal? This will log an immutable historical record.')) {
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        licenseId: parseInt(id, 10),
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
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading renewal details...</div>;
  }

  if (error && !license) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 m-6">
        {error}
      </div>
    );
  }

  const hawkerName = hawker?.fullName || license?.hawkerName || 'N/A';
  const aadharNo = hawker?.aadharNo || 'N/A';
  const mobileNumber = hawker?.mobileNumber || 'N/A';
  const address = hawker?.address || 'N/A';
  const businessType = hawker?.businessType || 'N/A';
  const wardName = hawker?.wardName || 'N/A';
  const currentLicenseNumber = license?.licenseNumber || hawker?.licenseNumber || 'N/A';
  const currentExpiryFormatted = license?.expiryDate ? new Date(license.expiryDate).toLocaleDateString() : 'N/A';

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Hawkers', href: '/hawkers' },
        { label: 'View License', href: `/licenses/${id}` },
        { label: 'Renew License' }
      ]} />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hawker License Renewal (5-Year Extension)</h1>
          <p className="text-sm text-slate-500 mt-1">Extends validity by exactly 5 years from the current license expiry date.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Card>
        {/* Read-Only Hawker & Current License Summary */}
        <div className="mb-8 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Read-Only Existing Record
            </h2>
            <Badge variant="default">Permanent License Identity</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Full Name</span>
              <span className="font-semibold text-slate-800 text-base">{hawkerName}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">License Number</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2.5 py-1 rounded border border-slate-200 inline-block mt-0.5">
                {currentLicenseNumber}
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Aadhaar Number</span>
              <span className="font-medium text-slate-800">{aadharNo}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Mobile Number</span>
              <span className="font-medium text-slate-800">{mobileNumber}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Ward / Location</span>
              <span className="font-medium text-slate-800">{wardName}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Business Type</span>
              <span className="font-medium text-slate-800">{businessType}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Address</span>
              <span className="font-medium text-slate-800 truncate block max-w-xs">{address}</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block uppercase tracking-wider">Current Expiry Date</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                {currentExpiryFormatted}
              </span>
            </div>
          </div>
        </div>

        {/* Editable Renewal Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-2">
            Renewal Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                New Expiry Date (Enforced +5 Years)
              </label>
              <input
                type="date"
                required
                readOnly
                className="w-full px-3 py-2.5 border border-slate-300 bg-slate-100 font-semibold text-slate-800 rounded-md shadow-sm cursor-not-allowed sm:text-sm"
                value={expiryDate}
              />
              <span className="text-xs text-slate-500 block">
                Calculated strictly as Current Expiry Date ({currentExpiryFormatted}) + 5 Years.
              </span>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">License Category/Type</label>
              <select
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                value={licenseType}
                onChange={(e) => setLicenseType(e.target.value)}
              >
                <option value="Standard">Standard</option>
                <option value="Temporary">Temporary</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">License Status</label>
              <select
                className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm bg-white"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Active">Active</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Renewal Remarks / Notes</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter official renewal remarks or reference notes..."
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => router.push(`/licenses/${id}`)}
              className="px-5 py-2.5 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none transition-colors disabled:opacity-50 w-full sm:w-auto text-center"
            >
              {submitting ? 'Processing Renewal...' : 'Submit 5-Year License Renewal'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
