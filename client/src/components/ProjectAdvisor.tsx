import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/apiFetch';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import {
  STEPS, useTypewriter, LoadingScreen,
  type Recommendations, type ProjectStructure,
} from './ProjectAdvisorHelpers';
import {
  Step1, Step2, Step3,
  buildRecsPrompt, buildStructurePrompt,
} from './ProjectAdvisorSteps';
import { Step4 } from './ProjectAdvisorStep4';

export default function ProjectAdvisor({ onClose }: { onClose: () => void }) {
  const [step,      setStep]      = useState(1);
  const [type,      setType]      = useState('');
  const [goal,      setGoal]      = useState('');
  const [level,     setLevel]     = useState('intermediate');
  const [loading,   setLoading]   = useState(false);
  const [loadStage, setLoadStage] = useState<'recs' | 'structure'>('recs');
  const [error,     setError]     = useState('');
  const [recs,      setRecs]      = useState<Recommendations | null>(null);
  const [structure, setStructure] = useState<ProjectStructure | null>(null);
  const [recTab,    setRecTab]    = useState<'languages' | 'frameworks' | 'tools' | 'deployment'>('languages');
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  // ── Restore state from sessionStorage on mount (survives refresh) ──────────
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('advisor_state');
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.step)      setStep(s.step);
      if (s.type)      setType(s.type);
      if (s.goal)      setGoal(s.goal);
      if (s.level)     setLevel(s.level);
      if (s.recs)      setRecs(s.recs);
      if (s.structure) setStructure(s.structure);
    } catch (_e) { /* ignore corrupted data */ }
  }, []);

  // ── Persist state to sessionStorage whenever key values change ────────────
  useEffect(() => {
    try {
      sessionStorage.setItem('advisor_state', JSON.stringify({ step, type, goal, level, recs, structure }));
    } catch (_e) { /* ignore */ }
  }, [step, type, goal, level, recs, structure]);

  const typedSummary = useTypewriter(recs?.summary ?? '', 14);

  const user: { id?: number } = (() => {
    try { return JSON.parse(sessionStorage.getItem('user') || '{}'); }
    catch { return {}; }
  })();

  // ── Fetch tech recommendations ─────────────────────────────────────────────
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
      setError('Could not reach AI. Please try again.');
    }
    setLoading(false);
  };

  // ── Fetch project structure ────────────────────────────────────────────────
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
      localStorage.setItem(`advisor_${Date.now()}`, JSON.stringify({ type, goal, recs, structure }));
      setSaved(true);
    }
    setSaving(false);
  };

  const resetAll = () => {
    sessionStorage.removeItem('advisor_state');
    setStep(1); setType(''); setGoal('');
    setRecs(null); setStructure(null); setSaved(false); setError('');
  };

  // ── Navigate back to a completed step ─────────────────────────────────────
  const goToStep = (n: number) => {
    if (n < step && !loading) setStep(n);
  };

  // ── Shell ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-[100dvh] bg-[#F8FAFC]">

      {/* Sticky top bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 md:px-6 flex items-center gap-4">
          <button
            onClick={() => { sessionStorage.removeItem('advisor_state'); onClose(); }}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Clickable step pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 pb-0.5">
            {STEPS.map((label, i) => {
              const n      = i + 1;
              const done   = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => goToStep(n)}
                    disabled={!done && !active}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold transition-all
                      ${active  ? 'bg-slate-900 text-white cursor-default'
                       : done   ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 cursor-pointer'
                       :          'bg-slate-100 text-slate-400 cursor-default'}`}
                  >
                    {done ? <CheckCircle2 className="w-3 h-3" /> : <span>{n}</span>}
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-4 h-px shrink-0 ${step > n ? 'bg-emerald-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:px-6">
        {loading
          ? <LoadingScreen stage={loadStage} />
          : <>
              {step === 1 && (
                <Step1 type={type} setType={setType} setStep={setStep} />
              )}
              {step === 2 && (
                <Step2
                  type={type} goal={goal} setGoal={setGoal}
                  level={level} setLevel={setLevel}
                  loading={loading} error={error} onSubmit={fetchRecs}
                />
              )}
              {step === 3 && recs && (
                <Step3
                  recs={recs} type={type} typedSummary={typedSummary}
                  recTab={recTab} setRecTab={setRecTab}
                  loading={loading} error={error} onNext={fetchStructure}
                />
              )}
              {step === 4 && structure && (
                <Step4
                  structure={structure} goal={goal}
                  saving={saving} saved={saved}
                  onSave={handleSave} onReset={resetAll}
                />
              )}
            </>
        }
      </div>
    </div>
  );
}
