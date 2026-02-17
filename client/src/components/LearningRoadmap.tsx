import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Target,
  Download,
  Sparkles,
  CheckCircle2,
  Code,
  FolderKanban,
  BookOpen,
  Lightbulb,
  ExternalLink,
  RefreshCw,
  ListChecks,
  Bot,
  MessageSquare,
  X,
  ArrowRight,
  BrainCircuit,
  CalendarPlus,
  Trophy,
  Terminal as LucideTerminal
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ... imports
// ...
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

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
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
  skills_covered?: string[];
  step_by_step_guide: string[];
  resources: Resource[];
  projects: Project[];
}

interface QuizQuestion {
    id: number;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}

const DEFAULT_ROADMAP: RoadmapPhase[] = [
    {
        phase: "Fundamentals",
        duration: "4 weeks",
        difficulty: "Beginner",
        category: "Beginner",
        description: "Building the core foundation and understanding basic concepts.",
        topics: [
            {
                name: "Core Concepts",
                description: "Understanding the absolute basics of the field.",
                subtopics: ["Syntax", "Variables", "Control Structures"],
                topic_resources: [
                    { name: "MDN Web Docs", url: "https://developer.mozilla.org", type: "Documentation", is_free: true }
                ]
            },
            {
                name: "Development Environment",
                description: "Setting up your workspace for productivity.",
                subtopics: ["VS Code", "Git", "Terminal"],
                topic_resources: []
            }
        ],
        skills_covered: ["Basic Logic", "Environment Setup"],
        step_by_step_guide: ["Install Node.js", "Set up a GitHub account"],
        resources: [
             { name: "CS50 Introduction to Computer Science", url: "https://pll.harvard.edu/course/cs50-introduction-computer-science", type: "Course", is_free: true }
        ],
        projects: [
            { name: "Personal Portfolio", description: "Build a static site.", difficulty: "Beginner" }
        ]
    },
    {
        phase: "Advanced Concepts",
        duration: "6 weeks",
        difficulty: "Intermediate",
        category: "Intermediate",
        description: "Deepening your knowledge with complex patterns and tools.",
        topics: [
            {
                name: "Data Structures",
                description: "Efficiently storing and retrieving data.",
                subtopics: ["Arrays", "Linked Lists", "Trees"],
                topic_resources: []
            },
             {
                name: "API Integration",
                description: "Connecting frontend to backend services.",
                subtopics: ["REST", "Fetch API", "Async/Await"],
                topic_resources: []
            }
        ],
        skills_covered: ["API Design", "Data Management"],
        step_by_step_guide: ["Build a REST API", "Connect a database"],
        resources: [],
        projects: [
             { name: "Task Management App", description: "Full CRUD application.", difficulty: "Intermediate" }
        ]
    },
    {
        phase: "Mastery & Architecture",
        duration: "8 weeks",
        difficulty: "Advanced",
        category: "Advanced",
        description: "System design, scalability, and leading teams.",
        topics: [
            {
                name: "System Design",
                description: "Designing scalable distributed systems.",
                subtopics: ["Load Balancing", "Caching", "Microservices"],
                topic_resources: []
            }
        ],
        skills_covered: ["System Architecture", "Performance Optimization"],
        step_by_step_guide: ["Design a system like Twitter", "Optimize detailed queries"],
        resources: [],
        projects: [
             { name: "Cloud-Native Microservice", description: "Deploying scalable services.", difficulty: "Advanced" }
        ]
    }
];

