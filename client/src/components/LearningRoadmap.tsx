import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, Target, Download, Sparkles, CheckCircle2, Circle, ArrowRight,
  BookOpen, Code, Trophy, Zap, MessageSquare, Menu, X, User,
  BarChart3, LayoutDashboard, Award, Flame, ChevronRight, RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';

// --- Interfaces ---
interface Resource {
  name: string;
  url: string;
  type: string;
  is_free?: boolean;
}

interface Project {
  id?: string;
  title?: string;
  name?: string;
  description: string;
  difficulty: string;
  duration?: string;
  matchScore?: number;
  tags?: string[];
  trending?: boolean;
  languages?: string[];
  tools?: string[];
}

interface TopicResource {
    name: string;
    url: string;
    type: string;
    is_free: boolean;
}

interface DetailedTopic {
    name: string;
    emoji?: string;
    description: string;
    practical_application?: string;
    subtopics: string[];
    topic_resources: TopicResource[];
}

interface RoadmapPhase {
  id?: string;
  title?: string; // from mock data
  phase?: string; // from api
  level?: string; // from mock
  difficulty?: string; // from api
  duration: string;
  category?: string;
  description?: string;
  topics?: (string | DetailedTopic)[]; // from api
  skills?: string[]; // from mock
  skills_covered?: string[]; 
  milestones?: string[]; // from mock
  step_by_step_guide?: string[]; // from api
  resources?: Resource[];
  projects: (string | Project)[]; 
  completed?: boolean;
}

// Inline UI Components for styling portability
const Button = ({ children, className = '', variant = 'default', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 h-9 px-4 py-2";
  const variants = {
    default: "bg-slate-900 text-slate-50 hover:bg-slate-900/90",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900",
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.default} ${className}`} {...props}>{children}</button>;
};

const Card = ({ children, className = '', ...props }: any) => {
  return <div className={`rounded-xl border border-slate-200 bg-white text-slate-950 shadow-sm ${className}`} {...props}>{children}</div>;
};

const Badge = ({ children, className = '', variant = 'default', ...props }: any) => {
  const baseStyle = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none";
  const variants = {
    default: "bg-slate-900 text-slate-50",
    secondary: "bg-slate-100 text-slate-900",
    destructive: "bg-red-500 text-slate-50",
  };
  return <div className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.default} ${className}`} {...props}>{children}</div>;
};

