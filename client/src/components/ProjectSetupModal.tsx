import { useState } from 'react';
import { 
  X, 
  Clock, 
  Calendar,
  Bell,
  Mail,
  Check,
  BarChart
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
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form Inputs
  const [dailyHours, setDailyHours] = useState(2);
  const [selectedDays, setSelectedDays] = useState<string[]>(['Mon', 'Wed', 'Fri']);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState({
    browser: true,
    email: true
  });

  // Generated Data
  const [curriculum, setCurriculum] = useState<any[]>([]); // To store generated modules

  // Constants
  const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const TOTAL_PROJECT_HOURS = project?.metrics?.timeEstimate ? parseInt(project.metrics.timeEstimate) : 40;

  // Derived Metrics
  const weeklyHours = dailyHours * selectedDays.length;
  const estimatedWeeks = Math.ceil(TOTAL_PROJECT_HOURS / (weeklyHours || 1));
  
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + (estimatedWeeks * 7));
  const formattedCompletion = completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Handlers
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
        setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
        setSelectedDays([...selectedDays, day]);
    }
  };

  const handleContinue = async () => {
      setLoading(true);
      try {
          // Fetch/Generate the detailed plan based on these inputs
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
        
        if (data.success) {
            setCurriculum(data.data);
            setStep(2);
        } else {
            // Fallback if API fails (simulated data)
             setCurriculum([
                { id: 1, title: 'Architecture Planning', estimatedHours: '3 hours' },
                { id: 2, title: 'Development Environment Setup', estimatedHours: '4 hours' },
                { id: 3, title: 'Database Design', estimatedHours: '6 hours' },
                { id: 4, title: 'API Implementation', estimatedHours: '12 hours' }
            ]);
            setStep(2);
        }
      } catch (error) {
          console.error("Plan Generation Failed", error);
      } finally {
          setLoading(false);
      }
  };

  const handleStartProject = () => {
    navigate('/project-workspace', { 
        state: { 
            project, 
            role,
            settings: {
                timeCommitment: `${weeklyHours} hours/week`,
                schedule: { dailyHours, selectedDays, startDate }
            },
            preLoadedCurriculum: curriculum // Pass the generated plan to avoid re-fetching
        } 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
                <h2 className="text-xl font-bold text-gray-900">
                    {step === 1 ? 'Schedule Your Free Time' : 'Project Timeline'}
                </h2>
                <p className="text-sm text-gray-500">{project.title}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-200">

            {step === 1 && (
                <div className="space-y-8">
                    {/* Hours Slider */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="font-semibold text-gray-900">How many hours can you dedicate per day?</label>
                            <span className="text-indigo-600 font-bold text-lg">{dailyHours} hrs</span>
                        </div>
                        <input 
                            type="range" 
                            min="1" 
                            max="12" 
                            value={dailyHours} 
                            onChange={(e) => setDailyHours(parseInt(e.target.value))}
                            className="w-full h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>

                    {/* Days Selection */}
                    <div className="space-y-3">
                        <label className="font-semibold text-gray-900">Which days are you available?</label>
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                            {DAYS.map(day => {
                                const isSelected = selectedDays.includes(day);
                                return (
                                    <button
                                        key={day}
                                        onClick={() => toggleDay(day)}
                                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                            isSelected 
                                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                            : 'bg-gray-50 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                        }`}
                                    >
                                        {day}
                                    </button>
                                );
                            })}
                        </div>
                        <p className="text-xs text-gray-500">Selected: {selectedDays.length} days per week</p>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-3">
                         <label className="font-semibold text-gray-900">When do you want to start?</label>
                         <div className="relative">
                             <input 
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700"
                             />
                             <Calendar className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                         </div>
                    </div>

                    {/* Email (Optional) */}
                    <div className="space-y-3">
                         <label className="font-semibold text-gray-900">Email for reminders (optional)</label>
                         <div className="relative">
                             <input 
                                type="email"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 pl-10 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700"
                             />
                             <Mail className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                         </div>
                    </div>

                     {/* Notification Prefs */}
                     <div className="space-y-3">
                         <label className="font-semibold text-gray-900">Reminder preferences</label>
                         <div className="space-y-2">
                             <label className="flex items-center gap-3 cursor-pointer">
                                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifications.browser ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                     {notifications.browser && <Check className="w-3.5 h-3.5 text-white" />}
                                 </div>
                                 <input type="checkbox" className="hidden" checked={notifications.browser} onChange={() => setNotifications(prev => ({...prev, browser: !prev.browser}))} />
                                 <span className="text-sm text-gray-700">Browser notifications</span>
                             </label>
                             <label className="flex items-center gap-3 cursor-pointer">
                                 <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${notifications.email ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                     {notifications.email && <Check className="w-3.5 h-3.5 text-white" />}
                                 </div>
                                 <input type="checkbox" className="hidden" checked={notifications.email} onChange={() => setNotifications(prev => ({...prev, email: !prev.email}))} />
                                 <span className="text-sm text-gray-700">Email reminders</span>
                             </label>
                         </div>
                    </div>

                    {/* Quick Summary Box */}
                    <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col md:flex-row gap-6 md:items-center justify-between">
                         <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2 md:mb-0 md:hidden">
                             <BarChart className="w-5 h-5" /> Quick Summary
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Weekly Commitment</p>
                             <p className="text-xl font-bold text-indigo-600">{weeklyHours} hrs</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Estimated Duration</p>
                             <p className="text-xl font-bold text-indigo-600">{estimatedWeeks} weeks</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Target Completion</p>
                             <p className="text-xl font-bold text-indigo-600">{formattedCompletion}</p>
                         </div>
                    </div>

                </div>
            )}

            {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-8 duration-300">
                    
                    {/* Timeline Stats - Green Theme */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6 flex flex-wrap gap-8 justify-between items-center">
                        <div>
                            <p className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">Total Hours</p>
                            <p className="text-2xl font-bold text-emerald-600">{TOTAL_PROJECT_HOURS} hrs</p>
                        </div>
                         <div>
                            <p className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">Hours Per Week</p>
                            <p className="text-2xl font-bold text-emerald-600">{weeklyHours} hrs</p>
                        </div>
                         <div>
                            <p className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">Duration</p>
                            <p className="text-2xl font-bold text-emerald-600">{estimatedWeeks} weeks</p>
                        </div>
                         <div>
                            <p className="text-xs text-emerald-800 uppercase tracking-wide font-medium mb-1">Completion Date</p>
                            <p className="text-lg font-bold text-emerald-600">{formattedCompletion}</p>
                        </div>
                    </div>

                    {/* Project Breakdown List */}
                    <div>
                        <h3 className="font-bold text-gray-900 mb-4 text-lg">Project Breakdown ({curriculum.reduce((acc: number, mod: any) => acc + (mod.tasks?.length || 0), 0)} Subtasks)</h3>
                        <div className="space-y-4">
                            {curriculum.map((module, index) => (
                                <div key={module.id || index} className="border border-gray-100 rounded-xl p-4 flex gap-4 hover:border-indigo-100 hover:shadow-sm transition-all bg-white">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0 text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm md:text-base">{module.title}</h4>
                                        <p className="text-gray-500 text-xs mt-1 mb-2 line-clamp-1">{module.tasks ? module.tasks.length + ' tasks' : 'Pending breakdown'}</p>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
                                            <Clock className="w-3.5 h-3.5" /> {module.estimatedHours || "2h"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reminders Info Section */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                            <Bell className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <h4 className="font-bold text-blue-900 text-sm mb-1">Reminders configured</h4>
                            <ul className="space-y-1">
                                {notifications.browser && (
                                    <li className="text-xs text-blue-700 flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-blue-600" /> Daily browser notifications on your scheduled days
                                    </li>
                                )}
                                {notifications.email && (
                                    <li className="text-xs text-blue-700 flex items-center gap-1.5">
                                        <Check className="w-3 h-3 text-blue-600" /> Weekly progress summary to {email || 'your email'}
                                    </li>
                                )}
                                <li className="text-xs text-blue-700 flex items-center gap-1.5">
                                    <Check className="w-3 h-3 text-blue-600" /> Pending tasks notification for tomorrow
                                </li>
                            </ul>
                        </div>
                    </div>

                </div>
            )}

        </div>

        {/* Sticky Footer */}
        <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center z-10 space-x-4">
            <button 
                onClick={step === 1 ? onClose : () => setStep(1)} 
                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
                {step === 1 ? 'Cancel' : 'Back'}
            </button>
            
            <button 
                onClick={step === 1 ? handleContinue : handleStartProject}
                disabled={loading}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200 ${
                    loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
            >
                {loading ? (
                    'Generating Plan...'
                ) : step === 1 ? (
                    'Continue to Timeline'
                ) : (
                    'Start This Project'
                )}
            </button>
        </div>

      </div>
    </div>
  );
}
