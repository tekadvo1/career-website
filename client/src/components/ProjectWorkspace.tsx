import { apiFetch } from '../utils/apiFetch';
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  ArrowLeft, CheckCircle2, Circle, Sparkles, Send, 
  BookOpen, ChevronDown, ChevronUp, Loader2, Zap, Settings, Copy, Check,
  PanelLeftClose, PanelLeftOpen, Plus, Clock, Minimize
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { TaskGuideView } from "./TaskGuideView";
import { SetupView } from "./projects/SetupView";
import BlueprintView from "./projects/BlueprintView";
import RunTestView from "./projects/RunTestView";
import { useAlert } from '../contexts/AlertContext';
import { Maximize2, Minimize2, Play, Rocket } from "lucide-react";
import DeployShowcaseView from "./projects/DeployShowcaseView";

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
  const [serverLastUpdated, setServerLastUpdated] = useState<string | null>(stateProject?.last_updated || null);
  const [role] = useState<string>(stateRole || user?.role || '');
  const [preLoadedCurriculum] = useState<any[] | null>(stateCurriculum || null);
  
  const queryView = searchParams.get('view') as 'setup' | 'blueprint' | 'build' | 'runtest' | 'deploy';
  const [workspaceView, setWorkspaceView] = useState<'setup' | 'blueprint' | 'build' | 'runtest' | 'deploy'>(
    queryView || (project?.setup_data?.checkedItems?.length > 0 ? (project?.blueprint_data?.files ? 'build' : 'blueprint') : 'setup')
  );
  
  // Sync URL when view changes
  useEffect(() => {
    if (projectId && (searchParams.get('view') !== workspaceView || searchParams.get('projectId') !== projectId)) {
      navigate(`?projectId=${projectId}&view=${workspaceView}`, { replace: true, state: location.state });
    }
  }, [workspaceView, projectId, navigate, location.state, searchParams]);

  const [, setScheduleData] = useState<any>(location.state?.settings?.schedule || stateProject?.schedule_data || null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [totalXP, setTotalXP] = useState(0);

  // Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);

  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Mobile responsive views state
  // "outline" | "task" | "ai"
  const [activePane, setActivePane] = useState<"outline" | "task" | "ai">("task");

  const [guidanceMode, setGuidanceMode] = useState<'step'|'quick'>('step');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isOutlineCollapsed, setIsOutlineCollapsed] = useState(false);
  const [copilotState, setCopilotState] = useState<'normal'|'minimized'|'maximized'>('normal');

  const [leftWidth, setLeftWidth] = useState(() => parseInt(localStorage.getItem('pw_leftWidth') || '320', 10));
  const [rightWidth, setRightWidth] = useState(() => parseInt(localStorage.getItem('pw_rightWidth') || '400', 10));
  
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);
  
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft.current) {
        let newWidth = e.clientX;
        if (newWidth < 250) newWidth = 250;
        if (newWidth > 600) newWidth = 600;
        setLeftWidth(newWidth);
        localStorage.setItem('pw_leftWidth', newWidth.toString());
      }
      if (isDraggingRight.current) {
        let newWidth = window.innerWidth - e.clientX;
        if (newWidth < 300) newWidth = 300;
        if (newWidth > 800) newWidth = 800;
        setRightWidth(newWidth);
        localStorage.setItem('pw_rightWidth', newWidth.toString());
      }
    };
    const handleMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

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

  const persistProgress = async (newSteps: Step[], currentXp: number, currentMessages: Message[] = messages): Promise<boolean> => {
    if (!projectId || !user.id) return false;
    setIsSaving(true);
    
    const newCompletedList: string[] = [];
    newSteps.forEach(s => s.tasks.forEach(t => {
        if (t.completed) newCompletedList.push(t.id);
    }));

    const isFullyCompleted = newSteps.length > 0 && newSteps.every(s => s.completed);

    try {
        const response = await apiFetch('/api/role/update-project-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                projectId: projectId,
                status: isFullyCompleted ? 'completed' : 'active',
                progress: { completedTasks: newCompletedList, xp: currentXp, guidanceMode },
                chatData: currentMessages,
                lastUpdated: serverLastUpdated || new Date().toISOString()
            })
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to save progress');
        }

        const data = await response.json();
        if (data.lastUpdated) {
            setServerLastUpdated(data.lastUpdated);
        }
        return true;
    } catch (e: any) {
        console.error("Failed to save progress", e);
        showAlert(e.message || "Failed to save progress.", "error");
        return false;
    } finally {
        setIsSaving(false);
    }
  };

  const persistSetup = async (setupData: any, proceedToBuild: boolean) => {
    if (!projectId || !user.id) return;
    setIsSaving(true);
    setProject((prev: any) => ({ ...prev, setup_data: setupData }));
    
    try {
        await apiFetch('/api/role/update-project-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                projectId: projectId,
                progress: { completedTasks: steps.flatMap(s => s.tasks.filter(t => t.completed).map(t => t.id)), xp: totalXP },
                setupData,
                lastUpdated: new Date().toISOString()
            })
        });
        if (proceedToBuild) {
            setWorkspaceView('blueprint');
        } else {
            showAlert("Setup saved.", "success");
        }
    } catch (e) {
        console.error("Failed to save setup data", e);
        showAlert("Failed to save setup.", "error");
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
             if (prog.guidanceMode) setGuidanceMode(prog.guidanceMode);
             
             if (currentProject.schedule_data) {
                 setScheduleData(typeof currentProject.schedule_data === 'string' ? JSON.parse(currentProject.schedule_data) : currentProject.schedule_data);
             }
        }

        // Fetch ChatGPT style chat history
        try {
            const histRes = await apiFetch(`/api/ai/chat-history?userId=${user.id}&role=${encodeURIComponent(role)}&projectId=${currentProject.id}`);
            const histData = await histRes.json();
            if (histData.success && histData.history && histData.history.length > 0) {
                setChatHistory(histData.history);
                setMessages(histData.history[0].messages);
                setActiveSessionId(histData.history[0].id);
            } else {
                // If no history exists, start a default session
                startNewChat();
            }
        } catch(e) {
            console.error("Failed to load chat history", e);
            startNewChat();
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
  }, [project, role, navigate, preLoadedCurriculum, user.id]);

  const startNewChat = () => {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const welcomeMsg: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "👋 Welcome! I'm your AI Project Guide. Ask me any questions about the current task, concepts, or code errors.",
          timestamp: new Date().toISOString(),
      };
      setMessages([welcomeMsg]);
      setActiveSessionId(newSessionId);
      setIsHistoryVisible(false);
  };

  const syncChatHistoryToDB = async (sessionId: string, newMessages: Message[], titleStr?: string) => {
      if (!user.id || !projectId) return;
      
      const sessionTitle = titleStr || (newMessages.length > 1 ? newMessages[1].content.substring(0, 40) + '...' : "New Conversation");
      
      const newSession = {
          id: sessionId,
          title: sessionTitle,
          messages: newMessages,
          updatedAt: new Date().toISOString()
      };
      
      const updatedHistory = [...chatHistory.filter(s => s.id !== sessionId), newSession].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      setChatHistory(updatedHistory);
      
      try {
          await apiFetch('/api/ai/chat-history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id, role, projectId, chatHistory: [newSession] }) // just upsert this session
          });
      } catch (err) {
          console.error("Failed to sync chat history", err);
      }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const msgToSend = customMessage || inputMessage;
    if (!msgToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(), role: "user", content: msgToSend, timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (!customMessage) setInputMessage("");
    setIsTyping(true);

    // Save progress without rewriting chatData to project progress
    persistProgress(steps, totalXP);
    
    const sessionIdToUse = activeSessionId || `session_${Date.now()}`;
    if (!activeSessionId) setActiveSessionId(sessionIdToUse);

    // Initial sync
    syncChatHistoryToDB(sessionIdToUse, newMessages);

    try {
        const res = await apiFetch('/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msgToSend,
                context: {
                    type: 'project',
                    projectTitle: project?.title || 'Personal Project',
                    currentTask: selectedTaskId ? steps.flatMap(s => s.tasks).find(t => t.id === selectedTaskId)?.text : 'General'
                },
                role: role || 'Software Engineer',
                stream: true,
                conversationHistory: newMessages.map(m => ({ role: m.role, content: m.content }))
            })
        });
        
        if (!res.body) throw new Error("No body");
        
        const aiMessageId = (Date.now() + 1).toString();
        let aiContent = "";
        
        // Add empty message first
        setMessages(prev => [...prev, {
            id: aiMessageId, role: "assistant", content: "", timestamp: new Date().toISOString()
        }]);
        
        setIsTyping(false);
        
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            
            for (const line of lines) {
                if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                        const data = JSON.parse(line.slice(5));
                        if (data.content) {
                            aiContent += data.content;
                            setMessages(prev => prev.map(m => m.id === aiMessageId ? { ...m, content: aiContent } : m));
                        }
                    } catch (e) {
                        // ignore parse errors for partial chunks
                    }
                }
            }
        }
        
        // Final save
        syncChatHistoryToDB(sessionIdToUse, [...newMessages, {
            id: aiMessageId, role: "assistant", content: aiContent, timestamp: new Date().toISOString()
        }]);
    } catch (err) {
        const aiResponse: Message = {
            id: (Date.now() + 1).toString(), role: "assistant", content: "Network error.", timestamp: new Date().toISOString(),
        };
        const updatedWithErr = [...newMessages, aiResponse];
        setMessages(updatedWithErr);
        syncChatHistoryToDB(sessionIdToUse, updatedWithErr);
        setIsTyping(false);
    }
  };

  useEffect(() => {
    if (!isHistoryVisible) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isHistoryVisible]);

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

  const handleMarkComplete = async (taskId: string, completed: boolean): Promise<boolean> => {
    let updatedXp = totalXP;
    const updatedSteps = steps.map(s => {
      const uTasks = s.tasks.map(t => {
        if (t.id === taskId) {
          if (completed && !t.completed) updatedXp += 50;
          if (!completed && t.completed) updatedXp -= 50;
          return { ...t, completed };
        }
        return t;
      });
      return { ...s, tasks: uTasks, completed: uTasks.every(t => t.completed) };
    });

    const success = await persistProgress(updatedSteps, updatedXp);
    
    if (success) {
      setTotalXP(updatedXp);
      setSteps(updatedSteps);
    }
    
    return success;
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

          <div className="hidden sm:flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
            <button onClick={() => setWorkspaceView("setup")} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${workspaceView === 'setup' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><Settings className="w-3.5 h-3.5"/> Setup</button>
            <button onClick={() => setWorkspaceView("blueprint")} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${workspaceView === 'blueprint' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><BookOpen className="w-3.5 h-3.5"/> Blueprint</button>
            <button onClick={() => setWorkspaceView("build")} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${workspaceView === 'build' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><Circle className="w-3.5 h-3.5"/> Build</button>
            <button onClick={() => setWorkspaceView("runtest")} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${workspaceView === 'runtest' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><Play className="w-3.5 h-3.5"/> Test</button>
            <button onClick={() => setWorkspaceView("deploy")} className={`px-3 py-1.5 text-xs font-bold rounded-md flex items-center gap-1.5 transition-colors ${workspaceView === 'deploy' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}><Rocket className="w-3.5 h-3.5"/> Deploy</button>
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
        {!isFocusMode && copilotState !== 'maximized' && (
          <div 
            style={{ width: isOutlineCollapsed ? 48 : leftWidth }}
            className={`${activePane === 'outline' ? 'flex w-full' : 'hidden'} lg:flex flex-col border-r border-slate-200 bg-[#fafafa] shrink-0 h-full overflow-hidden relative transition-all duration-300 ease-in-out`}
          >
             {isOutlineCollapsed ? (
               <div className="flex flex-col items-center py-4 h-full gap-4">
                 <button onClick={() => setIsOutlineCollapsed(false)} className="p-2 hover:bg-slate-200 rounded-md text-slate-500 transition-colors" title="Expand Outline">
                   <PanelLeftOpen className="w-5 h-5" />
                 </button>
                 <div className="writing-vertical-rl rotate-180 text-xs font-bold text-slate-400 tracking-widest uppercase mt-4">
                   Project Outline
                 </div>
               </div>
             ) : (
               <>
                 <div className="p-4 border-b border-slate-200 sticky top-0 bg-[#fafafa]/90 backdrop-blur z-10 shrink-0 flex items-center justify-between">
                    <h2 className="text-[13px] font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-600" /> Project Outline
                    </h2>
                    <button onClick={() => setIsOutlineCollapsed(true)} className="p-1 hover:bg-slate-200 rounded text-slate-500 transition-colors" title="Collapse Outline">
                      <PanelLeftClose className="w-4 h-4" />
                    </button>
                 </div>
                 <div className="p-4 space-y-4 overflow-y-auto">
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
                 
                 {/* Left Drag Handle */}
                 <div 
                   onMouseDown={() => { isDraggingLeft.current = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; }}
                   className="hidden lg:block absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-400/50 transition-colors z-20"
                 />
               </>
             )}
          </div>
        )}

        {/* CENTER PANE: MAIN VIEW (Setup, Blueprint, or Task) */}
        {copilotState !== 'maximized' && (
          <div className={`${activePane === 'task' ? 'flex' : 'hidden'} lg:flex flex-col flex-1 bg-white min-w-0 h-full overflow-hidden relative`}>
           {/* Focus Mode Toggle */}
           <button 
             onClick={() => setIsFocusMode(!isFocusMode)}
             className="hidden lg:flex absolute top-4 right-4 z-20 bg-white border border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200 p-2 rounded-md shadow-sm transition-colors"
             title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
           >
             {isFocusMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
           </button>

           {workspaceView === 'setup' ? (
              <SetupView 
                project={project} 
                initialSetupData={project?.setup_data}
                onSaveSetup={persistSetup}
                onHelpMeFixIt={(req, os) => {
                  setInputMessage(`I need help installing ${req.name} on ${os}. ${req.troubleshooting.join(' ')}`);
                  setActivePane('ai');
                  setWorkspaceView('setup');
                }}
              />
           ) : workspaceView === 'blueprint' ? (
              <BlueprintView 
                project={project} 
                curriculum={steps}
                onContinue={() => setWorkspaceView('build')} 
                onBack={() => setWorkspaceView('setup')}
                onUpdateProject={(p: any) => setProject(p)}
                onAskAI={(msg: string) => { setInputMessage(msg); setActivePane('ai'); }}
              />
           ) : workspaceView === 'runtest' ? (
              <RunTestView
                project={project}
                onUpdateProject={(p: any) => setProject(p)}
                onAskAI={(msg: string) => { setInputMessage(msg); setActivePane('ai'); }}
                onBack={() => setWorkspaceView('build')}
              />
           ) : workspaceView === 'deploy' ? (
              <DeployShowcaseView
                project={project}
                onUpdateProject={(p: any) => setProject(p)}
              />
           ) : selectedTaskId ? (
              <TaskGuideView 
                project={project}
                task={steps.flatMap(s => s.tasks).find(t => t.id === selectedTaskId)}
                guidanceMode={guidanceMode}
                onGuidanceModeChange={setGuidanceMode}
                onAskAI={(msg: string) => { setInputMessage(msg); setActivePane('ai'); }}
                onBack={() => setActivePane("outline")}
                onMarkComplete={async (isCompleted: boolean = true) => {
                   const step = steps.find(s => s.tasks.some(t => t.id === selectedTaskId));
                   if (step) {
                     // Check if it's already in the desired state to avoid double toggling
                     const task = step.tasks.find(t => t.id === selectedTaskId);
                     if (task?.completed !== isCompleted) {
                       const success = await handleMarkComplete(selectedTaskId, isCompleted);
                       if (!success) return;
                     }
                   }
                   if (isCompleted) {
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
        )}

        {/* RIGHT PANE: AI ASSISTANT */}
        {!isFocusMode && (
          <div 
            style={{ width: copilotState === 'minimized' ? 48 : (copilotState === 'maximized' ? '100%' : rightWidth) }}
            className={`${activePane === 'ai' ? 'flex w-full' : 'hidden'} lg:flex relative border-l border-slate-200 bg-[#fafafa] flex-col h-full shrink-0 transition-all duration-300 ease-in-out`}
          >
             {copilotState === 'minimized' ? (
               <div className="flex flex-col items-center py-4 h-full gap-4 bg-white border-l border-slate-200">
                 <button onClick={() => setCopilotState('normal')} className="p-2 hover:bg-slate-200 rounded-md text-slate-500 transition-colors" title="Expand AI Copilot">
                   <PanelLeftClose className="w-5 h-5 rotate-180" />
                 </button>
                 <div className="writing-vertical-rl rotate-180 text-xs font-bold text-slate-400 tracking-widest uppercase mt-4 flex items-center gap-2">
                   <Sparkles className="w-3.5 h-3.5 rotate-90" /> AI Co-Pilot
                 </div>
               </div>
             ) : (
               <>
                 {/* Right Drag Handle (only when normal) */}
                 {copilotState === 'normal' && (
                   <div 
                     onMouseDown={() => { isDraggingRight.current = true; document.body.style.cursor = 'col-resize'; document.body.style.userSelect = 'none'; }}
                     className="hidden lg:block absolute left-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-emerald-400/50 transition-colors z-20"
                   />
                 )}
                 
                 <div className="p-3 border-b border-slate-200 bg-white shrink-0 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center border border-teal-100">
                       <Sparkles className="w-4 h-4 text-teal-600" />
                     </div>
                     <div>
                       <h3 className="text-[14px] font-bold text-slate-800 leading-tight">AI Co-Pilot</h3>
                       <p className="text-[11px] text-teal-600 font-medium">Online • Task Context Active</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-1">
                     <button onClick={() => startNewChat()} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="New Chat">
                       <Plus className="w-4 h-4" />
                     </button>
                     <button onClick={() => setIsHistoryVisible(!isHistoryVisible)} className={`p-1.5 rounded transition-colors ${isHistoryVisible ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-100 text-slate-500'}`} title="Chat History">
                       <Clock className="w-4 h-4" />
                     </button>
                     <button onClick={() => setCopilotState(copilotState === 'maximized' ? 'normal' : 'maximized')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors hidden lg:block" title={copilotState === 'maximized' ? "Restore" : "Maximize"}>
                       {copilotState === 'maximized' ? <Minimize className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                     </button>
                     <button onClick={() => setCopilotState('minimized')} className="p-1.5 hover:bg-slate-100 rounded text-slate-500 transition-colors hidden lg:block" title="Minimize">
                       <PanelLeftOpen className="w-4 h-4 rotate-180" />
                     </button>
                   </div>
                 </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin relative">
                 {isHistoryVisible ? (
                    <div className="space-y-2 animate-in fade-in">
                       <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Previous Conversations</h3>
                       {chatHistory.length > 0 ? chatHistory.map(session => (
                          <div key={session.id} 
                               onClick={() => {
                                  setActiveSessionId(session.id);
                                  setMessages(session.messages);
                                  setIsHistoryVisible(false);
                               }}
                               className={`p-3 rounded-xl border cursor-pointer transition-colors ${activeSessionId === session.id ? 'bg-teal-50 border-teal-200' : 'bg-white border-slate-200 hover:border-teal-300'}`}>
                             <h4 className={`text-sm font-bold truncate ${activeSessionId === session.id ? 'text-teal-800' : 'text-slate-800'}`}>{session.title || 'Conversation'}</h4>
                             <p className="text-[11px] text-slate-400 mt-1">{new Date(session.updatedAt).toLocaleString()}</p>
                          </div>
                       )) : (
                          <p className="text-sm text-slate-500 italic">No chat history available.</p>
                       )}
                    </div>
                 ) : (
                    <>
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
                              {message.role === "assistant" ? (
                                <div className="prose prose-sm max-w-none prose-emerald prose-pre:bg-slate-900 prose-pre:text-slate-50 prose-headings:font-bold prose-a:text-emerald-600">
                                  <ReactMarkdown
                                    components={{
                                      code({node, inline, className, children, ...props}: any) {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const codeString = String(children).replace(/\n$/, '');
                                        
                                        if (!inline && match) {
                                          return (
                                            <div className="relative group mt-3 mb-4 rounded-lg overflow-hidden bg-slate-900 border border-slate-800">
                                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/50 border-b border-slate-700">
                                                <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider">{match[1]}</span>
                                                <button 
                                                  onClick={() => {
                                                    navigator.clipboard.writeText(codeString);
                                                    setCopiedCode(codeString);
                                                    setTimeout(() => setCopiedCode(null), 2000);
                                                  }}
                                                  className="p-1 hover:bg-slate-700 rounded transition-colors"
                                                  title="Copy code"
                                                >
                                                  {copiedCode === codeString ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300" />}
                                                </button>
                                              </div>
                                              <div className="p-3 overflow-x-auto text-[13px] leading-relaxed font-mono text-slate-50">
                                                <code>{children}</code>
                                              </div>
                                            </div>
                                          );
                                        }
                                        return <code className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[12px] font-mono border border-emerald-100" {...props}>{children}</code>;
                                      }
                                    }}
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap">{message.content}</p>
                              )}
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
                    </>
                 )}
               </div>
    
               <div className="p-3 bg-white border-t border-slate-200 shrink-0">
                 {!isHistoryVisible && messages.length === 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none snap-x">
                        <button onClick={() => handleSendMessage("Explain this task.")} className="snap-start shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors">Explain this task.</button>
                        <button onClick={() => handleSendMessage("Where should I start?")} className="snap-start shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors">Where should I start?</button>
                        <button onClick={() => handleSendMessage("Help me debug an error.")} className="snap-start shrink-0 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 transition-colors">Help me debug an error.</button>
                    </div>
                 )}
                 <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 p-1.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-inner">
                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => { if(e.key === 'Enter') handleSendMessage() }}
                      placeholder="Ask for help, code, or explanation..."
                      disabled={isHistoryVisible}
                      className="flex-1 bg-transparent border-none focus:outline-none text-[13px] text-slate-800 placeholder:text-slate-400 px-2 py-1.5 disabled:opacity-50"
                    />
                     <button onClick={() => handleSendMessage()} disabled={!inputMessage.trim() || isTyping || isHistoryVisible} className="p-2 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white rounded-lg transition-colors shadow-sm">
                       <Send className="w-4 h-4" />
                     </button>
                  </div>
               </div>
               </>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
