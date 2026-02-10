import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Target,
  TrendingUp,
  Download,
  Sparkles,
  CheckCircle2,
  Circle,
  ChevronRight,
  Code,
  Trophy,
  FolderKanban,
  BookOpen,
  Lightbulb
} from 'lucide-react';

interface Phase {
  id: number;
  name: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  status: 'current' | 'upcoming' | 'completed';
}

interface Skill {
  name: string;
  completed: boolean;
}

interface Milestone {
  name: string;
  completed: boolean;
}

interface Project {
  name: string;
  difficulty: number;
}

interface PhaseDetail {
  name: string;
  duration: string;
  skills: Skill[];
  milestones: Milestone[];
  projects: Project[];
}

export default function LearningRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = location.state?.role || "Software Engineer";
  
  const [selectedPhase, setSelectedPhase] = useState<number>(1);

  // Mock roadmap data
  const roadmapPhases: Phase[] = [
    { id: 1, name: "Foundations", duration: "2-3 months", difficulty: "Beginner", status: "current" },
    { id: 2, name: "Core Programming", duration: "3 months", difficulty: "Intermediate", status: "upcoming" },
    { id: 3, name: "Web Development", duration: "4 months", difficulty: "Intermediate", status: "upcoming" },
    { id: 4, name: "Advanced Concepts", duration: "4-5 months", difficulty: "Advanced", status: "upcoming" },
    { id: 5, name: "Career Ready", duration: "2-3 months", difficulty: "Advanced", status: "upcoming" }
  ];

  const phaseDetails: Record<number, PhaseDetail> = {
    1: {
      name: "Foundations",
      duration: "2-3 months",
      skills: [
        { name: "Programming Basics (Variables, Loops, Functions)", completed: false },
        { name: "Data Types & Operators", completed: false },
        { name: "Basic Data Structures (Arrays, Objects)", completed: false },
        { name: "Git & Version Control", completed: false }
      ],
      milestones: [
        { name: "Complete CS50 Introduction", completed: false },
        { name: "Build 5 simple console applications", completed: false },
        { name: "Master Git commands and workflows", completed: false }
      ],
      projects: [
        { name: "Calculator Application", difficulty: 1 },
        { name: "To-Do List Manager", difficulty: 1 },
        { name: "Number Guessing Game", difficulty: 1 }
      ]
    },
    2: {
      name: "Core Programming",
      duration: "3 months",
      skills: [
        { name: "Object-Oriented Programming", completed: false },
        { name: "Algorithms & Problem Solving", completed: false },
        { name: "Data Structures (Stacks, Queues, Trees)", completed: false },
        { name: "Debugging & Testing", completed: false }
      ],
      milestones: [
        { name: "Solve 50 LeetCode Easy problems", completed: false },
        { name: "Build OOP-based projects", completed: false },
        { name: "Understand Big O notation", completed: false }
      ],
      projects: [
        { name: "Library Management System", difficulty: 2 },
        { name: "Banking Application", difficulty: 2 },
        { name: "Student Grade Tracker", difficulty: 2 }
      ]
    },
    3: {
      name: "Web Development",
      duration: "4 months",
      skills: [
        { name: "HTML, CSS, JavaScript", completed: false },
        { name: "React & Component Design", completed: false },
        { name: "REST APIs & HTTP", completed: false },
        { name: "Database Basics (SQL)", completed: false }
      ],
      milestones: [
        { name: "Build 3 responsive websites", completed: false },
        { name: "Create a full-stack application", completed: false },
        { name: "Deploy projects to production", completed: false }
      ],
      projects: [
        { name: "Portfolio Website", difficulty: 2 },
        { name: "Weather App with API", difficulty: 2 },
        { name: "Blog Platform", difficulty: 3 }
      ]
    },
    4: {
      name: "Advanced Concepts",
      duration: "4-5 months",
      skills: [
        { name: "System Design Fundamentals", completed: false },
        { name: "Advanced Algorithms", completed: false },
        { name: "Cloud Services (AWS/Azure)", completed: false },
        { name: "DevOps Basics (CI/CD)", completed: false }
      ],
      milestones: [
        { name: "Design scalable systems", completed: false },
        { name: "Solve 30 LeetCode Medium problems", completed: false },
        { name: "Deploy with Docker & CI/CD", completed: false }
      ],
      projects: [
        { name: "E-commerce Platform", difficulty: 3 },
        { name: "Real-time Chat Application", difficulty: 3 },
        { name: "Social Media Clone", difficulty: 3 }
      ]
    },
    5: {
      name: "Career Ready",
      duration: "2-3 months",
      skills: [
        { name: "Interview Preparation", completed: false },
        { name: "System Design Interviews", completed: false },
        { name: "Behavioral Interview Skills", completed: false },
        { name: "Resume & Portfolio Polish", completed: false }
      ],
      milestones: [
        { name: "Complete mock interviews", completed: false },
        { name: "Build impressive portfolio", completed: false },
        { name: "Network with professionals", completed: false }
      ],
      projects: [
        { name: "Capstone Project", difficulty: 3 },
        { name: "Open Source Contribution", difficulty: 3 },
        { name: "Technical Blog", difficulty: 2 }
      ]
    }
  };

  const currentPhaseDetail = phaseDetails[selectedPhase];
  const totalDuration = "20 months";
  const completedPhases = roadmapPhases.filter(p => p.status === 'completed').length;
  const totalPhases = roadmapPhases.length;
  const overallProgress = 0;

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty === "Beginner") return "bg-green-100 text-green-700";
    if (difficulty === "Intermediate") return "bg-amber-100 text-amber-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusColor = (status: string) => {
    if (status === "current") return "border-indigo-600 bg-indigo-50";
    if (status === "completed") return "border-green-600 bg-green-50";
    return "border-gray-300 bg-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 py-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-600 text-white rounded-full text-xs mb-2">
                <Sparkles className="w-3 h-3" />
                <span>Personalized Learning Path</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1.5">Your Learning Roadmap</h1>
              <p className="text-sm text-gray-600">A structured path to become a {role}</p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
              <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-semibold">
                AI Assistant
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-600">Total Duration</p>
                <p className="font-semibold text-sm text-gray-900">{totalDuration}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-green-50 rounded-lg border border-green-200">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-600">Phases</p>
                <p className="font-semibold text-sm text-gray-900">{completedPhases} / {totalPhases} completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-xs text-gray-600">Overall Progress</p>
                <p className="font-semibold text-sm text-gray-900">{overallProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Sidebar - Phases */}
          <div className="col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Lightbulb className="w-4 h-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-gray-900">Roadmap Phases</h2>
              </div>
              <div className="space-y-2">
                {roadmapPhases.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setSelectedPhase(phase.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedPhase === phase.id 
                        ? 'border-indigo-600 bg-indigo-50' 
                        : getStatusColor(phase.status)
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">Phase {phase.id}</span>
                      <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${getDifficultyColor(phase.difficulty)}`}>
                        {phase.difficulty}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900">{phase.name}</h3>
                    <p className="text-xs text-gray-600">{phase.duration}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Phase Details */}
          <div className="col-span-9">
            <div className="bg-white rounded-xl shadow-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-2 py-1 bg-gray-800 text-white rounded text-xs font-semibold">
                  Phase {selectedPhase}
                </span>
                <h2 className="text-xl font-bold text-gray-900">{currentPhaseDetail.name}</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {currentPhaseDetail.duration}
              </p>

              {/* Skills to Learn */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Code className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-gray-900">Skills to Learn</h3>
                </div>
                <div className="space-y-2">
                  {currentPhaseDetail.skills.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      {skill.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-900">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Milestones */}
              <div className="mb-5">
                <div className="flex items-center gap-1.5 mb-3">
                  <Trophy className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-gray-900">Milestones</h3>
                </div>
                <div className="space-y-2">
                  {currentPhaseDetail.milestones.map((milestone, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-200">
                      {milestone.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      )}
                      <span className="text-sm text-gray-900">{milestone.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Practice Projects */}
              <div>
                <div className="flex items-center gap-1.5 mb-3">
                  <FolderKanban className="w-4 h-4 text-green-600" />
                  <h3 className="text-sm font-bold text-gray-900">Practice Projects</h3>
                </div>
                <div className="space-y-2">
                  {currentPhaseDetail.projects.map((project, index) => (
                    <button
                      key={index}
                      className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{project.name}</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>
                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Click on projects to get step-by-step guides with tutorials
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex gap-3 mt-4">
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors">
            <Sparkles className="w-3.5 h-3.5" />
            Get AI Learning Help
          </button>
          <button className="px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm flex items-center gap-1.5 transition-colors">
            <BookOpen className="w-3.5 h-3.5" />
            Browse Resources
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-semibold text-sm transition-colors"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
