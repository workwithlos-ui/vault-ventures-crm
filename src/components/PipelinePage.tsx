import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Plus, Phone, MapPin, Building2, LogOut, LayoutDashboard, Users, BarChart3, Calculator, ClipboardList, Briefcase, ChevronRight, Star } from 'lucide-react';

const STAGES = [
  { id: 1, name: 'Initial Contact', color: '#6b7280', bg: 'rgba(107,114,128,0.15)' },
  { id: 2, name: 'Intro Call Scheduled', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' },
  { id: 3, name: 'Intro Call Complete', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
  { id: 4, name: 'LOI Sent', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },
  { id: 5, name: 'LOI Accepted', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  { id: 6, name: 'PSA Sent', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  { id: 7, name: 'PSA Executed', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
  { id: 8, name: 'Due Diligence', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  { id: 9, name: 'Financing', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' },
  { id: 10, name: 'Clear to Close', color: '#a855f7', bg: 'rgba(168,85,247,0.15)' },
  { id: 11, name: 'Closed', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
];

const RATING_COLORS: Record<string, string> = { 'Hot': '#ef4444', 'Warm': '#f97316', 'Cold': '#3b82f6' };

function formatCurrency(val: any) {
  const n = Number(val);
  if (!val || isNaN(n)) return '';
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

export function NavSidebar() {
  const router = useRouter();
  const navItems = [
    { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/pipeline', icon: BarChart3, label: 'Pipeline' },
    { href: '/new-deal', icon: Plus, label: 'New Deal' },
    { href: '/contacts', icon: Users, label: 'Contacts' },
    { href: '/analyzer', icon: Star, label: 'AI Analyzer' },
    { href: '/underwriting', icon: Calculator, label: 'Underwriting' },
    { href: '/due-diligence', icon: ClipboardList, label: 'Due Diligence' },
    { href: '/portfolio', icon: Briefcase, label: 'Portfolio' },
  ];
  return (
    <aside className="fixed left-0 top-0 h-full w-16 md:w-56 bg-black/40 backdrop-blur-xl border-r border-white/10 z-50 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <Building2 size={16} className="text-black" />
          </div>
          <span className="hidden md:block font-bold text-white text-sm">Vault Ventures</span>
        </Link>
      </div>
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${active ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={18} className="flex-shrink-0" />
              <span className="hidden md:block text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-white/10">
        <button onClick={() => { localStorage.removeItem('auth_token'); window.location.href = '/login'; }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all w-full">
          <LogOut size={18} className="flex-shrink-0" />
          <span className="hidden md:block text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
}

interface Deal {
  id: number; propertyName: string; address: string; city: string; state: string;
  units: number; sellerName: string; sellerPhone: string; stage: number;
  leadRating: string; sellerAskingPrice: number; purchasePrice: number;
  occupancyRate: number; capRate: number; notes: string;
}

function AddContactModal({ dealId, onClose, token }: { dealId: number; onClose: () => void; token: string }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'Seller', company: '' });
  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, dealId }),
      });
      onClose();
    } finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-[#1a1a2e] border border-white/20 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white mb-4">Add Contact to Deal</h3>
        <div className="space-y-3">
          {[{ k: 'name', l: 'Name *', p: 'Full name' }, { k: 'phone', l: 'Phone', p: '(555) 000-0000' }, { k: 'email', l: 'Email', p: 'email@example.com' }, { k: 'company', l: 'Company', p: 'Company name' }].map((f) => (
            <div key={f.k}>
              <label className="block text-xs text-white/50 mb-1">{f.l}</label>
              <input className="input-dark" placeholder={f.p} value={(form as any)[f.k]} onChange={(e) => setForm({ ...form, [f.k]: e.target.value })} />
            </div>
          ))}
          <div>
            <label className="block text-xs text-white/50 mb-1">Type</label>
            <select className="input-dark" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {['Seller', 'Broker', 'Attorney', 'Lender', 'Property Manager', 'Inspector', 'Other'].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/15 text-sm">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.name.trim()} className="flex-1 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 text-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}

function DealCard({ deal, onDragStart, token }: { deal: Deal; onDragStart: (e: React.DragEvent, deal: Deal) => void; token: string }) {
  const [showContactModal, setShowContactModal] = useState(false);
  return (
    <>
      <div draggable onDragStart={(e) => onDragStart(e, deal)} className="bg-white/5 border border-white/10 rounded-xl p-3 cursor-grab hover:border-amber-500/40 transition-all group select-none">
        <div className="flex items-start justify-between mb-1.5">
          <Link href={`/deals/${deal.id}`} className="font-semibold text-white text-sm hover:text-amber-400 transition-colors leading-tight flex-1 pr-2 line-clamp-2">
            {deal.propertyName || `Deal #${deal.id}`}
          </Link>
          {deal.leadRating && (
            <span className="text-xs font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 leading-none" style={{ color: RATING_COLORS[deal.leadRating] || '#6b7280', background: `${RATING_COLORS[deal.leadRating] || '#6b7280'}20` }}>
              {deal.leadRating}
            </span>
          )}
        </div>
        {(deal.city || deal.state) && (
          <div className="flex items-center gap-1 text-white/40 text-xs mb-1.5">
            <MapPin size={10} />
            <span>{[deal.city, deal.state].filter(Boolean).join(', ')}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-xs text-white/50 mb-1.5">
          {deal.units > 0 && <span>{deal.units} units</span>}
          {deal.occupancyRate > 0 && <span>{deal.occupancyRate}% occ.</span>}
        </div>
        {deal.sellerAskingPrice > 0 && (
          <div className="text-amber-400 font-semibold text-sm mb-1.5">{formatCurrency(deal.sellerAskingPrice)}</div>
        )}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
          {deal.sellerPhone ? (
            <a href={`tel:${deal.sellerPhone}`} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors">
              <Phone size={11} /> Call
            </a>
          ) : <span />}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => setShowContactModal(true)} className="text-white/40 hover:text-amber-400 transition-colors" title="Add contact">
              <Plus size={13} />
            </button>
            <Link href={`/deals/${deal.id}`} className="text-white/40 hover:text-amber-400 transition-colors">
              <ChevronRight size={13} />
            </Link>
          </div>
        </div>
      </div>
      {showContactModal && <AddContactModal dealId={deal.id} token={token} onClose={() => setShowContactModal(false)} />}
    </>
  );
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [dragDeal, setDragDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('auth_token');
    if (!t) { router.push('/login'); return; }
    setToken(t);
    fetch('/api/deals', { headers: { Authorization: `Bearer ${t}` } })
      .then((r) => { if (r.status === 401) { router.push('/login'); throw new Error('Unauthorized'); } return r.json(); })
      .then((data) => setDeals(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDragDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e: React.DragEvent, stageId: number) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!dragDeal || dragDeal.stage === stageId) { setDragDeal(null); return; }
    const dealId = dragDeal.id;
    const prevStage = dragDeal.stage;
    setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: stageId } : d));
    setDragDeal(null);
    try {
      await fetch(`/api/deals/${dealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ stage: stageId }),
      });
    } catch {
      setDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, stage: prevStage } : d));
    }
  };

  if (loading) return <div className="min-h-screen bg-gradient-dark flex items-center justify-center"><div className="text-amber-500 text-lg">Loading pipeline...</div></div>;

  const totalValue = deals.reduce((sum, d) => sum + (Number(d.sellerAskingPrice) || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-dark flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-56 flex flex-col min-h-screen">
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">Acquisition Pipeline</h1>
            <p className="text-white/50 text-sm mt-0.5">{deals.length} deals{totalValue > 0 ? ` · ${formatCurrency(totalValue)} total asking` : ''}</p>
          </div>
          <Link href="/new-deal" className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-black rounded-lg font-semibold hover:bg-amber-600 transition-colors text-sm">
            <Plus size={16} />
            <span className="hidden sm:inline">New Deal</span>
          </Link>
        </header>
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex gap-3 min-w-max pb-4">
            {STAGES.map((stage) => {
              const stageDeals = deals.filter((d) => d.stage === stage.id);
              const stageValue = stageDeals.reduce((sum, d) => sum + (Number(d.sellerAskingPrice) || 0), 0);
              const isOver = dragOverStage === stage.id;
              return (
                <div
                  key={stage.id}
                  className={`w-60 flex-shrink-0 flex flex-col rounded-2xl border transition-all duration-150 ${isOver ? 'border-amber-500/60' : 'border-white/10'}`}
                  style={{ background: isOver ? 'rgba(245,158,11,0.04)' : 'rgba(255,255,255,0.02)' }}
                  onDragOver={(e) => { e.preventDefault(); setDragOverStage(stage.id); }}
                  onDrop={(e) => handleDrop(e, stage.id)}
                  onDragLeave={() => setDragOverStage(null)}
                >
                  <div className="p-3 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: stage.color }} />
                        <span className="font-semibold text-white text-xs leading-tight truncate">{stage.name}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full ml-2 flex-shrink-0" style={{ color: stage.color, background: stage.bg }}>{stageDeals.length}</span>
                    </div>
                    {stageValue > 0 && <div className="text-xs text-white/35 mt-1 pl-4">{formatCurrency(stageValue)}</div>}
                  </div>
                  <div className="flex-1 p-2 space-y-2 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {stageDeals.length === 0 ? (
                      <div className="text-center py-8 text-white/20 text-xs">Drop deals here</div>
                    ) : (
                      stageDeals.map((deal) => <DealCard key={deal.id} deal={deal} onDragStart={handleDragStart} token={token} />)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
