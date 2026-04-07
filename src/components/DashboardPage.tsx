import { useEffect, useState } from 'react';
import Link from 'next/link';
import { NavSidebar } from './PipelinePage';
import {
  BarChart3, Users, Briefcase, Plus, Activity, Building2, ArrowRight,
  AlertTriangle, Zap, Clock, FileX, ShieldAlert, TrendingUp, TrendingDown,
  Phone, MapPin, DollarSign, Target
} from 'lucide-react';

// ============ STAGE MAPPING ============
const STAGE_LABELS: Record<string, string> = {
  new_opportunity: 'New Opportunity',
  initial_contact: 'Initial Contact',
  intro_call_scheduled: 'Intro Call Scheduled',
  intro_call_complete: 'Intro Call Complete',
  under_loi: 'Under LOI',
  loi_accepted: 'LOI Accepted',
  psa_sent: 'PSA Sent',
  psa_executed: 'PSA Executed',
  due_diligence: 'Due Diligence',
  under_contract: 'Under Contract',
  financing: 'Financing',
  clear_to_close: 'Clear to Close',
  closed: 'Closed',
  dead_deal: 'Dead Deal',
  passed: 'Passed',
};

const STAGE_COLORS: Record<string, string> = {
  new_opportunity: '#6b7280', initial_contact: '#6b7280',
  intro_call_scheduled: '#8b5cf6', intro_call_complete: '#3b82f6',
  under_loi: '#06b6d4', loi_accepted: '#10b981',
  psa_sent: '#f59e0b', psa_executed: '#f97316',
  due_diligence: '#ef4444', under_contract: '#ef4444',
  financing: '#ec4899', clear_to_close: '#a855f7', closed: '#22c55e',
  dead_deal: '#374151', passed: '#374151',
};

const ACTIVE_STAGES = ['under_loi', 'loi_accepted', 'psa_sent', 'psa_executed', 'due_diligence', 'under_contract', 'financing', 'clear_to_close'];
const RATING_COLORS: Record<string, string> = { Hot: '#ef4444', Warm: '#f97316', Cold: '#3b82f6' };

function fmt$(val: any) {
  const n = Number(val);
  if (!val || isNaN(n) || n === 0) return '-';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function pct(val: any) {
  const n = Number(val);
  if (!val || isNaN(n)) return '-';
  return `${n}%`;
}

function daysSince(dateStr: any): number {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  return Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24));
}

// ============ INTELLIGENCE FUNCTIONS ============

function getRedFlags(deal: any): string[] {
  const flags: string[] = [];
  const occ = Number(deal.occupancyRate);
  if (occ && occ < 70) flags.push(`Low occupancy (${occ}%)`);
  if (!deal.noi || Number(deal.noi) === 0) flags.push('Missing NOI');
  if (!deal.units || Number(deal.units) === 0) flags.push('Missing unit count');
  if (!deal.sellerAskingPrice || Number(deal.sellerAskingPrice) === 0) flags.push('No asking price');
  const noi = Number(deal.noi);
  const ask = Number(deal.sellerAskingPrice);
  if (noi > 0 && ask > 0) {
    const impliedCap = (noi / ask) * 100;
    if (impliedCap < 5) flags.push(`Very low cap rate (${impliedCap.toFixed(1)}%)`);
  }
  if (deal.floodZone && (deal.floodZone === 'Zone A' || deal.floodZone === 'Zone AE')) flags.push(`Flood risk (${deal.floodZone})`);
  if (deal.ageOfRoof && Number(deal.ageOfRoof) > 20) flags.push(`Old roof (${deal.ageOfRoof} yrs)`);
  return flags;
}

function getMissingData(deal: any): string[] {
  const missing: string[] = [];
  if (!deal.sellerAskingPrice || Number(deal.sellerAskingPrice) === 0) missing.push('Purchase price');
  if (!deal.noi || Number(deal.noi) === 0) missing.push('NOI');
  if (!deal.occupancyRate || Number(deal.occupancyRate) === 0) missing.push('Occupancy');
  if (!deal.units || Number(deal.units) === 0) missing.push('Unit count');
  if (!deal.hasRentRoll) missing.push('Rent roll');
  if (!deal.hasPL) missing.push('P&L statement');
  if (!deal.hasFacilityMap) missing.push('Facility map');
  return missing;
}

