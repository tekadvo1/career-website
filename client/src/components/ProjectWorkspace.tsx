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
  const navigate = useNavigate();
  const location = useLocation();
  const { project, role, preLoadedCurriculum } = (location.state as any) || {};

  const userString = localStorage.getItem('user');
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

    try {
        await fetch('/api/role/update-project-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                projectId: projectId,
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
        const res = await fetch('/api/ai/chat', {
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
    <div className="min-h-screen bg-slate-50 relative pb-20 lg:pb-0">
      {/* Header */}
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <button
                onClick={() => setShowRightSidebar(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors shrink-0 md:hidden"
                title="Open Menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-1.5 p-1.5 hover:bg-slate-100 rounded-lg text-emerald-600 font-bold transition-colors text-sm shrink-0"
                title="Back to Projects"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
              <div className="min-w-0 truncate">
                <h1 className="text-lg font-bold text-slate-900 truncate flex items-center gap-2">
                  {project?.title || "Real-time Chat Application"}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {/* XP and Level Display - Compact */}
              <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-full border border-emerald-200 shadow-sm hidden md:flex">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                <div className="flex items-center gap-2">
                  <p className="text-[11px] font-bold text-slate-600 leading-none">LVL {level}</p>
                  <p className="text-[11px] font-bold text-emerald-700 leading-none">{totalXP} XP</p>
                </div>
              </div>

              <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors relative">
                <Bell className="w-4 h-4 text-slate-600" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-600 rounded-full border border-white"></span>
              </button>
              
              <button className="w-7 h-7 bg-gradient-to-r from-slate-800 to-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs hover:scale-105 transition-transform shadow-md">
                JD
              </button>
            </div>
          </div>
        </div>
        {/* Slim Progress Bar underneath header */}
        <div className="w-full bg-slate-100 h-1 relative">
          <div
            className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all duration-700 shadow-sm"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="px-6 py-8 h-[calc(100vh-68px)] flex flex-col md:flex-row max-w-[1600px] mx-auto overflow-hidden">
        {/* Left Column - Step-by-Step Guide OR Task Guide View */}
        <div className="w-full md:w-3/5 lg:w-[55%] pr-0 md:pr-8 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300">
            {!showGuideView ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">FindStreak Learning Path</h2>
                    <p className="text-sm text-slate-600 mt-1">Step-by-step interactive timeline synced real-time</p>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 border-none shadow-sm">
                    {steps.length} Modules
                  </Badge>
                </div>

                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <Card
                      key={step.id}
                      className={`transition-all overflow-hidden ${
                        step.completed
                          ? "border border-emerald-300 bg-emerald-50/20 shadow-sm"
                          : step.expanded
                          ? "border border-[#00875a] bg-white ring-1 ring-[#00875a]/10 shadow-md rounded-xl"
                          : "border border-slate-200 bg-white hover:border-emerald-200 hover:shadow-sm rounded-xl"
                      }`}
                    >
                      <div
                        className="p-5 cursor-pointer"
                        onClick={() => handleStepClick(step.id)}
                      >
                          <div className="flex items-start gap-3">
                          <div
                            className={`flex-shrink-0 w-8 h-8 mt-0.5 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                              step.completed
                                ? "bg-[#00875a] text-white"
                                : "bg-emerald-100 text-[#00875a]"
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              index + 1
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1 mr-4">
                                <h3
                                  className={`text-[17px] font-bold mb-1 line-clamp-1 ${
                                    step.completed
                                      ? "text-emerald-900"
                                      : "text-slate-900"
                                  }`}
                                >
                                  {step.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                  {step.description}
                                </p>
                              </div>
                              <ChevronRight
                                className={`w-5 h-5 text-slate-300 transition-transform ${
                                  step.expanded ? "rotate-90 text-emerald-500" : ""
                                }`}
                              />
                            </div>

                            {!step.expanded && (
                              <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-500 tracking-wide">
                                    TASKS
                                </span>
                                <div className="flex-1 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-400 rounded-full" 
                                        style={{ width: `${(step.tasks.filter(t => t.completed).length / (step.tasks.length || 1)) * 100}%`}} 
                                    />
                                </div>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                                    {step.tasks.filter((t) => t.completed).length}/{step.tasks.length}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {step.expanded && (
                         <div className="px-5 pb-5 pt-2 animate-in slide-in-from-top-2 duration-200">
                          <div className="h-px bg-slate-100 w-full mb-5 -mt-2"></div>
                          
                          <div className="space-y-3 mb-6">
                            <h4 className="text-[14px] font-bold text-slate-800 tracking-wide mb-4 flex items-center gap-2">
                                Tasks Checklist
                            </h4>
                            {step.tasks.map((task, taskIndex) => (
                              <div
                                key={task.id}
                                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all ${
                                  task.completed
                                    ? "bg-slate-50 border-slate-100"
                                    : "bg-white border-emerald-300 hover:bg-emerald-50/30 hover:border-emerald-400 shadow-sm"
                                }`}
                              >
                                <div 
                                  className="flex-shrink-0 cursor-pointer text-slate-300 hover:text-emerald-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTaskToggle(step.id, task.id);
                                  }}
                                >
                                  {task.completed ? (
                                    <CheckCircle2 className="w-[22px] h-[22px] text-emerald-500 fill-emerald-50" />
                                  ) : (
                                    <Circle className="w-[22px] h-[22px] text-slate-300" />
                                  )}
                                </div>
                                
                                <p className={`text-[14px] flex-1 font-medium ${task.completed ? "text-slate-400 line-through" : "text-slate-800"}`}>
                                    {taskIndex + 1}. {task.text}
                                </p>

                                <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleTaskClick(task.id);
                                  }}
                                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-[#00875a] bg-white hover:bg-emerald-50 rounded-lg border border-emerald-200 transition-colors shadow-sm"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  View Guide
                                </button>
                              </div>
                            ))}
                          </div>



                          <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                             <Button
                              onClick={(e: Event) => {
                                e.stopPropagation();
                                const allCompleted = step.tasks.every((t) => t.completed);
                                if (allCompleted) {
                                  handleStepToggle(step.id);
                                } else {
                                  alert("Please check off all tasks above to mark the module complete.");
                                }
                              }}
                              className={`transition-all font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 text-[14px] shadow-sm ${
                                step.completed
                                  ? "bg-[#00875a] text-white hover:bg-emerald-700 shadow-md"
                                  : step.tasks.every((t) => t.completed)
                                  ? "bg-[#00875a] text-white hover:bg-emerald-700 shadow-md animate-pulse"
                                  : "bg-[#cbd5e1] text-white cursor-not-allowed"
                              }`}
                              disabled={!step.tasks.every((t) => t.completed) && !step.completed}
                            >
                                <Circle className={`w-4 h-4 ${step.tasks.every((t) => t.completed) || step.completed ? 'text-white' : 'text-slate-100 fill-slate-400'}`} /> 
                                {step.completed ? "Module Verified" : "Complete All Tasks First"}
                            </Button>
                            <span className="text-sm font-medium text-slate-600">
                               {step.tasks.filter((t) => t.completed).length} of {step.tasks.length} tasks done
                            </span>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </>
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

          {/* Right Column - REAL TIME AI Assistant */}
          <div className="w-full md:w-2/5 lg:w-[45%] h-full hidden md:block">
            <div className="h-full relative">
              <Card className="border border-slate-200 overflow-hidden shadow-lg shadow-slate-200/50 flex flex-col absolute inset-0">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-5 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-inner relative">
                      <Sparkles className="w-5 h-5 text-white" />
                      <div className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-[15px]">FindStreak AI</h3>
                      <p className="text-[11px] text-emerald-300 font-medium uppercase tracking-widest flex items-center gap-1">
                          🟢 Online
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5 bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-300">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                      )}
                      
                      <div className={`flex flex-col max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                        <div
                          className={`rounded-2xl ${message.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"} p-3.5 shadow-sm ${
                            message.role === "assistant"
                              ? "bg-white text-slate-700 border border-slate-100"
                              : "bg-emerald-600 text-white"
                          }`}
                        >
                          <p className="text-[14px] whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-1.5 px-1">
                            <p className="text-[10px] text-slate-400 font-medium">
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
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-white rounded-2xl rounded-tl-sm p-4 border border-slate-100 shadow-sm flex items-center h-10">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-emerald-400/50 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-emerald-400/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.15s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-emerald-400/50 rounded-full animate-bounce"
                            style={{ animationDelay: "0.3s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                <div className="px-5 py-3 bg-white border-t border-slate-100 flex gap-2">
                    <button
                      onClick={getProgressInsights}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors shadow-sm"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      Run Analytics
                    </button>
                    <button
                      onClick={getSmartHints}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors shadow-sm"
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      Smart Hint
                    </button>
                </div>

                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                  <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-1 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100 transition-all shadow-inner">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask the AI anything..."
                      className="flex-1 bg-transparent border-none focus:outline-none text-[14px] text-slate-800 placeholder:text-slate-400 px-3 py-2"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="w-10 h-10 bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </div>
                </div>
              </Card>
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
