import { apiFetch } from '../utils/apiFetch';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getToken } from '../utils/auth';
import { 
  Calendar, Target, Sparkles, CheckCircle2, Circle, ArrowRight,
  BookOpen, Trophy, MessageSquare, Plus,
  RefreshCw, GitBranch, Radio, Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from './Sidebar';


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

export default function LearningRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const _cleanRole = (r: string) => r ? r.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() : r;
  const initialRole = _cleanRole(location.state?.role || "Software Engineer");

  const [role, setRole] = useState(initialRole);
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  
  // Real-time tracking state
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  
  // Custom Roadmap Phase Modals & State
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  
  // Feature flags / Modals
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

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
    setLoadingProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    let es: EventSource | null = null;
    const loadData = async () => {
      setIsLoading(true);

      // Load progress from backend immediately as backup, but SSE takes over
      try {
          const userStr = sessionStorage.getItem('user');
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

      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (user?.id) {
          es = new EventSource(`/api/realtime/stream?userId=${user.id}&token=${getToken()}`);
          es.addEventListener('snapshot', (e: MessageEvent) => {
              try {
                  const snap = JSON.parse(e.data);
                  if (snap && snap.roadmapProgress) {
                      const completedForRole = snap.roadmapProgress
                          .filter((r: any) => r.role === role)
                          .map((r: any) => r.topic_name);
                      setCompletedTopics(new Set(completedForRole));
                  }
              } catch (err) {}
          });
      }

      // Load Roadmap Data
      let analysis = location.state?.analysis;
      let targetRole = location.state?.role || role;

      if (!analysis || !analysis.roadmap) {
         try {
           const saved = sessionStorage.getItem('lastRoleAnalysis');
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
           const userStr = sessionStorage.getItem('user');
           const user = userStr ? JSON.parse(userStr) : {};
           const response = await apiFetch('/api/role/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: targetRole, userId: user.id || null })
           });
           
           if (response.ok) {
             const data = await response.json();
             if (data.data && data.data.roadmap) {
               setRoadmap(data.data.roadmap);
               sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
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

    return () => {
        if (es) es.close();
    };
  }, [location.state, role, navigate]);

  const toggleTopicCompletion = async (topicName: string) => {
      const isCompleted = !completedTopics.has(topicName);
      setCompletedTopics(prev => {
          const newSet = new Set(prev);
          if (isCompleted) {
             newSet.add(topicName);
             // Gamification: Trigger confetti!
             confetti({
               particleCount: 100,
               spread: 70,
               origin: { y: 0.6 },
               colors: ['#10b981', '#14b8a6', '#f59e0b', '#3b82f6'] // Emerald, Teal, Amber, Blue
             });
          } else {
             newSet.delete(topicName);
          }
          return newSet;
      });

      try {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
             const user = JSON.parse(userStr);
             apiFetch('/api/role/progress', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({
                     userId: user.id, role: role, topicName: topicName, isCompleted: isCompleted
                 })
             }).catch(err => console.error("Sync failed", err));
          }
      } catch (error) {}
  };

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

  const handleRefreshRoadmap = async () => {
    setIsLoading(true);
    try {
      const userStr = sessionStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : {};
      const response = await apiFetch('/api/role/analyze', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ role: role, userId: user.id || null, forceRefresh: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data.roadmap) {
          setRoadmap(data.data.roadmap);
          sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
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

  const handleOpenRoadmapTree = () => {
    navigate("/roadmap-tree", { state: { role, roadmap } });
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

  const handleGenerateCustomPhase = async () => {
    setIsGeneratingCustom(true);
    try {
        const response = await apiFetch('/api/role/custom-roadmap-phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role, prompt: customPrompt })
        });
        const data = await response.json();
        if (data.success && data.phase) {
            const updatedRoadmap = [...roadmap, data.phase];
            setRoadmap(updatedRoadmap);
            setIsAddingCustom(false);
            setCustomPrompt("");
            
            // Save locally so it persists
            const saved = sessionStorage.getItem('lastRoleAnalysis');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.analysis) {
                        parsed.analysis.roadmap = updatedRoadmap;
                        sessionStorage.setItem('lastRoleAnalysis', JSON.stringify(parsed));
                    }
                } catch(e) {}
            }
            
            // Automatically switch to Roadmap Tree view once generated
            navigate("/roadmap-tree", { state: { role, roadmap: updatedRoadmap } });
        }
    } catch (err) {
        console.error("Failed to generate custom phase", err);
    } finally {
        setIsGeneratingCustom(false);
    }
  };

  if (isLoading || loadingProgress < 100) {
    // If backend returns faster, we allow progress bar to immediately zip to 100% by hiding UI at 100
    if (!isLoading && loadingProgress === 100) {
        // Dropthrough and render main
    } else {
        return (
          <div className="min-h-[100dvh] flex items-center justify-center bg-gray-50 p-4">
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
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      <div className="z-50 shrink-0"><Sidebar activePage="roadmap" /></div>

      <div className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto px-3 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl xl:max-w-7xl mx-auto w-full" ref={contentRef}>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 lg:p-8 mb-6 mt-2 relative">
          <div className="flex items-start justify-between mb-3 flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-3 sm:gap-4 flex-1">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full text-xs font-medium mb-2 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FindStreak AI Personalized Path</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Your Learning Roadmap</h1>
                  <span className={`hidden md:flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700`}>
                     <Radio className="w-2.5 h-2.5 animate-pulse" /> LIVE
                  </span>
                </div>
                <p className="text-sm sm:text-base text-slate-600">A structured, real-time path to become a {role}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
              <Button 
                onClick={() => {
                   const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                   const shareUrl = `${window.location.origin}/p/${user.username || user.id}`;
                   navigator.clipboard.writeText(shareUrl);
                   confetti({ particleCount: 50, spread: 40, origin: { y: 0.1, x: 0.8 } });
                   alert("Public Roadmap link copied to clipboard!");
                }} 
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 text-sm bg-gradient-to-r from-teal-600 to-emerald-600 border-0 hover:from-teal-700 hover:to-emerald-700 hover:shadow-md transition-all text-white font-bold"
              >
                <Share2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="inline">Share Roadmap</span>
              </Button>
              <Button onClick={handleRefreshRoadmap} variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-1.5 h-10 sm:h-9 px-3 text-sm">
                <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5" /> <span className="inline">Refresh AI</span>
              </Button>
              
              <div className="relative group flex items-center">
                <Button onClick={() => navigate("/resources")} variant="outline" className="flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 !p-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                  <BookOpen className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                </Button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all whitespace-nowrap pointer-events-none z-50">
                  Browse Free Resources
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                </div>
              </div>

              <div className="relative group flex items-center">
                <Button onClick={() => navigate("/ai-assistant", { state: { role, roadmap } })} variant="outline" className="flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 !p-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                  <MessageSquare className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                </Button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all whitespace-nowrap pointer-events-none z-50">
                  Advanced AI Help
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                </div>
              </div>

              <div className="relative group flex items-center">
                <Button onClick={handleOpenRoadmapTree} variant="outline" className="flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 !p-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                  <GitBranch className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                </Button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all whitespace-nowrap pointer-events-none z-50">
                  View Mode Tree
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                </div>
              </div>

              <div className="relative group flex items-center">
                <Button onClick={() => setIsAddingCustom(true)} variant="outline" className="flex items-center justify-center h-10 w-10 sm:h-9 sm:w-9 !p-0 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">
                  <Plus className="w-5 h-5 sm:w-4 sm:h-4 flex-shrink-0" />
                </Button>
                <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-medium px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all whitespace-nowrap pointer-events-none z-50">
                  Add Custom Phase
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                </div>
              </div>

            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-5 md:mt-8">
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

        
        {/* NEW ROADMAP.SH STYLE FLOWCHART */}
        <div className="relative py-8 md:py-12 px-2 sm:px-8 w-full max-w-5xl mx-auto flex flex-col items-center mt-6">
            {/* Main vertical line */}
            <div className="absolute top-0 bottom-0 left-[28px] md:left-1/2 md:-translate-x-1/2 w-1.5 bg-emerald-200/60 rounded-full z-0" />
            
            {roadmap.map((phase, index) => {
              const isPhaseCompleted = getPhaseCompletion(phase);
              
              return (
                <div key={index} className="relative w-full mb-20 last:mb-0">
                  {/* Phase Title Block on Central Line */}
                  <div className="flex justify-start md:justify-center items-center sticky top-24 z-20 mb-6 pl-16 md:pl-0">
                      <div className={`
                         px-5 py-2.5 rounded-[12px] border-4 font-bold text-center shadow-xl transition-all 
                         ${isPhaseCompleted ? 'bg-emerald-500 border-white text-white' : 'bg-white border-emerald-400 text-slate-800'}
                       `}>
                          <p className={`text-[10px] uppercase tracking-widest mb-1 ${isPhaseCompleted ? 'text-emerald-100' : 'text-emerald-600'}`}>Phase {index + 1} • {phase.duration}</p>
                          <h2 className="text-base md:text-xl">{phase.title || phase.phase}</h2>
                      </div>
                  </div>

                  {/* Nodes wrapper */}
                  <div className="flex flex-col gap-6 relative z-10 w-full mt-4">
                      {(phase.topics || phase.skills || []).map((skillObj, topicIdx) => {
                         const name = typeof skillObj === 'string' ? skillObj : skillObj.name;
                         const emoji = typeof skillObj === 'string' ? '💻' : (skillObj.emoji || '💻');
                         const desc = typeof skillObj === 'string' ? '' : skillObj.description;
                         const subtopics = typeof skillObj === 'string' ? null : skillObj.subtopics;
                         const isDone = completedTopics.has(name);

                         const alignLeft = topicIdx % 2 === 0;

                         return (
                           <div key={topicIdx} className={`w-full flex ${alignLeft ? 'md:justify-start' : 'md:justify-end'} justify-start relative`}>
                              
                              {/* Horizontal connector line (desktop) */}
                              <div className={`hidden md:block absolute top-[24px] h-1.5 bg-emerald-200/80 w-[30%] ${alignLeft ? 'right-1/2 rotate-180 translate-x-[2px]' : 'left-1/2 -translate-x-[2px]'} z-0 origin-left`} />

                              {/* Interactive Dot Connector on the center line */}
                              <div className={`absolute top-[24px] -translate-y-1/2 w-5 h-5 rounded-full border-[4px] border-slate-50 shadow bg-emerald-400 z-20 
                                  left-[20px] md:left-1/2 md:-translate-x-1/2 transition-colors duration-300
                                  ${isDone ? 'bg-emerald-600 border-emerald-100' : 'bg-emerald-300'}
                              `} />

                              <div className={`
                                relative z-10 pl-16 md:pl-0 w-full md:w-[45%] group
                                ${alignLeft ? 'md:pr-10' : 'md:pl-10'}
                              `}>
                                 <div 
                                    className={`
                                      p-3 sm:p-4 rounded-[12px] border-2 transition-all cursor-pointer shadow-md hover:-translate-y-1 hover:shadow-xl relative overflow-hidden
                                      ${isDone ? 'bg-emerald-50 border-emerald-400' : 'bg-white border-slate-200 hover:border-emerald-500'}
                                    `}
                                 >
                                    <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    
                                    <div className="flex items-start justify-between gap-3" onClick={() => toggleTopicCompletion(name)}>
                                        <div className="flex items-center gap-3">
                                            {isDone ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" /> : <Circle className="w-5 h-5 text-slate-300 flex-shrink-0 group-hover:text-emerald-400" />}
                                            <div>
                                                <h3 className={`font-extrabold text-sm md:text-base flex items-center gap-2 ${isDone ? 'text-emerald-900' : 'text-slate-800'}`}>
                                                    <span>{emoji}</span> {name}
                                                </h3>
                                                {desc && <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 md:line-clamp-none leading-relaxed">{desc}</p>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                                        <button
                                           onClick={(e) => handleOpenAIGuideForTopic(e, name, subtopics)}
                                           className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm hover:shadow hover:bg-slate-800 transition-all flex items-center gap-1.5 ml-2 md:ml-0"
                                        >
                                           <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Study Guide
                                        </button>
                                        {subtopics && subtopics.length > 0 && (
                                            <span className="text-[10px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
                                                {subtopics.length} Concepts
                                            </span>
                                        )}
                                    </div>
                                 </div>
                              </div>
                           </div>
                         )
                      })}
                      
                      {/* Interactive Projects for this phase */}
                      {phase.projects && phase.projects.length > 0 && (
                          <div className={`w-full flex md:justify-center justify-start relative mt-6`}>
                             <div className="relative z-10 w-full md:max-w-md pl-16 md:pl-0 md:px-4">
                                <div className="bg-emerald-950 rounded-[12px] border-4 border-emerald-900 p-4 shadow-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-3xl transition-all" />
                                    <h3 className="font-extrabold text-emerald-100 flex items-center gap-2 mb-3 text-sm md:text-base">
                                        <Trophy className="w-4 h-4 text-amber-400" /> Milestone Projects
                                    </h3>
                                    <div className="space-y-2.5">
                                        {phase.projects.map((projObj, i) => {
                                            const projName = typeof projObj === 'string' ? projObj : projObj.name || projObj.title || 'Project';
                                            return (
                                              <div key={i} className="flex items-center justify-between bg-emerald-900/50 hover:bg-emerald-800 px-3 py-2.5 rounded-lg border border-emerald-700 cursor-pointer shadow-inner transition-colors" onClick={() => navigate("/dashboard")}>
                                                  <span className="font-bold text-emerald-50 text-xs md:text-sm">{projName}</span>
                                                  <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                                              </div>
                                            )
                                        })}
                                    </div>
                                </div>
                             </div>
                          </div>
                      )}
                  </div>
                </div>
              )
            })}
        </div>
      </div>
      </div>

      {/* Custom Phase Modal */}
      {isAddingCustom && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100/50 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-2 flex items-center gap-2 relative z-10 tracking-tight">
              <Sparkles className="text-emerald-500 w-6 h-6 flex-shrink-0" /> Add Custom Phase
            </h3>
            <p className="text-sm font-medium text-slate-600 mb-6 relative z-10">
              What specific topic or tech stack would you like to add? Our AI will generate a tailored learning phase for it.
            </p>
            
            <div className="relative z-10">
              <input 
                type="text"
                className="w-full px-4 py-3.5 bg-slate-50 rounded-xl border-2 border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors mb-6 font-medium text-slate-800"
                placeholder="e.g. Master LangChain & LLM Agents"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                autoFocus
              />
            </div>
            
            <div className="flex justify-end gap-3 relative z-10">
              <Button 
                variant="outline" 
                onClick={() => { setIsAddingCustom(false); setCustomPrompt(""); }}
                className="font-bold border-2 border-slate-200 hover:bg-slate-100 px-6"
                disabled={isGeneratingCustom}
              >
                Cancel
              </Button>
              <Button 
                disabled={!customPrompt.trim() || isGeneratingCustom} 
                onClick={handleGenerateCustomPhase}
                className="font-bold border-2 border-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-white px-6"
              >
                {isGeneratingCustom ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" /> Generating...
                  </span>
                ) : "Generate & Add"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
