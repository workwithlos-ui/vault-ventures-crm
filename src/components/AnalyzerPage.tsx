import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { NavSidebar } from './PipelinePage';
import { Sparkles, AlertTriangle, TrendingUp, ChevronDown, Target, Shield, Lightbulb, ArrowRight, CheckCircle, XCircle } from 'lucide-react';

function parseStructuredAnalysis(text: string) {
  const sections: { title: string; content: string; lines: string[] }[] = [];
  let current: { title: string; content: string; lines: string[] } | null = null;
  for (const line of text.split('\n')) {
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { title: line.replace('## ', '').trim(), content: '', lines: [] };
    } else if (current) {
      current.content += line + '\n';
      if (line.trim()) current.lines.push(line.trim());
    }
  }
  if (current) sections.push(current);
  return sections;
}

const SECTION_CONFIG: Record<string, { icon: any; color: string; bg: string }> = {
  'Recommendation': { icon: CheckCircle, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
  'Why It Matters': { icon: Target, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)' },
  'Top 3 Risks': { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  'Value-Add Opportunities': { icon: Lightbulb, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  'Next Action': { icon: ArrowRight, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
};

interface Deal {
  id: number; propertyName: string; city: string; state: string; units: number;
  sellerAskingPrice: number; noi: number; capRate: number; occupancyRate: number;
  stage: number; leadRating: string;
}

export default function AnalyzerPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedDealId, setSelectedDealId] = useState('');
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');
  const [error, setError] = useState('');
useEffect(() => {
fetch('/api/deals', { headers: { Authorization: 'none' } })
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setDeals(list);
        // Pre-select from URL param
        const qid = router.query.dealId as string;
        if (qid) setSelectedDealId(qid);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router.query.dealId]);

  const handleAnalyze = async () => {
    if (!selectedDealId) return;
    setAnalyzing(true);
    setAnalysis('');
    setError('');
    try {
      const res = await fetch(`/api/deals/${selectedDealId}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'none' },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAnalysis(data.analysis || 'No analysis returned.');
    } catch (err: any) {
      setError(err.message || 'Failed to analyze deal.');
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedDeal = deals.find((d) => String(d.id) === selectedDealId);

  if (loading) return <div className="min-h-screen bg-[#09090b] flex items-center justify-center"><div className="text-white/80 text-lg">Loading...</div></div>;

  return (
    <div className="min-h-screen bg-[#09090b] flex">
      <NavSidebar />
      <div className="flex-1 ml-16 md:ml-52">
        <header className="border-b border-white/[0.05] bg-[#09090b]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Sparkles size={18} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Deal Analyzer</h1>
              <p className="text-white/50 text-sm">Context-aware analysis powered by GPT-4</p>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Deal Selector */}
          <div className="bg-white/3 border border-white/[0.05] rounded-xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Select Deal to Analyze</h2>
            <div className="flex gap-3 flex-wrap">
              <div className="relative flex-1 min-w-64">
                <select
                  className="input-dark text-sm appearance-none pr-8"
                  value={selectedDealId}
                  onChange={(e) => { setSelectedDealId(e.target.value); setAnalysis(''); }}
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
              <button
                onClick={handleAnalyze}
                disabled={!selectedDealId || analyzing}
                className="flex items-center gap-2 px-6 py-2 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 transition-colors text-sm disabled:opacity-50"
              >
                <Sparkles size={15} />
                {analyzing ? 'Analyzing...' : 'Analyze Deal'}
              </button>
            </div>

            {/* Deal Summary */}
            {selectedDeal && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Units', value: selectedDeal.units || '-' },
                  { label: 'Asking Price', value: selectedDeal.sellerAskingPrice ? `$${Number(selectedDeal.sellerAskingPrice).toLocaleString()}` : '-' },
                  { label: 'NOI', value: selectedDeal.noi ? `$${Number(selectedDeal.noi).toLocaleString()}` : '-' },
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

          {/* Analysis Result */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-3">
              <AlertTriangle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-red-400">Analysis Failed</div>
                <div className="text-sm text-red-300/80 mt-1">{error}</div>
              </div>
            </div>
          )}

          {analyzing && (
            <div className="bg-white/3 border border-purple-500/20 rounded-xl p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
                <Sparkles size={22} className="text-purple-400" />
              </div>
              <p className="text-white/70 text-sm">Analyzing deal data with GPT-4...</p>
              <p className="text-white/40 text-xs mt-1">This may take 10-20 seconds</p>
            </div>
          )}

          {analysis && !analyzing && (() => {
            const sections = parseStructuredAnalysis(analysis);
            if (sections.length === 0) {
              // Fallback for unstructured output
              return (
                <div className="bg-white/3 border border-purple-500/20 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={18} className="text-purple-400" />
                    <h2 className="text-base font-bold text-white">Deal Analysis</h2>
                    <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">AI Generated</span>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none">
                    {analysis.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) return <h3 key={i} className="text-white font-bold text-base mt-4 mb-2">{line.replace('## ', '')}</h3>;
                      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="text-white/80 ml-4 mt-1 list-disc">{line.replace(/^[-*] /, '')}</li>;
                      if (line.trim() === '') return <div key={i} className="h-2" />;
                      return <p key={i} className="text-white/80 mt-1 leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
              );
            }
            return (
              <div className="space-y-4">
                {sections.map((section, idx) => {
                  const cfg = SECTION_CONFIG[section.title] || { icon: TrendingUp, color: '#a855f7', bg: 'rgba(168,85,247,0.08)' };
                  const SIcon = cfg.icon;
                  const isRecommendation = section.title === 'Recommendation';
                  const isPursue = isRecommendation && (section.content.toUpperCase().includes('PURSUE') || section.content.toUpperCase().includes('BUY'));
                  const isPass = isRecommendation && section.content.toUpperCase().includes('PASS');
                  const recColor = isPursue ? '#22c55e' : isPass ? '#ef4444' : '#f59e0b';
                  const recIcon = isPursue ? CheckCircle : isPass ? XCircle : AlertTriangle;
                  const RecIcon = isRecommendation ? recIcon : SIcon;
                  const finalColor = isRecommendation ? recColor : cfg.color;
                  const finalBg = isRecommendation ? `${recColor}10` : cfg.bg;
                  return (
                    <div key={idx} className="border rounded-xl p-5" style={{ borderColor: `${finalColor}30`, background: finalBg }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${finalColor}20` }}>
                          <RecIcon size={16} style={{ color: finalColor }} />
                        </div>
                        <h3 className="font-bold text-base" style={{ color: finalColor }}>{section.title}</h3>
                        {isRecommendation && <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${recColor}20`, color: recColor }}>{isPursue ? 'PURSUE' : isPass ? 'PASS' : 'NEGOTIATE'}</span>}
                      </div>
                      <div className="space-y-1">
                        {section.lines.map((line, li) => {
                          const cleaned = line.replace(/^\d+\.\s*/, '').replace(/^[-*]\s*/, '').replace(/\*\*/g, '');
                          if (line.match(/^\d+\./) || line.startsWith('- ') || line.startsWith('* ')) {
                            return <div key={li} className="flex items-start gap-2 py-1"><span className="text-white/30 mt-0.5">\u2022</span><span className="text-sm text-white/80 leading-relaxed">{cleaned}</span></div>;
                          }
                          return <p key={li} className="text-sm text-white/80 leading-relaxed">{cleaned}</p>;
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {!analysis && !analyzing && !error && (
            <div className="text-center py-16 text-white/30">
              <div className="w-16 h-16 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Sparkles size={28} className="text-white/20" />
              </div>
              <p className="text-lg font-medium">Select a deal and click Analyze</p>
              <p className="text-sm mt-1">The AI will review all deal data and provide context-aware insights, red flags, and recommendations.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
