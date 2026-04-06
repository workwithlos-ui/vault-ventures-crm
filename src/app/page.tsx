'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      window.location.href = '/login';
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <div className="min-h-screen bg-gradient-dark flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-dark">
      <header className="border-b border-white/10 backdrop-blur-xl bg-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-amber-500">Vault Ventures CRM</h1>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token');
              window.location.href = '/login';
            }}
            className="px-4 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-2"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Pipeline', href: '/pipeline', icon: '📊' },
            { label: 'New Deal', href: '/new-deal', icon: '➕' },
            { label: 'Contacts', href: '/contacts', icon: '👥' },
            { label: 'Portfolio', href: '/portfolio', icon: '🏢' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all cursor-pointer text-center"
            >
              <div className="text-4xl mb-3">{item.icon}</div>
              <h3 className="font-semibold">{item.label}</h3>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
