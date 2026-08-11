"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function MasterHawkerReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports/master?page=${page}&pageSize=${pageSize}&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setData(json.data.items);
          setTotalCount(json.data.totalCount);
          setTotalPages(Math.ceil(json.data.totalCount / pageSize));
        }
      }
    } catch (error) {
      console.error('Failed to fetch report data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchReportData();
  };

  // Pre-fetch all data for exports if user wants all records, but for now we export what is in the API
  const fetchAllForExport = async () => {
    try {
      // Fetch up to 10000 records for export to avoid massive payloads, or the user can just export current filtered page. Let's fetch a large page for the current search filter.
      const res = await fetch(`/api/reports/master?page=1&pageSize=10000&search=${encodeURIComponent(search)}`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data.items;
        }
      }
    } catch (err) {
      console.error(err);
    }
    return data; // fallback to current page data
  };

  const generateExportData = (exportData: any[]) => {
    return exportData.map(item => ({
      'Enrollment No': item.enrollmentNo || '-',
      'Full Name': item.fullName || '-',
      'Address': item.address || '-',
      'Gender': item.gender || '-',
      'DOB': item.dob ? new Date(item.dob).toLocaleDateString() : '-',
      'Mobile Number': item.mobileNumber || '-',
      'Handicap': item.handicapStatus || '-',
      'ULB Name': item.ulbName || '-',
      'Ward Name': item.wardName || '-',
      'Road Name': item.roadName || '-',
      'Land Mark': item.landMark || '-',
      'Area Type': item.areaType || '-',
      'Business Type': item.businessType || '-',
      'Business Time': item.businessTime || '-',
      'Location Type': item.locationType || '-',
      'Partner Dependency': item.partnerDependancy || '-',
      'Hawker Status': item.hawkerStatus || '-',
      'License Number': item.licenseNumber || '-',
      'License Issue': item.licenseIssueDate ? new Date(item.licenseIssueDate).toLocaleDateString() : '-',
      'License Expiry': item.licenseExpiryDate ? new Date(item.licenseExpiryDate).toLocaleDateString() : '-',
      'License Status': item.licenseStatus || '-'
    }));
  };

  const exportCSV = async () => {
    const fullData = await fetchAllForExport();
    const formattedData = generateExportData(fullData);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Master_Hawker_Report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportExcel = async () => {
    const fullData = await fetchAllForExport();
    const formattedData = generateExportData(fullData);
    const worksheet = XLSX.utils.json_to_sheet(formattedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hawkers");
    XLSX.writeFile(workbook, `Master_Hawker_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = async () => {
    const fullData = await fetchAllForExport();
    const formattedData = generateExportData(fullData);
    const doc = new jsPDF('landscape', 'pt', 'a4');
    
    // Extract headers and data
    const headers = Object.keys(formattedData[0] || {});
    // Select a subset of important columns for PDF to fit in landscape A4, else it will be unreadable
    const pdfHeaders = ['Enrollment No', 'Full Name', 'Mobile Number', 'Ward Name', 'Business Type', 'Hawker Status', 'License Number', 'License Status'];
    
    const rows = formattedData.map(row => pdfHeaders.map(header => row[header as keyof typeof row] || '-'));

    doc.text("Master Hawker Report", 40, 40);
    
    autoTable(doc, {
      head: [pdfHeaders],
      body: rows,
      startY: 60,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] } // blue-500
    });

    doc.save(`Master_Hawker_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Master Hawker Report' }]} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">Master Hawker Report</h1>
        
        <div className="flex flex-wrap gap-2">
          <button onClick={fetchReportData} className="px-3 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-200 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Refresh
          </button>
          <button onClick={exportCSV} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center">
            CSV
          </button>
          <button onClick={exportExcel} className="px-3 py-2 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-md hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center">
            Excel
          </button>
          <button onClick={exportPDF} className="px-3 py-2 bg-red-50 text-red-700 text-sm font-medium rounded-md hover:bg-red-100 border border-red-200 transition-colors flex items-center">
            PDF
          </button>
          <button onClick={handlePrint} className="px-3 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-100 border border-blue-200 transition-colors flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print
          </button>
        </div>
      </div>

      <Card className="print:shadow-none print:border-none">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
          <form onSubmit={handleSearch} className="w-full md:w-96 flex">
            <input 
              type="text" 
              placeholder="Search by Enrollment No or Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-l-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm px-4 py-2 border"
            />
            <button type="submit" className="bg-brand-primary text-white px-4 py-2 rounded-r-md hover:bg-brand-primary-dark">
              Search
            </button>
          </form>
          <div className="text-sm text-slate-500">
            Showing {data.length} of {totalCount} records
          </div>
        </div>

        <div className="overflow-x-auto w-full print:overflow-visible">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 print:bg-transparent">
              <tr>
                <th className="px-4 py-3">Enrollment No</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Gender / DOB</th>
                <th className="px-4 py-3">Mobile Number</th>
                <th className="px-4 py-3">Ward & Address</th>
                <th className="px-4 py-3">Business Details</th>
                <th className="px-4 py-3">License Info</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading report data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 print:break-inside-avoid">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.enrollmentNo || '-'}</td>
                  <td className="px-4 py-3">{item.fullName}</td>
                  <td className="px-4 py-3">
                    <div>{item.gender || '-'}</div>
                    <div className="text-xs text-slate-500">{item.dob ? new Date(item.dob).toLocaleDateString() : '-'}</div>
                  </td>
                  <td className="px-4 py-3">{item.mobileNumber || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700">{item.wardName || '-'}</div>
                    <div className="text-xs text-slate-500 truncate max-w-[200px]" title={item.address}>{item.address || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div>{item.businessType || '-'}</div>
                    <div className="text-xs text-slate-500">{item.areaType || '-'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {item.licenseNumber ? (
                      <>
                        <div className="font-medium text-brand-primary">{item.licenseNumber}</div>
                        <div className="text-xs text-slate-500">
                           Exp: {item.licenseExpiryDate ? new Date(item.licenseExpiryDate).toLocaleDateString() : '-'}
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-400 italic">No License</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={item.hawkerStatus === 'Active' ? 'success' : item.hawkerStatus === 'Pending' ? 'warning' : 'danger'}>
                      {item.hawkerStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination - hidden in print mode */}
        {!loading && totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="text-sm text-slate-500">
              Page {page} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

