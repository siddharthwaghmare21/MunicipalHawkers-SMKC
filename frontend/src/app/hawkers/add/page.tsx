'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';

const HAWKER_FIELDS = [
  { name: 'enrollmentNo', label: 'Enrollment No', type: 'text', required: true },
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'address', label: 'Address', type: 'text', required: true },
  { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
  { name: 'dob', label: 'Date of Birth', type: 'date', required: true },
  { name: 'mobileNumber', label: 'Mobile Number', type: 'text', required: true },
  { name: 'handicap', label: 'Handicap', type: 'select', options: ['No', 'Yes'], required: true },
  { name: 'ulbName', label: 'ULB Name', type: 'text', required: true },
  { name: 'wardName', label: 'Ward Name', type: 'text', required: true },
  { name: 'roadName', label: 'Road Name', type: 'text', required: true },
  { name: 'landMark', label: 'Land Mark', type: 'text', required: true },
  { name: 'areaType', label: 'Area Type', type: 'text', required: true },
  { name: 'businessType', label: 'Business Type', type: 'text', required: true },
  { name: 'businessTime', label: 'Business Time', type: 'text', required: true },
  { name: 'locationType', label: 'Location Type', type: 'text', required: true },
  { name: 'partnerDependancy', label: 'Partner Dependancy', type: 'text', required: true }
];

export default function AddHawkerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({
    gender: 'Male',
    handicap: 'No'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/hawkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          handicap: formData.handicap === 'Yes'
        })
      });

      if (res.ok) {
        router.push('/hawkers');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create hawker');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Hawkers', href: '/hawkers' },
        { label: 'Add New' }
      ]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Add New Hawker</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HAWKER_FIELDS.map((field) => (
              <div key={field.name} className="flex flex-col space-y-1">
                <label className="text-sm font-medium text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'select' ? (
                  <select
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-slate-700 text-sm"
                  >
                    {field.options?.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ''}
                    onChange={handleChange}
                    required={field.required}
                    className="border border-slate-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none text-slate-700 text-sm"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => router.push('/hawkers')}
              className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Hawker'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
