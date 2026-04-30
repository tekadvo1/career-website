import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, CheckCheck, Send, Sparkles, Loader2, Database, Rocket, ArrowRight } from 'lucide-react';
import { FileTreeNode, type ProjectStructure, type DatabaseTable } from './ProjectAdvisorHelpers';
import { sendChatMessage } from './ProjectAdvisorSteps';
import { apiFetch } from '../utils/apiFetch';
import { getUser } from '../utils/auth';

// ── Database table card ───────────────────────────────────────────────────────
function TableCard({ table }: { table: DatabaseTable }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center shrink-0">
          <Database className="w-4 h-4 text-blue-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-900 text-[15px] font-mono">{table.name}</p>
          <p className="text-xs text-slate-500 mt-0.5">{table.description}</p>
        </div>
        <span className="text-xs text-slate-400 shrink-0">{table.columns.length} columns</span>
      </button>
      {open && (
        <div className="border-t border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Column</th>
                <th className="text-left px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {table.columns.map((col, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-2.5 font-mono font-semibold text-slate-800 text-xs">{col.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-purple-600 whitespace-nowrap">{col.type}</td>
                  <td className="px-4 py-2.5 text-xs text-slate-500 hidden sm:table-cell">{col.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── AI assistant ──────────────────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'assistant'; content: string; }

function AIAssistant({ structure, goal }: { structure: ProjectStructure; goal: string }) {
  const [msgs,    setMsgs]    = useState<ChatMsg[]>([{
    role: 'assistant',
    content: `👋 Hi! I'm your Structure Assistant.\n\nAsk me anything:\n• Why was a folder/file included?\n• How do routes connect to controllers?\n• What goes inside a specific file?\n• How to set up the database?\n• Best practices for this stack?`,
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role: m.role, content: m.content }));
      const reply   = await sendChatMessage(msg, structure, goal, history);
      setMsgs(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (_e) {
      setMsgs(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    }
    setLoading(false);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white flex flex-col">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div>
          <p className="text-white font-bold text-[13px]">Structure Assistant</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Ask anything</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
      </div>

      {/* Messages */}
      <div className="h-[480px] overflow-y-auto p-4 space-y-3 bg-slate-50 flex-1">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-slate-600" />
              </div>
            )}
            <div className={`max-w-[88%] px-3 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
              ${m.role === 'user'
                ? 'bg-slate-900 text-white rounded-tr-sm'
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center shrink-0">
              <Sparkles className="w-3 h-3 text-slate-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin" />
              <span className="text-sm text-slate-400">Thinking…</span>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-3 flex gap-2 bg-white shrink-0">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about routes, database…"
          className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400 transition-colors"
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center hover:bg-black transition-colors disabled:opacity-40 shrink-0"
        >
          <Send className="w-4 h-4 text-white" />
        </button>
      </div>
    </div>
  );
}

// ── Step 4 ── two-column: left = tabs, right = AI assistant ───────────────────
const STR_TABS = [
  { key: 'frontend'  as const, label: 'Frontend'   },
  { key: 'backend'   as const, label: 'Backend'    },
  { key: 'database'  as const, label: 'Database'   },
  { key: 'env'       as const, label: '.env Setup' },
  { key: 'workflow'  as const, label: 'Workflow'   },
];

export function Step4({
  structure, goal, saving, saved, onSave, onReset,
}: {
  structure: ProjectStructure; goal: string;
  saving: boolean; saved: boolean;
  onSave: () => void; onReset: () => void;
}) {
  const [tab, setTab] = useState<'frontend' | 'backend' | 'database' | 'env' | 'workflow'>('frontend');
  const [launching, setLaunching] = useState(false);
  const navigate = useNavigate();

  // ── Create project in DB and navigate to workspace ────────────────────────
  const handleStartBuilding = async () => {
    setLaunching(true);
    try {
      const user = getUser<{ id?: number; role?: string }>();
      const role = (() => {
        try { return JSON.parse(sessionStorage.getItem('lastRoleAnalysis') || '{}').role || 'Software Engineer'; }
        catch { return 'Software Engineer'; }
      })();

      // Build a minimal project payload that the dashboard ProjectSetupModal expects
      const projectPayload = {
        title: goal,
        description: structure.overview || `Build: ${goal}`,
        difficulty: 'Intermediate',
        duration: '4-8 weeks',
        matchScore: 95,
        tags: [structure.stack || 'Custom Stack'],
        tools: structure.workflow?.slice(0, 3) || [],
        languages: [],
        whyRecommended: ['AI-generated project from Project Advisor'],
        skillsToDevelop: [],
        setupGuide: { title: 'AI Project', steps: structure.workflow || [] },
        curriculumStats: { modules: 1, tasks: structure.workflow?.length || 5, deployment: true, codeReview: false },
        metrics: { matchIncrease: '+15%', xp: 500, timeEstimate: '4-8 weeks', roleRelevance: role },
      };

      // Save to DB via the role/start-project endpoint
      const res = await apiFetch('/api/role/start-project', {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id,
          project: projectPayload,
          role,
          status: 'active',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Clear advisor state so user starts fresh next time
        sessionStorage.removeItem('advisor_state');
        // Navigate to project workspace with the new project
        navigate('/project-workspace', {
          state: {
            project: { ...projectPayload, id: String(data.projectId || 'new'), status: 'active' },
            role,
            fromAdvisor: true,
          },
        });
      } else {
        // Fallback: go to dashboard so user can find the saved project
        sessionStorage.removeItem('advisor_state');
        navigate('/dashboard');
      }
    } catch (_e) {
      sessionStorage.removeItem('advisor_state');
      navigate('/dashboard');
    }
    setLaunching(false);
  };

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header row — full width */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Project Structure</h2>
        <button
          onClick={onSave}
          disabled={saving || saved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
            saved ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          {saved ? <><CheckCheck className="w-4 h-4" /> Saved</> : saving ? 'Saving…' : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </div>
      {structure.overview && <p className="text-sm text-slate-500 mb-2 leading-relaxed">{structure.overview}</p>}
      {structure.stack && (
        <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 mb-5">
          {structure.stack}
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="flex flex-col lg:flex-row gap-5 items-start">

        {/* LEFT — structure content */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl overflow-x-auto">
            {STR_TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-shrink-0 px-3 py-1.5 text-[12px] font-bold rounded-lg transition-all
                  ${tab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'frontend' && (
            <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
              {structure.tree.map((n, i) => <FileTreeNode key={i} node={n} depth={0} />)}
            </div>
          )}
          {tab === 'backend' && (
            structure.backend?.length ? (
              <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
                {structure.backend.map((n, i) => <FileTreeNode key={i} node={n} depth={0} />)}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-400">
                No backend structure for this project type.
              </div>
            )
          )}
          {tab === 'database' && (
            <div className="space-y-3">
              {structure.database?.length ? (
                structure.database.map((t, i) => <TableCard key={i} table={t} />)
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-400">
                  No database tables for this project type.
                </div>
              )}
            </div>
          )}
          {tab === 'env' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 leading-relaxed">
                Create <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">.env</code> in your
                root and add it to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">.gitignore</code>.
                Never commit secrets.
              </p>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm space-y-2">
                {structure.envVars.map((v, i) => {
                  const eq = v.indexOf('=');
                  return (
                    <div key={i} className="flex items-start gap-1.5 flex-wrap">
                      <span className="text-emerald-400 shrink-0">{v.slice(0, eq)}</span>
                      <span className="text-slate-500">=</span>
                      <span className="text-slate-300 break-all">{v.slice(eq + 1)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {tab === 'workflow' && (
            <div className="space-y-3">
              {structure.workflow.map((s, i) => (
                <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                  <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">{i + 1}</div>
                  <p className="text-sm text-slate-700 font-medium pt-0.5">{s}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Start Building CTA ── */}
          <div className="mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-base leading-tight">Your structure is ready!</p>
                <p className="text-emerald-100 text-xs mt-0.5">Click below to start building with step-by-step AI guidance</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleStartBuilding}
                disabled={launching}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white text-emerald-700 font-black rounded-xl hover:bg-emerald-50 transition-all text-sm shadow-sm disabled:opacity-70"
              >
                {launching ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Setting up workspace…</>
                ) : (
                  <><Rocket className="w-4 h-4" /> Start Building This Project <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
              {!saved && (
                <button
                  onClick={onSave}
                  disabled={saving || saved}
                  className="flex items-center justify-center gap-1.5 px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all text-sm border border-white/20"
                >
                  <Save className="w-4 h-4" /> Save for Later
                </button>
              )}
            </div>
          </div>

          <button
            onClick={onReset}
            className="w-full mt-3 bg-white border border-slate-200 text-slate-500 font-semibold py-2.5 rounded-xl hover:border-slate-300 hover:text-slate-900 transition-all text-sm"
          >
            ← Start Over with a New Project
          </button>
        </div>

        {/* RIGHT — AI assistant (sticky on desktop) */}
        <div className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-20">
          <AIAssistant structure={structure} goal={goal} />
        </div>

      </div>
    </div>
  );
}
