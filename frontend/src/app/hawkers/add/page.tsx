'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { IDCard } from '@/components/hawkers/IDCard';

const HAWKER_FIELDS = [
  { name: 'enrollmentNo', label: 'Enrollment No', type: 'text', required: true },
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
  { name: 'partnerDependancy', label: 'Partner Dependancy', type: 'text', required: true },
  { name: 'licenseExpiryDate', label: 'License Expiry Date', type: 'date', required: true }
];

const getDefaultExpiryDate = () => {
  const date = new Date();
  const targetDate = new Date(date.getFullYear() + 5, date.getMonth() + 1, 0);
  return targetDate.toISOString().split('T')[0];
};

const DOCUMENT_TYPES = [
    { id: 1, name: "Aadhar Card" },
    { id: 2, name: "Photo" },
    { id: 3, name: "PAN Card" },
    { id: 4, name: "Voter ID" },
    { id: 5, name: "Ration Card" }
];

interface PendingDocument {
  docTypeId: number;
  docTypeName: string;
  file: File;
}

export default function AddHawkerPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Record<string, string>>({
    gender: 'Male',
    handicap: 'No',
    licenseExpiryDate: getDefaultExpiryDate()
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string>('');

  // Document state
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [selectedDocType, setSelectedDocType] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docError, setDocError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAddDocument = () => {
    setDocError('');
    if (!selectedDocType || !selectedFile) {
      setDocError('Please select a document type and a file.');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setDocError('Invalid file type. Only PDF, JPG, and PNG are allowed.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setDocError('File size exceeds the 5MB limit.');
      return;
    }

    const docTypeInfo = DOCUMENT_TYPES.find(d => d.id === parseInt(selectedDocType));
    if (!docTypeInfo) return;

    // Check if doc type already added
    if (pendingDocuments.some(doc => doc.docTypeId === docTypeInfo.id)) {
       setDocError(`${docTypeInfo.name} has already been added.`);
       return;
    }

    setPendingDocuments(prev => [
      ...prev,
      {
        docTypeId: docTypeInfo.id,
        docTypeName: docTypeInfo.name,
        file: selectedFile
      }
    ]);

    // Reset selection
    setSelectedDocType('');
    setSelectedFile(null);
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const removePendingDocument = (index: number) => {
    setPendingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDocError('');
    setError('');
    
    // Create an object URL for the photo if it exists
    const photoDoc = pendingDocuments.find(d => d.docTypeName === 'Photo');
    if (photoDoc) {
      setPreviewPhotoUrl(URL.createObjectURL(photoDoc.file));
    } else {
      setPreviewPhotoUrl('');
    }
    
    setShowModal(true);
  };

  const confirmSave = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Create Hawker
      const res = await fetch('/api/hawkers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          handicap: formData.handicap === 'Yes'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.errors) {
            const errorMessages = Object.values(data.errors).flat().join(' ');
            throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Failed to create hawker');
      }

      const hawkerResponse = await res.json();
      const newHawkerId = hawkerResponse.data?.id;

      if (!newHawkerId) {
        throw new Error('Hawker created but ID was not returned');
      }

      // 2. Upload Pending Documents
      const uploadPromises = pendingDocuments.map(async (doc) => {
        const docFormData = new FormData();
        docFormData.append("HawkerId", newHawkerId.toString());
        docFormData.append("DocumentTypeId", doc.docTypeId.toString());
        docFormData.append("File", doc.file);

        const uploadRes = await fetch("/api/documents/upload", {
            method: "POST",
            body: docFormData, 
        });

        if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${doc.docTypeName}`);
        }
      });

      const uploadResults = await Promise.allSettled(uploadPromises);
      const hasErrors = uploadResults.some(r => r.status === 'rejected');

      if (hasErrors) {
        // Redirect to edit page so they can retry failed docs
        router.push(`/hawkers/${newHawkerId}`);
        router.refresh();
      } else {
        // All good
        router.refresh();
        router.push('/hawkers');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setShowModal(false);
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
                    pattern={field.name === 'mobileNumber' ? '^\\d{10}$' : field.name === 'enrollmentNo' ? '^SMKC-.*' : field.name === 'aadharNo' ? '^\\d{12}$' : undefined}
                    title={field.name === 'mobileNumber' ? 'Mobile Number must be exactly 10 digits' : field.name === 'enrollmentNo' ? "Enrollment Number must start with 'SMKC-'" : field.name === 'aadharNo' ? 'Aadhar Number must be exactly 12 digits' : undefined}
                    max={field.type === 'date' && field.name !== 'licenseExpiryDate' ? new Date().toISOString().split('T')[0] : undefined}
                    className="border border-slate-300 rounded-md px-3 py-2.5 focus:ring-2 focus:ring-red-500 outline-none text-slate-700 text-sm"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="pt-6 border-t border-slate-200 mt-6">
             <h2 className="text-lg font-semibold text-slate-800 mb-4">Initial Documents (Optional)</h2>
             
             {docError && (
                 <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded border border-red-200">
                     {docError}
                 </div>
             )}

             <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="flex flex-col space-y-1 flex-1">
                    <label className="text-sm font-medium text-slate-700">Document Type</label>
                    <select
                        value={selectedDocType}
                        onChange={(e) => setSelectedDocType(e.target.value)}
                        className="border border-slate-300 rounded-md px-3 py-2.5 outline-none focus:ring-2 focus:ring-red-500 text-sm"
                    >
                        <option value="">Select Document</option>
                        {DOCUMENT_TYPES.map((type) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col space-y-1 flex-1">
                    <label className="text-sm font-medium text-slate-700">File (PDF, JPG, PNG up to 5MB)</label>
                    <input
                        type="file"
                        id="fileInput"
                        onChange={handleFileChange}
                        accept=".pdf, .jpg, .jpeg, .png"
                        className="border border-slate-300 bg-white rounded-md px-3 py-1.5 text-sm file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleAddDocument}
                    className="px-4 py-2.5 bg-slate-800 text-white rounded-md text-sm font-medium hover:bg-slate-700 transition-colors h-[42px] w-full md:w-auto"
                >
                    Add Document
                </button>
             </div>

             {pendingDocuments.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                   <table className="w-full text-sm text-left">
                       <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                           <tr>
                               <th className="px-4 py-3 text-center">Document Type</th>
                               <th className="px-4 py-3 text-center">File Name</th>
                               <th className="px-4 py-3 text-center">Size</th>
                               <th className="px-4 py-3 text-center">Actions</th>
                           </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-200">
                           {pendingDocuments.map((doc, i) => (
                               <tr key={i} className="hover:bg-slate-50/50">
                                   <td className="px-4 py-3 font-medium text-slate-800 text-center">{doc.docTypeName}</td>
                                   <td className="px-4 py-3 text-slate-600 truncate max-w-[200px] text-center">{doc.file.name}</td>
                                   <td className="px-4 py-3 text-slate-500 text-center">{(doc.file.size / 1024 / 1024).toFixed(2)} MB</td>
                                   <td className="px-4 py-3 text-center">
                                       <button 
                                           type="button" 
                                           onClick={() => removePendingDocument(i)}
                                           className="text-red-600 hover:text-red-800 font-medium"
                                       >
                                           Remove
                                       </button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>
                </div>
             )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-200 mt-8">
            <button
              type="button"
              onClick={() => router.push('/hawkers')}
              className="px-4 py-2.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50 transition-colors text-sm font-medium w-full sm:w-auto text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-red-600 text-white px-4 py-2.5 rounded-md hover:bg-red-700 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 w-full sm:w-auto text-center"
            >
              {loading ? 'Saving...' : 'Save Hawker'}
            </button>
          </div>
        </form>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900" id="modal-title">
                Review ID Card Preview
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Please verify that the details below are correct before confirming. This is a preview of the physical ID card.
              </p>
            </div>
            
            {/* Modal Body (Scrollable) */}
            <div className="px-6 py-6 overflow-y-auto bg-slate-50 flex-1 flex flex-col items-center justify-center min-h-[300px]">
              <div className="shadow-lg rounded-lg overflow-hidden border border-slate-200">
                <IDCard 
                  hawker={formData}
                  photoUrl={previewPhotoUrl}
                  licenseNumber="LIC-PENDING"
                  issueDate={new Date().toISOString()}
                  expiryDate={formData.licenseExpiryDate}
                />
              </div>
            </div>

            {/* Modal Footer (Pinned) */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex-shrink-0 flex flex-col sm:flex-row justify-end gap-3">
              <button
                type="button"
                disabled={loading}
                onClick={() => setShowModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-colors"
              >
                Cancel & Edit
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={confirmSave}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Generating...' : 'Confirm & Generate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

