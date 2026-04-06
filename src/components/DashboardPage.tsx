import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavSidebar } from './PipelinePage';
import { BarChart3, Users, Briefcase, Plus, Activity, Building2, ArrowRight, Sparkles, Calculator, ClipboardList } from 'lucide-react';

interface DashboardStats {
  totalDeals: number;
  activeDeals: number;
  closedDeals: number;
  totalContacts: number;
  dealsByStage: { stage: number; name: string; count: number }[];
  recentDeals: { id: number; propertyName: string; city: string; state: string; stage: number; leadRating: string; sellerAskingPrice: number }[];
}

const STAGE_NAMES: Record<number, string> = {
  1: 'Initial Contact', 2: 'Intro Call Scheduled', 3: 'Intro Call Complete',
  4: 'LOI Sent', 5: 'LOI Accepted', 6: 'PSA Sent',
  7: 'PSA Executed', 8: 'Due Diligence', 9: 'Financing',
  10: 'Clear to Close', 11: 'Closed',
};

const STAGE_COLORS: Record<number, string> = {
  1: '#6b7280', 2: '#8b5cf6', 3: '#3b82f6', 4: '#06b6d4', 5: '#10b981',
  6: '#f59e0b', 7: '#f97316', 8: '#ef4444', 9: '#ec4899', 10: '#a855f7', 11: '#22c55e',
};

const RATING_COLORS: Record<string, string> = { 'Hot': '#ef4444', 'Warm': '#f97316', 'Cold': '#3b82f6' };

function formatCurrency(val: any) {
  const n = Number(val);
  if (!val || isNaN(n) || n === 0) return '-';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (!t) { window.location.href = '/login'; return; }
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <Building2 size={22} className="text-amber-500" />
          </div>
          <p className="text-white/50 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    { label: 'Total Deals', value: stats?.totalDeals ?? 0, icon: BarChart3, color: '#f59e0b', href: '/pipeline' },
    { label: 'Active Deals', value: stats?.activeDeals ?? 0, icon: Activity, color: '#3b82f6', href: '/pipeline' },
    { label: 'Closed Deals', value: stats?.closedDeals ?? 0, icon: Briefcase, color: '#22c55e', href: '/portfolio' },
    { label: 'Total Contacts', value: stats?.totalContacts ?? 0, icon: Users, color: '#8b5cf6', href: '/contacts' },
  ];

  const quickLinks = [
    { label: 'Pipeline', href: '/pipeline', icon: BarChart3, color: '#f59e0b', desc: '11-stage Kanban board' },
    { label: 'New Deal', href: '/new-deal', icon: Plus, color: '#22c55e', desc: 'Add acquisition to pipeline' },
    { label: 'AI Analyzer', href: '/analyzer', icon: Sparkles, color: '#a855f7', desc: 'GPT-4 deal analysis' },
    { label: 'Underwriting', href: '/underwriting', icon: Calculator, color: '#06b6d4', desc: 'NOI & offer calculator' },
    { label: 'Due Diligence', href: '/due-diligence', icon: ClipboardList, color: '#3b82f6', desc: '100+ item DD checklist' },
    { label: 'Contacts', href: '/contacts', icon: Users, color: '#8b5cf6', desc: 'Sellers, brokers & more' },
    { label: 'Portfolio', href: '/portfolio', icon: Briefcase, color: '#10b981', desc: 'Closed acquisitions' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-56">
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Dashboard</h1>
              <p className="text-white/50 text-sm mt-0.5">Vault Ventures Self Storage CRM</p>
            </div>
            <Link href="/new-deal" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm">
              <Plus size={16} /> New Deal
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Link key={kpi.label} href={kpi.href} className="bg-white/3 border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/5 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                    <kpi.icon size={18} style={{ color: kpi.color }} />
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
                <div className="text-3xl font-bold text-white">{kpi.value}</div>
                <div className="text-xs text-white/40 mt-1">{kpi.label}</div>
              </Link>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white/3 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Pipeline by Stage</h2>
                <Link href="/pipeline" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  View All <ArrowRight size={12} />
                </Link>
              </div>
              {stats?.dealsByStage && stats.dealsByStage.filter((s) => s.count > 0).length > 0 ? (
                <div className="space-y-2">
                  {stats.dealsByStage.filter((s) => s.count > 0).map((s) => {
                    const maxCount = Math.max(...stats.dealsByStage.map((x) => x.count));
                    const pct = maxCount > 0 ? (s.count / maxCount) * 100 : 0;
                    return (
                      <div key={s.stage} className="flex items-center gap-3">
                        <div className="w-36 text-xs text-white/50 text-right flex-shrink-0 truncate">{STAGE_NAMES[s.stage] || s.name}</div>
                        <div className="flex-1 h-5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${Math.max(pct, 8)}%`, background: STAGE_COLORS[s.stage] || '#6b7280' }}
                          >
                            <span className="text-xs font-bold text-black/70">{s.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-white/30">
                  <p>No deals in pipeline yet.</p>
                  <Link href="/new-deal" className="inline-block mt-3 text-amber-400 text-sm hover:text-amber-300">Add your first deal</Link>
                </div>
              )}
            </div>

            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-4">Quick Access</h2>
              <div className="space-y-2">
                {quickLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${link.color}20` }}>
                      <link.icon size={15} style={{ color: link.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">{link.label}</div>
                      <div className="text-xs text-white/35 truncate">{link.desc}</div>
                    </div>
                    <ArrowRight size={13} className="text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {stats?.recentDeals && stats.recentDeals.length > 0 && (
            <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-white">Recent Deals</h2>
                <Link href="/pipeline" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  View Pipeline <ArrowRight size={12} />
                </Link>
              </div>
              <div className="space-y-2">
                {stats.recentDeals.slice(0, 8).map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors truncate">
                        {deal.propertyName || `Deal #${deal.id}`}
                      </div>
                      {(deal.city || deal.state) && (
                        <div className="text-xs text-white/40 mt-0.5">{[deal.city, deal.state].filter(Boolean).join(', ')}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {deal.leadRating && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color: RATING_COLORS[deal.leadRating] || '#6b7280', background: `${RATING_COLORS[deal.leadRating] || '#6b7280'}20` }}>
                          {deal.leadRating}
                        </span>
                      )}
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: STAGE_COLORS[deal.stage] || '#6b7280', background: `${STAGE_COLORS[deal.stage] || '#6b7280'}20` }}>
                        {STAGE_NAMES[deal.stage] || `Stage ${deal.stage}`}
                      </span>
                      {deal.sellerAskingPrice > 0 && (
                        <span className="text-xs text-amber-400 font-semibold hidden sm:block">{formatCurrency(deal.sellerAskingPrice)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {(!stats?.totalDeals || stats.totalDeals === 0) && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
                <Building2 size={36} className="text-amber-500/60" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Welcome to Vault Ventures CRM</h3>
              <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
                Your self storage acquisition command center. Start by adding your first deal to the pipeline.
              </p>
              <Link href="/new-deal" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-600 transition-colors">
                <Plus size={18} /> Add First Deal
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
