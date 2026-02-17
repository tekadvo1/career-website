import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Target,
  Download,
  Sparkles,
  CheckCircle2,
  Code,
  BookOpen,
  ArrowRight,
  BrainCircuit,
  Trophy,
  Bot
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QuizModal from './roadmap/QuizModal';
import AIChatAssistant from './roadmap/AIChatAssistant';

// Interfaces
interface Resource {
  name: string;
  url: string;
  type: string;
  is_free?: boolean;
}

interface Project {
  name: string;
  description: string;
  difficulty: string;
}

interface TopicResource {
    name: string;
    url: string;
    type: string;
    is_free: boolean;
}

interface DetailedTopic {
    name: string;
    description: string;
    practical_application?: string;
    subtopics: string[];
    topic_resources: TopicResource[];
}

interface RoadmapPhase {
  phase: string;
  duration: string;
  difficulty: string;
  category?: string;
  description?: string;
  topics: (string | DetailedTopic)[];
  skills_covered?: string[]; // Fallback if needed
  step_by_step_guide: string[];
  resources: Resource[];
  projects: Project[];
}

const DEFAULT_ROADMAP: RoadmapPhase[] = [
    {
        phase: "Computer Science Foundations",
        duration: "4-6 weeks",
        difficulty: "Beginner",
        category: "Foundations",
        description: "Before diving into frameworks, master the timeless principles of computing. This phase focuses on how computers work, algorithms, and data structures.",
        topics: [
            {
                name: "Algorithms & Logic",
                description: "The building blocks of programming.",
                subtopics: ["Big O Notation", "Sorting & Searching", "Recursion", "Graph Theory"],
                topic_resources: [
                    { name: "CS50: Intro to CS", url: "https://pll.harvard.edu/course/cs50-introduction-computer-science", type: "Course", is_free: true }
                ]
            },
            {
                name: "Internet Fundamentals",
                description: "How the web actually works.",
                subtopics: ["HTTP/HTTPS Protocols", "DNS & Hosting", "Browsers & Rendering", "TCP/IP"],
                topic_resources: []
            }
        ],
        skills_covered: ["Algorithmic Thinking", "Problem Solving", "Memory Management"],
        step_by_step_guide: [
            "Complete CS50 Week 0-5", 
            "Solve 20 LeetCode 'Easy' problems",
            "Build a CLI tool in Python or C"
        ],
        resources: [
             { name: "Harvard CS50", url: "https://pll.harvard.edu/course/cs50-introduction-computer-science", type: "Course", is_free: true },
             { name: "The Odin Project: Foundations", url: "https://www.theodinproject.com/paths/foundations/courses/foundations", type: "Curriculum", is_free: true }
        ],
        projects: [
            { name: "CLI Task Manager", description: "Build a command-line to-do list with file persistence.", difficulty: "Beginner" }
        ]
    },
    {
        phase: "Frontend Engineering",
        duration: "6-8 weeks",
        difficulty: "Intermediate",
        category: "Frontend",
        description: "Mastering the art of creating interactive user interfaces. Focus on modern React, state management, and responsive design systems.",
        topics: [
            {
                name: "Modern React",
                description: "Building component-based UIs.",
                subtopics: ["Hooks (useEffect, useState)", "Context API", "Custom Hooks", "Performance Optimization"],
                topic_resources: []
            },
            {
                name: "CSS Mastery",
                description: "Styling layout and aesthetics.",
                subtopics: ["Flexbox & Grid", "Tailwind CSS", "Animations", "Responsive Design"],
                topic_resources: []
            }
        ],
        skills_covered: ["Component Architecture", "State Management", "UI/UX Implementation"],
        step_by_step_guide: [
            "Build a clone of a popular site (Tesla/Netflix)",
            "Master React Hooks",
            "Learn to use Tailwind CSS efficiently"
        ],
        resources: [],
        projects: [
             { name: "E-Commerce Dashboard", description: "A responsive dashboard with charts and data tables.", difficulty: "Intermediate" },
             { name: "Interactive Portfolio", description: "A 3D or highly animated personal website.", difficulty: "Intermediate" }
        ]
    },
    {
        phase: "Backend & APIs",
        duration: "6-8 weeks",
        difficulty: "Intermediate",
        category: "Backend",
        description: "Building the engine that powers applications. Learn to design robust APIs, handle authentication, and manage databases.",
        topics: [
            {
                name: "Server-Side Logic",
                description: "Runtime environments and APIs.",
                subtopics: ["Node.js & Express", "RESTful Architecture", "GraphQL", "Authentication (JWT/OAuth)"],
                topic_resources: []
            },
            {
                name: "Databases",
                description: "Persistent data storage.",
                subtopics: ["PostgreSQL (SQL)", "MongoDB (NoSQL)", "ORM (Prisma/TypeORM)", "Database Design"],
                topic_resources: []
            }
        ],
        skills_covered: ["API Design", "Database Modeling", "Security Best Practices"],
        step_by_step_guide: [
            "Design a database schema for a social network",
            "Build a secured REST API with Express",
            "Implement User Auth from scratch"
        ],
        resources: [],
        projects: [
             { name: "Real-time Chat App", description: "Using WebSockets (Socket.io) for messaging.", difficulty: "Intermediate" }
        ]
    },
    {
        phase: "DevOps & Cloud",
        duration: "4 weeks",
        difficulty: "Advanced",
        category: "DevOps",
        description: "Taking your code from localhost to the world. Learn CI/CD, containerization, and cloud infrastructure.",
        topics: [
            {
                name: "Containerization",
                description: "Consistent environments everywhere.",
                subtopics: ["Docker Fundamentals", "Docker Compose", "Multi-stage Builds"],
                topic_resources: []
            },
             {
                name: "Cloud Infrastructure",
                description: "Deploying and scaling applications.",
                subtopics: ["AWS/Vercel/Railway", "CI/CD Pipelines (GitHub Actions)", "Monitoring & Logging"],
                topic_resources: []
            }
        ],
        skills_covered: ["DevOps Culture", "Infrastructure as Code", "Deployment Strategy"],
        step_by_step_guide: [
            "Dockerize your Full Stack App",
            "Set up automatic deployment on push",
            "Configure a custom domain with SSL"
        ],
        resources: [],
        projects: [
             { name: "Production Deployment Pipeline", description: "Fully automated CI/CD for a mono-repo.", difficulty: "Advanced" }
        ]
    },
    {
        phase: "System Architecture",
        duration: "Ongoing",
        difficulty: "Expert",
        category: "Architecture",
        description: "Designing for scale, reliability, and maintainability. This is what distinguishes senior engineers.",
        topics: [
            {
                name: "Distributed Systems",
                description: "Handling high scale.",
                subtopics: ["Microservices vs Monolith", "Load Balancing", "Caching Strategies (Redis)", "Message Queues (Kafka)"],
                topic_resources: []
            }
        ],
        skills_covered: ["System Design", "Scalability", "Trade-off Analysis"],
        step_by_step_guide: [
            "Read 'Designing Data-Intensive Applications'",
            "Practice System Design Interview questions",
            "Refactor a monolith into microservices"
        ],
        resources: [],
        projects: [
             { name: "Clone a High-Scale Service", description: "Design a simplified version of Twitter or Uber backend.", difficulty: "Expert" }
        ]
    }
];

