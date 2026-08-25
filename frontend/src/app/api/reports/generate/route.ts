import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reportId = searchParams.get('id');
  
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109';
  const headers = { 'Authorization': `Bearer ${token}` };

  try {
    let data: any[] = [];
    
    if (reportId === 'master' || reportId === 'zone' || reportId === 'new' || reportId === 'category') {
      const res = await fetch(`${backendUrl}/api/hawkers/report?page=1&pageSize=10000`, { headers, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.items || [];
        
        if (reportId === 'master' || reportId === 'new') {
          data = items.map((i: any) => ({
            'Enrollment No': i.enrollmentNo || '-',
            'Full Name': i.fullName || '-',
            'Mobile Number': i.mobileNumber || '-',
            'Ward Name': i.wardName || '-',
            'Business Type': i.businessType || '-',
            'Hawker Status': i.hawkerStatus || '-'
          }));
        } else if (reportId === 'zone') {
          const zoneCounts: Record<string, number> = {};
          items.forEach((i: any) => {
            const ward = i.wardName || 'Unknown';
            zoneCounts[ward] = (zoneCounts[ward] || 0) + 1;
          });
          data = Object.keys(zoneCounts).map(ward => ({
            'Ward Name': ward,
            'Total Hawkers': zoneCounts[ward]
          }));
        } else if (reportId === 'category') {
          const catCounts: Record<string, number> = {};
          items.forEach((i: any) => {
            const cat = i.businessType || 'Unknown';
            catCounts[cat] = (catCounts[cat] || 0) + 1;
          });
          data = Object.keys(catCounts).map(cat => ({
            'Vending Category': cat,
            'Total Hawkers': catCounts[cat]
          }));
        }
      }
    } else if (reportId === 'expiring') {
      const res = await fetch(`${backendUrl}/api/hawkers/report/renewed?days=30`, { headers, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const items = json.data?.items || json.data || [];
        data = items.map((i: any) => ({
          'Name': i.hawkerName || i.name || '-',
          'License Number': i.licenseNumber || '-',
          'Expiry Date': i.expiryDate ? new Date(i.expiryDate).toLocaleDateString() : '-'
        }));
      }
    } else if (reportId === 'pending') {
      const res = await fetch(`${backendUrl}/api/hawkers`, { headers, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const pending = (json.data || []).filter((h: any) => h.status === 'UNDER_REVIEW');
        data = pending.map((i: any) => ({
          'Enrollment No': i.enrollmentNo || '-',
          'Full Name': i.fullName || '-',
          'Mobile Number': i.mobileNumber || '-',
          'Status': i.status
        }));
      }
    } else if (reportId === 'audit') {
      const res = await fetch(`${backendUrl}/api/auditlogs?page=1&pageSize=5000`, { headers, cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        data = (json.data?.items || []).map((i: any) => ({
          'Timestamp': new Date(i.timestamp).toLocaleString(),
          'User': `${i.username || 'System'} (ID: ${i.userId || '-'})`,
          'Action': i.action || '-',
          'Entity': `${i.entityName} #${i.entityId}`,
          'Details': i.details || '-'
        }));
      }
    }

    if (data.length === 0) {
      data = [{ 'Message': 'No data found for this report.' }];
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error(`Error generating report ${reportId}:`, error);
    return NextResponse.json({ error: 'Failed to generate report data' }, { status: 500 });
  }
}
