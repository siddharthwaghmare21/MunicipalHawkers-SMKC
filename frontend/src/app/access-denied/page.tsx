import Link from 'next/link';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center p-10 bg-white rounded-lg shadow-sm border border-slate-200 max-w-md w-full">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Access Denied</h1>
        <p className="text-slate-600 mb-8">You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.</p>
        <Link 
          href="/dashboard"
          className="inline-block w-full bg-red-600 text-white font-medium px-6 py-3 rounded hover:bg-red-700 transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
