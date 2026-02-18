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
  ChevronRight
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  why: string;
  codeSnippet: string;
  verification: string;
}

interface Module {
  id: string;
  title: string;
  tasks: Task[];
}

export default function ProjectWorkspace() {
  const location = useLocation();
  const navigate = useNavigate();
  const { project, role } = location.state || {}; // Expecting project object and role

  const [curriculum, setCurriculum] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAssistant, setShowAssistant] = useState(false);

  useEffect(() => {
    if (!project) {
        // Redirect if accessed directly without state
        navigate('/dashboard');
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
                    techStack: project.tools
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
  }, [project, role, navigate]);

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
          // Set to last task of previous module
          setCurrentTaskIndex(curriculum[currentModuleIndex - 1].tasks.length - 1);
      }
  };

  if (isLoading) {
      return (
          <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
              <div className="flex flex-col items-center gap-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                  <p className="text-gray-400">Generating Project Curriculum...</p>
              </div>
          </div>
      );
  }

  const currentModule = curriculum[currentModuleIndex];
  const currentTask = currentModule?.tasks[currentTaskIndex];

  // Calculate overall progress
  const totalTasks = curriculum.reduce((acc, mod) => acc + mod.tasks.length, 0);
  const progressPercentage = Math.round((completedTasks.size / totalTasks) * 100);

  return (
    <div className="flex h-screen bg-gray-950 text-gray-200 overflow-hidden font-sans">
        
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

        {/* MAIN CONTENT Area */}
        <main className="flex-1 flex flex-col min-w-0">
            {/* HEADER */}
            <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2 hover:bg-gray-800 rounded-lg text-gray-400"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-px bg-gray-800 mx-1"></div>
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                    <span className="text-gray-600">/</span>
                    <h1 className="text-sm font-semibold text-white truncate max-w-[200px] md:max-w-md">
                        {project?.title || 'Project Workspace'}
                    </h1>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <div className="text-xs text-gray-400 mb-1">Progress</div>
                        <div className="w-32 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAssistant(!showAssistant)}
                        className={`p-2 rounded-lg transition-colors ${showAssistant ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
                    >
                        <MessageSquare className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* CONTENT SCROLL AREA */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <div className="max-w-4xl mx-auto">
                    
                    {currentTask ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            
                            {/* Title Block */}
                            <div>
                                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
                                    <span className="px-2 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
                                        {currentModule?.title}
                                    </span>
                                    <span>Task {currentTaskIndex + 1} of {currentModule?.tasks.length}</span>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                    {currentTask.title}
                                </h1>
                                <p className="text-lg text-gray-400 leading-relaxed">
                                    {currentTask.description}
                                </p>
                            </div>

                            {/* Context Block ("Why") */}
                            <div className="bg-blue-900/10 border-l-4 border-blue-500 p-6 rounded-r-lg">
                                <h3 className="text-blue-400 font-bold text-sm mb-2 flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" /> Context & Rationale
                                </h3>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    {currentTask.why}
                                </p>
                            </div>

                            {/* Implementation Guide */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Terminal className="w-5 h-5 text-indigo-400" /> 
                                    Implementation Guide
                                </h3>

                                {/* Code Snippet */}
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

                                {/* Verification Step */}
                                <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-6">
                                    <h4 className="text-green-400 font-bold text-sm mb-3 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Verify Your Work
                                    </h4>
                                    <p className="text-gray-300 text-sm">{currentTask.verification}</p>
                                </div>
                            </div>

                            {/* Action Footer */}
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
                    ) : (
                        <div className="text-center py-20 text-gray-500">
                            Select a task to view details.
                        </div>
                    )}
                </div>
            </div>
        </main>

        {/* AI ASSISTANT PANEL */}
        {showAssistant && (
           <aside className="fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-40 transform transition-transform duration-300 flex flex-col">
               <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                   <h2 className="font-bold text-white flex items-center gap-2">
                       <MessageSquare className="w-4 h-4 text-indigo-500" />
                       Project Assistant
                   </h2>
                   <button onClick={() => setShowAssistant(false)} className="p-1 text-gray-400 hover:text-white">
                       <X className="w-5 h-5" />
                   </button>
               </div>
               <div className="flex-1 p-6 flex items-center justify-center text-gray-500 text-sm text-center">
                   <p>AI Chat functionality coming soon.<br/>Use this to debug specific steps.</p>
               </div>
           </aside>
        )}

    </div>
  );
}
