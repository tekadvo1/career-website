import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Target,
  CheckCircle2,
  Code,
  Trophy,
  BookOpen,
  Sparkles,
  Zap,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Plus,
  RefreshCw,
  Search,
  X,
  PlayCircle,
  ChevronRight,
  Info
} from "lucide-react";
import { apiFetch } from '../utils/apiFetch';

interface TopicResource {
  name: string;
  url: string;
  type: string;
  is_free?: boolean;
}

interface DetailedTopic {
  name: string;
  emoji?: string;
  description: string;
  practical_application?: string;
  subtopics: string[];
  topic_resources?: TopicResource[];
}

interface RoadmapPhase {
  id?: string;
  title?: string;
  phase?: string;
  level?: string;
  difficulty?: string;
  duration?: string;
  category?: string;
  description?: string;
  topics?: (string | DetailedTopic)[];
  skills?: string[];
  skills_covered?: string[]; 
  milestones?: string[];
  step_by_step_guide?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects?: any[]; 
  completed?: boolean;
}

export default function RoadmapTree() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [zoom, setZoom] = useState(0.75);

  const _rawRole: string = location.state?.role || searchParams.get('role') || "Software Engineer";
  const selectedRole: string = _rawRole.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || "Software Engineer";

  // Get real-time AI roadmap data passed via location
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>(location.state?.roadmap || []);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  const [searchQuery, setSearchQuery] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedNode, setSelectedNode] = useState<any>(null);

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 98) return 98;
          return prev + 10; // fast loading chunks
        });
      }, 50); // fast 50ms intervals
    }

    const loadData = async () => {
      try {
        const userStr = sessionStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        // Progress
        if (user) {
          const res = await apiFetch(`/api/role/progress?role=${encodeURIComponent(selectedRole)}&userId=${user.id}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.completedTopics)) {
            setCompletedTopics(new Set(data.completedTopics));
          }
        }

        // Roadmap
        if (!roadmap || roadmap.length === 0) {
          let loadedRoadmap = null;
          const saved = sessionStorage.getItem('lastRoleAnalysis');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.role === selectedRole && parsed.analysis?.roadmap) {
                loadedRoadmap = parsed.analysis.roadmap;
              }
            } catch(e) {}
          }

          if (loadedRoadmap) {
            setRoadmap(loadedRoadmap);
          } else {
             const response = await apiFetch('/api/role/analyze', {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ role: selectedRole, userId: user?.id || null })
             });
             if (response.ok) {
                 const data = await response.json();
                 if (data.data && data.data.roadmap) {
                     setRoadmap(data.data.roadmap);
                     sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
                         role: selectedRole,
                         analysis: data.data,
                         timestamp: new Date().getTime()
                     }));
                 }
             }
          }
        }
      } catch (err) {
        console.error("Failed to fetch roadmap", err);
      } finally {
        clearInterval(interval!);
        setIsLoading(false);
        setLoadingProgress(100);
      }
    };

    loadData();

    return () => {
        if(interval) clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole]);

  // Search Logic
  const allNodes = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nodes: any[] = [];
      roadmap.forEach((phase, pIdx) => {
          const pTitle = phase.title || phase.phase || `Phase ${pIdx + 1}`;
          nodes.push({ id: `phase-${pIdx}`, phase: pTitle, name: pTitle, type: 'phase', refId: `phase-${pIdx}` });

          const skillsList = phase.skills?.length ? phase.skills : (phase.topics || []);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          skillsList.forEach((skill: any, sIdx: number) => {
              const name = typeof skill === 'string' ? skill : (skill.name || '');
              const desc = typeof skill === 'string' ? '' : (skill.description || '');
              const sId = typeof skill === 'string' ? undefined : skill.id;
              const subtopics = typeof skill === 'string' ? [] : (skill.subtopics || []);
              
              const isCompleted = (sId && completedTopics.has(sId)) || completedTopics.has(name);
              
              const topicNodeId = `topic-${pIdx}-${sIdx}`;
              nodes.push({ 
                  id: topicNodeId, phase: pTitle, name, description: desc, 
                  type: 'topic', subtopics, isCompleted, topicId: sId, refId: topicNodeId,
                  originalData: skill
              });

              subtopics.forEach((sub: string, subIdx: number) => {
                  const subNodeId = `subtopic-${pIdx}-${sIdx}-${subIdx}`;
                  nodes.push({
                      id: subNodeId, phase: pTitle, parentTopic: name, name: sub, type: 'subtopic', 
                      isCompleted: false, refId: topicNodeId // subtopics scroll to their parent topic
                  });
              });
          });
      });
      return nodes;
  }, [roadmap, completedTopics]);

  const searchResults = useMemo(() => {
      if (!searchQuery.trim()) return [];
      const query = searchQuery.toLowerCase();
      return allNodes.filter(n => 
          n.name.toLowerCase().includes(query) || 
          (n.description && n.description.toLowerCase().includes(query))
      );
  }, [searchQuery, allNodes]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectNode = (node: any) => {
      setSelectedNode(node);
      setSearchQuery("");
      const el = document.getElementById(node.refId);
      if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
  };

  const handleOpenLesson = () => {
      if (!selectedNode) return;
      const topicName = selectedNode.type === 'subtopic' ? selectedNode.parentTopic : selectedNode.name;
      const subtopicName = selectedNode.type === 'subtopic' ? selectedNode.name : undefined;
      const topicId = selectedNode.type === 'topic' ? selectedNode.topicId : undefined;
      const subtopics = selectedNode.type === 'topic' ? selectedNode.subtopics : null;

      navigate("/roadmap-guide", { 
          state: { 
              role: selectedRole, 
              topicName: subtopicName || topicName, 
              topicId: topicId, 
              subtopics: subtopics, 
              parentTopicName: subtopicName ? topicName : undefined,
              roadmap 
          } 
      });
  };

  const handleConfirmRoadmap = () => {
    // Navigate back to the flowchart version of learning roadmap
    navigate("/roadmap", {
      state: {
        role: selectedRole,
        roadmap: roadmap
      },
    });
  };

  const handleGenerateCustomPhase = async () => {
    setIsGeneratingCustom(true);
    try {
        const userStr = sessionStorage.getItem('user');
        const userId = userStr ? JSON.parse(userStr).id : null;
        
        const response = await apiFetch('/api/role/custom-roadmap-phase', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: selectedRole, prompt: customPrompt, userId })
        });
        const data = await response.json();
        if (data.success && data.phase) {
            const updatedRoadmap = [...roadmap, data.phase];
            setRoadmap(updatedRoadmap);
            setIsAddingCustom(false);
            setCustomPrompt("");
            
            // Save locally so it persists when returning to main flowchart
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
        }
    } catch (err) {
        console.error("Failed to generate custom phase", err);
    } finally {
        setIsGeneratingCustom(false);
    }
  };

  const totalDuration = roadmap.reduce((acc, phase) => {
    const dur = phase.duration || "0";
    const nums = dur.match(/\d+/g);
    let val = 0;
    if (nums && nums.length > 0) val = parseInt(nums[nums.length - 1]);
    if (dur.toLowerCase().includes('month')) val *= 4;
    return acc + val;
  }, 0);

  if (isLoading || loadingProgress < 100) {
    if (!isLoading && loadingProgress === 100) {
      // dropthrough
    } else {
      return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <Sparkles className="w-16 h-16 text-emerald-500 mb-6 animate-pulse" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4 tracking-tight">Generating Tree View...</h2>
            <div className="w-full max-w-md bg-slate-200 rounded-full h-3 mb-4 overflow-hidden shadow-inner">
                <div 
                    className="bg-emerald-500 h-3 rounded-full transition-all ease-out duration-300 relative" 
                    style={{ width: `${loadingProgress}%` }}
                >
                    <div className="absolute inset-0 bg-white/30 animate-[shimmer_1s_infinite] w-full" />
                </div>
            </div>
            <p className="text-slate-500 font-medium">Extracting AI data: {loadingProgress}%</p>
        </div>
      );
    }
  }

  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Target className="w-16 h-16 text-emerald-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Roadmap Data Found</h2>
        <p className="text-slate-600 mb-6 max-w-md">Please generate your roadmap first from the main roadmap page.</p>
        <button onClick={() => navigate('/roadmap')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
          Go to Roadmap
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8 relative font-sans">
      {/* Top Left Navigation Button */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-4 sm:top-8 left-4 sm:left-6 z-40 p-3 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center gap-2 group border border-slate-200"
      >
        <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold text-slate-700 pr-1 hidden sm:inline">Back</span>
      </button>

      {/* Search Bar */}
      <div className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-16 sm:px-0">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-10 py-2.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-700 placeholder-slate-400"
            placeholder="Search this roadmap..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Search Results */}
          {searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-slate-200 max-h-[60vh] overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="p-4 text-center text-sm text-slate-500">No matching nodes found.</div>
              ) : (
                <div className="py-2">
                  <div className="px-3 pb-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                    {searchResults.length} Match{searchResults.length !== 1 ? 'es' : ''}
                  </div>
                  {searchResults.map((res, i) => (
                    <button
                      key={i}
                      onClick={() => handleSelectNode(res)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors border-l-2 border-transparent hover:border-emerald-500 focus:bg-slate-50 focus:outline-none"
                    >
                      <div className="flex items-center gap-2">
                        {res.type === 'phase' && <Target className="w-4 h-4 text-slate-400" />}
                        {res.type === 'topic' && <BookOpen className="w-4 h-4 text-emerald-500" />}
                        {res.type === 'subtopic' && <ChevronRight className="w-4 h-4 text-amber-500" />}
                        <span className="font-semibold text-sm text-slate-700 line-clamp-1">{res.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium ml-6 mt-0.5">
                        {res.type === 'subtopic' ? `In ${res.parentTopic}` : res.phase}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed top-20 sm:top-24 right-4 sm:right-6 z-40 flex flex-col gap-2 bg-white/50 backdrop-blur-sm p-1.5 rounded-2xl border border-slate-200/50 shadow-sm shadow-slate-200">
        <button 
          onClick={() => setZoom(z => Math.min(z + 0.1, 1.5))}
          className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600 hover:text-emerald-600"
          title="Zoom In"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setZoom(1)}
          className="bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600 hover:text-emerald-600 flex items-center justify-center font-bold text-[10px] w-9 h-9 sm:w-auto sm:h-9 sm:px-2"
          title="Reset Zoom"
        >
          {Math.round(zoom * 100)}%
        </button>
        <button 
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))}
          className="p-2 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm border border-slate-100 text-slate-600 hover:text-emerald-600"
          title="Zoom Out"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div 
        className="max-w-4xl mx-auto pt-16 sm:pt-4 transition-all duration-300" 
        style={{ zoom } as React.CSSProperties}
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-5 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -mr-10 -mt-20"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between relative z-10 gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-[11px] mb-3 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>FindStreak AI Generated Mode Tree</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 tracking-tight">{selectedRole}</h1>
              <p className="text-slate-600 text-sm max-w-xl">
                Follow this intelligently structured tree path to master your career goals
              </p>
            </div>
            <div className="flex flex-col gap-3 shrink-0">
              <div className="text-center md:text-right bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Effort</p>
                <p className="text-xl font-black text-emerald-600">~{totalDuration} {totalDuration > 50 ? 'wks' : 'mos'}</p>
              </div>
              <button 
                onClick={() => setIsAddingCustom(true)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all text-center border border-emerald-400/30 w-full"
              >
                <Plus className="w-4 h-4" /> Add Phase
              </button>
            </div>
          </div>
        </div>

        {/* Roadmap Visual Structure */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 mb-5 overflow-x-auto border border-slate-200 relative">
          <div className="min-w-[700px] py-4 relative">
            
            {/* Start Line connecting start button to phases */}
            <div className="absolute top-16 left-[84px] bottom-10 w-1.5 bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-200 hidden md:block rounded-full"></div>

            {/* Start Button */}
            <div className="flex justify-start pl-[28px] mb-8 relative z-10">
              <div className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-[12px] font-bold text-base shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                <Target className="w-4 h-4" /> START YOUR JOURNEY
              </div>
            </div>

            {/* Render each phase */}
            {roadmap.map((phase, phaseIndex) => {
              const pTitle = phase.title || phase.phase || `Phase ${phaseIndex + 1}`;
              const pDuration = phase.duration || "Self-paced";
              
              // Extract data correctly from AI format
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const skillsList: any[] = phase.skills?.length 
                 ? phase.skills 
                 : (phase.topics || []);
                 
              const milestonesList = phase.milestones?.length
                 ? phase.milestones
                 : (phase.step_by_step_guide || []);
                 
              const projectsList = phase.projects?.map(p => typeof p === 'string' ? p : (p.name || p.title || 'Project')) || [];

              return (
                <div key={phaseIndex} id={`phase-${phaseIndex}`} className="mb-8 relative z-10">
                  {/* Phase Header */}
                  <div className="flex items-center gap-4 mb-4 relative">
                    {/* Circle Node overlapping the continuous line */}
                    <div className="absolute left-[58px] w-4 h-4 rounded-full bg-emerald-500 border-[3px] border-white shadow-md hidden md:block"></div>
                    
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-900 border-2 border-slate-800 text-white rounded-[12px] shadow-xl ml-8 relative z-10 overflow-hidden group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center font-bold text-base shadow-inner border border-emerald-400">
                        {phaseIndex + 1}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold tracking-tight">{pTitle}</h3>
                        <p className="text-[10px] text-emerald-400 font-semibold">{pDuration}</p>
                      </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-slate-200 to-transparent"></div>
                  </div>

                  {/* Content Grid - Staggered Layout */}
                  <div className="space-y-4 md:pl-[100px] pl-8">
                    {/* Skills Section */}
                    {skillsList.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 bg-amber-100 p-0.5 rounded text-amber-600" />
                          Skills to Master
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skillsList.map((skill, idx) => {
                            const name = typeof skill === 'string' ? skill : (skill.name || '');
                            const desc = typeof skill === 'string' ? '' : (skill.description || '');
                            const subtopics = typeof skill === 'string' ? [] : (skill.subtopics || []);
                            const sId = typeof skill === 'string' ? undefined : skill.id;
                            const isCompleted = (sId && completedTopics.has(sId)) || completedTopics.has(name);
                            const topicNodeId = `topic-${phaseIndex}-${idx}`;
                            const isSelected = selectedNode?.refId === topicNodeId;

                            return (
                              <div
                                key={idx}
                                id={topicNodeId}
                                onClick={() => handleSelectNode({ id: topicNodeId, phase: pTitle, name, description: desc, type: 'topic', subtopics, isCompleted, topicId: sId, refId: topicNodeId })}
                                className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5
                                  ${isSelected ? 'bg-emerald-100 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/50' : 
                                    isCompleted ? 'bg-emerald-50/50 border-emerald-200 text-emerald-700 hover:bg-emerald-50' : 
                                    'bg-gradient-to-br from-amber-50 to-white border-amber-200 text-slate-800 hover:shadow-lg hover:-translate-y-1'}`}
                              >
                                {isCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                                {name}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Milestones Section */}
                    {milestonesList.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 bg-emerald-100 p-0.5 rounded text-emerald-600" />
                          Milestones to Achieve
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {milestonesList.map((milestone, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-[10px] text-xs font-semibold text-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex items-start gap-2 shadow-sm"
                            >
                              <Trophy className="w-3.5 h-3.5 text-emerald-500 mt-[1px] flex-shrink-0" />
                              <span className="leading-relaxed">{milestone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {projectsList.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 bg-blue-100 p-0.5 rounded text-blue-600" />
                          Projects to Build
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          {projectsList.map((project, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-emerald-400 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all cursor-pointer text-center relative overflow-hidden group"
                            >
                              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent"></div>
                              <span className="relative z-10">{project}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* End Badge */}
            <div className="flex justify-start pl-[30px] mt-10 relative z-10 hidden md:flex">
              <div className="px-6 py-3 bg-slate-900 border-2 border-slate-800 text-white rounded-xl font-black text-lg shadow-xl flex items-center gap-2.5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-teal-600/30"></div>
                <Trophy className="w-5 h-5 text-amber-400 relative z-10" />
                <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent relative z-10">CAREER READY!</span>
                <Zap className="w-5 h-5 text-amber-400 relative z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Confirm Button */}
        <div className="bg-white rounded-2xl shadow-xl p-5 text-center border border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Ready to Start Your Journey?</h3>
          <p className="text-slate-600 mb-5 max-w-xl mx-auto text-sm">
            Return to the main flowchart view to start checking off these milestones directly.
          </p>
          <button
            onClick={handleConfirmRoadmap}
            className="h-10 px-8 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all inline-flex items-center gap-2 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
            Switch to Flowchart Mode
          </button>
        </div>
      </div>

      {/* Details Panel */}
      {selectedNode && (
        <div className="fixed top-24 sm:top-20 bottom-4 right-4 sm:right-6 w-[calc(100%-2rem)] sm:w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden flex flex-col translate-x-0 transition-transform duration-300">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-slate-700 text-sm">Node Details</span>
            </div>
            <button 
              onClick={() => setSelectedNode(null)}
              className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5 overflow-y-auto flex-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{selectedNode.phase}</div>
            <h3 className="text-lg font-black text-slate-900 mb-3">{selectedNode.name}</h3>
            
            {selectedNode.type === 'subtopic' && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-md text-xs font-semibold text-slate-600">
                <ChevronRight className="w-3.5 h-3.5" />
                Subtopic of {selectedNode.parentTopic}
              </div>
            )}

            {selectedNode.isCompleted && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Completed
              </div>
            )}

            {selectedNode.description ? (
              <p className="text-sm text-slate-600 leading-relaxed mb-6">{selectedNode.description}</p>
            ) : (
              <p className="text-sm text-slate-400 italic mb-6">No description available.</p>
            )}

            {selectedNode.type === 'topic' && selectedNode.subtopics && selectedNode.subtopics.length > 0 && (
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Subtopics ({selectedNode.subtopics.length})</h4>
                <ul className="space-y-1">
                  {selectedNode.subtopics.map((sub: string, i: number) => (
                    <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                      <span>{sub}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={handleOpenLesson}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <PlayCircle className="w-4 h-4" />
              {selectedNode.type === 'subtopic' ? 'Open Topic Lesson' : 'Open Lesson'}
            </button>
          </div>
        </div>
      )}

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
              <button 
                onClick={() => { setIsAddingCustom(false); setCustomPrompt(""); }}
                className="font-bold border-2 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 px-6 py-2 rounded-xl transition-all"
                disabled={isGeneratingCustom}
              >
                Cancel
              </button>
              <button 
                disabled={!customPrompt.trim() || isGeneratingCustom} 
                onClick={handleGenerateCustomPhase}
                className="font-bold border-2 border-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all text-white px-6 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGeneratingCustom ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" /> Generating...
                  </>
                ) : "Generate & Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
