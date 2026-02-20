import { useState, useEffect } from "react";
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
  X,
  ClipboardList
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

export default function ResourcesHub() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiResources, setAiResources] = useState<Resource[]>([]);
  const [showAiResults, setShowAiResults] = useState(false);
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseData, setCourseData] = useState<any>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resources on mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch('/api/resources');
        const data = await response.json();
        if (data.success) {
          // Map backend 'resource_type' to frontend 'type'
          const mappedResources = data.resources.map((r: any) => ({
            ...r,
            type: r.resource_type || r.type
          }));
          setResources(mappedResources);
        }
      } catch (error) {
        console.error("Failed to fetch resources", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleAiSearch = async () => {
    if (!searchQuery) return;
    setIsAiSearching(true);
    setShowAiResults(true);
    try {
      const response = await fetch('/api/resources/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: searchQuery, 
          role: userRole,
          filters: {
            type: selectedType,
            level: selectedLevel,
            language: selectedLanguage
          }
        })
      });
      const data = await response.json();
      if (data.success) {
         const mappedResources = data.resources.map((r: any) => ({
            ...r,
            type: r.resource_type || r.type
          }));
        setAiResources(mappedResources);
      }
    } catch (error) {
      console.error("AI Search failed", error);
    } finally {
      setIsAiSearching(false);
    }
  };

  const handleCreateCourse = async () => {
    setIsCreatingCourse(true);
    try {
      const response = await fetch('/api/resources/create-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: searchQuery || userRole, level: selectedLevel === 'all' ? 'Intermediate' : selectedLevel })
      });
      const data = await response.json();
      if (data.success) {
        setCourseData(data.course);
        setShowCourseModal(true);
      }
    } catch (error) {
      console.error("Course creation failed", error);
    } finally {
      setIsCreatingCourse(false);
    }
  };
  const [viewMode, setViewMode] = useState<'browse' | 'saved'>('browse');
  const [savedCourses, setSavedCourses] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);

  // Fetch saved courses
  const fetchSavedCourses = async () => {
    setIsLoadingSaved(true);
    try {
      const response = await fetch('/api/resources/my-courses');
      const data = await response.json();
      if (data.success) {
        setSavedCourses(data.courses);
      }
    } catch (error) {
      console.error("Failed to fetch saved courses", error);
    } finally {
      setIsLoadingSaved(false);
    }
  };

  // Save current course
  const handleSaveCourse = async () => {
    if (!courseData) return;
    setIsSaving(true);
    try {
      const response = await fetch('/api/resources/save-course', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: courseData.title, 
          courseData: courseData 
        })
      });
      
      if (response.ok) {
        alert("Course saved to your dashboard!");
        setShowCourseModal(false);
        // Refresh saved list if we are viewing it, or just invalidate
        if (viewMode === 'saved') fetchSavedCourses();
      }
    } catch (error) {
      console.error("Save failed", error);
      alert("Failed to save course progress.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle View Toggle
  const toggleView = (mode: 'browse' | 'saved') => {
    setViewMode(mode);
    if (mode === 'saved') {
      fetchSavedCourses();
    }
  };

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
    if (resource.topics) {
        resource.topics.forEach(topic => {
          if (relevantSkills.some(skill => 
            topic.toLowerCase().includes(skill.toLowerCase()) || 
            skill.toLowerCase().includes(topic.toLowerCase())
          )) {
            score += 10;
          }
        });
    }

    // Boost highly rated resources
    score += (resource.rating || 0) * 2;

    return score;
  };

  // Get personalized resources sorted by relevance
  const personalizedResources = resources
    .map(resource => ({
      ...resource,
      relevanceScore: getRelevanceScore(resource)
    }))
    .filter(resource => resource.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore);

  const filteredResources = (showAiResults ? aiResources : personalizedResources).filter((resource) => {
    // If showing AI results, skip search match as AI already did it, but keep filters
    const matchesSearch = showAiResults ? true : (
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.topics.some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const matchesLevel = selectedLevel === "all" || resource.level === selectedLevel;
    
    // Check type OR platform for flexible filtering
    const matchesType = selectedType === "all" || 
                        resource.type === selectedType || 
                        resource.platform?.toLowerCase().includes(selectedType.toLowerCase());

    const matchesLanguage = selectedLanguage === "all" || 
                            resource.language?.toLowerCase() === selectedLanguage.toLowerCase();
                            
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Learning Resources Hub</h1>
                <p className="text-sm text-slate-600">
                  Personalized learning materials for <span className="font-semibold text-indigo-600">{userRole}</span>
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleCreateCourse}
              disabled={isCreatingCourse}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              {isCreatingCourse ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Custom Course
                </>
              )}
            </button>
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

          {/* View Toggle Tabs */}
          <div className="flex gap-6 border-b border-slate-200 mb-6">
            <button
              onClick={() => toggleView('browse')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'browse' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              Browse Resources
            </button>
            <button
              onClick={() => toggleView('saved')}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                viewMode === 'saved' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              My Saved Courses
            </button>
          </div>

          {viewMode === 'browse' ? (
            <>
          {/* Search */}
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources, topics, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
              />
            </div>
            <button
              onClick={handleAiSearch}
              disabled={isAiSearching || !searchQuery}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {isAiSearching ? (
                 <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                 <Sparkles className="w-4 h-4" />
              )}
              AI Search
            </button>
            {showAiResults && (
              <button
                onClick={() => {
                  setShowAiResults(false);
                  setSearchQuery("");
                }}
                className="px-3 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Clear
              </button>
            )}
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
                <option value="udemy">Udemy</option>
                <option value="coursera">Coursera</option>
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
                <option value="Kannada">Kannada</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
                <option value="Japanese">Japanese</option>
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
          </>
          ) : (
            <div className="py-2 text-center">
              <p className="text-slate-500 text-sm">
                You have <strong>{savedCourses.length}</strong> saved learning path{savedCourses.length !== 1 ? 's' : ''}.
              </p>
            </div>
          )}
        </div>

        {viewMode === 'browse' ? (
        <>
        {/* Resources Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Sparkles className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-slate-700">Curating resources for you...</h3>
            <p className="text-slate-500 text-sm">Our AI is finding the best learning materials.</p>
          </div>
        ) : (
        <>
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
        </>
        )}
        </>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCourses.map((course) => (
               <div 
                  key={course.id} 
                  onClick={() => { setCourseData(course.course_data); setShowCourseModal(true); }}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full"
                >
                   <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-100 transition-colors">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                         {course.progress || 0}% Complete
                      </span>
                   </div>
                   <h3 className="font-bold text-slate-900 text-lg mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">
                     {course.course_data?.title || course.title}
                   </h3>
                   <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-grow">
                     {course.course_data?.description || "A personalized learning path generated by AI."}
                   </p>
                   <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Created {new Date(course.created_at).toLocaleDateString()}</span>
                      <span className="text-indigo-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Continue <ExternalLink className="w-3 h-3" />
                      </span>
                   </div>
                </div>
            ))}
            
            {savedCourses.length === 0 && !isLoadingSaved && (
               <div className="col-span-full py-16 text-center bg-white rounded-xl border-2 border-dashed border-slate-200">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-200">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">No saved learning paths yet</h3>
                  <p className="text-slate-500 mb-6 max-w-sm mx-auto">Create a custom curriculum using our AI Course Generator to start tracking your progress.</p>
                  <button onClick={() => toggleView('browse')} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                     Create New Course
                  </button>
               </div>
            )}
          </div>
        )}
        {/* Course Creation Modal */}
        {showCourseModal && courseData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
                      AI Generated Course
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                      {courseData.totalDuration}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">{courseData.title}</h2>
                </div>
                <button 
                  onClick={() => setShowCourseModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                <p className="text-slate-600 mb-6">{courseData.description}</p>
                
                <div className="space-y-6">
                  {courseData.modules?.map((module: any, idx: number) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-5 bg-slate-50/50">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-sm font-bold text-indigo-600 shadow-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{module.title}</h3>
                          <p className="text-sm text-slate-500">{module.description}</p>
                        </div>
                      </div>
                      
                      <div className="pl-11 space-y-3">
                        {/* Topics */}
                        {module.topics && (
                          <div className="flex flex-wrap gap-1.5">
                            {module.topics.map((t: string, i: number) => (
                              <span key={i} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-xs text-slate-600">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* Resources */}
                        {module.resources && (
                          <div className="bg-white rounded-lg border border-slate-200 p-3 mt-2">
                             <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                               <ClipboardList className="w-3.5 h-3.5" />
                               Recommended Materials
                             </h4>
                             <ul className="space-y-2">
                               {module.resources.map((res: any, i: number) => (
                                 <li key={i} className="text-sm">
                                   <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1.5">
                                     <ExternalLink className="w-3 h-3" />
                                     {res.title} <span className="text-slate-400 text-xs">({res.type})</span>
                                   </a>
                                 </li>
                               ))}
                             </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                <button
                  onClick={handleSaveCourse}
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  {isSaving ? 'Saving...' : 'Close & Save Progress'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
