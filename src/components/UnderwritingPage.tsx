import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NavSidebar } from './PipelinePage';
import { Calculator, ChevronDown, TrendingUp, DollarSign, Shield, AlertTriangle, CheckCircle, XCircle, Target, Zap } from 'lucide-react';

function getVerdict(noi: number, offerMid: number, sellerAsking: number, impliedCap: number, capRateMid: number, occupancy: number, units: number) {
  if (noi <= 0) return { verdict: 'Insufficient Data', color: '#6b7280', icon: AlertTriangle, reasons: ['NOI not available — cannot underwrite'], assumption: 'N/A', risk: 'N/A' };
  const gap = sellerAsking > 0 ? ((sellerAsking - offerMid) / offerMid) * 100 : 0;
  const reasons: string[] = [];
  const risks: string[] = [];
  let score = 50;

  // Cap rate analysis
  if (impliedCap >= capRateMid + 1) { score += 20; reasons.push(`Strong cap rate at ${impliedCap.toFixed(1)}% — above target`); }
  else if (impliedCap >= capRateMid) { score += 10; reasons.push(`Cap rate at ${impliedCap.toFixed(1)}% meets target`); }
  else if (impliedCap > 0) { score -= 15; risks.push(`Cap rate ${impliedCap.toFixed(1)}% below ${capRateMid}% target`); }

  // Price gap
  if (sellerAsking > 0 && gap <= -5) { score += 15; reasons.push('Asking price below mid offer — strong negotiating position'); }
  else if (sellerAsking > 0 && gap <= 5) { score += 5; reasons.push('Asking price close to mid offer — negotiable'); }
  else if (sellerAsking > 0 && gap > 15) { score -= 15; risks.push(`Seller asking ${gap.toFixed(0)}% above mid offer — significant gap`); }
  else if (sellerAsking > 0) { score -= 5; risks.push(`Seller asking ${gap.toFixed(0)}% above mid offer`); }

  // Occupancy
  if (occupancy >= 90) { score += 10; reasons.push(`High occupancy at ${occupancy}%`); }
  else if (occupancy >= 80) { score += 5; }
  else if (occupancy > 0 && occupancy < 70) { score -= 10; risks.push(`Low occupancy at ${occupancy}% — lease-up risk`); }
  else if (occupancy > 0) { risks.push(`Moderate occupancy at ${occupancy}%`); }

  // NOI strength
  if (noi > 200000) { score += 5; reasons.push(`Strong NOI at $${(noi/1000).toFixed(0)}K`); }

  // Determine verdict
  let verdict: string, color: string, icon: any;
  if (score >= 70) { verdict = 'Looks Attractive'; color = '#22c55e'; icon = CheckCircle; }
  else if (score >= 45) { verdict = 'Borderline'; color = '#f59e0b'; icon = AlertTriangle; }
  else { verdict = 'High Risk'; color = '#ef4444'; icon = XCircle; }

  const topReasons = reasons.slice(0, 3);
  if (topReasons.length < 3 && risks.length > 0) topReasons.push(...risks.slice(0, 3 - topReasons.length));

  const assumption = occupancy > 0 ? `Assumes ${occupancy}% occupancy is sustainable and market rents hold` : 'Assumes current income levels are sustainable';
  const biggestRisk = risks[0] || (occupancy < 80 ? 'Lease-up risk if occupancy drops' : 'Market rate compression in competitive environment');

  return { verdict, color, icon, reasons: topReasons, assumption, risk: biggestRisk, offerLow: noi / (capRateMid / 100 + 0.01), offerHigh: noi / (capRateMid / 100 - 0.01) };
}

interface Deal {
  id: number; propertyName: string; city: string; state: string; units: number;
  sellerAskingPrice: number; noi: number; capRate: number; occupancyRate: number;
  grossRevenue: number; avgRent: number;
}

interface UnitMixRow {
  unitType: string; size: number; count: number; currentRate: number; marketRate: number;
}

function formatCurrency(val: number) {
  if (!val || isNaN(val)) return '$0';
  if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
  if (val >= 1000) return `$${(val / 1000).toFixed(1)}K`;
  return `$${val.toLocaleString()}`;
}

export default function UnderwritingPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [unitMix, setUnitMix] = useState<UnitMixRow[]>([]);
  const [loading, setLoading] = useState(true);
