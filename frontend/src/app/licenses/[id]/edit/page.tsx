'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { getCookie } from 'cookies-next';

export default function EditLicensePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const [formData, setFormData] = useState({
    hawkerId: '',
    licenseType: 'Food',
    status: 'Pending',
    licenseNumber: '',
    issueDate: '',
    expiryDate: '',
    remarks: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLicense = async () => {
      try {
        const res = await fetch(`/api/licenses/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const l = json.data;
            setFormData({
              hawkerId: l.hawkerId || '',
              licenseType: l.licenseType || 'Food',
              status: l.status || 'Pending',
              licenseNumber: l.licenseNumber || '',
              issueDate: l.issueDate ? new Date(l.issueDate).toISOString().split('T')[0] : '',
              expiryDate: l.expiryDate ? new Date(l.expiryDate).toISOString().split('T')[0] : '',
              remarks: l.remarks || '',
            });
          }
        } else {
          setError('Failed to load license details');
        }
      } catch (err) {
        setError('Error fetching license details');
      } finally {
        setFetching(false);
      }
    };

    fetchLicense();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const token = getCookie('token');

    try {
      const res = await fetch(`/api/licenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push('/licenses');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update license');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Licenses', href: '/licenses' },
        { label: 'Edit License' }
      ]} />
      
      <h1 className="text-2xl font-bold text-slate-800">Edit License</h1>

      <Card>
        {fetching ? (
          <div className="py-8 text-center text-slate-500">Loading...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <input type="hidden" name="hawkerId" value={formData.hawkerId} />
              
              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-700">License Number *</label>
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleChange}
                  required
                  className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-700">License Type *</label>
                <select
                  name="licenseType"
                  value={formData.licenseType}
                  onChange={handleChange}
                  required
                  className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Food">Food</option>
                  <option value="Merchandise">Merchandise</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-700">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Expired">Expired</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-700">Issue Date *</label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleChange}
                  required
                  className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-700">Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-col space-y-1 md:col-span-2">
                <label className="text-sm font-medium text-slate-700">Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  rows={3}
                  className="border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 shadow-sm"
              >
                {loading ? 'Saving...' : 'Update License'}
              </button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