export default function LearningRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(location.state?.role || "Software Engineer");
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false); // New state to track topic expansion
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatContext, setChatContext] = useState('');

  // --- NEW FEATURES STATE ---
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);

  const openChatWithContext = (context: string) => {
      setChatContext(context);
      setShowChat(true);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // Load completed topics from LocalStorage
      const savedProgress = localStorage.getItem(`roadmap_progress_${role}`);
      if (savedProgress) {
          try {
              setCompletedTopics(new Set(JSON.parse(savedProgress)));
          } catch (e) {
              console.error("Failed to parse progress", e);
          }
      }

      // Load progress from API (Source of Truth)
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
                })
                .catch(e => console.error("Error loading progress from API", e));
          }
      } catch (e) {
          console.error("Error checking user for progress load", e);
      }

      // 1. Try to get data from location state 
      let analysis = location.state?.analysis;
      let targetRole = location.state?.role || role;

      // 2. If not in state, look in localStorage for analysis
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
         } catch (e) {
           console.error("Error reading from local storage", e);
         }
      }

      // 3. If still no roadmap, fetch fresh
      if (analysis && analysis.roadmap && Array.isArray(analysis.roadmap)) {
         setRoadmap(analysis.roadmap);
         setIsLoading(false);
      } else {
         console.log("Fetching fresh roadmap for:", targetRole);
         try {
           const user = JSON.parse(localStorage.getItem('user') || '{}');
           const response = await fetch('/api/role/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ role: targetRole, userId: user.id })
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

  // Save progress
  useEffect(() => {
      localStorage.setItem(`roadmap_progress_${role}`, JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics, role]);

    const handleResetRoadmap = () => {
        if (window.confirm("This will replace your current view with the full comprehensive roadmap curriculum. Continue?")) {
            setRoadmap(DEFAULT_ROADMAP);
            localStorage.removeItem('lastRoleAnalysis');
            localStorage.removeItem(`roadmap_progress_${role}`);
            setCompletedTopics(new Set());
            setSelectedPhaseIndex(0);
        }
    };

  const handleDownloadPDF = async () => {
      const element = document.getElementById('roadmap-content');
      if (!element) return;
      
      setIsDownloading(true);
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'a4'
        });
        
        const imgWidth = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(`${role}_Learning_Roadmap.pdf`);
      } catch (error) {
        console.error('PDF generation failed:', error);
        alert('Failed to generate PDF. Please try again.');
      } finally {
        setIsDownloading(false);
      }
    };

  const toggleTopicCompletion = async (topicName: string) => {
      const isCompleted = !completedTopics.has(topicName);
      setCompletedTopics(prev => {
          const newSet = new Set(prev);
          if (isCompleted) {
              newSet.add(topicName);
          } else {
              newSet.delete(topicName);
          }
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
                     userId: user.id,
                     role: role,
                     topicName: topicName,
                     isCompleted: isCompleted
                 })
             }).catch(err => console.error("Background sync failed", err));
          }
      } catch (error) {
          console.error("Failed to initiate sync", error);
      }
  };

  const activeRoadmap = roadmap; 
  const currentPhase = activeRoadmap[selectedPhaseIndex] || activeRoadmap[0];
  const totalPhases = roadmap.length; 
  
  const handlePhaseChange = (idx: number) => {
      setSelectedPhaseIndex(idx);
      setIsTopicsExpanded(false); // Reset expansion when changing phases
  };

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty?.toLowerCase() || '';
    if (d.includes("beginner")) return "bg-green-100 text-green-700 border-green-200";
    if (d.includes("intermediate")) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Generating your personalized roadmap...</p>
        </div>
      </div>
    );
  }

  if (roadmap.length === 0) {
     return (
       <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-center p-4">
          <p className="text-gray-600 mb-4">We couldn't find a roadmap for this role.</p>
          <button 
             onClick={() => navigate('/onboarding')}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
             Start New Analysis
          </button>
       </div>
     );
  }

  const totalTopics = roadmap.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0);
  const progressPercent = Math.min(100, Math.round((completedTopics.size / (totalTopics || 1)) * 100));

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-800" id="roadmap-content">
      {/* HEADER SECTION - ULTRA COMPACT */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm transition-all duration-300">
         <div className="max-w-7xl mx-auto px-4 py-2"> {/* Reduced py-3 to py-2 */}
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-2"> {/* Reduced gap-3 to gap-2 */}
                 <div>
                     <div className="flex items-center gap-1.5 mb-0.5">
                         <div className="p-0.5 bg-purple-600 rounded text-white shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" /> 
                         </div>
                         <span className="text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-full uppercase tracking-wider border border-purple-100">
                            Personalized Learning Path
                         </span>
                     </div>
                     <h1 className="text-lg font-bold text-gray-900 tracking-tight">Your Learning Roadmap</h1> {/* Reduced text-xl to text-lg */}
                 </div>
                 
                 <div className="flex items-center gap-2">
                     <button 
                        onClick={handleResetRoadmap}
                        className="px-2 py-1 text-[9px] font-medium text-gray-400 hover:text-red-500 transition-colors underline"
                     >
                         Reset View
                     </button>
                     <button 
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 text-[10px] font-medium rounded hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                     >
                         <Download className="w-3 h-3" /> 
                         {isDownloading ? 'Saving...' : 'Download PDF'}
                     </button>
                     <button 
                        onClick={() => openChatWithContext(`I need help with my ${role} roadmap`)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
                     >
                         <Bot className="w-3 h-3" /> AI Assistant
                     </button>
                 </div>
             </div>

             {/* DASHBOARD STATS - ULTRA COMPACT */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2"> {/* Reduced gap-3 to gap-2 and mt-4 to mt-2 */}
                 <div className="bg-blue-50 border border-blue-100 rounded p-2 flex items-center gap-2 hover:shadow-sm transition-shadow"> 
                     <div className="w-8 h-8 bg-white text-blue-600 rounded flex items-center justify-center shadow-sm">
                         <Calendar className="w-4 h-4" />
                     </div>
                     <div>
                         <p className="text-[9px] text-blue-600 font-bold uppercase tracking-wide">Total Duration</p>
                         <p className="font-bold text-gray-900 text-sm">~{roadmap.length * 4} weeks</p> 
                     </div>
                 </div>
                 <div className="bg-green-50 border border-green-100 rounded p-2 flex items-center gap-2 hover:shadow-sm transition-shadow">
                     <div className="w-8 h-8 bg-white text-green-600 rounded flex items-center justify-center shadow-sm">
                         <Target className="w-4 h-4" />
                     </div>
                     <div>
                         <p className="text-[9px] text-green-600 font-bold uppercase tracking-wide">Phases Completed</p>
                         <p className="font-bold text-gray-900 text-sm flex items-center gap-1">
                             {completedTopics.size > 0 ? (completedTopics.size / 5).toFixed(0) : '0'} 
                             <span className="text-[10px] text-gray-400 font-normal">/ {totalPhases}</span>
                         </p>
                     </div>
                 </div>
                 <div className="bg-purple-50 border border-purple-100 rounded p-2 flex items-center gap-2 hover:shadow-sm transition-shadow">
                     <div className="w-8 h-8 bg-white text-purple-600 rounded flex items-center justify-center shadow-sm">
                         <Trophy className="w-4 h-4" />
                     </div>
                     <div className="flex-1">
                         <div className="flex justify-between items-end mb-0.5">
                            <p className="text-[9px] text-purple-600 font-bold uppercase tracking-wide">Overall Progress</p>
                            <span className="text-[10px] font-bold text-purple-700">{progressPercent}%</span>
                         </div>
                         <div className="w-full bg-purple-200 rounded-full h-1"> 
                             <div className="bg-purple-600 h-1 rounded-full transition-all duration-1000 ease-out" style={{width: `${progressPercent}%`}}></div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-1 lg:grid-cols-12 gap-4"> {/* Reduced py-6/gap-6 to py-4/gap-4 */}
          
          {/* LEFT SIDEBAR - TIMELINE */}
          <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-28"> 
                  <div className="p-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2"> 
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <h3 className="font-bold text-gray-800 text-[10px] uppercase tracking-wide">Roadmap Phases</h3>
                  </div>
                  <div className="max-h-[calc(100vh-180px)] overflow-y-auto custom-scrollbar">
                      {roadmap.map((phase, idx) => (
                          <div key={idx} className="relative group">
                              {idx !== roadmap.length - 1 && (
                                  <div className="absolute left-[15px] top-6 bottom-0 w-px bg-gray-100 z-0 group-hover:bg-gray-200 transition-colors"></div>
                              )}
                              <button
                                  onClick={() => handlePhaseChange(idx)}
                                  className={`relative z-10 w-full text-left p-2 flex items-start gap-2 hover:bg-gray-50 transition-all border-l-2 ${
                                      selectedPhaseIndex === idx 
                                      ? 'border-indigo-600 bg-indigo-50/40' 
                                      : 'border-transparent'
                                  }`}
                              >
                                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                                      selectedPhaseIndex === idx 
                                      ? 'border-indigo-600 bg-white shadow-sm scale-105' 
                                      : 'border-gray-300 bg-white group-hover:border-gray-400'
                                  }`}>
                                      {selectedPhaseIndex === idx && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>}
                                  </div>
                                  <div>
                                      <div className="flex flex-wrap items-center gap-1 mb-0.5">
                                          <span className={`text-[8px] font-bold px-1 py-0.5 rounded border uppercase tracking-wider ${getDifficultyColor(phase.difficulty)}`}>
                                              {phase.difficulty}
                                          </span>
                                      </div>
                                      <h4 className={`font-bold text-[11px] mb-0 leading-tight ${selectedPhaseIndex === idx ? 'text-indigo-900' : 'text-gray-900'}`}>{phase.phase}</h4>
                                      <p className="text-[9px] text-gray-500 font-medium">{phase.duration}</p>
                                  </div>
                              </button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-9 space-y-4"> {/* Reduced space-y-6 to space-y-4 */}
              {currentPhase && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      
                      {/* Phase Header - ULTRA COMPACT */}
                      <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden"> 
                          <div className="absolute top-0 right-0 p-3 opacity-5">
                              <Target className="w-20 h-20" /> 
                          </div>
                          <div className="relative z-10">
                              <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold mb-2 border ${getDifficultyColor(currentPhase.difficulty)}`}>
                                  {currentPhase.difficulty}
                              </div>
                              <h2 className="text-xl font-extrabold text-gray-900 mb-1">{currentPhase.phase}</h2> 
                              <div className="flex items-center gap-2 text-gray-500 text-[10px] mb-2">
                                  <div className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                                     <Calendar className="w-2.5 h-2.5" />
                                     <span className="font-medium">{currentPhase.duration}</span>
                                  </div>
                              </div>
                              <p className="text-gray-600 leading-relaxed text-xs max-w-3xl"> 
                                  {currentPhase.description}
                              </p>
                          </div>
                      </div>

                      {/* SECTION 1: SKILLS/TOPICS (BLUE) - ULTRA COMPACT */}
                      <div>
                          <div className="flex items-center gap-1.5 text-blue-700 mb-2 px-1">
                              <Code className="w-3.5 h-3.5" />
                              <h3 className="font-bold text-sm">Skills to Learn</h3>
                          </div>
                          <div className="bg-white border border-blue-100 rounded-lg shadow-sm overflow-hidden divide-y divide-gray-50 flex flex-col">
                              {(isTopicsExpanded ? (currentPhase.topics || []) : (currentPhase.topics || []).slice(0, 3)).map((topic, i) => {
                                  const topicName = typeof topic === 'string' ? topic : topic.name;
                                  const isCompleted = completedTopics.has(topicName);
                                  return (
                                      <div 
                                        key={i} 
                                        onClick={() => toggleTopicCompletion(topicName)}
                                        className={`p-2.5 flex items-start gap-2.5 transition-colors cursor-pointer group ${
                                            isCompleted ? 'bg-blue-50/50' : 'hover:bg-gray-50'
                                        }`}
                                      >
                                          <div className={`mt-0.5 flex-shrink-0 transition-all duration-300 ${
                                                  isCompleted ? 'text-blue-600 scale-100' : 'text-gray-300 group-hover:text-blue-400'
                                              }`}
                                          >
                                              <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'fill-blue-100' : ''}`} /> 
                                          </div>
                                          <div className="flex-1">
                                              <p className={`font-medium text-xs transition-all ${isCompleted ? 'text-blue-900/60 line-through' : 'text-gray-900'}`}> 
                                                  {topicName}
                                              </p>
                                          </div>
                                      </div>
                                  );
                              })}
                              
                              {(currentPhase.topics || []).length > 3 && (
                                  <button 
                                      onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
                                      className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-blue-600 text-[10px] font-bold uppercase tracking-wider transition-colors border-t border-blue-50"
                                  >
                                      {isTopicsExpanded ? "Show Less" : `Show ${(currentPhase.topics || []).length - 3} More Skills`}
                                  </button>
                              )}
                          </div>
                      </div>

                      {/* SECTION 2: MILESTONES (PURPLE) - ULTRA COMPACT */}
                      <div>
                          <div className="flex items-center gap-1.5 text-purple-700 mb-2 px-1">
                              <Trophy className="w-3.5 h-3.5" />
                              <h3 className="font-bold text-sm">Milestones</h3>
                          </div>
                          <div className="space-y-2">
                              {(currentPhase.step_by_step_guide || []).map((step, i) => (
                                  <div key={i} className="flex items-center gap-2.5 p-2.5 bg-white border border-purple-100 rounded-lg shadow-sm text-purple-900 font-medium hover:shadow-md transition-shadow group">
                                      <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-100 transition-colors">
                                          <Trophy className="w-3 h-3 text-purple-600" />
                                      </div>
                                      <span className="text-gray-800 text-xs">{step}</span>
                                  </div>
                              ))}
                              {(!currentPhase.step_by_step_guide || currentPhase.step_by_step_guide.length === 0) && (
                                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 italic text-center text-xs">
                                      No specific milestones set for this phase.
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* SECTION 3: PRACTICE PROJECTS (GREEN) - ULTRA COMPACT */}
                      <div>
                          <div className="flex items-center gap-1.5 text-green-700 mb-2 px-1">
                              <BookOpen className="w-3.5 h-3.5" />
                              <h3 className="font-bold text-sm">Practice Projects</h3>
                          </div>
                          <div className="grid gap-2">
                              {(currentPhase.projects || []).map((proj, i) => (
                                  <div 
                                    key={i}
                                    className="group relative flex items-center justify-between p-3 bg-white border border-green-100 rounded-lg transition-all shadow-sm hover:shadow-md hover:border-green-200"
                                  >
                                      <div className="flex items-start gap-2.5">
                                          <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-[9px] flex-shrink-0 mt-0.5">
                                              {i + 1}
                                          </div>
                                          <div>
                                              <p className="font-bold text-gray-900 text-xs group-hover:text-green-800 transition-colors">{proj.name}</p>
                                              <p className="text-gray-500 mt-0.5 text-[10px]">{proj.description}</p>
                                          </div>
                                      </div>
                                      <button 
                                         onClick={(e) => {
                                             e.stopPropagation();
                                             openChatWithContext(`Help me start the project: ${proj.name}. ${proj.description}`);
                                         }}
                                         className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                         aria-label="Get Project Help"
                                      />
                                      <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-green-500 group-hover:translate-x-1 transition-all" />
                                  </div>
                              ))}
                               {(!currentPhase.projects || currentPhase.projects.length === 0) && (
                                  <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-gray-500 italic text-center text-xs">
                                      No specific projects listed for this phase.
                                  </div>
                              )}
                          </div>
                          {currentPhase.projects && currentPhase.projects.length > 0 && (
                            <div className="flex justify-center mt-2">
                                <p className="text-[9px] text-orange-500 flex items-center gap-1 font-medium bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                    <Sparkles className="w-2.5 h-2.5" /> Click any project to get an AI step-by-step guide
                                </p>
                            </div>
                          )}
                      </div>

                      {/* QUIZ SECTION CTA - ULTRA COMPACT */}
                      <div className="mt-4 p-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white shadow-md flex flex-col md:flex-row items-center justify-between gap-3 relative overflow-hidden">
                          <div className="relative z-10">
                              <h4 className="font-bold text-sm mb-0.5">Ready to test your knowledge?</h4>
                              <p className="text-indigo-100 opacity-90 text-xs">Take a quick quiz to verify your understanding.</p>
                          </div>
                          <button 
                              onClick={() => setShowQuiz(true)}
                              className="relative z-10 px-4 py-1.5 bg-white text-indigo-700 font-bold rounded hover:bg-gray-50 transition-all transform hover:scale-105 shadow-sm flex items-center gap-1.5 text-xs"
                          >
                              <BrainCircuit className="w-3.5 h-3.5" /> Start Quiz
                          </button>

                          {/* Decorative Background Circles */}
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-8 -mt-8 pointer-events-none"></div>
                      </div>

                  </div>
              )}
          </div>
      </div>

      {/* FOOTER ACTION BAR - ULTRA COMPACT */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-40">
           <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
               <button 
                  onClick={() => openChatWithContext(`I need help understanding the current phase: ${currentPhase?.phase}`)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-lg hover:shadow transition-all flex items-center justify-center gap-1.5 text-xs"
               >
                   <Bot className="w-4 h-4" /> Get AI Learning Help
               </button>
               
               <div className="flex gap-2 w-full sm:w-auto">
                   <button 
                      onClick={() => navigate('/resources')}
                      className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5 text-xs"
                   >
                       <BookOpen className="w-3 h-3" /> Browse Resources
                   </button>
                   <button 
                      onClick={() => navigate('/dashboard')}
                      className="flex-1 sm:flex-none px-3 py-2 bg-white border border-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-1.5 text-xs"
                   >
                       Continue to Dashboard <ArrowRight className="w-3 h-3" />
                   </button>
               </div>
           </div>
      </div>

      {/* SEPARATE FEATURE: Quiz Modal */}
      <QuizModal 
        isOpen={showQuiz}
        onClose={() => setShowQuiz(false)}
        phaseName={currentPhase?.phase}
        topics={(currentPhase?.topics || []).map(t => typeof t === 'string' ? t : t.name)}
        role={role}
      />

      {/* SEPARATE FEATURE: AI Chat Assistant */}
      <AIChatAssistant 
        isOpen={showChat}
        onClose={() => setShowChat(false)}
        context={chatContext}
        role={role}
      />
    </div>
  );
}
