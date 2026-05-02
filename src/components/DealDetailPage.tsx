import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NavSidebar } from './PipelinePage';
import { ArrowLeft, Save, Trash2, Plus, Phone, Mail, ExternalLink, AlertTriangle, FileX, Zap, TrendingUp, TrendingDown, Target } from 'lucide-react';

const STAGE_LABELS: Record<string, string> = {
  new_opportunity: 'New Opportunity', initial_contact: 'Initial Contact',
  intro_call_scheduled: 'Intro Call Scheduled', intro_call_complete: 'Intro Call Complete',
  under_loi: 'Under LOI', loi_accepted: 'LOI Accepted',
  psa_sent: 'PSA Sent', psa_executed: 'PSA Executed',
  due_diligence: 'Due Diligence', under_contract: 'Under Contract',
  financing: 'Financing', clear_to_close: 'Clear to Close',
  closed: 'Closed', dead_deal: 'Dead Deal', passed: 'Passed',
};

const STAGE_COLORS_STR: Record<string, string> = {
  new_opportunity: '#6b7280', initial_contact: '#6b7280',
  intro_call_scheduled: '#8b5cf6', intro_call_complete: '#3b82f6',
  under_loi: '#06b6d4', loi_accepted: '#10b981',
  psa_sent: '#f59e0b', psa_executed: '#f97316',
  due_diligence: '#ef4444', under_contract: '#ef4444',
  financing: '#ec4899', clear_to_close: '#a855f7', closed: '#22c55e',
  dead_deal: '#374151', passed: '#374151',
};

function getRedFlags(deal: any): string[] {
  const flags: string[] = [];
  const occ = Number(deal.occupancyRate);
  if (occ && occ < 70) flags.push(`Low occupancy (${occ}%)`);
  if (!deal.noi || Number(deal.noi) === 0) flags.push('Missing NOI');
  if (!deal.units || Number(deal.units) === 0) flags.push('Missing unit count');
  const noi = Number(deal.noi); const ask = Number(deal.sellerAskingPrice);
  if (noi > 0 && ask > 0 && (noi / ask) * 100 < 5) flags.push(`Very low cap rate (${((noi / ask) * 100).toFixed(1)}%)`);
  if (deal.floodZone && (deal.floodZone === 'Zone A' || deal.floodZone === 'Zone AE')) flags.push(`Flood risk (${deal.floodZone})`);
  if (deal.ageOfRoof && Number(deal.ageOfRoof) > 20) flags.push(`Old roof (${deal.ageOfRoof} yrs)`);
  if (!deal.hasRentRoll) flags.push('No rent roll');
  if (!deal.hasPL) flags.push('No P&L');
  return flags;
}

function getMissingData(deal: any): string[] {
  const m: string[] = [];
  if (!deal.sellerAskingPrice || Number(deal.sellerAskingPrice) === 0) m.push('Purchase price');
  if (!deal.noi || Number(deal.noi) === 0) m.push('NOI');
  if (!deal.occupancyRate || Number(deal.occupancyRate) === 0) m.push('Occupancy');
  if (!deal.units || Number(deal.units) === 0) m.push('Unit count');
  if (!deal.hasRentRoll) m.push('Rent roll');
  if (!deal.hasPL) m.push('P&L');
  if (!deal.hasFacilityMap) m.push('Facility map');
  return m;
}

