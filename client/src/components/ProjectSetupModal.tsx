import { useState } from 'react';
import {
  X, Calendar, Bell, Mail, Check,
  ChevronRight, BarChart3, Clock
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
    { id: 1, title: 'Project setup and configuration', description: 'Initialize project with required dependencies', estimatedHours: '2 hours' },
    { id: 2, title: 'Database schema design', description: 'Design and implement database structure', estimatedHours: '4 hours' },
    { id: 3, title: 'Backend API development', description: 'Create RESTful API endpoints', estimatedHours: '8 hours' },
    { id: 4, title: 'Frontend components', description: 'Build React components and UI', estimatedHours: '10 hours' },
    { id: 5, title: 'State management setup', description: 'Implement Redux/Context for state management', estimatedHours: '4 hours' },
    { id: 6, title: 'Authentication system', description: 'Add user authentication and authorization', estimatedHours: '6 hours' },
    { id: 7, title: 'Testing and bug fixes', description: 'Write tests and fix issues', estimatedHours: '6 hours' },
    { id: 8, title: 'Deployment and documentation', description: 'Deploy app and write documentation', estimatedHours: '4 hours' },
  ];

  const handleContinue = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/role/project-details', {
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
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    let dbProjectId = project.id;

    if (user.id) {
      try {
        const res = await fetch('/api/role/start-project', {
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 w-full h-full">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between flex-shrink-0 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {step === 1 ? 'Schedule Your Free Time' : 'Project Timeline'}
            </h2>
            <p className="text-sm text-slate-500">{project?.title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">

          {/* ─────── STEP 1 ─────── */}
          {step === 1 && (
            <div className="space-y-8 animate-in slide-in-from-left-4 duration-300">
              {/* Hours slider */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-slate-900">How many hours can you dedicate per day?</label>
                  <span className="text-indigo-600 font-bold text-lg">{dailyHours} hrs</span>
                </div>
                <input
                  type="range" min="1" max="12" value={dailyHours}
                  onChange={e => setDailyHours(parseInt(e.target.value))}
                  className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>

              {/* Days selection */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-900">Which days are you available?</label>
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                  {DAYS.map(day => {
                    const sel = selectedDays.includes(day);
                    return (
                      <button
                        key={day} onClick={() => toggleDay(day)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          sel
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-500">Selected: {selectedDays.length} days per week</p>
              </div>

              {/* Start date */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-900">When do you want to start?</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date" value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-900">
                  Email for reminders (optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="email" placeholder="your.email@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                  />
                </div>
              </div>

              {/* Notification prefs */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-900">Reminder preferences</label>
                <div className="space-y-2">
                  {[
                    { key: 'browser' as const, label: 'Browser notifications', Icon: Bell },
                    { key: 'email'   as const, label: 'Email reminders',       Icon: Mail },
                  ].map(({ key, label, Icon }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                        notifications[key] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-300'
                      }`}>
                        {notifications[key] && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input type="checkbox" className="hidden" checked={notifications[key]}
                        onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
                      <Icon className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* OS selection */}
              <div className="space-y-3">
                <label className="font-semibold text-slate-900">Your Operating System</label>
                <div className="flex gap-3">
                  {['Windows', 'Mac', 'Linux'].map(sys => (
                    <button
                      key={sys} onClick={() => setOs(sys)}
                      className={`flex-1 py-2.5 rounded-xl border font-medium text-sm transition-all ${
                        os === sys
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {sys}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-400">We'll tailor terminal commands for your OS.</p>
              </div>

              {/* Quick summary */}
              <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2 md:mb-0 md:hidden">
                  <BarChart3 className="w-5 h-5" /> Quick Summary
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Weekly commitment</p>
                  <p className="text-xl font-bold text-indigo-600">{weeklyHours} hrs</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Estimated duration</p>
                  <p className="text-xl font-bold text-indigo-600">{estimatedWeeks} weeks</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-1">Target completion</p>
                  <p className="text-xl font-bold text-indigo-600">{formattedCompletion}</p>
                </div>
              </div>
            </div>
          )}

          {/* ─────── STEP 2 ─────── */}
          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              
              {/* Timeline Stats - Green Box matches design */}
              <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-[#0f172a] text-[17px] mb-4">
                  Your Project Timeline
                </h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#0f172a] font-medium mb-1.5 opacity-70">Total hours</p>
                    <p className="text-[20px] font-bold text-[#059669] leading-none">{TOTAL_HOURS} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0f172a] font-medium mb-1.5 opacity-70">Hours per week</p>
                    <p className="text-[20px] font-bold text-[#059669] leading-none">{weeklyHours} hrs</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0f172a] font-medium mb-1.5 opacity-70">Duration</p>
                    <p className="text-[20px] font-bold text-[#059669] leading-none">{estimatedWeeks} weeks</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#0f172a] font-medium mb-1.5 opacity-70">Completion date</p>
                    <p className="text-[20px] font-bold text-[#059669] leading-none">{startAndEndFormat}</p>
                  </div>
                </div>
              </div>

              {/* Project Breakdown */}
              <div className="mt-8">
                <h3 className="font-bold text-[#0f172a] mb-4 text-[17px]">
                  Project Breakdown ({curriculum.length} Subtasks)
                </h3>
                <div className="space-y-3">
                  {curriculum.map((item, index) => (
                    <div key={item.id || index} className="border border-slate-200 rounded-xl p-4 flex gap-4 bg-white shadow-sm">
                      <div className="w-[30px] h-[30px] rounded-full bg-[#eff6ff] text-[#3b82f6] flex items-center justify-center font-bold flex-shrink-0 text-sm mt-0.5">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#0f172a] text-[15px]">{item.title}</h4>
                        <p className="text-[#475569] text-[13px] mt-1 line-clamp-2">
                          {item.description || "Project task details pending..."}
                        </p>
                        <div className="flex items-center gap-1.5 text-[13px] text-[#64748b] mt-2.5">
                          <Clock className="w-[14px] h-[14px]" /> {item.estimatedHours || "4 hours"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reminders Info */}
              <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-xl p-5 flex gap-3 shadow-sm mt-6">
                <Bell className="w-[18px] h-[18px] text-[#3b82f6] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-[#1e3a8a] text-[15px] mb-2 leading-tight">Reminders configured</h4>
                  <ul className="space-y-1.5">
                    {notifications.browser && (
                      <li className="text-[13px] text-[#1d4ed8] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Daily browser notifications on your scheduled days
                      </li>
                    )}
                    <li className="text-[13px] text-[#1d4ed8] flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Pending tasks notification for tomorrow
                    </li>
                    {notifications.email && (
                      <li className="text-[13px] text-[#1d4ed8] flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Weekly progress summary
                      </li>
                    )}
                  </ul>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className={`p-4 md:px-6 md:py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0 bg-white z-10 ${step === 2 ? 'flex-row-reverse' : ''}`}>
          {step === 1 ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                disabled={loading || selectedDays.length === 0}
                className="flex-[2] py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md"
              >
                {loading
                  ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Fetching Plan...</>
                  : <>Continue to Timeline <ChevronRight className="w-4 h-4" /></>}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleStart}
                disabled={loading}
                className="flex-[3] py-3 rounded-xl font-bold text-[15px] text-white flex items-center justify-center gap-2 transition-all shadow-md bg-[#059669] hover:bg-[#047857]"
              >
                {loading ? 'Starting...' : <><Check className="w-4 h-4" /> Start This Project</>}
              </button>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-xl border border-[#e2e8f0] text-[#475569] font-medium text-sm hover:bg-[#f8fafc] transition-colors"
              >
                Back
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
