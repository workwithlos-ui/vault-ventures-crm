import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NavSidebar } from './PipelinePage';
import { ClipboardList, ChevronDown, Check, Clock, AlertTriangle, Circle, Shield, FileX, Zap, Target } from 'lucide-react';

interface ChecklistItem {
  id: number; category: string; task: string; priority: string; status: string; notes: string; fileUrl?: string; fileName?: string;
}

interface Deal {
  id: number; propertyName: string; city: string; state: string; stage: number;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  'Not Started': { label: 'Not Started', color: '#6b7280', bg: 'rgba(107,114,128,0.15)', icon: Circle },
  'In Progress': { label: 'In Progress', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', icon: Clock },
  'Complete': { label: 'Complete', color: '#22c55e', bg: 'rgba(34,197,94,0.15)', icon: Check },
  'N/A': { label: 'N/A', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: Circle },
  'Blocked': { label: 'Blocked', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', icon: AlertTriangle },
};

const PRIORITY_COLORS: Record<string, string> = { 'High': '#ef4444', 'Medium': '#f59e0b', 'Low': '#6b7280' };

export default function DueDiligencePage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingChecklist, setLoadingChecklist] = useState(false);
const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [noteText, setNoteText] = useState('');
  const [savingItem, setSavingItem] = useState<number | null>(null);