// Inputs
  const [economicOccupancy, setEconomicOccupancy] = useState('85');
  const [expenseRatio, setExpenseRatio] = useState('35');
  const [capRateLow, setCapRateLow] = useState('5.5');
  const [capRateMid, setCapRateMid] = useState('6.5');
  const [capRateHigh, setCapRateHigh] = useState('7.5');
  const [managementFee, setManagementFee] = useState('8');
  const [insurance, setInsurance] = useState('');
  const [taxes, setTaxes] = useState('');
  const [maintenance, setMaintenance] = useState('');
  const [utilities, setUtilities] = useState('');
  const [other, setOther] = useState('');

  useEffect(() => {
fetch('/api/deals', { headers: { Authorization: 'none' } })
      .then((r) => r.json())
      .then((data) => {
        setDeals(Array.isArray(data) ? data : []);
        const qid = router.query.dealId as string;
        if (qid) setSelectedDealId(qid);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router.query.dealId]);

  useEffect(() => {
    if (!selectedDealId) return;
fetch(`/api/deals/${selectedDealId}/unit-mix`, { headers: { Authorization: 'none' } })
      .then((r) => r.json())
      .then((data) => setUnitMix(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [selectedDealId]);

  const selectedDeal = deals.find((d) => String(d.id) === selectedDealId);

  // Calculations
  const gpriFromMix = unitMix.reduce((sum, r) => sum + (Number(r.count) || 0) * (Number(r.currentRate) || 0) * 12, 0);
  const gpri = gpriFromMix > 0 ? gpriFromMix : Number(selectedDeal?.grossRevenue) || 0;
  const egi = gpri * (parseFloat(economicOccupancy) / 100);

  const mgmtFeeAmt = egi * (parseFloat(managementFee) / 100);
  const insuranceAmt = parseFloat(insurance) || (egi * 0.04);
  const taxesAmt = parseFloat(taxes) || (egi * 0.06);
  const maintenanceAmt = parseFloat(maintenance) || (egi * 0.05);
  const utilitiesAmt = parseFloat(utilities) || (egi * 0.03);
  const otherAmt = parseFloat(other) || 0;
  const totalExpenses = mgmtFeeAmt + insuranceAmt + taxesAmt + maintenanceAmt + utilitiesAmt + otherAmt;
  const expenseRatioCalc = egi > 0 ? (totalExpenses / egi) * 100 : 0;
  const noi = egi - totalExpenses;

  const offerLow = noi / (parseFloat(capRateHigh) / 100);
  const offerMid = noi / (parseFloat(capRateMid) / 100);
  const offerHigh = noi / (parseFloat(capRateLow) / 100);

  const sellerAsking = Number(selectedDeal?.sellerAskingPrice) || 0;
  const impliedCapRate = sellerAsking > 0 && noi > 0 ? (noi / sellerAsking) * 100 : 0;

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-white/80 text-lg">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] flex items-center justify-center">
              <Calculator size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Quick Underwriting</h1>
              <p className="text-white/50 text-sm">NOI and offer range calculator</p>
            </div>
          </div>
        </header>

        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Deal Selector */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Select Deal</h2>
            <div className="relative">
              <select
                className="input-dark text-sm appearance-none pr-8"
                value={selectedDealId}
                onChange={(e) => setSelectedDealId(e.target.value)}
              >
                <option value="">Choose a deal...</option>
                {deals.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.propertyName || `Deal #${d.id}`}{d.city ? ` - ${d.city}, ${d.state}` : ''}
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            </div>
            {selectedDeal && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Units', value: selectedDeal.units || '-' },
                  { label: 'Seller Asking', value: sellerAsking ? formatCurrency(sellerAsking) : '-' },
                  { label: 'GPRI (from mix)', value: gpriFromMix > 0 ? formatCurrency(gpriFromMix) : (selectedDeal.grossRevenue ? formatCurrency(Number(selectedDeal.grossRevenue)) : '-') },
                  { label: 'Occupancy', value: selectedDeal.occupancyRate ? `${selectedDeal.occupancyRate}%` : '-' },
                ].map((item) => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3">
                    <div className="text-xs text-white/40">{item.label}</div>
                    <div className="text-sm font-semibold text-white mt-0.5">{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Income Assumptions</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Economic Occupancy (%)</label>
                    <input type="number" className="input-dark text-sm" value={economicOccupancy} onChange={(e) => setEconomicOccupancy(e.target.value)} placeholder="85" />
                  </div>
                </div>
              </div>

              <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Expense Lines (Annual)</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Management Fee (%)', val: managementFee, set: setManagementFee, placeholder: '8', isPercent: true },
                    { label: 'Insurance ($)', val: insurance, set: setInsurance, placeholder: `Est. ${formatCurrency(insuranceAmt)}` },
                    { label: 'Property Taxes ($)', val: taxes, set: setTaxes, placeholder: `Est. ${formatCurrency(taxesAmt)}` },
                    { label: 'Maintenance & Repairs ($)', val: maintenance, set: setMaintenance, placeholder: `Est. ${formatCurrency(maintenanceAmt)}` },
                    { label: 'Utilities ($)', val: utilities, set: setUtilities, placeholder: `Est. ${formatCurrency(utilitiesAmt)}` },
                    { label: 'Other Expenses ($)', val: other, set: setOther, placeholder: '$0' },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs text-white/50 mb-1.5">{f.label}</label>
                      <input type="number" className="input-dark text-sm" value={f.val} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Cap Rate Range</h2>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Low Cap Rate (%)', val: capRateLow, set: setCapRateLow },
                    { label: 'Mid Cap Rate (%)', val: capRateMid, set: setCapRateMid },
                    { label: 'High Cap Rate (%)', val: capRateHigh, set: setCapRateHigh },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-xs text-white/50 mb-1.5">{f.label}</label>
                      <input type="number" className="input-dark text-sm" value={f.val} onChange={(e) => f.set(e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              {/* VERDICT CARD */}
              {selectedDeal && noi > 0 && (() => {
                const v = getVerdict(noi, offerMid, sellerAsking, impliedCapRate, parseFloat(capRateMid), Number(selectedDeal.occupancyRate) || 0, Number(selectedDeal.units) || 0);
                const VIcon = v.icon;
                return (
                  <div className="border rounded-xl p-6 space-y-4" style={{ borderColor: `${v.color}40`, background: `${v.color}08` }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${v.color}20` }}>
                          <VIcon size={24} style={{ color: v.color }} />
                        </div>
                        <div>
                          <div className="text-xs text-white/40 uppercase tracking-wider font-medium">Underwriting Verdict</div>
                          <div className="text-2xl font-bold" style={{ color: v.color }}>{v.verdict}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-white/40">Suggested Offer</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(offerMid)}</div>
                        <div className="text-[10px] text-white/30">{formatCurrency(offerLow)} — {formatCurrency(offerHigh)}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white/[0.04] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Target size={12} className="text-blue-400" />
                          <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">Key Reasons</span>
                        </div>
                        <ul className="space-y-1">
                          {v.reasons.map((r: string, i: number) => <li key={i} className="text-xs text-white/60">\u2022 {r}</li>)}
                        </ul>
                      </div>
                      <div className="bg-white/[0.04] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap size={12} className="text-white" />
                          <span className="text-[10px] text-white uppercase tracking-wider font-bold">Biggest Assumption</span>
                        </div>
                        <p className="text-xs text-white/60">{v.assumption}</p>
                      </div>
                      <div className="bg-white/[0.04] rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <AlertTriangle size={12} className="text-red-400" />
                          <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Biggest Risk</span>
                        </div>
                        <p className="text-xs text-white/60">{v.risk}</p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Income Statement</h2>
                <div className="space-y-2">
                  {[
                    { label: 'GPRI (Gross Potential Rental Income)', value: formatCurrency(gpri), color: 'text-white' },
                    { label: `EGI (at ${economicOccupancy}% occupancy)`, value: formatCurrency(egi), color: 'text-green-400' },
                    { label: 'Total Expenses', value: `(${formatCurrency(totalExpenses)})`, color: 'text-red-400' },
                    { label: `Expense Ratio`, value: `${expenseRatioCalc.toFixed(1)}%`, color: 'text-white/60' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-white/60">{item.label}</span>
                      <span className={`font-semibold text-sm ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-3 mt-1">
                    <span className="font-bold text-white">Net Operating Income (NOI)</span>
                    <span className="font-bold text-white text-xl">{formatCurrency(noi)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
                <h2 className="text-base font-bold text-white mb-4">Offer Range</h2>
                <div className="space-y-3">
                  {[
                    { label: `Low Offer (${capRateHigh}% cap)`, value: offerLow, color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: `Mid Offer (${capRateMid}% cap)`, value: offerMid, color: 'text-white', bg: 'bg-white/[0.04]' },
                    { label: `High Offer (${capRateLow}% cap)`, value: offerHigh, color: 'text-green-400', bg: 'bg-green-500/10' },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between p-4 rounded-xl ${item.bg}`}>
                      <span className="text-sm text-white/70">{item.label}</span>
                      <span className={`font-bold text-lg ${item.color}`}>{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {sellerAsking > 0 && (
                <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
                  <h2 className="text-base font-bold text-white mb-4">Seller Ask Analysis</h2>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Seller Asking</span>
                      <span className="font-semibold text-white">{formatCurrency(sellerAsking)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Implied Cap Rate at Ask</span>
                      <span className={`font-semibold ${impliedCapRate >= parseFloat(capRateMid) ? 'text-green-400' : 'text-red-400'}`}>
                        {impliedCapRate > 0 ? `${impliedCapRate.toFixed(2)}%` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-white/60">Gap to Mid Offer</span>
                      <span className={`font-semibold ${offerMid >= sellerAsking ? 'text-green-400' : 'text-red-400'}`}>
                        {offerMid > 0 ? `${offerMid >= sellerAsking ? '+' : ''}${formatCurrency(offerMid - sellerAsking)}` : '-'}
                      </span>
                    </div>
                    <div className="mt-3 p-3 rounded-xl bg-white/5 text-xs text-white/60 leading-relaxed">
                      {impliedCapRate > 0 && impliedCapRate >= parseFloat(capRateMid)
                        ? `At the seller's asking price, this deal pencils at a ${impliedCapRate.toFixed(2)}% cap rate, which is at or above your target. Worth pursuing.`
                        : impliedCapRate > 0
                        ? `At the seller's asking price, this deal only pencils at a ${impliedCapRate.toFixed(2)}% cap rate, below your ${capRateMid}% target. Negotiate down or pass.`
                        : 'Enter deal financials to see analysis.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
