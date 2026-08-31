'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import HawkerDocuments from '@/components/hawkers/HawkerDocuments';

const HAWKER_FIELDS = [
  { name: 'licenseNumber', label: 'License Number', type: 'text', required: false, disabled: true },
  { name: 'aadharNo', label: 'Aadhar No', type: 'text', required: true },
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'fatherHusbandName', label: 'Father / Husband Name', type: 'text', required: true },
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

export default function EditHawkerPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHawker = async () => {
      try {
        const res = await fetch(`/api/hawkers/${id}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            const data = json.data;
            // Format date for input type="date"
            if (data.dob) {
              data.dob = data.dob.split('T')[0];
            }
            data.handicap = data.handicap ? 'Yes' : 'No';
            setFormData(data);
          }
        } else {
          setError('Failed to fetch hawker details');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchHawker();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/hawkers/${id}`, {
        method: 'PUT',
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
        if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(' ');
            throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to update hawker');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Hawkers', href: '/hawkers' },
        { label: 'Edit Hawker' }
      ]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Edit Hawker</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <Card>
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading hawker details...</div>
        ) : (
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
                      className="border border-slate-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none text-slate-700 text-sm"
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
                      disabled={field.disabled}
                      pattern={field.name === 'mobileNumber' ? '^\\d{10}$' : undefined}
                      title={field.name === 'mobileNumber' ? 'Mobile Number must be exactly 10 digits' : undefined}
                      max={field.type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
                      className="border border-slate-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none text-slate-700 text-sm disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.push('/hawkers')}
                className="px-4 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2.5 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 w-full sm:w-auto text-center"
              >
                {saving ? 'Saving...' : 'Update Hawker'}
              </button>
            </div>
          </form>
        )}
      </Card>
      
      {!loading && (
        <div className="mt-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Documents</h2>
          <HawkerDocuments hawkerId={id} isITAdmin={true} isDeptAdmin={true} />
        </div>
      )}
    </div>
  );
}
