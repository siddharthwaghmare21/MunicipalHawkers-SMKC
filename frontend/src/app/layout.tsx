import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthShell } from '@/components/AuthShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MunicipalHawkers - SMKC',
  description: 'SMKC ERP System for Hawkers',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <AuthShell>
          {children}
        </AuthShell>
      </body>
    </html>
  );
}