export default function LearningRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(location.state?.role || "Software Engineer");
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All'); // Category filtering state
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatContext, setChatContext] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');

  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- NEW FEATURES STATE ---
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  
  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string | null>(null);

  const openChatWithContext = (context: string) => {
      setChatContext(context);
      setChatMessages([
          { id: '1', role: 'assistant', content: `Hi! I see you have a question about: "${context}".\n\nHow can I help you understand this better?` }
      ]);
      setShowChat(true);
  };

  const handleSendChat = async () => {
      if (!chatInput.trim()) return;
      
      const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput };
      setChatMessages(prev => [...prev, userMsg]);
      setChatInput('');
      setIsChatLoading(true);

      try {
          const response = await fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  message: userMsg.content,
                  context: chatContext,
                  role: role
              })
          });

          const data = await response.json();
          
          if (response.ok) {
              setChatMessages(prev => [...prev, {
                  id: (Date.now()+1).toString(),
                  role: 'assistant',
                  content: data.reply
              }]);
          } else {
              throw new Error(data.error || 'Failed to get response');
          }
      } catch (error) {
          console.error('Chat error:', error);
          setChatMessages(prev => [...prev, {
              id: (Date.now()+1).toString(),
              role: 'assistant',
              content: "I'm having trouble connecting right now. Please try again."
          }]);
      } finally {
          setIsChatLoading(false);
      }
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
              // Fetch asynchronously without blocking the rest of the load
              fetch(`/api/role/progress?role=${encodeURIComponent(role)}&userId=${user.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && Array.isArray(data.completedTopics)) {
                        console.log("Loaded progress from API:", data.completedTopics.length);
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
             // Check if saved analysis matches the role we are looking for (or is general enough if no role specified)
             if (parsed.role === targetRole || parsed.role) {
                analysis = parsed.analysis;
                targetRole = parsed.role;
                setRole(targetRole); // Update state role
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
         // Attempt to fetch fresh from API
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
               // Update local storage
               localStorage.setItem('lastRoleAnalysis', JSON.stringify({
                 role: targetRole,
                 analysis: data.data,
                 timestamp: new Date().getTime()
               }));
             } else {
                console.warn("API returned data but no roadmap array, using default.");
                setRoadmap(DEFAULT_ROADMAP); 
              }
            } else {
              // If fetch fails, we might just be empty
              console.warn("API fetch failed, using default roadmap.");
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
  }, [location.state, role, navigate]); // Removed 'role' dependency to avoid loops if setRole changes

  // Save progress whenever it changes
  useEffect(() => {
      localStorage.setItem(`roadmap_progress_${role}`, JSON.stringify(Array.from(completedTopics)));
  }, [completedTopics, role]);

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

  // --- NEW FUNCTIONS ---

  const toggleTopicCompletion = async (topicName: string) => {
      // Check current state to determine next state
      const isCompleted = !completedTopics.has(topicName);

      // Optimistic UI Update
      setCompletedTopics(prev => {
          const newSet = new Set(prev);
          if (isCompleted) {
              newSet.add(topicName);
          } else {
              newSet.delete(topicName);
          }
          return newSet;
      });

      // Sync with Backend
      try {
          const userStr = localStorage.getItem('user');
          if (userStr) {
             const user = JSON.parse(userStr);
             // Don't await this to keep UI snappy, just let it run
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

  const generateQuiz = async (phase: RoadmapPhase) => {
      setShowQuiz(true);
      setQuizLoading(true);
      setQuizQuestions([]);
      setQuizFinished(false);
      setQuizScore(0);
      setCurrentQuizQuestion(0);
      setQuizFeedback(null);
      setSelectedQuizAnswer(null);

      try {
          /* Mock or Real AI Call Here */
          const response = await fetch('/api/ai/chat', { // Reusing chat for generation
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  role: "system", // Hacky use of roles to get structured output
                  message: `Generate 3 multiple choice quiz questions for the topic "${phase.phase}". 
                  Return strictly valid JSON array of objects with keys: id (number), question (string), options (array of 4 strings), correctAnswer (index number 0-3), explanation (string).`,
                  context: `Topics: ${(phase.topics || []).map(t => typeof t === 'string' ? t : t.name).join(', ')}`
              })
          });
          
          const data = await response.json();
          // Try to parse the markdown JSON
          const jsonMatch = data.reply.match(/```json\n([\s\S]*?)\n```/) || data.reply.match(/```\n([\s\S]*?)\n```/);
          let parsedQuestions = [];
          
          if (jsonMatch) {
              parsedQuestions = JSON.parse(jsonMatch[1]);
          } else {
              // Fallback parse if it's just raw array
              try {
                 parsedQuestions = JSON.parse(data.reply);
              } catch (e) {
                 // Fallback Mock if AI fails to format
                 parsedQuestions = [
                     {
                         id: 1, 
                         question: `What is a core concept of ${phase.phase} in ${role}?`, 
                         options: ["Concept A", "Concept B", "Concept C", "Concept D"], 
                         correctAnswer: 0, 
                         explanation: "Concept A is fundamental."
                     },
                     {
                        id: 2, 
                        question: "Which tool is commonly used in this phase?", 
                        options: ["Tool X", "Tool Y", "Tool Z", "None"], 
                        correctAnswer: 1, 
                        explanation: "Tool Y is the industry standard."
                    }
                 ];
              }
          }
          setQuizQuestions(parsedQuestions);

      } catch (error) {
            console.error("Quiz generation failed", error);
            setQuizQuestions([
                {
                    id: 1, 
                    question: "Quiz generation failed. Please try again?", 
                    options: ["OK"], 
                    correctAnswer: 0, 
                    explanation: "Error."
                }
            ]);
      } finally {
          setQuizLoading(false);
      }
  };

  const handleQuizAnswer = (optionIndex: number) => {
      setSelectedQuizAnswer(optionIndex);
      const correct = quizQuestions[currentQuizQuestion].correctAnswer === optionIndex;
      if (correct) {
          setQuizFeedback("Correct! 🎉");
          setQuizScore(prev => prev + 1);
      } else {
          setQuizFeedback(`Incorrect. The right answer was: ${quizQuestions[currentQuizQuestion].options[quizQuestions[currentQuizQuestion].correctAnswer]}`);
      }

      // Auto advance after delay
      setTimeout(() => {
          if (currentQuizQuestion < quizQuestions.length - 1) {
              setCurrentQuizQuestion(prev => prev + 1);
              setSelectedQuizAnswer(null);
              setQuizFeedback(null);
          } else {
              setQuizFinished(true);
          }
      }, 2500);
  };

  const addToCalendar = (phase: RoadmapPhase) => {
      const title = encodeURIComponent(`Learn: ${phase.phase} (${role})`);
      const details = encodeURIComponent(`Focus on: ${phase.description}`);
      const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}`;
      window.open(url, '_blank');
  };


  // Filter phases based on selected category
  const filteredPhases = roadmap.filter(phase => {
      if (selectedCategory === 'All') return true;
      
      const normalizedCategory = selectedCategory.toLowerCase();
      // Check difficulty first since the tabs are difficulty levels
      if (phase.difficulty && phase.difficulty.toLowerCase().includes(normalizedCategory)) {
          return true;
      }
      // Check category as fallback
      if (phase.category && phase.category.toLowerCase() === normalizedCategory) {
          return true;
      }
      return false;
  });

  // If filtered phases exist, use them. Otherwise empty (handled in UI)
  const activeRoadmap = filteredPhases;
  const currentPhase = activeRoadmap[selectedPhaseIndex] || activeRoadmap[0];
  const totalPhases = roadmap.length; // Keep total phases count accurate to global count

  const getDifficultyColor = (difficulty: string) => {
    const d = difficulty.toLowerCase();
    if (d.includes("beginner")) return "bg-green-100 text-green-700";
    if (d.includes("intermediate")) return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 py-6" id="roadmap-content">
      {/* ... (Previous Header and Stats code is correct, assuming it matches context) ... */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div className="flex-1 min-w-[280px]">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-full text-xs mb-2 shadow-sm">
                <Sparkles className="w-3 h-3" />
                <span>AI-Generated Path</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1.5">{role} Roadmap</h1>
              <p className="text-sm text-gray-600">A structured, step-by-step guide to mastery. <span className="font-medium text-indigo-600">updated just now</span></p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isDownloading ? 'Saving...' : (
                    <>
                <Download className="w-4 h-4" />
                        Download PDF
                    </>
                )}
              </button>
              <button 
                 onClick={() => navigate('/onboarding')}
                 className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Role
              </button>
              <button 
                 onClick={() => navigate('/dashboard')}
                 className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors text-sm font-medium flex items-center gap-2"
              >
                Skip to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* High level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
               <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Total Phases</p>
               <p className="text-2xl font-bold text-indigo-900">{totalPhases}</p>
            </div>
             <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
               <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Completed Topics</p>
               <p className="text-2xl font-bold text-blue-900">
                  {completedTopics.size}
               </p>
            </div>
             <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
               <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Total Topics</p>
               <p className="text-2xl font-bold text-purple-900">
                 {roadmap.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0)}
               </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
               <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Progress</p>
               <p className="text-2xl font-bold text-green-900">
                 {Math.round((completedTopics.size / (roadmap.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0) || 1)) * 100)}%
               </p>
            </div>
          </div>
          
           {/* Global Progress Bar */}
           <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                <div 
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.round((completedTopics.size / (roadmap.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0) || 1)) * 100))}%` }}
                ></div>
            </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Mobile Phase Navigation & Filters */}
          <div className="lg:hidden space-y-4">
             {/* Mobile Category Tabs */}
             <div className="bg-white rounded-xl shadow-sm p-1.5 flex gap-1 overflow-x-auto no-scrollbar">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedPhaseIndex(0);
                        }}
                        className={`flex-1 min-w-[100px] py-2 px-1 text-center rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                            selectedCategory === cat 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
             </div>

             {/* Mobile Phase Dropdown/Selector */}
             <div className="bg-white rounded-xl shadow-sm p-3 border border-gray-100">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                    Current Phase
                </label>
                <select 
                    value={selectedPhaseIndex} 
                    onChange={(e) => setSelectedPhaseIndex(Number(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                    {activeRoadmap.map((phase, index) => (
                        <option key={index} value={index}>
                            Phase {index + 1}: {phase.phase} ({phase.duration})
                        </option>
                    ))}
                </select>
             </div>
          </div>

          {/* Desktop Left Sidebar - Phases Navigation */}
          <div className="hidden lg:col-span-4 lg:block space-y-4">
            
            {/* Category Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm p-1.5 flex gap-1 mb-2">
                {['All', 'Beginner', 'Intermediate', 'Advanced'].map((cat) => (
                    <button
                        key={cat}
                        onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedPhaseIndex(0);
                        }}
                        className={`flex-1 py-2 px-1 text-center rounded-lg text-xs font-bold transition-all ${
                            selectedCategory === cat 
                            ? 'bg-indigo-600 text-white shadow-sm' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-gray-900">Learning Path: {selectedCategory}</h2>
              </div>
              <div className="p-2 space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto">
                {activeRoadmap.length > 0 ? (
                    activeRoadmap.map((phase, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPhaseIndex(index)}
                        className={`w-full text-left p-4 rounded-lg border transition-all duration-200 group relative ${
                          selectedPhaseIndex === index 
                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 z-10' 
                            : 'border-transparent hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                                selectedPhaseIndex === index ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'
                            }`}>
                                Phase {index + 1}
                            </span>
                             <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getDifficultyColor(phase.difficulty)}`}>
                                {phase.difficulty}
                            </span>
                        </div>
                        <h3 className={`font-bold text-sm mb-1 ${selectedPhaseIndex === index ? 'text-indigo-900' : 'text-gray-900'}`}>
                            {phase.phase}
                        </h3>
                         <div className="flex items-center gap-2 text-xs opacity-80">
                            <Calendar className="w-3 h-3" />
                            {phase.duration}
                         </div>
                      </button>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400 italic text-sm">
                        No phases found for {selectedCategory}.
                    </div>
                )}
              </div>
            </div>
            
             {/* Quick Actions */}
             <div className="bg-white rounded-xl shadow p-4 hidden lg:block">
                 <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h3>
                 <div className="space-y-2">
                     <button 
                         onClick={() => navigate('/onboarding')}
                         className="w-full flex items-center gap-3 p-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                     >
                         <div className="p-1.5 bg-indigo-100 rounded text-indigo-600">
                             <RefreshCw className="w-4 h-4" />
                         </div>
                         <span>Start New Analysis</span>
                     </button>
                 </div>
             </div>
          </div>

          {/* Right Content - Phase Details */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl shadow-lg p-6 min-h-[500px]">
              {currentPhase ? (
                <>
              <div className="mb-6 pb-6 border-b border-gray-100">
                 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase tracking-wider">
                        Phase {selectedPhaseIndex + 1}
                        </span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-sm font-medium text-gray-500">{currentPhase.duration}</span>
                    </div>
                    
                    {/* NEW ACTION BUTTONS */}
                    <div className="flex gap-2">
                        <button 
                             onClick={() => generateQuiz(currentPhase)}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors text-sm font-bold"
                        >
                            <BrainCircuit className="w-4 h-4" /> Take Quiz
                        </button>
                        <button 
                             onClick={() => addToCalendar(currentPhase)}
                             className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                             title="Add to Google Calendar"
                        >
                            <CalendarPlus className="w-4 h-4" /> Schedule
                        </button>
                    </div>
                 </div>

                 <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{currentPhase.phase}</h2>
                 <p className="text-gray-600 text-lg leading-relaxed">{currentPhase.description}</p>
              </div>

               {/* Step-by-Step Guide */}
               {currentPhase.step_by_step_guide && currentPhase.step_by_step_guide.length > 0 && (
                <div className="mb-8 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
                      <ListChecks className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">Step-by-Step Execution Guide</h3>
                  </div>
                  <div className="space-y-4">
                    {currentPhase.step_by_step_guide.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 font-bold text-sm flex items-center justify-center mt-0.5 shadow-sm border border-indigo-200">
                          {i + 1}
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                            <p className="text-gray-700 leading-relaxed">{step}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics & Skills Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Topics Detailed View */}
                  <div className="col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-gray-900">Key Topics & Modules</h3>
                    </div>
                    <div className="space-y-4">
                        {(currentPhase.topics || []).map((topic, i) => {
                            // Determine name for key/checkbox
                            const topicName = typeof topic === 'string' ? topic : topic.name;
                            const isCompleted = completedTopics.has(topicName);

                            return (
                                <div key={i} className={`border rounded-xl p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                                    {/* Completion Checkbox */}
                                    <button 
                                        onClick={() => toggleTopicCompletion(topicName)}
                                        className={`absolute top-5 right-5 p-1 rounded-full border transition-all ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-gray-300 text-gray-200 hover:border-indigo-300'}`}
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-start gap-3 mb-2 pr-10">
                                        <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5 transition-colors ${
                                            isCompleted ? 'bg-green-200 text-green-800' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                            {i + 1}
                                        </span>
                                        <div>
                                             <h4 className={`font-bold text-lg transition-colors ${isCompleted ? 'text-green-900 line-through decoration-green-500/50' : 'text-gray-900'}`}>
                                                 {topicName}
                                             </h4>
                                             {typeof topic !== 'string' && (
                                                <p className="text-gray-600 text-sm leading-relaxed mt-1">{topic.description}</p>
                                             )}
                                        </div>
                                    </div>
                                    
                                    {typeof topic !== 'string' && (
                                        <>
                                            <div className="ml-9 mt-3 mb-4 bg-gray-50/50 p-3 rounded-lg">
                                                <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">What you'll learn:</h5>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {topic.subtopics && topic.subtopics.map((sub, j) => (
                                                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                                                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isCompleted ? 'bg-green-400' : 'bg-indigo-400'}`}></div>
                                                            {sub}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Topic Resources */}
                                            {topic.topic_resources && topic.topic_resources.length > 0 && (
                                                <div className="ml-9 mt-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {topic.topic_resources.map((res, k) => (
                                                            <a 
                                                                key={k}
                                                                href={res.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                                                            >
                                                                <BookOpen className="w-3 h-3" />
                                                                <span className="truncate max-w-[150px]">{res.name}</span>
                                                                <ExternalLink className="w-3 h-3 opacity-60" />
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Practical Application */}
                                            {topic.practical_application && (
                                                <div className="ml-9 mt-3 mb-4 bg-green-50 p-3 rounded-lg border border-green-100">
                                                    <h5 className="text-xs font-bold text-green-700 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                                        <LucideTerminal className="w-3.5 h-3.5" />
                                                        Practical Exercise:
                                                    </h5>
                                                    <p className="text-sm text-green-800 leading-relaxed font-medium">
                                                        {topic.practical_application}
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                  </div>

                  {/* Skills */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Code className="w-5 h-5 text-blue-500" />
                        <h3 className="text-lg font-bold text-gray-900">Skills Acquired</h3>
                    </div>
                     <div className="flex flex-wrap gap-2">
                        {(currentPhase.skills_covered || []).map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-sm font-medium">
                                {skill}
                            </span>
                        ))}
                         {(currentPhase.skills_covered || []).length === 0 && <span className="text-gray-400 italic text-sm">Skills integrated into topics</span>}
                    </div>
                  </div>
              </div>

              {/* Recommended Resources (Real Links) */}
               <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-lg font-bold text-gray-900">Recommended Resources</h3>
                </div>
                <div className="grid gap-3">
                    {(currentPhase.resources || []).map((res, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md hover:bg-gray-50 transition-all group">
                           {/* ... Render Link Content */}
                           <a href={res.url} target="_blank" rel="noreferrer" className="flex-1 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                    {i+1}
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 flex items-center gap-2">{res.name} <ExternalLink className="w-3 h-3 opacity-50"/></div>
                                    <div className="text-xs text-gray-500">{res.type} {res.is_free ? '• Free' : ''}</div>
                                </div>
                           </a>
                           {/* Chat Bot Action */}
                           <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    openChatWithContext(`Resource help: ${res.name}`);
                                }}
                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full"
                           >
                                <Bot className="w-5 h-5" />
                           </button>
                        </div>
                    ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                    <FolderKanban className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Build & Practice</h3>
                </div>
                <div className="space-y-4">
                    {(currentPhase.projects || []).map((proj, i) => (
                        <div key={i} className="p-5 rounded-xl border border-gray-200 bg-gray-50/50">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{proj.name}</h4>
                                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getDifficultyColor(proj.difficulty)}`}>
                                    {proj.difficulty}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm mb-3">
                                {proj.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 cursor-pointer hover:underline">
                                <LucideTerminal className="w-3.5 h-3.5" />
                                View Project Brief (Coming Soon)
                            </div>
                        </div>
                    ))}
                     {(!currentPhase.projects || currentPhase.projects.length === 0) && <p className="text-gray-500 italic">No projects listed for this phase.</p>}
                </div>
              </div>

             {/* Explore More Resources CTA */}
             <div className="mt-12 p-8 bg-gradient-to-r from-gray-900 to-indigo-900 rounded-2xl text-center text-white relative overflow-hidden group cursor-pointer" onClick={() => navigate('/resources', { state: { role, analysis: location.state?.analysis } })}>
                  <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-2">Want to explore more learning materials?</h3>
                      <p className="text-indigo-200 mb-6 max-w-lg mx-auto">Access our complete library of courses, tutorials, and documentation tailored for {role}.</p>
                      <button 
                          className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-lg hover:bg-indigo-50 transition-colors inline-flex items-center gap-2 shadow-lg"
                      >
                          <BookOpen className="w-5 h-5" />
                          Open Resource Hub
                      </button>
                  </div>
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl -ml-10 -mb-10 transition-transform group-hover:scale-125 duration-700"></div>
              </div>

                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
                    <Target className="w-12 h-12 mb-4 opacity-20" />
                    <p className="text-lg font-medium">No phases found for {selectedCategory}</p>
                    <p className="text-sm">Try selecting a different difficulty level.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

        {/* Floating Action Button (FAB) for General AI Help */}
        {!showChat && (
            <button
                onClick={() => openChatWithContext(`I need general advice on the "${role}" roadmap. Where should I start?`)}
                className="fixed bottom-6 right-6 z-40 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 hover:scale-105 transition-all flex items-center gap-2 group animate-in slide-in-from-bottom-5 duration-500"
            >
                <Bot className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-out whitespace-nowrap font-bold">
                    Ask AI Assistant
                </span>
            </button>
        )}

        {/* QUIZ MODAL */}
        {showQuiz && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95">
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-600 text-white">
                        <div className="flex items-center gap-2">
                            <BrainCircuit className="w-6 h-6" />
                            <h2 className="text-xl font-bold">Quick Verification Quiz</h2>
                        </div>
                        <button onClick={() => setShowQuiz(false)} className="hover:bg-white/20 p-1 rounded-full"><X className="w-6 h-6" /></button>
                    </div>

                    <div className="p-8">
                        {quizLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                                <p className="text-gray-500">Generating questions for this phase...</p>
                            </div>
                        ) : quizFinished ? (
                             <div className="text-center py-8">
                                <div className="inline-flex p-4 rounded-full bg-yellow-100 text-yellow-600 mb-4">
                                    <Trophy className="w-12 h-12" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                                <p className="text-lg text-gray-600 mb-6">
                                    You scored <span className="font-bold text-indigo-600">{quizScore} / {quizQuestions.length}</span>
                                </p>
                                <button 
                                    onClick={() => setShowQuiz(false)}
                                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                                >
                                    Return to Roadmap
                                </button>
                             </div>
                        ) : (
                            <div>
                                <div className="mb-6 flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Question {currentQuizQuestion + 1} of {quizQuestions.length}</span>
                                    <span className="text-sm font-bold text-indigo-600">Score: {quizScore}</span>
                                </div>
                                
                                <h3 className="text-xl font-bold text-gray-900 mb-6">
                                    {quizQuestions[currentQuizQuestion]?.question}
                                </h3>

                                <div className="grid gap-3 mb-6">
                                    {quizQuestions[currentQuizQuestion]?.options.map((option: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleQuizAnswer(idx)}
                                            disabled={selectedQuizAnswer !== null}
                                            className={`p-4 rounded-lg border-2 text-left transition-all font-medium ${
                                                selectedQuizAnswer === null 
                                                ? 'border-gray-100 hover:border-indigo-300 hover:bg-gray-50' 
                                                : selectedQuizAnswer === idx 
                                                    ? (idx === quizQuestions[currentQuizQuestion].correctAnswer ? 'border-green-500 bg-green-50 text-green-800' : 'border-red-500 bg-red-50 text-red-800')
                                                    : (idx === quizQuestions[currentQuizQuestion].correctAnswer ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-100 opacity-50')
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs ${
                                                     selectedQuizAnswer === idx ? 'border-current' : 'border-gray-300'
                                                }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                {option}
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {quizFeedback && (
                                    <div className={`p-4 rounded-lg animate-in slide-in-from-top-2 ${
                                        quizFeedback.includes('Correct') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                        <p className="font-bold">{quizFeedback}</p>
                                        {!quizFeedback.includes('Correct') && (
                                            <p className="text-sm mt-1">{quizQuestions[currentQuizQuestion].explanation}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Floating Chat Component */}
        {showChat && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh] h-[600px] animate-in zoom-in-95 duration-200">
                    <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-md z-10">
                        <div className="flex items-center gap-2">
                            <div className="bg-white/20 p-1.5 rounded-lg">
                                <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">AI Learning Assistant</h3>
                                <p className="text-xs text-indigo-100 opacity-90">Here to help with your roadmap</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowChat(false)} 
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white/90 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
                         {/* Context Banner */}
                         {chatContext && (
                             <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-lg text-xs text-indigo-800 mb-2 flex items-start gap-2">
                                 <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                 <p className="line-clamp-2"><strong>Context:</strong> {chatContext}</p>
                             </div>
                         )}

                         {/* Chat Messages */}
                         {chatMessages.map(msg => (
                             <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                                     msg.role === 'user' 
                                     ? 'bg-indigo-600 text-white rounded-tr-none shadow-sm' 
                                     : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'
                                 }`}>
                                     <p className="whitespace-pre-wrap">{msg.content}</p>
                                 </div>
                             </div>
                         ))}
                         {isChatLoading && (
                             <div className="flex justify-start">
                                 <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" />
                                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75" />
                                     <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150" />
                                 </div>
                             </div>
                         )}
                    </div>

                    <div className="p-3 bg-white border-t border-gray-100">
                        <div className="flex gap-2 items-center bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                                placeholder="Type your question..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder:text-gray-400"
                                autoFocus
                            />
                            <button 
                                onClick={handleSendChat}
                                disabled={!chatInput.trim()}
                                className="p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <MessageSquare className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            AI creates content. Check important info.
                        </p>
                    </div>
                </div>
            </div>
        )}

    </div>
  );
}