function getNextStep(deal: any): string {
  const missing = getMissingData(deal);
  const stage = deal.stage;
  if (missing.includes('NOI') || missing.includes('Rent roll')) return 'Request rent roll & financials from seller';
  if (missing.includes('P&L')) return 'Request P&L statement';
  if (stage === 'initial_contact' || stage === 'new_opportunity') return 'Schedule intro call with seller';
  if (stage === 'intro_call_scheduled' || stage === 'intro_call_complete') return 'Complete underwriting & prepare LOI';
  if (stage === 'under_loi') return 'Negotiate LOI terms';
  if (stage === 'loi_accepted' || stage === 'psa_sent') return 'Draft & execute PSA';
  if (stage === 'psa_executed' || stage === 'due_diligence') return 'Complete due diligence checklist';
  if (stage === 'financing') return 'Secure financing commitment';
  if (stage === 'clear_to_close') return 'Prepare for closing';
  if (stage === 'closed') return 'Transition to portfolio management';
  if (stage === 'dead_deal' || stage === 'passed') return 'Archive or deprioritize';
  return 'Review deal status';
}

function fmtCurrency(val: any) {
  const n = Number(val);
  if (!val || isNaN(n) || n === 0) return '-';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

function DealBrief({ deal }: { deal: any }) {
  const noi = Number(deal.noi) || 0;
  const ask = Number(deal.sellerAskingPrice) || 0;
  const occ = Number(deal.occupancyRate) || 0;
  const units = Number(deal.units) || 0;
  const impliedCap = ask > 0 && noi > 0 ? ((noi / ask) * 100).toFixed(1) : null;
  const offerLow = noi > 0 ? noi / 0.085 : null;
  const offerMid = noi > 0 ? noi / 0.075 : null;
  const offerHigh = noi > 0 ? noi / 0.065 : null;
  const flags = getRedFlags(deal);
  const missing = getMissingData(deal);
  const nextStep = getNextStep(deal);
  const stageLabel = STAGE_LABELS[deal.stage] || deal.stage;
  const stageColor = STAGE_COLORS_STR[deal.stage] || '#6b7280';

  return (
    <div className="bg-gradient-to-br from-amber-500/5 via-transparent to-purple-500/5 border border-amber-500/20 rounded-xl p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Target size={16} /> Investment Snapshot
        </h2>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: stageColor, background: `${stageColor}20` }}>{stageLabel}</span>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Ask Price</div>
          <div className="text-lg font-bold text-white mt-1">{fmtCurrency(ask)}</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">NOI</div>
          <div className="text-lg font-bold text-white mt-1">{fmtCurrency(noi)}</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Cap Rate</div>
          <div className={`text-lg font-bold mt-1 ${impliedCap && Number(impliedCap) >= 7 ? 'text-green-400' : impliedCap && Number(impliedCap) >= 5 ? 'text-white' : 'text-red-400'}`}>
            {impliedCap ? `${impliedCap}%` : '-'}
          </div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Occupancy</div>
          <div className={`text-lg font-bold mt-1 ${occ >= 85 ? 'text-green-400' : occ >= 70 ? 'text-white' : 'text-red-400'}`}>
            {occ > 0 ? `${occ}%` : '-'}
          </div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Units</div>
          <div className="text-lg font-bold text-white mt-1">{units > 0 ? units : '-'}</div>
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Rating</div>
          <div className="text-lg font-bold mt-1" style={{ color: deal.leadRating === 'Hot' ? '#ef4444' : deal.leadRating === 'Warm' ? '#f97316' : '#3b82f6' }}>
            {deal.leadRating || '-'}
          </div>
        </div>
      </div>

      {/* Offer Range */}
      {offerLow && offerMid && offerHigh && (
        <div className="bg-white/[0.04] rounded-xl p-4">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Estimated Offer Range (6.5% - 8.5% Cap)</div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-xs text-white/40">Low</div>
              <div className="text-sm font-bold text-red-400">{fmtCurrency(offerLow)}</div>
            </div>
            <div className="flex-1 h-2 bg-white/10 rounded-full relative">
              <div className="absolute inset-y-0 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-green-500" style={{ left: '10%', right: '10%' }} />
              {ask > 0 && offerLow && offerHigh && (
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-amber-500 shadow-lg"
                  style={{ left: `${Math.min(Math.max(((ask - offerLow) / (offerHigh - offerLow)) * 80 + 10, 5), 95)}%` }}
                  title={`Ask: ${fmtCurrency(ask)}`} />
              )}
            </div>
            <div className="text-center">
              <div className="text-xs text-white/40">High</div>
              <div className="text-sm font-bold text-green-400">{fmtCurrency(offerHigh)}</div>
            </div>
          </div>
          <div className="text-center mt-1">
            <span className="text-xs text-white font-semibold">Mid: {fmtCurrency(offerMid)}</span>
            {ask > 0 && offerMid && <span className="text-xs text-white/30 ml-2">Ask is {ask > offerMid ? `${(((ask - offerMid) / offerMid) * 100).toFixed(0)}% above` : `${(((offerMid - ask) / offerMid) * 100).toFixed(0)}% below`} mid</span>}
          </div>
        </div>
      )}

      {/* Red Flags + Missing Data + Next Step */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-red-400" />
            <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Red Flags ({flags.length})</span>
          </div>
          {flags.length > 0 ? (
            <ul className="space-y-1">
              {flags.map((f, i) => <li key={i} className="text-xs text-white/60">• {f}</li>)}
            </ul>
          ) : <p className="text-xs text-green-400">No red flags detected</p>}
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <FileX size={12} className="text-purple-400" />
            <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Missing Data ({missing.length})</span>
          </div>
          {missing.length > 0 ? (
            <ul className="space-y-1">
              {missing.map((m, i) => <li key={i} className="text-xs text-white/60">• {m}</li>)}
            </ul>
          ) : <p className="text-xs text-green-400">All critical data present</p>}
        </div>
        <div className="bg-white/[0.04] rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-white" />
            <span className="text-[10px] text-white uppercase tracking-wider font-bold">Next Step</span>
          </div>
          <p className="text-xs text-white/80 font-medium">{nextStep}</p>
        </div>
      </div>
    </div>
  );
}

