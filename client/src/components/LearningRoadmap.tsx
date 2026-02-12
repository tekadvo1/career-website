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
  ListChecks
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

interface RoadmapPhase {
  phase: string;
  duration: string;
  difficulty: string;
  description?: string;
  topics: string[];
  skills_covered?: string[];
  step_by_step_guide: string[];
  resources: Resource[];
  projects: Project[];
}

export default function LearningRoadmap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState(location.state?.role || "Software Engineer");
  const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      // 1. Try to get data from location state 
      let analysis = location.state?.analysis;
      
      // 2. If not in state, look in localStorage
      if (!analysis || !analysis.roadmap) {
         try {
           const saved = localStorage.getItem('lastRoleAnalysis');
           if (saved) {
             const parsed = JSON.parse(saved);
             if (parsed.analysis && parsed.analysis.roadmap) {
               analysis = parsed.analysis;
               setRole(parsed.role);
             }
           }
         } catch (e) {
           console.error("Error reading from local storage", e);
         }
      }

      // 3. If still no roadmap, we might need to fetch it (or redirect)
      if (analysis && analysis.roadmap && Array.isArray(analysis.roadmap)) {
         setRoadmap(analysis.roadmap);
         setIsLoading(false);
      } else {
         // Determine if we have a role to fetch for
         // If location.state.role is present, use it. Otherwise use the default.
         const targetRole = location.state?.role || role;
         
         // Attempt to fetch fresh
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
               // Fallback if API returns structure without roadmap (shouldn't happen with new prompt)
               console.warn("API returned data but no roadmap array");
               navigate('/onboarding');
             }
           } else {
             navigate('/onboarding');
           }
         } catch (err) {
           console.error("Failed to fetch roadmap", err);
           navigate('/onboarding');
         } finally {
           setIsLoading(false);
         }
      }
    };

    loadData();
  }, [location.state, role, navigate]);

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

  const currentPhase = roadmap[selectedPhaseIndex];
  const totalPhases = roadmap.length;

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
            </div>
          </div>

          {/* High level Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-100">
               <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Total Phases</p>
               <p className="text-2xl font-bold text-indigo-900">{totalPhases}</p>
            </div>
             <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
               <p className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">Est. Duration</p>
               <p className="text-2xl font-bold text-blue-900">
                  {/* Sum durations vaguely or just show range */}
                  Varies
               </p>
            </div>
             <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
               <p className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-1">Total Topics</p>
               <p className="text-2xl font-bold text-purple-900">
                 {roadmap.reduce((acc, phase) => acc + (phase.topics?.length || 0), 0)}
               </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
               <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Projects</p>
               <p className="text-2xl font-bold text-green-900">
                 {roadmap.reduce((acc, phase) => acc + (phase.projects?.length || 0), 0)}
               </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Phases Navigation */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" />
                <h2 className="font-bold text-gray-900">Learning Phases</h2>
              </div>
              <div className="p-2 space-y-1 max-h-[calc(100vh-300px)] overflow-y-auto">
                {roadmap.map((phase, index) => (
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
                ))}
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
              <div className="mb-6 pb-6 border-b border-gray-100">
                 <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs font-bold uppercase tracking-wider">
                     Phase {selectedPhaseIndex + 1}
                    </span>
                    <span className="text-gray-400 text-sm">•</span>
                    <span className="text-sm font-medium text-gray-500">{currentPhase.duration}</span>
                 </div>
                 <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{currentPhase.phase}</h2>
                 <p className="text-gray-600 text-lg leading-relaxed">{currentPhase.description}</p>
              </div>

               {/* Step-by-Step Guide */}
               {currentPhase.step_by_step_guide && currentPhase.step_by_step_guide.length > 0 && (
                <div className="mb-8 p-6 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="flex items-center gap-2 mb-4">
                      <ListChecks className="w-5 h-5 text-indigo-600" />
                      <h3 className="text-lg font-bold text-gray-900">Step specific Guide</h3>
                  </div>
                  <div className="space-y-3">
                    {currentPhase.step_by_step_guide.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 font-bold text-xs flex items-center justify-center mt-0.5">
                          {i + 1}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Topics & Skills Grid */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                  {/* Topics */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-bold text-gray-900">Key Topics</h3>
                    </div>
                    <ul className="space-y-3">
                        {currentPhase.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-2.5">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{topic}</span>
                            </li>
                        ))}
                    </ul>
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
                    {currentPhase.resources.map((res, i) => (
                        <a 
                           key={i} 
                           href={res.url} 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md hover:bg-gray-50 transition-all group"
                        >
                           <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg">
                                 {i + 1}
                               </div>
                               <div>
                                   <div className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors flex items-center gap-2">
                                       {res.name}
                                       <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                   </div>
                                   <div className="flex gap-2 text-xs mt-0.5">
                                       <span className="font-medium text-gray-500">{res.type}</span>
                                       {res.is_free !== undefined && (
                                           <span className={`px-1.5 rounded ${res.is_free ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                               {res.is_free ? 'Free' : 'Paid'}
                                           </span>
                                       )}
                                   </div>
                               </div>
                           </div>
                           <div className="text-indigo-600 font-medium text-sm px-3 py-1 rounded-full bg-indigo-50 group-hover:bg-indigo-100 transition-colors">
                               Start Learning
                           </div>
                        </a>
                    ))}
                     {currentPhase.resources.length === 0 && <p className="text-gray-500 italic">No specific resources listed for this phase.</p>}
                </div>
              </div>

              {/* Projects */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                    <FolderKanban className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-bold text-gray-900">Build & Practice</h3>
                </div>
                <div className="space-y-4">
                    {currentPhase.projects.map((proj, i) => (
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
                                <TerminalIcon className="w-3.5 h-3.5" />
                                View Project Brief (Coming Soon)
                            </div>
                        </div>
                    ))}
                     {currentPhase.projects.length === 0 && <p className="text-gray-500 italic">No projects listed for this phase.</p>}
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

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TerminalIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>
    )
}
