import { apiFetch } from '../utils/apiFetch';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
    Briefcase, 
    UploadCloud, 
    Sparkles, 
    ChevronRight, 
    MessageSquare,
    Loader2,
    Bot,
    Plus,
    Play,
    RefreshCw,
    Clock,
    FileText,
    Mic,
    ArrowLeft,
    ChevronLeft,
    Save,
    CheckCircle2,
    UserCheck
} from 'lucide-react';
import Sidebar from './Sidebar';
import { useAlert } from '../contexts/AlertContext';

interface QA {
  question: string;
  answer: string;
  tip: string;
}

interface GuideResponse {
  guide: QA[];
  generalTips: string[];
}

interface SessionHistory {
  id: number;
  role: string;
  updated_at: string;
  totalQuestions: number;
  answeredCount: number;
  status: 'In progress' | 'Finished' | 'Not started';
  type: string;
}

interface DetailedFeedback {
    worked?: string;
    improvement?: string;
    suggestion?: string;
    example?: string;
}

interface AnswerAttempt {
    submitted: string;
    feedback: DetailedFeedback | string | null;
}

interface AnswerRecord {
    draft: string;
    submitted: string;
    feedback: DetailedFeedback | string | null;
    previousAttempts?: AnswerAttempt[];
}

export default function InterviewGuide() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // View state
    const [view, setView] = useState<'overview' | 'setup' | 'session' | 'summary' | 'review'>('overview');
    const [intent, setIntent] = useState<'text' | 'voice'>('text');
    
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [role, setRole] = useState("Software Engineer");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    
    // Data state
    const [guideData, setGuideData] = useState<GuideResponse | null>(null);
    const [questionHelp, setQuestionHelp] = useState<{[key: number]: string}>({});
    const [answersData, setAnswersData] = useState<{[key: number]: AnswerRecord}>({});

    const [loadingHelp, setLoadingHelp] = useState<{[key: number]: boolean}>({});

    // History state
    const [recentSessions, setRecentSessions] = useState<SessionHistory[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);
    const [historyError, setHistoryError] = useState(false);
    const [historyRoleFilter, setHistoryRoleFilter] = useState("All");
    const [historyStatusFilter, setHistoryStatusFilter] = useState("All");
    const [reviewIdx, setReviewIdx] = useState(0);

    // Practice Session State
    const [currentIdx, setCurrentIdx] = useState(0);
    const [currentDraft, setCurrentDraft] = useState("");
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [revealedAnswers, setRevealedAnswers] = useState<{[key: number]: boolean}>({});

    const saveToBackend = async (data: GuideResponse, help: {[key: number]: string}, ansData: {[key: number]: AnswerRecord}, currentRole: string) => {
        const userStr = sessionStorage.getItem('user');
        if (!userStr) return false;
        const user = JSON.parse(userStr);
        try {
            await apiFetch('/api/ai/interview-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: currentRole,
                    guideData: data,
                    questionHelp: help,
                    answersData: ansData
                })
            });
            fetchHistory(); // refresh history after save
            return true;
        } catch (err) {
            console.error("Failed to save interview guide:", err);
            return false;
        }
    };

    const fetchHistory = async () => {
        const userStrLocal = sessionStorage.getItem('user');
        if (!userStrLocal) {
            setLoadingHistory(false);
            return;
        }
        const user = JSON.parse(userStrLocal);
        setHistoryError(false);
        try {
            const res = await apiFetch(`/api/ai/interview-guides?userId=${user.id}`);
            const data = await res.json();
            if (data.success && data.sessions) {
                setRecentSessions(data.sessions);
            } else {
                setHistoryError(true);
            }
        } catch(err) {
            console.error("Failed to load history:", err);
            setHistoryError(true);
        } finally {
            setLoadingHistory(false);
        }
    };

    const fetchSavedGuide = async (targetRole: string) => {
        const userStrLocal = sessionStorage.getItem('user');
        if (!userStrLocal) return false;
        const user = JSON.parse(userStrLocal);
        try {
            const res = await apiFetch(`/api/ai/interview-guides?userId=${user.id}&role=${encodeURIComponent(targetRole)}`);
            const data = await res.json();
            if (data.success && data.guideData) {
                setGuideData(data.guideData);
                setQuestionHelp(data.questionHelp || {});
                setAnswersData(data.answersData || {});
                setCurrentIdx(0);
                setCurrentDraft((data.answersData || {})[0]?.draft || "");
                return true;
            }
            setGuideData(null);
            setQuestionHelp({});
            setAnswersData({});
            setCurrentDraft("");
            return false;
        } catch(err) {
            console.error("Failed to load interview guide:", err);
            return false;
        }
    };

    const handleReviewHistory = async (targetRole: string) => {
        const success = await fetchSavedGuide(targetRole);
        if (success) {
            setReviewIdx(0);
            setView('review');
        }
    };

    useEffect(() => {
        let initialRole = "Software Engineer";
        const lastStateRaw = sessionStorage.getItem('lastRoleAnalysis');
        if (lastStateRaw) {
             const parsed = JSON.parse(lastStateRaw);
             if (parsed.role) initialRole = parsed.role;
        }
        setRole(initialRole);
        fetchHistory();
        fetchSavedGuide(initialRole);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (role) {
            fetchSavedGuide(role);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [role]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        setGuideData(null);
        try {
            const formData = new FormData();
            formData.append('role', role);
            if (notes) formData.append('notes', notes);
            if (selectedFile) formData.append('resume', selectedFile);

            const res = await apiFetch('/api/ai/generate-interview-guide', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to generate guide");
            }

            const data = await res.json() as GuideResponse;
            setGuideData(data);
            setQuestionHelp({});
            setAnswersData({});
            setCurrentIdx(0);
            setCurrentDraft("");
            await saveToBackend(data, {}, {}, role);
            
            if (intent === 'voice') {
                navigate('/realtime-mock-interview', { state: { guideData: data, role } });
            } else {
                setView('session');
            }
        } catch (error: unknown) {
            showAlert(error instanceof Error ? error.message : "An error occurred", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleRetryQuestion = async () => {
        if (!guideData) return;
        const updatedAnswers = { ...answersData };
        const ans = updatedAnswers[reviewIdx];
        if (ans && (ans.submitted || ans.draft)) {
            const prev = ans.previousAttempts || [];
            prev.push({
                submitted: ans.submitted || ans.draft,
                feedback: ans.feedback
            });
            ans.previousAttempts = prev;
            ans.submitted = "";
            ans.draft = "";
            ans.feedback = null;
        }
        setAnswersData(updatedAnswers);
        await saveToBackend(guideData, questionHelp, updatedAnswers, role);
        setCurrentIdx(reviewIdx);
        setCurrentDraft("");
        setView('session');
    };

    const handleSaveDraft = async () => {
        if (!guideData) return;
        setSaveStatus('saving');
        
        const updatedAnswers = { ...answersData };
        if (!updatedAnswers[currentIdx]) {
            updatedAnswers[currentIdx] = { draft: "", submitted: "", feedback: null };
        }
        updatedAnswers[currentIdx].draft = currentDraft;
        
        setAnswersData(updatedAnswers);
        
        const success = await saveToBackend(guideData, questionHelp, updatedAnswers, role);
        if (success) {
            setSaveStatus('saved');
            setTimeout(() => setSaveStatus('idle'), 3000);
        } else {
            setSaveStatus('error');
        }
    };

    const handleNavigateQuestion = async (direction: 'next' | 'prev') => {
        if (!guideData) return;
        // Auto-save draft before moving
        if (currentDraft !== (answersData[currentIdx]?.draft || "")) {
            await handleSaveDraft();
        }
        setSaveStatus('idle');

        const newIdx = direction === 'next' ? currentIdx + 1 : currentIdx - 1;
        if (newIdx >= 0 && newIdx < guideData.guide.length) {
            setCurrentIdx(newIdx);
            setCurrentDraft(answersData[newIdx]?.draft || "");
        }
    };

    const handleSubmitMockAnswer = async () => {
        if (!guideData || !currentDraft.trim()) return;
        setLoadingFeedback(true);
        try {
            const currentQ = guideData.guide[currentIdx];
            const res = await apiFetch('/api/ai/mock-interview-evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: currentQ.question,
                    answer: currentDraft,
                    role: role,
                    detailed: true,
                    expectedAnswer: currentQ.answer
                })
            });
            
            if (!res.ok) throw new Error("Feedback fetch failed");
            
            const data = await res.json();
            
            const updatedAnswers = { ...answersData };
            if (!updatedAnswers[currentIdx]) {
                updatedAnswers[currentIdx] = { draft: "", submitted: "", feedback: null };
            }
            updatedAnswers[currentIdx].draft = currentDraft;
            updatedAnswers[currentIdx].submitted = currentDraft;
            updatedAnswers[currentIdx].feedback = data.feedback; // can be detailed object or string
            
            setAnswersData(updatedAnswers);
            setRevealedAnswers(prev => ({...prev, [currentIdx]: true}));
            await saveToBackend(guideData, questionHelp, updatedAnswers, role);
            
        } catch (err) {
            showAlert("Failed to get mock feedback", "error");
        } finally {
            setLoadingFeedback(false);
        }
    };

    const handleGetHelp = async (idx: number, question: string) => {
        if (questionHelp[idx] || !guideData) return; 
        setLoadingHelp(prev => ({...prev, [idx]: true}));
        try {
            const res = await apiFetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `I am preparing for a ${role} interview. The question is: "${question}". I need deeper insight, another example, or a realtime tip on how to answer this effectively. Keep it concise, 2-3 sentences max.`,
                    role: role
                })
            });
            const data = await res.json();
            setQuestionHelp(prev => {
                const updated = {...prev, [idx]: data.reply};
                saveToBackend(guideData, updated, answersData, role);
                return updated;
            });
        } catch {
            showAlert("Failed to get realtime help", "error");
        } finally {
            setLoadingHelp(prev => ({...prev, [idx]: false}));
        }
    };

    const handleResumeHistory = async (historyRole: string) => {
        setRole(historyRole);
        const success = await fetchSavedGuide(historyRole);
        if (success) {
            setView('session');
        } else {
            showAlert("Failed to restore session. It may have been deleted.", "error");
        }
    };

    const handleFinish = async () => {
        if (currentDraft !== (answersData[currentIdx]?.draft || "")) {
            await handleSaveDraft();
        }
        setView('summary');
    };

    // Derived states
    const isAnswerSubmitted = currentDraft === answersData[currentIdx]?.submitted && !!answersData[currentIdx]?.feedback;
    const currentFeedback = answersData[currentIdx]?.feedback as DetailedFeedback | string | null;
    
    return (
        <div className="flex flex-col md:flex-row min-h-[100dvh] bg-[#F8FAFC] font-sans">
            <div className="z-50 shrink-0"><Sidebar activePage="interview-guide" /></div>
            
            <div className="flex-1 flex flex-col overflow-auto bg-slate-50/50 min-h-0">
                <main className="max-w-4xl xl:max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 md:py-10">
                    
                    {/* VIEW: OVERVIEW */}
                    {view === 'overview' && (
                        <div className="fade-in space-y-8">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                   <div className="p-2.5 bg-emerald-100 rounded-xl">
                                      <MessageSquare className="w-6 h-6 text-emerald-600" />
                                   </div>
                                   <h1 className="text-2xl font-bold text-slate-800">Interview Practice</h1>
                                </div>
                                <p className="text-sm text-slate-500 max-w-2xl">
                                   Prepare for your next role with personalized AI mock interviews. Choose text-based practice to refine your answers, or try a live voice session.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Role Context</label>
                                <div className="relative max-w-md">
                                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                        placeholder="e.g. Software Engineer"
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    This role determines the questions you receive. Changing it will update the practice options below.
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-slate-800 mb-4">Practice Options</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Text-based Practice Card */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-emerald-300 transition-colors flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                <FileText className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <h3 className="font-bold text-slate-800">Text-Based Practice</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6 flex-1">
                                            Practice answering technical and behavioral questions by typing your responses. Get immediate AI feedback on your answers and uncover expert tips.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                if (guideData) {
                                                    setView('session');
                                                } else {
                                                    setIntent('text');
                                                    setView('setup');
                                                }
                                            }}
                                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            {guideData ? (
                                                <><Play className="w-4 h-4" /> Resume Practice</>
                                            ) : (
                                                <><Plus className="w-4 h-4" /> Start Practice</>
                                            )}
                                        </button>
                                    </div>

                                    {/* Voice Mock Interview Card */}
                                    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-emerald-300 transition-colors flex flex-col h-full">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-teal-50 rounded-lg">
                                                <Mic className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <h3 className="font-bold text-slate-800">Live Audio Mock Interview</h3>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-6 flex-1">
                                            Simulate a real interview environment with a voice-activated AI interviewer. Practice your communication skills in real-time.
                                        </p>
                                        <button 
                                            onClick={() => {
                                                if (guideData) {
                                                    navigate('/realtime-mock-interview', { state: { guideData, role } });
                                                } else {
                                                    setIntent('voice');
                                                    setView('setup');
                                                }
                                            }}
                                            className="w-full py-2.5 bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" /> Start Voice Mock
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                    <h2 className="text-lg font-bold text-slate-800">Recent Sessions</h2>
                                    
                                    {!loadingHistory && !historyError && recentSessions.length > 0 && (
                                        <div className="flex gap-2">
                                            <select 
                                                value={historyRoleFilter}
                                                onChange={(e) => setHistoryRoleFilter(e.target.value)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                            >
                                                <option value="All">All Roles</option>
                                                {Array.from(new Set(recentSessions.map(s => s.role))).map(r => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                            <select 
                                                value={historyStatusFilter}
                                                onChange={(e) => setHistoryStatusFilter(e.target.value)}
                                                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                                            >
                                                <option value="All">All Statuses</option>
                                                <option value="In progress">In progress</option>
                                                <option value="Finished">Finished</option>
                                                <option value="Not started">Not started</option>
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {loadingHistory ? (
                                    <div className="flex items-center justify-center p-8">
                                        <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                                    </div>
                                ) : historyError ? (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm font-medium flex items-center justify-between">
                                        Failed to load session history.
                                        <button onClick={fetchHistory} className="flex items-center gap-1 hover:underline font-bold">
                                            <RefreshCw className="w-3.5 h-3.5" /> Retry
                                        </button>
                                    </div>
                                ) : recentSessions.length === 0 ? (
                                    <div className="text-sm text-slate-500 italic p-4 bg-white border border-slate-200 rounded-xl">
                                        No recent sessions found. Start a practice session to see it here.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {recentSessions.filter(s => 
                                            (historyRoleFilter === 'All' || s.role === historyRoleFilter) &&
                                            (historyStatusFilter === 'All' || s.status === historyStatusFilter)
                                        ).map(session => (
                                            <div key={session.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-emerald-200 transition-colors">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                                            {session.type || 'Text-Based Practice'}
                                                        </h3>
                                                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                                                            session.status === 'Finished' ? 'bg-blue-50 text-blue-700' :
                                                            session.status === 'In progress' ? 'bg-amber-50 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'
                                                        }`}>
                                                            {session.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                                                        <span className="flex items-center gap-1 font-medium">
                                                            <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {session.role}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5 text-slate-400" /> 
                                                            {new Date(session.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                        <span className="flex items-center gap-1 border-l border-slate-200 pl-3">
                                                            <FileText className="w-3.5 h-3.5 text-slate-400" />
                                                            {session.answeredCount} of {session.totalQuestions} answered
                                                        </span>
                                                    </div>
                                                </div>
                                                
                                                {session.status === 'Finished' ? (
                                                    <button 
                                                        onClick={() => handleReviewHistory(session.role)}
                                                        className="shrink-0 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        Review Session
                                                    </button>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleResumeHistory(session.role)}
                                                        className="shrink-0 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                                                    >
                                                        <Play className="w-3.5 h-3.5" /> Resume Practice
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        
                                        {recentSessions.filter(s => 
                                            (historyRoleFilter === 'All' || s.role === historyRoleFilter) &&
                                            (historyStatusFilter === 'All' || s.status === historyStatusFilter)
                                        ).length === 0 && (
                                            <div className="text-sm text-slate-500 italic p-4 text-center">
                                                No sessions match your filters.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* VIEW: SETUP */}
                    {view === 'setup' && (
                        <div className="fade-in">
                            <button 
                                onClick={() => setView('overview')}
                                className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" /> Back to Overview
                            </button>
                            
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-slate-800 mb-2">Configure Practice Session</h1>
                                <p className="text-sm text-slate-500">
                                   Upload your resume or add specific notes to personalize your AI practice questions.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 sm:p-6 md:p-8 mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Role</label>
                                        <div className="relative">
                                            <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input 
                                                type="text"
                                                value={role}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                                placeholder="e.g. Backend Developer"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Resume (Optional but recommended)</label>
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={"w-full border-2 border-dashed rounded-xl flex items-center justify-center p-3 transition-colors cursor-pointer " + (selectedFile ? 'border-emerald-400 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50')}
                                        >
                                            {selectedFile ? (
                                                <span className="text-sm font-bold text-emerald-700 truncate max-w-[200px]">{selectedFile.name}</span>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                                                    <UploadCloud className="w-5 h-5" />
                                                    <span>Upload PDF or Text CV</span>
                                                </div>
                                            )}
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                ref={fileInputRef} 
                                                onChange={handleFileChange}
                                                accept=".pdf,.txt,.docx"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                     <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Specific Topics to Focus On (Optional)</label>
                                     <input 
                                          type="text"
                                          value={notes}
                                          onChange={(e) => setNotes(e.target.value)}
                                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                          placeholder="e.g. System Design, React hooks, Behavioral..."
                                     />
                                </div>

                                <div className="mt-6 flex sm:justify-end">
                                    <button 
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        {loading ? 'Generating...' : (intent === 'voice' ? 'Generate & Start Voice Mock' : 'Generate & Start Practice')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: SESSION (SINGLE QUESTION) */}
                    {view === 'session' && guideData && (
                        <div className="space-y-6 pb-20 fade-in flex flex-col h-full max-w-3xl mx-auto">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-2">
                                <button 
                                    onClick={async () => {
                                        await handleSaveDraft();
                                        setView('overview');
                                    }}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Save & Leave
                                </button>
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase tracking-wide">
                                        {role}
                                    </span>
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold tracking-wide">
                                        Question {currentIdx + 1} of {guideData.guide.length}
                                    </span>
                                </div>
                            </div>

                            {/* Main Question Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                                {/* Question Header */}
                                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-black flex items-center justify-center shrink-0 text-lg">
                                            Q{currentIdx + 1}
                                        </div>
                                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-1 leading-snug">
                                            {guideData.guide[currentIdx].question}
                                        </h3>
                                    </div>
                                    {!questionHelp[currentIdx] && (
                                        <button 
                                           onClick={() => handleGetHelp(currentIdx, guideData.guide[currentIdx].question)}
                                           disabled={loadingHelp[currentIdx]}
                                           className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-lg transition-colors border border-emerald-100"
                                        >
                                           {loadingHelp[currentIdx] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bot className="w-4 h-4" />}
                                           {loadingHelp[currentIdx] ? 'Thinking...' : 'AI Help'}
                                        </button>
                                    )}
                                </div>

                                {/* Editor Area */}
                                <div className="p-5 sm:p-6 flex-1 flex flex-col gap-4">
                                    
                                    {questionHelp[currentIdx] && (
                                        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                                            <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                <Bot className="w-4 h-4" /> Real-time AI Assistant Insight
                                            </h4>
                                            <p className="text-[13px] sm:text-sm text-emerald-900 leading-relaxed font-medium">
                                                {questionHelp[currentIdx]}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col">
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="block text-xs font-bold text-slate-700 uppercase">Your Answer</label>
                                            
                                            {/* Save Status Indicator */}
                                            <div className="flex items-center gap-1.5 text-xs font-bold">
                                                {saveStatus === 'saving' && <span className="text-slate-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Saving...</span>}
                                                {saveStatus === 'saved' && <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Saved</span>}
                                                {saveStatus === 'error' && <span className="text-red-500 flex items-center gap-1">Save failed.</span>}
                                            </div>
                                        </div>
                                        
                                        <textarea 
                                             className="w-full p-4 border border-slate-200 rounded-xl flex-1 min-h-[200px] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all text-sm font-medium text-slate-800 resize-y"
                                             placeholder="Type your answer here..."
                                             value={currentDraft}
                                             onChange={(e) => {
                                                 setCurrentDraft(e.target.value);
                                                 if (saveStatus !== 'idle') setSaveStatus('idle');
                                             }}
                                             disabled={loadingFeedback}
                                        />
                                    </div>
                                    
                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            <button 
                                                onClick={handleSaveDraft}
                                                disabled={!currentDraft.trim() || saveStatus === 'saving' || currentDraft === (answersData[currentIdx]?.draft || "")}
                                                className="px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all flex flex-1 sm:flex-none items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                <Save className="w-4 h-4" /> Save Draft
                                            </button>
                                            
                                            {!revealedAnswers[currentIdx] && !isAnswerSubmitted ? (
                                                <button 
                                                    onClick={() => setRevealedAnswers(prev => ({...prev, [currentIdx]: true}))}
                                                    className="px-4 py-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl font-bold text-sm transition-all flex flex-1 sm:flex-none items-center justify-center"
                                                >
                                                    Reveal Optimal Answer
                                                </button>
                                            ) : null}
                                        </div>

                                        <button 
                                            onClick={handleSubmitMockAnswer}
                                            disabled={loadingFeedback || !currentDraft.trim() || isAnswerSubmitted}
                                            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                        >
                                            {loadingFeedback ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                            {isAnswerSubmitted ? 'Feedback Received' : 'Submit for AI Feedback'}
                                        </button>
                                    </div>

                                    {/* Evaluation Feedback */}
                                    {currentFeedback && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                                            {answersData[currentIdx]?.submitted !== currentDraft && (
                                                <div className="mb-4 text-xs font-bold text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" /> You've modified your draft since receiving this feedback. Submit again for an updated evaluation.
                                                </div>
                                            )}
                                            
                                            <h3 className="font-bold text-emerald-800 flex items-center gap-2 text-xs uppercase tracking-widest mb-4">
                                                <Bot className="w-4 h-4" /> AI Evaluation Feedback
                                            </h3>
                                            
                                            {typeof currentFeedback === 'string' ? (
                                                <p className="text-sm text-emerald-900 leading-relaxed font-medium bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                    {currentFeedback}
                                                </p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {currentFeedback.worked && (
                                                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                                            <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">What worked</h4>
                                                            <p className="text-sm text-emerald-900 font-medium">{currentFeedback.worked}</p>
                                                        </div>
                                                    )}
                                                    {currentFeedback.improvement && (
                                                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                                            <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Needs Improvement</h4>
                                                            <p className="text-sm text-amber-900 font-medium">{currentFeedback.improvement}</p>
                                                        </div>
                                                    )}
                                                    {currentFeedback.suggestion && (
                                                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:col-span-2">
                                                            <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-1">Specific Suggestion</h4>
                                                            <p className="text-sm text-blue-900 font-medium">{currentFeedback.suggestion}</p>
                                                        </div>
                                                    )}
                                                    {currentFeedback.example && (
                                                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:col-span-2">
                                                            <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Example Phrasing</h4>
                                                            <p className="text-sm text-slate-700 font-medium italic">"{currentFeedback.example}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Revealed Optimal Answer */}
                                    {revealedAnswers[currentIdx] && (
                                        <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
                                                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <MessageSquare className="w-3.5 h-3.5" /> Optimal Answer Structure
                                                </h4>
                                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                    {guideData.guide[currentIdx].answer}
                                                </p>
                                            </div>
                                            <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                                                <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                    <UserCheck className="w-3.5 h-3.5" /> Pro Tip to Stand Out
                                                </h4>
                                                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                                    {guideData.guide[currentIdx].tip}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                </div>
                            </div>
                            
                            {/* Navigation Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                                <div className="flex w-full sm:w-auto gap-3">
                                    <button 
                                        onClick={() => handleNavigateQuestion('prev')}
                                        disabled={currentIdx === 0}
                                        className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Previous
                                    </button>
                                    
                                    <button 
                                        onClick={() => handleNavigateQuestion('next')}
                                        disabled={currentIdx === guideData.guide.length - 1}
                                        className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handleFinish}
                                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                                >
                                    Finish Practice
                                </button>
                            </div>
                        </div>
                    )}


                    {/* VIEW: REVIEW */}
                    {view === 'review' && guideData && (
                        <div className="fade-in flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-1/3">
                                <button 
                                    onClick={() => setView('overview')}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Overview
                                </button>
                                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm h-[600px] overflow-y-auto">
                                    <h3 className="font-bold text-slate-800 mb-4 px-2">Session Questions</h3>
                                    <div className="space-y-2">
                                        {guideData.guide.map((q, idx) => {
                                            const ans = answersData[idx];
                                            const isAnswered = !!ans?.submitted;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setReviewIdx(idx)}
                                                    className={`w-full text-left p-3 rounded-lg text-sm transition-all border ${reviewIdx === idx ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-transparent border-transparent hover:bg-slate-50 text-slate-700'}`}
                                                >
                                                    <div className="font-bold mb-1 flex items-center justify-between">
                                                        <span>Question {idx + 1}</span>
                                                        {isAnswered && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                    </div>
                                                    <p className="line-clamp-2 text-xs opacity-80">{q.question}</p>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="w-full md:w-2/3">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[600px]">
                                    <div className="p-5 sm:p-8 flex-1">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold uppercase tracking-widest">
                                                Question {reviewIdx + 1}
                                            </span>
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-800 mb-6">{guideData.guide[reviewIdx].question}</h2>
                                        
                                        <div className="mb-6">
                                            <h3 className="text-sm font-bold text-slate-500 mb-2">Your Answer</h3>
                                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap text-sm">
                                                {answersData[reviewIdx]?.submitted ? answersData[reviewIdx].submitted : 
                                                 answersData[reviewIdx]?.draft ? <span className="text-amber-600 italic">Unsubmitted Draft: {answersData[reviewIdx].draft}</span> : 
                                                 <span className="text-slate-400 italic">No answer provided yet.</span>}
                                            </div>
                                        </div>

                                        {answersData[reviewIdx]?.feedback && (
                                            <div className="mt-4 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                                                <h3 className="font-bold text-emerald-800 flex items-center gap-2 text-xs uppercase tracking-widest mb-4">
                                                    <Bot className="w-4 h-4" /> AI Practice Guidance
                                                </h3>
                                                {typeof answersData[reviewIdx].feedback === 'string' ? (
                                                    <p className="text-sm text-emerald-900 leading-relaxed font-medium bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                                                        {answersData[reviewIdx].feedback}
                                                    </p>
                                                ) : (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {(answersData[reviewIdx].feedback as DetailedFeedback).worked && (
                                                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                                                                <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-1">Strengths</h4>
                                                                <p className="text-sm text-emerald-900 font-medium">{(answersData[reviewIdx].feedback as DetailedFeedback).worked}</p>
                                                            </div>
                                                        )}
                                                        {(answersData[reviewIdx].feedback as DetailedFeedback).improvement && (
                                                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                                                                <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-1">Areas to Improve</h4>
                                                                <p className="text-sm text-amber-900 font-medium">{(answersData[reviewIdx].feedback as DetailedFeedback).improvement}</p>
                                                            </div>
                                                        )}
                                                        {(answersData[reviewIdx].feedback as DetailedFeedback).suggestion && (
                                                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 sm:col-span-2">
                                                                <h4 className="text-xs font-black text-blue-700 uppercase tracking-widest mb-1">Suggested Next Step</h4>
                                                                <p className="text-sm text-blue-900 font-medium">{(answersData[reviewIdx].feedback as DetailedFeedback).suggestion}</p>
                                                            </div>
                                                        )}
                                                        {(answersData[reviewIdx].feedback as DetailedFeedback).example && (
                                                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:col-span-2">
                                                                <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1 flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5" /> Example Improved Answer</h4>
                                                                <p className="text-sm text-slate-700 font-medium italic">"{(answersData[reviewIdx].feedback as DetailedFeedback).example}"</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {answersData[reviewIdx]?.previousAttempts && answersData[reviewIdx].previousAttempts!.length > 0 && (
                                            <div className="mt-8 pt-4 border-t border-slate-200">
                                                <h3 className="text-sm font-bold text-slate-500 mb-4">Previous Attempts</h3>
                                                <div className="space-y-4">
                                                    {answersData[reviewIdx].previousAttempts!.map((attempt, i) => (
                                                        <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Attempt {i + 1}</div>
                                                            <p className="text-sm text-slate-700 whitespace-pre-wrap">{attempt.submitted}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-3">
                                        <button 
                                            onClick={handleRetryQuestion}
                                            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            Retry this question
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setCurrentIdx(reviewIdx);
                                                setCurrentDraft(answersData[reviewIdx]?.draft || "");
                                                setView('session');
                                            }}
                                            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                                        >
                                            <Play className="w-4 h-4" /> Resume unfinished session
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* VIEW: SUMMARY */}
                    {view === 'summary' && guideData && (
                        <div className="fade-in max-w-2xl mx-auto space-y-6 pt-10">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-3">Practice Complete!</h1>
                                <p className="text-slate-500">
                                    You've finished your text-based practice for <strong className="text-slate-700">{role}</strong>.
                                </p>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 mt-8">
                                <h2 className="font-bold text-lg text-slate-800 mb-6 border-b border-slate-100 pb-4">Session Summary</h2>
                                
                                <div className="space-y-4">
                                    {guideData.guide.map((q, i) => {
                                        const ans = answersData[i];
                                        const status = ans?.feedback ? 'Evaluated' : (ans?.draft ? 'Draft Saved' : 'Not Answered');
                                        const statusColor = status === 'Evaluated' ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
                                                          status === 'Draft Saved' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                                          'text-slate-500 bg-slate-50 border-slate-200';
                                        return (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold flex items-center justify-center text-xs shrink-0">
                                                        Q{i+1}
                                                    </div>
                                                    <p className="text-sm font-medium text-slate-700 truncate max-w-xs sm:max-w-md">
                                                        {q.question}
                                                    </p>
                                                </div>
                                                <span className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${statusColor} shrink-0 text-center`}>
                                                    {status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                                <button 
                                    onClick={() => { setView('session'); setCurrentIdx(0); setCurrentDraft(answersData[0]?.draft || ""); }}
                                    className="px-6 py-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                                >
                                    <MessageSquare className="w-4 h-4" /> Review Answers
                                </button>
                                <button 
                                    onClick={() => { setView('overview'); fetchHistory(); }}
                                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2"
                                >
                                    Back to Overview
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