const STAGES = [
  { id: 1, name: 'Initial Contact' }, { id: 2, name: 'Intro Call Scheduled' }, { id: 3, name: 'Intro Call Complete' },
  { id: 4, name: 'LOI Sent' }, { id: 5, name: 'LOI Accepted' }, { id: 6, name: 'PSA Sent' },
  { id: 7, name: 'PSA Executed' }, { id: 8, name: 'Due Diligence' }, { id: 9, name: 'Financing' },
  { id: 10, name: 'Clear to Close' }, { id: 11, name: 'Closed' },
];

const STAGE_COLORS: Record<number, string> = {
  1: '#6b7280', 2: '#8b5cf6', 3: '#3b82f6', 4: '#06b6d4', 5: '#10b981',
  6: '#f59e0b', 7: '#f97316', 8: '#ef4444', 9: '#ec4899', 10: '#a855f7', 11: '#22c55e',
};

interface UnitMixRow {
  id?: number; unitType: string; size: string; count: string; currentRate: string; marketRate: string;
}

interface Contact {
  id: number; name: string; phone: string; email: string; type: string; company: string; notes: string;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function EditInput({ value, onChange, placeholder, type = 'text' }: { value: any; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      className="input-dark text-sm"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function EditSelect({ value, onChange, options }: { value: any; onChange: (v: string) => void; options: string[] | { value: string; label: string }[] }) {
  return (
    <select className="input-dark text-sm" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select...</option>
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const l = typeof opt === 'string' ? opt : opt.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

function EditTextarea({ value, onChange, placeholder, rows = 3 }: { value: any; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      className="input-dark text-sm resize-none"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function EditCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all ${checked ? 'bg-amber-500 border-amber-500' : 'border-white/30 bg-white/5 group-hover:border-white/50'}`}
        onClick={() => onChange(!checked)}
      >
        {checked && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <span className="text-sm text-white/70">{label}</span>
    </label>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
      <h2 className="text-base font-bold text-white mb-4">{title}</h2>
      {children}
    </div>
  );
}

export default function DealDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [deal, setDeal] = useState<any>(null);
  const [unitMix, setUnitMix] = useState<UnitMixRow[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', type: 'Seller', company: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [deletingDeal, setDeletingDeal] = useState(false);

  useEffect(() => {
if (!id) return;
    Promise.all([
      fetch(`/api/deals/${id}`, { headers: { Authorization: 'none' } }).then((r) => r.json()),
      fetch(`/api/deals/${id}/unit-mix`, { headers: { Authorization: 'none' } }).then((r) => r.json()),
      fetch(`/api/contacts?dealId=${id}`, { headers: { Authorization: 'none' } }).then((r) => r.json()),
    ]).then(([dealData, unitMixData, contactsData]) => {
      setDeal(dealData);
      setUnitMix(Array.isArray(unitMixData) ? unitMixData.map((r: any) => ({
        id: r.id, unitType: r.unitType || '', size: String(r.size || ''), count: String(r.count || ''),
        currentRate: String(r.currentRate || ''), marketRate: String(r.marketRate || ''),
      })) : []);
      setContacts(Array.isArray(contactsData) ? contactsData : []);
    }).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const set = (key: string) => (val: any) => setDeal((prev: any) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...deal,
        stage: parseInt(deal.stage) || 1,
        units: parseInt(deal.units) || null,
        yearBuilt: parseInt(deal.yearBuilt) || null,
        lotSize: parseFloat(deal.lotSize) || null,
        buildingSqFt: parseInt(deal.buildingSqFt) || null,
        sellerAskingPrice: parseFloat(deal.sellerAskingPrice) || null,
        purchasePrice: parseFloat(deal.purchasePrice) || null,
        grossRevenue: parseFloat(deal.grossRevenue) || null,
        noi: parseFloat(deal.noi) || null,
        capRate: parseFloat(deal.capRate) || null,
        occupancyRate: parseFloat(deal.occupancyRate) || null,
        avgRent: parseFloat(deal.avgRent) || null,
        marketPopulation: parseInt(deal.marketPopulation) || null,
        medianHHI: parseInt(deal.medianHHI) || null,
        competitorCount: parseInt(deal.competitorCount) || null,
        avgMarketRate: parseFloat(deal.avgMarketRate) || null,
        driveways: parseInt(deal.driveways) || null,
        finalPurchasePrice: parseFloat(deal.finalPurchasePrice) || null,
        firstMonthNOIActual: parseFloat(deal.firstMonthNOIActual) || null,
        firstMonthNOIProjected: parseFloat(deal.firstMonthNOIProjected) || null,
      };
      const res = await fetch(`/api/deals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      // Save unit mix
      if (unitMix.length > 0) {
        await fetch(`/api/deals/${id}/unit-mix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'none' },
          body: JSON.stringify({ rows: unitMix }),
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this deal? This cannot be undone.')) return;
    setDeletingDeal(true);
    try {
      await fetch(`/api/deals/${id}`, { method: 'DELETE', headers: { Authorization: 'none' } });
      router.push('/pipeline');
    } catch {
      setDeletingDeal(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim()) return;
    setSavingContact(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify({ ...newContact, dealId: id }),
      });
      const data = await res.json();
      setContacts((prev) => [...prev, { ...newContact, id: data.id, notes: '' }]);
      setNewContact({ name: '', phone: '', email: '', type: 'Seller', company: '' });
      setShowAddContact(false);
    } finally {
      setSavingContact(false);
    }
  };

  const addUnitRow = () => setUnitMix((prev) => [...prev, { unitType: '', size: '', count: '', currentRate: '', marketRate: '' }]);
  const removeUnitRow = (i: number) => setUnitMix((prev) => prev.filter((_, idx) => idx !== i));
  const updateUnitRow = (i: number, key: keyof UnitMixRow, val: string) => {
    setUnitMix((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  };

  const totalUnits = unitMix.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);
  const totalSqFt = unitMix.reduce((sum, r) => sum + (parseInt(r.count) || 0) * (parseInt(r.size) || 0), 0);
  const gpri = unitMix.reduce((sum, r) => sum + (parseInt(r.count) || 0) * (parseFloat(r.currentRate) || 0) * 12, 0);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-white/80 text-lg">Loading deal...</div></div>;
  if (!deal || deal.error) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-red-400">Deal not found. <Link href="/pipeline" className="text-white underline">Back to pipeline</Link></div></div>;

  const stageName = STAGES.find((s) => s.id === parseInt(deal.stage))?.name || 'Unknown';
  const stageColor = STAGE_COLORS[parseInt(deal.stage)] || '#6b7280';

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <Link href="/pipeline" className="text-white/50 hover:text-white transition-colors flex-shrink-0">
                <ArrowLeft size={20} />
              </Link>
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate">{deal.propertyName || `Deal #${id}`}</h1>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: stageColor, background: `${stageColor}20` }}>{stageName}</span>
                  {deal.city && <span className="text-white/40 text-xs">{[deal.city, deal.state].filter(Boolean).join(', ')}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {saved && <span className="text-green-400 text-sm font-medium">Saved!</span>}
              <Link href={`/analyzer?dealId=${id}`} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg text-sm hover:bg-purple-500/30 transition-colors">
                <ExternalLink size={14} /> Analyze
              </Link>
              <Link href={`/due-diligence?dealId=${id}`} className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm hover:bg-blue-500/30 transition-colors">
                <ExternalLink size={14} /> DD
              </Link>
              <button
                onClick={handleDelete}
                disabled={deletingDeal}
                className="p-2 text-white/30 hover:text-red-400 transition-colors"
                title="Delete deal"
              >
                <Trash2 size={18} />
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#09090b] rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
        </header>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Deal Brief / Investment Snapshot */}
          <DealBrief deal={deal} />

          {/* Stage Quick Change */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-4">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-sm text-white/50 font-medium">Pipeline Stage:</span>
              <div className="flex gap-2 flex-wrap">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => set('stage')(String(s.id))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${parseInt(deal.stage) === s.id ? 'text-black' : 'text-white/50 hover:text-white bg-white/5 hover:bg-white/10'}`}
                    style={parseInt(deal.stage) === s.id ? { background: STAGE_COLORS[s.id], color: 'black' } : {}}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Seller / Contact */}
          <SectionCard title="Seller / Contact Info">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Seller Name"><EditInput value={deal.sellerName} onChange={set('sellerName')} placeholder="John Smith" /></Field>
              <Field label="Seller Phone">
                <div className="relative">
                  <EditInput value={deal.sellerPhone} onChange={set('sellerPhone')} placeholder="(555) 000-0000" type="tel" />
                  {deal.sellerPhone && (
                    <a href={`tel:${deal.sellerPhone}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-300 text-xs font-medium flex items-center gap-1">
                      <Phone size={12} /> Call
                    </a>
                  )}
                </div>
              </Field>
              <Field label="Seller Email">
                <div className="relative">
                  <EditInput value={deal.sellerEmail} onChange={set('sellerEmail')} placeholder="seller@email.com" type="email" />
                  {deal.sellerEmail && (
                    <a href={`mailto:${deal.sellerEmail}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300 text-xs font-medium flex items-center gap-1">
                      <Mail size={12} /> Email
                    </a>
                  )}
                </div>
              </Field>
              <Field label="Lead Source">
                <EditSelect value={deal.leadSource} onChange={set('leadSource')} options={['Cold Call', 'Direct Mail', 'Broker', 'Referral', 'Online', 'Drive By', 'Other']} />
              </Field>
              <Field label="Lead Rating">
                <EditSelect value={deal.leadRating} onChange={set('leadRating')} options={['Hot', 'Warm', 'Cold']} />
              </Field>
            </div>
          </SectionCard>

          {/* Property Info */}
          <SectionCard title="Property Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Property Name"><EditInput value={deal.propertyName} onChange={set('propertyName')} placeholder="ABC Self Storage" /></Field>
              <Field label="Street Address"><EditInput value={deal.address} onChange={set('address')} placeholder="123 Main St" /></Field>
              <Field label="City"><EditInput value={deal.city} onChange={set('city')} placeholder="Austin" /></Field>
              <Field label="State"><EditInput value={deal.state} onChange={set('state')} placeholder="TX" /></Field>
              <Field label="Zip Code"><EditInput value={deal.zip} onChange={set('zip')} placeholder="78701" /></Field>
              <Field label="County"><EditInput value={deal.county} onChange={set('county')} placeholder="Travis" /></Field>
            </div>
          </SectionCard>

          {/* Physical Details */}
          <SectionCard title="Physical Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Field label="Total Units"><EditInput value={deal.units} onChange={set('units')} type="number" /></Field>
              <Field label="Year Built"><EditInput value={deal.yearBuilt} onChange={set('yearBuilt')} type="number" /></Field>
              <Field label="Lot Size (acres)"><EditInput value={deal.lotSize} onChange={set('lotSize')} type="number" /></Field>
              <Field label="Building Sq Ft"><EditInput value={deal.buildingSqFt} onChange={set('buildingSqFt')} type="number" /></Field>
              <Field label="Number of Driveways"><EditInput value={deal.driveways} onChange={set('driveways')} type="number" /></Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <EditCheckbox label="Climate Control" checked={!!deal.hasClimateControl} onChange={set('hasClimateControl') as any} />
              <EditCheckbox label="Outdoor Parking" checked={!!deal.hasOutdoorParking} onChange={set('hasOutdoorParking') as any} />
              <EditCheckbox label="Covered Parking" checked={!!deal.hasCoveredParking} onChange={set('hasCoveredParking') as any} />
              <EditCheckbox label="RV / Boat Storage" checked={!!deal.hasRvBoat} onChange={set('hasRvBoat') as any} />
            </div>
          </SectionCard>

          {/* Unit Mix */}
          <SectionCard title="Unit Mix">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/40 text-xs">
                    <th className="text-left pb-2 pr-3 font-medium">Unit Type</th>
                    <th className="text-left pb-2 pr-3 font-medium">Size (sqft)</th>
                    <th className="text-left pb-2 pr-3 font-medium">Count</th>
                    <th className="text-left pb-2 pr-3 font-medium">Current Rate/mo</th>
                    <th className="text-left pb-2 pr-3 font-medium">Market Rate/mo</th>
                    <th className="text-left pb-2 font-medium">Total Sqft</th>
                    <th className="pb-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {unitMix.map((row, i) => {
                    const rowSqFt = (parseInt(row.count) || 0) * (parseInt(row.size) || 0);
                    return (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" value={row.unitType} onChange={(e) => updateUnitRow(i, 'unitType', e.target.value)} placeholder="10x10" /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.size} onChange={(e) => updateUnitRow(i, 'size', e.target.value)} /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.count} onChange={(e) => updateUnitRow(i, 'count', e.target.value)} /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.currentRate} onChange={(e) => updateUnitRow(i, 'currentRate', e.target.value)} /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.marketRate} onChange={(e) => updateUnitRow(i, 'marketRate', e.target.value)} /></td>
                        <td className="py-1.5 pr-3 text-white/50 text-xs">{rowSqFt > 0 ? rowSqFt.toLocaleString() : '-'}</td>
                        <td className="py-1.5"><button type="button" onClick={() => removeUnitRow(i)} className="text-white/20 hover:text-red-400 transition-colors"><Trash2 size={14} /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between mt-3">
              <button type="button" onClick={addUnitRow} className="flex items-center gap-1.5 text-sm text-white hover:text-white/80 transition-colors">
                <Plus size={14} /> Add Row
              </button>
              <div className="flex items-center gap-6 text-xs text-white/50">
                <span>Total: <span className="text-white font-semibold">{totalUnits} units</span></span>
                <span>Sq Ft: <span className="text-white font-semibold">{totalSqFt.toLocaleString()}</span></span>
                <span>GPRI: <span className="text-white font-semibold">${gpri.toLocaleString()}/yr</span></span>
              </div>
            </div>
          </SectionCard>

          {/* Operations */}
          <SectionCard title="Operations">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Field label="Management Type">
                <EditSelect value={deal.managementType} onChange={set('managementType')} options={['Self-Managed', 'Third Party', 'Hybrid']} />
              </Field>
              <Field label="Management Software"><EditInput value={deal.managementSoftware} onChange={set('managementSoftware')} placeholder="SiteLink, StorEdge..." /></Field>
              <Field label="Gate System"><EditInput value={deal.gateSystem} onChange={set('gateSystem')} placeholder="PTI, Noke..." /></Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <EditCheckbox label="On-Site Manager" checked={!!deal.onSiteManager} onChange={set('onSiteManager') as any} />
              <EditCheckbox label="Security Cameras" checked={!!deal.securityCameras} onChange={set('securityCameras') as any} />
              <EditCheckbox label="Fencing" checked={!!deal.fencing} onChange={set('fencing') as any} />
              <EditCheckbox label="Lighting" checked={!!deal.lighting} onChange={set('lighting') as any} />
            </div>
          </SectionCard>

          {/* Financials */}
          <SectionCard title="Financials">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Seller Asking Price"><EditInput value={deal.sellerAskingPrice} onChange={set('sellerAskingPrice')} type="number" /></Field>
              <Field label="Our Purchase Price"><EditInput value={deal.purchasePrice} onChange={set('purchasePrice')} type="number" /></Field>
              <Field label="Gross Revenue (Annual)"><EditInput value={deal.grossRevenue} onChange={set('grossRevenue')} type="number" /></Field>
              <Field label="NOI (Annual)"><EditInput value={deal.noi} onChange={set('noi')} type="number" /></Field>
              <Field label="Cap Rate (%)"><EditInput value={deal.capRate} onChange={set('capRate')} type="number" /></Field>
              <Field label="Occupancy Rate (%)"><EditInput value={deal.occupancyRate} onChange={set('occupancyRate')} type="number" /></Field>
              <Field label="Avg Monthly Rent"><EditInput value={deal.avgRent} onChange={set('avgRent')} type="number" /></Field>
            </div>
          </SectionCard>

          {/* Market Statistics */}
          <SectionCard title="Market Statistics">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Field label="Population (5-mile)"><EditInput value={deal.marketPopulation} onChange={set('marketPopulation')} type="number" /></Field>
              <Field label="Median HHI"><EditInput value={deal.medianHHI} onChange={set('medianHHI')} type="number" /></Field>
              <Field label="Competitor Count"><EditInput value={deal.competitorCount} onChange={set('competitorCount')} type="number" /></Field>
              <Field label="Avg Market Rate/sqft"><EditInput value={deal.avgMarketRate} onChange={set('avgMarketRate')} type="number" /></Field>
            </div>
            <Field label="Market Notes"><EditTextarea value={deal.marketNotes} onChange={set('marketNotes')} rows={3} /></Field>
          </SectionCard>

          {/* Closing Info (Stage 11) */}
          {parseInt(deal.stage) >= 10 && (
            <SectionCard title="Closing Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Field label="Final Purchase Price"><EditInput value={deal.finalPurchasePrice} onChange={set('finalPurchasePrice')} type="number" /></Field>
                <Field label="Closing Date"><EditInput value={deal.closingDate} onChange={set('closingDate')} type="date" /></Field>
                <Field label="Financing Structure"><EditInput value={deal.financingStructure} onChange={set('financingStructure')} placeholder="Conventional, Bridge, Seller Finance..." /></Field>
                <Field label="Entity Taking Title"><EditInput value={deal.entityTakingTitle} onChange={set('entityTakingTitle')} placeholder="Vault Ventures LLC" /></Field>
                <Field label="Property Management Assigned"><EditInput value={deal.propertyManagementAssigned} onChange={set('propertyManagementAssigned')} placeholder="Management company name" /></Field>
                <Field label="First Month NOI (Actual)"><EditInput value={deal.firstMonthNOIActual} onChange={set('firstMonthNOIActual')} type="number" /></Field>
                <Field label="First Month NOI (Projected)"><EditInput value={deal.firstMonthNOIProjected} onChange={set('firstMonthNOIProjected')} type="number" /></Field>
              </div>
            </SectionCard>
          )}

          {/* Notes */}
          <SectionCard title="Notes">
            <div className="space-y-4">
              <Field label="Deal Notes"><EditTextarea value={deal.notes} onChange={set('notes')} placeholder="General notes..." rows={4} /></Field>
              <Field label="Value-Add Strategy"><EditTextarea value={deal.valueAddNotes} onChange={set('valueAddNotes')} placeholder="Rate increases, expense reductions, expansion..." rows={4} /></Field>
            </div>
          </SectionCard>

          {/* Contacts */}
          <SectionCard title="Contacts">
            <div className="space-y-3 mb-4">
              {contacts.length === 0 ? (
                <p className="text-white/30 text-sm">No contacts added yet.</p>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="flex items-start justify-between p-3 bg-white/5 border border-white/[0.05] rounded-xl">
                    <div>
                      <div className="font-semibold text-white text-sm">{c.name}</div>
                      {c.type && <div className="text-xs text-white/80 mt-0.5">{c.type}</div>}
                      {c.company && <div className="text-xs text-white/40">{c.company}</div>}
                      <div className="flex items-center gap-3 mt-1.5">
                        {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300"><Phone size={11} /> {c.phone}</a>}
                        {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300"><Mail size={11} /> {c.email}</a>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {showAddContact ? (
              <div className="bg-white/5 border border-white/[0.06] rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-white">Add Contact</h4>
                {[{ k: 'name', l: 'Name *', p: 'Full name' }, { k: 'phone', l: 'Phone', p: '(555) 000-0000' }, { k: 'email', l: 'Email', p: 'email@example.com' }, { k: 'company', l: 'Company', p: 'Company name' }].map((f) => (
                  <div key={f.k}>
                    <label className="block text-xs text-white/50 mb-1">{f.l}</label>
                    <input className="input-dark text-sm" placeholder={f.p} value={(newContact as any)[f.k]} onChange={(e) => setNewContact({ ...newContact, [f.k]: e.target.value })} />
                  </div>
                ))}
                <div>
                  <label className="block text-xs text-white/50 mb-1">Type</label>
                  <select className="input-dark text-sm" value={newContact.type} onChange={(e) => setNewContact({ ...newContact, type: e.target.value })}>
                    {['Seller', 'Broker', 'Attorney', 'Lender', 'Property Manager', 'Inspector', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAddContact(false)} className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/15">Cancel</button>
                  <button onClick={handleAddContact} disabled={savingContact || !newContact.name.trim()} className="flex-1 px-3 py-2 bg-white text-[#09090b] rounded-lg font-semibold text-sm hover:bg-white/90 disabled:opacity-50">
                    {savingContact ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddContact(true)} className="flex items-center gap-2 text-sm text-white hover:text-white/80 transition-colors">
                <Plus size={15} /> Add Contact
              </button>
            )}
          </SectionCard>

          {/* Save Button Bottom */}
          <div className="flex justify-end pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-white text-[#09090b] rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm disabled:opacity-50"
            >
              <Save size={15} />
              {saving ? 'Saving Changes...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
