'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HawkerRenewPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = React.use(params);
  const [error, setError] = useState('');

  useEffect(() => {
    async function resolveAndRedirect() {
      try {
        const res = await fetch(`/api/hawkers/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch hawker details');
        }
        const json = await res.json();
        const hawker = json.data;
        const licenseId = hawker?.activeLicenseId || (hawker?.licenses && hawker.licenses[0]?.id);

        if (licenseId) {
          router.replace(`/licenses/${licenseId}/renew`);
        } else {
          setError('No active license found for this hawker.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred');
      }
    }
    resolveAndRedirect();
  }, [id, router]);

  return (
    <div className="p-8 text-center text-slate-500">
      {error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200 inline-block">
          {error}
        </div>
      ) : (
        'Redirecting to Hawker License Renewal...'
      )}
    </div>
  );
}
