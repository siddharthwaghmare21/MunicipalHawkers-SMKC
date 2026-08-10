'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="p-2 mr-4 text-slate-500 hover:bg-slate-100 rounded-md md:hidden focus:outline-none"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/" className="flex items-center">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-3">
            S
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-900 leading-tight">MunicipalHawkers</h1>
            <p className="text-xs text-slate-500">SMKC ERP System</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-sm font-medium text-slate-600 hover:text-red-600">
          En / Mr
        </button>
        <button 
          onClick={handleLogout}
          className="text-sm font-medium text-slate-600 hover:text-red-600 bg-slate-100 px-3 py-1 rounded-md transition-colors"
        >
          Logout
        </button>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      </div>
    </header>
  );
}
