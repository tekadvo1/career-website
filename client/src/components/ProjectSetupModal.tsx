import { useState, useEffect, useRef } from 'react';
import {
  X, Clock, Calendar, Bell, Mail, Check, ChevronRight,
  Zap, Target, TrendingUp, BookOpen, Code2, Rocket,
  BarChart3, Layers, Flame, Cpu, Radio,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  role: string;
}

/* ── tiny animated counter ─────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame = 0;
    const total = 40;
    const tick = () => {
      frame++;
      setVal(Math.round((to * frame) / total));
      if (frame < total) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [to]);
  return <>{val}{suffix}</>;
}

/* ── radial progress ring ──────────────────────────────────────────────────── */
function Ring({ pct, size = 80, stroke = 7, colour = '#6366f1' }: { pct: number; size?: number; stroke?: number; colour?: string }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={colour} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

/* ── module icon by index ──────────────────────────────────────────────────── */
const MOD_ICONS = [Layers, Code2, BookOpen, Cpu, Rocket, TrendingUp];
const MOD_COLOURS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-600', ring: '#6366f1' },
  { bg: 'bg-purple-100', text: 'text-purple-600', ring: '#9333ea' },
  { bg: 'bg-blue-100',   text: 'text-blue-600',   ring: '#3b82f6' },
  { bg: 'bg-cyan-100',   text: 'text-cyan-600',   ring: '#06b6d4' },
  { bg: 'bg-emerald-100',text: 'text-emerald-600',ring: '#10b981' },
  { bg: 'bg-amber-100',  text: 'text-amber-600',  ring: '#f59e0b' },
];

