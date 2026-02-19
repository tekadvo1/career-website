import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ProjectSetupModal from './ProjectSetupModal';
import { 
  Search, 
  TrendingUp,
  Flame,
  ChevronRight,
  X,
  Code,
  BookOpen,
  Layout,
  Folder,
  Target,
  FileText,
  BarChart,
  LogOut,
  Zap,
  Clock,
  Briefcase,
  CheckCircle,
  Layers
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
  status?: 'active' | 'completed' | 'saved' | 'none';
  // New Fields
  careerImpact?: string[];
  metrics?: {
    matchIncrease: string;
    xp: number;
    timeEstimate: string;
    roleRelevance: string;
  };
  skillGainEstimates?: {
    skill: string;
    before: number;
    after: number;
  }[];
  curriculumStats?: {
    modules: number;
    tasks: number;
    deployment: boolean;
    codeReview: boolean;
  };
  recruiterAppeal?: string[];
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || "Software Engineer";
  
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingTrending, setIsGeneratingTrending] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'recommended' | 'active' | 'completed' | 'saved'>('recommended');
  const [showSetupModal, setShowSetupModal] = useState(false);

  // Fetch projects from API with Caching
  useEffect(() => {
    const fetchProjects = async () => {
      // 1. Check Cache First
      const cacheKey = `dashboard_projects_${selectedRole}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
          try {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                  setProjects(parsed);
                  setIsLoading(false);
                  console.log("Loaded projects from cache");
                  // Optional: Background refresh could go here if needed
                  return;
              }
          } catch (e) {
              console.error("Cache parse error", e);
              localStorage.removeItem(cacheKey);
          }
      }

      setIsLoading(true);
      try {
        const analysis = location.state?.analysis;
        
        let resumeData = "";
        if (analysis) {
            const skills = analysis.skills?.map((s: any) => s.name).join(', ') || "";
            const tools = analysis.tools?.map((t: any) => t.name).join(', ') || "";
            resumeData = `
                Target Role: ${selectedRole}
                Skills: ${skills}
                Tools: ${tools}
                Experience Level: ${analysis.experienceLevel || "Beginner"}
                Focus: Generate projects that help build these specific skills.
            `;
        }

        const response = await fetch('/api/role/projects', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                role: selectedRole,
                resumeData: resumeData 
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch projects');
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            setProjects(data.data);
            localStorage.setItem(cacheKey, JSON.stringify(data.data));
        } else {
            console.error("Invalid project data format", data);
            setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [selectedRole, location.state]);

  const handleGenerateTrending = async () => {
      setIsGeneratingTrending(true);
      try {
          const response = await fetch('/api/role/projects', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                  role: selectedRole,
                  type: 'trending' // Request trending project
              })
          });

          const data = await response.json();
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
              const newProject = data.data[0];
              
              // Add to projects list (Trendiest first)
              const updatedProjects = [newProject, ...projects];
              setProjects(updatedProjects);
              
              // Update Cache
              localStorage.setItem(`dashboard_projects_${selectedRole}`, JSON.stringify(updatedProjects));

              // Open Details View
              setSelectedProject(newProject);
              setShowSetupModal(false); 
          } else {
              alert("Could not generate a trending project at this time.");
          }
      } catch (error) {
          console.error("Trending generation failed", error);
          alert("Failed to generate trending project.");
      } finally {
          setIsGeneratingTrending(false);
      }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDifficulty = difficultyFilter === "all" || 
      project.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    
    let matchesTab = true;
    if (activeTab === 'recommended') matchesTab = true; 
    else if (activeTab === 'active') matchesTab = project.status === 'active';
    else if (activeTab === 'completed') matchesTab = project.status === 'completed';
    else if (activeTab === 'saved') matchesTab = project.status === 'saved';

    return matchesSearch && matchesDifficulty && matchesTab;
  });

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col hidden md:flex">
          <div className="p-6">
              <div className="flex items-center gap-2 mb-8">
                  <div className="bg-indigo-600 p-1.5 rounded-lg">
                      <Code className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg text-gray-900">Career OS</span>
              </div>
              
              <nav className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <Layout className="w-4 h-4" /> Workspace
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg transition-colors">
                      <Folder className="w-4 h-4" /> Projects
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <Target className="w-4 h-4" /> Missions
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <FileText className="w-4 h-4" /> JD Analyzer
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <BarChart className="w-4 h-4" /> Progress
                  </button>
                  <button onClick={() => navigate('/resources')} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
                      <BookOpen className="w-4 h-4" /> Resources
                  </button>
              </nav>
          </div>
          
          <div className="mt-auto p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 px-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                      {selectedRole.substring(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">John Doe</p>
                      <p className="text-xs text-gray-500 truncate">{selectedRole}</p>
                  </div>
                  <LogOut className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
              </div>
          </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Project Dashboard</h1>
            <div className="flex items-center gap-4">
                 <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  {/* Difficulty Filter */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
                      {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                          <button
                            key={diff}
                            onClick={() => setDifficultyFilter(diff.toLowerCase())}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                difficultyFilter === diff.toLowerCase() 
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {diff}
                          </button>
                      ))}
                  </div>
                  
                  {/* GENERATE TRENDING BUTTON */}
                  <button 
                    onClick={handleGenerateTrending}
                    disabled={isGeneratingTrending}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-70 disabled:cursor-wait"
                  >
                     {isGeneratingTrending ? (
                         <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Scanning Trends...
                         </>
                     ) : (
                         <>
                            <TrendingUp className="w-4 h-4" />
                            Find New Trending Projects
                         </>
                     )}
                  </button>
            </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 px-6">
            <div className="flex gap-6">
                {[
                    { id: 'recommended', label: 'For You' },
                    { id: 'active', label: `Active (${projects.filter(p => p.status === 'active').length})` },
                    { id: 'completed', label: `Completed (${projects.filter(p => p.status === 'completed').length})` },
                    { id: 'saved', label: `Saved (${projects.filter(p => p.status === 'saved').length})` }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.id
                            ? 'border-indigo-600 text-indigo-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Project List */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
             {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : filteredProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <div
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full"
                        >
                          <div className="p-5 flex-1">
                              <div className="flex justify-between items-start mb-3">
                                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                                      project.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                      project.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                                      'bg-red-100 text-red-700'
                                  }`}>
                                      {project.difficulty}
                                  </div>
                                  {project.trending && (
                                      <Flame className="w-4 h-4 text-orange-500 fill-orange-100" />
                                  )}
                              </div>
                              <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                                  {project.title}
                              </h3>
                              <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                  {project.description}
                              </p>
                              {/* Quick Stats in Card */}
                              <div className="flex gap-4 mb-4 text-xs text-gray-500">
                                  <div className="flex items-center gap-1">
                                    <Zap className="w-3 h-3 text-indigo-500" />
                                    {project.metrics?.xp || 500} XP
                                  </div>
                                  <div className="flex items-center gap-1">
                                     <Clock className="w-3 h-3 text-gray-400" />
                                     {project.metrics?.timeEstimate || project.duration}
                                  </div>
                              </div>
                          </div>
                          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50 rounded-b-xl">
                              <span className="font-semibold text-indigo-600">{project.metrics?.matchIncrease || "+10%"} Match Boost</span>
                              <span className="flex items-center gap-1 font-medium text-green-600">
                                  {project.matchScore}% Match
                              </span>
                          </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                    <p className="text-gray-500">No projects found for this filter.</p>
                </div>
            )}
        </main>
      </div>

      {/* REDESIGNED PROJECT MODAL */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl animate-in zoom-in-95 duration-200 my-8">
            
            {/* HER0 SECTION */}
            <div className="relative bg-gradient-to-r from-gray-900 to-indigo-900 text-white p-5 rounded-t-2xl overflow-hidden">
                <div className="absolute top-0 right-0 p-3">
                    <button onClick={() => setSelectedProject(null)} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                        <X className="w-4 h-4 text-white" />
                    </button>
                </div>
                
                <div className="relative z-10">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2.5 py-0.5 bg-green-500/20 text-green-300 border border-green-500/30 rounded-full text-[10px] font-bold uppercase tracking-wider">
                            {selectedProject.matchScore}% Match
                        </span>
                        <span className="px-2.5 py-0.5 bg-white/10 text-white border border-white/20 rounded-full text-[10px] font-medium">
                            {selectedRole}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium border ${
                             selectedProject.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-200 border-green-500/30' :
                             selectedProject.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-200 border-amber-500/30' :
                             'bg-red-500/20 text-red-200 border-red-500/30'
                        }`}>
                            {selectedProject.difficulty}
                        </span>
                    </div>

                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">
                        {selectedProject.title}
                    </h2>
                    <p className="text-indigo-100 text-sm max-w-3xl mb-3 leading-relaxed">
                        {selectedProject.description}
                    </p>

                    {/* Career Impact Block */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-lg p-3 max-w-2xl">
                        <div className="flex items-center gap-1.5 mb-2 text-indigo-300 font-bold uppercase text-[10px] tracking-wider">
                            <Flame className="w-3 h-3" /> Career Impact
                        </div>
                        <div className="grid md:grid-cols-2 gap-2">
                            {selectedProject.careerImpact?.map((impact, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="mt-1 w-1 h-1 rounded-full bg-indigo-400 flex-shrink-0"></div>
                                    <span className="text-xs text-gray-100 leading-tight">{impact}</span>
                                </div>
                            )) || <span className="text-white/60 text-xs">Career impact analysis loading...</span>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row">
                {/* LEFT CONTENT COLUMN */}
                <div className="flex-1 p-5 space-y-4">
                    
                    {/* Metrics Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-indigo-50 rounded-lg p-2.5 border border-indigo-100">
                            <div className="text-indigo-600 text-[10px] font-bold uppercase tracking-wider mb-0.5">Career Match</div>
                            <div className="text-base font-bold text-gray-900">{selectedProject.metrics?.matchIncrease || "+12%"}</div>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                            <div className="text-amber-600 text-[10px] font-bold uppercase tracking-wider mb-0.5">XP Reward</div>
                            <div className="text-base font-bold text-gray-900">{selectedProject.metrics?.xp || 500} XP</div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                            <div className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-0.5">Est. Time</div>
                            <div className="text-base font-bold text-gray-900">{selectedProject.metrics?.timeEstimate || "15 Hours"}</div>
                        </div>
                         <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
                            <div className="text-green-600 text-[10px] font-bold uppercase tracking-wider mb-0.5">Role Relevance</div>
                            <div className="text-xs font-bold text-gray-900 pt-0.5 leading-tight">{selectedProject.metrics?.roleRelevance || "High Demand"}</div>
                        </div>
                    </div>

                    {/* Why Recommended */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
                           <Target className="w-4 h-4 text-indigo-600" /> 
                           Why This Project?
                        </h3>
                        <div className="space-y-2">
                             {selectedProject.whyRecommended.map((reason, index) => (
                                <div key={index} className="flex items-start gap-2.5">
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-gray-700 text-sm">{reason}</span>
                                </div>
                              ))}
                        </div>
                    </div>

                    {/* Skill Gain Estimates */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2 uppercase tracking-wide">
                           <TrendingUp className="w-4 h-4 text-indigo-600" />
                           Skill Progression
                        </h3>
                        <div className="space-y-3">
                            {selectedProject.skillGainEstimates?.map((skill, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-sm mb-1.5">
                                        <span className="font-semibold text-gray-700">{skill.skill}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-400">{skill.before}%</span>
                                            <ChevronRight className="w-3 h-3 text-gray-300" />
                                            <span className="text-indigo-600 font-bold">{skill.after}%</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                                        {/* Background Progress */}
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-gray-300" 
                                            style={{ width: `${skill.before}%` }}
                                        ></div>
                                        {/* Gain Progress */}
                                        <div 
                                            className="absolute top-0 left-0 h-full bg-indigo-500 opacity-80" 
                                            style={{ width: `${skill.after}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )) || <p className="text-sm text-gray-500">Skill analysis generating...</p>}
                        </div>
                    </div>

                    {/* Curriculum Preview */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <Layers className="w-4 h-4" /> Curriculum Preview
                        </h3>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                <span className="block text-gray-400 text-xs">Modules</span>
                                <span className="font-bold text-gray-900">{selectedProject.curriculumStats?.modules || 5} Modules</span>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                <span className="block text-gray-400 text-xs">Hands-on Tasks</span>
                                <span className="font-bold text-gray-900">{selectedProject.curriculumStats?.tasks || 12} Tasks</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {selectedProject.curriculumStats?.deployment && (
                                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Deployment Included</span>
                            )}
                            {selectedProject.curriculumStats?.codeReview && (
                                <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> Code Review Checklist</span>
                            )}
                        </div>
                    </div>

                </div>

                {/* RIGHT SIDEBAR COLUMN */}
                <div className="lg:w-72 bg-gray-50/50 p-4 space-y-3 border-l border-gray-200">
                    
                    {/* Start Panel */}
                    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-4">
                        <h3 className="text-indigo-600 font-bold text-base mb-1 flex items-center gap-2">
                            <Flame className="w-4 h-4 fill-indigo-100" /> Unlock Senior Readiness
                        </h3>
                        <p className="text-gray-500 text-xs mb-4">
                            Start this project and boost your hiring probability by {selectedProject.metrics?.matchIncrease}.
                        </p>
                        
                        <div className="space-y-2.5">
                            <button 
                                onClick={() => setShowSetupModal(true)}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs"
                            >
                                Start Project <ChevronRight className="w-4 h-4" />
                            </button>
                            <button className="w-full py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-semibold transition-all text-sm">
                                Save for Later
                            </button>
                        </div>
                    </div>

                    {/* Recruiter Value Block */}
                    <div className="bg-white rounded-xl border border-gray-200 p-3">
                         <div className="flex items-center gap-2 mb-2">
                             <Briefcase className="w-3.5 h-3.5 text-gray-900" />
                             <h4 className="font-bold text-gray-900 text-xs uppercase tracking-wide">Recruiter Value</h4>
                         </div>
                         <p className="text-[10px] text-gray-400 mb-2.5">What recruiters see after completion:</p>
                         <ul className="space-y-2">
                            {selectedProject.recruiterAppeal?.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                                    <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                                    {item}
                                </li>
                            )) || <li className="text-xs text-gray-400">Loading recruiter data...</li>}
                         </ul>
                    </div>

                    {/* Tech Stack */}
                     <div className="bg-white rounded-xl border border-gray-200 p-3">
                        <h4 className="font-bold text-gray-900 text-xs mb-2.5 uppercase tracking-wide">Tech Stack</h4>
                        <div className="flex flex-wrap gap-1">
                            {selectedProject.languages.concat(selectedProject.tools).map((tech, i) => (
                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-medium rounded border border-gray-200">
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>

                </div>
            </div>

          </div>
        </div>
      )}
      {/* SETUP MODAL */}
      {selectedProject && (
        <ProjectSetupModal 
            isOpen={showSetupModal} 
            onClose={() => setShowSetupModal(false)}
            project={selectedProject}
            role={selectedRole}
        />
      )}

    </div>
  );
}
