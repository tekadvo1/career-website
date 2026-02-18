import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 

  Search, 
  TrendingUp,
  Flame,
  ChevronRight,
  X,
  Lightbulb,
  Code,

  BookOpen,
  Layout,
  Folder,
  Target,
  FileText,
  BarChart,
  LogOut
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
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedRole = location.state?.role || "Software Engineer";
  
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<'recommended' | 'active' | 'completed' | 'saved'>('recommended');

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const analysis = location.state?.analysis;
        
        // Construct context from analysis data if available
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

  const filteredProjects = projects.filter(project => {
    // 1. Search Filter
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Difficulty Filter
    const matchesDifficulty = difficultyFilter === "all" || 
      project.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    
    // 3. Tab Filter
    let matchesTab = true;
    if (activeTab === 'recommended') {
        matchesTab = true; 
    } else if (activeTab === 'active') {
        matchesTab = project.status === 'active';
    } else if (activeTab === 'completed') {
        matchesTab = project.status === 'completed';
    } else if (activeTab === 'saved') {
        matchesTab = project.status === 'saved';
    }

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

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Project Dashboard</h1>
            
            <div className="flex items-center gap-4">
                 {/* Search Bar */}
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
                  <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      {['All', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                          <button
                            key={diff}
                            onClick={() => setDifficultyFilter(diff.toLowerCase())}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                difficultyFilter === diff.toLowerCase() 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {diff}
                          </button>
                      ))}
                  </div>
            </div>
        </header>

        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200 px-6">
            <div className="flex gap-6">
                {[
                    { id: 'recommended', label: 'Trending' },
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

        {/* Scrollable Project List */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
            {selectedRole && (
              <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Showing projects for <span className="font-semibold text-gray-900">{selectedRole}</span>
              </div>
            )}

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
                              
                              <div className="flex flex-wrap gap-1.5 mb-4">
                                  {project.tags.slice(0, 3).map(tag => (
                                      <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-medium border border-gray-200">
                                          {tag}
                                      </span>
                                  ))}
                              </div>
                          </div>
                          
                          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 bg-gray-50/50 rounded-b-xl">
                              <span>{project.duration}</span>
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

      {/* Project Detail Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between z-10">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedProject.title}
                  </h2>
                  {selectedProject.trending && (
                    <div className="flex items-center gap-1 px-2.5 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-bold uppercase tracking-wide">
                      <Flame className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>
                <p className="text-gray-600">{selectedProject.description}</p>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-8">
              
              <div className="grid md:grid-cols-3 gap-6">
                  {/* Left Column: Details */}
                  <div className="md:col-span-2 space-y-8">
                      {/* Why Recommended */}
                      <div className="bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-4">
                          <Lightbulb className="w-5 h-5 text-indigo-600" />
                          <h3 className="text-lg font-bold text-gray-900">Why This Project?</h3>
                        </div>
                        <ul className="space-y-3">
                          {selectedProject.whyRecommended.map((reason, index) => (
                            <li key={index} className="flex items-start gap-3 text-gray-700 text-sm">
                              <div className="mt-1 w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0"></div>
                              {reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Setup Guide */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <BookOpen className="w-5 h-5 text-gray-900" />
                          <h3 className="text-lg font-bold text-gray-900">{selectedProject.setupGuide.title}</h3>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                          <div className="space-y-4">
                            {selectedProject.setupGuide.steps.map((step, index) => (
                              <div key={index} className="flex gap-4">
                                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                                  {index + 1}
                                </span>
                                <span className="text-gray-700 text-sm pt-0.5 leading-relaxed">{step}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                  </div>

                  {/* Right Column: Meta */}
                  <div className="space-y-6">
                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Project Stats</h4>
                          <div className="space-y-4">
                              <div>
                                  <div className="text-xs text-gray-500 mb-1">Difficulty</div>
                                  <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                                      selectedProject.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                      selectedProject.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                                      'bg-red-100 text-red-700'
                                  }`}>
                                      {selectedProject.difficulty}
                                  </div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-500 mb-1">Estimated Duration</div>
                                  <div className="font-semibold text-gray-900 text-sm">{selectedProject.duration}</div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-500 mb-1">Skills You'll Learn</div>
                                  <div className="flex flex-wrap gap-1.5">
                                      {selectedProject.skillsToDevelop.slice(0, 4).map((skill, i) => (
                                          <span key={i} className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-medium border border-green-100">
                                              {skill}
                                          </span>
                                      ))}
                                      {selectedProject.skillsToDevelop.length > 4 && (
                                          <span className="text-[10px] text-gray-400 px-1 py-0.5">+more</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                          <h4 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Tech Stack</h4>
                          <div className="space-y-4">
                              <div>
                                  <div className="text-xs text-gray-500 mb-1">Languages</div>
                                  <div className="flex flex-wrap gap-1.5">
                                      {selectedProject.languages.map((lang, i) => (
                                          <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[10px] font-medium border border-indigo-100">
                                              {lang}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                              <div>
                                  <div className="text-xs text-gray-500 mb-1">Tools</div>
                                  <div className="flex flex-wrap gap-1.5">
                                      {selectedProject.tools.map((tool, i) => (
                                          <span key={i} className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-[10px] font-medium border border-blue-100">
                                              {tool}
                                          </span>
                                      ))}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  className="px-6 py-3 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm transition-colors"
                  onClick={() => setSelectedProject(null)}
                >
                  Close
                </button>
                <button 
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors shadow-md hover:shadow-lg flex items-center gap-2"
                  onClick={() => {
                      // Logic to start project
                      alert(`Starting ${selectedProject.title}!`);
                  }}
                >
                  Start Project <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
