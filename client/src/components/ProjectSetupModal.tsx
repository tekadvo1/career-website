import { useState } from 'react';
import {
  X, Calendar, Bell, Mail, Check,
  ChevronRight, BarChart3,
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
  const [loading, setLoading] = useState(false);

  // Form state
  const [dailyHours,    setDailyHours]    = useState(2);
  const [selectedDays,  setSelectedDays]  = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate,     setStartDate]     = useState(new Date().toISOString().split('T')[0]);
  const [email,         setEmail]         = useState('');
  const [notifications, setNotifications] = useState({ browser: true, email: true });
  const [os,            setOs]            = useState('Windows');

  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TOTAL_HOURS    = project?.metrics?.timeEstimate ? parseInt(project.metrics.timeEstimate) : 40;
  const weeklyHours    = dailyHours * selectedDays.length;
  const estimatedWeeks = Math.ceil(TOTAL_HOURS / (weeklyHours || 1));
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + estimatedWeeks * 7);
  const formattedCompletion = completionDate.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  const toggleDay = (day: string) =>
    setSelectedDays(p => p.includes(day) ? p.filter(d => d !== day) : [...p, day]);

  const handleStart = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      try {
        await fetch('/api/role/start-project', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, project, role }),
        });
      } catch { /* navigate anyway */ }
    }
    navigate('/project-workspace', {
      state: {
        project,
        role,
        settings: {
          timeCommitment: `${weeklyHours} hours/week`,
          schedule: { dailyHours, selectedDays, startDate },
          os,
        },
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Schedule Your Free Time</h2>
            <p className="text-sm text-slate-500 mt-0.5 truncate max-w-xs">{project?.title}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Hours slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-slate-900 text-sm">How many hours can you dedicate per day?</label>
              <span className="text-indigo-600 font-bold text-xl">{dailyHours} <span className="text-sm font-medium text-slate-400">hrs</span></span>
            </div>
            <input
              type="range" min="1" max="12" value={dailyHours}
              onChange={e => setDailyHours(parseInt(e.target.value))}
              className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
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
                  <button
                    key={day} onClick={() => toggleDay(day)}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all ${
                      sel
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
                        : 'bg-slate-50 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-slate-400">
              Selected: <span className="font-semibold text-indigo-600">{selectedDays.length}</span> days/week
              · <span className="font-semibold text-indigo-600">{weeklyHours} hrs</span>/week
            </p>
          </div>

          {/* Start date */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-900 text-sm">When do you want to start?</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date" value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-900 text-sm">
              Email for reminders <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email" placeholder="your.email@example.com"
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full p-3 pl-10 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 text-sm"
              />
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
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors flex-shrink-0 ${
                  notifications[key] ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white group-hover:border-indigo-300'
                }`}>
                  {notifications[key] && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={notifications[key]}
                  onChange={() => setNotifications(p => ({ ...p, [key]: !p[key] }))} />
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
                <button
                  key={sys} onClick={() => setOs(sys)}
                  className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    os === sys
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {sys}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400">We'll tailor terminal commands for your OS.</p>
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
                  <p className="text-base font-bold text-indigo-600">{s.val}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center gap-3 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleStart}
            disabled={loading || selectedDays.length === 0}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all disabled:opacity-60 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Starting…</>
              : <>Continue to Timeline <ChevronRight className="w-4 h-4" /></>}
          </button>
        </div>

      </div>
    </div>
  );
}