function getNextAction(deal: any, checklist: any): string {
  const missing = getMissingData(deal);
  const stage = deal.stage;
  if (missing.includes('NOI') || missing.includes('Rent roll')) return 'Request rent roll & financials';
  if (missing.includes('P&L statement')) return 'Request P&L from seller';
  if (checklist && checklist.blocked > 0) return `Resolve ${checklist.blocked} blocked diligence items`;
  if (stage === 'initial_contact' || stage === 'new_opportunity') return 'Schedule intro call';
  if (stage === 'intro_call_complete' || stage === 'intro_call_scheduled') return 'Complete underwriting & send LOI';
  if (stage === 'under_loi') return 'Negotiate LOI terms';
  if (stage === 'loi_accepted' || stage === 'psa_sent') return 'Draft & execute PSA';
  if (stage === 'due_diligence') return 'Complete due diligence checklist';
  if (stage === 'financing') return 'Secure financing commitment';
  if (stage === 'clear_to_close') return 'Prepare for closing';
  return 'Review deal status';
}

// ============ SECTION COMPONENTS ============

function SectionCard({ icon: Icon, title, color, count, children }: {
  icon: any; title: string; color: string; count?: number; children: React.ReactNode;
}) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
        <h2 className="text-sm font-bold text-white flex-1">{title}</h2>
        {count !== undefined && count > 0 && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ color, background: `${color}15` }}>{count}</span>
        )}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function DealRow({ deal, subtitle, badge, badgeColor, href }: {
  deal: any; subtitle: string; badge?: string; badgeColor?: string; href?: string;
}) {
  const link = href || `/deals/${deal.id}`;
  return (
    <Link href={link} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-all group">
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-white text-sm group-hover:text-amber-400 transition-colors truncate">
          {deal.propertyName}
        </div>
        <div className="text-xs text-white/40 mt-0.5 truncate">{subtitle}</div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {deal.leadRating && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: RATING_COLORS[deal.leadRating] || '#6b7280', background: `${RATING_COLORS[deal.leadRating] || '#6b7280'}15` }}>
            {deal.leadRating}
          </span>
        )}
        {badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: badgeColor || '#f59e0b', background: `${badgeColor || '#f59e0b'}15` }}>
            {badge}
          </span>
        )}
        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{ color: STAGE_COLORS[deal.stage] || '#6b7280', background: `${STAGE_COLORS[deal.stage] || '#6b7280'}15` }}>
          {STAGE_LABELS[deal.stage] || deal.stage}
        </span>
        {Number(deal.sellerAskingPrice) > 0 && (
          <span className="text-xs text-amber-400 font-semibold hidden sm:block">{fmt$(deal.sellerAskingPrice)}</span>
        )}
      </div>
    </Link>
  );
}

