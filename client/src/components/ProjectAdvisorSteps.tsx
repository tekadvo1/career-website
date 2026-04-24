import { apiFetch } from '../utils/apiFetch';
import {
  PROJECT_TYPES, LEVELS, SUGGESTIONS,
  BadgeChip,
  type Recommendations, type ProjectStructure, type TechItem, type ToolItem,
} from './ProjectAdvisorHelpers';

// ── Prompt builders ───────────────────────────────────────────────────────────
export function buildRecsPrompt(type: string, goal: string, level: string) {
  return `You are an expert software architect.
Project type: ${type}. Goal: "${goal}". Experience: ${level}.
Return ONLY valid JSON:
{
  "languages":  [{"name":"","reason":"","badge":"Recommended|Popular|Trending|Core|Essential"}],
  "frameworks": [{"name":"","reason":"","badge":""}],
  "tools":      [{"name":"","reason":"","category":"Build|Deploy|Testing|Database|Design|DevOps|Monitoring"}],
  "deployment": [{"name":"","reason":"","badge":""}],
  "summary":    ""
}
Return 6-10 items per array. Cover ALL major options a developer would consider.`;
}

export function buildStructurePrompt(type: string, goal: string, recs: Recommendations) {
  const lang = recs.languages[0]?.name || '';
  const fw   = recs.frameworks[0]?.name || '';
  return `You are an expert software architect. Generate a COMPLETE production-ready project structure.
Type: ${type}. Stack: ${fw} + ${lang}. Goal: "${goal}".
Return ONLY valid JSON:
{
  "overview": "2-sentence architecture description",
  "stack": "Tech1 + Tech2 + Tech3",
  "tree": [{"name":"project-root","type":"folder","description":"Root","children":[
    {"name":"src","type":"folder","description":"Source code","children":[
      {"name":"components","type":"folder","description":"Reusable UI","children":[
        {"name":"Button.tsx","type":"file","description":"Button component"},
        {"name":"Card.tsx","type":"file","description":"Card component"}
      ]},
      {"name":"pages","type":"folder","description":"Page-level components","children":[
        {"name":"Home.tsx","type":"file","description":"Homepage"},
        {"name":"Dashboard.tsx","type":"file","description":"Dashboard"}
      ]},
      {"name":"hooks","type":"folder","description":"Custom React hooks","children":[]},
      {"name":"utils","type":"folder","description":"Utilities","children":[]},
      {"name":"services","type":"folder","description":"API calls","children":[]},
      {"name":"types","type":"folder","description":"TypeScript types","children":[]},
      {"name":"context","type":"folder","description":"React contexts","children":[]},
      {"name":"App.tsx","type":"file","description":"Root component"},
      {"name":"main.tsx","type":"file","description":"Entry point"}
    ]},
    {"name":"public","type":"folder","description":"Static assets","children":[{"name":"favicon.ico","type":"file","description":"Browser icon"}]},
    {"name":"tests","type":"folder","description":"Test files","children":[]},
    {"name":".env","type":"file","description":"Environment variables — never commit"},
    {"name":".env.example","type":"file","description":"Template for .env"},
    {"name":".gitignore","type":"file","description":"Git exclusions"},
    {"name":"package.json","type":"file","description":"Dependencies"},
    {"name":"README.md","type":"file","description":"Documentation"}
  ]}],
  "backend": [{"name":"backend","type":"folder","description":"Server source","children":[
    {"name":"routes","type":"folder","description":"API route handlers","children":[
      {"name":"authRoutes.js","type":"file","description":"Auth endpoints"},
      {"name":"userRoutes.js","type":"file","description":"User endpoints"}
    ]},
    {"name":"controllers","type":"folder","description":"Business logic","children":[
      {"name":"authController.js","type":"file","description":"Auth logic"},
      {"name":"userController.js","type":"file","description":"User logic"}
    ]},
    {"name":"middleware","type":"folder","description":"Express middleware","children":[
      {"name":"authMiddleware.js","type":"file","description":"JWT verification"},
      {"name":"errorHandler.js","type":"file","description":"Global error handler"}
    ]},
    {"name":"models","type":"folder","description":"Database models","children":[
      {"name":"User.js","type":"file","description":"User model/schema"}
    ]},
    {"name":"config","type":"folder","description":"App configuration","children":[
      {"name":"db.js","type":"file","description":"Database connection"}
    ]},
    {"name":"utils","type":"folder","description":"Server utilities","children":[]},
    {"name":"server.js","type":"file","description":"Express entry point"},
    {"name":".env","type":"file","description":"Server environment variables"}
  ]}],
  "database": [
    {"name":"users","description":"Stores user accounts","columns":[
      {"name":"id","type":"SERIAL PRIMARY KEY","description":"Unique user ID"},
      {"name":"email","type":"VARCHAR(255) UNIQUE NOT NULL","description":"User email"},
      {"name":"password_hash","type":"VARCHAR(255)","description":"Hashed password"},
      {"name":"created_at","type":"TIMESTAMP DEFAULT NOW()","description":"Account creation date"}
    ]},
    {"name":"sessions","description":"User auth sessions","columns":[
      {"name":"id","type":"SERIAL PRIMARY KEY","description":"Session ID"},
      {"name":"user_id","type":"INTEGER REFERENCES users(id)","description":"Linked user"},
      {"name":"token","type":"TEXT NOT NULL","description":"JWT or session token"},
      {"name":"expires_at","type":"TIMESTAMP","description":"Expiry time"}
    ]}
  ],
  "envVars": ["DATABASE_URL=postgresql://user:password@localhost:5432/mydb","API_KEY=your_api_key","JWT_SECRET=long_random_secret","NODE_ENV=development","PORT=5000"],
  "workflow": ["1. Clone: git clone <repo-url>","2. Install: npm install","3. Setup env: cp .env.example .env","4. Fill .env values","5. Dev server: npm run dev","6. Tests: npm test","7. Build: npm run build","8. Deploy to hosting"]
}
Generate a COMPLETE, deep, real-world structure for a ${type} project. Include all real files and folders.`;
}

