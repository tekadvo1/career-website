import { apiFetch } from '../utils/apiFetch';
import { useState } from 'react';
import { getUser } from '../utils/auth';
import {
  X, Calendar, Bell, Mail, Check,
  ChevronRight, BarChart3, Clock,
  Monitor, Play, CalendarDays, Key
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProjectSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  role: string;
}

export default function ProjectSetupModal({ isOpen, onClose, project, role }: ProjectSetupModalProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [curriculum, setCurriculum] = useState<any[]>([]);

  // Form state
  const [dailyHours,    setDailyHours]    = useState(2);
  const [selectedDays,  setSelectedDays]  = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate,     setStartDate]     = useState(new Date().toISOString().split('T')[0]);
  const [email,         setEmail]         = useState('');
  const [notifications, setNotifications] = useState({ browser: true, email: true });
  const [os,            setOs]            = useState('Windows');

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Try to use estimated hours if present, else default
  const TOTAL_HOURS    = project?.metrics?.timeEstimate 
    ? parseInt(project.metrics.timeEstimate) 
    : 40;
    
  const weeklyHours    = dailyHours * selectedDays.length;
  const estimatedWeeks = Math.ceil(TOTAL_HOURS / (weeklyHours || 1));
  
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + estimatedWeeks * 7);
  
  const startAndEndFormat = `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} - ${completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}`;
  
  const formattedCompletion = completionDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const toggleDay = (day: string) =>
    setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const fallbackCurriculum = [
    { id: 1, title: 'Project Initialization', description: 'Configure repository and environment variables', estimatedHours: '2 hrs' },
    { id: 2, title: 'Database Schema & Auth', description: 'Implement database models and authentication flow', estimatedHours: '6 hrs' },
    { id: 3, title: 'Core API Services', description: 'Build and expose robust REST/GraphQL endpoints', estimatedHours: '8 hrs' },
    { id: 4, title: 'Frontend Architecture', description: 'Scaffold React components and routing', estimatedHours: '10 hrs' },
    { id: 5, title: 'State & Integration', description: 'Connect frontend to backend APIs', estimatedHours: '6 hrs' },
    { id: 6, title: 'Testing Quality Assurance', description: 'Write unit tests and resolve major edge cases', estimatedHours: '5 hrs' },
    { id: 7, title: 'Production Deployment', description: 'Deploy application to cloud infrastructure', estimatedHours: '3 hrs' },
  ];

  const handleContinue = async () => {
    setLoading(true);
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
      
      if (data.success && data.data) {
        setCurriculum(data.data);
      } else {
        setCurriculum(fallbackCurriculum);
      }
    } catch (e) {
      setCurriculum(fallbackCurriculum);
    } finally {
      setLoading(false);
      setStep(2);
    }
  };

  const handleStart = async () => {
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
        if (data.success && data.projectId) {
            dbProjectId = data.projectId;
        }
      } catch (e) {
        console.error('Failed to save project', e);
      }
    }
    
    navigate('/project-workspace', {
      state: {
        project: { ...project, id: dbProjectId, projectId: dbProjectId },
        role,
        settings: {
          timeCommitment: `${weeklyHours} hours/week`,
          schedule: { dailyHours, selectedDays, startDate },
          os,
        },
        preLoadedCurriculum: curriculum
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:p-6" style={{ background: 'rgba(15, 23, 42, 0.70)', backdropFilter: 'blur(8px)' }}>
      <div className="bg-white rounded-none sm:rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] w-full max-w-4xl overflow-hidden flex flex-col h-[100dvh] sm:h-auto max-h-[100dvh] sm:max-h-[92vh] animate-in zoom-in-95 duration-200 border-0 sm:border border-slate-200/50">

        {/* Header */}
        <div className="px-5 sm:px-8 py-5 sm:py-6 flex items-start justify-between flex-shrink-0 bg-white border-b border-slate-100 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white pointer-events-none" />
          <div className="relative z-10 w-full pr-4">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none mb-2">
              {step === 1 ? 'Configure Execution Plan' : 'Engineering Timeline'}
            </h2>
            <p className="text-[14.5px] text-slate-500 font-medium">{project?.title}</p>
          </div>
          <button onClick={onClose} className="relative z-10 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/30">
          <div className="p-5 sm:p-8">

            {/* ─────── STEP 1 ─────── */}
            {step === 1 && (
              <div className="animate-in slide-in-from-left-4 duration-300">
                
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-x-8 xl:gap-x-12 gap-y-10">
                  {/* Left Column - Form */}
                  <div className="space-y-10">
                    
                    {/* Hours slider */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">Daily Commitment</label>
                        <span className="text-emerald-600 font-extrabold text-[15px]">{dailyHours} hours</span>
                      </div>
                      <input
                        type="range" min="1" max="12" value={dailyHours}
                        onChange={e => setDailyHours(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-600 transition-all"
                      />
                    </div>

                    {/* Days selection */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[13px] font-bold text-slate-800 uppercase tracking-widest">Availability</label>
                        <span className="text-[12px] font-bold text-slate-400">{selectedDays.length} days / week</span>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                        {DAYS.map(day => {
                          const sel = selectedDays.includes(day);
                          return (
                            <button
                              key={day} onClick={() => toggleDay(day)}
                              className={`py-2 rounded-lg text-[13px] font-bold transition-all border ${
                                sel
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-500 hover:border-slate-400 hover:text-slate-800'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dates & Environment Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Start Date</label>
                        <div className="relative">
                          <CalendarDays className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="date" value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="w-full p-3 pl-11 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Target OS</label>
                        <div className="relative">
                          <Monitor className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          <select
                            value={os} onChange={(e) => setOs(e.target.value)}
                            className="w-full p-3 pl-11 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm appearance-none bg-white"
                          >
                            <option value="Windows">Windows</option>
                            <option value="Mac">macOS</option>
                            <option value="Linux">Linux</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notifications */}
                    <div className="pt-4 border-t border-slate-100">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">Telemetry & Alerts</label>
                      <div className="space-y-3">
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                          <input
                            type="email" placeholder="Ping email (optional)"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full p-3 pl-11 border border-slate-200 rounded-xl text-[14px] font-medium text-slate-700 focus:ring-2 focus:ring-slate-900 outline-none transition-all shadow-sm mb-4"
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          {[
                            { key: 'browser' as const, label: 'Enable System Notifications', Icon: Bell },
                            { key: 'email'   as const, label: 'Enable Email Digest',       Icon: Mail },
                          ].map(({ key, label, Icon }) => (
                            <label key={key} className="flex items-center gap-3.5 cursor-pointer group w-max">
                              <div className={`w-5 h-5 rounded-[6px] border flex items-center justify-center transition-colors flex-shrink-0 ${
                                notifications[key] ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-50 border-slate-300 group-hover:border-slate-400'
                              }`}>
                                {notifications[key] && <Check className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <input type="checkbox" className="hidden" checked={notifications[key]}
                                onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
                              <div className="flex items-center gap-2">
                                <Icon className="w-3.5 h-3.5 text-slate-400" />
                                <span className="text-[13px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Summary Panel */}
                  <div>
                    <div className="sticky top-0 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                      <h4 className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                        <BarChart3 className="w-4 h-4 text-emerald-500" /> Projected Scope
                      </h4>
                      <div className="space-y-6 text-slate-800">
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Weekly Bandwidth</p>
                          <p className="text-2xl font-extrabold tracking-tight">{weeklyHours} <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">HRS</span></p>
                        </div>
                        <div className="h-px w-full bg-slate-100" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Sprint Duration</p>
                          <p className="text-2xl font-extrabold tracking-tight">{estimatedWeeks} <span className="text-sm font-bold text-slate-500 uppercase tracking-wide">WKS</span></p>
                        </div>
                        <div className="h-px w-full bg-slate-100" />
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Delivery</p>
                          <p className="text-[16px] font-bold tracking-tight text-emerald-600">{formattedCompletion}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* ─────── STEP 2 ─────── */}
            {step === 2 && (
              <div className="animate-in slide-in-from-right-8 duration-300">
                
                {/* Timeline Stats - Enterprise Design */}
                <div className="bg-slate-900 rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(15,23,42,0.2)] mb-10 overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  
                  <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 relative z-10">
                    <Calendar className="w-4 h-4 text-emerald-400" /> Approved Timeline
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 relative z-10">
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Scope Size</p>
                      <p className="text-[22px] font-extrabold text-white leading-none tracking-tight">{TOTAL_HOURS} <span className="text-[13px] text-slate-400 ml-0.5">HRS</span></p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Velocity</p>
                      <p className="text-[22px] font-extrabold text-white leading-none tracking-tight">{weeklyHours} <span className="text-[13px] text-slate-400 ml-0.5">HRS / WK</span></p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Duration</p>
                      <p className="text-[22px] font-extrabold text-white leading-none tracking-tight">{estimatedWeeks} <span className="text-[13px] text-slate-400 ml-0.5">WEEKS</span></p>
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-2">Target Date</p>
                      <p className="text-[18px] font-bold text-emerald-400 leading-tight">{startAndEndFormat}</p>
                    </div>
                  </div>
                </div>

                {/* Project Breakdown */}
                <div className="mb-10">
                  <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">
                    <BarChart3 className="w-4 h-4 text-blue-500" /> Component Backlog ({curriculum.length})
                  </h3>
                  <div className="space-y-4">
                    {curriculum.map((item, index) => (
                      <div key={item.id || index} className="border border-slate-200 rounded-xl p-5 flex gap-5 bg-white hover:border-slate-300 transition-colors shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold flex-shrink-0 text-[13px] shadow-[inset_0_1px_3px_rgba(0,0,0,0.05)]">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-extrabold text-slate-900 text-[15px] tracking-tight">{item.title}</h4>
                          <p className="text-slate-500 text-[14px] mt-1.5 leading-relaxed font-medium">
                            {item.description || "Subtask details pending initialization..."}
                          </p>
                        </div>
                        <div className="flex items-start justify-end flex-shrink-0">
                          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-[12px] font-bold">
                            <Clock className="w-3.5 h-3.5 opacity-70" /> {item.estimatedHours || "4 hrs"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alert Regimen */}
                <div className="border border-slate-200 bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                    <Key className="w-4 h-4 text-purple-500" /> Active Alert Regimen
                  </h3>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
                    {notifications.browser && (
                      <li className="text-[13.5px] font-medium text-slate-700 flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Daily browser notifications
                      </li>
                    )}
                    <li className="text-[13.5px] font-medium text-slate-700 flex items-center gap-2.5">
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Real-time pending task pings
                    </li>
                    {notifications.email && (
                      <li className="text-[13.5px] font-medium text-slate-700 flex items-center gap-2.5">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" /> Weekly metric summaries
                      </li>
                    )}
                  </ul>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className={`px-5 sm:px-8 py-5 border-t border-slate-200 bg-white relative z-10 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-shrink-0 ${step === 2 ? 'sm:flex-row-reverse' : ''}`}>
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-500 font-bold text-[14px] hover:bg-slate-100 hover:text-slate-800 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                Abort
              </button>
              <button
                onClick={handleContinue}
                disabled={loading || selectedDays.length === 0}
                className="w-full sm:flex-1 py-3.5 rounded-xl font-bold text-[14px] text-white flex items-center justify-center gap-2 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.1)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)] bg-slate-900 hover:bg-black disabled:opacity-50 disabled:hover:shadow-none"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Compiling Plan...</>
                  : <>Generate Architecture <ChevronRight className="w-4 h-4" /></>}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStart}
                disabled={loading}
                className="w-full sm:flex-[2] py-4 rounded-xl font-bold text-[15px] text-white flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_14px_0_rgba(16,185,129,0.3)] bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_6px_20px_rgba(16,185,129,0.4)] disabled:opacity-50 tracking-wide"
              >
                {loading ? 'Booting Workspace...' : <><Play className="w-4 h-4 fill-current" /> Initialize Final Pipeline</>}
              </button>
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold text-[14px] hover:bg-slate-50 hover:border-slate-300 transition-colors disabled:opacity-50"
              >
                Reconfigure
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