const Progress = ({ value, className = '', ...props }: any) => {
  return (
    <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${className}`} {...props}>
      <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{width: `${Math.min(100, Math.max(0, value || 0))}%`}}/>
    </div>
  );
};

const DEFAULT_ROADMAP: RoadmapPhase[] = [
    {
        phase: "Foundations",
        duration: "4 weeks",
        difficulty: "Beginner",
        category: "Foundations",
        description: "Focus on how computers work, algorithms, and data structures.",
        topics: [
            {
                name: "Algorithms & Logic",
                emoji: "🧠",
                description: "The building blocks of programming.",
                subtopics: ["Big O Notation", "Sorting", "Recursion", "Memory Management"],
                topic_resources: []
            },
            {
                name: "Basic Syntax",
                emoji: "💻",
                description: "Variables, loops, and conditioned statements.",
                subtopics: ["If/Else flows", "For/While loops", "Functions"],
                topic_resources: []
            }
        ],
        step_by_step_guide: [
            "Complete CS50 or basic programming course", 
            "Solve 20 beginner problems",
        ],
        projects: [
            { name: "CLI Task Manager", description: "Build a command-line to-do list.", difficulty: "Beginner" }
        ],
    },
    {
        phase: "Core Frameworks & Tools",
        duration: "6 weeks",
        difficulty: "Intermediate",
        category: "Deep Dive",
        description: "Focus on understanding industry-standard frameworks, source control, and APIs.",
        topics: [
            {
                name: "Version Control",
                emoji: "🌳",
                description: "Managing code changes effectively.",
                subtopics: ["Git workflows", "Branching & Merging", "Pull Requests"],
                topic_resources: []
            },
            {
                name: "Web APIs",
                emoji: "🔌",
                description: "Connecting clients to servers.",
                subtopics: ["REST vs GraphQL", "Authentication (JWT)", "Rate Limiting"],
                topic_resources: []
            }
        ],
        step_by_step_guide: [
            "Build a fully functioning CRUD application", 
            "Deploy your code to a live server",
        ],
        projects: [
            { name: "Full-stack Social App", description: "A simple user timeline and post app.", difficulty: "Intermediate" }
        ],
    },
    {
        phase: "System Architecture & Scale",
        duration: "8 weeks",
        difficulty: "Advanced",
        category: "Architecture",
        description: "Focus on designing highly available, performant systems.",
        topics: [
            {
                name: "System Design",
                emoji: "🏗️",
                description: "Architecting large scale applications.",
                subtopics: ["Load Balancing", "Caching (Redis)", "Message Queues"],
                topic_resources: []
            },
            {
                name: "DevOps & CI/CD",
                emoji: "⚙️",
                description: "Automating deployments and tests.",
                subtopics: ["Docker & Kubernetes", "GitHub Actions", "Monitoring"],
                topic_resources: []
            }
        ],
        step_by_step_guide: [
            "Draw a system architecture diagram for a system with 1 million users", 
            "Set up an automated deployment pipeline for a microservice",
        ],
        projects: [
            { name: "Microservice E-commerce Shop", description: "Distributed shop with cart queues.", difficulty: "Advanced" }
        ],
    }
];

// Generate recommended practice projects like in the prompt
const generateRecommendedProjects = (_role: string, hasResume: boolean): Project[] => {
  const projects: Project[] = [
    {
      id: "1",
      title: "Real-time Chat Application",
      description: "Build a full-stack real-time chat application with user authentication, message history, and typing indicators.",
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      matchScore: hasResume ? 97 : 94,
      tags: ["Real-time", "Full-stack", "WebSocket"],
      trending: true,
      languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
      tools: ["VS Code", "Postman", "MongoDB Compass", "Chrome DevTools"],
    },
    {
      id: "2",
      title: "E-commerce Dashboard with Analytics",
      description: "Create an admin dashboard for e-commerce with sales analytics, inventory management, and data visualization.",
      difficulty: "Advanced",
      duration: "3-4 weeks",
      matchScore: hasResume ? 95 : 92,
      tags: ["Dashboard", "Analytics", "Data Viz"],
      trending: true,
      languages: ["JavaScript", "TypeScript", "SQL"],
      tools: ["Figma", "VS Code", "Recharts", "Postman"],
    },
    {
      id: "3",
      title: "Task Management App with Drag & Drop",
      description: "Build a Kanban-style task management application with drag-and-drop functionality, filters, and team collaboration.",
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      matchScore: hasResume ? 93 : 90,
      tags: ["Productivity", "Drag & Drop", "Kanban"],
      trending: false,
      languages: ["JavaScript", "TypeScript"],
      tools: ["VS Code", "React DnD", "Chrome DevTools"],
    },
    {
      id: "4",
      title: "AI-Powered Recipe Finder",
      description: "Create a recipe discovery app that uses AI to recommend recipes based on available ingredients and dietary preferences.",
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      matchScore: hasResume ? 91 : 88,
      tags: ["AI", "API Integration", "Search"],
      trending: true,
      languages: ["JavaScript", "TypeScript"],
      tools: ["VS Code", "OpenAI API", "Postman"],
    },
  ];

  return projects.slice(0, 4); // Return top 4 recommendations
};

export default function LearningRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialRole = location.state?.role || "Software Engineer";
  const hasResume = location.state?.hasResume || false;

  const [role, setRole] = useState(initialRole);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  
  // Real-time tracking state
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  
  // Feature flags / Modals
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showSidebar, setShowSidebar] = useState(false);

  const [recommendedProjects] = useState<Project[]>(generateRecommendedProjects(role, hasResume));
  const contentRef = useRef<HTMLDivElement>(null);

  // Initialize
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setLoadingProgress(0);
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 98) return 98; // Hold at 98% until actually complete
          return prev + 1; // 1% roughly every 600ms = ~60s
        });
      }, 600);
    } else {
      setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load progress
      const savedProgress = localStorage.getItem(`roadmap_progress_${role}`);
      if (savedProgress) {
          try { setCompletedTopics(new Set(JSON.parse(savedProgress))); } catch (e) {}
      }

      try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
              const user = JSON.parse(userStr);
              fetch(`/api/role/progress?role=${encodeURIComponent(role)}&userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.completedTopics)) {
                        setCompletedTopics(new Set(data.completedTopics));
                    }
                }).catch(e => console.error(e));
          }
      } catch (e) {}

      // Load Roadmap Data
      let analysis = location.state?.analysis;
      let targetRole = location.state?.role || role;

      if (!analysis || !analysis.roadmap) {
         try {
           const saved = localStorage.getItem('lastRoleAnalysis');
           if (saved) {
             const parsed = JSON.parse(saved);
             if (parsed.role === targetRole || parsed.role) {
                analysis = parsed.analysis;
                targetRole = parsed.role;
                setRole(targetRole);
             }
           }
         } catch (e) {}
      }

      if (analysis && analysis.roadmap && Array.isArray(analysis.roadmap)) {
         setRoadmap(analysis.roadmap);
         setIsLoading(false);
      } else {
         console.log("Fetching fresh roadmap for:", targetRole);
         try {
           const userStr = localStorage.getItem('user');
           const user = userStr ? JSON.parse(userStr) : {};
           const response = await fetch('/api/role/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: targetRole, userId: user.id || null })
           });
           
           if (response.ok) {
             const data = await response.json();
             if (data.data && data.data.roadmap) {
               setRoadmap(data.data.roadmap);
               localStorage.setItem('lastRoleAnalysis', JSON.stringify({
                 role: targetRole,
                 analysis: data.data,
                 timestamp: new Date().getTime()
               }));
             } else {
                setRoadmap(DEFAULT_ROADMAP); 
             }
            } else {
              setRoadmap(DEFAULT_ROADMAP);
            }
          } catch (err) {
            console.error("Failed to fetch roadmap", err);
            setRoadmap(DEFAULT_ROADMAP);
         } finally {
           setIsLoading(false);
         }
      }
    };

    loadData();
  }, [location.state, role, navigate]);

  useEffect(() => {
    localStorage.setItem(`roadmap_progress_${role}`, JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics, role]);

  const toggleTopicCompletion = async (topicName: string) => {
      const isCompleted = !completedTopics.has(topicName);
      setCompletedTopics(prev => {
          const newSet = new Set(prev);
          if (isCompleted) newSet.add(topicName);
          else newSet.delete(topicName);
          return newSet;
      });

      try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
             const user = JSON.parse(userStr);
             fetch('/api/role/progress', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     userId: user.id, role: role, topicName: topicName, isCompleted: isCompleted
                 })
             }).catch(err => console.error("Sync failed", err));
          }
      } catch (error) {}
  };

  const selectedPhase = roadmap[selectedPhaseIndex] || null;

  // Calculators
  const totalWeeks = roadmap.reduce((acc, phase) => {
    const dur = phase.duration || "0";
    const nums = dur.match(/\d+/g);
    let val = 0;
    if (nums && nums.length > 0) val = parseInt(nums[nums.length - 1]);
    if (dur.toLowerCase().includes('month')) val *= 4;
    return acc + val;
  }, 0);

  const getPhaseCompletion = (phase: RoadmapPhase) => {
      const topicsList = phase.topics || phase.skills || [];
      if (!topicsList || topicsList.length === 0) return false;
      return topicsList.every(t => {
          const name = typeof t === 'string' ? t : t.name;
          return completedTopics.has(name);
      });
  };

  const completedPhases = roadmap.filter(getPhaseCompletion).length;
  const progressPercentage = roadmap.length > 0 ? (completedPhases / roadmap.length) * 100 : 0;

  const handleDownloadRoadmap = () => {
    const pdf = new jsPDF();
    const margin = 20;
    let yPosition = margin;

    pdf.setFontSize(20);
    pdf.text(`Learning Roadmap: ${role}`, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.text(`Total Duration: ~${totalWeeks} weeks`, margin, yPosition);
    yPosition += 10;

    roadmap.forEach((phase, index) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 60) {
        pdf.addPage();
        yPosition = margin;
      }
      
      const pTitle = phase.title || phase.phase || '';
      pdf.setFontSize(14);
      pdf.text(`Phase ${index + 1}: ${pTitle}`, margin, yPosition);
      yPosition += 7;

      pdf.setFontSize(10);
      pdf.text(`Level: ${phase.level || phase.difficulty} | Duration: ${phase.duration}`, margin + 5, yPosition);
      yPosition += 7;

      const topics = phase.topics || phase.skills || [];
      if (topics.length > 0) {
        pdf.text("Topics/Skills:", margin + 5, yPosition);
        yPosition += 5;
        topics.forEach((t) => {
          const name = typeof t === 'string' ? t : t.name;
          pdf.text(`  • ${name}`, margin + 10, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }

      if (phase.projects && phase.projects.length > 0) {
          pdf.text("Projects:", margin + 5, yPosition);
          yPosition += 5;
          phase.projects.forEach((proj) => {
            const pName = typeof proj === 'string' ? proj : (proj.name || proj.title || 'Project');
            pdf.text(`  • ${pName}`, margin + 10, yPosition);
            yPosition += 5;
          });
      }
      yPosition += 8;
    });

    pdf.save(`${role.replace(/\s+/g, "_")}_Roadmap.pdf`);
  };

  const handleRefreshRoadmap = async () => {
    setIsLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const response = await fetch('/api/role/analyze', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ role: role, userId: user.id || null, forceRefresh: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.roadmap) {
          setRoadmap(data.data.roadmap);
          localStorage.setItem('lastRoleAnalysis', JSON.stringify({
            role: role,
            analysis: data.data,
            timestamp: new Date().getTime()
          }));
        }
      }
    } catch (err) {
      console.error("Failed to refresh roadmap", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAIAssistant = () => {
    navigate("/ai-assistant", { state: { role, roadmap } });
  };

  const handleOpenAIGuideForTopic = (e: React.MouseEvent, topicName: string, subtopics: string[] | null) => {
    e.stopPropagation();
    navigate("/roadmap-guide", { 
        state: { 
            role, 
            topicName,
            subtopics: subtopics || [],
            roadmap 
        } 
    });
  };

  if (isLoading || loadingProgress < 100) {
    // If backend returns faster, we allow progress bar to immediately zip to 100% by hiding UI at 100
    if (!isLoading && loadingProgress === 100) {
        // Dropthrough and render main
    } else {
        return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-xl text-center border border-slate-200">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                   <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Analyzing Profile...</h2>
                <p className="text-sm text-slate-500 mb-6">Our AI is designing a perfect, personalized roadmap. This takes about a minute.</p>
                
                <div className="mb-2 flex justify-between text-xs font-semibold">
                   <span className="text-emerald-700">Generating curriculum</span>
                   <span className="text-slate-600">{loadingProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                   <div 
                     className="bg-emerald-500 h-full rounded-full transition-all duration-300 ease-out" 
                     style={{ width: `${loadingProgress}%` }}
                   />
                </div>
                <p className="text-[10px] text-slate-400 font-medium italic">Pulling the absolute latest industry data...</p>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-5">
      {/* Sidebar Navigation Menu */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowSidebar(false)}>
          <div
            className="absolute left-0 top-0 h-full w-[280px] sm:w-80 bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 sm:p-6 border-b border-slate-200 flex-shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">FindStreak</h2>
                </div>
                <button onClick={() => setShowSidebar(false)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
              <p className="text-sm text-slate-600">Quick access to all features</p>
            </div>

            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin hover:scrollbar-thumb-slate-400">
              <button onClick={() => { setShowSidebar(false); navigate("/profile"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-emerald-50 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200"><User className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 text-left"><span className="font-semibold text-slate-900 group-hover:text-emerald-700">View Profile</span><p className="text-sm text-slate-500">Manage your account</p></div>
              </button>
              <button onClick={() => { setShowSidebar(false); navigate("/dashboard"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-emerald-50 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200"><BarChart3 className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 text-left"><span className="font-semibold text-slate-900 group-hover:text-emerald-700">Project Dashboard</span><p className="text-sm text-slate-500">Browse AI projects</p></div>
              </button>
              <button onClick={() => setShowSidebar(false)} className="w-full flex items-center gap-4 px-6 py-4 bg-emerald-50 border-l-4 border-emerald-600">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-200 flex items-center justify-center"><Target className="w-5 h-5 text-emerald-700" /></div>
                <div className="flex-1 text-left"><span className="font-semibold text-emerald-700">My Learning Progress</span><p className="text-sm text-slate-600">Track your roadmap</p></div>
              </button>
              <button onClick={() => { setShowSidebar(false); navigate("/my-projects"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-emerald-50 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200"><LayoutDashboard className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 text-left"><span className="font-semibold text-slate-900 group-hover:text-emerald-700">My Projects</span><p className="text-sm text-slate-500">View ongoing projects</p></div>
              </button>
              <button onClick={() => { setShowSidebar(false); navigate("/achievements"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-emerald-50 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200"><Award className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2"><span className="font-semibold text-slate-900 group-hover:text-emerald-700">Achievements</span><span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">NEW</span></div>
                  <p className="text-sm text-slate-500">View your milestones</p>
                </div>
              </button>
              <button onClick={() => { setShowSidebar(false); navigate("/ai-assistant"); }} className="w-full flex items-center gap-4 px-6 py-4 hover:bg-emerald-50 transition-colors group">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200"><Sparkles className="w-5 h-5 text-emerald-600" /></div>
                <div className="flex-1 text-left"><span className="font-semibold text-slate-900 group-hover:text-emerald-700">AI Assistant</span><p className="text-sm text-slate-500">Get learning help</p></div>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto" ref={contentRef}>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-5 mt-4 sm:mt-6 relative">
          <div className="flex items-start justify-between mb-3 flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              {!showSidebar && (
                <button onClick={() => setShowSidebar(true)} className="p-2 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors shadow-sm border border-slate-200 flex-shrink-0 mt-0.5">
                  <Menu className="w-5 h-5 text-slate-700" />
                </button>
              )}
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-medium mb-2 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Personalized Learning Path</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Your Learning Roadmap</h1>
                <p className="text-sm sm:text-base text-slate-600">A structured, real-time path to become a {role}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
              <Button onClick={handleRefreshRoadmap} variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 text-sm">
                <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="inline">Refresh AI</span>
              </Button>
              <Button onClick={handleDownloadRoadmap} variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 text-sm">
                <Download className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="inline">Download PDF</span>
              </Button>
              <Button onClick={handleOpenAIAssistant} className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white h-10 sm:h-9 px-3 text-sm">
                <MessageSquare className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="inline">AI Assistant</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className="flex items-center gap-2.5 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-600 font-medium">Est. Duration</p>
                <p className="font-semibold text-slate-900 text-sm">~{totalWeeks} weeks</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-teal-50 rounded-lg border border-teal-200">
              <Target className="w-5 h-5 text-teal-600" />
              <div>
                <p className="text-xs text-slate-600 font-medium">Phases Completed</p>
                <p className="font-semibold text-slate-900 text-sm">{completedPhases} / {roadmap.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <Trophy className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs text-slate-600 font-medium">Overall Progress</p>
                <p className="font-semibold text-slate-900 text-sm">{progressPercentage.toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <div className="mt-3"><Progress value={progressPercentage} className="h-2 bg-slate-100" /></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Roadmap Timeline Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-4 sm:p-5 sticky top-4">
              <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" /> Phases
              </h2>
              <div className="space-y-3">
                {roadmap.map((phase, index) => {
                  const isCompleted = getPhaseCompletion(phase);
                  const isActive = selectedPhaseIndex === index;
                  const lvl = phase.level || phase.difficulty || 'Beginner';
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedPhaseIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        isActive ? "border-emerald-600 bg-emerald-50" : "border-slate-200 bg-white hover:border-emerald-300"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] sm:text-xs font-semibold text-slate-500">Phase {index + 1}</span>
                            <Badge variant={lvl.includes('Beginner') ? 'default' : lvl.includes('Intermediate') ? 'secondary' : 'destructive'} className="text-[9px] px-1.5 py-0 font-bold leading-tight">
                              {lvl}
                            </Badge>
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">{phase.title || phase.phase}</h3>
                          <p className="text-[10px] sm:text-xs text-slate-600 mt-0.5">{phase.duration}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* specific logic to display phase content real time */}
          <div className="lg:col-span-2">
            {selectedPhase && (
              <Card className="p-5 sm:p-7">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <Badge variant={(selectedPhase.level || selectedPhase.difficulty)?.includes('Beginner') ? 'default' : (selectedPhase.level || selectedPhase.difficulty)?.includes('Intermediate') ? 'secondary' : 'destructive'} className="mb-1.5 text-[10px] py-0.5 uppercase shadow-sm">
                      {selectedPhase.level || selectedPhase.difficulty}
                    </Badge>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">{selectedPhase.title || selectedPhase.phase}</h2>
                    <p className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" /> {selectedPhase.duration}
                      {selectedPhase.description && <span className="ml-1.5 hidden sm:inline">• {selectedPhase.description}</span>}
                    </p>
                  </div>
                  {getPhaseCompletion(selectedPhase) && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-700">Completed</span>
                    </div>
                  )}
                </div>

                {/* Topics / Skills Real Time completion toggle */}
                <div className="mb-6 border border-slate-200 p-4 sm:p-5 rounded-xl bg-slate-50 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-emerald-600" /> Core Skills & Topics
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-500 mb-3 tracking-tight">Click on a skill to mark it as completed to track your real-time progress.</p>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {(selectedPhase.topics || selectedPhase.skills || []).map((skillObj, index) => {
                      const name = typeof skillObj === 'string' ? skillObj : skillObj.name;
                      const subtopics = typeof skillObj === 'string' ? null : skillObj.subtopics;
                      const emoji = typeof skillObj === 'string' ? '💻' : (skillObj.emoji || '💻');
                      const isDone = completedTopics.has(name);
                      return (
                        <div
                          key={index}
                          onClick={() => toggleTopicCompletion(name)}
                          className={`flex items-start gap-2.5 p-3 rounded-lg border-2 cursor-pointer transition-all shadow-sm ${
                            isDone ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-slate-300 flex-shrink-0 mt-0.5 group-hover:text-emerald-400" />}
                          <div className="flex-1">
                            <p className={`text-sm font-semibold flex items-center gap-1.5 ${isDone ? 'text-emerald-900' : 'text-slate-700'}`}>
                                <span>{emoji}</span> {name}
                            </p>
                            {typeof skillObj !== 'string' && skillObj.description && <p className="text-[10px] text-slate-500 leading-tight mt-0.5 mb-1.5">{skillObj.description}</p>}
                            {subtopics && subtopics.length > 0 && (
                              <ul className="pl-3 mt-1.5 list-disc text-[10px] text-slate-600 space-y-0.5 marker:text-emerald-400">
                                {subtopics.map((sub, i) => (
                                  <li key={i}>{sub}</li>
                                ))}
                              </ul>
                            )}
                            <button
                               onClick={(e) => handleOpenAIGuideForTopic(e, name, subtopics)}
                               className="mt-2 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors border border-indigo-100"
                            >
                               <Sparkles className="w-3 h-3" /> Study with AI Guide
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-teal-600" /> Actionable Milestones
                  </h3>
                  <div className="grid gap-2">
                    {(selectedPhase.step_by_step_guide || selectedPhase.milestones || []).map((milestone, index) => (
                      <div key={index} className="flex items-start gap-2.5 p-3 bg-teal-50 rounded-lg border border-teal-100 shadow-sm">
                        <Trophy className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-800 font-medium">{milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-indigo-600" /> Recommended Projects
                  </h3>
                  
                  {/* Real Dashboard Cards adapted */}
                  <div className="grid gap-3 mb-3">
                    {recommendedProjects.map((project) => (
                      <div key={project.id} className="bg-white rounded-xl border-2 border-slate-200 p-4 hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer group" onClick={() => navigate("/dashboard")}>
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{project.title}</h4>
                          {project.trending && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-[10px] font-semibold flex-shrink-0 ml-2">
                              <Flame className="w-2.5 h-2.5" /> Trending
                            </div>
                          )}
                        </div>
                        <p className="text-slate-600 mb-3 text-xs line-clamp-2">{project.description}</p>
                        <div className="flex items-center gap-2 mb-3 text-xs text-slate-600">
                          <span className="font-semibold text-indigo-600">{project.difficulty}</span>
                          <span className="text-slate-300">•</span><span>{project.duration}</span><span className="text-slate-300">•</span>
                          <span className="font-bold text-emerald-600">{project.matchScore}% Match</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {(project.tags || []).slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-semibold">{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div className="text-[10px] text-slate-500">{(project.languages||[]).length} languages • {(project.tools||[]).length} tools</div>
                          <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* AI Generated Curriculum Projects */}
                  {selectedPhase.projects && selectedPhase.projects.length > 0 && (
                  <div className="bg-indigo-50 rounded-lg p-3 sm:p-4 border border-indigo-200">
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mb-2">AI Context-Specific Projects:</p>
                    <div className="grid gap-2">
                      {selectedPhase.projects.map((projObj, index) => {
                        const projName = typeof projObj === 'string' ? projObj : projObj.name || projObj.title || 'Project';
                        return (
                          <div key={index} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-indigo-200 hover:bg-white shadow-sm transition-colors cursor-pointer" onClick={() => navigate("/dashboard")}>
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm">{index + 1}</div>
                              <p className="font-semibold text-slate-900 text-xs sm:text-sm">{projName}</p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                          </div>
                      )})}
                    </div>
                  </div>
                  )}
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-3 text-center">💡 Click on any project to push it to your workspace</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <Button onClick={handleOpenAIAssistant} className="h-10 px-5 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2 shadow-sm transition-all rounded-lg text-sm">
            <MessageSquare className="w-4 h-4" /> Get Advanced AI Learning Help
          </Button>
          <Button onClick={() => navigate("/resources")} variant="outline" className="h-10 px-5 border-emerald-300 hover:bg-emerald-50 flex items-center gap-2 rounded-lg text-emerald-800 font-semibold shadow-sm text-sm">
            <BookOpen className="w-4 h-4" /> Browse Free Resources
          </Button>
        </div>
      </div>
    </div>
  );
}
