import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NavSidebar } from './PipelinePage';
import { Plus, Phone, Mail, Search, Trash2, Edit2, X, Check } from 'lucide-react';

interface Contact {
  id: number; name: string; phone: string; email: string; type: string; company: string; notes: string; dealId?: number;
}

const CONTACT_TYPES = ['Seller', 'Broker', 'Attorney', 'Lender', 'Property Manager', 'Inspector', 'Other'];

const TYPE_COLORS: Record<string, string> = {
  'Seller': '#f59e0b', 'Broker': '#3b82f6', 'Attorney': '#8b5cf6', 'Lender': '#10b981',
  'Property Manager': '#06b6d4', 'Inspector': '#f97316', 'Other': '#6b7280',
};

function ContactForm({ initial, onSave, onCancel, saving }: {
  initial: Partial<Contact>; onSave: (data: Partial<Contact>) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', type: 'Seller', company: '', notes: '', ...initial });
  const set = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-white/50 mb-1">Name *</label>
          <input className="input-dark text-sm" value={form.name} onChange={(e) => set('name')(e.target.value)} placeholder="Full name" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Type</label>
          <select className="input-dark text-sm" value={form.type} onChange={(e) => set('type')(e.target.value)}>
            {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Phone</label>
          <input className="input-dark text-sm" type="tel" value={form.phone} onChange={(e) => set('phone')(e.target.value)} placeholder="(555) 000-0000" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Email</label>
          <input className="input-dark text-sm" type="email" value={form.email} onChange={(e) => set('email')(e.target.value)} placeholder="email@example.com" />
        </div>
        <div>
          <label className="block text-xs text-white/50 mb-1">Company</label>
          <input className="input-dark text-sm" value={form.company} onChange={(e) => set('company')(e.target.value)} placeholder="Company name" />
        </div>
      </div>
      <div>
        <label className="block text-xs text-white/50 mb-1">Notes</label>
        <textarea className="input-dark text-sm resize-none" rows={2} value={form.notes} onChange={(e) => set('notes')(e.target.value)} placeholder="Notes..." />
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 px-3 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/15 flex items-center justify-center gap-1.5">
          <X size={14} /> Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()} className="flex-1 px-3 py-2 bg-white text-[#09090b] rounded-lg font-semibold text-sm hover:bg-white/90 disabled:opacity-50 flex items-center justify-center gap-1.5">
          <Check size={14} /> {saving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

export default function ContactsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
fetch('/api/contacts', { headers: { Authorization: 'none' } })
      .then((r) => r.json())
      .then((data) => setContacts(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAdd = async (data: Partial<Contact>) => {
    setSaving(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setContacts((prev) => [...prev, { ...data, id: result.id } as Contact]);
      setShowAdd(false);
    } finally { setSaving(false); }
  };

  const handleEdit = async (id: number, data: Partial<Contact>) => {
    setSaving(true);
    try {
      await fetch(`/api/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify(data),
      });
      setContacts((prev) => prev.map((c) => c.id === id ? { ...c, ...data } : c));
      setEditId(null);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this contact?')) return;
    await fetch(`/api/contacts/${id}`, { method: 'DELETE', headers: { Authorization: 'none' } });
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = contacts.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.name?.toLowerCase().includes(q) || c.phone?.includes(q) || c.email?.toLowerCase().includes(q) || c.company?.toLowerCase().includes(q);
    const matchType = !filterType || c.type === filterType;
    return matchSearch && matchType;
  });

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-white/80 text-lg">Loading contacts...</div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div>
            <h1 className="text-xl font-bold text-white">Contacts</h1>
            <p className="text-white/50 text-sm mt-0.5">{contacts.length} total contacts</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#09090b] rounded-lg font-semibold hover:bg-white/90 transition-colors text-sm"
          >
            <Plus size={16} /> Add Contact
          </button>
        </header>

        <div className="max-w-5xl mx-auto p-6">
          {/* Add Form */}
          {showAdd && (
            <div className="bg-white/3 border border-white/[0.12] rounded-xl p-5 mb-6">
              <h3 className="text-base font-bold text-white mb-4">New Contact</h3>
              <ContactForm initial={{}} onSave={handleAdd} onCancel={() => setShowAdd(false)} saving={saving} />
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                className="input-dark text-sm pl-9"
                placeholder="Search contacts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select className="input-dark text-sm w-auto" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="">All Types</option>
              {CONTACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Contact List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-white/30">
              <div className="text-4xl mb-3">👥</div>
              <p className="text-lg font-medium">No contacts found</p>
              <p className="text-sm mt-1">Add your first contact to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c) => (
                <div key={c.id} className="bg-white/3 border border-white/[0.05] rounded-xl p-4 hover:border-white/[0.08] transition-all">
                  {editId === c.id ? (
                    <ContactForm initial={c} onSave={(data) => handleEdit(c.id, data)} onCancel={() => setEditId(null)} saving={saving} />
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white">{c.name}</span>
                          {c.type && (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: TYPE_COLORS[c.type] || '#6b7280', background: `${TYPE_COLORS[c.type] || '#6b7280'}20` }}>
                              {c.type}
                            </span>
                          )}
                        </div>
                        {c.company && <div className="text-sm text-white/50 mt-0.5">{c.company}</div>}
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          {c.phone && (
                            <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-sm text-green-400 hover:text-green-300 transition-colors">
                              <Phone size={13} /> {c.phone}
                            </a>
                          )}
                          {c.email && (
                            <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors">
                              <Mail size={13} /> {c.email}
                            </a>
                          )}
                        </div>
                        {c.notes && <div className="text-xs text-white/35 mt-1.5 line-clamp-2">{c.notes}</div>}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => setEditId(c.id)} className="p-2 text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(c.id)} className="p-2 text-white/30 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
