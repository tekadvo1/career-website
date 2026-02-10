import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Video,
  FileText,
  Globe,
  ExternalLink,
  Clock,
  Star,
  ArrowLeft,
  GraduationCap,
  Code,
  Sparkles,
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: "course" | "documentation" | "video" | "tutorial" | "book" | "interactive" | "youtube";
  category: string;
  url: string;
  platform: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  free: boolean;
  rating: number;
  topics: string[];
  language: "English" | "Hindi" | "Telugu" | "Tamil" | "Kannada" | "Spanish";
}

const resourcesDatabase: Resource[] = [
  // Programming Fundamentals
  {
    id: "1",
    title: "CS50's Introduction to Computer Science",
    description: "Harvard's introduction to computer science and programming",
    type: "course",
    category: "Programming Fundamentals",
    url: "https://cs50.harvard.edu/x/",
    platform: "Harvard (edX)",
    duration: "12 weeks",
    level: "Beginner",
    free: true,
    rating: 4.9,
    topics: ["C", "Python", "SQL", "Algorithms", "Data Structures"],
    language: "English"
  },
  {
    id: "2",
    title: "The Odin Project",
    description: "Free full-stack web development curriculum",
    type: "interactive",
    category: "Web Development",
    url: "https://www.theodinproject.com/",
    platform: "The Odin Project",
    duration: "Self-paced",
    level: "Beginner",
    free: true,
    rating: 4.8,
    topics: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    language: "English"
  },
  {
    id: "3",
    title: "freeCodeCamp",
    description: "Learn to code with free courses and certifications",
    type: "interactive",
    category: "Web Development",
    url: "https://www.freecodecamp.org/",
    platform: "freeCodeCamp",
    duration: "Self-paced",
    level: "Beginner",
    free: true,
    rating: 4.7,
    topics: ["HTML", "CSS", "JavaScript", "React", "APIs"],
    language: "English"
  },

  // JavaScript
  {
    id: "4",
    title: "JavaScript.info - The Modern JavaScript Tutorial",
    description: "Comprehensive JavaScript tutorial from basics to advanced",
    type: "documentation",
    category: "JavaScript",
    url: "https://javascript.info/",
    platform: "JavaScript.info",
    duration: "Self-paced",
    level: "Beginner",
    free: true,
    rating: 4.9,
    topics: ["JavaScript", "ES6+", "Async", "DOM"],
    language: "English"
  },
  {
    id: "4a",
    title: "The Complete JavaScript Course 2024",
    description: "Master JavaScript with the most complete course! Projects, challenges, quizzes, ES6+, OOP, AJAX, Webpack",
    type: "course",
    category: "JavaScript",
    url: "https://www.udemy.com/course/the-complete-javascript-course/",
    platform: "Udemy",
    duration: "69 hours",
    level: "Beginner",
    free: false,
    rating: 4.7,
    topics: ["JavaScript", "ES6+", "Async/Await", "DOM", "OOP"],
    language: "English"
  },
  {
    id: "5",
    title: "You Don't Know JS (book series)",
    description: "Deep dive into JavaScript core concepts",
    type: "book",
    category: "JavaScript",
    url: "https://github.com/getify/You-Dont-Know-JS",
    platform: "GitHub",
    duration: "Self-paced",
    level: "Intermediate",
    free: true,
    rating: 4.8,
    topics: ["JavaScript", "Closures", "Scope", "Prototypes"],
    language: "English"
  },

  // React
  {
    id: "6",
    title: "React Official Documentation",
    description: "Official React docs with interactive tutorials",
    type: "documentation",
    category: "React",
    url: "https://react.dev/",
    platform: "React Team",
    duration: "Reference",
    level: "Beginner",
    free: true,
    rating: 4.9,
    topics: ["React", "Hooks", "Components", "State"],
    language: "English"
  },
  {
    id: "6a",
    title: "React - The Complete Guide 2024",
    description: "Dive in and learn React.js from scratch! Learn React, Hooks, Redux, React Router, Next.js, Best Practices and more!",
    type: "course",
    category: "React",
    url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
    platform: "Udemy",
    duration: "68 hours",
    level: "Beginner",
    free: false,
    rating: 4.6,
    topics: ["React", "Hooks", "Redux", "Next.js", "TypeScript"],
    language: "English"
  },

  // Data Structures & Algorithms
  {
    id: "8",
    title: "LeetCode",
    description: "Practice coding problems and prepare for technical interviews",
    type: "interactive",
    category: "Algorithms",
    url: "https://leetcode.com/",
    platform: "LeetCode",
    duration: "Ongoing",
    level: "Beginner",
    free: true,
    rating: 4.6,
    topics: ["Algorithms", "Data Structures", "Problem Solving"],
    language: "English"
  },
  {
    id: "9",
    title: "NeetCode",
    description: "Curated list of coding problems with video explanations",
    type: "video",
    category: "Algorithms",
    url: "https://neetcode.io/",
    platform: "NeetCode",
    duration: "Self-paced",
    level: "Intermediate",
    free: true,
    rating: 4.8,
    topics: ["Algorithms", "Data Structures", "Interview Prep"],
    language: "English"
  },

  // System Design
  {
    id: "10",
    title: "System Design Primer",
    description: "Learn how to design large-scale systems",
    type: "documentation",
    category: "System Design",
    url: "https://github.com/donnemartin/system-design-primer",
    platform: "GitHub",
    duration: "Self-paced",
    level: "Advanced",
    free: true,
    rating: 4.8,
    topics: ["System Design", "Scalability", "Architecture"],
    language: "English"
  },

  // YouTube Channels
  {
    id: "20",
    title: "Traversy Media",
    description: "Web development tutorials and crash courses",
    type: "youtube",
    category: "Web Development",
    url: "https://www.youtube.com/@TraversyMedia",
    platform: "YouTube",
    duration: "Various",
    level: "Beginner",
    free: true,
    rating: 4.8,
    topics: ["Web Development", "JavaScript", "React", "Node.js"],
    language: "English"
  },
  {
    id: "yt1",
    title: "Programming with Mosh",
    description: "Learn programming and software development",
    type: "youtube",
    category: "Programming Fundamentals",
    url: "https://www.youtube.com/@programmingwithmosh",
    platform: "YouTube",
    duration: "Various",
    level: "Beginner",
    free: true,
    rating: 4.9,
    topics: ["Python", "JavaScript", "C#", "Programming"],
    language: "English"
  },
  {
    id: "yt2",
    title: "freeCodeCamp.org",
    description: "Free full-length programming courses",
    type: "youtube",
    category: "Web Development",
    url: "https://www.youtube.com/@freecodecamp",
    platform: "YouTube",
    duration: "Various",
    level: "Beginner",
    free: true,
    rating: 4.9,
    topics: ["Web Development", "Python", "JavaScript", "Data Science"],
    language: "English"
  },
  {
    id: "yt4",
    title: "Code with Harry - Hindi",
    description: "Programming tutorials in Hindi for beginners",
    type: "youtube",
    category: "Programming Fundamentals",
    url: "https://www.youtube.com/@CodeWithHarry",
    platform: "YouTube",
    duration: "Various",
    level: "Beginner",
    free: true,
    rating: 4.7,
    topics: ["Python", "JavaScript", "Web Development", "DSA"],
    language: "Hindi"
  },
];

