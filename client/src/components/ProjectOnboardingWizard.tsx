import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';
import { getUser } from '../utils/auth';
import {
  X, Sparkles, Target, Code2, ChevronRight, CheckCircle, Clock, Zap, Database, Play, Flame, Layout
} from 'lucide-react';

interface ProjectOnboardingWizardProps {
  project: any;
  role: string;
  onClose: () => void;
}

export default function ProjectOnboardingWizard({ project, role, onClose }: ProjectOnboardingWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<any[]>([]);

  // Form state
  const [dailyHours, setDailyHours] = useState(2);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [os, setOs] = useState('Windows');

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const TOTAL_HOURS = project?.metrics?.timeEstimate ? parseInt(project.metrics.timeEstimate) : 40;
  const weeklyHours = dailyHours * selectedDays.length;
  const estimatedWeeks = Math.ceil(TOTAL_HOURS / (weeklyHours || 1));
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + estimatedWeeks * 7);

  // Stop body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleDay = (day: string) => setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const handleGeneratePlan = async () => {
    setStep(4); // Generating step
    setLoading(true);
    
    // Fallback if API fails
    const fallbackCurriculum = [
      { id: 1, title: 'Project Initialization', description: 'Configure repository and environment variables', estimatedHours: '2 hrs' },
      { id: 2, title: 'Core Architecture', description: 'Implement database models and authentication flow', estimatedHours: '6 hrs' },
      { id: 3, title: 'API Services', description: 'Build and expose robust endpoints', estimatedHours: '8 hrs' },
      { id: 4, title: 'Frontend UI', description: 'Scaffold React components and routing', estimatedHours: '10 hrs' },
      { id: 5, title: 'Deployment', description: 'Deploy application to cloud infrastructure', estimatedHours: '4 hrs' },
    ];

    try {
      const response = await apiFetch('/api/role/project-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project.title,
          role: role,
          difficultly: project.difficulty,
          techStack: project.tools,
          timeCommitment: `${weeklyHours} hours/week` 
        })
      });
      const data = await response.json();
      setCurriculum((data.success && data.data) ? data.data : fallbackCurriculum);
    } catch (e) {
      setCurriculum(fallbackCurriculum);
    } finally {
      setLoading(false);
      setStep(5); // Final step
    }
  };

  const handleStartProject = async () => {
    setLoading(true);
    const user = (getUser() ?? {});
    let dbProjectId = project.id;

    if (user.id) {
      try {
        const res = await apiFetch('/api/role/start-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, project, role, curriculum }),
        });
        const data = await res.json();
        if (data.success && data.projectId) dbProjectId = data.projectId;
      } catch (e) { console.error('Failed to start project', e); }
    }
    
    navigate('/project-workspace', {
      state: {
        project: { ...project, id: dbProjectId, projectId: dbProjectId },
        role,
        settings: { timeCommitment: `${weeklyHours} hours/week`, schedule: { dailyHours, selectedDays, startDate }, os },
        preLoadedCurriculum: curriculum
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6" style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)' }}>
      <div className="relative bg-white rounded-none sm:rounded-3xl shadow-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Project Initialization</h2>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3, 5].map(s => (
                  <div key={s} className={`h-1 rounded-full transition-all duration-300 ${s < step ? 'w-6 bg-emerald-500' : s === step ? 'w-6 bg-slate-800' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 no-scrollbar relative bg-slate-50/50">
          
          {/* STEP 1: What You'll Build */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[12px] font-bold uppercase tracking-wider mb-4 border border-emerald-200/60">
                  <Target className="w-4 h-4" /> Goal Match: {project.matchScore}%
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{project.title}</h1>
                <p className="text-slate-500 text-[16px] leading-relaxed font-medium">{project.description}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-10">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Layout className="w-4 h-4" /> The Challenge</h3>
                  <ul className="space-y-3">
                    {project.whyRecommended?.slice(0, 3).map((r: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-sm text-slate-700 font-medium">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Skills Gained</h3>
                  <div className="flex flex-wrap gap-2">
                    {project.skillsToDevelop?.slice(0, 6).map((s: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[12px] font-bold rounded-lg border border-slate-200">{s}</span>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl">
                Review Tech Blueprint <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Your Tech Blueprint */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-3xl mx-auto">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
                <Code2 className="w-6 h-6 text-emerald-500" /> Engineering Blueprint
              </h2>

              <div className="space-y-6">
                {/* Tech Stack */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Required Stack</h3>
                  <div className="flex flex-wrap gap-3">
                    {[...(project.languages || []), ...(project.tools || [])].map((tech, i) => (
                      <span key={i} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm font-bold shadow-sm">{tech}</span>
                    ))}
                  </div>
                </div>

                {/* Architecture Scope */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <Database className="w-6 h-6 text-blue-500 mb-3" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Backend / DB</span>
                    <span className="text-sm font-bold text-slate-800">{project.tools?.includes('PostgreSQL') || project.tools?.includes('MongoDB') ? 'Required' : 'Optional'}</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <Layout className="w-6 h-6 text-purple-500 mb-3" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Complexity</span>
                    <span className="text-sm font-bold text-slate-800 capitalize flex items-center gap-1"><Flame className="w-3.5 h-3.5 text-orange-500" /> {project.difficulty}</span>
                  </div>
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
                    <Clock className="w-6 h-6 text-emerald-500 mb-3" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Est. Effort</span>
                    <span className="text-sm font-bold text-slate-800">{TOTAL_HOURS} Hours</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-10">
                <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors">Back</button>
                <button onClick={() => setStep(3)} className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg">
                  Configure Schedule <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Personalize Your Plan */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto">
              <h2 className="text-2xl font-extrabold text-slate-900 mb-8">Personalize Your Schedule</h2>
              
              <div className="space-y-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
                
                {/* Hours */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Daily Commitment</label>
                    <span className="text-emerald-600 font-extrabold bg-emerald-50 px-3 py-1 rounded-lg">{dailyHours} hours / day</span>
                  </div>
                  <input type="range" min="1" max="8" value={dailyHours} onChange={e => setDailyHours(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                </div>

                {/* Days */}
                <div>
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Available Days</label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {DAYS.map(day => {
                      const sel = selectedDays.includes(day);
                      return (
                        <button key={day} onClick={() => toggleDay(day)}
                          className={`py-2.5 rounded-xl text-[13px] font-bold transition-all border ${sel ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400'}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date & OS */}
                <div className="grid grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Start Date</label>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 block">Target OS</label>
                    <select value={os} onChange={e => setOs(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
                      <option>Windows</option><option>Mac</option><option>Linux</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition-colors">Back</button>
                <button onClick={handleGeneratePlan} disabled={selectedDays.length === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                  <Sparkles className="w-5 h-5" /> Generate AI Roadmap
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Loading / Generating */}
          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 relative">
                <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Architecting Curriculum...</h2>
              <p className="text-slate-500 font-medium animate-pulse">Structuring modules, estimating tasks, and preparing workspace.</p>
            </div>
          )}

          {/* STEP 5: Roadmap Ready */}
          {step === 5 && (
            <div className="animate-in zoom-in-95 duration-500 max-w-3xl mx-auto">
              <div className="bg-slate-900 rounded-3xl p-8 mb-8 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <h2 className="text-2xl font-extrabold text-white mb-2 relative z-10">Your Roadmap is Ready 🚀</h2>
                <p className="text-emerald-400 font-bold mb-8 relative z-10">Target Delivery: {completionDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} ({estimatedWeeks} weeks)</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Total Effort</div>
                    <div className="text-white font-extrabold text-xl">{TOTAL_HOURS} hrs</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Your Pace</div>
                    <div className="text-white font-extrabold text-xl">{weeklyHours} hrs/wk</div>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Modules</div>
                    <div className="text-white font-extrabold text-xl">{curriculum.length} stages</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {curriculum.map((item, index) => (
                  <div key={index} className="bg-white p-4 rounded-2xl border border-slate-200 flex gap-4 items-center shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-sm">{index + 1}</div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800">{item.title}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{item.description}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-slate-50 rounded-lg">{item.estimatedHours}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleStartProject} disabled={loading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-[16px] flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.4)] hover:-translate-y-0.5">
                {loading ? 'Booting Workspace...' : <><Play className="w-5 h-5 fill-current" /> Initialize Engineering Workspace</>}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}