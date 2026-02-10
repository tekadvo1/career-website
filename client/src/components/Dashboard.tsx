import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  User,
  Search, 
  TrendingUp,
  Flame,
  ChevronRight,
  X,
  Lightbulb,
  Code,
  Wrench,
  BookOpen
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  matchScore: number;
  tags: string[];
  trending: boolean;
  whyRecommended: string[];
  skillsToDevelop: string[];
  tools: string[];
  languages: string[];
  setupGuide: {
    title: string;
    steps: string[];
  };
}

// Mock AI-generated projects based on role
const generateProjects = (): Project[] => {
  const allProjects: Project[] = [
    {
      id: "1",
      title: "Real-time Chat Application",
      description: "Build a full-stack real-time chat application with user authentication, message history, and typing indicators.",
      difficulty: "Intermediate",
      duration: "2-3 weeks",
      matchScore: 97,
      tags: ["Real-time", "Full-stack", "WebSocket"],
      trending: true,
      whyRecommended: [
        "Perfect for learning modern web development patterns",
        "Highly relevant for full-stack developer roles",
        "Teaches real-time data synchronization",
        "Great portfolio piece for job applications"
      ],
      skillsToDevelop: [
        "WebSocket implementation",
        "User authentication & authorization",
        "Database design & optimization",
        "State management",
        "Real-time UI updates"
      ],
      tools: ["VS Code", "Postman", "MongoDB Compass", "Chrome DevTools"],
      languages: ["JavaScript", "TypeScript", "HTML", "CSS"],
      setupGuide: {
        title: "Setup Instructions",
        steps: [
          "Clone the repository: git clone https://github.com/example/chat-app.git",
          "Install dependencies: npm install",
          "Set up MongoDB database (local or Atlas)",
          "Create .env file with DATABASE_URL and JWT_SECRET",
          "Run development server: npm run dev",
          "Open http://localhost:3000 in your browser",
          "Register a new account and start chatting!"
        ]
      }
    },
    {
      id: "2",
      title: "E-commerce Dashboard with Analytics",
      description: "Create an admin dashboard for e-commerce with sales analytics, inventory management, and data visualization.",
      difficulty: "Advanced",
      duration: "3-4 weeks",
      matchScore: 95,
      tags: ["Dashboard", "Analytics", "Data Viz"],
      trending: true,
      whyRecommended: [
        "Essential for product manager and analyst roles",
        "Learn data visualization best practices",
        "Understand business metrics and KPIs",
        "Build complex UI components"
      ],
      skillsToDevelop: [
        "Data visualization with charts",
        "Dashboard design patterns",
        "API integration",
        "Performance optimization",
        "Responsive design"
      ],
      tools: ["Figma", "VS Code", "Recharts", "Postman"],
      languages: ["JavaScript", "TypeScript", "SQL"],
      setupGuide: {
        title: "Setup Instructions",
        steps: [
          "Clone the repository: git clone https://github.com/example/dashboard.git",
          "Install dependencies: npm install",
          "Configure API endpoints in config.js",
          "Set up PostgreSQL database",
          "Run migrations: npm run migrate",
          "Seed sample data: npm run seed",
          "Start the app: npm start",
          "Login with demo credentials (admin@example.com / demo123)"
        ]
      }
    },
    {
      id: "3",
      title: "Task Management App with Drag & Drop",
      description: "Build a Kanban-style task management application with drag-and-drop functionality, filters, and team collaboration.",
      difficulty: "Intermediate",
      duration: "2 weeks",
      matchScore: 92,
      tags: ["Productivity", "Drag & Drop", "Collaboration"],
      trending: true,
      whyRecommended: [
        "Learn drag-and-drop interaction patterns",
        "Perfect for understanding project management tools",
        "Great for UI/UX skill development",
        "Highly used in professional environments"
      ],
      skillsToDevelop: [
        "Drag and drop functionality",
        "Complex state management",
        "Team collaboration features",
        "Filtering and sorting algorithms",
        "Optimistic UI updates"
      ],
      tools: ["VS Code", "React DevTools", "Redux DevTools"],
      languages: ["JavaScript", "TypeScript", "CSS"],
      setupGuide: {
        title: "Setup Instructions",
        steps: [
          "Clone the repository: git clone https://github.com/example/task-manager.git",
          "Install dependencies: npm install",
          "Install React DnD: npm install react-dnd react-dnd-html5-backend",
          "Copy .env.example to .env",
          "Run the development server: npm run dev",
          "Create your first board and add tasks",
          "Try dragging tasks between columns!"
        ]
      }
    },
    {
      id: "7",
      title: "Personal Todo List App",
      description: "Build your first web application - a simple todo list with add, edit, delete, and mark complete functionality.",
      difficulty: "Beginner",
      duration: "3-5 days",
      matchScore: 88,
      tags: ["Beginner", "Full-stack", "CRUD"],
      trending: true,
      whyRecommended: [
        "Perfect first project for beginners",
        "Learn fundamental CRUD operations",
        "Understand basic state management",
        "Build confidence with simple features"
      ],
      skillsToDevelop: [
        "HTML structure and semantics",
        "CSS styling and layout",
        "JavaScript DOM manipulation",
        "Local storage usage",
        "Event handling"
      ],
      tools: ["VS Code", "Chrome DevTools"],
      languages: ["JavaScript", "HTML", "CSS"],
      setupGuide: {
        title: "Setup Instructions",
        steps: [
          "Clone the repository: git clone https://github.com/example/todo-app.git",
          "Open index.html in your browser",
          "No installation needed - pure vanilla JavaScript!",
          "Start adding your first todos",
          "Try editing and deleting tasks",
          "Your data is saved in browser storage"
        ]
      }
    },
    {
      id: "8",
      title: "Weather App with API Integration",
      description: "Create a weather application that fetches real-time weather data from a public API and displays it beautifully.",
      difficulty: "Beginner",
      duration: "4-6 days",
      matchScore: 86,
      tags: ["Beginner", "API", "Frontend"],
      trending: true,
      whyRecommended: [
        "Learn how to work with APIs",
        "Perfect introduction to async JavaScript",
        "Understand HTTP requests",
        "Practice working with JSON data"
      ],
      skillsToDevelop: [
        "Fetch API usage",
        "Async/await patterns",
        "API key management",
        "Error handling",
        "Responsive design"
      ],
      tools: ["VS Code", "Postman", "Chrome DevTools"],
      languages: ["JavaScript", "HTML", "CSS"],
      setupGuide: {
        title: "Setup Instructions",
        steps: [
          "Clone the repository: git clone https://github.com/example/weather-app.git",
          "Get free API key from OpenWeatherMap.org",
          "Create config.js and add: const API_KEY = 'your_key_here'",
          "Open index.html in browser",
          "Enter a city name and click search",
          "See live weather data displayed!"
        ]
      }
    },
    {
      id: "11",
      title: "Interactive Quiz Application",
      description: "Build a multiple-choice quiz app with score tracking, timer, and result summary. Perfect for learning JavaScript basics.",
      difficulty: "Beginner",
      duration: "4-5 days",
      matchScore: 85,
      tags: ["Beginner", "Interactive", "Game"],
      trending: true,
      whyRecommended: [
        "Learn conditional logic",
        "Practice array manipulation",
        "Understand timers and intervals",
        "Create engaging user experiences"
      ],
      skillsToDevelop: [
        "Array methods",
        "Conditional statements",
        "Timer implementation",
        "Score calculation",
        "DOM updates"
      ],
      tools: ["VS Code", "Chrome DevTools"],
      languages: ["JavaScript", "HTML", "CSS"],
      setupGuide: {
        title: "Setup Instructions",
        steps: [
          "Clone the repository: git clone https://github.com/example/quiz-app.git",
          "Open index.html in browser",
          "Click 'Start Quiz' to begin",
          "Answer questions before time runs out",
          "See your score at the end",
          "Try customizing questions in questions.js"
        ]
      }
    }
  ];

  // Sort by match score and trending
  return allProjects.sort((a, b) => {
    if (a.trending && !b.trending) return -1;
    if (!a.trending && b.trending) return 1;
    return b.matchScore - a.matchScore;
  });
};

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || "Software Engineer";
  
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");

  useEffect(() => {
    // Simulate AI processing
    const timer = setTimeout(() => {
      const generatedProjects = generateProjects();
      setProjects(generatedProjects);
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [selectedRole]);

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesDifficulty = difficultyFilter === "all" || 
      project.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    
    return matchesSearch && matchesDifficulty;
  });



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Trending Projects for You
              </h1>
              <p className="text-slate-600 text-sm mt-1">
                AI-curated projects to boost your skills as a {selectedRole}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Difficulty Filter Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDifficultyFilter("all")}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    difficultyFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setDifficultyFilter("beginner")}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    difficultyFilter === "beginner"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Beginner
                </button>
                <button
                  onClick={() => setDifficultyFilter("intermediate")}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    difficultyFilter === "intermediate"
                      ? "bg-amber-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Intermediate
                </button>
                <button
                  onClick={() => setDifficultyFilter("advanced")}
                  className={`px-3 py-1.5 rounded-lg font-medium text-sm transition-all ${
                    difficultyFilter === "advanced"
                      ? "bg-red-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Advanced
                </button>
              </div>

              {/* Profile Icon */}
              <button 
                onClick={() => navigate('/profile')}
                className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg transition-shadow"
                title="View Profile"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by name, skills, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Info Banner */}
        {selectedRole && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-5 flex items-start gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-indigo-900 font-medium text-sm">
                Personalized recommendations active
              </p>
              <p className="text-indigo-700 text-xs mt-0.5">
                Based on your role: {selectedRole}
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-lg shadow-lg">
              <div className="w-5 h-5 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-base text-slate-700 font-medium">
                AI is finding the best projects for you...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="mb-4">
              <p className="text-slate-600 text-sm">
                Found <span className="font-semibold text-slate-900">{filteredProjects.length}</span> trending projects
              </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-xl hover:border-indigo-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h2>
                    {project.trending && (
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        <Flame className="w-3 h-3" />
                        Trending
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-3 mb-3 text-xs text-slate-600">
                    <span className="font-medium text-indigo-600">{project.difficulty}</span>
                    <span>•</span>
                    <span>{project.duration}</span>
                    <span>•</span>
                    <span className="font-semibold text-green-600">{project.matchScore}% Match</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-xs text-slate-500">
                      {project.languages.length} languages • {project.tools.length} tools
                    </div>
                    <ChevronRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center py-20">
                <p className="text-slate-600">
                  No projects found matching your search.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedProject.title}
                  </h2>
                  {selectedProject.trending && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      <Flame className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>
                <p className="text-slate-600 text-sm">{selectedProject.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <span className="font-medium text-indigo-600">{selectedProject.difficulty}</span>
                  <span>•</span>
                  <span className="text-slate-600">{selectedProject.duration}</span>
                  <span>•</span>
                  <span className="font-semibold text-green-600">{selectedProject.matchScore}% Match</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="ml-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Why Recommended */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Lightbulb className="w-4 h-4 text-purple-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Why This Project?</h3>
                </div>
                <ul className="space-y-1.5">
                  {selectedProject.whyRecommended.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-700 text-sm">
                      <ChevronRight className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills to Develop */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Skills You'll Develop</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.skillsToDevelop.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tools & Languages */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Wrench className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Tools Required</h3>
                  </div>
                  <div className="space-y-1.5">
                    {selectedProject.tools.map((tool, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-900 rounded-lg text-xs"
                      >
                        {tool}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Code className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Languages</h3>
                  </div>
                  <div className="space-y-1.5">
                    {selectedProject.languages.map((language, index) => (
                      <div
                        key={index}
                        className="px-3 py-1.5 bg-indigo-50 text-indigo-900 rounded-lg text-xs"
                      >
                        {language}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Setup Guide */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{selectedProject.setupGuide.title}</h3>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                  <ol className="space-y-2">
                    {selectedProject.setupGuide.steps.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="flex-shrink-0 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-slate-700 text-xs pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-3">
                <button 
                  className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Start This Project
                </button>
                <button
                  className="px-4 py-2.5 border-2 border-slate-300 hover:bg-slate-50 rounded-lg font-semibold text-sm transition-colors"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
