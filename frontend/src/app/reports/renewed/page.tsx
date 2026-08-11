'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Breadcrumb } from '@/components/Breadcrumb';
import { Badge } from '@/components/Badge';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RenewedHawkerReportDto {
  id: number;
  hawkerId: number;
  name: string;
  businessName: string;
  businessType: string;
  renewDate: string;
  expiryDate: string;
}

export default function RenewedHawkersReportPage() {
  const [data, setData] = useState<RenewedHawkerReportDto[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [businessType, setBusinessType] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      });

      if (search) query.append('search', search);
      if (fromDate) query.append('fromDate', fromDate);
      if (toDate) query.append('toDate', toDate);
      if (businessType) query.append('businessType', businessType);

      const res = await fetch(`/api/reports/renewed?${query.toString()}`);
      
      if (res.ok) {
        const json = await res.json();
        setData(json.items || []);
        setTotalPages(json.totalPages || 1);
        setTotalCount(json.totalCount || 0);
      }
    } catch (error) {
      console.error('Error fetching renewed hawkers report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [page]); // Re-fetch only when page changes. Search/Filter needs explicit submit.

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (page === 1) {
      fetchReportData();
    } else {
      setPage(1); // will trigger useEffect
    }
  };

  const exportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'Name': item.name,
      'Business Name': item.businessName,
      'Business Type': item.businessType,
      'Renew Date': new Date(item.renewDate).toLocaleDateString(),
      'Expiry Date': new Date(item.expiryDate).toLocaleDateString(),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Renewed Hawkers");
    XLSX.writeFile(wb, `Renewed_Hawkers_Report_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.map(item => ({
      'Name': item.name,
      'Business Name': item.businessName,
      'Business Type': item.businessType,
      'Renew Date': new Date(item.renewDate).toLocaleDateString(),
      'Expiry Date': new Date(item.expiryDate).toLocaleDateString(),
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Renewed Hawkers");
    XLSX.writeFile(wb, `Renewed_Hawkers_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const doc = new jsPDF('p', 'pt', 'a4');
    
    const pdfHeaders = ['Name', 'Business Name', 'Business Type', 'Renew Date', 'Expiry Date'];
    const rows = data.map(item => [
      item.name,
      item.businessName || '-',
      item.businessType || '-',
      new Date(item.renewDate).toLocaleDateString(),
      new Date(item.expiryDate).toLocaleDateString()
    ]);

    doc.text("Renewed Hawker Details Report", 40, 40);
    
    autoTable(doc, {
      head: [pdfHeaders],
      body: rows,
      startY: 60,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`Renewed_Hawkers_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <Breadcrumb items={[{ label: 'Home', href: '/dashboard' }, { label: 'Reports', href: '/reports' }, { label: 'Renewed Hawkers Report' }]} />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
        <h1 className="text-2xl font-bold text-slate-800">Renewed Hawkers Report</h1>
        
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
        <div className="flex flex-col mb-6 gap-4 print:hidden">
          <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">Search Name / Business</label>
              <input 
                type="text" 
                placeholder="Search..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm px-4 py-2 border"
              />
            </div>
            
            <div className="w-40">
              <label className="block text-xs font-medium text-slate-500 mb-1">From Date (Renewal)</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm px-4 py-2 border"
              />
            </div>

            <div className="w-40">
              <label className="block text-xs font-medium text-slate-500 mb-1">To Date (Renewal)</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm px-4 py-2 border"
              />
            </div>

            <div className="w-48">
              <label className="block text-xs font-medium text-slate-500 mb-1">Business Type</label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary sm:text-sm px-4 py-2 border bg-white"
              >
                <option value="">All Types</option>
                <option value="Food">Food</option>
                <option value="Clothing">Clothing</option>
                <option value="Electronics">Electronics</option>
                <option value="Services">Services</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button type="submit" className="bg-brand-primary text-white px-6 py-2 rounded-md hover:bg-brand-primary-dark h-[38px]">
              Apply Filters
            </button>
          </form>
          <div className="text-sm text-slate-500 self-end">
            Showing {data.length} of {totalCount} records
          </div>
        </div>

        <div className="overflow-x-auto w-full print:overflow-visible">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 print:bg-transparent">
              <tr>
                <th className="px-4 py-3 text-center">Name</th>
                <th className="px-4 py-3 text-center">Business Name</th>
                <th className="px-4 py-3 text-center">Business Type</th>
                <th className="px-4 py-3 text-center">Renew Date</th>
                <th className="px-4 py-3 text-center">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Loading report data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">No records found.</td>
                </tr>
              ) : data.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 print:break-inside-avoid">
                  <td className="px-4 py-3 font-medium text-slate-800 text-center">{item.name}</td>
                  <td className="px-4 py-3 text-center">{item.businessName || '-'}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="default">{item.businessType || 'Other'}</Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-medium text-center">
                    {new Date(item.renewDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-center">
                    {new Date(item.expiryDate).toLocaleDateString()}
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

