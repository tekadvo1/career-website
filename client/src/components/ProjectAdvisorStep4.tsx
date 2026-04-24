import { useState, useRef, useEffect } from 'react';
import { Save, CheckCheck, Send, Sparkles, Loader2, Database } from 'lucide-react';
import { FileTreeNode, type ProjectStructure, type DatabaseTable } from './ProjectAdvisorHelpers';
import { sendChatMessage } from './ProjectAdvisorSteps';

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

// ── AI assistant chat panel ───────────────────────────────────────────────────
interface ChatMsg { role: 'user' | 'assistant'; content: string; }

function AIAssistant({ structure, goal }: { structure: ProjectStructure; goal: string }) {
  const [msgs,    setMsgs]    = useState<ChatMsg[]>([{
    role: 'assistant',
    content: `👋 Hi! I'm your **Structure Assistant**. Ask me anything about this project:\n\n• Why was a specific folder or file included?\n• How do the routes and controllers connect?\n• What should go inside a specific file?\n• How to set up the database?\n• Best practices for this stack?`,
  }]);
  const [input,   setInput]   = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const send = async () => {
    const msg = input.trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const history = msgs.map(m => ({ role: m.role, content: m.content }));
      const reply = await sendChatMessage(msg, structure, goal, history);
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
    <div className="mt-8 border border-slate-200 rounded-xl overflow-hidden bg-white">
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3 flex items-center gap-3">
        <div className="w-7 h-7 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-slate-300" />
        </div>
        <div>
          <p className="text-white font-bold text-[13px]">Structure Assistant</p>
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Ask anything about your project</p>
        </div>
        <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
      </div>

      {/* Messages */}
      <div className="h-72 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-6 h-6 bg-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3 h-3 text-slate-600" />
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2.5 rounded-xl text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'}`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2.5 justify-start">
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
      <div className="border-t border-slate-200 p-3 flex gap-2 bg-white">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about routes, database, deployment…"
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

// ── Step 4 — full structure view ──────────────────────────────────────────────
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

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Project Structure</h2>
        <button
          onClick={onSave}
          disabled={saving || saved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold border transition-all ${
            saved
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
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

      {/* Tabs */}
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

      {/* Frontend folder tree */}
      {tab === 'frontend' && (
        <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
          {structure.tree.map((node, i) => <FileTreeNode key={i} node={node} depth={0} />)}
        </div>
      )}

      {/* Backend folder tree */}
      {tab === 'backend' && (
        <div>
          {structure.backend && structure.backend.length > 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
              {structure.backend.map((node, i) => <FileTreeNode key={i} node={node} depth={0} />)}
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-400">
              No backend structure available for this project type.
            </div>
          )}
        </div>
      )}

      {/* Database tables */}
      {tab === 'database' && (
        <div className="space-y-3">
          {structure.database && structure.database.length > 0 ? (
            structure.database.map((table, i) => <TableCard key={i} table={table} />)
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-400">
              No database tables defined for this project type.
            </div>
          )}
        </div>
      )}

      {/* .env */}
      {tab === 'env' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500 leading-relaxed">
            Create <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">.env</code> in your
            project root and add it to <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">.gitignore</code>.
            Never commit secrets to Git.
          </p>
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm space-y-2">
            {structure.envVars.map((v, i) => {
              const eq  = v.indexOf('=');
              const key = v.slice(0, eq);
              const val = v.slice(eq + 1);
              return (
                <div key={i} className="flex items-start gap-1.5 flex-wrap">
                  <span className="text-emerald-400 shrink-0">{key}</span>
                  <span className="text-slate-500">=</span>
                  <span className="text-slate-300 break-all">{val}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Workflow */}
      {tab === 'workflow' && (
        <div className="space-y-3">
          {structure.workflow.map((s, i) => (
            <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
              <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-slate-700 font-medium pt-0.5">{s}</p>
            </div>
          ))}
        </div>
      )}

      {/* AI Structure Assistant */}
      <AIAssistant structure={structure} goal={goal} />

      <button
        onClick={onReset}
        className="w-full mt-5 bg-white border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:border-slate-300 hover:text-slate-900 transition-all text-sm"
      >
        ← Start Over with a New Project
      </button>
    </div>
  );
}
