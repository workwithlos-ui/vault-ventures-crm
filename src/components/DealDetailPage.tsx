import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NavSidebar } from './PipelinePage';
import { ArrowLeft, Save, Trash2, Plus, Phone, Mail, ExternalLink } from 'lucide-react';

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
    <div className="bg-white/3 border border-white/10 rounded-2xl p-6">
      <h2 className="text-base font-bold text-amber-400 mb-4">{title}</h2>
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
  const [token, setToken] = useState('');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', email: '', type: 'Seller', company: '' });
  const [savingContact, setSavingContact] = useState(false);
  const [deletingDeal, setDeletingDeal] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    if (!id) return;
    Promise.all([
      fetch(`/api/deals/${id}`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
      fetch(`/api/deals/${id}/unit-mix`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
      fetch(`/api/contacts?dealId=${id}`, { headers: { Authorization: `Bearer ${t}` } }).then((r) => r.json()),
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save');
      // Save unit mix
      if (unitMix.length > 0) {
        await fetch(`/api/deals/${id}/unit-mix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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
      await fetch(`/api/deals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
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
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
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

  if (loading) return <div className="min-h-screen bg-gradient-dark flex items-center justify-center"><div className="text-amber-500 text-lg">Loading deal...</div></div>;
  if (!deal || deal.error) return <div className="min-h-screen bg-gradient-dark flex items-center justify-center"><div className="text-red-400">Deal not found. <Link href="/pipeline" className="text-amber-400 underline">Back to pipeline</Link></div></div>;

  const stageName = STAGES.find((s) => s.id === parseInt(deal.stage))?.name || 'Unknown';
  const stageColor = STAGE_COLORS[parseInt(deal.stage)] || '#6b7280';

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-56">
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 sticky top-0 z-40">
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
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm disabled:opacity-50"
              >
                <Save size={15} />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
          {error && <div className="mt-2 text-red-400 text-sm">{error}</div>}
        </header>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Stage Quick Change */}
          <div className="bg-white/3 border border-white/10 rounded-2xl p-4">
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
              <button type="button" onClick={addUnitRow} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                <Plus size={14} /> Add Row
              </button>
              <div className="flex items-center gap-6 text-xs text-white/50">
                <span>Total: <span className="text-white font-semibold">{totalUnits} units</span></span>
                <span>Sq Ft: <span className="text-white font-semibold">{totalSqFt.toLocaleString()}</span></span>
                <span>GPRI: <span className="text-amber-400 font-semibold">${gpri.toLocaleString()}/yr</span></span>
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
                  <div key={c.id} className="flex items-start justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div>
                      <div className="font-semibold text-white text-sm">{c.name}</div>
                      {c.type && <div className="text-xs text-amber-400/80 mt-0.5">{c.type}</div>}
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
              <div className="bg-white/5 border border-white/15 rounded-xl p-4 space-y-3">
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
                  <button onClick={handleAddContact} disabled={savingContact || !newContact.name.trim()} className="flex-1 px-3 py-2 bg-amber-500 text-black rounded-lg font-semibold text-sm hover:bg-amber-600 disabled:opacity-50">
                    {savingContact ? 'Saving...' : 'Save Contact'}
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowAddContact(true)} className="flex items-center gap-2 text-sm text-amber-400 hover:text-amber-300 transition-colors">
                <Plus size={15} /> Add Contact
              </button>
            )}
          </SectionCard>

          {/* Save Button Bottom */}
          <div className="flex justify-end pb-8">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm disabled:opacity-50"
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
