import { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { ArrowLeft, CheckCircle2, Save, CheckCheck } from 'lucide-react';
import {
  PROJECT_TYPES, LEVELS, STEPS,
  useTypewriter, LoadingScreen, BadgeChip, FileTreeNode,
  type Recommendations, type ProjectStructure,
} from './ProjectAdvisorHelpers';

// ── Prompt builders ───────────────────────────────────────────────────────────
function buildRecsPrompt(type: string, goal: string, level: string) {
  return `You are an expert software architect.
Project type: ${type}. Goal: "${goal}". Experience: ${level}.
Return ONLY valid JSON — no markdown, no explanation:
{
  "languages":  [{"name":"","reason":"","badge":"Recommended|Popular|Trending|Core|Essential"}],
  "frameworks": [{"name":"","reason":"","badge":""}],
  "tools":      [{"name":"","reason":"","category":"Build|Deploy|Testing|Database|Design|DevOps|Monitoring"}],
  "deployment": [{"name":"","reason":"","badge":""}],
  "summary":    "One clear sentence on the primary recommended stack."
}
Return a COMPREHENSIVE list — include ALL relevant options (6–10 items per array). Cover every major option a developer would consider for this project type.`;
}

function buildStructurePrompt(type: string, goal: string, recs: Recommendations) {
  const lang = recs.languages[0]?.name || '';
  const fw   = recs.frameworks[0]?.name || '';
  return `You are an expert software architect. Generate a COMPLETE, production-ready project folder structure.
Type: ${type}. Primary stack: ${fw} + ${lang}. Goal: "${goal}".
Return ONLY valid JSON — no markdown:
{
  "overview": "2-sentence architecture description",
  "stack":    "e.g. React + TypeScript + Node.js + PostgreSQL",
  "tree": [
    {
      "name": "project-root", "type": "folder", "description": "Root directory",
      "children": [
        {
          "name": "src", "type": "folder", "description": "All application source code",
          "children": [
            { "name": "components", "type": "folder", "description": "Reusable UI components", "children": [
                { "name": "Button.tsx",  "type": "file", "description": "Generic button component" },
                { "name": "Card.tsx",    "type": "file", "description": "Card container component" },
                { "name": "Modal.tsx",   "type": "file", "description": "Reusable modal dialog" }
            ]},
            { "name": "pages", "type": "folder", "description": "Route-level page components", "children": [
                { "name": "Home.tsx",    "type": "file", "description": "Homepage" },
                { "name": "About.tsx",   "type": "file", "description": "About page" }
            ]},
            { "name": "hooks",   "type": "folder", "description": "Custom React hooks",       "children": [] },
            { "name": "utils",   "type": "folder", "description": "Utility / helper functions","children": [] },
            { "name": "context", "type": "folder", "description": "React context providers",   "children": [] },
            { "name": "types",   "type": "folder", "description": "TypeScript type definitions","children": [] },
            { "name": "services","type": "folder", "description": "API call abstractions",     "children": [] },
            { "name": "App.tsx", "type": "file",   "description": "Root component with routing" },
            { "name": "main.tsx","type": "file",   "description": "Entry point — mounts React" }
          ]
        },
        { "name": "public",       "type": "folder", "description": "Static assets served as-is","children": [
            { "name": "favicon.ico","type": "file","description": "Browser tab icon" }
        ]},
        { "name": "tests",        "type": "folder", "description": "Unit and integration tests","children": [] },
        { "name": ".env",         "type": "file",   "description": "Environment variables — NEVER commit" },
        { "name": ".env.example", "type": "file",   "description": "Template for .env setup" },
        { "name": ".gitignore",   "type": "file",   "description": "Files excluded from Git" },
        { "name": "package.json", "type": "file",   "description": "Dependencies & npm scripts" },
        { "name": "tsconfig.json","type": "file",   "description": "TypeScript compiler config" },
        { "name": "README.md",    "type": "file",   "description": "Project documentation" }
      ]
    }
  ],
  "envVars":  ["DATABASE_URL=postgresql://user:password@localhost:5432/mydb","API_KEY=your_api_key_here","JWT_SECRET=a_long_random_secret","NODE_ENV=development"],
  "workflow": ["1. Clone the repo: git clone <url>","2. Install dependencies: npm install","3. Copy env template: cp .env.example .env","4. Fill in .env values","5. Start dev server: npm run dev","6. Run tests: npm test","7. Build for production: npm run build","8. Deploy to your hosting platform"]
}
Generate a COMPLETE, deep structure with ALL relevant folders and files for a real ${type} project using ${fw}.`;
}

// ── Main wizard ───────────────────────────────────────────────────────────────
export default function ProjectAdvisor({ onClose }: { onClose: () => void }) {
  const [step,       setStep]      = useState(1);
  const [type,       setType]      = useState('');
  const [goal,       setGoal]      = useState('');
  const [level,      setLevel]     = useState('intermediate');
  const [loading,    setLoading]   = useState(false);
  const [loadStage,  setLoadStage] = useState<'recs' | 'structure'>('recs');
  const [error,      setError]     = useState('');
  const [recs,       setRecs]      = useState<Recommendations | null>(null);
  const [structure,  setStructure] = useState<ProjectStructure | null>(null);
  const [recTab,     setRecTab]    = useState<'languages' | 'frameworks' | 'tools' | 'deployment'>('languages');
  const [strTab,     setStrTab]    = useState<'tree' | 'env' | 'workflow'>('tree');
  const [saving,     setSaving]    = useState(false);
  const [saved,      setSaved]     = useState(false);

  const typedSummary = useTypewriter(recs?.summary ?? '', 14);
  const selectedType = PROJECT_TYPES.find(t => t.id === type);

  const user: { id?: number } = (() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  // ── AI call: tech recommendations ─────────────────────────────────────────
  const fetchRecs = async () => {
    setLoadStage('recs');
    setLoading(true);
    setError('');
    try {
      const res  = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: buildRecsPrompt(type, goal, level),
          context: { type: 'advisor', projectTitle: goal, currentTask: 'tech-stack' },
          role: 'Software Engineer',
          responseFormat: 'json',
        }),
      });
      const data   = await res.json();
      const parsed: Recommendations = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;
      setRecs(parsed);
      setStep(3);
    } catch (_e) {
      setError('Could not reach the AI. Please try again.');
    }
    setLoading(false);
  };

  // ── AI call: project structure ─────────────────────────────────────────────
  const fetchStructure = async () => {
    if (!recs) return;
    setLoadStage('structure');
    setLoading(true);
    setError('');
    try {
      const res  = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: buildStructurePrompt(type, goal, recs),
          context: { type: 'advisor', projectTitle: goal, currentTask: 'project-structure' },
          role: 'Software Engineer',
          responseFormat: 'json',
        }),
      });
      const data   = await res.json();
      const parsed: ProjectStructure = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;
      setStructure(parsed);
      setStep(4);
    } catch (_e) {
      setError('Could not generate structure. Please try again.');
    }
    setLoading(false);
  };

  // ── Save to DB ─────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!recs || !structure || saving || saved) return;
    setSaving(true);
    try {
      await apiFetch('/api/project-structure/save-advisor', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, type, goal, level, recs, structure }),
      });
      setSaved(true);
    } catch (_e) {
      // Fallback: save locally
      const key = `advisor_${Date.now()}`;
      localStorage.setItem(key, JSON.stringify({ type, goal, level, recs, structure }));
      setSaved(true);
    }
    setSaving(false);
  };

  const resetAll = () => {
    setStep(1); setType(''); setGoal(''); setRecs(null);
    setStructure(null); setSaved(false); setError('');
  };

  // ── Step 1: pick project type ──────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">What are you building?</h2>
      <p className="text-sm text-slate-500 mb-6">Choose your project type to get a personalised tech stack and folder structure</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROJECT_TYPES.map(({ id, label, sub, color, bg, border }) => (
          <button
            key={id}
            onClick={() => { setType(id); setStep(2); }}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md
              ${type === id ? `${border} ${bg}` : 'border-slate-200 bg-white hover:border-slate-300'}`}
          >
            <div className={`w-9 h-9 ${bg} border ${border} rounded-lg flex items-center justify-center shrink-0 mt-0.5`}>
              <span className={`text-lg font-black ${color}`}>{label.slice(0, 1)}</span>
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-[14px] leading-tight">{label}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Step 2: project details ────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tell us about your project</h2>
        {selectedType && (
          <span className={`px-2.5 py-1 ${selectedType.bg} ${selectedType.color} text-xs font-bold rounded-lg border ${selectedType.border}`}>
            {selectedType.label}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-6">The more detail, the better the recommendation</p>
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Describe what it does
          </label>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="e.g. A marketplace where freelancers sell digital products — users browse, buy via Stripe, and download files instantly…"
            rows={5}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-50 resize-none transition-all placeholder:text-slate-400"
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Your Experience Level
          </label>
          <div className="grid grid-cols-3 gap-3">
            {LEVELS.map(l => (
              <button
                key={l.id}
                onClick={() => setLevel(l.id)}
                className={`p-3 rounded-xl border-2 text-center transition-all
                  ${level === l.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'}`}
              >
                <p className="font-bold text-sm">{l.label}</p>
                <p className={`text-[11px] mt-0.5 ${level === l.id ? 'text-slate-400' : 'text-slate-400'}`}>{l.desc}</p>
              </button>
            ))}
          </div>
        </div>
        {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>}
        <button
          onClick={fetchRecs}
          disabled={!goal.trim() || loading}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-40 text-sm flex items-center justify-center gap-2"
        >
          Get AI Recommendations →
        </button>
      </div>
    </div>
  );

  // ── Step 3: tech stack recommendations ────────────────────────────────────
  const REC_TABS = [
    { key: 'languages'  as const, label: 'Languages'  },
    { key: 'frameworks' as const, label: 'Frameworks' },
    { key: 'tools'      as const, label: 'Tools'      },
    { key: 'deployment' as const, label: 'Deployment' },
  ];

  const renderStep3 = () => {
    if (!recs) return null;
    const items = recTab === 'tools' ? recs.tools : (recs[recTab] ?? []);
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start gap-3 flex-wrap mb-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended Tech Stack</h2>
          {selectedType && (
            <span className={`px-2.5 py-1 ${selectedType.bg} ${selectedType.color} text-xs font-bold rounded-lg border ${selectedType.border} shrink-0`}>
              {selectedType.label}
            </span>
          )}
        </div>
        {/* AI typewriter summary */}
        {typedSummary && (
          <p className="text-sm text-slate-600 mb-5 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {typedSummary}<span className="animate-pulse">|</span>
          </p>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
          {REC_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setRecTab(t.key)}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all
                ${recTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
              <span className="ml-1 text-[10px] text-slate-400">
                ({recTab === t.key && items.length > 0 ? items.length : (t.key === 'tools' ? recs.tools.length : (recs[t.key]?.length ?? 0))})
              </span>
            </button>
          ))}
        </div>

        {/* Items list — unlimited */}
        <div className="space-y-3 mb-6 max-h-[420px] overflow-y-auto pr-1">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-slate-300 transition-colors">
              <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 font-black text-slate-500 text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-slate-900 text-[15px]">{item.name}</span>
                  {'badge'    in item && item.badge    && <BadgeChip label={item.badge} />}
                  {'category' in item && item.category && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      {(item as { category: string }).category}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">{item.reason}</p>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3 mb-4">{error}</p>}
        <button
          onClick={fetchStructure}
          disabled={loading}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-40 text-sm"
        >
          Generate Project Structure →
        </button>
      </div>
    );
  };

  // ── Step 4: project structure ──────────────────────────────────────────────
  const STR_TABS = [
    { key: 'tree'     as const, label: 'Folder Structure' },
    { key: 'env'      as const, label: '.env Setup'       },
    { key: 'workflow' as const, label: 'Dev Workflow'     },
  ];

  const renderStep4 = () => {
    if (!structure) return null;
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Your Project Structure</h2>
          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold transition-all border ${
              saved
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            {saved
              ? <><CheckCheck className="w-4 h-4" /> Saved</>
              : saving
                ? 'Saving…'
                : <><Save className="w-4 h-4" /> Save</>}
          </button>
        </div>
        {structure.overview && <p className="text-sm text-slate-500 mb-2 leading-relaxed">{structure.overview}</p>}
        {structure.stack && (
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 mb-5">
            {structure.stack}
          </div>
        )}

        {/* Tab bar */}
        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
          {STR_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setStrTab(t.key)}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all
                ${strTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Folder tree — unlimited depth, all root folders open */}
        {strTab === 'tree' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
            {structure.tree.map((node, i) => (
              <FileTreeNode key={i} node={node} depth={0} />
            ))}
          </div>
        )}

        {/* .env panel */}
        {strTab === 'env' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 leading-relaxed">
              Create a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">.env</code> file
              in your project root. Add <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">.env</code> to{' '}
              <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">.gitignore</code> — never commit secrets.
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

        {/* Workflow panel */}
        {strTab === 'workflow' && (
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

        <button
          onClick={resetAll}
          className="w-full mt-6 bg-white border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:border-slate-300 hover:text-slate-900 transition-all text-sm"
        >
          ← Start Over with a New Project
        </button>
      </div>
    );
  };

  // ── Shell ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">

      {/* Top bar with step pills */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 md:px-6 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-0.5">
            {STEPS.map((label, i) => {
              const n      = i + 1;
              const done   = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-1.5 shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all
                    ${active ? 'bg-slate-900 text-white'
                      : done  ? 'bg-emerald-100 text-emerald-700'
                      :         'bg-slate-100 text-slate-400'}`}
                  >
                    {done ? <CheckCircle2 className="w-3 h-3" /> : <span>{n}</span>}
                    <span className="hidden sm:inline">{label}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px shrink-0 ${step > n ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
        {loading
          ? <LoadingScreen stage={loadStage} />
          : <>
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </>
        }
      </div>
    </div>
  );
}
