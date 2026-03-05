import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import {
  Send,
  Sparkles,
  Zap,
  Target,
  Lightbulb,
  Code,
  Rocket,
  Star,
  BookOpen,
  Clock,
  AlertCircle,
  Wrench,
  FileCode,
  User,
  X,
  Plus,
  Gamepad2,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
  Terminal,
  Settings,
  MoreVertical,
} from "lucide-react";
import ReactMarkdown from 'react-markdown';

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: Date;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  projectRecommendations?: ProjectRecommendation[];
  setupGuide?: SetupGuide;
  debuggingHelp?: DebuggingHelp;
}

interface ProjectRecommendation {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  skills: string[];
  xpReward: number;
}

interface SetupGuide {
  projectName: string;
  steps: SetupStep[];
}

interface SetupStep {
  number: number;
  title: string;
  description: string;
  code?: string;
  tips?: string[];
}

interface DebuggingHelp {
  errorType: string;
  commonIssues: DebugIssue[];
}

interface DebugIssue {
  issue: string;
  solution: string;
  code?: string;
}

export default function AILearningAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "Software Engineer";
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const LOCAL_STORAGE_KEY = "findstreak_ai_chat_history";

  const loadChatHistory = (): ChatSession[] => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.map((session: any) => ({
          ...session,
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
    }
    return [];
  };

  const initialHistory = loadChatHistory();
  const initialCurrentChatId = initialHistory.length > 0 ? initialHistory[0].id : "1";
  const initialMessages = initialHistory.length > 0 && initialHistory[0].messages.length > 0
    ? initialHistory[0].messages
    : [
        {
          id: "1",
          type: "assistant",
          content:
            `👋 Hi! I'm your FindStreak AI Learning Assistant. I can help you find the perfect projects to boost your skills for ${role}. Would you like me to recommend some guided dashboard projects?`,
          timestamp: new Date(),
        } as Message,
      ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [eli5Mode, setEli5Mode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const syncRef = useRef(false);

  // -- Chat History State --
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(initialHistory);
  const [currentChatId, setCurrentChatId] = useState<string>(initialCurrentChatId);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showProjectsDropdown, setShowProjectsDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync historical chat states globally across mobile & web environments
  useEffect(() => {
    if (user?.id) {
       fetch(`/api/ai/chat-history?userId=${user.id}`)
         .then(res => res.json())
         .then(data => {
            if (data.success && data.history && data.history.length > 0) {
               const parsedServerHistory = data.history.map((session: any) => ({
                  ...session,
                  updatedAt: new Date(session.updatedAt),
                  messages: session.messages.map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                  }))
               }));

               setChatHistory(parsedServerHistory);
               
               if (messages.length <= 1) { // If user hasn't typed in new chat yet, restore the most recent active session from server!
                   setCurrentChatId(parsedServerHistory[0].id);
                   setMessages(parsedServerHistory[0].messages);
               } 
            }
         })
         .catch(err => console.error("Could not sync chat history from server", err))
         .finally(() => { syncRef.current = true; }); // Safely enable DB writes AFTER the initial pull
    } else {
        syncRef.current = true; // No user logged in, permit local save immediately 
    }
  }, [user?.id]);

  useEffect(() => {
    // If we land here with a topicContext, automatically spin up a new chat and send it
    if (location.state?.topicContext) {
      const contextStr = location.state.topicContext;
      // create new chat
      const newChatId = Date.now().toString();
      setCurrentChatId(newChatId);
      
      const userMsg: Message = {
        id: newChatId + '-1',
        type: "user",
        content: contextStr,
        timestamp: new Date(),
      };
      
      setMessages([userMsg]);
      setIsTyping(true);

      // Perform AI fetch
      const fetchAI = async () => {
        try {
          const assistantMsgId = Date.now().toString();
          setMessages(prev => [...prev, {
            id: assistantMsgId,
            type: "assistant",
            content: "",
            timestamp: new Date(),
          }]);

          const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: contextStr,
              context: "User is asking for external resources and web searches to understand a roadmap topic.",
              role: role,
              stream: true,
            }),
          });
          
          if (!res.body) throw new Error("No stream body");

          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let streamedContent = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split("\n");
            for (const line of lines) {
              if (line.startsWith("data: ") && !line.includes("[DONE]")) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.content) {
                    streamedContent += data.content;
                    setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: streamedContent } : m));
                  }
                } catch(e) {}
              }
            }
          }
        } catch (error) {
          console.error(error);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: "assistant",
            content: "Oops! AI is currently offline. Please try again later.",
            timestamp: new Date()
          }]);
        } finally {
          setIsTyping(false);
        }
      };
      fetchAI();
      
      // Clear state so it doesn't refire on reload
      navigate(location.pathname, { replace: true, state: { ...location.state, topicContext: undefined } });
    }
  }, [location.state?.topicContext, role, navigate, location.pathname]);

  useEffect(() => {
    if (messages.length > 1) {
      setChatHistory(prev => {
        const existingIdx = prev.findIndex(c => c.id === currentChatId);
        const firstUserMsg = messages.find(m => m.type === 'user');
        const title = existingIdx >= 0 && prev[existingIdx].title !== "New Chat" 
                      ? prev[existingIdx].title 
                      : (firstUserMsg ? firstUserMsg.content.slice(0, 25) + (firstUserMsg.content.length > 25 ? "..." : "") : "New Chat");

        const session: ChatSession = {
          id: currentChatId,
          title,
          messages,
          updatedAt: new Date()
        };

        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = session;
          return updated.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
        } else {
          return [session, ...prev];
        }
      });
    }
  }, [messages, currentChatId]);

  // Persist chatHistory to localStorage AND backend whenever it changes
  useEffect(() => {
    if (!syncRef.current) return; // Prevent overwriting DB before initial GET finishes
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(chatHistory));

      if (user?.id) {
         fetch('/api/ai/chat-history', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, chatHistory })
         }).catch(err => console.error("Failed syncing chat history:", err));
      }
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  }, [chatHistory, user?.id]);

  const handleSwitchChat = (chatId: string) => {
    const session = chatHistory.find(c => c.id === chatId);
    if (session) {
      setCurrentChatId(session.id);
      setMessages(session.messages);
      setShowHistoryDrawer(false);
    }
  };

  const handleRenameChat = (e: React.MouseEvent | React.KeyboardEvent, chatId: string) => {
    e.stopPropagation();
    if (!editingTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    setChatHistory(prev => prev.map(c => c.id === chatId ? { ...c, title: editingTitle } : c));
    setEditingChatId(null);
  };

  const handleDeleteChat = (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    setChatHistory(prev => prev.filter(c => c.id !== chatId));
    if (currentChatId === chatId) {
      handleNewChat();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const projectRecommendations: ProjectRecommendation[] = [
    {
      id: "beginner-1",
      title: "Personal Task Manager Dashboard",
      description: "Build a simple dashboard to manage daily tasks with add, edit, and delete functionality.",
      difficulty: "beginner",
      duration: "2-3 hours",
      skills: ["React", "State Management", "Basic CSS"],
      xpReward: 150,
    },
    {
      id: "beginner-2",
      title: "Weather Dashboard",
      description: "Create a weather dashboard that displays current weather and 5-day forecast using a public API.",
      difficulty: "beginner",
      duration: "3-4 hours",
      skills: ["API Integration", "React", "Responsive Design"],
      xpReward: 200,
    },
    {
      id: "beginner-3",
      title: "Expense Tracker Dashboard",
      description: "Build a dashboard to track daily expenses with charts showing spending categories.",
      difficulty: "beginner",
      duration: "4-5 hours",
      skills: ["React", "Charts", "Local Storage"],
      xpReward: 250,
    },
    {
      id: "intermediate-1",
      title: "E-commerce Analytics Dashboard",
      description: "Create a comprehensive dashboard showing sales metrics, revenue trends, and customer insights.",
      difficulty: "intermediate",
      duration: "8-10 hours",
      skills: ["React", "Data Visualization", "State Management", "APIs"],
      xpReward: 400,
    },
    {
      id: "intermediate-2",
      title: "Social Media Analytics Dashboard",
      description: "Build a dashboard to track social media metrics across multiple platforms with real-time updates.",
      difficulty: "intermediate",
      duration: "10-12 hours",
      skills: ["React", "Real-time Data", "Charts", "API Integration"],
      xpReward: 450,
    },
    {
      id: "advanced-1",
      title: "Real-time Crypto Trading Dashboard",
      description: "Build an advanced dashboard with live cryptocurrency prices, trading charts, and portfolio management.",
      difficulty: "advanced",
      duration: "20-25 hours",
      skills: ["React", "WebSocket", "Advanced Charts", "State Management", "API Integration"],
      xpReward: 800,
    },
  ];

  const quickActions = [
    {
      icon: Zap,
      label: "Show Beginner Projects",
      color: "from-green-500 to-emerald-500",
      action: "beginner",
    },
    {
      icon: Target,
      label: "Show Intermediate Projects",
      color: "from-amber-500 to-orange-500",
      action: "intermediate",
    },
    {
      icon: Rocket,
      label: "Show Advanced Projects",
      color: "from-red-500 to-rose-500",
      action: "advanced",
    },
    {
      icon: Sparkles,
      label: "Show All Projects",
      color: "from-emerald-500 to-teal-500",
      action: "all",
    },
  ];

  const handleQuickAction = (action: string) => {
    let filteredProjects: ProjectRecommendation[] = [];
    let messageText = "";

    switch (action) {
      case "beginner":
        filteredProjects = projectRecommendations.filter((p) => p.difficulty === "beginner");
        messageText = "Show me beginner dashboard projects";
        break;
      case "intermediate":
        filteredProjects = projectRecommendations.filter((p) => p.difficulty === "intermediate");
        messageText = "Show me intermediate dashboard projects";
        break;
      case "advanced":
        filteredProjects = projectRecommendations.filter((p) => p.difficulty === "advanced");
        messageText = "Show me advanced dashboard projects";
        break;
      case "all":
        filteredProjects = projectRecommendations;
        messageText = "Show me all dashboard projects";
        break;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: `Great choice! Here are ${filteredProjects.length} ${action} dashboard projects I recommend for you. Each project is designed to help you build practical skills while earning XP! Click "Start Project" to begin your guided learning journey. 🚀`,
        timestamp: new Date(),
        projectRecommendations: filteredProjects,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const currentInput = inputMessage;
    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: currentInput,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    const lowerMessage = currentInput.toLowerCase();

    // Check for hardcoded intercept patterns first
    if (lowerMessage.includes("setup") || lowerMessage.includes("how to start") || lowerMessage.includes("guide") || lowerMessage.includes("step by step")) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "Here's a comprehensive step-by-step setup guide for building a Task Manager Dashboard project. Follow each step carefully! 📚",
          timestamp: new Date(),
          setupGuide: {
            projectName: "Task Manager Dashboard",
            steps: [
              {
                number: 1,
                title: "Create React Project",
                description: "Initialize a new React project using Vite for fast development.",
                code: "npm create vite@latest task-manager -- --template react\ncd task-manager\nnpm install",
                tips: ["Use Vite for faster build times", "Make sure Node.js 16+ is installed"],
              },
              {
                number: 2,
                title: "Install Required Dependencies",
                description: "Add Tailwind CSS and essential libraries for your project.",
                code: "npm install -D tailwindcss postcss autoprefixer\nnpx tailwindcss init -p\nnpm install lucide-react",
                tips: ["Lucide provides beautiful icons", "Tailwind makes styling easier"],
              },
              {
                 number: 3,
                 title: "Create Task State Management",
                 description: "Build the core state logic using React hooks.",
                 code: "const [tasks, setTasks] = useState([])\nconst [newTask, setNewTask] = useState('')\n\nconst addTask = () => {\n  if (!newTask.trim()) return\n  setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }])\n  setNewTask('')\n}",
                 tips: ["Use Date.now() for unique IDs", "Always validate input before adding tasks"],
              }
            ],
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    if (lowerMessage.includes("error") || lowerMessage.includes("bug") || lowerMessage.includes("debug") || lowerMessage.includes("fix my code")) {
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "assistant",
          content: "I can help you debug common issues! Here are solutions to the most frequent problems developers face when building dashboard projects. 🔧",
          timestamp: new Date(),
          debuggingHelp: {
            errorType: "Common Dashboard Issues",
            commonIssues: [
              {
                issue: "Tasks not saving to localStorage",
                solution: "Make sure you're using useEffect correctly and stringifying/parsing JSON data. Check browser console for quota errors.",
                code: "// ✅ Correct way\nuseEffect(() => {\n  localStorage.setItem('tasks', JSON.stringify(tasks))\n}, [tasks])",
              },
              {
                issue: "State not updating immediately",
                solution: "React state updates are asynchronous. Use the updated value in the next render or useEffect, not immediately after setState.",
                code: "// ❌ Wrong - won't show updated value\nsetTasks([...tasks, newTask])\nconsole.log(tasks) // Still shows old value!\n\n// ✅ Correct - use in next render or useEffect\nuseEffect(() => {\n  console.log(tasks) // Shows updated value\n}, [tasks])",
              },
            ],
          },
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    // Default: Hit real backend /api/ai/chat
    try {
      let contextStr = "User is asking for general AI assistance in their programming career.";
      if (eli5Mode) {
        contextStr += " ELI5 MODE IS ACTIVE: You MUST explain this concept as simply as possible, using relatable metaphors that a 5-year-old would understand. Break down hard terms. IMPORTANT: Heavily use EMOJIS (🚀, 💡, 🧩, etc) and visual symbols to make the explanation fun, engaging, and extremely easy to understand for the user.";
      }

      const assistantMsgId = (Date.now() + 1).toString();
      setMessages((prev) => [...prev, {
        id: assistantMsgId,
        type: "assistant",
        content: "",
        timestamp: new Date(),
      }]);

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          context: contextStr,
          role: role,
          stream: true,
        }),
      });

      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                streamedContent += data.content;
                setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, content: streamedContent } : m));
              }
            } catch(e) {}
          }
        }
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "Oops! AI is currently offline. Please try again later.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartProject = (_project: ProjectRecommendation) => {
    navigate("/dashboard");
  };

  const handleNewChat = () => {
    setCurrentChatId(Date.now().toString());
    setMessages([
      {
        id: "1",
        type: "assistant",
        content: `👋 Hi! I'm your FindStreak AI Learning Assistant. I can help you find the perfect projects to boost your skills for ${role}. Would you like me to recommend some guided dashboard projects?`,
        timestamp: new Date(),
      },
    ]);
    setInputMessage("");
    setShowHistoryDrawer(false);
  };


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700 border-green-200";
      case "intermediate": return "bg-amber-100 text-amber-700 border-amber-200";
      case "advanced": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const renderChatList = () => (
    <div className="space-y-1">
      {chatHistory.length === 0 && (
        <p className="text-xs text-slate-500 text-center py-4">No recent chats</p>
      )}
      {chatHistory.map(chat => (
        <div 
          key={chat.id}
          onClick={() => handleSwitchChat(chat.id)}
          className={`group flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors border max-w-full ${
            currentChatId === chat.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2 flex-1">
            <MessageSquare className={`w-4 h-4 shrink-0 ${currentChatId === chat.id ? 'text-emerald-600' : 'text-slate-400'}`} />
            {editingChatId === chat.id ? (
              <input
                autoFocus
                type="text"
                value={editingTitle}
                onClick={e => e.stopPropagation()}
                onChange={e => setEditingTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleRenameChat(e, chat.id);
                  if (e.key === 'Escape') setEditingChatId(null);
                }}
                className="flex-1 min-w-0 text-[13px] border-b border-emerald-500 focus:outline-none bg-transparent px-1 py-0.5 text-slate-800 shrink"
              />
            ) : (
              <span className={`text-[13px] truncate pt-0.5 w-[150px] ${currentChatId === chat.id ? 'text-emerald-900 font-medium' : 'text-slate-700'}`}>
                {chat.title}
              </span>
            )}
          </div>

          <div className="relative flex items-center shrink-0">
            {editingChatId === chat.id ? (
              <button onClick={(e) => handleRenameChat(e, chat.id)} className="p-1.5 hover:bg-emerald-100 rounded text-emerald-600 transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdownId(activeDropdownId === chat.id ? null : chat.id);
                }} 
                className={`p-1.5 rounded transition-colors ${activeDropdownId === chat.id ? 'bg-slate-200 text-slate-700' : 'hover:bg-slate-200 text-slate-400 xl:opacity-0 xl:group-hover:opacity-100'}`}
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Dropdown Menu */}
            {activeDropdownId === chat.id && !editingChatId && (
              <>
                <div className="fixed inset-0 z-40" onClick={(e) => { e.stopPropagation(); setActiveDropdownId(null); }} />
                <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50 overflow-hidden transform origin-top-right transition-all">
                  <button
                    onClick={(e) => { e.stopPropagation(); setEditingTitle(chat.title); setEditingChatId(chat.id); setActiveDropdownId(null); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Edit2 className="w-3 h-3" /> Rename
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteChat(e, chat.id); setActiveDropdownId(null); }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden">
      <Sidebar activePage="ai-assistant" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm flex-shrink-0">
        <div className="max-w-[1500px] mx-auto px-2 lg:px-6 py-2 md:py-3">
          <div className="flex items-center justify-between gap-1 md:gap-3">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-10 md:w-12 h-10 flex-shrink-0" /> {/* Spacer for system hamburger menu */}
              <div>
                <h1 className="text-base md:text-xl font-bold text-slate-900 flex items-center gap-1.5 md:gap-2">
                  <div className="w-6 h-6 md:w-7 md:h-7 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                    <Sparkles className="w-3 md:w-3.5 h-3 md:h-3.5 text-white" />
                  </div>
                  <span className="hidden sm:inline">FindStreak AI Learning Assistant</span>
                  <span className="sm:hidden">AI Assistant</span>
                </h1>
                <p className="hidden md:block text-slate-500 text-xs mt-0.5">Get personalized project recommendations, code fixes, and guidance</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 lg:gap-3">
              {/* Beautiful ELI5 Mode Toggle */}
              <button
                onClick={() => setEli5Mode(!eli5Mode)}
                className={`flex flex-col items-center justify-center p-2 sm:p-2.5 rounded-lg border transition-all shadow-sm ${eli5Mode ? 'bg-amber-100 border-amber-300 text-amber-600' : 'bg-white border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'}`}
                title="ELI5 Mode: Explain like I'm 5"
              >
                <Lightbulb className={`w-4 h-4 sm:w-5 sm:h-5 ${eli5Mode ? 'fill-current' : ''}`} />
              </button>

              <button 
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setShowLeftSidebar(!showLeftSidebar);
                  } else {
                    setShowHistoryDrawer(true);
                  }
                }} 
                className="flex items-center justify-center p-2 sm:p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm"
                title="History"
              >
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button onClick={handleNewChat} className="flex items-center justify-center p-2 sm:p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm" title="New Chat">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Projects Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowProjectsDropdown(!showProjectsDropdown)} 
                  className="flex items-center justify-center p-2 sm:p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm"
                  title="Projects"
                >
                  <Code className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                </button>
                {showProjectsDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowProjectsDropdown(false)} />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                      <div className="px-4 pb-2 mb-2 border-b border-slate-100">
                        <p className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1.5"><Code className="w-3.5 h-3.5"/> Project Collections</p>
                      </div>
                      {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                          <button 
                            key={index} 
                            onClick={() => {
                              handleQuickAction(action.action);
                              setShowProjectsDropdown(false);
                            }} 
                            className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-3 transition-colors group"
                          >
                            <div className={`w-7 h-7 rounded flex items-center justify-center bg-gradient-to-r ${action.color} shadow-sm shrink-0 group-hover:scale-110 transition-transform`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>

              {/* Roadmap */}
              <button 
                onClick={() => navigate('/roadmap')} 
                className="hidden md:flex flex-col items-center justify-center p-2 sm:p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all shadow-sm"
                title="Learning Roadmap"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </button>

              <button onClick={() => navigate('/resources')} className="hidden md:flex items-center justify-center p-2 sm:p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm" title="Resources">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </button>

              <button onClick={() => navigate('/missions')} className="hidden md:flex items-center justify-center p-2 sm:p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all shadow-sm" title="Challenge">
                <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </button>

              <button onClick={() => setShowSettingsModal(true)} className="flex items-center justify-center p-2 sm:p-2.5 bg-white border border-slate-300 text-slate-600 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm" title="Settings">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 flex-1 flex flex-col w-full min-h-0">
        <div className={`flex flex-col lg:grid gap-4 lg:gap-6 flex-1 min-h-0 ${showLeftSidebar ? 'lg:grid-cols-[260px_1fr]' : 'lg:grid-cols-1'}`}>
          
          {/* Left Sidebar - Chat History */}
          {showLeftSidebar && (
            <div className="hidden lg:flex flex-col gap-4 min-h-0 h-full w-[260px] animate-in slide-in-from-left duration-300 ease-in-out">
            <div className="bg-white/80 rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1 overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-900">Chat History</h3>
                </div>
              </div>
              <div className="p-2 overflow-y-auto flex-1">
                {renderChatList()}
              </div>
            </div>
            </div>
          )}

          {/* Chat Interface */}
          <div className="flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative min-h-0 h-full">
            {eli5Mode && (
              <div className="flex items-center justify-center gap-2 shrink-0 bg-amber-100 text-amber-800 text-xs font-bold py-2 px-4 text-center shadow-sm border-b border-amber-200">
                <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-500" />
                ELI5 Mode Active: AI will explain everything using simple, easy-to-understand metaphors!
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-2.5 md:p-6 space-y-4 md:space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === "assistant" ? (
                    <div className="flex gap-2 md:gap-3">
                      <div className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-3.5 md:px-5 py-2.5 md:py-4 max-w-[95%] text-slate-800 text-sm leading-relaxed shadow-sm overflow-hidden overflow-x-auto">
                          <ReactMarkdown 
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-xl font-bold text-slate-900 mt-4 mb-2 border-b border-slate-200 pb-1" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-lg font-bold text-slate-900 mt-4 mb-2" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-base font-bold text-slate-900 mt-4 mb-2" {...props} />,
                              p: ({node, ...props}) => <p className="mb-3 last:mb-0" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-3 space-y-1 marker:text-emerald-500" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-3 space-y-1 marker:text-emerald-500 font-medium" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              a: ({node, ...props}) => <a className="text-emerald-600 font-semibold hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-400 bg-emerald-50 p-3 rounded-r-lg my-3 italic text-slate-700" {...props} />,
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline ? (
                                  <div className="my-3 rounded-lg overflow-hidden border border-slate-800 bg-slate-900 shadow-sm w-full">
                                    <div className="flex items-center px-3 py-1.5 bg-slate-950 border-b border-slate-800">
                                      <Terminal className="w-3.5 h-3.5 text-slate-400 mr-2" />
                                      <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{match?.[1] || 'code'}</span>
                                    </div>
                                    <div className="p-3 overflow-x-auto">
                                      <pre className="text-xs text-emerald-400 font-mono leading-relaxed relative" {...props}>
                                        <code className={className}>
                                          {children}
                                        </code>
                                      </pre>
                                    </div>
                                  </div>
                                ) : (
                                  <code className="bg-slate-100 text-pink-600 border border-slate-200 px-1 py-0.5 rounded text-[13px] font-mono break-words" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>

                        {message.projectRecommendations && (
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mr-4">
                            {message.projectRecommendations.map((project) => (
                              <div key={project.id} className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 transition-all p-4 shadow-sm group cursor-pointer" onClick={() => handleStartProject(project)}>
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-bold text-slate-900 group-hover:text-emerald-700 flex-1 truncate">{project.title}</h4>
                                </div>
                                <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-2 ${getDifficultyColor(project.difficulty)}`}>
                                  {project.difficulty}
                                </span>
                                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{project.description}</p>
                                <div className="flex items-center justify-between text-xs font-medium pt-3 border-t border-slate-100">
                                  <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3.5 h-3.5" /> {project.duration}</span>
                                  <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded"><Star className="w-3 h-3 fill-emerald-500 text-emerald-500" /> {project.xpReward} XP</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {message.setupGuide && (
                          <div className="mt-4 bg-slate-50 rounded-xl border border-slate-200 p-5 max-w-[95%]">
                            <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                              <FileCode className="w-5 h-5 text-emerald-600" />
                              {message.setupGuide.projectName} - Setup Guide
                            </h3>
                            <div className="space-y-4">
                              {message.setupGuide.steps.map((step) => (
                                <div key={step.number} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
                                  <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">{step.number}</span>
                                    {step.title}
                                  </h4>
                                  <p className="text-sm text-slate-600 mb-3 pl-8">{step.description}</p>
                                  {step.code && (
                                    <div className="ml-8 bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                      <pre className="text-xs text-emerald-400 font-mono">{step.code}</pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {message.debuggingHelp && (
                          <div className="mt-4 bg-orange-50 rounded-xl border border-orange-200 p-5 max-w-[95%]">
                            <h3 className="font-bold text-lg text-orange-900 mb-4 flex items-center gap-2">
                              <Wrench className="w-5 h-5 text-orange-600" />
                              {message.debuggingHelp.errorType}
                            </h3>
                            <div className="space-y-4">
                              {message.debuggingHelp.commonIssues.map((issue, idx) => (
                                <div key={idx} className="bg-white rounded-xl border border-orange-100 p-4 shadow-sm">
                                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-orange-500" />
                                    {issue.issue}
                                  </h4>
                                  <p className="text-sm text-slate-600 mb-3 pl-6 border-l-2 border-orange-200 ml-2">{issue.solution}</p>
                                  {issue.code && (
                                    <div className="ml-6 bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                      <pre className="text-xs text-emerald-400 font-mono">{issue.code}</pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-[10px] text-slate-400 mt-2 font-medium ml-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2 md:gap-3 justify-end">
                      <div className="flex-1 flex justify-end min-w-0">
                        <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-3.5 md:px-5 py-2.5 md:py-4 max-w-[85%] text-sm shadow-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                        <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2 md:gap-3">
                  <div className="flex-shrink-0 w-7 h-7 md:w-9 md:h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm flex items-center gap-1.5 w-16 h-12">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }}></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Bottom 3 Cards matching Uploaded Screenshot exactly */}
            <div className="shrink-0 border-t border-slate-100 bg-white">
              {messages.length <= 1 && inputMessage.trim() === "" && (
              <div className="px-3 md:px-4 py-2.5 md:py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 max-w-[1000px] mx-auto">
                  
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group" onClick={() => { setInputMessage("Can you give me some project ideas?"); handleSendMessage(); }}>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#e8fbf0] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Code className="w-4 h-4 md:w-5 md:h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-[13px] leading-tight group-hover:text-emerald-700 transition-colors">Project Ideas</p>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5">Get suggestions</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group" onClick={() => navigate('/resources')}>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-[13px] leading-tight group-hover:text-blue-700 transition-colors">Resources</p>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5">Best materials</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group" onClick={() => { setInputMessage("How do I prepare for technical interviews?"); handleSendMessage(); }}>
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-[#fae8ff] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Zap className="w-4 h-4 md:w-5 md:h-5 text-[#d946ef]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs md:text-[13px] leading-tight group-hover:text-purple-700 transition-colors">Interview Prep</p>
                      <p className="text-[10px] md:text-[11px] text-slate-500 mt-0.5">Get ready</p>
                    </div>
                  </div>

                </div>
              </div>
              )}

              {/* Input Box */}
              <div className="border-t border-slate-200 bg-slate-50 p-2.5 md:p-4">
                <div className="flex gap-2 max-w-[1000px] mx-auto">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={eli5Mode ? "Ask me anything (ELI5)..." : "Ask me anything..."}
                    className="flex-1 px-3 md:px-4 py-2.5 md:py-3 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all text-xs md:text-sm shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-4 md:px-5 py-2.5 md:py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-400 transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface End */}
        </div>
      </div>
      


      {/* Mobile Chat History Drawer */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 bg-black/50 flex lg:hidden z-[60] backdrop-blur-sm" onClick={() => setShowHistoryDrawer(false)}>
          <div className="bg-white w-80 h-full max-w-full flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600"/> Chat History
              </h3>
              <button onClick={() => setShowHistoryDrawer(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-600"/>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
               {renderChatList()}
            </div>
            <div className="p-4 border-t border-slate-200 shrink-0">
               <button onClick={handleNewChat} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-colors">
                 <Plus className="w-4 h-4" /> New Chat
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" /> Chat Settings
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Clear All History</h4>
                    <p className="text-xs text-slate-500">Permanently delete all chat sessions.</p>
                  </div>
                  <button onClick={() => { setChatHistory([]); setMessages([]); showToast("All chat history cleared! 🗑️"); setShowSettingsModal(false); }} className="px-3 py-1.5 bg-red-100 text-red-600 font-bold text-xs rounded-lg hover:bg-red-200 transition-colors">Clear</button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">Export Data</h4>
                    <p className="text-xs text-slate-500">Download all your chat history.</p>
                  </div>
                  <button onClick={() => {
                      const blob = new Blob([JSON.stringify(chatHistory, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "FindStreak_Chat_Backup.json";
                      a.click();
                      showToast("Data exported successfully! 📦");
                  }} className="px-3 py-1.5 bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg hover:bg-emerald-200 transition-colors">Export</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[70] bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-opacity duration-300 border border-slate-700">
          <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 rounded-full shrink-0">
             <Check className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-semibold text-sm">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}