// ── AI chat for structure assistant ──────────────────────────────────────────
export async function sendChatMessage(
  message: string,
  structure: ProjectStructure,
  goal: string,
  history: { role: string; content: string }[]
) {
  const res = await apiFetch('/api/project-structure/chat', {
    method: 'POST',
    body: JSON.stringify({ message, structure, history, projectPrompt: goal }),
  });
  const data = await res.json();
  return data.reply as string;
}

// ── Step 1 ────────────────────────────────────────────────────────────────────
export function Step1({
  type, setType, setStep,
}: { type: string; setType: (v: string) => void; setStep: (n: number) => void; }) {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-xl font-extrabold text-slate-900 mb-1 tracking-tight">What are you building?</h2>
      <p className="text-sm text-slate-500 mb-6">Select your project type to get a personalised tech stack and folder structure</p>
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
}

// ── Step 2 ────────────────────────────────────────────────────────────────────
export function Step2({
  type, goal, setGoal, level, setLevel, loading, error, onSubmit,
}: {
  type: string; goal: string; setGoal: (v: string) => void;
  level: string; setLevel: (v: string) => void;
  loading: boolean; error: string; onSubmit: () => void;
}) {
  const pt   = PROJECT_TYPES.find(t => t.id === type);
  const sugs = SUGGESTIONS[type] || [];

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Tell us about your project</h2>
        {pt && (
          <span className={`px-2.5 py-1 ${pt.bg} ${pt.color} text-xs font-bold rounded-lg border ${pt.border}`}>
            {pt.label}
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500 mb-5">Describe it or pick a suggestion below</p>

      {/* AI suggestion chips */}
      {sugs.length > 0 && (
        <div className="mb-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">💡 Suggested ideas</p>
          <div className="space-y-2">
            {sugs.map((s, i) => (
              <button
                key={i}
                onClick={() => setGoal(s)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm border transition-all
                  ${goal === s
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800 font-medium'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Or describe it yourself
          </label>
          <textarea
            value={goal}
            onChange={e => setGoal(e.target.value)}
            placeholder="Add more details about your specific project…"
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
                className={`p-3 rounded-xl border-2 text-center transition-all
                  ${level === l.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'}`}
              >
                <p className="font-bold text-sm">{l.label}</p>
                <p className="text-[11px] mt-0.5 text-slate-400">{l.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-sm text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">{error}</p>
        )}
        <button
          onClick={onSubmit}
          disabled={!goal.trim() || loading}
          className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-40 text-sm"
        >
          Get AI Recommendations →
        </button>
      </div>
    </div>
  );
}

// ── Step 3 ────────────────────────────────────────────────────────────────────
const REC_TABS = [
  { key: 'languages'  as const, label: 'Languages'  },
  { key: 'frameworks' as const, label: 'Frameworks' },
  { key: 'tools'      as const, label: 'Tools'      },
  { key: 'deployment' as const, label: 'Deployment' },
];

export function Step3({
  recs, type, typedSummary, recTab, setRecTab, loading, error, onNext,
}: {
  recs: Recommendations; type: string; typedSummary: string;
  recTab: 'languages' | 'frameworks' | 'tools' | 'deployment';
  setRecTab: (k: 'languages' | 'frameworks' | 'tools' | 'deployment') => void;
  loading: boolean; error: string; onNext: () => void;
}) {
  const pt    = PROJECT_TYPES.find(t => t.id === type);
  const items: (TechItem | ToolItem)[] = recTab === 'tools' ? recs.tools : (recs[recTab] ?? []);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-start gap-3 flex-wrap mb-2">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Recommended Tech Stack</h2>
        {pt && (
          <span className={`px-2.5 py-1 ${pt.bg} ${pt.color} text-xs font-bold rounded-lg border ${pt.border} shrink-0`}>
            {pt.label}
          </span>
        )}
      </div>

      {typedSummary && (
        <p className="text-sm text-slate-600 mb-5 leading-relaxed bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
          {typedSummary}<span className="animate-pulse">|</span>
        </p>
      )}

      <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl">
        {REC_TABS.map(t => {
          const count = t.key === 'tools' ? recs.tools.length : (recs[t.key]?.length ?? 0);
          return (
            <button
              key={t.key}
              onClick={() => setRecTab(t.key)}
              className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all
                ${recTab === t.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t.label} <span className="text-[10px] text-slate-400">({count})</span>
            </button>
          );
        })}
      </div>

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
                    {(item as ToolItem).category}
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
        onClick={onNext}
        disabled={loading}
        className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-black transition-colors disabled:opacity-40 text-sm"
      >
        Generate Full Project Structure →
      </button>
    </div>
  );
}
