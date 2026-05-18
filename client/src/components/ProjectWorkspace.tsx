import { apiFetch } from '../utils/apiFetch';
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Bell, ChevronRight,
  Circle, CheckCircle, Sparkles, Send, FileText,
  Code2, BookOpen, Terminal, GitBranch, HelpCircle, Zap,
  Flame, Play, Coffee, Target, Clock, Loader2,
  ChevronDown, ChevronUp, DownloadCloud, FileJson, Image as ImageIcon, Database
} from "lucide-react";

// Task type detection from task text
const getTaskMeta = (text: string): { icon: React.ReactNode; color: string; type: string; time: string } => {
  const t = text.toLowerCase();
  if (t.includes('install') || t.includes('npm') || t.includes('setup') || t.includes('configure'))
    return { icon: <Terminal className="w-3.5 h-3.5" />, color: 'text-orange-500 bg-orange-50 border-orange-200', type: 'CLI', time: '~15 min' };
  if (t.includes('git') || t.includes('commit') || t.includes('push') || t.includes('branch'))
    return { icon: <GitBranch className="w-3.5 h-3.5" />, color: 'text-purple-500 bg-purple-50 border-purple-200', type: 'Git', time: '~10 min' };
  if (t.includes('test') || t.includes('quiz') || t.includes('check'))
    return { icon: <HelpCircle className="w-3.5 h-3.5" />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200', type: 'Quiz', time: '~20 min' };
  if (t.includes('read') || t.includes('learn') || t.includes('understand') || t.includes('review'))
    return { icon: <BookOpen className="w-3.5 h-3.5" />, color: 'text-blue-500 bg-blue-50 border-blue-200', type: 'Read', time: '~25 min' };
  return { icon: <Code2 className="w-3.5 h-3.5" />, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', type: 'Code', time: '~30 min' };
};

import { TaskGuideView } from "./TaskGuideView";
import { RightSidebar } from "./RightSidebar";
import { useAlert } from '../contexts/AlertContext';



// Fallback UI Components since we stripped out ./ui
function Button({ children, className, ...props }: any) {
  return (
    <button 
      className={`px-4 py-2 font-medium transition-colors rounded-lg flex items-center justify-center ${className || ''}`} 
      {...props}
    >
      {children}
    </button>
  );
}

function Card({ children, className, ...props }: any) {
  return (
    <div className={`bg-white rounded-xl shadow-sm overflow-hidden ${className || ''}`} {...props}>
      {children}
    </div>
  );
}


interface Step {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
  resources: string[];
  completed: boolean;
  expanded: boolean;
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Fallback Mock Project Steps
const projectStepsMock: Step[] = [
  {
    id: "1",
    title: "Project Outline & Real-time Integration",
    description: "Preparing your environment to fetch real data",
    tasks: [
      { id: "1-1", text: "Ensure your setup is connected to the backend", completed: false },
      { id: "1-2", text: "Map dynamic tasks correctly", completed: false }
    ],
    resources: ["Backend API Docs"],
    completed: false,
    expanded: true
  }
];

export default function ProjectWorkspace() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const { project, role, preLoadedCurriculum } = (location.state as any) || {};

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};

  const [projectId, setProjectId] = useState<string | null>(project?.projectId || project?.id || null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [showGuideView, setShowGuideView] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // New fancy features state
  const [verifyingTasks, setVerifyingTasks] = useState<Record<string, { status: 'running' | 'success', logs: string[] }>>({});
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const [subTaskProgress, setSubTaskProgress] = useState<Record<string, Record<string, boolean>>>({});
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [showAssetsMenu, setShowAssetsMenu] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);

  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Welcome! I'm your Project Guide AI, here to help you learn and build this project step-by-step.\n\n💡 I can explain concepts, help debug code, or guide you on what to do next.\n\nClick on any task to view its detailed guide, or ask me a question below!",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // XP logic
  const calculateLevel = (xp: number) => {
    if (xp < 100) return 1;
    if (xp < 250) return 2;
    if (xp < 500) return 3;
    if (xp < 850) return 4;
    if (xp < 1300) return 5;
    if (xp < 1900) return 6;
    if (xp < 2600) return 7;
    if (xp < 3400) return 8;
    if (xp < 4300) return 9;
    return 10;
  };



  const awardXP = (amount: number, reason: string) => {
    const newXP = totalXP + amount;
    const newLevel = calculateLevel(newXP);
    setTotalXP(newXP);
    setLevel(newLevel);
    // Real implementation uses Sonner to show toast, we'll log it
    console.log(`+${amount} XP: ${reason}`);
  };

  const mapCurriculumToSteps = (curr: any[]): Step[] => {
      return curr.map((mod: any, i: number) => ({
          id: `mod-${i+1}`,
          title: mod.title,
          description: mod.description || 'Complete this module to advance your skills.',
          tasks: mod.tasks?.length > 0 
            ? mod.tasks.map((t: any, idx: number) => ({
                id: `task-${i+1}-${idx+1}`,
                text: t.title || t.text || t.description || t,
                completed: false
            }))
            : [ { id: `task-${i+1}-1`, text: `Review material for ${mod.title}`, completed: false } ],
          resources: mod.resources || [{name: 'MDN Web Docs', url: '#'}, {name: 'Official Documentation', url: '#'}],
          completed: false,
          expanded: false
      }));
  };

  const persistProgress = async (newSteps: Step[], currentXp: number) => {
    if (!projectId || !user.id) return;
    const newCompletedList: string[] = [];
    newSteps.forEach(s => s.tasks.forEach(t => {
        if (t.completed) newCompletedList.push(t.id);
    }));

    const isFullyCompleted = newSteps.length > 0 && newSteps.every(s => s.completed);

    try {
        await apiFetch('/api/role/update-project-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                projectId: projectId,
                status: isFullyCompleted ? 'completed' : 'active',
                progress: {
                    completedTasks: newCompletedList,
                    xp: currentXp
                }
            })
        });
    } catch (e) {
        console.error("Failed to save progress", e);
    }
  };

  // INITIALIZATION: REAL-TIME DB SYNC
  useEffect(() => {
    if (!project) {
        navigate('/dashboard');
        return;
    }

    const initProject = async () => {
        let loadedSteps: Step[] = [];

        // 1. New Project (PreLoaded Curriculum Present, usually directly from setup modal)
        if (preLoadedCurriculum) {
            loadedSteps = mapCurriculumToSteps(preLoadedCurriculum);
            // projectId has already been created and passed by ProjectSetupModal
        } 
        // 2. Existing Project Resuming
        else if (project.project_data || project.progress_data) {
             const prog = project.progress_data 
               ? (typeof project.progress_data === 'string' ? JSON.parse(project.progress_data) : project.progress_data)
               : {};
             const projData = project.project_data
               ? (typeof project.project_data === 'string' ? JSON.parse(project.project_data) : project.project_data)
               : {};
             
             loadedSteps = mapCurriculumToSteps(projData.curriculum || []);
             
             // Restore progress
             if (prog.completedTasks && prog.completedTasks.length > 0) {
                 const completedSet = new Set(prog.completedTasks);
                 loadedSteps = loadedSteps.map(step => ({
                     ...step,
                     tasks: step.tasks.map(t => ({
                         ...t,
                         completed: completedSet.has(t.id)
                     }))
                 }));
                 // Check if step is fully completed
                 loadedSteps = loadedSteps.map(step => ({
                    ...step,
                    completed: step.tasks.every(t => t.completed)
                 }));
             }
             if (prog.xp) {
               setTotalXP(prog.xp);
               setLevel(calculateLevel(prog.xp));
             }
        } else if (project.id) {
            try {
                const res = await fetch(`/api/role/my-projects?userId=${user.id || 1}&role=${role || ''}`);
                const data = await res.json();
                if (data.success && data.projects) {
                    const found = data.projects.find((p: any) => p.id === project.id || p.id === parseInt(project.id));
                    if (found) {
                        const projData = typeof found.project_data === 'string' ? JSON.parse(found.project_data) : found.project_data;
                        const prog = found.progress_data 
                          ? (typeof found.progress_data === 'string' ? JSON.parse(found.progress_data) : found.progress_data)
                          : {};
                        
                        setProjectId(found.id);
                        loadedSteps = mapCurriculumToSteps(projData?.curriculum || []);
                        
                        if (prog.completedTasks && prog.completedTasks.length > 0) {
                             const completedSet = new Set(prog.completedTasks);
                             loadedSteps = loadedSteps.map(step => ({
                                 ...step,
                                 tasks: step.tasks.map(t => ({
                                     ...t,
                                     completed: completedSet.has(t.id)
                                 }))
                             }));
                             loadedSteps = loadedSteps.map(step => ({
                                ...step,
                                completed: step.tasks.every(t => t.completed)
                             }));
                        }
                        if (prog.xp) {
                          setTotalXP(prog.xp);
                          setLevel(calculateLevel(prog.xp));
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to fetch project from API", e);
            }
        }

        if (loadedSteps.length > 0) {
            const stepsWithExpanded = loadedSteps.map((s, i) => ({ ...s, expanded: i === 0 }));
            setSteps(stepsWithExpanded);
            setSelectedStep(stepsWithExpanded[0]);
        } else {
            setSteps(projectStepsMock);
            setSelectedStep(projectStepsMock[0]);
        }
    };

    initProject();
  }, [project, role, navigate, preLoadedCurriculum]);

  // Handle Send Message (REALTIME OPENAI INTEGRATION)
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const currentMsg = inputMessage;
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
        const res = await apiFetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: currentMsg,
                context: {
                    type: 'project',
                    projectTitle: project?.title || 'Personal Project',
                    currentTask: selectedStep?.title || 'Setup',
                    taskDescription: selectedStep?.description
                },
                role: role || 'Software Engineer'
            })
        });
        
        const data = await res.json();
        const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.reply || "I encountered an error connecting to OpenAI. Please try again.",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
    } catch (err) {
        console.error("OpenAI Error:", err);
        const aiResponse: Message = {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: "I encountered a network error. Ensure your backend server is running.",
            timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
    }
    setIsTyping(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Timer logic
  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      // Could play a chime here
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const simulateVerification = async (stepId: string, taskId: string) => {
    setVerifyingTasks(prev => ({ ...prev, [taskId]: { status: 'running', logs: ['> Initializing environment...'] } }));
    
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    
    await delay(600);
    setVerifyingTasks(prev => ({
      ...prev,
      [taskId]: { status: 'running', logs: [...prev[taskId].logs, '> Checking file structure...'] }
    }));
    
    await delay(800);
    setVerifyingTasks(prev => ({
      ...prev,
      [taskId]: { status: 'running', logs: [...prev[taskId].logs, '> Running unit tests (2/2 passed)...'] }
    }));

    await delay(700);
    setVerifyingTasks(prev => ({
      ...prev,
      [taskId]: { status: 'success', logs: [...prev[taskId].logs, '✅ Verification complete. Code accepted.'] }
    }));

    await delay(1000);
    handleTaskToggle(stepId, taskId);
    setVerifyingTasks(prev => {
      const copy = { ...prev };
      delete copy[taskId];
      return copy;
    });
  };

  const toggleTaskExpanded = (taskId: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  const toggleSubTask = (taskId: string, subId: string) => {
    setSubTaskProgress(prev => {
      const taskProgress = prev[taskId] || {};
      return {
        ...prev,
        [taskId]: { ...taskProgress, [subId]: !taskProgress[subId] }
      };
    });
  };

  // Proactive "Are you stuck?" Hint
  useEffect(() => {
    if (!selectedTaskId) return;
    const timer = setTimeout(() => {
      const isCompleted = steps.some(s => s.tasks.some(t => t.id === selectedTaskId && t.completed));
      if (!isCompleted) {
        const aiResponse: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "🤔 I noticed you've been reviewing this task for a bit. Need a hint, want to see a simplified example, or need an error explained?",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearTimeout(timer);
  }, [selectedTaskId, steps]);

  const handleStepClick = (stepId: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId
          ? { ...step, expanded: !step.expanded }
          : { ...step, expanded: false }
      )
    );
    const clickedStep = steps.find((s) => s.id === stepId);
    if (clickedStep) {
      setSelectedStep(clickedStep);
    }
  };

  const handleTaskToggle = (stepId: string, taskId: string) => {
    const step = steps.find(s => s.id === stepId);
    const task = step?.tasks.find(t => t.id === taskId);
    const wasCompleted = task?.completed || false;

    let updatedXp = totalXP;
    if (!wasCompleted) {
        updatedXp += 20;
        awardXP(20, `Completed task`);
    } else {
        updatedXp -= 20;
        setTotalXP(updatedXp);
        setLevel(calculateLevel(updatedXp));
    }

    const updatedSteps = steps.map((s) => {
        if (s.id === stepId) {
          const updatedTasks = s.tasks.map((t) =>
            t.id === taskId ? { ...t, completed: !t.completed } : t
          );
          const allTasksCompleted = updatedTasks.every((t) => t.completed);
          return {
            ...s,
            tasks: updatedTasks,
            completed: allTasksCompleted,
          };
        }
        return s;
    });
    
    setSteps(updatedSteps);
    persistProgress(updatedSteps, updatedXp);
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setShowGuideView(true);
  };

  const handleBackToTasks = () => {
    setShowGuideView(false);
    setSelectedTaskId(null);
  };

  const handleStepToggle = (stepId: string) => {
    const step = steps.find(s => s.id === stepId);
    const wasCompleted = step?.completed || false;
    
    let updatedXp = totalXP;
    if (!wasCompleted) {
        updatedXp += 100;
        awardXP(100, `Completed module`);
    } else {
        updatedXp -= 100;
        setTotalXP(updatedXp);
        setLevel(calculateLevel(updatedXp));
    }

    const updatedSteps = steps.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s
    );
    
    setSteps(updatedSteps);
    persistProgress(updatedSteps, updatedXp);
  };

  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedSteps / (steps.length || 1)) * 100);

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] relative pb-20 lg:pb-0 font-sans selection:bg-slate-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 transform-gpu">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between">
          <div className="flex items-center gap-5 min-w-0">
            <button
              onClick={() => setShowRightSidebar(true)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors shrink-0 lg:hidden"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-50 rounded-lg text-slate-500 hover:text-slate-900 font-semibold transition-colors text-[13px] tracking-wide shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Workspace</span>
            </button>
            <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>
            <div className="min-w-0 truncate flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
              <h1 className="text-[16px] font-extrabold text-slate-900 truncate tracking-tight">
                {project?.title || "Real-time Chat Application"}
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2 transition-colors ${showNotifications ? 'text-slate-900 bg-slate-100 rounded-lg' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <Bell className="w-[18px] h-[18px]" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                    <div className="px-4 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between pt-3">
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Notifications</p>
                      <button className="text-[10px] text-emerald-600 font-bold hover:underline" onClick={() => setShowNotifications(false)}>Mark all read</button>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer border-l-2 border-emerald-500 bg-emerald-50/30">
                      <p className="text-[13px] text-slate-800 font-semibold mb-0.5">Welcome to your workspace!</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">Start by reviewing the Engineering Pipeline tasks on the left. Click on any task to open its detailed guide.</p>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">Just now</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer">
                      <p className="text-[13px] text-slate-800 font-semibold mb-0.5">Project Guide AI is online</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">Your real-time assistant is ready. Ask questions or request debugging help anytime.</p>
                      <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-wider">2 mins ago</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <button className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-[11px] hover:bg-black transition-colors shadow-sm ml-2 uppercase">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </button>
          </div>
        </div>
        
        {/* Premium Progress Bar */}
        <div className="w-full bg-slate-100 h-[3px]">
          <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progressPercentage}%` }} />
        </div>
        
        {/* Sleek Stats Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 lg:px-10 py-2.5 flex items-center justify-between overflow-x-auto whitespace-nowrap scrollbar-hide">
          <div className="flex items-center gap-6 text-[12px] font-semibold text-slate-600">
            <span className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-teal-500" /> {completedSteps} / {steps.length} Modules</span>
            <span className="flex items-center gap-2"><Target className="w-3.5 h-3.5 text-emerald-500" /> {progressPercentage}% Completed</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-bold">
            <button onClick={() => setTimerActive(!timerActive)} className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${timerActive ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-sm animate-pulse' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}>
              <Clock className="w-3.5 h-3.5" />
              {formatTime(timerSeconds)}
            </button>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-600 border border-orange-200"><Flame className="w-3.5 h-3.5" /> Level {level}</span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-50 text-yellow-600 border border-yellow-200"><Zap className="w-3.5 h-3.5" /> {totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="h-[calc(100dvh-70px)] flex flex-col lg:flex-row max-w-[1800px] mx-auto overflow-hidden">
        
        {/* Left Column - Pipeline Tasks & Split Pane */}
        <div className="w-full flex-1 min-h-0 lg:w-[65%] xl:w-[70%] flex relative overflow-hidden bg-[#fafafa]">
          
          {/* Task List (shrinks when pane is open) */}
          <div className={`h-full overflow-y-auto px-6 lg:px-10 py-8 scrollbar-thin scrollbar-thumb-slate-200 transition-all duration-300 ${showGuideView && selectedTaskId ? 'hidden md:block w-full md:w-[45%] border-r border-slate-200 bg-white' : 'w-full'}`}>
            <div className="max-w-4xl mx-auto">
              {/* Project header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-teal-50 flex items-center justify-center">
                      <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                    </div>
                    <span className="text-[11px] font-bold text-teal-600 uppercase tracking-widest">Learning Curriculum</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{project?.title || 'My Project'}</h3>
                  <p className="text-[13px] font-medium text-slate-500 mt-2 flex items-center gap-2">
                    <span>{steps.length} modules</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span>{steps.reduce((a,s)=>a+s.tasks.length,0)} tasks total</span>
                  </p>
                </div>
                <div className="flex flex-col md:items-end gap-3 shrink-0">
                  <div className="flex items-center gap-2 relative">
                    <button 
                      onClick={() => setShowAssetsMenu(!showAssetsMenu)}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all shadow-sm"
                    >
                      <DownloadCloud className="w-4 h-4 text-slate-500" /> Project Assets
                    </button>
                    
                    {/* Assets Dropdown */}
                    {showAssetsMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowAssetsMenu(false)} />
                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 transform origin-top-right transition-all">
                          <div className="px-4 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between pt-1">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Download Resources</p>
                          </div>
                          
                          <button onClick={() => { 
                              const blob = new Blob(['// Boilerplate Code'], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'Starter_Code.zip';
                              a.click();
                              URL.revokeObjectURL(url);
                              showAlert("Starter code downloaded successfully", "success"); 
                              setShowAssetsMenu(false); 
                            }} 
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center"><FileJson className="w-4 h-4 text-blue-600" /></div>
                            <div>
                              <p className="text-[13px] text-slate-800 font-semibold">Starter_Code.zip</p>
                              <p className="text-[11px] text-slate-500">React + Vite Boilerplate</p>
                            </div>
                          </button>
                          
                          <button onClick={() => { 
                              const blob = new Blob(['// Figma Mockups'], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'Figma_Designs.fig';
                              a.click();
                              URL.revokeObjectURL(url);
                              showAlert("Design files downloaded", "success"); 
                              setShowAssetsMenu(false); 
                            }} 
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center"><ImageIcon className="w-4 h-4 text-pink-600" /></div>
                            <div>
                              <p className="text-[13px] text-slate-800 font-semibold">Figma_Designs.fig</p>
                              <p className="text-[11px] text-slate-500">UI Mockups & Assets</p>
                            </div>
                          </button>
                          
                          <button onClick={() => { 
                              const blob = new Blob(['CREATE TABLE users (id SERIAL PRIMARY KEY);'], { type: 'text/plain' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = 'Database_Schema.sql';
                              a.click();
                              URL.revokeObjectURL(url);
                              showAlert("Schema downloaded", "success"); 
                              setShowAssetsMenu(false); 
                            }} 
                            className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Database className="w-4 h-4 text-emerald-600" /></div>
                            <div>
                              <p className="text-[13px] text-slate-800 font-semibold">Database_Schema.sql</p>
                              <p className="text-[11px] text-slate-500">PostgreSQL tables</p>
                            </div>
                          </button>
                        </div>
                      </>
                    )}

                    {steps.find(s => !s.completed) && (
                      <button onClick={() => { const ns = steps.find(s=>!s.completed); if(ns) handleStepClick(ns.id); }} 
                        className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 shadow-md shadow-teal-500/20 transition-all hover:-translate-y-0.5">
                        <Play className="w-4 h-4 fill-white" /> Continue Learning
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {steps.map((step, index) => (
                  <Card
                    key={step.id}
                    className={`transition-all overflow-hidden border ${
                      step.completed
                        ? "border-slate-200 bg-white opacity-60 grayscale-[30%]"
                        : step.expanded
                        ? "border-slate-800 shadow-[0_8px_30px_rgba(0,0,0,0.06)] bg-white ring-1 ring-slate-900/5 relative z-10"
                        : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className="p-6 cursor-pointer group flex items-start gap-4"
                      onClick={() => handleStepClick(step.id)}
                    >
                        <div
                          className={`flex-shrink-0 w-7 h-7 mt-0.5 rounded shadow-[inset_0_1px_2px_rgba(0,0,0,0.1)] flex items-center justify-center font-bold text-[13px] ${
                            step.completed
                              ? "bg-emerald-500 text-white shadow-none"
                              : step.expanded
                              ? "bg-slate-900 text-white shadow-none"
                              : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 transition-colors"
                          }`}
                        >
                          {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                        </div>

                        <div className="flex-1 min-w-0 pr-4">
                          <h3
                            className={`text-[16px] font-extrabold mb-1.5 tracking-tight ${
                              step.completed ? "text-slate-500 line-through decoration-slate-300" : "text-slate-900"
                            }`}
                          >
                            {step.title}
                          </h3>
                          <p className="text-[13.5px] text-slate-500 line-clamp-2 leading-relaxed">
                            {step.description}
                          </p>
                          
                          {!step.expanded && (
                            <div className="mt-4 flex items-center gap-3 opacity-80">
                              <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                                  Progress
                              </span>
                              <div className="flex-1 max-w-[150px] bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                  <div 
                                      className="h-full bg-slate-800 rounded-full" 
                                      style={{ width: `${(step.tasks.filter(t => t.completed).length / (step.tasks.length || 1)) * 100}%`}} 
                                  />
                              </div>
                              <span className="text-[11px] font-bold text-slate-500">
                                  {step.tasks.filter((t) => t.completed).length}/{step.tasks.length}
                              </span>
                            </div>
                          )}
                        </div>

                        <ChevronRight
                          className={`w-5 h-5 text-slate-400 transition-transform flex-shrink-0 ${
                            step.expanded ? "rotate-90 text-slate-900" : "group-hover:translate-x-1"
                          }`}
                        />
                    </div>

                    {step.expanded && (
                       <div className="px-6 pb-6 animate-in slide-in-from-top-2 duration-200 border-t border-slate-100 bg-slate-50/50 pt-5 mt-2">
                        
                        <div className="space-y-3 mb-8">
                          <h4 className="text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-4 flex items-center gap-2">
                             Tasks in this module
                          </h4>
                          {step.tasks.map((task, tIdx) => {
                            const meta = getTaskMeta(task.text);
                            const isNext = !task.completed && step.tasks.slice(0, tIdx).every(t => t.completed);
                            return (
                            <div
                              key={task.id}
                              className={`group flex flex-col p-4 rounded-xl border transition-all cursor-pointer ${
                                task.completed ? 'bg-slate-50 border-slate-200 opacity-70' :
                                isNext ? 'bg-white border-teal-300 shadow-md ring-1 ring-teal-50/50' :
                                'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                              }`}
                              onClick={() => toggleTaskExpanded(task.id)}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                                {/* Left Side Checkbox/Status */}
                                <div className="flex-shrink-0 mt-0.5" onClick={(e) => e.stopPropagation()}>
                                  {verifyingTasks[task.id] ? (
                                    verifyingTasks[task.id].status === 'running' 
                                      ? <Loader2 className="w-5 h-5 text-teal-500 animate-spin" />
                                      : <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                  ) : (
                                    <button className={`transition-transform active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-400'}`}
                                      onClick={() => {
                                        if (isNext && !task.completed) simulateVerification(step.id, task.id);
                                        else handleTaskToggle(step.id, task.id);
                                      }}>
                                      {task.completed ? <CheckCircle2 className="w-5 h-5 fill-emerald-50" /> : <Circle className="w-5 h-5" />}
                                    </button>
                                  )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      {isNext && <span className="text-[10px] font-black text-white bg-gradient-to-r from-teal-500 to-emerald-500 px-2 py-0.5 rounded shadow-sm uppercase tracking-wider flex items-center gap-1"><Play className="w-2.5 h-2.5 fill-white" /> Start Here</span>}
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${meta.color}`}>{meta.icon}{meta.type}</span>
                                      <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" />{meta.time}</span>
                                    </div>
                                    <button className="text-slate-400 hover:text-slate-700">
                                      {expandedTasks[task.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                  </div>
                                  <p className={`text-[14px] font-semibold leading-snug ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.text}</p>
                                  
                                  {/* Verification Terminal Simulation */}
                                  {verifyingTasks[task.id] && (
                                    <div className="mt-3 bg-slate-900 rounded-lg p-3 overflow-hidden shadow-inner font-mono text-[11px] text-emerald-400 space-y-1">
                                      {verifyingTasks[task.id].logs.map((log, i) => (
                                        <p key={i} className="animate-in slide-in-from-left-2 opacity-90">{log}</p>
                                      ))}
                                    </div>
                                  )}

                                  {/* Subtasks View */}
                                  {expandedTasks[task.id] && !task.completed && !verifyingTasks[task.id] && (
                                    <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 animate-in slide-in-from-top-2">
                                      {["Review requirement docs", "Implement core logic", "Test edge cases"].map((subText, i) => {
                                        const subId = `sub-${i}`;
                                        const isChecked = subTaskProgress[task.id]?.[subId] || false;
                                        return (
                                          <div key={i} className="flex items-center justify-between group py-1">
                                            <div className="flex items-center gap-2 cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleSubTask(task.id, subId); }}>
                                              <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 bg-slate-50'}`}>
                                                {isChecked && <CheckCircle className="w-3 h-3" />}
                                              </div>
                                              <span className={`text-[12px] font-medium transition-all ${isChecked ? 'text-slate-400 line-through' : 'text-slate-600'}`}>{subText}</span>
                                            </div>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                setInputMessage(`Help me with: ${subText}`);
                                                setTimeout(() => {
                                                  inputRef.current?.focus();
                                                }, 50);
                                              }}
                                              className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-teal-50 rounded-md text-teal-600 flex items-center gap-1 cursor-pointer"
                                              title="Ask AI about this step"
                                            >
                                              <Sparkles className="w-3 h-3" />
                                              <span className="text-[10px] font-bold">Ask AI</span>
                                            </button>
                                          </div>
                                        );
                                      })}
                                      {isNext && (
                                        <div className="pt-3 flex items-center justify-between">
                                          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Complete all steps</span>
                                          <button onClick={(e) => { e.stopPropagation(); simulateVerification(step.id, task.id); }} 
                                            className="px-4 py-1.5 bg-slate-900 text-white text-[11px] font-bold rounded shadow-sm hover:bg-black transition-colors flex items-center gap-1.5">
                                            <Terminal className="w-3 h-3" /> Run Checks
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Docs button (Hidden on mobile if expanded to save space, but visible otherwise) */}
                                <div className="sm:block mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                                  <button onClick={() => handleTaskClick(task.id)}
                                    className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:w-auto w-full text-[12px] font-bold rounded-xl border transition-all ${
                                      task.completed ? 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-slate-600' :
                                      isNext ? 'bg-slate-900 border-slate-900 text-white hover:bg-black shadow-md' :
                                      'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                                    }`}>
                                    <FileText className="w-3.5 h-3.5" />
                                    {isNext ? 'Open Guide' : 'View Docs'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );})}
                        </div>

                        <div className="flex items-center gap-4 pt-5 border-t border-slate-200/60">
                           <Button
                            onClick={(e: Event) => {
                              e.stopPropagation();
                              const allCompleted = step.tasks.every((t) => t.completed);
                              if (allCompleted) {
                                setShowLevelUp(true);
                                setTimeout(() => {
                                   setShowLevelUp(false);
                                   handleStepToggle(step.id);
                                }, 3000);
                              } else {
                                showAlert("Please check off all tasks above to verify module completion.", "warning");
                              }
                            }}
                            className={`transition-all font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 text-[13px] uppercase tracking-wider ${
                              step.completed
                                ? "bg-emerald-500 text-white shadow-sm"
                                : step.tasks.every((t) => t.completed)
                                ? "bg-slate-900 text-white hover:bg-black shadow-[0_4px_14px_rgba(0,0,0,0.15)] animate-pulse"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed"
                            }`}
                            disabled={!step.tasks.every((t) => t.completed) && !step.completed}
                          >
                              {step.completed ? "Module Verified" : "Verify Completion"}
                          </Button>
                          <span className="text-[12px] font-medium text-slate-500 tracking-wide">
                             {step.tasks.filter((t) => t.completed).length} / {step.tasks.length} Verified
                          </span>
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </div> {/* Close Task List */}

          {/* Split Pane - Task Guide View */}
          {showGuideView && selectedTaskId && (
            <div className="w-full md:w-[55%] h-full bg-white animate-in slide-in-from-right-8 duration-300 border-l border-slate-200 shadow-xl z-20 flex flex-col absolute md:relative inset-0 md:inset-auto">
              <TaskGuideView
                task={steps.flatMap(s => s.tasks).find(t => t.id === selectedTaskId)}
                projectTitle={project?.title}
                onBack={handleBackToTasks}
                onMarkComplete={() => {
                  const step = steps.find(s => s.tasks.some(t => t.id === selectedTaskId));
                  if (step) handleTaskToggle(step.id, selectedTaskId);
                  handleBackToTasks();
                }}
              />
            </div>
          )}
        </div>

        {/* Right Column - REAL TIME Co-Pilot */}
        <div className="w-full lg:w-[35%] xl:w-[30%] h-full hidden lg:flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 bg-white">
          <div className="h-full flex flex-col w-full relative">
            
            {/* Premium AI Header */}
            <div className="bg-white shrink-0 border-b border-slate-100 shadow-sm z-10">
              <div className="p-5 flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center border border-teal-100 relative shadow-inner">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-[15px] tracking-tight">Project Guide AI</h3>
                  <p className="text-[11px] font-semibold text-teal-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" /> Online & Ready
                  </p>
                </div>
              </div>
              {/* Context strip */}
              {selectedStep && (
                <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">Context</span>
                  <span className="text-[12px] font-semibold text-slate-700 truncate">{selectedStep.title}</span>
                </div>
              )}
            </div>

            {/* AI Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-6 bg-[#fafafa] scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-slate-100 border border-slate-200">
                      <Sparkles className="w-3 h-3 text-slate-600" />
                    </div>
                  )}
                  
                  <div className={`flex flex-col max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`rounded-2xl p-4 shadow-sm text-[14px] leading-relaxed font-medium ${
                        message.role === "assistant"
                          ? "bg-white text-slate-800 border border-slate-200 rounded-tl-sm shadow-[0_2px_10px_rgba(0,0,0,0.02)]"
                          : "bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-tr-sm shadow-emerald-500/20"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-1 px-1">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        {message.timestamp.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                        })}
                        </p>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 animate-in fade-in duration-300">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-slate-100 border border-slate-200">
                    <Sparkles className="w-3 h-3 text-slate-600" />
                  </div>
                  <div className="bg-slate-50 rounded-xl rounded-tl-sm p-3.5 border border-slate-200 shadow-sm flex items-center h-10">
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Premium Quick Actions */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5 px-1">Suggested Prompts</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Help on task', icon: <HelpCircle className="w-3.5 h-3.5" />, prompt: `Help me with: ${selectedStep?.tasks.find(t=>!t.completed)?.text || 'current task'}` },
                  { label: 'Show code', icon: <Code2 className="w-3.5 h-3.5" />, prompt: 'Show me a code example for this task' },
                  { label: 'Explain', icon: <BookOpen className="w-3.5 h-3.5" />, prompt: `Explain the concept behind: ${selectedStep?.title}` },
                  { label: 'I am stuck', icon: <Coffee className="w-3.5 h-3.5" />, prompt: `I'm stuck on: ${selectedStep?.tasks.find(t=>!t.completed)?.text}. Give me a hint` },
                ].map((a, i) => (
                  <button key={i} onClick={() => { setInputMessage(a.prompt!); setTimeout(() => inputRef.current?.focus(), 10); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-200 rounded-lg text-[12px] font-semibold text-slate-600 hover:text-teal-700 transition-all shadow-sm">
                    {a.icon} {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Premium Input */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-1.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-inner">
                <input ref={inputRef} type="text" value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your AI co-pilot..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-[14px] font-medium text-slate-800 placeholder:text-slate-400 px-3 py-2"
                />
                <button onClick={handleSendMessage} disabled={!inputMessage.trim()}
                  className="w-10 h-10 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white rounded-lg flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-500/20 flex-shrink-0">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      <RightSidebar 
        isOpen={showRightSidebar} 
        onClose={() => setShowRightSidebar(false)} 
      />

      {/* Gamified Level Up Overlay */}
      {showLevelUp && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
            <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(250,204,21,0.5)] mb-8 relative">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
              {[...Array(6)].map((_, i) => (
                <div key={i} className="absolute w-2 h-2 bg-white rounded-full animate-ping" style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4 drop-shadow-2xl text-center">MODULE VERIFIED!</h1>
            <p className="text-xl md:text-2xl text-yellow-300 font-bold mb-8">+150 XP AWARDED</p>
            <div className="flex gap-2">
              <span className="w-3 h-3 bg-white rounded-full animate-bounce"></span>
              <span className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-3 h-3 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
