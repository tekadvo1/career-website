import { apiFetch } from '../utils/apiFetch';
import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle,
  BookOpen, Trophy, Plus,
  RefreshCw, GitBranch, Share2, ChevronDown, ChevronUp, PlayCircle, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Sidebar from './Sidebar';

// --- Interfaces ---
interface Resource { name: string; url: string; type: string; is_free?: boolean; }
interface Project { id?: string; title?: string; name?: string; description: string; difficulty: string; duration?: string; matchScore?: number; tags?: string[]; trending?: boolean; languages?: string[]; tools?: string[]; }
interface TopicResource { name: string; url: string; type: string; is_free: boolean; }
interface DetailedTopic { id?: string; name: string; emoji?: string; description: string; practical_application?: string; subtopics: string[]; topic_resources: TopicResource[]; }
interface RoadmapPhase { id?: string; title?: string; phase?: string; level?: string; difficulty?: string; duration: string; category?: string; description?: string; topics?: (string | DetailedTopic)[]; skills?: string[]; skills_covered?: string[]; milestones?: string[]; step_by_step_guide?: string[]; resources?: Resource[]; projects: (string | Project)[]; completed?: boolean; }

// --- UI Utilities ---
const Button = ({ children, className = '', variant = 'default', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 h-9 px-4 py-2 cursor-pointer";
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "border border-slate-200 bg-transparent hover:bg-slate-100 text-slate-900",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.default} ${className}`} {...props}>{children}</button>;
};

const Progress = ({ value, className = '', ...props }: any) => (
  <div className={`w-full bg-slate-200 rounded-full overflow-hidden ${className}`} {...props}>
    <div className="bg-emerald-600 h-full rounded-full transition-all duration-500" style={{width: `${Math.min(100, Math.max(0, value || 0))}%`}}/>
  </div>
);

// --- Local Components ---

const LearningOverviewHeader = ({ role, onShare, onRefresh, onCustom, onTree, onResources }: any) => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6 mt-2 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-1">My Learning</h1>
                    <p className="text-slate-600 text-base">
                        <span className="font-semibold text-slate-800">{role}</span> &mdash; Follow your learning path, one topic at a time.
                    </p>
                </div>
                <div className="relative">
                    <Button variant="outline" onClick={() => setMenuOpen(!menuOpen)} className="gap-2 bg-white">
                        <span>More</span>
                        <ChevronDown className="w-4 h-4" />
                    </Button>
                    {menuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-1">
                            <button onClick={() => { setMenuOpen(false); onResources(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Resources</button>
                            <button onClick={() => { setMenuOpen(false); onShare(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Share2 className="w-4 h-4" /> Share Roadmap</button>
                            <button onClick={() => { setMenuOpen(false); onTree(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><GitBranch className="w-4 h-4" /> Alternate Map View</button>
                            <button onClick={() => { setMenuOpen(false); onCustom(); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Custom Phase</button>
                            <button onClick={() => { setMenuOpen(false); onRefresh(); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100 mt-1 pt-2"><RefreshCw className="w-4 h-4" /> Regenerate Roadmap</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ContinueLearningCard = ({ nextTopicInfo, onStart }: any) => {
    if (!nextTopicInfo) {
        return (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-bold text-slate-900 mb-2">You've completed this path!</h2>
                <p className="text-slate-600 text-sm mb-4">Great job finishing all topics. Consider practicing with projects or starting a new learning goal.</p>
            </div>
        );
    }
    return (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-xs font-bold text-emerald-700 tracking-wider uppercase mb-1">Your next lesson</p>
            <p className="text-sm text-slate-600 font-medium mb-2">{nextTopicInfo.phaseName}</p>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{nextTopicInfo.topicName}</h2>
            {nextTopicInfo.description && <p className="text-slate-600 text-sm mb-5 max-w-3xl line-clamp-2">{nextTopicInfo.description}</p>}
            <Button onClick={onStart} className="gap-2 shadow-sm font-semibold">
                <PlayCircle className="w-5 h-5" />
                {nextTopicInfo.isFirstEver ? "Start learning" : "Continue learning"}
            </Button>
        </div>
    );
};

const LearningProgressSummary = ({ completedCount, totalCount }: any) => {
    const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h3 className="font-bold text-slate-900 mb-1">Overall Progress</h3>
                <p className="text-sm text-slate-500">{completedCount} of {totalCount} topics completed</p>
            </div>
            <div className="w-full sm:w-1/2 flex items-center gap-4">
                <Progress value={percentage} className="h-3 flex-1" />
                <span className="font-bold text-slate-700 w-12 text-right">{percentage}%</span>
            </div>
        </div>
    );
};

const LearningTopicRow = ({ topic, isDone, isNext, onClickLesson, onToggleComplete, isToggling, role, onUpdateRoadmapSubtopics }: any) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isProposing, setIsProposing] = useState(false);
    const [proposals, setProposals] = useState<any[]>([]);
    const [selectedProposals, setSelectedProposals] = useState<Set<string>>(new Set());
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const subtopics = topic.subtopics || [];
    const hasSubtopics = subtopics.length > 0;

    const handlePropose = async (e: any) => {
        e.stopPropagation();
        if (!role) return;
        setIsProposing(true);
        setError(null);
        try {
            const res = await apiFetch('/api/role/propose-subtopics', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    role, 
                    topicName: topic.name, 
                    existingSubtopics: subtopics.map((s: any) => typeof s === 'string' ? s : s.name) 
                })
            });
            const data = await res.json();
            if (data.success && data.proposals) {
                setProposals(data.proposals);
                setSelectedProposals(new Set(data.proposals.map((p: any) => p.name)));
            } else {
                throw new Error(data.error || 'Failed to generate proposals');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsProposing(false);
        }
    };

    const handleSaveProposals = async () => {
        if (!onUpdateRoadmapSubtopics) return;
        setIsSaving(true);
        setError(null);
        try {
            const accepted = proposals.filter(p => selectedProposals.has(p.name));
            // Append accepted proposals to existing subtopics
            const updatedSubtopics = [...subtopics, ...accepted];
            await onUpdateRoadmapSubtopics(topic.name, updatedSubtopics);
            setProposals([]);
            setSelectedProposals(new Set());
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const toggleProposal = (name: string) => {
        const next = new Set(selectedProposals);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        setSelectedProposals(next);
    };

    return (
        <div className={`flex flex-col border-b border-slate-100 last:border-b-0 ${isNext ? 'bg-emerald-50/30' : ''}`}>
            <div className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="mt-0.5 flex-shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
                        disabled={isToggling}
                        className="focus:outline-none focus-visible:ring-2 rounded-full ring-offset-2 ring-emerald-500 disabled:opacity-50"
                        aria-label={isDone ? "Mark as incomplete" : "Mark as complete"}
                    >
                        {isToggling ? (
                            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                        ) : isDone ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        ) : (
                            <Circle className="w-6 h-6 text-slate-300 hover:text-emerald-400 transition-colors" />
                        )}
                    </button>
                </div>
                <div className="flex-1 cursor-pointer group" onClick={onClickLesson} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClickLesson()}>
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center gap-2">
                        {topic.name}
                        {isNext && <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full tracking-wider hidden sm:inline-block">Next lesson</span>}
                    </h4>
                    {topic.description && <p className="text-sm text-slate-600 mt-1 line-clamp-2 pr-4">{topic.description}</p>}
                    
                    <div className="mt-3 flex items-center gap-3">
                        {hasSubtopics ? (
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-md transition-colors"
                            >
                                {isExpanded ? <><ChevronUp className="w-3 h-3"/> Hide subtopics</> : <><ChevronDown className="w-3 h-3"/> View all {subtopics.length} subtopics</>}
                            </button>
                        ) : (
                            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                No detailed syllabus saved yet
                            </span>
                        )}
                    </div>
                    {isNext && <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full tracking-wider sm:hidden mt-2 inline-block">Next lesson</span>}
                </div>
                <div className="hidden sm:block mt-1 flex-shrink-0">
                    <Button variant="ghost" className="text-emerald-700 hover:text-emerald-800 font-semibold" onClick={(e: any) => { e.stopPropagation(); onClickLesson(); }}>
                        Open lesson
                    </Button>
                </div>
            </div>

            {/* Expandable Syllabus Area */}
            {isExpanded && (
                <div className="bg-slate-50/50 border-t border-slate-100 p-4 pl-14">
                    {hasSubtopics && (
                        <div className="space-y-2 mb-4">
                            {subtopics.map((sub: any, idx: number) => {
                                const subName = typeof sub === 'string' ? sub : sub.name;
                                const subDesc = typeof sub === 'string' ? null : sub.description;
                                return (
                                    <div key={idx} className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors shadow-sm">
                                        <div className="flex-1 pr-4">
                                            <p className="font-semibold text-slate-800 text-sm">{subName}</p>
                                            {subDesc && <p className="text-xs text-slate-500 mt-0.5">{subDesc}</p>}
                                        </div>
                                        <Button variant="outline" className="h-7 text-xs font-semibold px-3 whitespace-nowrap" onClick={(e: any) => { e.stopPropagation(); onClickLesson(subName); }}>
                                            Open lesson
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Propose Additions Section */}
                    {proposals.length === 0 ? (
                        <Button variant="outline" onClick={handlePropose} disabled={isProposing} className="w-full sm:w-auto h-8 text-xs font-semibold">
                            {isProposing ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Plus className="w-3 h-3 mr-1" />}
                            {hasSubtopics ? "Review topic coverage" : "Suggest a detailed syllabus"}
                        </Button>
                    ) : (
                        <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                            <h5 className="font-bold text-slate-900 text-sm mb-2">Proposed Additions</h5>
                            <p className="text-xs text-slate-500 mb-4">Select the subtopics you want to add to your syllabus.</p>
                            <div className="space-y-3 mb-4">
                                {proposals.map((p, i) => (
                                    <label key={i} className="flex items-start gap-3 p-3 border border-slate-100 rounded-md hover:bg-slate-50 cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="mt-1 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                                            checked={selectedProposals.has(p.name)}
                                            onChange={() => toggleProposal(p.name)}
                                        />
                                        <div>
                                            <p className="font-semibold text-slate-800 text-sm">{p.name}</p>
                                            <p className="text-xs text-slate-600 mt-1">{p.description}</p>
                                            <p className="text-xs text-emerald-700 mt-1 bg-emerald-50 inline-block px-2 py-0.5 rounded">Relevance: {p.relevance}</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                <Button onClick={handleSaveProposals} disabled={isSaving || selectedProposals.size === 0} className="h-8 text-xs font-semibold px-4">
                                    {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                                    Accept Selected Additions
                                </Button>
                                <Button variant="ghost" onClick={() => setProposals([])} className="h-8 text-xs font-semibold px-4 text-slate-500">
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    {error && (
                        <p className="text-xs text-red-600 font-medium mt-3 bg-red-50 p-2 rounded border border-red-100">
                            Error: {error}
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

const LearningPhaseSection = ({ phaseIndex, phase, isExpanded, onToggle, completedCount, totalCount, onToggleTopic, onOpenLesson, onOpenProject, togglingTopics, role, onUpdateRoadmapSubtopics }: any) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-4 overflow-hidden">
            <button 
                onClick={() => onToggle()}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between p-4 sm:p-5 bg-white hover:bg-slate-50 transition-colors text-left focus:outline-none focus-visible:bg-slate-50"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-sm border border-slate-200 flex-shrink-0">
                        {phaseIndex + 1}
                    </div>
                    <div>
                        <h3 className="font-bold text-base sm:text-lg text-slate-900">{phase.title || phase.phase}</h3>
                        <p className="text-xs sm:text-sm text-slate-500 font-medium">{completedCount} / {totalCount} topics completed</p>
                    </div>
                </div>
                <div className="text-slate-400 flex-shrink-0 ml-2">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
            </button>
            
            {isExpanded && (
                <div className="border-t border-slate-100 bg-white">
                    {(phase.topics || phase.skills || []).map((skillObj: any, topicIdx: number) => {
                        const name = typeof skillObj === 'string' ? skillObj : skillObj.name;
                        const id = typeof skillObj === 'string' ? undefined : skillObj.id;
                        const isDone = (id && onToggleTopic.has(id)) || onToggleTopic.has(name);
                        
                        return (
                            <LearningTopicRow 
                                key={id || name || topicIdx}
                                topic={typeof skillObj === 'string' ? { name } : skillObj}
                                isDone={isDone}
                                isNext={skillObj._isNext}
                                isToggling={togglingTopics.has(id || name)}
                                onClickLesson={(subtopicName?: string) => onOpenLesson(name, typeof skillObj === 'string' ? null : skillObj.subtopics, id, subtopicName)}
                                onToggleComplete={() => onToggleTopic.toggle(name, id)}
                                role={role}
                                onUpdateRoadmapSubtopics={onUpdateRoadmapSubtopics}
                            />
                        );
                    })}
                    
                    {phase.projects && phase.projects.length > 0 && (
                        <div className="bg-slate-50 p-4 sm:p-5 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 ml-1">Practice Projects</h4>
                            <div className="space-y-2">
                                {phase.projects.map((projObj: any, i: number) => {
                                    const projName = typeof projObj === 'string' ? projObj : projObj.name || projObj.title || 'Project';
                                    const projDesc = typeof projObj === 'string' ? null : projObj.description;
                                    return (
                                        <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white border border-slate-200 rounded-lg p-3 hover:border-slate-300 transition-colors shadow-sm gap-3">
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm flex items-center gap-2"><Trophy className="w-4 h-4 text-emerald-600" /> {projName}</p>
                                                {projDesc && <p className="text-xs text-slate-500 mt-1 line-clamp-1">{projDesc}</p>}
                                            </div>
                                            <Button variant="outline" className="h-8 text-xs font-semibold px-3 whitespace-nowrap bg-white w-full sm:w-auto" onClick={onOpenProject}>
                                                View project
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
export default function LearningRoadmap() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const _cleanRole = (r: string) => r ? r.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() : r;
    const initialRole = _cleanRole(location.state?.role || "Software Engineer");

    const [role, setRole] = useState(initialRole);
    const [roadmap, setRoadmap] = useState<RoadmapPhase[]>([]);
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [togglingTopics, setTogglingTopics] = useState<Set<string>>(new Set());
    
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set());
    const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const userStr = sessionStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    const res = await apiFetch(`/api/role/progress?role=${encodeURIComponent(role)}&userId=${user.id}`);
                    const data = await res.json();
                    if (data.success && Array.isArray(data.completedTopics)) {
                        setCompletedTopics(new Set(data.completedTopics));
                    }
                }
            } catch (e) { console.error(e); }

            let analysis = location.state?.analysis;
            let targetRole = location.state?.role || role;

            if (!analysis || !analysis.roadmap) {
                try {
                    const saved = sessionStorage.getItem('lastRoleAnalysis');
                    if (saved) {
                        const parsed = JSON.parse(saved);
                        if (parsed.role === targetRole || parsed.role) {
                            analysis = parsed.analysis;
                            targetRole = parsed.role;
                            setRole(targetRole);
                        }
                    }
                } catch (e) {}
            }

            if (analysis && analysis.roadmap && Array.isArray(analysis.roadmap)) {
                setRoadmap(analysis.roadmap);
                setIsLoading(false);
            } else {
                try {
                    const response = await apiFetch(`/api/role/saved-roadmap?role=${encodeURIComponent(targetRole)}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.data && data.data.roadmap) {
                            setRoadmap(data.data.roadmap);
                            sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
                                role: targetRole,
                                analysis: data.data,
                                timestamp: new Date().getTime()
                            }));
                        }
                    } else {
                        // Fallback to analyze if not found, though ideally it should already exist
                        const userStr = sessionStorage.getItem('user');
                        const user = userStr ? JSON.parse(userStr) : {};
                        const analyzeResponse = await apiFetch('/api/role/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ role: targetRole, userId: user.id || null })
                        });
                        if (analyzeResponse.ok) {
                            const data = await analyzeResponse.json();
                            if (data.data && data.data.roadmap) {
                                setRoadmap(data.data.roadmap);
                                sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({
                                    role: targetRole,
                                    analysis: data.data,
                                    timestamp: new Date().getTime()
                                }));
                            }
                        }
                    }
                } catch (err) {
                    console.error("Failed to fetch roadmap", err);
                } finally {
                    setIsLoading(false);
                }
            }
        };

        loadData();
    }, [location.state, role]);
    const handleUpdateRoadmapSubtopics = async (topicName: string, newSubtopics: string[]) => {
        try {
            // Optimistically update local state
            const updatedRoadmap = [...roadmap];
            for (const phase of updatedRoadmap) {
                const topicsList = phase.topics || phase.skills || [];
                const topicObj = topicsList.find((t: any) => (typeof t === 'string' ? t : t.name) === topicName);
                if (topicObj && typeof topicObj !== 'string') {
                    topicObj.subtopics = newSubtopics;
                    break;
                }
            }
            setRoadmap(updatedRoadmap);

            // Update backend
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
                const response = await apiFetch('/api/role/update-roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, updatedRoadmap })
                });
                if (!response.ok) throw new Error("Failed to save updated roadmap to server");
                
                // Update session storage
                const saved = sessionStorage.getItem('lastRoleAnalysis');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    parsed.analysis.roadmap = updatedRoadmap;
                    sessionStorage.setItem('lastRoleAnalysis', JSON.stringify(parsed));
                }
            }
        } catch (error) {
            console.error("Failed to update roadmap subtopics", error);
            alert("Failed to save syllabus additions. Please try again.");
            // We could roll back local state here, but for simplicity we rely on refresh if it completely fails.
        }
    };


    const toggleTopicCompletion = async (topicName: string, topicId?: string) => {
        const identifier = topicId || topicName;
        const isCompleted = !completedTopics.has(identifier) && !completedTopics.has(topicName);

        setTogglingTopics(prev => { const s = new Set(prev); s.add(identifier); return s; });

        try {
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                const response = await apiFetch('/api/role/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, role, topicName, topicId, isCompleted })
                });
                if (!response.ok) throw new Error("Failed to save progress");
                
                if (isCompleted) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#10b981', '#14b8a6'] });
                
                setCompletedTopics(prev => {
                    const newSet = new Set(prev);
                    if (isCompleted) {
                        if (topicId) newSet.add(topicId);
                        newSet.add(topicName);
                    } else {
                        if (topicId) newSet.delete(topicId);
                        newSet.delete(topicName);
                    }
                    return newSet;
                });
            }
        } catch (error) {
            console.error("Sync failed", error);
            alert("Failed to save progress. Please try again.");
        } finally {
            setTogglingTopics(prev => { const s = new Set(prev); s.delete(identifier); return s; });
        }
    };

    // Calculate metrics and Next Topic
    let totalTopicsCount = 0;
    let completedTopicsCount = 0;
    let nextTopicInfo: any = null;
    let isFirstEver = completedTopics.size === 0;

    const decoratedRoadmap = roadmap.map((phase, pIdx) => {
        const topicsList = phase.topics || phase.skills || [];
        let phaseCompleted = 0;
        
        const decTopics = topicsList.map((skillObj) => {
            const id = typeof skillObj === 'string' ? undefined : (skillObj as any).id;
            const name = typeof skillObj === 'string' ? skillObj : (skillObj as any).name;
            const desc = typeof skillObj === 'string' ? '' : (skillObj as any).description;
            const subtopics = typeof skillObj === 'string' ? [] : (skillObj as any).subtopics;
            
            const isDone = (id && completedTopics.has(id)) || completedTopics.has(name);
            
            totalTopicsCount++;
            if (isDone) phaseCompleted++;
            
            let isNext = false;
            if (!isDone && !nextTopicInfo) {
                isNext = true;
                nextTopicInfo = { phaseIndex: pIdx, phaseName: phase.title || phase.phase, topicName: name, topicId: id, description: desc, subtopics, isFirstEver };
            }
            
            return typeof skillObj === 'string' ? { name, _isNext: isNext } : { ...skillObj, _isNext: isNext };
        });
        
        completedTopicsCount += phaseCompleted;
        return { ...phase, topics: decTopics, _completedCount: phaseCompleted, _totalCount: topicsList.length };
    });

    useEffect(() => {
        if (!hasAutoExpanded && !isLoading && roadmap.length > 0) {
            if (nextTopicInfo) {
                setExpandedPhases(new Set([nextTopicInfo.phaseIndex]));
            } else if (roadmap.length > 0) {
                setExpandedPhases(new Set([0]));
            }
            setHasAutoExpanded(true);
        }
    }, [nextTopicInfo, isLoading, roadmap.length, hasAutoExpanded]);

    const handleOpenAIGuide = (topicName: string, subtopics: string[] | null, topicId?: string, subtopicName?: string) => {
        if (subtopicName) {
            navigate("/roadmap-guide", { state: { role, topicName: subtopicName, topicId: undefined, subtopics: null, parentTopicName: topicName, roadmap } });
        } else {
            navigate("/roadmap-guide", { state: { role, topicName, topicId, subtopics: subtopics || [], roadmap } });
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col md:flex-row min-h-[100dvh] bg-slate-50 font-sans">
                <div className="z-50 shrink-0"><Sidebar activePage="roadmap" /></div>
                <div className="flex-1 w-full flex items-center justify-center p-8">
                    <div className="text-center">
                        <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900">Loading your learning path...</h2>
                    </div>
                </div>
            </div>
        );
    }

    if (!roadmap || roadmap.length === 0) {
        return (
            <div className="flex flex-col md:flex-row min-h-[100dvh] bg-slate-50 font-sans">
                <div className="z-50 shrink-0"><Sidebar activePage="roadmap" /></div>
                <div className="flex-1 p-8 text-center mt-20">
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No learning path found</h2>
                    <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col md:flex-row min-h-[100dvh] bg-slate-50 font-sans text-slate-900">
            <div className="z-50 shrink-0"><Sidebar activePage="roadmap" /></div>

            <div className="flex-1 w-full flex flex-col min-h-0 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto w-full" ref={contentRef}>
                    <LearningOverviewHeader 
                        role={role}
                        onShare={() => {
                            const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                            navigator.clipboard.writeText(`${window.location.origin}/p/${user.username || user.id}`);
                            alert("Public Roadmap link copied to clipboard!");
                        }}
                        onRefresh={() => {
                            if (window.confirm("This will regenerate your roadmap based on the latest AI analysis. Existing progress mapped by name will be preserved where possible. Continue?")) {
                                setIsLoading(true);
                                const user = JSON.parse(sessionStorage.getItem('user') || '{}');
                                apiFetch('/api/role/analyze', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ role, userId: user.id || null, forceRefresh: true })
                                }).then(res => res.json()).then(data => {
                                    if (data.data?.roadmap) {
                                        setRoadmap(data.data.roadmap);
                                        sessionStorage.setItem('lastRoleAnalysis', JSON.stringify({ role, analysis: data.data, timestamp: Date.now() }));
                                    }
                                }).finally(() => setIsLoading(false));
                            }
                        }}
                        onCustom={() => alert("Feature moved to backend generation logic or view tree. See implementation.")}
                        onTree={() => navigate(`/roadmap-tree?role=${encodeURIComponent(role)}`, { state: { role, roadmap } })}
                        onResources={() => navigate("/resources")}
                    />

                    <ContinueLearningCard 
                        nextTopicInfo={nextTopicInfo} 
                        onStart={() => handleOpenAIGuide(nextTopicInfo.topicName, nextTopicInfo.subtopics, nextTopicInfo.topicId)} 
                    />

                    <LearningProgressSummary completedCount={completedTopicsCount} totalCount={totalTopicsCount} />

                    <div className="space-y-4 pb-12">
                        {decoratedRoadmap.map((phase: any, index) => (
                            <LearningPhaseSection 
                                key={index}
                                phaseIndex={index}
                                phase={phase}
                                isExpanded={expandedPhases.has(index)}
                                onToggle={() => {
                                    setExpandedPhases(prev => {
                                        const next = new Set(prev);
                                        if (next.has(index)) next.delete(index);
                                        else next.add(index);
                                        return next;
                                    });
                                }}
                                completedCount={phase._completedCount}
                                totalCount={phase._totalCount}
                                togglingTopics={togglingTopics}
                                onToggleTopic={{ has: (n: string, i?: string) => completedTopics.has(i || n), toggle: toggleTopicCompletion }}
                                onOpenLesson={handleOpenAIGuide}
                                onOpenProject={() => navigate('/dashboard')}
                                role={role}
                                onUpdateRoadmapSubtopics={handleUpdateRoadmapSubtopics}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
