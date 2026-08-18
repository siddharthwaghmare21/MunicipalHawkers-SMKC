import React from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { RejectButton } from '@/components/RejectButton';
import { Badge } from '@/components/Badge';
import HawkerDocuments from '@/components/hawkers/HawkerDocuments';
import { IDCardActions } from '@/components/hawkers/IDCardActions';
import { HawkerQRCode } from '@/components/hawkers/HawkerQRCode';

const HAWKER_FIELDS = [
  { name: 'enrollmentNo', label: 'Enrollment No' },
  { name: 'aadharNo', label: 'Aadhar No' },
  { name: 'fullName', label: 'Full Name' },
  { name: 'fatherHusbandName', label: 'Father / Husband Name' },
  { name: 'address', label: 'Address' },
  { name: 'gender', label: 'Gender' },
  { name: 'dob', label: 'Date of Birth', type: 'date' },
  { name: 'mobileNumber', label: 'Mobile Number' },
  { name: 'handicap', label: 'Handicap', type: 'boolean' },
  { name: 'ulbName', label: 'ULB Name' },
  { name: 'wardName', label: 'Ward Name' },
  { name: 'roadName', label: 'Road Name' },
  { name: 'landMark', label: 'Land Mark' },
  { name: 'areaType', label: 'Area Type' },
  { name: 'businessType', label: 'Business Type' },
  { name: 'businessTime', label: 'Business Time' },
  { name: 'locationType', label: 'Location Type' },
  { name: 'partnerDependancy', label: 'Partner Dependancy' }
];

export default async function ViewHawkerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  let hawker: any = null;
  let error = '';

  try {
    const res = await fetch(`http://localhost:5109/api/hawkers/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      cache: 'no-store'
    });
    
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        hawker = json.data;
      }
    } else {
      error = 'Failed to fetch hawker details';
    }
  } catch (err: any) {
    console.error('Error fetching hawker:', err);
    error = 'An error occurred while fetching data';
  }

  const formatValue = (value: any, type?: string) => {
    if (value === null || value === undefined) return 'N/A';
    if (type === 'date') {
      return new Date(value).toLocaleDateString();
    }
    if (type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    return String(value);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: 'Home', href: '/dashboard' }, 
        { label: 'Hawkers', href: '/hawkers' },
        { label: 'View Hawker' }
      ]} />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-slate-800">Hawker Details</h1>
        <div className="flex flex-wrap gap-3">
          <IDCardActions hawker={hawker} />
          {hawker?.status !== 'Rejected' && (
            <RejectButton entityId={id} entityType="hawkers" />
          )}
          <Link
            href={`/hawkers/${id}/edit`}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm"
          >
            Edit Hawker
          </Link>
          <Link
            href="/hawkers"
            className="px-4 py-2 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Back to List
          </Link>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          {error}
        </div>
      ) : hawker ? (
        <>
          {hawker.status === 'Rejected' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6">
              <div className="flex items-center mb-2">
                <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <h3 className="text-lg font-bold text-red-800">Hawker Rejected</h3>
              </div>
              <div className="text-sm text-red-700 grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div><span className="font-semibold">Reason:</span> {hawker.rejectionReason || 'N/A'}</div>
                <div><span className="font-semibold">Remarks:</span> {hawker.remarks || 'N/A'}</div>
                <div><span className="font-semibold">Rejected By:</span> {hawker.rejectedBy || 'N/A'}</div>
                <div><span className="font-semibold">Date:</span> {hawker.rejectedDate ? new Date(hawker.rejectedDate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {HAWKER_FIELDS.map((field) => (
                    <div key={field.name} className="flex flex-col space-y-1 pb-4 border-b border-slate-100 last:border-0 md:border-0">
                      <span className="text-sm font-medium text-slate-500">{field.label}</span>
                      <span className="text-slate-800 font-medium">
                        {formatValue(hawker[field.name], field.type)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <HawkerQRCode enrollmentNo={hawker.enrollmentNo} />
            </div>
          </div>
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Documents</h2>
            <HawkerDocuments hawkerId={id} isITAdmin={true} isDeptAdmin={true} hideUploadForm={true} />
          </div>
        </>
      ) : (
        <Card>
          <div className="p-8 text-center text-slate-500">No hawker details found.</div>
        </Card>
      )}
    </div>
  );
}