export default function ResourcesHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  // Get user's role from location state
  const userRole = location.state?.role || "Software Engineer";

  // Map roles to relevant skills/technologies
  const roleToSkills: Record<string, string[]> = {
    "Software Engineer": ["JavaScript", "React", "Node.js", "Python", "TypeScript", "Web Development", "Algorithms"],
    "Frontend Developer": ["JavaScript", "React", "CSS", "Web Development", "TypeScript"],
    "Backend Developer": ["Node.js", "Python", "MongoDB", "REST API"],
    "Full Stack Developer": ["JavaScript", "React", "Node.js", "Web Development"],
    "Data Scientist": ["Python", "Data Science", "Machine Learning"],
  };

  // Get relevant skills for the user's role
  const relevantSkills = roleToSkills[userRole] || roleToSkills["Software Engineer"];

  // Filter resources based on user's role and skills
  const getRelevanceScore = (resource: Resource): number => {
    let score = 0;
    
    // Check if resource topics match relevant skills
    resource.topics.forEach(topic => {
      if (relevantSkills.some(skill => 
        topic.toLowerCase().includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(topic.toLowerCase())
      )) {
        score += 10;
      }
    });

    // Boost highly rated resources
    score += resource.rating * 2;

    return score;
  };

  // Get personalized resources sorted by relevance
  const personalizedResources = resourcesDatabase
    .map(resource => ({
      ...resource,
      relevanceScore: getRelevanceScore(resource)
    }))
    .filter(resource => resource.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const filteredResources = personalizedResources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesLevel = selectedLevel === "all" || resource.level === selectedLevel;
    const matchesType = selectedType === "all" || resource.type === selectedType;
    const matchesLanguage = selectedLanguage === "all" || resource.language === selectedLanguage;
    const matchesFree = !showFreeOnly || resource.free;

    return matchesSearch && matchesLevel && matchesType && matchesLanguage && matchesFree;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course":
        return <GraduationCap className="w-5 h-5" />;
      case "video":
        return <Video className="w-5 h-5" />;
      case "documentation":
        return <FileText className="w-5 h-5" />;
      case "interactive":
        return <Code className="w-5 h-5" />;
      case "youtube":
        return <Video className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getPlatformBadgeColor = (platform: string) => {
    if (platform.includes("Udemy")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (platform.includes("Coursera")) return "bg-blue-100 text-blue-700 border-blue-200";
    if (platform.includes("YouTube")) return "bg-red-100 text-red-700 border-red-200";
    if (platform.includes("freeCodeCamp")) return "bg-green-100 text-green-700 border-green-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  // Count free and paid resources
  const freeCount = filteredResources.filter(r => r.free).length;
  const paidCount = filteredResources.filter(r => !r.free).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
          <div className="flex items-center gap-4 mb-4">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Learning Resources Hub</h1>
              <p className="text-sm text-slate-600">
                Personalized learning materials for <span className="font-semibold text-indigo-600">{userRole}</span>
              </p>
            </div>
          </div>

          {/* Personalization Info Banner */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-indigo-900 font-medium text-sm mb-1">
                  Resources tailored for you
                </p>
                <p className="text-xs text-indigo-700">
                  Based on your role as <strong>{userRole}</strong>, we've curated {filteredResources.length} relevant resources including {freeCount} free and {paidCount} premium options
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {relevantSkills.slice(0, 5).map((skill, index) => (
                    <span key={index} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                  {relevantSkills.length > 5 && (
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 border border-indigo-200 rounded text-xs font-medium">
                      +{relevantSkills.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources, topics, or technologies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
              >
                <option value="all">All Types</option>
                <option value="course">Courses</option>
                <option value="video">Videos</option>
                <option value="documentation">Docs</option>
                <option value="interactive">Interactive</option>
                <option value="youtube">YouTube</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Language</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
              >
                <option value="all">All Languages</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200 transition-colors w-full">
                <input
                  type="checkbox"
                  checked={showFreeOnly}
                  onChange={(e) => setShowFreeOnly(e.target.checked)}
                  className="w-3.5 h-3.5 text-indigo-600"
                />
                <span className="text-xs font-medium text-slate-700">Free Only</span>
              </label>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-4 mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-700">
                <strong>{freeCount}</strong> Free
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
              <span className="text-xs text-slate-700">
                <strong>{paidCount}</strong> Premium
              </span>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredResources.map((resource) => (
            <div key={resource.id} className="bg-white rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                  {getTypeIcon(resource.type)}
                </div>
                <div className="flex flex-col gap-1.5 items-end">
                  {resource.free ? (
                    <span className="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-semibold">
                      FREE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-indigo-500 text-white rounded text-xs font-semibold">
                      PAID
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-base font-semibold text-slate-900 mb-1.5">{resource.title}</h3>
              <p className="text-xs text-slate-600 mb-3 line-clamp-2">{resource.description}</p>

              {/* Platform Badge */}
              <div className="mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getPlatformBadgeColor(resource.platform)}`}>
                  {resource.platform}
                </span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1.5 mb-3 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5" />
                <span>{resource.duration}</span>
              </div>

              {/* Level & Rating */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  resource.level === "Beginner"
                    ? "bg-green-100 text-green-700"
                    : resource.level === "Intermediate"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-red-100 text-red-700"
                }`}>
                  {resource.level}
                </span>
                <div className="flex items-center gap-1 text-xs font-medium text-slate-700">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  {resource.rating}
                </div>
              </div>

              {/* Topics */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {resource.topics.slice(0, 3).map((topic, index) => (
                  <span key={index} className="px-1.5 py-0.5 border border-slate-300 rounded text-xs text-slate-700">
                    {topic}
                  </span>
                ))}
                {resource.topics.length > 3 && (
                  <span className="px-1.5 py-0.5 border border-slate-300 rounded text-xs text-slate-700">
                    +{resource.topics.length - 3}
                  </span>
                )}
              </div>

              {/* Action Button */}
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-1.5 transition-colors mt-auto"
              >
                {resource.free ? "Access Free" : "View Course"}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No resources found</h3>
            <p className="text-slate-600">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>
    </div>
  );
}
