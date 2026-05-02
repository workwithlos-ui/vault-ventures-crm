import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NavSidebar } from './PipelinePage';
import { ExternalLink, TrendingUp, Building2, DollarSign, Calendar } from 'lucide-react';

interface ClosedDeal {
  id: number; propertyName: string; address: string; city: string; state: string;
  units: number; finalPurchasePrice: number; closingDate: string; financingStructure: string;
  entityTakingTitle: string; propertyManagementAssigned: string;
  firstMonthNOIActual: number; firstMonthNOIProjected: number;
  noi: number; capRate: number; purchasePrice: number; sellerAskingPrice: number;
}

function formatCurrency(val: any) {
  const n = Number(val);
  if (!val || isNaN(n)) return '-';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(2)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function formatDate(val: any) {
  if (!val) return '-';
  try { return new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return val; }
}

export default function PortfolioPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<ClosedDeal[]>([]);
  const [loading, setLoading] = useState(true);
useEffect(() => {
fetch('/api/deals', { headers: { Authorization: 'none' } })
      .then((r) => r.json())
      .then((data) => {
        const closed = Array.isArray(data) ? data.filter((d: any) => d.stage === 11 || d.stage === '11') : [];
        setDeals(closed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-white/80 text-lg">Loading portfolio...</div></div>;

  const totalValue = deals.reduce((sum, d) => sum + (Number(d.finalPurchasePrice) || Number(d.purchasePrice) || 0), 0);
  const totalUnits = deals.reduce((sum, d) => sum + (Number(d.units) || 0), 0);
  const avgCapRate = deals.length > 0 ? deals.reduce((sum, d) => sum + (Number(d.capRate) || 0), 0) / deals.filter((d) => d.capRate).length : 0;

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
          <h1 className="text-xl font-bold text-white">Portfolio</h1>
          <p className="text-white/50 text-sm mt-0.5">{deals.length} closed acquisitions</p>
        </header>

        <div className="max-w-7xl mx-auto p-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Properties Acquired', value: deals.length.toString(), icon: Building2, color: '#f59e0b' },
              { label: 'Total Portfolio Value', value: formatCurrency(totalValue), icon: DollarSign, color: '#22c55e' },
              { label: 'Total Units', value: totalUnits.toLocaleString(), icon: TrendingUp, color: '#3b82f6' },
              { label: 'Avg Cap Rate', value: avgCapRate > 0 ? `${avgCapRate.toFixed(1)}%` : '-', icon: TrendingUp, color: '#a855f7' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/3 border border-white/[0.05] rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                    <kpi.icon size={18} style={{ color: kpi.color }} />
                  </div>
                </div>
                <div className="text-2xl font-bold text-white">{kpi.value}</div>
                <div className="text-xs text-white/40 mt-1">{kpi.label}</div>
              </div>
            ))}
          </div>

          {deals.length === 0 ? (
            <div className="text-center py-20 text-white/30">
              <div className="text-5xl mb-4">🏢</div>
              <p className="text-xl font-medium">No closed deals yet</p>
              <p className="text-sm mt-2">Deals moved to Stage 11 (Closed) will appear here.</p>
              <Link href="/pipeline" className="inline-block mt-6 px-6 py-2.5 bg-white text-[#09090b] rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm">
                View Pipeline
              </Link>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block bg-white/3 border border-white/[0.05] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/[0.05]">
                        {['Property', 'Location', 'Units', 'Purchase Price', 'Closing Date', 'Financing', 'Entity', 'Mgmt', 'NOI Actual', 'NOI Projected', ''].map((h) => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-white/40 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {deals.map((d) => (
                        <tr key={d.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white">{d.propertyName || `Deal #${d.id}`}</div>
                          </td>
                          <td className="px-4 py-3 text-white/50 whitespace-nowrap">{[d.city, d.state].filter(Boolean).join(', ')}</td>
                          <td className="px-4 py-3 text-white/70">{d.units || '-'}</td>
                          <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatCurrency(d.finalPurchasePrice || d.purchasePrice)}</td>
                          <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={12} />
                              {formatDate(d.closingDate)}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-white/60 text-xs">{d.financingStructure || '-'}</td>
                          <td className="px-4 py-3 text-white/60 text-xs">{d.entityTakingTitle || '-'}</td>
                          <td className="px-4 py-3 text-white/60 text-xs">{d.propertyManagementAssigned || '-'}</td>
                          <td className="px-4 py-3">
                            {d.firstMonthNOIActual ? (
                              <span className="text-green-400 font-semibold">{formatCurrency(d.firstMonthNOIActual)}</span>
                            ) : <span className="text-white/30">-</span>}
                          </td>
                          <td className="px-4 py-3">
                            {d.firstMonthNOIProjected ? (
                              <span className="text-blue-400 font-semibold">{formatCurrency(d.firstMonthNOIProjected)}</span>
                            ) : <span className="text-white/30">-</span>}
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/deals/${d.id}`} className="text-white/30 hover:text-white transition-colors">
                              <ExternalLink size={15} />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {deals.map((d) => (
                  <div key={d.id} className="bg-white/3 border border-white/[0.05] rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-white">{d.propertyName || `Deal #${d.id}`}</div>
                        <div className="text-white/50 text-sm">{[d.city, d.state].filter(Boolean).join(', ')}</div>
                      </div>
                      <Link href={`/deals/${d.id}`} className="text-white/30 hover:text-white transition-colors">
                        <ExternalLink size={16} />
                      </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div><div className="text-white/40 text-xs">Purchase Price</div><div className="text-white font-semibold">{formatCurrency(d.finalPurchasePrice || d.purchasePrice)}</div></div>
                      <div><div className="text-white/40 text-xs">Units</div><div className="text-white">{d.units || '-'}</div></div>
                      <div><div className="text-white/40 text-xs">Closing Date</div><div className="text-white/70">{formatDate(d.closingDate)}</div></div>
                      <div><div className="text-white/40 text-xs">Financing</div><div className="text-white/70 text-xs">{d.financingStructure || '-'}</div></div>
                      <div><div className="text-white/40 text-xs">NOI Actual</div><div className="text-green-400 font-semibold">{formatCurrency(d.firstMonthNOIActual) || '-'}</div></div>
                      <div><div className="text-white/40 text-xs">NOI Projected</div><div className="text-blue-400 font-semibold">{formatCurrency(d.firstMonthNOIProjected) || '-'}</div></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
