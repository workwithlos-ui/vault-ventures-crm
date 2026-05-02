import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NavSidebar } from './PipelinePage';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';

interface UnitMixRow {
  unitType: string;
  size: string;
  count: string;
  currentRate: string;
  marketRate: string;
}

const STAGES = [
  { id: 1, name: 'Initial Contact' }, { id: 2, name: 'Intro Call Scheduled' }, { id: 3, name: 'Intro Call Complete' },
  { id: 4, name: 'LOI Sent' }, { id: 5, name: 'LOI Accepted' }, { id: 6, name: 'PSA Sent' },
  { id: 7, name: 'PSA Executed' }, { id: 8, name: 'Due Diligence' }, { id: 9, name: 'Financing' },
  { id: 10, name: 'Clear to Close' }, { id: 11, name: 'Closed' },
];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {subtitle && <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/60 mb-1.5">
        {label}{required && <span className="text-white/80 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text' }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      className="input-dark text-sm"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] | { value: string; label: string }[] }) {
  return (
    <select className="input-dark text-sm" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Select...</option>
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const l = typeof opt === 'string' ? opt : opt.label;
        return <option key={v} value={v}>{l}</option>;
      })}
    </select>
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      className="input-dark text-sm resize-none"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
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

export default function NewDealPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    // Seller / Contact
    sellerName: '', sellerPhone: '', sellerEmail: '', leadSource: '', leadRating: '', stage: '1',
    // Property
    propertyName: '', address: '', city: '', state: '', zip: '', county: '',
    // Physical
    units: '', yearBuilt: '', lotSize: '', buildingSqFt: '', driveways: '',
    // Operations
    managementType: '', managementSoftware: '', gateSystem: '',
    onSiteManager: false, securityCameras: false, fencing: false, lighting: false,
    hasClimateControl: false, hasOutdoorParking: false, hasCoveredParking: false, hasRvBoat: false,
    // Financials
    sellerAskingPrice: '', purchasePrice: '', grossRevenue: '', noi: '', capRate: '', occupancyRate: '', avgRent: '',
    // Market
    marketPopulation: '', medianHHI: '', competitorCount: '', avgMarketRate: '', marketNotes: '',
    // Notes
    notes: '', valueAddNotes: '',
  });

  const [unitMix, setUnitMix] = useState<UnitMixRow[]>([
    { unitType: '5x5', size: '25', count: '', currentRate: '', marketRate: '' },
    { unitType: '5x10', size: '50', count: '', currentRate: '', marketRate: '' },
    { unitType: '10x10', size: '100', count: '', currentRate: '', marketRate: '' },
    { unitType: '10x15', size: '150', count: '', currentRate: '', marketRate: '' },
    { unitType: '10x20', size: '200', count: '', currentRate: '', marketRate: '' },
    { unitType: '10x30', size: '300', count: '', currentRate: '', marketRate: '' },
  ]);

  const set = (key: string) => (val: string | boolean) => setForm((prev) => ({ ...prev, [key]: val }));

  const totalUnits = unitMix.reduce((sum, r) => sum + (parseInt(r.count) || 0), 0);
  const totalSqFt = unitMix.reduce((sum, r) => sum + (parseInt(r.count) || 0) * (parseInt(r.size) || 0), 0);
  const gpri = unitMix.reduce((sum, r) => sum + (parseInt(r.count) || 0) * (parseFloat(r.currentRate) || 0) * 12, 0);

  const addUnitRow = () => setUnitMix((prev) => [...prev, { unitType: '', size: '', count: '', currentRate: '', marketRate: '' }]);
  const removeUnitRow = (i: number) => setUnitMix((prev) => prev.filter((_, idx) => idx !== i));
  const updateUnitRow = (i: number, key: keyof UnitMixRow, val: string) => {
    setUnitMix((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: val } : r));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.propertyName.trim()) { setError('Property name is required.'); return; }
    setSaving(true);
    setError('');
    try {
const payload = {
        ...form,
        stage: parseInt(form.stage) || 1,
        units: totalUnits || parseInt(form.units) || 0,
        yearBuilt: parseInt(form.yearBuilt) || null,
        lotSize: parseFloat(form.lotSize) || null,
        buildingSqFt: parseInt(form.buildingSqFt) || totalSqFt || null,
        sellerAskingPrice: parseFloat(form.sellerAskingPrice) || null,
        purchasePrice: parseFloat(form.purchasePrice) || null,
        grossRevenue: parseFloat(form.grossRevenue) || gpri || null,
        noi: parseFloat(form.noi) || null,
        capRate: parseFloat(form.capRate) || null,
        occupancyRate: parseFloat(form.occupancyRate) || null,
        avgRent: parseFloat(form.avgRent) || null,
        marketPopulation: parseInt(form.marketPopulation) || null,
        medianHHI: parseInt(form.medianHHI) || null,
        competitorCount: parseInt(form.competitorCount) || null,
        avgMarketRate: parseFloat(form.avgMarketRate) || null,
        driveways: parseInt(form.driveways) || null,
      };
      const res = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create deal');
      const { id } = await res.json();
      // Save unit mix
      if (unitMix.some((r) => r.count)) {
        await fetch(`/api/deals/${id}/unit-mix`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: 'none' },
          body: JSON.stringify({ rows: unitMix.filter((r) => r.count) }),
        });
      }
      router.push(`/deals/${id}`);
    } catch (err) {
      setError('Failed to save deal. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <Link href="/pipeline" className="text-white/50 hover:text-white transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">New Deal</h1>
              <p className="text-white/50 text-sm">Add a new acquisition to the pipeline</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2 bg-white text-[#09090b] rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Deal'}
          </button>
        </header>

        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto p-6 space-y-8">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 text-sm">{error}</div>}

          {/* Seller / Contact Info */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Seller / Contact Info" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Seller Name"><Input value={form.sellerName} onChange={set('sellerName')} placeholder="John Smith" /></Field>
              <Field label="Seller Phone">
                <div className="relative">
                  <Input value={form.sellerPhone} onChange={set('sellerPhone')} placeholder="(555) 000-0000" type="tel" />
                  {form.sellerPhone && (
                    <a href={`tel:${form.sellerPhone}`} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400 hover:text-green-300 text-xs font-medium">Call</a>
                  )}
                </div>
              </Field>
              <Field label="Seller Email"><Input value={form.sellerEmail} onChange={set('sellerEmail')} placeholder="seller@email.com" type="email" /></Field>
              <Field label="Lead Source">
                <Select value={form.leadSource} onChange={set('leadSource')} options={['Cold Call', 'Direct Mail', 'Broker', 'Referral', 'Online', 'Drive By', 'Other']} />
              </Field>
              <Field label="Lead Rating">
                <Select value={form.leadRating} onChange={set('leadRating')} options={['Hot', 'Warm', 'Cold']} />
              </Field>
              <Field label="Pipeline Stage">
                <Select value={form.stage} onChange={set('stage')} options={STAGES.map((s) => ({ value: String(s.id), label: s.name }))} />
              </Field>
            </div>
          </div>

          {/* Property Info */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Property Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Property Name" required><Input value={form.propertyName} onChange={set('propertyName')} placeholder="ABC Self Storage" /></Field>
              <Field label="Street Address"><Input value={form.address} onChange={set('address')} placeholder="123 Main St" /></Field>
              <Field label="City"><Input value={form.city} onChange={set('city')} placeholder="Austin" /></Field>
              <Field label="State"><Input value={form.state} onChange={set('state')} placeholder="TX" /></Field>
              <Field label="Zip Code"><Input value={form.zip} onChange={set('zip')} placeholder="78701" /></Field>
              <Field label="County"><Input value={form.county} onChange={set('county')} placeholder="Travis" /></Field>
            </div>
          </div>

          {/* Physical Details */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Physical Details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Field label="Total Units"><Input value={form.units} onChange={set('units')} placeholder="Auto-calc from unit mix" type="number" /></Field>
              <Field label="Year Built"><Input value={form.yearBuilt} onChange={set('yearBuilt')} placeholder="1995" type="number" /></Field>
              <Field label="Lot Size (acres)"><Input value={form.lotSize} onChange={set('lotSize')} placeholder="2.5" type="number" /></Field>
              <Field label="Building Sq Ft"><Input value={form.buildingSqFt} onChange={set('buildingSqFt')} placeholder="Auto-calc from unit mix" type="number" /></Field>
              <Field label="Number of Driveways"><Input value={form.driveways} onChange={set('driveways')} placeholder="2" type="number" /></Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Checkbox label="Climate Control" checked={form.hasClimateControl} onChange={set('hasClimateControl') as any} />
              <Checkbox label="Outdoor Parking" checked={form.hasOutdoorParking} onChange={set('hasOutdoorParking') as any} />
              <Checkbox label="Covered Parking" checked={form.hasCoveredParking} onChange={set('hasCoveredParking') as any} />
              <Checkbox label="RV / Boat Storage" checked={form.hasRvBoat} onChange={set('hasRvBoat') as any} />
            </div>
          </div>

          {/* Unit Mix */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Unit Mix" subtitle="Auto-calculates total units, sq ft, and GPRI" />
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
                <tbody className="space-y-2">
                  {unitMix.map((row, i) => {
                    const rowSqFt = (parseInt(row.count) || 0) * (parseInt(row.size) || 0);
                    const rowGPRI = (parseInt(row.count) || 0) * (parseFloat(row.currentRate) || 0) * 12;
                    return (
                      <tr key={i} className="border-t border-white/5">
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" value={row.unitType} onChange={(e) => updateUnitRow(i, 'unitType', e.target.value)} placeholder="10x10" /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.size} onChange={(e) => updateUnitRow(i, 'size', e.target.value)} placeholder="100" /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.count} onChange={(e) => updateUnitRow(i, 'count', e.target.value)} placeholder="0" /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.currentRate} onChange={(e) => updateUnitRow(i, 'currentRate', e.target.value)} placeholder="$0" /></td>
                        <td className="py-1.5 pr-3"><input className="input-dark text-xs py-1.5" type="number" value={row.marketRate} onChange={(e) => updateUnitRow(i, 'marketRate', e.target.value)} placeholder="$0" /></td>
                        <td className="py-1.5 pr-3 text-white/50 text-xs">{rowSqFt > 0 ? rowSqFt.toLocaleString() : '-'}</td>
                        <td className="py-1.5">
                          <button type="button" onClick={() => removeUnitRow(i)} className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </td>
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
          </div>

          {/* Operations */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Operations" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Field label="Management Type">
                <Select value={form.managementType} onChange={set('managementType')} options={['Self-Managed', 'Third Party', 'Hybrid']} />
              </Field>
              <Field label="Management Software"><Input value={form.managementSoftware} onChange={set('managementSoftware')} placeholder="SiteLink, StorEdge, etc." /></Field>
              <Field label="Gate System"><Input value={form.gateSystem} onChange={set('gateSystem')} placeholder="PTI, Noke, etc." /></Field>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Checkbox label="On-Site Manager" checked={form.onSiteManager} onChange={set('onSiteManager') as any} />
              <Checkbox label="Security Cameras" checked={form.securityCameras} onChange={set('securityCameras') as any} />
              <Checkbox label="Fencing" checked={form.fencing} onChange={set('fencing') as any} />
              <Checkbox label="Lighting" checked={form.lighting} onChange={set('lighting') as any} />
            </div>
          </div>

          {/* Financials */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Financials" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field label="Seller Asking Price"><Input value={form.sellerAskingPrice} onChange={set('sellerAskingPrice')} placeholder="$0" type="number" /></Field>
              <Field label="Our Purchase Price"><Input value={form.purchasePrice} onChange={set('purchasePrice')} placeholder="$0" type="number" /></Field>
              <Field label="Gross Revenue (Annual)"><Input value={form.grossRevenue} onChange={set('grossRevenue')} placeholder={gpri > 0 ? `$${gpri.toLocaleString()} (from unit mix)` : '$0'} type="number" /></Field>
              <Field label="NOI (Annual)"><Input value={form.noi} onChange={set('noi')} placeholder="$0" type="number" /></Field>
              <Field label="Cap Rate (%)"><Input value={form.capRate} onChange={set('capRate')} placeholder="6.5" type="number" /></Field>
              <Field label="Occupancy Rate (%)"><Input value={form.occupancyRate} onChange={set('occupancyRate')} placeholder="85" type="number" /></Field>
              <Field label="Avg Monthly Rent"><Input value={form.avgRent} onChange={set('avgRent')} placeholder="$0" type="number" /></Field>
            </div>
          </div>

          {/* Market Statistics */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Market Statistics" subtitle="1/3/5-mile radius data" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <Field label="Population (5-mile)"><Input value={form.marketPopulation} onChange={set('marketPopulation')} placeholder="50000" type="number" /></Field>
              <Field label="Median HHI"><Input value={form.medianHHI} onChange={set('medianHHI')} placeholder="65000" type="number" /></Field>
              <Field label="Competitor Count"><Input value={form.competitorCount} onChange={set('competitorCount')} placeholder="3" type="number" /></Field>
              <Field label="Avg Market Rate/sqft"><Input value={form.avgMarketRate} onChange={set('avgMarketRate')} placeholder="1.25" type="number" /></Field>
            </div>
            <Field label="Market Notes">
              <Textarea value={form.marketNotes} onChange={set('marketNotes')} placeholder="Notes on local market conditions, competition, demand drivers..." rows={3} />
            </Field>
          </div>

          {/* Notes */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <SectionHeader title="Notes" />
            <div className="space-y-4">
              <Field label="Deal Notes">
                <Textarea value={form.notes} onChange={set('notes')} placeholder="General notes about this deal, seller motivations, timeline..." rows={4} />
              </Field>
              <Field label="Value-Add Strategy">
                <Textarea value={form.valueAddNotes} onChange={set('valueAddNotes')} placeholder="Rate increases, expense reductions, expansion opportunities, tech upgrades..." rows={4} />
              </Field>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-between pb-8">
            <Link href="/pipeline" className="px-5 py-2 bg-white/10 text-white rounded-lg hover:bg-white/15 transition-colors text-sm">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-white text-[#09090b] rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm disabled:opacity-50"
            >
              {saving ? 'Saving Deal...' : 'Save Deal to Pipeline'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
