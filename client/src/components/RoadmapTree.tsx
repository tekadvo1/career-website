import { useState, useEffect } from "react";
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
} from "lucide-react";

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
  
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Get real-time AI roadmap data passed via location
  const roadmap: RoadmapPhase[] = location.state?.roadmap || [];
  const selectedRole: string = location.state?.role || "Software Engineer";

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 98) return 98;
          return prev + 10; // fast loading chunks
        });
      }, 50); // fast 50ms intervals
      
      setTimeout(() => {
        setIsLoading(false);
        setLoadingProgress(100);
      }, 600);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleConfirmRoadmap = () => {
    // Navigate back to the flowchart version of learning roadmap
    navigate("/roadmap", {
      state: {
        role: selectedRole,
        roadmap: roadmap
      },
    });
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
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-8 relative">
      {/* Top Left Navigation Button */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-4 sm:top-8 left-4 sm:left-6 z-40 p-3 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md flex items-center gap-2 group border border-slate-200"
      >
        <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:-translate-x-1 transition-transform" />
        <span className="font-semibold text-slate-700 pr-1 hidden sm:inline">Back</span>
      </button>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto pt-10 sm:pt-4">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl -mr-10 -mt-20"></div>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between relative z-10 gap-6">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-full text-sm mb-4 shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>AI Generated Mode Tree</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight">{selectedRole}</h1>
              <p className="text-slate-600 text-base max-w-xl">
                Follow this intelligently structured tree path to master your career goals
              </p>
            </div>
            <div className="text-center md:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100 shrink-0">
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-1">Total Effort</p>
              <p className="text-2xl font-black text-emerald-600">~{totalDuration} {totalDuration > 50 ? 'wks' : 'mos'}</p>
            </div>
          </div>
        </div>

        {/* Roadmap Visual Structure */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-8 mb-6 overflow-x-auto border border-slate-200 relative">
          <div className="min-w-[800px] py-6 relative">
            
            {/* Start Line connecting start button to phases */}
            <div className="absolute top-20 left-[93px] bottom-16 w-1.5 bg-gradient-to-b from-emerald-200 via-emerald-300 to-emerald-200 hidden md:block rounded-full"></div>

            {/* Start Button */}
            <div className="flex justify-start pl-[28px] mb-10 relative z-10">
              <div className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-500/20 flex items-center gap-3">
                <Target className="w-5 h-5" /> START YOUR JOURNEY
              </div>
            </div>

            {/* Render each phase */}
            {roadmap.map((phase, phaseIndex) => {
              const pTitle = phase.title || phase.phase || `Phase ${phaseIndex + 1}`;
              const pDuration = phase.duration || "Self-paced";
              
              // Extract data correctly from AI format
              const skillsList = phase.skills?.length 
                 ? phase.skills 
                 : (phase.topics?.map(t => typeof t === 'string' ? t : t.name) || []);
                 
              const milestonesList = phase.milestones?.length
                 ? phase.milestones
                 : (phase.step_by_step_guide || []);
                 
              const projectsList = phase.projects?.map(p => typeof p === 'string' ? p : (p.name || p.title || 'Project')) || [];

              return (
                <div key={phaseIndex} className="mb-12 relative z-10">
                  {/* Phase Header */}
                  <div className="flex items-center gap-5 mb-6 relative">
                    {/* Circle Node overlapping the continuous line */}
                    <div className="absolute left-[65px] w-5 h-5 rounded-full bg-emerald-500 border-[3.5px] border-white shadow-md hidden md:block"></div>
                    
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-900 border-2 border-slate-800 text-white rounded-2xl shadow-xl ml-8 relative z-10 overflow-hidden group">
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center font-bold text-lg shadow-inner border border-emerald-400">
                        {phaseIndex + 1}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold tracking-tight">{pTitle}</h3>
                        <p className="text-xs text-emerald-400 font-semibold">{pDuration}</p>
                      </div>
                    </div>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-slate-200 to-transparent"></div>
                  </div>

                  {/* Content Grid - Staggered Layout */}
                  <div className="space-y-6 md:pl-[120px] pl-8">
                    {/* Skills Section */}
                    {skillsList.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Code className="w-4 h-4 bg-amber-100 p-0.5 rounded text-amber-600" />
                          Skills to Master
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {skillsList.map((skill, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-2.5 bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl text-sm font-bold text-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer shadow-sm"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones Section */}
                    {milestonesList.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 bg-emerald-100 p-0.5 rounded text-emerald-600" />
                          Milestones to Achieve
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {milestonesList.map((milestone, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-3 bg-gradient-to-br from-emerald-50 to-white border border-emerald-200 rounded-xl text-sm font-semibold text-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex items-start gap-3 shadow-sm"
                            >
                              <Trophy className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">{milestone}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects Section */}
                    {projectsList.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <BookOpen className="w-4 h-4 bg-blue-100 p-0.5 rounded text-blue-600" />
                          Projects to Build
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {projectsList.map((project, idx) => (
                            <div
                              key={idx}
                              className="px-4 py-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold text-emerald-400 hover:shadow-xl hover:shadow-emerald-900/30 hover:-translate-y-1 transition-all cursor-pointer text-center relative overflow-hidden group"
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
            <div className="flex justify-start pl-[41px] mt-16 relative z-10 hidden md:flex">
              <div className="px-8 py-4 bg-slate-900 border-2 border-slate-800 text-white rounded-2xl font-black text-xl shadow-xl flex items-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/30 to-teal-600/30"></div>
                <Trophy className="w-6 h-6 text-amber-400 relative z-10" />
                <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent relative z-10">CAREER READY!</span>
                <Zap className="w-6 h-6 text-amber-400 relative z-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Confirm Button */}
        <div className="bg-white rounded-2xl shadow-xl p-6 text-center border border-slate-200">
          <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Ready to Start Your Journey?</h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto text-base">
            Return to the main flowchart view to start checking off these milestones directly.
          </p>
          <button
            onClick={handleConfirmRoadmap}
            className="h-12 px-10 bg-slate-900 border-2 border-slate-800 hover:bg-slate-800 text-white text-base font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all inline-flex items-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            Switch to Flowchart Mode
          </button>
        </div>
      </div>
    </div>
  );
}
