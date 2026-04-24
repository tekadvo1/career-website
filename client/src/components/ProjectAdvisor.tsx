import { useState } from 'react';
import { apiFetch } from '../utils/apiFetch';
import {
  ArrowLeft, Globe, Smartphone, BarChart2, Server, Layers,
  Loader2, FolderOpen, Folder, FileCode, FileText,
  Database, Rocket, GitBranch, CheckCircle2, ChevronDown, ChevronRight
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FileNode {
  name: string;
  type: 'folder' | 'file';
  description: string;
  children?: FileNode[];
}
interface TechItem { name: string; reason: string; badge: string; }
interface ToolItem { name: string; reason: string; category: string; }
interface Recommendations {
  languages: TechItem[];
  frameworks: TechItem[];
  tools: ToolItem[];
  deployment: TechItem[];
  summary: string;
}
interface ProjectStructure {
  overview: string;
  stack: string;
  tree: FileNode[];
  envVars: string[];
  workflow: string[];
}

// ── Static data ────────────────────────────────────────────────────────────────
const PROJECT_TYPES = [
  { id: 'website',   label: 'Website',       sub: 'Landing page, blog, e-commerce',  Icon: Globe,     color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200'   },
  { id: 'mobile',    label: 'Mobile App',    sub: 'iOS, Android, cross-platform',    Icon: Smartphone, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
  { id: 'dashboard', label: 'Dashboard',     sub: 'Analytics, Power BI, data viz',   Icon: BarChart2,  color: 'text-amber-600',  bg: 'bg-amber-50',  border: 'border-amber-200'  },
  { id: 'api',       label: 'Backend / API', sub: 'REST API, microservices, server', Icon: Server,     color: 'text-slate-700',  bg: 'bg-slate-100', border: 'border-slate-300'  },
  { id: 'fullstack', label: 'Full-Stack App',sub: 'Complete web application',        Icon: Layers,     color: 'text-emerald-600',bg: 'bg-emerald-50',border: 'border-emerald-200'},
];
const LEVELS = [
  { id: 'beginner',     label: 'Beginner',     desc: 'Learning the basics'   },
  { id: 'intermediate', label: 'Intermediate', desc: 'Built a few projects'  },
  { id: 'advanced',     label: 'Advanced',     desc: 'Production experience' },
];
const STEPS = ['Project Type', 'Details', 'Tech Stack', 'Structure'];

// ── Small helpers ──────────────────────────────────────────────────────────────
function BadgeChip({ label }: { label: string }) {
  const map: Record<string, string> = {
    Recommended: 'bg-emerald-100 text-emerald-700',
    Trending:    'bg-violet-100  text-violet-700',
    Popular:     'bg-blue-100    text-blue-700',
    Core:        'bg-slate-100   text-slate-600',
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${map[label] || 'bg-slate-100 text-slate-600'}`}>
      {label}
    </span>
  );
}

// ── Recursive file-tree node ───────────────────────────────────────────────────
function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 1);
  const isDir = node.type === 'folder';

  const fileIcon = () => {
    const n = node.name.toLowerCase();
    if (n.includes('.env'))                                        return <FileText  className="w-3.5 h-3.5 text-rose-400   shrink-0" />;
    if (n.endsWith('.json') || n.endsWith('.yaml') || n.endsWith('.yml') || n.endsWith('.toml'))
                                                                   return <FileText  className="w-3.5 h-3.5 text-yellow-500 shrink-0" />;
    if (n.includes('route') || n.includes('controller'))          return <GitBranch className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
    if (n.includes('docker') || n.includes('deploy'))             return <Rocket    className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
    if (n.includes('schema') || n.endsWith('.sql'))               return <Database  className="w-3.5 h-3.5 text-blue-400   shrink-0" />;
    return <FileCode className="w-3.5 h-3.5 text-slate-400 shrink-0" />;
  };

  return (
    <div>
      <button
        onClick={() => isDir && setOpen(!open)}
        style={{ paddingLeft: depth * 18 + 12 }}
        className={`w-full flex items-center gap-2 py-1.5 pr-3 rounded-lg text-left transition-colors ${isDir ? 'hover:bg-slate-50 cursor-pointer' : 'cursor-default'}`}
      >
        {isDir
          ? (open
              ? <FolderOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              : <Folder     className="w-3.5 h-3.5 text-amber-500 shrink-0" />)
          : fileIcon()
        }
        <span className={`text-sm ${isDir ? 'font-semibold text-slate-800' : 'font-medium text-slate-600'}`}>
          {node.name}
        </span>
        {isDir && (open
          ? <ChevronDown  className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />
          : <ChevronRight className="w-3 h-3 text-slate-400 ml-0.5 shrink-0" />)}
        {node.description && (
          <span className="text-[11px] text-slate-400 ml-auto truncate max-w-[200px] hidden sm:block">
            {node.description}
          </span>
        )}
      </button>
      {isDir && open && node.children?.map((c, i) => (
        <FileTreeNode key={i} node={c} depth={depth + 1} />
      ))}
    </div>
  );
}

// ── Main wizard ────────────────────────────────────────────────────────────────
export default function ProjectAdvisor({ onClose }: { onClose: () => void }) {
  const [step,      setStep]      = useState(1);
  const [type,      setType]      = useState('');
  const [goal,      setGoal]      = useState('');
  const [level,     setLevel]     = useState('intermediate');
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [recs,      setRecs]      = useState<Recommendations | null>(null);
  const [structure, setStructure] = useState<ProjectStructure | null>(null);
  const [recTab,    setRecTab]    = useState<'languages' | 'frameworks' | 'tools' | 'deployment'>('languages');
  const [strTab,    setStrTab]    = useState<'tree' | 'env' | 'workflow'>('tree');

  const selectedType = PROJECT_TYPES.find(t => t.id === type);

  // ── AI: fetch tech recommendations ──────────────────────────────────────────
  const fetchRecs = async () => {
    setLoading(true);
    setError('');
    try {
      const prompt = `You are an expert software architect. The user wants to build a ${type} project.
Goal: "${goal}". Experience: ${level}.
Return ONLY valid JSON (no markdown):
{
  "languages":  [{"name":"","reason":"","badge":"Recommended|Popular|Trending|Core"}],
  "frameworks": [{"name":"","reason":"","badge":""}],
  "tools":      [{"name":"","reason":"","category":"Build|Deploy|Testing|Database|Design"}],
  "deployment": [{"name":"","reason":"","badge":""}],
  "summary":    ""
}
Max 4 items per array. Be specific and practical.`;

      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: prompt,
          context: { type: 'advisor', projectTitle: goal, currentTask: 'tech-stack' },
          role: 'Software Engineer',
          responseFormat: 'json',
        }),
      });
      const data   = await res.json();
      const parsed = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;
      setRecs(parsed);
      setStep(3);
    } catch (_e) {
      setError('Could not connect to AI. Please try again.');
    }
    setLoading(false);
  };

  // ── AI: fetch project structure ──────────────────────────────────────────────
  const fetchStructure = async () => {
    if (!recs) return;
    setLoading(true);
    setError('');
    try {
      const stack = `${recs.frameworks[0]?.name || ''} + ${recs.languages[0]?.name || ''}`;
      const prompt = `You are an expert software architect. Generate a complete project folder structure.
Type: ${type}. Stack: ${stack}. Goal: "${goal}".
Return ONLY valid JSON (no markdown):
{
  "overview": "2-sentence architecture description",
  "stack": "e.g. React + TypeScript + Node.js + PostgreSQL",
  "tree": [
    {
      "name": "project-root", "type": "folder", "description": "Root directory",
      "children": [
        { "name": "src", "type": "folder", "description": "Source code", "children": [
            { "name": "components",  "type": "folder", "description": "Reusable UI components", "children": [] },
            { "name": "pages",       "type": "folder", "description": "Route-level pages",       "children": [] },
            { "name": "utils",       "type": "folder", "description": "Helper functions",         "children": [] },
            { "name": "App.tsx",     "type": "file",   "description": "Root component"                         }
        ]},
        { "name": "public",       "type": "folder", "description": "Static assets",         "children": [] },
        { "name": ".env",         "type": "file",   "description": "Environment variables — never commit" },
        { "name": "package.json", "type": "file",   "description": "Dependencies and scripts" }
      ]
    }
  ],
  "envVars":  ["DATABASE_URL=postgresql://user:password@localhost:5432/mydb", "API_KEY=your_api_key_here"],
  "workflow": ["Install: npm install", "Set up .env", "Run dev: npm run dev", "Build: npm run build", "Deploy to hosting"]
}`;

      const res = await apiFetch('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: prompt,
          context: { type: 'advisor', projectTitle: goal, currentTask: 'project-structure' },
          role: 'Software Engineer',
          responseFormat: 'json',
        }),
      });
      const data   = await res.json();
      const parsed = typeof data.reply === 'string' ? JSON.parse(data.reply) : data.reply;
      setStructure(parsed);
      setStep(4);
    } catch (_e) {
      setError('Could not generate structure. Please try again.');
    }
    setLoading(false);
  };

  // ── Step 1: project type ─────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">What are you building?</h2>
      <p className="text-sm text-slate-500 mb-6">Select your project type to get a tailored tech recommendation</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PROJECT_TYPES.map(({ id, label, sub, Icon, color, bg, border }) => (
          <button
            key={id}
            onClick={() => { setType(id); setStep(2); }}
            className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
              type === id ? `${border} ${bg}` : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center shrink-0 border ${border}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-[15px]">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // ── Step 2: project details ──────────────────────────────────────────────────
  const renderStep2 = () => (
    <div className="max-w-xl mx-auto">
      <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Tell us about your project</h2>
      <p className="text-sm text-slate-500 mb-6">The more detail you give, the better the recommendation</p>
      <div className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            What does it do?
          </label>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="e.g. An e-commerce platform where users can buy and sell handmade goods..."
            rows={4}
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
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  level === l.id
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                }`}
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
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your project...</>
            : 'Get AI Recommendations →'
          }
        </button>
      </div>
    </div>
  );

  // ── Step 3: recommendations ──────────────────────────────────────────────────
  const REC_TABS = [
    { key: 'languages'  as const, label: 'Languages'  },
    { key: 'frameworks' as const, label: 'Frameworks' },
    { key: 'tools'      as const, label: 'Tools'      },
    { key: 'deployment' as const, label: 'Deployment' },
  ];

  const renderStep3 = () => {
    if (!recs) return null;
    const items: (TechItem | ToolItem)[] = recTab === 'tools' ? recs.tools : recs[recTab] ?? [];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-start justify-between mb-1 gap-3 flex-wrap">
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended Tech Stack</h2>
          {selectedType && (
            <span className={`px-2.5 py-1 ${selectedType.bg} ${selectedType.color} text-xs font-bold rounded-lg border ${selectedType.border} shrink-0`}>
              {selectedType.label}
            </span>
          )}
        </div>
        {recs.summary && <p className="text-sm text-slate-500 mb-5 leading-relaxed">{recs.summary}</p>}

        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
          {REC_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setRecTab(t.key)}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                recTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3 mb-6">
          {items.map((item, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-slate-300 transition-colors">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center shrink-0 font-black text-slate-600 text-sm">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-bold text-slate-900 text-[15px]">{item.name}</span>
                  {'badge'    in item && item.badge    && <BadgeChip label={item.badge} />}
                  {'category' in item && item.category && (
                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                      {item.category}
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
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-40 flex items-center justify-center gap-2 text-sm"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Building your structure...</>
            : 'Generate Project Structure →'
          }
        </button>
      </div>
    );
  };

  // ── Step 4: project structure ────────────────────────────────────────────────
  const STR_TABS = [
    { key: 'tree'     as const, label: 'Folder Structure' },
    { key: 'env'      as const, label: '.env Setup'       },
    { key: 'workflow' as const, label: 'Dev Workflow'     },
  ];

  const renderStep4 = () => {
    if (!structure) return null;
    return (
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">Your Project Structure</h2>
        {structure.overview && (
          <p className="text-sm text-slate-500 mb-2 leading-relaxed">{structure.overview}</p>
        )}
        {structure.stack && (
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200 mb-5">
            {structure.stack}
          </div>
        )}

        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
          {STR_TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setStrTab(t.key)}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${
                strTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {strTab === 'tree' && (
          <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono overflow-x-auto">
            {structure.tree.map((node, i) => (
              <FileTreeNode key={i} node={node} depth={0} />
            ))}
          </div>
        )}

        {strTab === 'env' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Create a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">.env</code> file
              in your project root. Add it to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-mono">.gitignore</code> — never commit secrets.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-sm space-y-1.5">
              {structure.envVars.map((v, i) => {
                const eqIdx = v.indexOf('=');
                const key   = v.slice(0, eqIdx);
                const val   = v.slice(eqIdx + 1);
                return (
                  <div key={i} className="flex items-start gap-1.5 flex-wrap">
                    <span className="text-emerald-400">{key}</span>
                    <span className="text-slate-500">=</span>
                    <span className="text-slate-300 break-all">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {strTab === 'workflow' && (
          <div className="space-y-3">
            {structure.workflow.map((wStep, i) => (
              <div key={i} className="flex items-start gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                <div className="w-7 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-slate-700 font-medium pt-0.5">{wStep}</p>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => { setStep(1); setType(''); setGoal(''); setRecs(null); setStructure(null); }}
          className="w-full mt-6 bg-white border border-slate-200 text-slate-600 font-semibold py-3 rounded-xl hover:border-slate-300 hover:text-slate-900 transition-all text-sm"
        >
          ← Start Over with a New Project
        </button>
      </div>
    );
  };

  // ── Shell ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">

      {/* Top bar with step indicator */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 md:px-6 flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Step pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1">
            {STEPS.map((label, i) => {
              const n    = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-1.5 shrink-0">
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    active ? 'bg-slate-900 text-white'
                    : done  ? 'bg-emerald-100 text-emerald-700'
                    :         'bg-slate-100 text-slate-400'
                  }`}>
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

      {/* Main content area */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
      </div>
    </div>
  );
}
