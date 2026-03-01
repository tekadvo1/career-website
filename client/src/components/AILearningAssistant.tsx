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
  Download,
  FileText,
  Gamepad2,
  MessageSquare,
  Edit2,
  Trash2,
  Check,
} from "lucide-react";

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

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "assistant",
      content:
        `👋 Hi! I'm your FindStreak AI Learning Assistant. I can help you find the perfect projects to boost your skills for ${role}. Would you like me to recommend some guided dashboard projects?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [showGameModal, setShowGameModal] = useState(false);
  const [eli5Mode, setEli5Mode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // -- Chat History State --
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>("1");
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

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
        contextStr += " ELI5 MODE IS ACTIVE: You MUST explain this concept as simply as possible, using relatable metaphors that a 5-year-old would understand. Break down hard terms.";
      }

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          context: contextStr,
          role: role,
        }),
      });

      const data = await res.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: data.reply || "I couldn't process that right now.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
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

          <div className="flex items-center gap-1 xl:opacity-0 xl:group-hover:opacity-100 transition-opacity shrink-0">
            {editingChatId === chat.id ? (
              <button onClick={(e) => handleRenameChat(e, chat.id)} className="p-1.5 hover:bg-emerald-100 rounded text-emerald-600 transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingTitle(chat.title); setEditingChatId(chat.id); }} 
                className="p-1.5 hover:bg-blue-100 rounded text-blue-600 transition-colors"
                title="Rename Chat"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button 
              onClick={(e) => handleDeleteChat(e, chat.id)} 
              className="p-1.5 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="Delete Chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Sidebar activePage="ai-assistant" />

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm flex-shrink-0">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex-shrink-0" /> {/* Spacer for system hamburger menu */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  AI Learning Assistant
                </h1>
                <p className="text-slate-500 text-sm mt-0.5">Get personalized project recommendations, code fixes, and guidance</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:gap-3">
              {/* Beautiful ELI5 Mode Toggle */}
              <div 
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border cursor-pointer select-none transition-all shadow-sm ${eli5Mode ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
                onClick={() => setEli5Mode(!eli5Mode)}
              >
                <div className={`p-1.5 rounded-md ${eli5Mode ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-500'}`}>
                   <Lightbulb className="w-4 h-4 fill-current" />
                </div>
                <div className="flex flex-col mr-2">
                  <span className={`text-[11px] font-bold leading-none ${eli5Mode ? 'text-amber-800' : 'text-slate-500'}`}>ELI5 Mode</span>
                  <span className={`text-[9px] font-semibold uppercase leading-tight ${eli5Mode ? 'text-amber-600' : 'text-slate-400'}`}>{eli5Mode ? 'Active' : 'Off'}</span>
                </div>
                {/* Switch Graphic */}
                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-300 ${eli5Mode ? 'bg-amber-500' : 'bg-slate-300'}`}>
                   <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${eli5Mode ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </div>

              <button onClick={() => setShowHistoryDrawer(true)} className="flex lg:hidden items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-slate-400 hover:bg-slate-50 transition-all shadow-sm">
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm hidden sm:block">History</span>
              </button>

              <button onClick={handleNewChat} className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm">
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:block">New Chat</span>
              </button>

              <button onClick={() => setShowResourcesModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 transition-all shadow-sm">
                <BookOpen className="w-4 h-4" />
                <span className="text-sm hidden sm:block">Resources</span>
              </button>

              <button onClick={() => setShowGameModal(true)} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all shadow-sm">
                <Gamepad2 className="w-4 h-4 text-purple-600" />
                <span className="text-sm hidden sm:block">Challenge</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 flex-1 flex flex-col w-full min-h-[calc(100vh-100px)]">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 flex-1">
          
          {/* Left Sidebar - Quick Actions */}
          <div className="hidden lg:flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">Project Collections</h3>
              </div>
              <div className="space-y-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <button key={index} onClick={() => handleQuickAction(action.action)} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all group">
                      <div className={`w-8 h-8 bg-gradient-to-r ${action.color} rounded-md flex items-center justify-center flex-shrink-0 shadow-sm`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="flex-1 text-left text-sm font-semibold text-slate-700 group-hover:text-emerald-700">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-slate-700 p-5 shrink-0 relative overflow-hidden text-white">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
               <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-slate-200">Your Learning Streak</h3>
                </div>
                <div className="flex items-end gap-2 text-white">
                  <p className="text-4xl font-black text-emerald-400 leading-none">3</p>
                  <p className="text-lg font-bold pb-0.5">Days</p>
                  <FlameIcon className="w-8 h-8 text-orange-500 fill-orange-500 animate-pulse mb-0.5 ml-1" />
                </div>
                <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                   <div className="w-3/5 bg-gradient-to-r from-emerald-400 to-teal-400 h-full rounded-full"></div>
                </div>
                <p className="text-[11px] text-slate-400 mt-2">Chat daily to keep your streak alive! 2 days until next milestone.</p>
              </div>
            </div>

            <div className="bg-white/80 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[200px] flex-1 overflow-hidden mt-2">
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

          {/* Chat Interface */}
          <div className="lg:col-span-3 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden relative">
            {eli5Mode && (
              <div className="flex items-center justify-center gap-2 shrink-0 bg-amber-100 text-amber-800 text-xs font-bold py-2 px-4 text-center shadow-sm border-b border-amber-200">
                <Lightbulb className="w-4 h-4 fill-amber-500 text-amber-500" />
                ELI5 Mode Active: AI will explain everything using simple, easy-to-understand metaphors!
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.type === "assistant" ? (
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm px-4 md:px-5 py-3 md:py-4 max-w-[95%] text-slate-800 text-sm whitespace-pre-wrap leading-relaxed shadow-sm">
                          {message.content}
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
                    <div className="flex gap-3 justify-end">
                      <div className="flex-1 flex justify-end min-w-0">
                        <div className="bg-emerald-600 text-white rounded-2xl rounded-tr-sm px-4 md:px-5 py-3 md:py-4 max-w-[85%] text-sm shadow-sm whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                      <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 md:w-9 md:h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                    <Sparkles className="w-4 h-4 text-white" />
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
              <div className="px-4 py-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-[1000px] mx-auto">
                  
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2.5 hover:border-emerald-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group" onClick={() => { setInputMessage("Can you give me some project ideas?"); handleSendMessage(); }}>
                    <div className="w-10 h-10 bg-[#e8fbf0] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Code className="w-5 h-5 text-[#10b981]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-emerald-700 transition-colors">Project Ideas</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Get suggestions</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2.5 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group" onClick={() => setShowResourcesModal(true)}>
                    <div className="w-10 h-10 bg-[#eff6ff] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <BookOpen className="w-5 h-5 text-[#3b82f6]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-blue-700 transition-colors">Resources</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Best materials</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2.5 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer flex items-center gap-3 group" onClick={() => { setInputMessage("How do I prepare for technical interviews?"); handleSendMessage(); }}>
                    <div className="w-10 h-10 bg-[#fae8ff] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                      <Zap className="w-5 h-5 text-[#d946ef]" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-[13px] leading-tight group-hover:text-purple-700 transition-colors">Interview Prep</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">Get ready</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Input Box */}
              <div className="border-t border-slate-200 bg-slate-50 p-3 md:p-4">
                <div className="flex gap-2 max-w-[1000px] mx-auto">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder={eli5Mode ? "Ask me anything (I'll explain simply!)..." : "Ask me anything about your learning journey..."}
                    className="flex-1 px-4 py-3 bg-white border border-slate-300 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all text-sm shadow-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="px-5 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 disabled:opacity-50 disabled:bg-slate-400 transition-colors flex items-center gap-2 shadow-sm shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Resources Modal */}
      {showResourcesModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Learning Resources</h2>
                  <p className="text-sm text-slate-500">Curated materials to accelerate your growth</p>
                </div>
              </div>
              <button onClick={() => setShowResourcesModal(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {[
                { title: "React Architecture Patterns", description: "Design scalable and maintainable React applications.", size: "4.2 MB", type: "PDF", icon: FileText, color: "from-blue-500 to-cyan-500" },
                { title: "Node.js API Mastery", description: "Build robust backend architectures with Node.js.", size: "3.8 MB", type: "PDF", icon: Code, color: "from-emerald-500 to-teal-500" },
                { title: "System Design for Beginners", description: "Learn how to approach complex engineering problems.", size: "5.1 MB", type: "PDF", icon: FileCode, color: "from-purple-500 to-pink-500" },
              ].map((resource, idx) => {
                const Icon = resource.icon;
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group bg-slate-50 hover:bg-white">
                    <div className={`w-14 h-14 bg-gradient-to-r ${resource.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 mb-1 leading-tight">{resource.title}</h3>
                      <p className="text-xs text-slate-500 mb-2">{resource.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded uppercase">{resource.type}</span>
                        <span className="text-slate-400">{resource.size}</span>
                      </div>
                    </div>
                    <button className="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-lg font-bold hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 text-sm w-full sm:w-auto shadow-sm">
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Game Modal */}
      {showGameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60] backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Coding Daily Challenge</h2>
                  <p className="text-sm text-purple-100 font-medium">Test your skills and earn XP!</p>
                </div>
              </div>
              <button onClick={() => setShowGameModal(false)} className="p-2 hover:bg-white/20 rounded-lg transition-colors border border-white/20">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6">
              <div className="border border-slate-200 bg-white rounded-xl p-6 mb-6 shadow-sm">
                <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-black rounded uppercase border border-green-200">
                    Difficulty: Easy
                  </span>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-black bg-emerald-50 px-3 py-1 rounded border border-emerald-100">
                    <Star className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                    +100 XP
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Challenge: Fix the Bug! 🐛</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">The code below is supposed to display a greeting, but it's throwing an error. Can you spot the issue?</p>

                <div className="bg-slate-900 rounded-lg p-4 mb-5 shadow-inner">
                  <pre className="text-sm text-emerald-400 font-mono leading-relaxed overflow-x-auto">
{`function greetUser() {
  const message = "Hello, Developer!"
  console.log(mesage) // Line 3
}

greetUser()`}
                  </pre>
                </div>

                <div className="space-y-3">
                  <button className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 text-left rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all font-medium text-sm text-slate-700 group shadow-sm">
                    <span className="font-bold text-slate-900 group-hover:text-purple-700 w-8 inline-block">A.</span> Missing semicolon on line 2
                  </button>
                  <button className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 text-left rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all font-medium text-sm text-slate-700 group shadow-sm">
                    <span className="font-bold text-slate-900 group-hover:text-purple-700 w-8 inline-block">B.</span> Variable typo: "mesage" should be "message"
                  </button>
                  <button className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 text-left rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all font-medium text-sm text-slate-700 group shadow-sm">
                    <span className="font-bold text-slate-900 group-hover:text-purple-700 w-8 inline-block">C.</span> Function is not exported
                  </button>
                  <button className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 text-left rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all font-medium text-sm text-slate-700 group shadow-sm">
                    <span className="font-bold text-slate-900 group-hover:text-purple-700 w-8 inline-block">D.</span> Missing return statement
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-sm text-sm">
                  Submit Final Answer
                </button>
                <button onClick={() => setShowGameModal(false)} className="w-full sm:w-auto px-6 py-3.5 bg-white border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors shadow-sm text-sm">
                  Skip Challenge
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
    </div>
  );
}

// Quick component for flame icon
function FlameIcon(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  );
}
