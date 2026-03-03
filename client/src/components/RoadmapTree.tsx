import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, GitBranch, Target, BookOpen, Clock, ChevronRight } from 'lucide-react';

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
  duration: string;
  category?: string;
  description?: string;
  topics?: (string | DetailedTopic)[];
  skills?: string[];
  skills_covered?: string[]; 
  milestones?: string[];
  step_by_step_guide?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  projects: any[]; 
  completed?: boolean;
}

export default function RoadmapTree() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const roadmap: RoadmapPhase[] = location.state?.roadmap || [];
  const role: string = location.state?.role || "Software Engineer";

  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <GitBranch className="w-16 h-16 text-emerald-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">No Roadmap Data Found</h2>
        <p className="text-slate-600 mb-6 max-w-md">Please generate your roadmap first from the main roadmap page.</p>
        <button onClick={() => navigate('/roadmap')} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium transition-colors">
          Go to Roadmap
        </button>
      </div>
    );
  }

  // Group phases by difficulty/level
  const groupedPhases = roadmap.reduce((acc, phase) => {
    const defaultLevel = phase.difficulty || phase.level || "Intermediate";
    const levelLower = defaultLevel.toLowerCase();
    
    let key = "Custom";
    if (levelLower.includes("beginner") || levelLower.includes("basic")) key = "Basic";
    else if (levelLower.includes("intermediate")) key = "Intermediate";
    else if (levelLower.includes("advanced") || levelLower.includes("expert")) key = "Advanced";
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(phase);
    return acc;
  }, {} as Record<string, RoadmapPhase[]>);

  // Sorting order for levels
  const levelOrder = ["Basic", "Intermediate", "Advanced", "Custom"];
  const sortedLevels = Object.keys(groupedPhases).sort((a, b) => {
      const idxA = levelOrder.indexOf(a);
      const idxB = levelOrder.indexOf(b);
      return (idxA !== -1 ? idxA : 99) - (idxB !== -1 ? idxB : 99);
  });

  const getLevelColor = (level: string) => {
      if (level === "Basic") return "from-emerald-400 to-emerald-600 border-emerald-500 shadow-emerald-500/20";
      if (level === "Intermediate") return "from-blue-400 to-blue-600 border-blue-500 shadow-blue-500/20";
      if (level === "Advanced") return "from-purple-400 to-purple-600 border-purple-500 shadow-purple-500/20";
      return "from-amber-400 to-amber-600 border-amber-500 shadow-amber-500/20";
  };

  const getNodeColor = (level: string) => {
      if (level === "Basic") return "border-emerald-200 bg-emerald-50";
      if (level === "Intermediate") return "border-blue-200 bg-blue-50";
      if (level === "Advanced") return "border-purple-200 bg-purple-50";
      return "border-amber-200 bg-amber-50";
  };

  const getLineColor = (level: string) => {
      if (level === "Basic") return "border-emerald-300";
      if (level === "Intermediate") return "border-blue-300";
      if (level === "Advanced") return "border-purple-300";
      return "border-amber-300";
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/roadmap')}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="bg-emerald-100 p-1.5 rounded-md">
                <GitBranch className="w-5 h-5 text-emerald-600" />
              </div>
              <h1 className="font-bold text-slate-900 text-lg sm:text-xl">
                {role} Complete Tree
              </h1>
            </div>
          </div>
          <div className="text-sm font-medium text-slate-500 hidden sm:block">
            Mindmap Mode
          </div>
        </div>
      </header>

      {/* Main Tree Container */}
      <main className="max-w-[1600px] mx-auto p-6 md:p-12 overflow-x-auto">
        <div className="flex flex-col gap-12 sm:gap-16 min-w-max pb-32">
          
          {/* Root Node */}
          <div className="flex flex-col items-center relative">
            <div className="px-8 py-4 bg-slate-900 text-white rounded-xl shadow-xl font-black text-xl border-4 border-slate-800 z-10">
              {role}
            </div>
            {/* Main trunk line dropping from root */}
            <div className="w-1 h-8 sm:h-12 bg-slate-300 -mb-1 z-0"></div>
          </div>

          <div className="flex gap-8 sm:gap-16 justify-center">
            {sortedLevels.map((level, levelIdx) => {
              const phases = groupedPhases[level];
              const levelColorStr = getLevelColor(level);
              const nodeColorStr = getNodeColor(level);
              const lineColorStr = getLineColor(level);
              
              return (
                <div key={level} className="flex flex-col relative group shrink-0 w-[350px] sm:w-[400px]">
                  {/* Connecting line from root trunk to this column */}
                  <div className={"absolute -top-12 h-12 border-l-4 " + lineColorStr} style={{ left: '50%' }}></div>
                  <div className={"absolute -top-12 border-t-4 w-full " + lineColorStr} style={{ 
                      left: levelIdx === 0 ? '50%' : '0', 
                      width: levelIdx === 0 || levelIdx === sortedLevels.length - 1 ? '50%' : '100%',
                      right: levelIdx === sortedLevels.length - 1 ? '50%' : 'auto'
                  }}></div>

                  {/* Level Header Node */}
                  <div className="flex flex-col items-center relative z-10 mb-8 sm:mb-12">
                    <div className={`px-8 py-3 bg-gradient-to-r text-white font-bold rounded-full shadow-lg border-2 ${levelColorStr}`}>
                      {level} Track
                    </div>
                    {/* Trunk connecting level header to phases */}
                    {phases.length > 0 && (
                      <div className={"absolute -bottom-8 sm:-bottom-12 h-8 sm:h-12 border-l-4 w-0 " + lineColorStr}></div>
                    )}
                  </div>

                  {/* Phases in this Level */}
                  <div className="flex flex-col gap-10 relative">
                    {/* Continuous vertical line for the column */}
                    {phases.length > 1 && (
                       <div className={"absolute top-0 bottom-0 left-[28px] sm:left-8 border-l-4 " + lineColorStr} style={{ left: '32px' }}></div>
                    )}

                    {phases.map((phase, pIdx) => {
                       const pTitle = phase.title || phase.phase || "Untitled Phase";
                       const topics = phase.topics || phase.skills || [];
                       return (
                           <div key={pIdx} className="relative z-10 ml-8">
                               {/* Horizontal branch to phase node */}
                               <div className={"absolute top-8 -left-8 w-8 border-t-4 " + lineColorStr}></div>
                               
                               <div className={`rounded-2xl border-2 p-5 shadow-sm transition-all hover:shadow-md ${nodeColorStr}`}>
                                   <div className="flex justify-between items-start mb-3">
                                       <h3 className="font-bold text-slate-800 text-lg leading-tight pr-4">
                                           {pTitle}
                                       </h3>
                                       {phase.duration && (
                                           <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 bg-white/60 px-2 py-1 rounded border border-slate-200">
                                               <Clock className="w-3 h-3" /> {phase.duration}
                                           </span>
                                       )}
                                   </div>
                                   
                                   {phase.description && (
                                       <p className="text-sm text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                                           {phase.description}
                                       </p>
                                   )}

                                   {/* Topics List as smaller nodes attached to this phase */}
                                   {topics.length > 0 && (
                                       <div className="mt-4 pt-4 border-t border-slate-200/50">
                                           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                             <Target className="w-3.5 h-3.5" /> Key Topics
                                           </div>
                                           <div className="flex flex-col gap-2">
                                               {topics.map((t, tIdx) => {
                                                   const tName = typeof t === "string" ? t : t.name;
                                                   return (
                                                       <div key={tIdx} className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-700 shadow-sm flex items-center justify-between group cursor-pointer hover:border-slate-300">
                                                           <span>{tName}</span>
                                                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
                                                       </div>
                                                   );
                                               })}
                                           </div>
                                       </div>
                                   )}
                                   
                                   {/* Projects Node attached to this phase */}
                                   {phase.projects && phase.projects.length > 0 && (
                                       <div className="mt-4 pt-4 border-t border-slate-200/50">
                                           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                             <BookOpen className="w-3.5 h-3.5" /> Phase Projects
                                           </div>
                                           <div className="flex flex-col gap-2">
                                               {phase.projects.map((proj, projIdx) => {
                                                   const projName = typeof proj === "string" ? proj : (proj.title || proj.name || "Project");
                                                   return (
                                                       <div key={projIdx} className="bg-slate-800 text-slate-100 px-3 py-2 rounded-lg text-sm font-semibold shadow-sm flex items-center justify-between border border-slate-700">
                                                           <span className="truncate pr-2">🛠️ {projName}</span>
                                                       </div>
                                                   );
                                               })}
                                           </div>
                                       </div>
                                   )}
                               </div>
                           </div>
                       );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
