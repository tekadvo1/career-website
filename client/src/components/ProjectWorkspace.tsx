import { apiFetch } from '../utils/apiFetch';
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Bell,
  ChevronRight,
  Circle,
  CheckCircle,
  Sparkles,
  Send,
  Lightbulb,
  FileText,
  Star,
} from "lucide-react";

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

function Badge({ children, className, ...props }: any) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${className || ''}`} {...props}>
      {children}
    </span>
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
  
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "👋 Welcome! I'm FindStreak AI, your real-time assistant for this guide.\n\n✅ My responses are generated via OpenAI API.\n✅ Your completed tasks and XP instantly sync to PostgreSQL.\n✅ Start checking off steps to build your streak!\n\nClick on any step or ask me a question about this project.",
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

  // Progress Insights
  const getProgressInsights = () => {
    const totalTasks = steps.reduce((acc, step) => acc + step.tasks.length, 0);
    const completedTasks = steps.reduce(
      (acc, step) => acc + step.tasks.filter(t => t.completed).length,
      0
    );
    const progressPercent = Math.round((completedTasks / (totalTasks || 1)) * 100);

    const nextIncompleteStep = steps.find(s => !s.completed);
    const nextIncompleteTask = nextIncompleteStep?.tasks.find(t => !t.completed);

    const insights = `📊 **Your Progress Insights**\n\n**Overall Progress:**\n🎯 ${completedTasks} of ${totalTasks} tasks completed (${progressPercent}%)\n⭐ Level ${level} with ${totalXP} XP\n🏆 ${completedSteps} of ${steps.length} steps completed\n\n**Next Recommendation:**\n${nextIncompleteTask ? `➡️ Focus on: "${nextIncompleteTask.text}"` : "🎉 All tasks completed!"}`;

    const aiResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: insights,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const getSmartHints = () => {
    const currentStepTasks = selectedStep?.tasks || [];
    const nextUncompletedTask = currentStepTasks.find(t => !t.completed);

    let hints = `💡 **Smart Hint AI**\n\n`;
    if (nextUncompletedTask) {
      hints += `**Current Task:** ${nextUncompletedTask.text}\nI recommend you jump directly into your IDE and create the files for this assignment. If you get an error message, paste it here so I can fix it for you!`;
    }

    const aiResponse: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: hints,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
  };

  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedSteps / (steps.length || 1)) * 100);

  return (
    <div className="min-h-screen bg-[#fafafa] relative pb-20 lg:pb-0 font-sans selection:bg-slate-200">
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
            {/* XP and Level Display - Enterprise Look */}
            <div className="hidden md:flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-200 rounded-md">
              <Star className="w-3.5 h-3.5 text-slate-400 fill-slate-800" />
              <div className="flex items-center gap-3 text-[12px] font-bold tracking-widest uppercase">
                <span className="text-slate-500">LVL {level}</span>
                <span className="text-slate-900">{totalXP} XP</span>
              </div>
            </div>

            <button className="relative p-2 text-slate-400 hover:text-slate-900 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
            </button>
            
            <button className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-[11px] hover:bg-black transition-colors shadow-sm ml-2 uppercase">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </button>
          </div>
        </div>
        
        {/* Progress Tracker Bar */}
        <div className="w-full bg-slate-100 h-[2px]">
          <div
            className="h-full bg-slate-900 transition-all duration-700 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="h-[calc(100dvh-70px)] flex flex-col lg:flex-row max-w-[1800px] mx-auto overflow-hidden">
        
        {/* Left Column - Pipeline Tasks */}
        <div className="w-full lg:w-[65%] xl:w-[70%] overflow-y-auto px-6 lg:px-10 py-8 scrollbar-thin scrollbar-thumb-slate-200 bg-[#fafafa]">
          {!showGuideView ? (
            <div className="max-w-4xl max-auto">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Engineering Pipeline</h2>
                  <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Execution Backlog</h3>
                </div>
                <Badge className="bg-slate-100 text-slate-600 border border-slate-200 rounded px-2.5 py-1 text-[11px] uppercase tracking-widest">
                  {steps.length} Modules
                </Badge>
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
                        
                        <div className="space-y-2 mb-8">
                          <h4 className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4">
                              Task Sequence
                          </h4>
                          {step.tasks.map((task) => (
                            <div
                              key={task.id}
                              className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${
                                task.completed
                                  ? "bg-transparent border-transparent"
                                  : "bg-white border-slate-200 shadow-sm hover:border-slate-300"
                              }`}
                            >
                              <button 
                                className={`flex-shrink-0 focus:outline-none transition-transform active:scale-90 ${task.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-500'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTaskToggle(step.id, task.id);
                                }}
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="w-6 h-6 fill-emerald-50" />
                                ) : (
                                  <Circle className="w-6 h-6" />
                                )}
                              </button>
                              
                              <p className={`text-[14px] flex-1 tracking-tight ${task.completed ? "text-slate-400 font-medium line-through" : "text-slate-900 font-bold"}`}>
                                  {task.text}
                              </p>

                              <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskClick(task.id);
                                }}
                                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold tracking-widest uppercase rounded border transition-colors ${
                                  task.completed 
                                    ? "bg-transparent border-slate-200 text-slate-400" 
                                    : "bg-white border-slate-200 text-slate-700 hover:border-slate-800 hover:bg-slate-900 hover:text-white"
                                }`}
                              >
                                <FileText className="w-3 h-3" />
                                Docs
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 pt-5 border-t border-slate-200/60">
                           <Button
                            onClick={(e: Event) => {
                              e.stopPropagation();
                              const allCompleted = step.tasks.every((t) => t.completed);
                              if (allCompleted) {
                                handleStepToggle(step.id);
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
          ) : selectedTaskId ? (
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
          ) : null}
        </div>

        {/* Right Column - REAL TIME Co-Pilot */}
        <div className="w-full lg:w-[35%] xl:w-[30%] h-full hidden lg:flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 bg-white">
          <div className="h-full flex flex-col w-full relative">
            
            {/* AI Header */}
            <div className="bg-slate-900 p-5 shrink-0 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-slate-800 rounded shadow-inner flex items-center justify-center relative border border-slate-700">
                  <Sparkles className="w-4 h-4 text-slate-300" />
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div>
                  <h3 className="font-bold text-white text-[13px] tracking-wide">Copilot Engine</h3>
                  <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-[0.2em] mt-0.5">
                      Systems Online
                  </p>
                </div>
              </div>
            </div>

            {/* AI Messages Area */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 bg-white scrollbar-thin scrollbar-thumb-slate-200">
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
                      className={`rounded-xl ${message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"} p-3.5 shadow-sm text-[13px] leading-relaxed font-medium ${
                        message.role === "assistant"
                          ? "bg-slate-50 text-slate-800 border border-slate-200"
                          : "bg-slate-900 text-white"
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

            {/* Action Buttons */}
            <div className="px-5 py-3 bg-white border-t border-slate-100 flex gap-2">
                <button
                  onClick={getProgressInsights}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  Metrics
                </button>
                <button
                  onClick={getSmartHints}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 border border-slate-200 rounded text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-slate-900 transition-colors"
                >
                  <Lightbulb className="w-3.5 h-3.5" />
                  Hints
                </button>
            </div>

            {/* Input Form */}
            <div className="p-4 bg-white border-t border-slate-100 shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded border border-slate-200 p-1 focus-within:border-slate-800 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Query copilot..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-medium text-slate-900 placeholder:text-slate-400 px-3 py-1.5"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="w-3.5 h-3.5 ml-0.5" />
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
    </div>
  );
}
