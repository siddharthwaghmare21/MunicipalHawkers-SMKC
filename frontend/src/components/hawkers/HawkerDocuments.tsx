"use client";

import { useState, useEffect } from "react";

interface HawkerDocumentsProps {
    hawkerId: string | number;
    isITAdmin: boolean;
    isDeptAdmin: boolean;
    hideUploadForm?: boolean;
}

export default function HawkerDocuments({ hawkerId, isITAdmin, isDeptAdmin, hideUploadForm = false }: HawkerDocumentsProps) {
    const [documents, setDocuments] = useState<any[]>([]);
    const [documentTypes, setDocumentTypes] = useState([
        { id: 1, name: "Aadhar Card" },
        { id: 2, name: "Photo" },
        { id: 3, name: "PAN Card" },
        { id: 4, name: "Voter ID" },
        { id: 5, name: "Ration Card" }
    ]); // TODO: Fetch from API if we expose it, otherwise hardcode for now
    
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [selectedDocType, setSelectedDocType] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    
    // Verification state
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [verifyDocId, setVerifyDocId] = useState<number | null>(null);
    const [verifyStatus, setVerifyStatus] = useState("Verified");
    const [verifyRemarks, setVerifyRemarks] = useState("");

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/documents/hawker/${hawkerId}`);
            if (!res.ok) throw new Error("Failed to fetch documents");
            const json = await res.json();
            const docsArray = json.data ? json.data : (Array.isArray(json) ? json : []);
            setDocuments(docsArray);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchDocTypes = async () => {
            try {
                const res = await fetch('/api/documents/types');
                if (res.ok) {
                    const json = await res.json();
                    const list = json.data || (Array.isArray(json) ? json : []);
                    if (Array.isArray(list) && list.length > 0) {
                        setDocumentTypes(list);
                    }
                }
            } catch (e) {
                console.error("Failed to fetch doc types", e);
            }
        };

        fetchDocTypes();
        if (hawkerId) {
            fetchDocuments();
        }
    }, [hawkerId]);

    const handleFileChange = (e: any) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleUpload = async (e: any) => {
        e.preventDefault();
        if (!selectedDocType || !selectedFile) {
            setError("Please select a document type and file.");
            return;
        }

        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(selectedFile.type)) {
            setError("Invalid file type. Only PDF, JPG, and PNG are allowed.");
            return;
        }

        if (selectedFile.size > 5 * 1024 * 1024) {
            setError("File size exceeds the 5MB limit.");
            return;
        }

        try {
            setUploading(true);
            setError(null);
            
            const formData = new FormData();
            formData.append("HawkerId", hawkerId.toString());
            formData.append("DocumentTypeId", selectedDocType);
            formData.append("File", selectedFile);

            const res = await fetch("/api/documents/upload", {
                method: "POST",
                body: formData, // Do not set Content-Type, browser will set multipart/form-data with boundary
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Upload failed");
            }

            setSuccessMessage("Document uploaded successfully.");
            setSelectedFile(null);
            setSelectedDocType("");
            // Reset file input
            (document.getElementById("fileInput") as HTMLInputElement).value = "";
            fetchDocuments();
            
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this document?")) return;

        try {
            const res = await fetch(`/api/documents/${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Failed to delete");
            }
            fetchDocuments();
        } catch (err: any) {
            alert(err.message);
        }
    };
    
    const handleDownload = (id: number, filename: string) => {
        // Redirecting to download endpoint to let browser handle the download response
        window.open(`/api/documents/download/${id}`, "_blank");
    };

    const handleQuickApprove = async (docId: number) => {
        try {
            const res = await fetch(`/api/documents/${docId}/verify`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "Verified",
                    remarks: ""
                })
            });
            if (!res.ok) throw new Error("Verification failed");
            fetchDocuments();
            setSuccessMessage("Document approved.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const openVerifyModal = (docId: number) => {
        setVerifyDocId(docId);
        setVerifyStatus("Verified");
        setVerifyRemarks("");
        setVerifyModalOpen(true);
    };

    const handleVerify = async (e: any) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/documents/${verifyDocId}/verify`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: verifyStatus,
                    remarks: verifyRemarks
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "Verification failed");
            }

            setVerifyModalOpen(false);
            fetchDocuments();
            setSuccessMessage("Document verification updated.");
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (loading) return <div className="p-4">Loading documents...</div>;

    const canManage = isITAdmin || isDeptAdmin;

    return (
        <div className="p-4 space-y-6">
            
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-md">{error}</div>}
            {successMessage && <div className="bg-green-50 text-green-600 p-3 rounded-md">{successMessage}</div>}
            
            {/* Upload Section */}
            {canManage && !hideUploadForm && (
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                    <h3 className="text-lg font-semibold mb-4 text-gray-800">Upload New Document</h3>
                    <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Document Type</label>
                            <select 
                                className="w-full border rounded-md p-2 focus:ring-2 focus:ring-brand-primary"
                                value={selectedDocType}
                                onChange={(e) => setSelectedDocType(e.target.value)}
                                required
                            >
                                <option value="">-- Select Type --</option>
                                {documentTypes.map(dt => (
                                    <option key={dt.id} value={dt.id}>{dt.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                            <input 
                                id="fileInput"
                                type="file" 
                                className="w-full border rounded-md p-2"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,.pdf"
                                required
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <button 
                                type="submit" 
                                disabled={uploading}
                                className="w-full md:w-auto bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary-dark disabled:opacity-50"
                            >
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </form>
                    <p className="text-xs text-gray-500 mt-2">Allowed: jpg, jpeg, png, pdf. Max size: 5MB</p>
                </div>
            )}

            {/* Document List */}
            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">Uploaded Documents</h3>
                    <span className="bg-blue-100 text-brand-primary-dark px-3 py-1 rounded-full text-xs font-medium">
                        {documents.length} Documents
                    </span>
                </div>
                {documents.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                        No documents uploaded yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {documents.map(doc => (
                                    <tr key={doc.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {doc.documentTypeName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {doc.originalFileName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {(doc.fileSize / 1024).toFixed(2)} KB
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${doc.status === 'Verified' ? 'bg-green-100 text-green-800' : 
                                                  doc.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                                                  'bg-yellow-100 text-yellow-800'}`}>
                                                {doc.status}
                                            </span>
                                            {doc.remarks && (
                                                <p className="text-xs text-gray-500 mt-1" title={doc.remarks}>
                                                    {doc.remarks.length > 20 ? doc.remarks.substring(0, 20) + '...' : doc.remarks}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(doc.uploadDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button 
                                                onClick={() => handleDownload(doc.id, doc.originalFileName)}
                                                className="text-brand-primary hover:text-blue-900"
                                            >
                                                Download
                                            </button>
                                            
                                            {canManage && (
                                                <>
                                                    {doc.status !== 'Verified' && (
                                                        <>
                                                            <span className="text-gray-300">|</span>
                                                            <button 
                                                                onClick={() => handleQuickApprove(doc.id)}
                                                                className="text-emerald-600 hover:text-emerald-900 font-medium"
                                                                title="Instantly Approve"
                                                            >
                                                                Approve
                                                            </button>
                                                        </>
                                                    )}
                                                    <span className="text-gray-300">|</span>
                                                    <button 
                                                        onClick={() => {
                                                            openVerifyModal(doc.id);
                                                            // We can just rely on the modal for rejecting
                                                        }}
                                                        className="text-amber-600 hover:text-amber-900"
                                                        title="Review / Reject"
                                                    >
                                                        Review
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button 
                                                        onClick={() => handleDelete(doc.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Verify Modal */}
            {verifyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Verify Document</h3>
                        <form onSubmit={handleVerify}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-brand-primary"
                                    value={verifyStatus}
                                    onChange={(e) => setVerifyStatus(e.target.value)}
                                >
                                    <option value="Verified">Verify (Approve)</option>
                                    <option value="Rejected">Reject</option>
                                    <option value="Pending">Pending</option>
                                </select>
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                                <textarea 
                                    className="w-full border rounded-md p-2 focus:ring-2 focus:ring-brand-primary"
                                    rows={3}
                                    value={verifyRemarks}
                                    onChange={(e) => setVerifyRemarks(e.target.value)}
                                    placeholder="Enter remarks or reason for rejection..."
                                    required={verifyStatus === 'Rejected'}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setVerifyModalOpen(false)}
                                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="px-4 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-primary-dark"
                                >
                                    Save Verification
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