export default function ProjectSetupModal({ isOpen, onClose, project, role }: ProjectSetupModalProps) {
  const navigate  = useNavigate();
  const streamRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [step,        setStep]        = useState(1);
  const [loading,     setLoading]     = useState(false);
  const [curriculum,  setCurriculum]  = useState<any[]>([]);
  const [streamedMods, setStreamedMods] = useState(0); // how many modules shown so far (for stream effect)
  const [liveTime,    setLiveTime]    = useState(new Date());

  // Schedule form
  const [dailyHours,    setDailyHours]    = useState(2);
  const [selectedDays,  setSelectedDays]  = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate,     setStartDate]     = useState(new Date().toISOString().split('T')[0]);
  const [email,         setEmail]         = useState('');
  const [notifications, setNotifications] = useState({ browser: true, email: true });
  const [os,            setOs]            = useState('Windows');

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TOTAL_HOURS = project?.metrics?.timeEstimate ? parseInt(project.metrics.timeEstimate) : 40;
  const weeklyHours    = dailyHours * selectedDays.length;
  const estimatedWeeks = Math.ceil(TOTAL_HOURS / (weeklyHours || 1));
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + estimatedWeeks * 7);
  const formattedCompletion = completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const totalTasks = curriculum.reduce((a: number, m: any) => a + (m.tasks?.length || 0), 0);
  const totalXP    = totalTasks * 50 + (project?.metrics?.xp || 500);

  /* live clock on step 2 */
  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => setLiveTime(new Date()), 1000);
    return () => clearInterval(t);
  }, [step]);

  /* stream modules in one-by-one after they arrive */
  useEffect(() => {
    if (!curriculum.length) return;
    setStreamedMods(0);
    let i = 0;
    streamRef.current = setInterval(() => {
      i++;
      setStreamedMods(i);
      if (i >= curriculum.length && streamRef.current) clearInterval(streamRef.current);
    }, 220);
    return () => { if (streamRef.current) clearInterval(streamRef.current); };
  }, [curriculum]);

  const toggleDay = (day: string) =>
    setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const handleContinue = async () => {
    setLoading(true);
    try {
      const res  = await fetch('/api/role/project-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.title,
          role,
          difficultly: project.difficulty,
          techStack: project.tools,
          timeCommitment: `${weeklyHours} hours/week`,
        }),
      });
      const data = await res.json();
      setCurriculum(data.success ? data.data : fallbackCurriculum());
    } catch {
      setCurriculum(fallbackCurriculum());
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  const handleStartProject = async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        await fetch('/api/role/start-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, project, role, curriculum }),
        });
      } catch { /* navigate anyway */ }
    }
    navigate('/project-workspace', {
      state: {
        project, role,
        settings: { timeCommitment: `${weeklyHours} hours/week`, schedule: { dailyHours, selectedDays, startDate }, os },
        preLoadedCurriculum: curriculum,
      },
    });
  };

  function fallbackCurriculum() {
    return [
      { id: 1, title: 'Project Setup & Architecture', estimatedHours: '3 hours', tasks: [{ id: 't1', title: 'Define structure', description: 'Create folders & config.', why: 'Scalability.', codeSnippet: 'mkdir src', verification: 'Run ls.' }] },
      { id: 2, title: 'Core Development',             estimatedHours: '12 hours', tasks: [{ id: 't2', title: 'Build main feature', description: 'Implement primary logic.', why: 'Product value.', codeSnippet: '// your code here', verification: 'Run tests.' }] },
      { id: 3, title: 'Testing & QA',                 estimatedHours: '6 hours',  tasks: [{ id: 't3', title: 'Write unit tests',   description: 'Coverage for key paths.', why: 'Reliability.',  codeSnippet: 'npm test', verification: 'All pass.' }] },
      { id: 4, title: 'Deployment',                   estimatedHours: '4 hours',  tasks: [{ id: 't4', title: 'Deploy to cloud',    description: 'Push to production.',     why: 'Live product.', codeSnippet: 'git push origin main', verification: 'App is live.' }] },
    ];
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className={`px-6 py-4 flex items-center justify-between flex-shrink-0 border-b ${step === 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-white border-slate-100'}`}>
          <div>
            <div className="flex items-center gap-2">
              {step === 2 && <Radio className="w-3.5 h-3.5 text-white/80 animate-pulse" />}
              <h2 className={`text-lg font-bold ${step === 2 ? 'text-white' : 'text-slate-900'}`}>
                {step === 1 ? 'Schedule Your Free Time' : 'Your Real-Time Project Plan'}
              </h2>
            </div>
            <p className={`text-sm mt-0.5 ${step === 2 ? 'text-indigo-200' : 'text-slate-500'}`}>{project.title}</p>
          </div>
          <div className="flex items-center gap-3">
            {step === 2 && (
              <span className="text-white/70 text-xs font-mono bg-white/10 px-2 py-1 rounded-lg">
                {liveTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            )}
            <button onClick={onClose} className={`p-1.5 rounded-full transition-colors ${step === 2 ? 'bg-white/10 hover:bg-white/20 text-white' : 'hover:bg-slate-100 text-slate-400'}`}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step indicator */}
        <div className={`flex flex-shrink-0 ${step === 2 ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-slate-50 border-b border-slate-100'}`}>
          {['Schedule', 'Live Plan'].map((label, i) => (
            <div key={label} className={`flex-1 py-2 text-center text-xs font-bold relative ${
              step === i + 1
                ? (step === 2 ? 'text-white' : 'text-indigo-600')
                : (step === 2 ? 'text-white/40' : 'text-slate-400')
            }`}>
              <span className={`inline-block w-4 h-4 rounded-full text-[10px] mr-1.5 ${
                step > i + 1 ? 'bg-green-500 text-white' :
                step === i + 1 ? (step === 2 ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white') :
                (step === 2 ? 'bg-white/20 text-white/60' : 'bg-slate-200 text-slate-500')
              }`}>{step > i + 1 ? '✓' : i + 1}</span>
              {label}
            </div>
          ))}
        </div>

        {/* ── Body ───────────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* ── STEP 1: Schedule ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="p-6 space-y-7">

              {/* Hours slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-900 text-sm">How many hours can you dedicate per day?</label>
                  <span className="text-indigo-600 font-bold text-xl">{dailyHours} <span className="text-sm font-medium text-slate-400">hrs</span></span>
                </div>
                <input type="range" min="1" max="12" value={dailyHours}
                  onChange={e => setDailyHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>1 hr</span><span>6 hrs</span><span>12 hrs</span>
                </div>
              </div>

              {/* Days selection */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-900 text-sm">Which days are you available?</label>
                <div className="grid grid-cols-7 gap-1.5">
                  {DAYS.map(day => {
                    const sel = selectedDays.includes(day);
                    return (
                      <button key={day} onClick={() => toggleDay(day)}
                        className={`py-2 rounded-xl text-xs font-semibold transition-all ${sel ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105' : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400">Selected: <span className="font-semibold text-indigo-600">{selectedDays.length}</span> days/week · <span className="font-semibold text-indigo-600">{weeklyHours} hrs</span>/week</p>
              </div>

              {/* Start date */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-900 text-sm">When do you want to start?</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-900 text-sm">Email for reminders <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input type="email" placeholder="your.email@example.com" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm" />
                </div>
              </div>

              {/* Notification prefs */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-900 text-sm">Reminder preferences</label>
                {[
                  { key: 'browser' as const, label: 'Browser notifications', Icon: Bell },
                  { key: 'email'   as const, label: 'Email reminders',       Icon: Mail },
                ].map(({ key, label, Icon }) => (
                  <label key={key} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${notifications[key] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-300'}`}>
                      {notifications[key] && <Check className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={notifications[key]} onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
                    <Icon className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-700">{label}</span>
                  </label>
                ))}
              </div>

              {/* OS selection */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-900 text-sm">Your Operating System</label>
                <div className="flex gap-2">
                  {['Windows', 'Mac', 'Linux'].map(sys => (
                    <button key={sys} onClick={() => setOs(sys)}
                      className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${os === sys ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}>
                      {sys}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick summary */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm mb-4">
                  <BarChart3 className="w-4 h-4" /> Quick Summary
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Weekly commitment', val: `${weeklyHours} hrs` },
                    { label: 'Estimated duration', val: `${estimatedWeeks} weeks` },
                    { label: 'Target completion', val: formattedCompletion },
                  ].map(s => (
                    <div key={s.label}>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wide font-medium mb-1">{s.label}</p>
                      <p className="text-lg font-bold text-indigo-600">{s.val}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── STEP 2: Real-time plan ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-slate-50 min-h-full">

              {/* ── Live stats row ─────────────────────────────────────────────── */}
              <div className="grid grid-cols-4 bg-white border-b border-slate-100">
                {[
                  { label: 'Total Hours',  val: TOTAL_HOURS, suffix: 'h',  colour: '#6366f1', pct: Math.min(100, TOTAL_HOURS) },
                  { label: 'Modules',      val: curriculum.length, suffix: '', colour: '#9333ea', pct: (curriculum.length / 6) * 100 },
                  { label: 'Tasks',        val: totalTasks, suffix: '',    colour: '#3b82f6', pct: Math.min(100, totalTasks * 5) },
                  { label: 'Total XP',     val: totalXP,    suffix: '',    colour: '#f59e0b', pct: Math.min(100, totalXP / 20) },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center py-4 gap-1">
                    <div className="relative">
                      <Ring pct={s.pct} size={56} stroke={5} colour={s.colour} />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[11px] font-bold" style={{ color: s.colour }}>
                          <Counter to={s.val} suffix={s.suffix} />
                        </span>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide text-center">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* ── Project metadata banner ─────────────────────────────────────── */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-3 flex items-center gap-4">
                <Flame className="w-5 h-5 text-orange-300 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm truncate">{project.title}</p>
                  <p className="text-indigo-200 text-xs">{project.difficulty} · {formattedCompletion} · {os}</p>
                </div>
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-full text-white text-xs font-bold">
                  <Zap className="w-3 h-3 text-amber-300" />{totalXP.toLocaleString()} XP
                </div>
              </div>

              {/* ── Module timeline ─────────────────────────────────────────────── */}
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    AI-Generated Curriculum
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                      <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                    </span>
                  </h3>
                  <span className="text-xs text-slate-400">{curriculum.length} modules · {totalTasks} tasks</span>
                </div>

                {curriculum.slice(0, streamedMods).map((mod: any, idx: number) => {
                  const Icon = MOD_ICONS[idx % MOD_ICONS.length];
                  const col  = MOD_COLOURS[idx % MOD_COLOURS.length];
                  const tasks = mod.tasks?.length || 0;
                  const modXP = tasks * 50;
                  const hrs   = typeof mod.estimatedHours === 'string' ? mod.estimatedHours : `${mod.estimatedHours}h`;
                  const isLast = idx === curriculum.length - 1;
                  return (
                    <div key={mod.id || idx} className="flex gap-3 animate-in slide-in-from-left-4 duration-300">
                      {/* connector line */}
                      <div className="flex flex-col items-center">
                        <div className={`w-9 h-9 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                          <Icon className={`w-4 h-4 ${col.text}`} />
                        </div>
                        {!isLast && <div className="w-0.5 flex-1 bg-gradient-to-b from-slate-200 to-transparent mt-1" />}
                      </div>

                      {/* card */}
                      <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 mb-2 hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Module {idx + 1}</span>
                            <h4 className={`font-bold text-slate-900 text-sm group-hover:${col.text} transition-colors`}>{mod.title}</h4>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full text-[10px] font-bold">
                              <Zap className="w-2.5 h-2.5" />{modXP} XP
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{hrs}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{tasks} task{tasks !== 1 ? 's' : ''}</span>
                        </div>

                        {/* mini task pills */}
                        {mod.tasks && mod.tasks.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {mod.tasks.slice(0, 3).map((t: any, ti: number) => (
                              <span key={ti} className={`px-2 py-0.5 ${col.bg} ${col.text} rounded-full text-[10px] font-medium`}>
                                {t.title?.length > 30 ? t.title.slice(0, 28) + '…' : t.title}
                              </span>
                            ))}
                            {mod.tasks.length > 3 && (
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full text-[10px] font-medium">+{mod.tasks.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* streaming skeleton if not all shown yet */}
                {streamedMods < curriculum.length && (
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex-shrink-0" />
                    <div className="flex-1 bg-white rounded-xl border border-slate-100 p-4 mb-2">
                      <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-slate-200 rounded w-2/3 mb-3" />
                      <div className="flex gap-3">
                        <div className="h-3 bg-slate-100 rounded w-16" />
                        <div className="h-3 bg-slate-100 rounded w-12" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── Schedule recap ─────────────────────────────────────────────── */}
              <div className="mx-5 mb-5 bg-white rounded-2xl border border-slate-100 p-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Your Schedule
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Daily:</span>
                    <span className="font-bold text-slate-900">{dailyHours} hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Weekly:</span>
                    <span className="font-bold text-slate-900">{weeklyHours} hrs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Start:</span>
                    <span className="font-bold text-slate-900">{new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-slate-500">Done by:</span>
                    <span className="font-bold text-emerald-600">{formattedCompletion}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-3">
                  {DAYS.map(d => (
                    <span key={d} className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${selectedDays.includes(d) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{d}</span>
                  ))}
                </div>
              </div>

              {/* ── Notifications configured ───────────────────────────────────── */}
              {(notifications.browser || notifications.email) && (
                <div className="mx-5 mb-5 bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                  <Bell className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-800 mb-1">Reminders Active</p>
                    <ul className="space-y-0.5">
                      {notifications.browser && <li className="text-xs text-blue-600 flex items-center gap-1"><Check className="w-3 h-3" /> Browser notifications on schedule days</li>}
                      {notifications.email && <li className="text-xs text-blue-600 flex items-center gap-1"><Check className="w-3 h-3" /> Weekly summary to {email || 'your email'}</li>}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* ── Sticky footer ──────────────────────────────────────────────────── */}
        <div className={`px-6 py-4 border-t flex items-center justify-between gap-3 flex-shrink-0 ${step === 2 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100'}`}>
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            {step === 1 ? 'Cancel' : '← Back'}
          </button>

          <button
            onClick={step === 1 ? handleContinue : handleStartProject}
            disabled={loading || selectedDays.length === 0}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
          >
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating AI Plan…</>
            ) : step === 1 ? (
              <>Continue to Timeline <ChevronRight className="w-4 h-4" /></>
            ) : (
              <><Rocket className="w-4 h-4" /> Start This Project</>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
