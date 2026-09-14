import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../utils/apiFetch";
import Sidebar from "./Sidebar";
import {
  Search,
  Video,
  FileText,
  Globe,
  ExternalLink,
  ArrowLeft,
  GraduationCap,
  Code,
  Sparkles,
  BookOpen,
  Bookmark
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
  language: string;
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
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [savedResourceIds, setSavedResourceIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");
  
  const [isLoading, setIsLoading] = useState(true);

  const topicContext = location.state?.topicContext;
  const [contextFilter, setContextFilter] = useState<{ topicName: string; subtopicName: string | null } | null>(
      topicContext ? { topicName: topicContext.topicName, subtopicName: topicContext.subtopicName } : null
  );

  const rawRole = location.state?.role || (() => {
    try {
      const saved = sessionStorage.getItem("lastRoleAnalysis");
      return saved ? JSON.parse(saved).role : "Software Engineer";
    } catch { return "Software Engineer"; }
  })();
  const userRole = rawRole.replace(/\s*\([^)]*\)/g, "").replace(/\s+/g, " ").trim() || "Software Engineer";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resAll, resSaved] = await Promise.all([
           apiFetch("/api/resources"),
           apiFetch("/api/resources/saved").catch(() => null)
        ]);
        
        let merged = [];
        if (resAll.ok) {
           const dataAll = await resAll.json();
           if (dataAll.success) merged = dataAll.resources;
        }
        
        if (resSaved && resSaved.ok) {
           const dataSaved = await resSaved.json();
           if (dataSaved.success) {
              const savedIds = new Set<string>(dataSaved.resources.map((r: any) => String(r.id)));
              setSavedResourceIds(savedIds);
              
              const existingIds = new Set(merged.map((r: any) => String(r.id)));
              for (const r of dataSaved.resources) {
                  if (!existingIds.has(String(r.id))) {
                      merged.push(r);
                  }
              }
           }
        }
        
        const mappedResources = merged.map((r: Resource & { resource_type?: string, id: number|string }) => ({
          ...r,
          id: String(r.id),
          type: r.resource_type || r.type
        }));
        
        setResources(mappedResources);
      } catch (error) {
        console.error("Failed to fetch resources", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleToggleSave = async (resourceId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      
      const isSaved = savedResourceIds.has(resourceId);
      
      setSavedResourceIds(prev => {
          const newSet = new Set(prev);
          if (isSaved) newSet.delete(resourceId);
          else newSet.add(resourceId);
          return newSet;
      });
      
      try {
          const res = await apiFetch(`/api/resources/${resourceId}/save`, { method: "POST" });
          const data = await res.json();
          if (res.ok && data.success) {
              setSavedResourceIds(prev => {
                  const newSet = new Set(prev);
                  if (data.isSaved) newSet.add(resourceId);
                  else newSet.delete(resourceId);
                  return newSet;
              });
          } else {
               throw new Error("Failed to save");
          }
      } catch (e) {
          setSavedResourceIds(prev => {
              const newSet = new Set(prev);
              if (isSaved) newSet.add(resourceId);
              else newSet.delete(resourceId);
              return newSet;
          });
      }
  };

  const handleAiSearch = async (override?: string | React.MouseEvent) => {
    const q = typeof override === "string" ? override : searchQuery;
    if (!q) return;
    setIsAiSearching(true);
    setShowAiResults(true);
    try {
      const response = await apiFetch("/api/resources/search", {
        method: "POST",
        body: JSON.stringify({ 
          query: q, 
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
         const mappedResources = data.resources.map((r: Resource & { resource_type?: string, id: number|string }) => ({
            ...r,
            id: String(r.id),
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

  let baseResources = activeTab === "saved" ? resources.filter(r => savedResourceIds.has(r.id)) : resources;
  if (showAiResults) baseResources = aiResources;

  const filteredResources = baseResources.filter((resource) => {
    if (contextFilter) {
       const hasTopic = resource.topics?.some(t => 
          t.toLowerCase().includes(contextFilter.topicName.toLowerCase()) || 
          (contextFilter.subtopicName && t.toLowerCase().includes(contextFilter.subtopicName.toLowerCase()))
       );
       const hasTitleMatch = resource.title.toLowerCase().includes(contextFilter.topicName.toLowerCase());
       if (!hasTopic && !hasTitleMatch) return false;
    }

    const matchesSearch = showAiResults ? true : (
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.topics || []).some((topic) => topic.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const matchesLevel = selectedLevel === "all" || resource.level === selectedLevel;
    const matchesType = selectedType === "all" || resource.type === selectedType || resource.platform?.toLowerCase().includes(selectedType.toLowerCase());
    const matchesLanguage = selectedLanguage === "all" || resource.language?.toLowerCase() === selectedLanguage.toLowerCase();
    const matchesFree = !showFreeOnly || resource.free;

    return matchesSearch && matchesLevel && matchesType && matchesLanguage && matchesFree;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "course": return <GraduationCap className="w-5 h-5" />;
      case "video":
      case "youtube": return <Video className="w-5 h-5" />;
      case "documentation": return <FileText className="w-5 h-5" />;
      case "interactive": return <Code className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-[100dvh] bg-slate-50 font-sans">
      <div className="z-50 shrink-0"><Sidebar activePage="resources" /></div>
      <div className="flex-1 w-full p-4 py-6 md:p-8 overflow-y-auto min-h-0 relative">
      <div className="max-w-7xl mx-auto w-full">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Learning Resources</h1>
                <p className="text-sm text-slate-600">
                  Curated materials and references for your learning journey
                </p>
              </div>
            </div>
            {topicContext && (
                <button 
                  onClick={() => navigate(topicContext.returnTo || "/roadmap-guide", { state: location.state })}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors text-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Return to Lesson
                </button>
            )}
          </div>

          {contextFilter && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 flex items-center justify-between gap-4">
               <div>
                  <span className="text-sm font-semibold text-emerald-900">
                     Showing resources for topic: <span className="text-emerald-700">{contextFilter.topicName}</span>
                     {contextFilter.subtopicName && ` (${contextFilter.subtopicName})`}
                  </span>
               </div>
               <button 
                 onClick={() => setContextFilter(null)}
                 className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-md transition-colors"
               >
                 Clear Context
               </button>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search resources, topics, or technologies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm"
              />
            </div>
            <button
              onClick={handleAiSearch}
              disabled={isAiSearching || !searchQuery}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              {isAiSearching ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
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

          <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm bg-white text-slate-700 min-w-[120px]">
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="video">Videos</option>
              <option value="documentation">Docs</option>
              <option value="interactive">Interactive</option>
            </select>
            <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm bg-white text-slate-700 min-w-[120px]">
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="px-3 py-1.5 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-600 text-sm bg-white text-slate-700 min-w-[120px]">
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Hindi">Hindi</option>
              <option value="Chinese">Chinese</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-md cursor-pointer hover:bg-slate-50 transition-colors">
              <input type="checkbox" checked={showFreeOnly} onChange={(e) => setShowFreeOnly(e.target.checked)} className="w-3.5 h-3.5 text-emerald-600 rounded" />
              <span className="text-sm font-medium text-slate-700">Free Only</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
           <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
             <button 
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${activeTab === "all" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
             >
                All Resources
             </button>
             <button 
                onClick={() => setActiveTab("saved")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors flex items-center gap-1.5 ${activeTab === "saved" ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"}`}
             >
                <Bookmark className="w-4 h-4" /> Saved ({savedResourceIds.size})
             </button>
           </div>
           <div className="text-sm font-medium text-slate-500">
               {isLoading ? "Loading..." : `Showing ${filteredResources.length} resources`}
           </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-slate-200">
            <Sparkles className="w-10 h-10 text-emerald-500 animate-spin mx-auto" />
            <h3 className="text-lg font-semibold text-slate-700 mt-4">Loading resources...</h3>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
               {contextFilter ? `No resources found for ${contextFilter.topicName}` : "No resources found"}
            </h3>
            <p className="text-slate-600 mb-6">Try adjusting your filters or clearing the topic context.</p>
            {contextFilter && (
               <button onClick={() => setContextFilter(null)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors">
                  Browse All Resources
               </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredResources.map((resource) => {
              const isSaved = savedResourceIds.has(resource.id);
              return (
              <div key={resource.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex flex-col border border-slate-200 overflow-hidden group">
                <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{resource.platform || resource.type}</span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-emerald-700 transition-colors pr-4">{resource.title}</h3>
                  </div>
                  <button 
                     onClick={(e) => handleToggleSave(resource.id, e)}
                     className="p-1.5 hover:bg-slate-200 rounded-md transition-colors shrink-0"
                     title={isSaved ? "Unsave resource" : "Save resource"}
                  >
                     <Bookmark className={`w-5 h-5 ${isSaved ? "fill-emerald-600 text-emerald-600" : "text-slate-400"}`} />
                  </button>
                </div>

                <div className="p-4 flex flex-col flex-1 gap-4">
                  <p className="text-sm text-slate-600 line-clamp-2">{resource.description}</p>

                  <div className="flex flex-wrap gap-2 text-xs">
                     {resource.free ? (
                         <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded">Free</span>
                     ) : (
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold rounded border border-slate-200">Paid / Not confirmed</span>
                     )}
                     {resource.level && (
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded border border-slate-200">{resource.level}</span>
                     )}
                     {resource.language && resource.language !== "English" && (
                         <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-medium rounded border border-slate-200">{resource.language}</span>
                     )}
                  </div>

                  {resource.topics && resource.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-auto">
                      {resource.topics.slice(0, 3).map((topic, index) => (
                        <span key={index} className="px-2 py-0.5 bg-slate-50 border border-slate-200 rounded text-[11px] font-medium text-slate-500">
                          {topic}
                        </span>
                      ))}
                      {resource.topics.length > 3 && (
                        <span className="px-2 py-0.5 text-[11px] font-medium text-slate-400">+{resource.topics.length - 3}</span>
                      )}
                    </div>
                  )}

                  <div className="pt-2">
                    <a
                      href={resource.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-900 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      {getTypeIcon(resource.type)}
                      Open Resource
                      <ExternalLink className="w-3.5 h-3.5 ml-auto text-slate-400" />
                    </a>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

