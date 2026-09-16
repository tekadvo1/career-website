import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';
import { useAlert } from '../contexts/AlertContext';
import { Gamepad2, Play, RotateCcw, Clock, CheckCircle2, XCircle, ArrowRight, Save, LayoutList } from 'lucide-react';

interface Topic {
    id: string;
    title: string;
}

interface PracticeSession {
    id: number;
    role: string;
    topic: string;
    status: string;
    score: number;
    total_questions: number;
    updated_at: string;
    created_at: string;
}

interface Question {
    id: number;
    question_text: string;
    options: string[];
    order_index: number;
    // Returned only if answered
    user_answer?: number;
    is_correct?: boolean;
    answer_index?: number;
    explanation?: string;
}

export default function QuizGame() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    // View state
    const [view, setView] = useState<'landing' | 'active' | 'results'>('landing');
    const [isLoading, setIsLoading] = useState(false);

    // Landing Data
    const [role, setRole] = useState<string>("Software Engineer");
    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [pastSessions, setPastSessions] = useState<PracticeSession[]>([]);

    // Active Session Data
    const [activeSession, setActiveSession] = useState<PracticeSession | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load initial data for landing page
    useEffect(() => {
        loadLandingData();
        
        // Handle direct links
        const sid = searchParams.get('session');
        if (sid) {
            resumeSession(Number(sid));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadLandingData = async () => {
        setIsLoading(true);
        try {
            // Try to load user's actual roadmap
            const rmRes = await apiFetch('/api/project-structure/load');
            if (rmRes.ok) {
                const data = await rmRes.json();
                if (data.roadmap && data.roadmap.roleTitle) {
                    setRole(data.roadmap.roleTitle);
                    const topics: Topic[] = [];
                    data.roadmap.phases?.forEach((phase: any) => {
                        phase.topics?.forEach((t: any) => {
                            topics.push({ id: t.id, title: t.title });
                        });
                    });
                    setAvailableTopics(topics);
                    if (topics.length > 0 && !selectedTopic) {
                        setSelectedTopic(topics[0].title);
                    }
                }
            }

            // Load past sessions
            const sessRes = await apiFetch('/api/practice');
            if (sessRes.ok) {
                const data = await sessRes.json();
                setPastSessions(data.sessions || []);
            }
        } catch (err) {
            console.error("Failed to load landing data", err);
            showAlert("Failed to load your learning plan data", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const startNewPractice = async () => {
        if (!selectedTopic) {
            showAlert("Please select a topic to practice", "error");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiFetch('/api/practice/start', {
                method: 'POST',
                body: JSON.stringify({ role, topic: selectedTopic, numQuestions: 5 })
            });
            const data = await res.json();
            
            if (res.ok && data.session_id) {
                setSearchParams({ session: data.session_id.toString() });
                await resumeSession(data.session_id);
            } else {
                showAlert(data.error || "Failed to start practice", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Failed to start practice session", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const resumeSession = async (sessionId: number) => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/api/practice/${sessionId}`);
            const data = await res.json();
            
            if (res.ok && data.session) {
                setActiveSession(data.session);
                setQuestions(data.questions || []);
                
                if (data.session.status === 'completed') {
                    setView('results');
                } else {
                    // Find first unanswered question
                    const firstUnanswered = data.questions.findIndex((q: Question) => q.user_answer === undefined);
                    setCurrentIdx(firstUnanswered !== -1 ? firstUnanswered : 0);
                    setView('active');
                    setSelectedOption(null);
                }
            } else {
                showAlert(data.error || "Failed to load session", "error");
                setSearchParams({});
                setView('landing');
            }
        } catch (err) {
            console.error(err);
            showAlert("Failed to load session", "error");
            setSearchParams({});
            setView('landing');
        } finally {
            setIsLoading(false);
        }
    };

    const submitAnswer = async () => {
        if (selectedOption === null || !activeSession || !questions[currentIdx]) return;
        
        setIsSubmitting(true);
        try {
            const currentQ = questions[currentIdx];
            const res = await apiFetch(`/api/practice/${activeSession.id}/submit`, {
                method: 'POST',
                body: JSON.stringify({ question_id: currentQ.id, selected_option: selectedOption })
            });
            
            const data = await res.json();
            if (res.ok) {
                // Update local question state with the server's explanation
                const updatedQuestions = [...questions];
                updatedQuestions[currentIdx] = {
                    ...currentQ,
                    user_answer: selectedOption,
                    is_correct: data.is_correct,
                    answer_index: data.correct_index,
                    explanation: data.explanation
                };
                setQuestions(updatedQuestions);
            } else {
                showAlert(data.error || "Failed to submit answer", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Network error submitting answer", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(currentIdx + 1);
            setSelectedOption(null);
        } else {
            // Re-fetch session to get final status and transition to results
            resumeSession(activeSession!.id);
        }
    };

    const handleExit = () => {
        setSearchParams({});
        setActiveSession(null);
        setView('landing');
        loadLandingData();
    };

    if (isLoading && view === 'landing') {
        return (
            <div className="min-h-[100dvh] bg-slate-50 flex font-sans">
                <Sidebar activePage="tools" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-slate-400 font-bold">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex font-sans">
            <Sidebar activePage="tools" />
            
            <div className="flex-1 overflow-y-auto">
                {view === 'landing' && (
                    <div className="max-w-4xl mx-auto p-6 md:p-12">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
                                <Gamepad2 className="w-6 h-6 text-indigo-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Practice & Revision</h1>
                                <p className="text-slate-600 mt-1">Check your understanding and revisit concepts.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Start Practice Card */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Start Practising</h2>
                                
                                {availableTopics.length > 0 ? (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Target Role</label>
                                            <div className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                                {role}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-1">Select Topic</label>
                                            <select 
                                                value={selectedTopic}
                                                onChange={e => setSelectedTopic(e.target.value)}
                                                className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                            >
                                                {availableTopics.map(t => (
                                                    <option key={t.id} value={t.title}>{t.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <button 
                                            onClick={startNewPractice}
                                            disabled={isLoading}
                                            className="w-full mt-4 bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                        >
                                            <Play className="w-4 h-4" /> 
                                            {isLoading ? 'Generating...' : 'Start Practice'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <p className="text-slate-500 text-sm mb-4">No learning plan found.</p>
                                        <button onClick={() => navigate('/learning-roadmap')} className="text-indigo-600 font-bold hover:underline">
                                            Create a Learning Plan
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Past Sessions */}
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col h-full max-h-[500px]">
                                <h2 className="text-lg font-bold text-slate-900 mb-4">Your Sessions</h2>
                                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                                    {pastSessions.length === 0 ? (
                                        <div className="text-slate-400 text-sm text-center py-8">No past sessions found.</div>
                                    ) : (
                                        pastSessions.map(sess => (
                                            <div key={sess.id} className="p-4 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-slate-900 line-clamp-1">{sess.topic}</h3>
                                                    {sess.status === 'completed' ? (
                                                        <span className="shrink-0 bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">Completed</span>
                                                    ) : (
                                                        <span className="shrink-0 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">In Progress</span>
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="text-xs text-slate-500 space-y-1">
                                                        <div className="flex items-center gap-1"><Clock className="w-3 h-3"/> {new Date(sess.updated_at).toLocaleDateString()}</div>
                                                        <div className="flex items-center gap-1"><LayoutList className="w-3 h-3"/> {sess.score} / {sess.total_questions} correct</div>
                                                    </div>
                                                    <button 
                                                        onClick={() => { setSearchParams({ session: sess.id.toString() }); resumeSession(sess.id); }}
                                                        className="text-indigo-600 text-sm font-bold hover:underline"
                                                    >
                                                        {sess.status === 'completed' ? 'Review' : 'Resume'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {view === 'active' && activeSession && questions.length > 0 && (
                    <div className="max-w-3xl mx-auto p-4 md:p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{activeSession.topic}</h2>
                                <div className="text-slate-900 font-bold flex items-center gap-2">
                                    Question {currentIdx + 1} of {questions.length}
                                </div>
                            </div>
                            <button onClick={handleExit} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors">
                                <Save className="w-4 h-4" /> Save & Exit
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full transition-all duration-500" 
                                style={{ width: `${((currentIdx) / questions.length) * 100}%` }}
                            />
                        </div>

                        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 mb-8">
                            <h3 className="text-xl text-slate-900 font-bold mb-8 leading-relaxed">
                                {questions[currentIdx].question_text}
                            </h3>

                            <div className="space-y-3">
                                {questions[currentIdx].options.map((opt, idx) => {
                                    const isAnswered = questions[currentIdx].user_answer !== undefined;
                                    const isSelected = selectedOption === idx || questions[currentIdx].user_answer === idx;
                                    const isCorrect = isAnswered && questions[currentIdx].answer_index === idx;
                                    const isWrongSelected = isAnswered && isSelected && !isCorrect;

                                    let borderClass = "border-slate-200 hover:border-indigo-400";
                                    let bgClass = "bg-white";
                                    
                                    if (isSelected && !isAnswered) {
                                        borderClass = "border-indigo-500 ring-1 ring-indigo-500";
                                        bgClass = "bg-indigo-50";
                                    } else if (isAnswered) {
                                        if (isCorrect) {
                                            borderClass = "border-emerald-500 bg-emerald-50";
                                        } else if (isWrongSelected) {
                                            borderClass = "border-red-400 bg-red-50";
                                        } else {
                                            borderClass = "border-slate-100 opacity-50";
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            disabled={isAnswered || isSubmitting}
                                            onClick={() => setSelectedOption(idx)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3 ${borderClass} ${bgClass}`}
                                        >
                                            <div className="flex-1 text-slate-700">{opt}</div>
                                            {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                                            {isAnswered && isWrongSelected && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Explanation Box */}
                            {questions[currentIdx].user_answer !== undefined && (
                                <div className={`mt-6 p-5 rounded-xl border ${questions[currentIdx].is_correct ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                                    <h4 className={`font-bold text-sm mb-2 ${questions[currentIdx].is_correct ? 'text-emerald-800' : 'text-red-800'}`}>
                                        {questions[currentIdx].is_correct ? 'Correct!' : 'Incorrect'}
                                    </h4>
                                    <p className="text-slate-700 text-sm leading-relaxed">
                                        {questions[currentIdx].explanation}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            {questions[currentIdx].user_answer === undefined ? (
                                <button
                                    onClick={submitAnswer}
                                    disabled={selectedOption === null || isSubmitting}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Checking...' : 'Submit Answer'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleNext}
                                    className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
                                >
                                    {currentIdx < questions.length - 1 ? 'Next Question' : 'View Results'} <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {view === 'results' && activeSession && (
                    <div className="max-w-2xl mx-auto p-6 md:p-12 text-center">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle2 className="w-10 h-10" />
                        </div>
                        
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">Practice Complete</h2>
                        <p className="text-slate-600 mb-8">You've finished the practice session for <strong>{activeSession.topic}</strong>.</p>
                        
                        <div className="bg-white border border-slate-200 rounded-2xl p-8 mb-8 shadow-sm">
                            <div className="flex justify-center gap-12">
                                <div>
                                    <div className="text-4xl font-black text-slate-900 mb-1">{activeSession.score}</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Correct</div>
                                </div>
                                <div>
                                    <div className="text-4xl font-black text-slate-900 mb-1">{activeSession.total_questions}</div>
                                    <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => {
                                    setCurrentIdx(0);
                                    setView('active');
                                }}
                                className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <RotateCcw className="w-4 h-4" /> Review Answers
                            </button>
                            <button 
                                onClick={handleExit}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Return to Tools
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
