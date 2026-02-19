import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  CheckCircle, 
  Circle, 
  Terminal, 
  MessageSquare,
  RotateCcw,
  Menu,
  X,
  ChevronRight,
  Clock,
  Calendar,
  Zap,
  Target,
  Play,
  FileText,
  Bell
} from 'lucide-react';
import ChatAssistant from './roadmap/AIChatAssistant';
import WeeklyReviewModal from './WeeklyReviewModal';

interface Task {
  id: string;
  title: string;
  description: string;
  why: string;
  codeSnippet: string;
  verification: string;
  duration?: string;
  xp?: number;
}

interface Module {
  id: string;
  title: string;
  estimatedHours?: string;
  tasks: Task[];
}

export default function ProjectWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { project, role, settings, preLoadedCurriculum } = location.state || {}; // Expecting project object and role
  const [timeCommitment] = useState(settings?.timeCommitment || '5');
  
  // Calculate Timeline Stats
  const weeklyHours = parseInt(timeCommitment.replace(/[^0-9]/g, '')) || 5; 
  const totalProjectHours = project?.metrics?.timeEstimate ? parseInt(project.metrics.timeEstimate) : 40; 
  const estimatedWeeks = Math.ceil(totalProjectHours / weeklyHours);
  
  // Use user's start date if available, otherwise today
  const startDate = settings?.schedule?.startDate ? new Date(settings.schedule.startDate) : new Date();
  const completionDate = new Date(startDate);
  completionDate.setDate(completionDate.getDate() + (estimatedWeeks * 7));
  const formattedCompletionDate = completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Initialize curriculum from pre-loaded data if available
  const [curriculum, setCurriculum] = useState<Module[]>(preLoadedCurriculum || []);
  const [isLoading, setIsLoading] = useState(!preLoadedCurriculum);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [viewMode, setViewMode] = useState<'dashboard' | 'execution'>('dashboard');
  const [initialAiQuery, setInitialAiQuery] = useState('');
  
  // Adaptive State
  const [adaptiveMessage, setAdaptiveMessage] = useState<string | null>(null);
  const [showWeeklyReview, setShowWeeklyReview] = useState(false);

  useEffect(() => {
    if (!project) {
        navigate('/dashboard');
        return;
    }

    if (preLoadedCurriculum) {
        setIsLoading(false);
        return;
    }

    const fetchCurriculum = async () => {
        try {
            const response = await fetch('/api/role/project-details', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectTitle: project.title,
                    role: role,
                    difficultly: project.difficulty,
                    techStack: project.tools,
                    timeCommitment: timeCommitment
                })
            });
            const data = await response.json();
            if (data.success) {
                setCurriculum(data.data);
            }
        } catch (error) {
            console.error("Failed to load curriculum", error);
        } finally {
            setIsLoading(false);
        }
    };

    fetchCurriculum();
  }, [project, role, navigate, preLoadedCurriculum]);

  // Check for Adaptive Schedule Updates
  /* 
  // User requested removal of this notification simulation as it was intrusive.
  useEffect(() => {
    const checkSchedule = async () => {
         // Simulate "Last Active" date (e.g. 3 days ago for testing)
        // In real app, this comes from user profile/activity log
        const lastActive = new Date();
        lastActive.setDate(lastActive.getDate() - 3); 

        try {
            const response = await fetch('/api/role/adaptive-schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                     currentCompletionDate: completionDate.toISOString(),
                     lastActiveDate: lastActive.toISOString(),
                     weeklyHours,
                     tasksRemaining: 10 // Placeholder
                })
            });
            const data = await response.json();
            
            if (data.success && data.adjustmentNeeded) {
                setAdaptiveMessage(data.adjustmentMessage);
                setAdjustedCompletionDate(data.newCompletionDate);
                setDaysDelayed(data.daysDelayed);
                
                // Auto-dismiss toast after 8 seconds
                setTimeout(() => setAdaptiveMessage(null), 8000);
            }
        } catch (error) {
            console.error("Adaptive Check Failed", error);
        }
    };
    
    // Slight delay to simulate system "thinking" on load
    const timer = setTimeout(checkSchedule, 1500);
    return () => clearTimeout(timer);
  }, [completionDate, weeklyHours]); 
  */

  const toggleTaskCompletion = (taskId: string) => {
      const newCompleted = new Set(completedTasks);
      if (newCompleted.has(taskId)) {
          newCompleted.delete(taskId);
      } else {
          newCompleted.add(taskId);
      }
      setCompletedTasks(newCompleted);
  };

  const handleNextTask = () => {
      if (!curriculum.length) return;
      const currentModule = curriculum[currentModuleIndex];
      if (currentTaskIndex < currentModule.tasks.length - 1) {
          setCurrentTaskIndex(prev => prev + 1);
      } else if (currentModuleIndex < curriculum.length - 1) {
          setCurrentModuleIndex(prev => prev + 1);
          setCurrentTaskIndex(0);
      }
  };
  
  const handlePrevTask = () => {
      if (currentTaskIndex > 0) {
          setCurrentTaskIndex(prev => prev - 1);
      } else if (currentModuleIndex > 0) {
          setCurrentModuleIndex(prev => prev - 1);
          setCurrentTaskIndex(curriculum[currentModuleIndex - 1].tasks.length - 1);
      }
  };

  const handleExplainTask = () => {
      setInitialAiQuery(`Explain the task "${currentTask?.title}" and why it's important.`);
      setShowAssistant(true);
      setViewMode('execution');
  };

  const handleGenerateCode = () => {
      setInitialAiQuery(`Generate starter code for the task: "${currentTask?.title}" using ${project?.tools?.join(', ') || 'standard tools'}. My OS is ${settings?.os || 'Windows'}.`);
      setShowAssistant(true);
      setViewMode('execution');
  };

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-950 text-white">
              <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="text-gray-400">Initializing Mission Control...</p>
              </div>
          </div>
      );
  }

  const currentModule = curriculum[currentModuleIndex];
  const currentTask = currentModule?.tasks[currentTaskIndex];
  const totalTasks = curriculum.reduce((acc, mod) => acc + mod.tasks.length, 0);
  const progressPercentage = Math.round((completedTasks.size / totalTasks) * 100);
  
  // Dashboard Logic


  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
        
        {/* VIEW MODE: EXECUTION (Original Workspace) */}
        {viewMode === 'execution' && (
            <>
                 {/* MOBILE OVERLAY */}
                {showSidebar && (
                    <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setShowSidebar(false)} />
                )}

                {/* SIDEBAR - CURRICULUM */}
                <aside className={`fixed md:relative z-30 w-72 h-full bg-gray-900 border-r border-gray-800 flex flex-col transition-transform duration-300 ${
                    showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:opacity-0 md:overflow-hidden'
                }`}>
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <div>
                        <h2 className="font-bold text-white text-sm tracking-wide uppercase">Curriculum</h2>
                        <p className="text-xs text-gray-500 mt-1">{completedTasks.size} / {totalTasks} Tasks Completed</p>
                        </div>
                        <button onClick={() => setShowSidebar(false)} className="md:hidden p-1 hover:bg-gray-800 rounded">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-6">
                        {curriculum.map((module, mIndex) => (
                            <div key={module.id}>
                                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                                {module.title}
                                {module.estimatedHours && <span className="ml-2 text-[10px] bg-gray-800 text-gray-500 py-0.5 px-1.5 rounded">{module.estimatedHours}</span>}
                                </h3>
                                <div className="space-y-1">
                                    {module.tasks.map((task, tIndex) => {
                                        const isActive = mIndex === currentModuleIndex && tIndex === currentTaskIndex;
                                        const isCompleted = completedTasks.has(task.id);
                                        
                                        return (
                                            <button
                                                key={task.id}
                                                onClick={() => {
                                                    setCurrentModuleIndex(mIndex);
                                                    setCurrentTaskIndex(tIndex);
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm flex items-start gap-3 transition-colors ${
                                                    isActive 
                                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30' 
                                                    : 'hover:bg-gray-800 text-gray-400'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <Circle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isActive ? 'text-indigo-500' : 'text-gray-600'}`} />
                                                )}
                                                <span className={isCompleted ? 'line-through opacity-50' : ''}>
                                                    {task.title}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* MAIN CONTENT Area - SPLIT SCREEN */}
                <main className="flex-1 flex flex-col min-w-0">
                    {/* HEADER */}
                    <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 md:hidden"
                            >
                                <Menu className="w-5 h-5" />
                            </button>
                            <button 
                                onClick={() => setViewMode('dashboard')}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Mission Control
                            </button>
                            <div className="h-6 w-px bg-gray-800 mx-1"></div>
                            <h1 className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-md">
                                {project?.title} - Execution Mode
                            </h1>
                        </div>
                    </header>

                    {/* SPLIT VIEW CONTAINER */}
                    <div className="flex-1 flex overflow-hidden">
                        
                        {/* LEFT: Task Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                            <div className="max-w-4xl mx-auto">
                                {currentTask ? (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {/* Task Execution UI (Same as before) */}
                                        <div>
                                            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                                                <span className="px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                                                    {currentModule?.title}
                                                </span>
                                                <span>Task {currentTaskIndex + 1} of {currentModule?.tasks.length}</span>
                                                {currentTask.duration && <span className="text-gray-500">• {currentTask.duration}</span>}
                                            </div>
                                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                                {currentTask.title}
                                            </h1>
                                            <p className="text-lg text-gray-400 leading-relaxed">
                                                {currentTask.description}
                                            </p>
                                        </div>
                                        <div className="bg-blue-900/10 border-l-4 border-blue-500 p-6 rounded-r-lg">
                                            <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                                                <RotateCcw className="w-4 h-4" /> Context & Rationale
                                            </h3>
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {currentTask.why}
                                            </p>
                                        </div>
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Terminal className="w-5 h-5 text-indigo-400" /> 
                                                Implementation Guide
                                            </h3>
                                            <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
                                                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-800 flex items-center justify-between">
                                                    <div className="flex gap-1.5">
                                                        <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                                                        <div className="w-3 h-3 rounded-full bg-amber-500/20"></div>
                                                        <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-mono">terminal / editor</span>
                                                </div>
                                                <div className="p-6 overflow-x-auto">
                                                    <pre className="font-mono text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">
                                                        {currentTask.codeSnippet}
                                                    </pre>
                                                </div>
                                            </div>
                                            <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-6">
                                                <h4 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4" /> Verify Your Work
                                                </h4>
                                                <p className="text-gray-300 text-sm">{currentTask.verification}</p>
                                            </div>
                                        </div>
                                        <div className="pt-10 border-t border-gray-800 flex items-center justify-between">
                                            <button 
                                                onClick={handlePrevTask}
                                                disabled={currentModuleIndex === 0 && currentTaskIndex === 0}
                                                className="px-6 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                            >
                                                Previous Step
                                            </button>
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    onClick={() => toggleTaskCompletion(currentTask.id)}
                                                    className={`px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                                                        completedTasks.has(currentTask.id)
                                                        ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20'
                                                        : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                                                    }`}
                                                >
                                                    {completedTasks.has(currentTask.id) ? (
                                                        <>
                                                        <CheckCircle className="w-4 h-4" /> Completed
                                                        </>
                                                    ) : (
                                                        <>
                                                        <Circle className="w-4 h-4" /> Mark as Complete
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={handleNextTask}
                                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-900/20 transition-all"
                                                >
                                                    Next Step <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>

                        {/* RIGHT: AI Assistant (Embedded) */}
                        <div className="w-96 hidden lg:block h-full border-l border-gray-800 bg-gray-900">
                             <ChatAssistant 
                                isOpen={true}
                                onClose={() => {}} 
                                isEmbedded={true}
                                role={role}
                                initialQuery={initialAiQuery} // Pass initial query here
                                context={{
                                    type: 'project',
                                    projectTitle: project?.title,
                                    currentTask: currentTask?.title,
                                    taskDescription: currentTask?.description,
                                    userOS: settings?.os || 'Windows'
                                } as any}
                            />
                        </div>

                    </div>
                </main>
            </>
        )}

        {/* VIEW MODE: MISSION CONTROL DASHBOARD */}
        {viewMode === 'dashboard' && (
             <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-950">
                 {/* Mission Header */}
                 <header className="px-6 py-6 md:px-12 md:py-8 border-b border-gray-900 bg-gray-950/50 backdrop-blur-sm sticky top-0 z-10 flex items-center justify-between">
                     <div>
                         <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-white mb-2 transition-colors">
                             <ChevronLeft className="w-3 h-3" /> Back to Projects
                         </button>
                         <h1 className="text-2xl font-bold text-white tracking-tight">{project?.title}</h1>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> {weeklyHours}h / week</span>
                              <span className="flex items-center gap-1.5 transition-colors">
                                  <Calendar className="w-4 h-4 text-indigo-500" /> 
                                  Target: {formattedCompletionDate}
                              </span>
                          </div>
                      </div>
                      <div className="hidden md:flex flex-col items-end gap-2">
                          <button 
                              onClick={() => setShowWeeklyReview(true)}
                              className="text-xs font-medium text-indigo-400 hover:text-white flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg border border-indigo-500/30 hover:bg-indigo-500/20"
                          >
                              <FileText className="w-3.5 h-3.5" /> Weekly Review
                          </button>
                         <div className="text-right">
                             <div className="text-xs text-gray-500 mb-0.5 font-mono uppercase tracking-widest">Project Progress</div>
                             <div className="text-3xl font-bold text-white leading-none">{progressPercentage}%</div>
                         </div>
                      </div>
                 </header>

                 <div className="p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8">
                     
                     {/* TODAY'S MISSION CARD */}
                     <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden group">
                         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                         
                         <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                             <div>
                                 <div className="flex items-center gap-2 mb-3">
                                     <span className="px-2.5 py-0.5 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20 animate-pulse">
                                         Today's Mission
                                     </span>
                                     <span className="text-gray-400 text-xs font-mono">Phase 3: Core Architecture</span>
                                 </div>
                                 <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                     {currentTask?.title || "Initialize Project Structure"}
                                 </h2>
                                 <p className="text-indigo-200/80 max-w-xl text-sm leading-relaxed mb-6">
                                     {currentTask?.description || "Let's get the foundation right. Setup the repository and basic folder structure."}
                                 </p>
                                 <div className="flex gap-4">
                                     <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                         <Zap className="w-4 h-4 text-amber-400" />
                                         <span className="text-xs font-bold text-gray-300">40 XP</span>
                                     </div>
                                     <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                         <Target className="w-4 h-4 text-emerald-400" />
                                         <span className="text-xs font-bold text-gray-300">+0.8% Match Score</span>
                                     </div>
                                 </div>
                             </div>

                             <div className="w-full md:w-auto">
                                 <button 
                                     onClick={() => setViewMode('execution')}
                                     className="w-full md:w-auto px-8 py-4 bg-white text-indigo-950 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-900/20 group-hover:scale-105 duration-300"
                                 >
                                     <Play className="w-5 h-5 fill-indigo-900" /> Start Mission
                                 </button>
                                 <p className="text-center text-[10px] text-indigo-300 mt-2">Est. Time: {currentTask?.duration || "45m"}</p>
                             </div>
                         </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                         {/* YOUR SCHEDULE CARD (Replaces Weekly Velocity) */}
                         <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                 <Calendar className="w-4 h-4" /> Your Schedule
                             </h3>
                             <div className="space-y-6">
                                 <div>
                                     <div className="text-xs text-gray-500 mb-1">Hours per day</div>
                                     <div className="text-2xl font-bold text-white flex items-end gap-1">
                                         {settings?.schedule?.dailyHours || 2}h
                                         <span className="text-sm text-gray-500 font-normal mb-1">/ session</span>
                                     </div>
                                 </div>
                                 
                                 <div>
                                     <div className="text-xs text-gray-500 mb-2">Working Days</div>
                                     <div className="flex flex-wrap gap-1.5">
                                         {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                                             const isActive = settings?.schedule?.selectedDays?.includes(day);
                                             return (
                                                 <span 
                                                     key={day}
                                                     className={`text-[10px] font-bold px-2 py-1 rounded-md border ${
                                                         isActive 
                                                         ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
                                                         : 'bg-gray-800 text-gray-600 border-gray-800'
                                                     }`}
                                                 >
                                                     {day}
                                                 </span>
                                             );
                                         })}
                                     </div>
                                 </div>

                                 <div className="pt-4 border-t border-gray-800">
                                     <div className="flex items-center gap-2 text-xs text-gray-400">
                                         <Bell className="w-3.5 h-3.5 text-indigo-500" />
                                         Browser notifications on
                                     </div>
                                 </div>
                             </div>
                         </div>

                         {/* AI COACH CARD */}
                         <div className="md:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
                             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl"></div>
                             
                             <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                 <MessageSquare className="w-4 h-4" /> AI Project Coach
                             </h3>
                             
                             <div className="flex gap-4 items-start">
                                 <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0">
                                     <Terminal className="w-5 h-5 text-white" />
                                 </div>
                                 <div className="flex-1">
                                     <div className="bg-gray-800 rounded-xl rounded-tl-none p-4 text-sm text-gray-300 leading-relaxed mb-4">
                                         "You have <strong>{settings?.schedule?.dailyHours || 2}h</strong> scheduled for today. Completing this module will boost your <strong>Backend Systems</strong> skill by 12%. Ready to code?"
                                     </div>
                                     <div className="flex gap-2">
                                         <button 
                                             onClick={handleExplainTask}
                                             className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-white transition-colors border border-gray-700"
                                         >
                                             Explain Task
                                         </button>
                                         <button 
                                            onClick={handleGenerateCode}
                                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs font-medium text-white transition-colors border border-gray-700"
                                         >
                                             Generate Starter Code
                                         </button>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* UPCOMING MODULES PREVIEW */}
                     <div className="mt-8">
                         <h3 className="text-sm font-bold text-gray-500 mb-4 ml-1">UPCOMING MODULES</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                             {curriculum.slice(0, 4).map((mod, i) => (
                                 <div key={mod.id} className={`p-4 rounded-xl border border-gray-800 ${i === currentModuleIndex ? 'bg-indigo-900/10 border-indigo-500/30 ring-1 ring-indigo-500/30' : 'bg-gray-900 opacity-60'}`}>
                                     <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-2">Module {i+1}</div>
                                     <h4 className="font-bold text-white text-sm mb-1">{mod.title}</h4>
                                     <span className="text-xs text-gray-500">{mod.tasks.length} Tasks • {mod.estimatedHours || "2h"}</span>
                                 </div>
                             ))}
                         </div>
                     </div>

                 </div>
             </div>
        )}

        {/* AI ASSISTANT PANEL */}
        <ChatAssistant 
            isOpen={showAssistant}
            onClose={() => setShowAssistant(false)}
            role={role}
            initialQuery={initialAiQuery}
            context={{
                type: 'project',
                projectTitle: project?.title,
                currentTask: currentTask?.title,
                taskDescription: currentTask?.description,
                userOS: settings?.os || 'Windows'
            } as any}
        />

        {/* ADAPTIVE SCHEDULE TOAST */}
        {adaptiveMessage && (
            <div className="fixed bottom-6 right-6 md:right-10 max-w-sm bg-gray-900 border border-amber-500/30 shadow-2xl rounded-xl p-4 animate-in slide-in-from-bottom-5 duration-500 z-50 flex gap-3">
                <div className="bg-amber-500/10 p-2 rounded-lg h-fit">
                    <Calendar className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                    <h4 className="font-bold text-amber-400 text-sm mb-1">Schedule Adjusted</h4>
                    <p className="text-xs text-gray-300 leading-relaxed">{adaptiveMessage}</p>
                </div>
                <button 
                    onClick={() => setAdaptiveMessage(null)}
                    className="text-gray-500 hover:text-white h-fit"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        )}

        {/* WEEKLY REVIEW MODAL */}
        <WeeklyReviewModal 
            isOpen={showWeeklyReview}
            onClose={() => setShowWeeklyReview(false)}
            projectTitle={project?.title}
        />

    </div>
  );
}
