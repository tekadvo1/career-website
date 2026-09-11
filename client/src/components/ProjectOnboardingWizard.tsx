import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/apiFetch';
import { getUser } from '../utils/auth';
import {
  X, Sparkles, ChevronRight, CheckCircle, Zap, Play, Layout, AlertCircle, RefreshCw, Calendar
} from 'lucide-react';
import type { Project, ScheduleSettings } from './projects/projectModel';

interface ProjectOnboardingWizardProps {
  project: Project;
  role: string;
  onClose: () => void;
}

export default function ProjectOnboardingWizard({ project, role, onClose }: ProjectOnboardingWizardProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [curriculum, setCurriculum] = useState<any[]>([]);

  // Form state
  const [mode, setMode] = useState<'scheduled' | 'self-paced'>('scheduled');
  const [dailyHours, setDailyHours] = useState(2);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate] = useState(new Date().toISOString().split('T')[0]);
  const [os] = useState('Windows');

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const TOTAL_HOURS = project?.metrics?.timeEstimate ? parseInt(project.metrics.timeEstimate) : 40;
  const weeklyHours = dailyHours * selectedDays.length;
  
  // Calculate completion date based on available days
  const getEstimatedCompletion = () => {
    if (mode === 'self-paced' || selectedDays.length === 0) return null;
    const hoursPerDay = dailyHours || 1;
    let hoursRemaining = TOTAL_HOURS;
    const current = new Date(startDate);
    
    // Safety limit of 1 year
    let daysIterated = 0;
    while (hoursRemaining > 0 && daysIterated < 365) {
      const dayName = current.toLocaleDateString('en-US', { weekday: 'short' });
      if (selectedDays.includes(dayName)) {
        hoursRemaining -= hoursPerDay;
      }
      if (hoursRemaining > 0) {
        current.setDate(current.getDate() + 1);
      }
      daysIterated++;
    }
    return current;
  };

  const estimatedCompletionDate = getEstimatedCompletion();

  // Stop body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const toggleDay = (day: string) => setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const handleGeneratePlan = async () => {
    setStep(3);
    setLoading(true);
    setError('');
    
    try {
      const response = await apiFetch('/api/role/project-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectTitle: project?.title,
          role: role,
          difficultly: project.difficulty,
          techStack: project.tools,
          timeCommitment: mode === 'scheduled' ? `${weeklyHours} hours/week` : 'Flexible'
        })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
         throw new Error(data.error || "Failed to generate plan");
      }
      setCurriculum(data.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong generating the curriculum.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartProject = async () => {
    setLoading(true);
    setError('');
    const user = (getUser() ?? {});
    let dbProjectId = project.id;

    const schedule_data: ScheduleSettings = {
        mode,
        dailyHours,
        selectedDays,
        startDate,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    if (user.id) {
      try {
        const res = await apiFetch('/api/role/start-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             userId: user.id, 
             project, 
             role, 
             curriculum,
             schedule_data,
             source_provenance: project.type === 'real_world' ? 'real_world' : 'ai_generated',
             template_version: '1.0'
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
           throw new Error(data.error || "Failed to start project");
        }
        if (data.success && data.projectId) {
           dbProjectId = data.projectId;
        }
      } catch (e) { 
        console.error('Failed to start project', e); 
        setError('Failed to start project. Please try again.');
        setLoading(false);
        return;
      }
    }
    
    navigate(`/project-workspace?projectId=${dbProjectId}`, {
      state: {
        project: { ...project, id: dbProjectId, projectId: dbProjectId },
        role,
        settings: { schedule: schedule_data, os },
        preLoadedCurriculum: curriculum
      },
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-6" style={{ background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)' }}>
      <div className="relative bg-white rounded-none sm:rounded-3xl shadow-2xl w-full max-w-4xl h-full sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">Set up your project</h2>
              <div className="flex gap-1.5 mt-1">
                {[1, 2, 3].map(s => (
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
          
          {/* STEP 1: Project Overview */}
          {step === 1 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto flex flex-col h-full justify-between">
              <div>
                  <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">{project?.title}</h1>
                    <p className="text-slate-500 text-[16px] leading-relaxed font-medium">{project.description}</p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4 mb-10">
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Layout className="w-4 h-4" /> The Challenge</h3>
                      <ul className="space-y-3">
                        {(project.whyRecommended || project.skillsToDevelop || []).slice(0, 3).map((r: string, i: number) => (
                          <li key={i} className="flex gap-2.5 text-sm text-slate-700 font-medium">
                            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                      <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Zap className="w-4 h-4" /> Skills Gained</h3>
                      <div className="flex flex-wrap gap-2">
                        {[...(project.languages || []), ...(project.tools || []), ...(project.tags || [])].slice(0, 8).map((s: string, i: number) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[12px] font-bold rounded-lg border border-slate-200">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
              </div>

              <button onClick={() => setStep(2)} className="w-full mt-auto py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl">
                Choose my schedule <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Schedule */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-xl mx-auto flex flex-col h-full justify-between">
              <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">How do you want to learn?</h2>
                  <p className="text-slate-500 mb-8">Set a schedule to stay accountable, or learn at your own pace.</p>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                      <button 
                         onClick={() => setMode('scheduled')}
                         className={`p-5 rounded-2xl border-2 text-left transition-all ${mode === 'scheduled' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${mode === 'scheduled' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                             <Calendar className="w-5 h-5" />
                         </div>
                         <h3 className={`font-bold mb-1 ${mode === 'scheduled' ? 'text-emerald-900' : 'text-slate-900'}`}>Follow a schedule</h3>
                         <p className="text-sm text-slate-500">We'll assign tasks to specific days to keep you on track.</p>
                      </button>
                      
                      <button 
                         onClick={() => setMode('self-paced')}
                         className={`p-5 rounded-2xl border-2 text-left transition-all ${mode === 'self-paced' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${mode === 'self-paced' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                             <Play className="w-5 h-5" />
                         </div>
                         <h3 className={`font-bold mb-1 ${mode === 'self-paced' ? 'text-emerald-900' : 'text-slate-900'}`}>Self-paced</h3>
                         <p className="text-sm text-slate-500">Complete tasks whenever you have free time. No deadlines.</p>
                      </button>
                  </div>

                  {mode === 'scheduled' && (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3">Which days are you available?</h4>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <button 
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${selectedDays.includes(day) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-sm font-bold text-slate-900 mb-3">Hours per session</h4>
                            <select 
                                value={dailyHours} 
                                onChange={e => setDailyHours(parseInt(e.target.value))}
                                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-emerald-500"
                            >
                                <option value={1}>1 hour</option>
                                <option value={2}>2 hours</option>
                                <option value={3}>3 hours</option>
                                <option value={4}>4 hours</option>
                            </select>
                        </div>
                    </div>
                  )}
              </div>

              <div className="mt-8 flex gap-3">
                 <button onClick={() => setStep(1)} className="px-6 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                   Back
                 </button>
                 <button 
                   onClick={handleGeneratePlan} 
                   disabled={mode === 'scheduled' && selectedDays.length === 0}
                   className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                   Prepare my plan <ChevronRight className="w-4 h-4" />
                 </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review and Start */}
          {step === 3 && (
            <div className="animate-in slide-in-from-right-4 duration-300 max-w-2xl mx-auto flex flex-col h-full justify-between">
              
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Generating your curriculum...</h3>
                    <p className="text-slate-500 mt-2 text-center max-w-sm">We are analyzing the tech stack and splitting the work into digestible modules.</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900">Failed to generate plan</h3>
                    <p className="text-slate-500 mt-2 mb-6 text-center">{error}</p>
                    <button 
                       onClick={handleGeneratePlan}
                       className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center gap-2"
                    >
                       <RefreshCw className="w-4 h-4" /> Retry Generation
                    </button>
                </div>
              ) : (
                  <div className="flex flex-col h-full">
                      <div className="mb-6">
                         <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Review your plan</h2>
                         <div className="flex gap-4 mt-4 p-4 bg-white border border-slate-200 rounded-xl">
                            <div className="flex-1">
                               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Time Estimate</p>
                               <p className="font-bold text-slate-900">{TOTAL_HOURS} hours total</p>
                            </div>
                            {mode === 'scheduled' && estimatedCompletionDate && (
                                <div className="flex-1 border-l border-slate-100 pl-4">
                                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Target Completion</p>
                                   <p className="font-bold text-emerald-600">{estimatedCompletionDate.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                            )}
                         </div>
                      </div>

                      <div className="space-y-4 mb-8 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                         {curriculum.map((module: any, idx: number) => (
                             <div key={module.id || idx} className="bg-white border border-slate-200 p-4 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-slate-900">{module.title}</h4>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{module.estimatedHours || 'N/A'}</span>
                                </div>
                                <div className="space-y-2 mt-3">
                                   {(module.tasks || []).map((task: any, tidx: number) => (
                                       <div key={task.id || tidx} className="flex gap-3 text-sm">
                                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0" />
                                          <div>
                                             <p className="font-medium text-slate-700">{task.title}</p>
                                             {task.duration && <p className="text-xs text-slate-400">{task.duration}</p>}
                                          </div>
                                       </div>
                                   ))}
                                </div>
                             </div>
                         ))}
                      </div>

                      <div className="flex gap-3 mt-auto shrink-0 pt-4 bg-slate-50/50">
                         <button onClick={() => setStep(2)} className="px-6 py-4 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                           Back
                         </button>
                         <button 
                           onClick={handleStartProject}
                           className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl"
                          >
                           Start Project <Play className="w-4 h-4 fill-current" />
                         </button>
                      </div>
                  </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}