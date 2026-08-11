'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Sidebar({ isOpen, toggleSidebar }: { isOpen: boolean, toggleSidebar: () => void }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: 'speedometer2' },
    { label: 'Hawkers', href: '/hawkers', icon: 'people' },
    { label: 'Licenses', href: '/licenses', icon: 'card-checklist' },
    { label: 'Documents', href: '/documents', icon: 'folder2-open' },
    { label: 'Reports', href: '/reports', icon: 'bar-chart' },
    { label: 'Audit Logs', href: '/audit-logs', icon: 'journal-text' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-brand-dark/50 z-20 md:hidden" 
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 z-30 w-64 h-[calc(100vh-4rem)] bg-brand-dark text-white transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full px-3 py-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link 
                    href={item.href}
                    className={`flex items-center py-3 px-4 rounded-lg group transition-colors ${
                      isActive 
                        ? 'bg-brand-primary text-white font-semibold shadow-sm' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <i className={`bi bi-${item.icon} text-lg mr-3`}></i>
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}
