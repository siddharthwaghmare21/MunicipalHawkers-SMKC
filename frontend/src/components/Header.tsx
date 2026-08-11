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
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-surface-border z-40 flex flex-col shadow-sm">
      <div className="flex-1 flex items-center justify-between px-4 w-full h-full">
        <div className="flex items-center">
          <button 
            onClick={toggleSidebar}
            className="p-3 mr-2 text-slate-500 hover:bg-surface-soft rounded-md md:hidden focus:outline-none"
          >
            <i className="bi bi-list text-2xl"></i>
          </button>
          <Link href="/" className="flex items-center !no-underline !text-slate-800">
            <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center text-white font-bold text-xl mr-3 shadow-sm">
              S
            </div>
            <div className="hidden md:block">
              <h1 className="!text-xl font-bold !text-slate-800 leading-tight tracking-tight !m-0 !mb-0 !mt-0">MunicipalHawkers</h1>
              <p className="!text-xs text-text-muted !m-0 !mb-0 !mt-0">SMKC ERP System</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button className="!text-sm font-medium !text-slate-600 hover:!text-brand-primary transition-colors px-1 py-1.5 flex items-center">
            <span className="hidden sm:inline">En / Mr</span>
            <span className="sm:hidden text-lg"><i className="bi bi-translate"></i></span>
          </button>
          <button 
            onClick={handleLogout}
            className="!text-sm font-medium !text-red-600 hover:!text-red-700 bg-red-50 px-2 sm:px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 sm:gap-2 border border-red-200 hover:bg-red-100"
          >
            <i className="bi bi-box-arrow-right !text-red-600"></i>
            <span className="hidden sm:inline !m-0 !p-0">Logout</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center !text-slate-600 border border-slate-200 flex-shrink-0">
            <i className="bi bi-person-fill"></i>
          </div>
        </div>
      </div>
      <div className="h-1 w-full bg-gradient-to-r from-[#C0392B] to-[#D4AF37]"></div>
    </header>
  );
}