// ============ MAIN COMPONENT ============

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (!t) { window.location.href = '/login'; return; }
    fetch('/api/dashboard', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => r.json())
      .then((d) => setData(d))
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
          <p className="text-white/50 text-sm">Loading command center...</p>
        </div>
      </div>
    );
  }

  const deals: any[] = data?.deals || data?.allDeals || [];
  const checklistMap: Record<number, any> = {};
  (data?.checklistSummary || []).forEach((c: any) => { checklistMap[c.dealId] = c; });

  // ---- Intelligence computations ----
  const activeDeals = deals.filter(d => !['closed', 'dead_deal', 'passed'].includes(d.stage));

  // Needs Attention: Hot deals in active stages, or deals with red flags
  const needsAttention = activeDeals.filter(d => {
    const isHot = d.leadRating === 'Hot';
    const isActive = ACTIVE_STAGES.includes(d.stage);
    const flags = getRedFlags(d);
    return (isHot && isActive) || flags.length >= 2;
  }).slice(0, 5);

  // Next Best Actions: one action per active deal
  const nextActions = activeDeals.map(d => ({
    deal: d,
    action: getNextAction(d, checklistMap[d.id]),
    priority: d.leadRating === 'Hot' ? 1 : d.leadRating === 'Warm' ? 2 : 3,
  })).sort((a, b) => a.priority - b.priority).slice(0, 5);

  // Stale Deals: no update in 14+ days
  const staleDeals = activeDeals.filter(d => {
    const days = daysSince(d.updatedAt || d.createdAt);
    return days >= 14;
  }).sort((a, b) => daysSince(b.updatedAt || b.createdAt) - daysSince(a.updatedAt || a.createdAt)).slice(0, 5);

  // Missing Critical Data
  const missingDataDeals = activeDeals.filter(d => getMissingData(d).length >= 2)
    .map(d => ({ deal: d, missing: getMissingData(d) }))
    .sort((a, b) => b.missing.length - a.missing.length).slice(0, 5);

  // Diligence Blockers
  const ddBlockers = activeDeals.filter(d => {
    const cl = checklistMap[d.id];
    return cl && (cl.blocked > 0 || (cl.total > 0 && cl.completed / cl.total < 0.5 && ['due_diligence', 'under_contract'].includes(d.stage)));
  }).map(d => ({ deal: d, checklist: checklistMap[d.id] })).slice(0, 5);

  // Pipeline value
  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (Number(d.sellerAskingPrice) || 0), 0);

  const kpis = [
    { label: 'Active Deals', value: data?.activeDeals ?? 0, icon: Activity, color: '#3b82f6', href: '/pipeline' },
    { label: 'Pipeline Value', value: fmt$(totalPipelineValue), icon: DollarSign, color: '#f59e0b', href: '/pipeline' },
    { label: 'Closed', value: data?.closedDeals ?? 0, icon: Briefcase, color: '#22c55e', href: '/portfolio' },
    { label: 'Contacts', value: data?.totalContacts ?? 0, icon: Users, color: '#8b5cf6', href: '/contacts' },
  ];

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-56">
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Command Center</h1>
              <p className="text-white/50 text-sm mt-0.5">Vault Ventures Acquisitions Intelligence</p>
            </div>
            <Link href="/new-deal" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm">
              <Plus size={16} /> New Deal
            </Link>
          </div>
        </header>

        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* KPI Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Link key={kpi.label} href={kpi.href} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:bg-white/5 transition-all group">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${kpi.color}20` }}>
                    <kpi.icon size={18} style={{ color: kpi.color }} />
                  </div>
                  <ArrowRight size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                </div>
                <div className="text-2xl font-bold text-white">{typeof kpi.value === 'number' ? kpi.value : kpi.value}</div>
                <div className="text-xs text-white/40 mt-1">{kpi.label}</div>
              </Link>
            ))}
          </div>

          {/* Two-column intelligence grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Needs Attention */}
            <SectionCard icon={AlertTriangle} title="Needs Attention" color="#ef4444" count={needsAttention.length}>
              {needsAttention.length > 0 ? (
                <div className="space-y-1">
                  {needsAttention.map(deal => {
                    const flags = getRedFlags(deal);
                    return (
                      <DealRow key={deal.id} deal={deal}
                        subtitle={flags.length > 0 ? flags.slice(0, 2).join(' · ') : `${STAGE_LABELS[deal.stage] || deal.stage} · ${deal.leadRating || 'Unrated'}`}
                        badge={flags.length > 0 ? `${flags.length} flags` : undefined}
                        badgeColor="#ef4444"
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/30 text-sm py-4 text-center">All deals look healthy</p>
              )}
            </SectionCard>

            {/* Next Best Actions */}
            <SectionCard icon={Zap} title="Next Best Actions" color="#f59e0b" count={nextActions.length}>
              {nextActions.length > 0 ? (
                <div className="space-y-1">
                  {nextActions.map(({ deal, action }) => (
                    <DealRow key={deal.id} deal={deal} subtitle={action}
                      badge={action.split(' ').slice(0, 3).join(' ')}
                      badgeColor="#f59e0b"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm py-4 text-center">No active deals</p>
              )}
            </SectionCard>

            {/* Stale Deals */}
            <SectionCard icon={Clock} title="Stale Deals" color="#f97316" count={staleDeals.length}>
              {staleDeals.length > 0 ? (
                <div className="space-y-1">
                  {staleDeals.map(deal => {
                    const days = daysSince(deal.updatedAt || deal.createdAt);
                    return (
                      <DealRow key={deal.id} deal={deal}
                        subtitle={`No activity in ${days} days · ${STAGE_LABELS[deal.stage] || deal.stage}`}
                        badge={`${days}d stale`}
                        badgeColor="#f97316"
                      />
                    );
                  })}
                </div>
              ) : (
                <p className="text-white/30 text-sm py-4 text-center">All deals have recent activity</p>
              )}
            </SectionCard>

            {/* Missing Critical Data */}
            <SectionCard icon={FileX} title="Missing Critical Data" color="#a855f7" count={missingDataDeals.length}>
              {missingDataDeals.length > 0 ? (
                <div className="space-y-1">
                  {missingDataDeals.map(({ deal, missing }) => (
                    <DealRow key={deal.id} deal={deal}
                      subtitle={`Missing: ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ` +${missing.length - 3}` : ''}`}
                      badge={`${missing.length} missing`}
                      badgeColor="#a855f7"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-white/30 text-sm py-4 text-center">All deals have complete data</p>
              )}
            </SectionCard>

            {/* Diligence Blockers */}
            {ddBlockers.length > 0 && (
              <SectionCard icon={ShieldAlert} title="Diligence Blockers" color="#ec4899" count={ddBlockers.length}>
                <div className="space-y-1">
                  {ddBlockers.map(({ deal, checklist }) => {
                    const pctDone = checklist.total > 0 ? Math.round((checklist.completed / checklist.total) * 100) : 0;
                    return (
                      <DealRow key={deal.id} deal={deal}
                        subtitle={`${pctDone}% done · ${checklist.blocked} blocked · ${checklist.total - checklist.completed} remaining`}
                        badge={`${checklist.blocked} blocked`}
                        badgeColor="#ec4899"
                        href={`/due-diligence?dealId=${deal.id}`}
                      />
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>

          {/* All Active Deals Table */}
          {activeDeals.length > 0 && (
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-amber-500/20">
                  <Target size={16} className="text-amber-500" />
                </div>
                <h2 className="text-sm font-bold text-white flex-1">All Active Deals</h2>
                <Link href="/pipeline" className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
                  Pipeline View <ArrowRight size={12} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="text-left text-xs text-white/40 font-medium px-4 py-2.5">Property</th>
                      <th className="text-left text-xs text-white/40 font-medium px-4 py-2.5">Location</th>
                      <th className="text-left text-xs text-white/40 font-medium px-4 py-2.5">Stage</th>
                      <th className="text-right text-xs text-white/40 font-medium px-4 py-2.5">Ask Price</th>
                      <th className="text-right text-xs text-white/40 font-medium px-4 py-2.5">NOI</th>
                      <th className="text-right text-xs text-white/40 font-medium px-4 py-2.5">Occ%</th>
                      <th className="text-center text-xs text-white/40 font-medium px-4 py-2.5">Units</th>
                      <th className="text-center text-xs text-white/40 font-medium px-4 py-2.5">Rating</th>
                      <th className="text-center text-xs text-white/40 font-medium px-4 py-2.5">Flags</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDeals.map(deal => {
                      const flags = getRedFlags(deal);
                      return (
                        <tr key={deal.id} className="border-b border-white/[0.04] hover:bg-white/[0.03] transition-colors cursor-pointer"
                          onClick={() => window.location.href = `/deals/${deal.id}`}>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white truncate max-w-[200px]">{deal.propertyName}</div>
                          </td>
                          <td className="px-4 py-3 text-white/50 text-xs">{[deal.city, deal.state].filter(Boolean).join(', ') || '-'}</td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: STAGE_COLORS[deal.stage] || '#6b7280', background: `${STAGE_COLORS[deal.stage] || '#6b7280'}15` }}>
                              {STAGE_LABELS[deal.stage] || deal.stage}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right text-amber-400 font-semibold text-xs">{fmt$(deal.sellerAskingPrice)}</td>
                          <td className="px-4 py-3 text-right text-white/70 text-xs">{fmt$(deal.noi)}</td>
                          <td className="px-4 py-3 text-right text-xs" style={{ color: Number(deal.occupancyRate) < 70 ? '#ef4444' : Number(deal.occupancyRate) >= 85 ? '#22c55e' : '#f59e0b' }}>
                            {pct(deal.occupancyRate)}
                          </td>
                          <td className="px-4 py-3 text-center text-white/60 text-xs">{deal.units || '-'}</td>
                          <td className="px-4 py-3 text-center">
                            {deal.leadRating ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{ color: RATING_COLORS[deal.leadRating] || '#6b7280', background: `${RATING_COLORS[deal.leadRating] || '#6b7280'}15` }}>
                                {deal.leadRating}
                              </span>
                            ) : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {flags.length > 0 ? (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-red-400 bg-red-400/10">
                                {flags.length}
                              </span>
                            ) : (
                              <span className="text-[10px] text-green-400">✓</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {deals.length === 0 && (
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