  useEffect(() => {
fetch('/api/deals', { headers: { Authorization: 'none' } })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDeals(list);
        const qid = router.query.dealId as string;
        if (qid) {
          setSelectedDealId(qid);
          loadChecklist(qid);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router.query.dealId]);

  const loadChecklist = async (dealId: string, t: string) => {
    setLoadingChecklist(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/checklist`, { headers: { Authorization: 'none' } });
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
      // Expand all categories by default
      const cats = new Set<string>(Array.isArray(data) ? data.map((i: ChecklistItem) => i.category) : []);
      setExpandedCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingChecklist(false);
    }
  };

  const handleDealChange = (dealId: string) => {
    setSelectedDealId(dealId);
    setItems([]);
    if (dealId) loadChecklist(dealId);
  };

  const updateItemStatus = async (item: ChecklistItem, status: string) => {
    setSavingItem(item.id);
    const updated = { ...item, status };
    setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
    try {
      await fetch(`/api/deals/${selectedDealId}/checklist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingItem(null);
    }
  };

  const saveNotes = async (item: ChecklistItem) => {
    const updated = { ...item, notes: noteText };
    setItems((prev) => prev.map((i) => i.id === item.id ? updated : i));
    setEditingNotes(null);
    try {
      await fetch(`/api/deals/${selectedDealId}/checklist/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const categories = Array.from(new Set(items.map((i) => i.category)));
  const totalItems = items.length;
  const completedItems = items.filter((i) => i.status === 'Complete' || i.status === 'N/A').length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-white/80 text-lg">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <ClipboardList size={18} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Due Diligence</h1>
              <p className="text-white/50 text-sm">Pre-loaded DD checklist with 100+ items</p>
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
                onChange={(e) => handleDealChange(e.target.value)}
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
          </div>

          {/* Progress Intelligence Summary */}
          {selectedDealId && items.length > 0 && (() => {
            const blockedItems = items.filter(i => i.status === 'Blocked');
            const highPriorityOpen = items.filter(i => i.priority === 'High' && i.status !== 'Complete' && i.status !== 'N/A');
            const missingDocs = items.filter(i => (i.task.toLowerCase().includes('review') || i.task.toLowerCase().includes('obtain') || i.task.toLowerCase().includes('request') || i.task.toLowerCase().includes('confirm')) && i.status === 'Not Started' && i.priority !== 'Low');
            const inProgressItems = items.filter(i => i.status === 'In Progress');
            const notStartedHigh = items.filter(i => i.status === 'Not Started' && i.priority === 'High');
            // Recommended next action
            let nextAction = 'Continue working through checklist items';
            if (blockedItems.length > 0) nextAction = `Resolve ${blockedItems.length} blocked item${blockedItems.length > 1 ? 's' : ''}: ${blockedItems[0].task}`;
            else if (notStartedHigh.length > 0) nextAction = `Start high-priority: ${notStartedHigh[0].task}`;
            else if (inProgressItems.length > 0) nextAction = `Complete in-progress: ${inProgressItems[0].task}`;
            else if (missingDocs.length > 0) nextAction = `Request: ${missingDocs[0].task}`;
            else if (progress === 100) nextAction = 'All items complete — ready to proceed';

            const progressColor = progress === 100 ? '#22c55e' : progress >= 60 ? '#f59e0b' : '#ef4444';

            return (
              <div className="border rounded-xl p-6 space-y-4" style={{ borderColor: `${progressColor}30`, background: `${progressColor}06` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center relative" style={{ background: `${progressColor}20` }}>
                      <span className="text-xl font-bold" style={{ color: progressColor }}>{progress}%</span>
                    </div>
                    <div>
                      <div className="text-xs text-white/40 uppercase tracking-wider">Due Diligence Progress</div>
                      <div className="text-lg font-bold text-white">{completedItems} of {totalItems} items complete</div>
                    </div>
                  </div>
                </div>
                <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progressColor }} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <AlertTriangle size={11} className="text-red-400" />
                      <span className="text-[10px] text-red-400 uppercase tracking-wider font-bold">Blocked</span>
                    </div>
                    <div className="text-2xl font-bold text-red-400">{blockedItems.length}</div>
                    {blockedItems.length > 0 && <div className="text-[10px] text-white/40 mt-0.5 truncate">{blockedItems[0].task}</div>}
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Target size={11} className="text-white" />
                      <span className="text-[10px] text-white uppercase tracking-wider font-bold">High Priority Open</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{highPriorityOpen.length}</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileX size={11} className="text-purple-400" />
                      <span className="text-[10px] text-purple-400 uppercase tracking-wider font-bold">Docs Needed</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{missingDocs.length}</div>
                  </div>
                  <div className="bg-white/[0.04] rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Clock size={11} className="text-blue-400" />
                      <span className="text-[10px] text-blue-400 uppercase tracking-wider font-bold">In Progress</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">{inProgressItems.length}</div>
                  </div>
                </div>
                <div className="bg-white/[0.04] rounded-xl p-3 flex items-center gap-2">
                  <Zap size={14} className="text-white flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-white uppercase tracking-wider font-bold">Recommended Next Action</div>
                    <div className="text-sm text-white/80 font-medium">{nextAction}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                    const count = items.filter((i) => i.status === status).length;
                    if (count === 0) return null;
                    return (
                      <span key={status} className="flex items-center gap-1" style={{ color: cfg.color }}>
                        <cfg.icon size={11} /> {count} {status}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Loading State */}
          {loadingChecklist && (
            <div className="text-center py-12 text-white/40">
              <div className="text-white/80 text-sm">Loading checklist...</div>
            </div>
          )}

          {/* Empty State */}
          {!selectedDealId && !loadingChecklist && (
            <div className="text-center py-20 text-white/30">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <ClipboardList size={28} className="text-white/20" />
              </div>
              <p className="text-lg font-medium">Select a deal to load checklist</p>
              <p className="text-sm mt-1">The DD checklist will be auto-populated with 100+ items across 11 categories.</p>
            </div>
          )}

          {/* Checklist Categories */}
          {!loadingChecklist && items.length > 0 && (
            <div className="space-y-3">
              {categories.map((cat) => {
                const catItems = items.filter((i) => i.category === cat);
                const catCompleted = catItems.filter((i) => i.status === 'Complete' || i.status === 'N/A').length;
                const catProgress = Math.round((catCompleted / catItems.length) * 100);
                const isExpanded = expandedCategories.has(cat);
                return (
                  <div key={cat} className="bg-white/3 border border-white/[0.05] rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: catProgress === 100 ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.15)' }}>
                          {catProgress === 100 ? <Check size={15} className="text-green-400" /> : <ClipboardList size={15} className="text-white" />}
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-white text-sm">{cat}</div>
                          <div className="text-xs text-white/40">{catCompleted}/{catItems.length} complete</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2">
                          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${catProgress}%`, background: catProgress === 100 ? '#22c55e' : '#f59e0b' }} />
                          </div>
                          <span className="text-xs text-white/40">{catProgress}%</span>
                        </div>
                        <ChevronDown size={16} className={`text-white/40 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-white/[0.05]">
                        {catItems.map((item) => {
                          const statusCfg = STATUS_CONFIG[item.status] || STATUS_CONFIG['Not Started'];
                          const isEditingThis = editingNotes === item.id;
                          return (
                            <div key={item.id} className={`p-4 border-b border-white/5 last:border-0 ${item.status === 'Complete' || item.status === 'N/A' ? 'opacity-60' : ''}`}>
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-sm ${item.status === 'Complete' ? 'line-through text-white/40' : 'text-white'}`}>
                                      {item.task}
                                    </span>
                                    {item.priority === 'High' && (
                                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ color: PRIORITY_COLORS.High, background: `${PRIORITY_COLORS.High}20` }}>High</span>
                                    )}
                                  </div>
                                  {item.notes && !isEditingThis && (
                                    <div className="text-xs text-white/40 mt-1 italic">{item.notes}</div>
                                  )}
                                  {isEditingThis && (
                                    <div className="mt-2 flex gap-2">
                                      <textarea
                                        className="input-dark text-xs resize-none flex-1"
                                        rows={2}
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Add notes..."
                                        autoFocus
                                      />
                                      <div className="flex flex-col gap-1">
                                        <button onClick={() => saveNotes(item)} className="px-2 py-1 bg-white text-[#09090b] rounded text-xs font-semibold hover:bg-white/90">Save</button>
                                        <button onClick={() => setEditingNotes(null)} className="px-2 py-1 bg-white/10 text-white rounded text-xs hover:bg-white/15">Cancel</button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {!isEditingThis && (
                                    <button
                                      onClick={() => { setEditingNotes(item.id); setNoteText(item.notes || ''); }}
                                      className="text-xs text-white/20 hover:text-white/50 transition-colors px-1"
                                    >
                                      Notes
                                    </button>
                                  )}
                                  <select
                                    className="text-xs rounded-lg px-2 py-1.5 border font-semibold cursor-pointer"
                                    style={{ background: statusCfg.bg, color: statusCfg.color, borderColor: `${statusCfg.color}40` }}
                                    value={item.status}
                                    onChange={(e) => updateItemStatus(item, e.target.value)}
                                    disabled={savingItem === item.id}
                                  >
                                    {Object.keys(STATUS_CONFIG).map((s) => <option key={s} value={s}>{s}</option>)}
                                  </select>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
