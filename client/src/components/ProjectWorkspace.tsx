import { apiFetch } from '../utils/apiFetch';
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Circle, Sparkles, Send, 
  BookOpen, ChevronDown, ChevronUp, Loader2, Zap
} from "lucide-react";
import { TaskGuideView } from "./TaskGuideView";
import { useAlert } from '../contexts/AlertContext';

interface Step {
  id: string;
  title: string;
  description: string;
  tasks: Task[];
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
  timestamp: string; // use ISO string for easier JSON serialization
}

export default function ProjectWorkspace() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const queryProjectId = searchParams.get('projectId');
  
  const { project: stateProject, role: stateRole, preLoadedCurriculum: stateCurriculum } = (location.state as any) || {};

  const userString = sessionStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};

  const [projectId] = useState<string | null>(queryProjectId || stateProject?.projectId || stateProject?.id || null);
  const [project, setProject] = useState<any>(stateProject || null);
  const [role] = useState<string>(stateRole || user?.role || '');
  const [preLoadedCurriculum] = useState<any[] | null>(stateCurriculum || null);
  
  const [, setScheduleData] = useState<any>(location.state?.settings?.schedule || stateProject?.schedule_data || null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "👋 Welcome! I'm your AI Project Guide. Ask me any questions about the current task, concepts, or code errors.",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mobile responsive views state
  // "outline" | "task" | "ai"
  const [activePane, setActivePane] = useState<"outline" | "task" | "ai">("task");

  const awardXP = (amount: number, reason: string) => {
    setTotalXP(prev => prev + amount);
    showAlert(`+${amount} XP: ${reason}`, 'success');
  };

  const mapCurriculumToSteps = (curr: any[]): Step[] => {
      return curr.map((mod: any, i: number) => ({
          id: `mod-${i+1}`,
          title: mod.title,
          description: mod.description || 'Complete this module to advance your skills.',
          tasks: mod.tasks?.length > 0 
            ? mod.tasks.map((t: any) => ({
                id: t.id || t.taskId || `task-${i+1}-${Math.random().toString(36).substr(2, 9)}`,
                text: t.title || t.text || t.description || t,
                completed: false
            }))
            : [],
          completed: false,
          expanded: i === 0 // expand first module by default
      }));
  };

  const persistProgress = async (newSteps: Step[], currentXp: number, currentMessages: Message[] = messages) => {
    if (!projectId || !user.id) return;
    setIsSaving(true);
    
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
                progress: { completedTasks: newCompletedList, xp: currentXp },
                chatData: currentMessages,
                lastUpdated: new Date().toISOString()
            })
        });
    } catch (e) {
        console.error("Failed to save progress", e);
        showAlert("Failed to save progress.", "error");
    } finally {
        setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!project && !projectId) {
        navigate('/dashboard');
        return;
    }

    const initProject = async () => {
        let loadedSteps: Step[] = [];
        let currentProject = project;

        if (!currentProject && projectId) {
            try {
                const res = await apiFetch(`/api/role/my-projects`);
                const data = await res.json();
                if (data.success && data.projects) {
                    const found = data.projects.find((p: any) => String(p.id) === String(projectId));
                    if (found) {
                        currentProject = found;
                        setProject(found);
                    } else {
                        navigate('/dashboard'); return;
                    }
                }
            } catch (e) {
                navigate('/dashboard'); return;
            }
        }

        if (!currentProject) return;

        if (preLoadedCurriculum) {
            loadedSteps = mapCurriculumToSteps(preLoadedCurriculum);
        } else if (currentProject.project_data || currentProject.progress_data) {
             const prog = currentProject.progress_data 
               ? (typeof currentProject.progress_data === 'string' ? JSON.parse(currentProject.progress_data) : currentProject.progress_data)
               : {};
             const projData = currentProject.project_data
               ? (typeof currentProject.project_data === 'string' ? JSON.parse(currentProject.project_data) : currentProject.project_data)
               : {};
             
             loadedSteps = mapCurriculumToSteps(projData.curriculum || []);
             
             if (prog.completedTasks && prog.completedTasks.length > 0) {
                 const completedSet = new Set(prog.completedTasks);
                 loadedSteps = loadedSteps.map(step => ({
                     ...step,
                     tasks: step.tasks.map(t => ({ ...t, completed: completedSet.has(t.id) }))
                 }));
                 loadedSteps = loadedSteps.map(step => ({
                    ...step, completed: step.tasks.every(t => t.completed)
                 }));
             }
             if (prog.xp) setTotalXP(prog.xp);
             
             // Restore Chat
             const chat = currentProject.chat_data 
               ? (typeof currentProject.chat_data === 'string' ? JSON.parse(currentProject.chat_data) : currentProject.chat_data)
               : null;
             if (chat && Array.isArray(chat) && chat.length > 0) {
                 setMessages(chat);
             }
             
             if (currentProject.schedule_data) {
                 setScheduleData(typeof currentProject.schedule_data === 'string' ? JSON.parse(currentProject.schedule_data) : currentProject.schedule_data);
             }
        }

        if (loadedSteps.length > 0) {
            setSteps(loadedSteps);
            // Auto-select first incomplete task
            let firstIncomplete: string | null = null;
            for (const step of loadedSteps) {
                for (const task of step.tasks) {
                    if (!task.completed) {
                        firstIncomplete = task.id;
                        break;
                    }
                }
                if (firstIncomplete) break;
            }
            if (firstIncomplete) setSelectedTaskId(firstIncomplete);
        }
    };

    initProject();
  }, [project, role, navigate, preLoadedCurriculum]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(), role: "user", content: inputMessage, timestamp: new Date().toISOString(),
    };

    const currentMsg = inputMessage;
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputMessage("");
    setIsTyping(true);

    // Save user message immediately
    persistProgress(steps, totalXP, newMessages);

    try {
        const res = await apiFetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: currentMsg,
                context: {
                    type: 'project',
                    projectTitle: project?.title || 'Personal Project',
                    currentTask: selectedTaskId ? steps.flatMap(s => s.tasks).find(t => t.id === selectedTaskId)?.text : 'General'
                },
                role: role || 'Software Engineer'
            })
        });
        
        const data = await res.json();
        const aiResponse: Message = {
            id: (Date.now() + 1).toString(), role: "assistant", content: data.reply || "I encountered an error.", timestamp: new Date().toISOString(),
        };
        const finalMessages = [...newMessages, aiResponse];
        setMessages(finalMessages);
        persistProgress(steps, totalXP, finalMessages);
    } catch (err) {
        const aiResponse: Message = {
            id: (Date.now() + 1).toString(), role: "assistant", content: "Network error.", timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiResponse]);
    }
    setIsTyping(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleTaskExpanded = (taskId: string) => {
    setSelectedTaskId(taskId);
    setActivePane("task");
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
    }

    const updatedSteps = steps.map((s) => {
        if (s.id === stepId) {
          const updatedTasks = s.tasks.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t);
          return { ...s, tasks: updatedTasks, completed: updatedTasks.every((t) => t.completed) };
        }
        return s;
    });
    
    setSteps(updatedSteps);
    persistProgress(updatedSteps, updatedXp);
  };

  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPercentage = Math.round((completedSteps / (steps.length || 1)) * 100);

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 h-14 px-4 flex items-center justify-between shrink-0 shadow-sm z-30 relative">
        <div className="flex items-center gap-4 min-w-0">
          <button onClick={() => navigate("/dashboard")} className="text-slate-500 hover:text-slate-900 transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 truncate">
            <h1 className="font-bold text-slate-800 truncate">{project?.title || "Project Workspace"}</h1>
            {isSaving && <Loader2 className="w-3.5 h-3.5 text-slate-400 animate-spin ml-2" />}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-3 mr-4">
             <div className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
               <Zap className="w-3.5 h-3.5 text-yellow-500" /> {totalXP} XP
             </div>
             <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
               <div className="h-full bg-emerald-500 transition-all" style={{ width: `${progressPercentage}%` }} />
             </div>
          </div>
          
          {/* Mobile pane toggles */}
          <div className="flex lg:hidden bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button onClick={() => setActivePane("outline")} className={`px-3 py-1 text-xs font-bold rounded-md ${activePane === 'outline' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Outline</button>
            <button onClick={() => setActivePane("task")} className={`px-3 py-1 text-xs font-bold rounded-md ${activePane === 'task' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>Task</button>
            <button onClick={() => setActivePane("ai")} className={`px-3 py-1 text-xs font-bold rounded-md ${activePane === 'ai' ? 'bg-white shadow-sm text-emerald-700' : 'text-slate-500'}`}><Sparkles className="w-3.5 h-3.5 inline mr-1"/> AI</button>
          </div>
        </div>
      </header>

      {/* 3-Pane Layout container */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANE: OUTLINE */}
        <div className={`${activePane === 'outline' ? 'flex' : 'hidden'} lg:flex flex-col w-full lg:w-80 border-r border-slate-200 bg-[#fafafa] shrink-0 h-full overflow-y-auto`}>
           <div className="p-4 border-b border-slate-200 sticky top-0 bg-[#fafafa]/90 backdrop-blur z-10 shrink-0">
              <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-600" /> Project Outline
              </h2>
           </div>
           <div className="p-4 space-y-4">
             {steps.map((step, sIdx) => (
               <div key={step.id} className="space-y-1">
                 <button onClick={() => setSteps(prev => prev.map(s => s.id === step.id ? {...s, expanded: !s.expanded} : s))}
                   className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 transition-colors text-left"
                 >
                   <div className="flex items-center gap-2">
                     <span className={`w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                       {step.completed ? <CheckCircle2 className="w-3 h-3" /> : (sIdx + 1)}
                     </span>
                     <span className={`text-[13px] font-bold ${step.completed ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{step.title}</span>
                   </div>
                   {step.expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                 </button>
                 {step.expanded && (
                   <div className="pl-7 space-y-1 mt-1 border-l-2 border-slate-100 ml-2.5">
                     {step.tasks.map((task) => (
                       <button key={task.id} 
                         onClick={() => toggleTaskExpanded(task.id)}
                         className={`w-full text-left flex items-start gap-2.5 p-2 rounded-lg transition-all ${selectedTaskId === task.id ? 'bg-white border border-emerald-200 shadow-sm' : 'hover:bg-slate-100 border border-transparent'}`}
                       >
                         <div onClick={(e) => { e.stopPropagation(); handleTaskToggle(step.id, task.id); }} className="mt-0.5 text-slate-300 hover:text-emerald-500 cursor-pointer shrink-0 transition-colors">
                           {task.completed ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Circle className="w-4 h-4" />}
                         </div>
                         <div className="min-w-0">
                           <span className={`block text-[13px] leading-snug ${task.completed ? 'text-slate-400 line-through' : selectedTaskId === task.id ? 'font-bold text-emerald-800' : 'text-slate-700 font-medium'}`}>
                             {task.text}
                           </span>
                           {selectedTaskId === task.id && !task.completed && (
                             <span className="inline-block mt-1 text-[10px] font-bold text-white bg-emerald-500 px-1.5 py-0.5 rounded tracking-wide uppercase">Active Task</span>
                           )}
                         </div>
                       </button>
                     ))}
                   </div>
                 )}
               </div>
             ))}
           </div>
        </div>

        {/* CENTER PANE: TASK GUIDE */}
        <div className={`${activePane === 'task' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col h-full overflow-hidden bg-white relative`}>
           {selectedTaskId ? (
              <TaskGuideView 
                task={steps.flatMap(s => s.tasks).find(t => t.id === selectedTaskId)}
                projectTitle={project?.title}
                onBack={() => setActivePane("outline")}
                onMarkComplete={() => {
                   const step = steps.find(s => s.tasks.some(t => t.id === selectedTaskId));
                   if (step) handleTaskToggle(step.id, selectedTaskId);
                   // Auto-select next task
                   let found = false;
                   for(let i=0; i<steps.length; i++) {
                     for(let j=0; j<steps[i].tasks.length; j++) {
                       if (!steps[i].tasks[j].completed && steps[i].tasks[j].id !== selectedTaskId) {
                         setSelectedTaskId(steps[i].tasks[j].id);
                         found = true; break;
                       }
                     }
                     if(found) break;
                   }
                }}
              />
           ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in">
                <BookOpen className="w-12 h-12 mb-4 opacity-20" />
                <h3 className="text-lg font-bold text-slate-600 mb-2">Ready to Build</h3>
                <p className="text-sm max-w-sm">Select a task from the Project Outline on the left to see its step-by-step implementation guide.</p>
              </div>
           )}
        </div>

        {/* RIGHT PANE: AI ASSISTANT */}
        <div className={`${activePane === 'ai' ? 'flex' : 'hidden'} lg:flex w-full lg:w-[350px] xl:w-[400px] border-l border-slate-200 bg-[#fafafa] flex-col h-full shrink-0`}>
           <div className="p-4 border-b border-slate-200 bg-white shrink-0 flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
               <Sparkles className="w-4 h-4 text-teal-600" />
             </div>
             <div>
               <h3 className="text-[14px] font-bold text-slate-800 leading-tight">AI Co-Pilot</h3>
               <p className="text-[11px] text-teal-600 font-medium">Online • Task Context Active</p>
             </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
             {messages.map((message) => (
                <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  {message.role === "assistant" && (
                    <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 mt-1 shadow-sm">
                      <Sparkles className="w-3 h-3 text-teal-600" />
                    </div>
                  )}
                  <div className={`flex flex-col max-w-[85%] ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`rounded-2xl p-3.5 text-[13px] leading-relaxed ${
                        message.role === "assistant"
                          ? "bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm"
                          : "bg-teal-600 text-white rounded-tr-sm shadow-sm"
                      }`}>
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 animate-in fade-in duration-300">
                  <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 mt-1 shadow-sm"><Sparkles className="w-3 h-3 text-teal-600" /></div>
                  <div className="bg-white rounded-2xl rounded-tl-sm p-3 border border-slate-200 shadow-sm flex items-center h-9"><Loader2 className="w-4 h-4 text-slate-400 animate-spin" /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           <div className="p-3 bg-white border-t border-slate-200 shrink-0">
             <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-1.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-inner">
                <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                  placeholder="Ask for help, code, or explanation..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-slate-800 placeholder:text-slate-400 px-2 py-1.5"
                />
                <button onClick={handleSendMessage} disabled={!inputMessage.trim() || isTyping}
                  className="w-8 h-8 bg-teal-600 hover:bg-teal-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 shrink-0 shadow-sm">
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}
