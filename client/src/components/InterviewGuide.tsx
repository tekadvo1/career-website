import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Briefcase, 
    UploadCloud, 
    Sparkles, 
    ChevronRight, 
    Lightbulb, 
    UserCheck, 
    MessageSquare,
    Loader2,
    Plus,
    Bot
} from 'lucide-react';
import Sidebar from './Sidebar';

interface QA {
  question: string;
  answer: string;
  tip: string;
}

interface GuideResponse {
  guide: QA[];
  generalTips: string[];
}

export default function InterviewGuide() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [role, setRole] = useState("Software Engineer");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [guideData, setGuideData] = useState<GuideResponse | null>(null);
    const [questionHelp, setQuestionHelp] = useState<{[key: number]: string}>({});
    const [loadingHelp, setLoadingHelp] = useState<{[key: number]: boolean}>({});


    const [mockAnswers, setMockAnswers] = useState<{[key: number]: string}>({});
    const [mockFeedback, setMockFeedback] = useState<{[key: number]: string}>({});
    const [loadingFeedback, setLoadingFeedback] = useState<{[key: number]: boolean}>({});
    const [revealedAnswers, setRevealedAnswers] = useState<{[key: number]: boolean}>({});

    const saveToBackend = async (data: GuideResponse, help: {[key: number]: string}, currentRole: string) => {
        const userStr = localStorage.getItem('user');
        if (!userStr) return;
        const user = JSON.parse(userStr);
        try {
            await fetch('/api/ai/interview-guides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    role: currentRole,
                    guideData: data,
                    questionHelp: help
                })
            });
        } catch (err) {
            console.error("Failed to save interview guide:", err);
        }
    };

    useEffect(() => {
        let initialRole = "Software Engineer";
        const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
        if (lastStateRaw) {
             const parsed = JSON.parse(lastStateRaw);
             if (parsed.role) initialRole = parsed.role;
        }
        setRole(initialRole);

        const fetchSavedGuide = async () => {
             const userStrLocal = localStorage.getItem('user');
             if (!userStrLocal) return;
             const user = JSON.parse(userStrLocal);
             try {
                 const res = await fetch(`/api/ai/interview-guides?userId=${user.id}&role=${encodeURIComponent(initialRole)}`);
                 const data = await res.json();
                 if (data.success && data.guideData) {
                     setGuideData(data.guideData);
                     setQuestionHelp(data.questionHelp || {});
                 }
             } catch(err) {
                 console.error("Failed to load interview guide:", err);
             }
        };
        fetchSavedGuide();
    }, []);

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

            const res = await fetch('/api/ai/generate-interview-guide', {
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
            saveToBackend(data, {}, role);
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleAddMore = async () => {
        if (!guideData) return;
        setLoadingMore(true);
        try {
            const formData = new FormData();
            formData.append('role', role);
            if (notes) formData.append('notes', notes);
            if (selectedFile) formData.append('resume', selectedFile);
            
            const existingQs = guideData.guide.map(q => q.question);
            formData.append('existingQuestions', JSON.stringify(existingQs));

            const res = await fetch('/api/ai/generate-interview-guide', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error("Failed to generate more questions");

            const data = await res.json() as GuideResponse;
            const newGuide = {
                generalTips: guideData.generalTips,
                guide: [...guideData.guide, ...data.guide]
            };
            setGuideData(newGuide);
            saveToBackend(newGuide, questionHelp, role);
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleGetHelp = async (idx: number, question: string) => {
        if (questionHelp[idx]) return; // Already fetched
        setLoadingHelp(prev => ({...prev, [idx]: true}));
        try {
            const res = await fetch('/api/ai/chat', {
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
                if (guideData) saveToBackend(guideData, updated, role);
                return updated;
            });
        } catch {
            alert("Failed to get realtime help");
        } finally {
            setLoadingHelp(prev => ({...prev, [idx]: false}));
        }
    };

    const handleSubmitMockAnswer = async (idx: number) => {
        if (!guideData || !mockAnswers[idx]) return;
        setLoadingFeedback(prev => ({...prev, [idx]: true}));
        try {
            const currentQ = guideData.guide[idx];
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `I am doing a mock interview for a ${role} role. You are the interviewer. Your question was: "${currentQ.question}". My answer is: "${mockAnswers[idx]}". Provide brief, direct feedback on my answer. Tell me what I did well and 1 thing to improve. Keep it to 3-4 sentences total.`,
                    role: role
                })
            });
            const data = await res.json();
            setMockFeedback(prev => ({...prev, [idx]: data.reply}));
            setRevealedAnswers(prev => ({...prev, [idx]: true}));
        } catch {
            alert("Failed to get mock feedback");
        } finally {
            setLoadingFeedback(prev => ({...prev, [idx]: false}));
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans">
            <Sidebar activePage="interview-guide" />
            
            <div className="flex-1 overflow-auto md:ml-0">
                <main className="max-w-4xl mx-auto px-4 py-8 md:px-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2.5 bg-teal-100 rounded-xl">
                              <MessageSquare className="w-6 h-6 text-teal-600" />
                           </div>
                           <h1 className="text-2xl font-bold text-slate-800">AI Interview Prep</h1>
                        </div>
                        <p className="text-sm text-slate-500 max-w-2xl">
                           Upload your resume and get personalized interview questions, example answers, and expert tips tailored to your specific background and target role.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Target Role</label>
                                <div className="relative">
                                    <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input 
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                        placeholder="e.g. Backend Developer"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Resume (Optional but recommended)</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={"w-full border-2 border-dashed rounded-xl flex items-center justify-center p-3 transition-colors cursor-pointer " + (selectedFile ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50')}
                                >
                                    {selectedFile ? (
                                        <span className="text-sm font-bold text-teal-700 truncate max-w-[200px]">{selectedFile.name}</span>
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
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                  placeholder="e.g. System Design, React hooks, Behavioral..."
                             />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleGenerate}
                                disabled={loading || loadingMore}
                                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold shadow-md shadow-teal-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                {loading ? 'Generating Guide...' : 'Generate AI Interview Guide'}
                            </button>
                        </div>
                    </div>

                        {guideData && (
                            <div className="space-y-6 pb-20 fade-in">
                            {guideData.generalTips && guideData.generalTips.length > 0 && (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                                     <h3 className="font-bold text-amber-800 flex items-center gap-2 mb-3">
                                         <Lightbulb className="w-5 h-5" />
                                         Overall Interview Strategy
                                     </h3>
                                     <ul className="space-y-2">
                                         {guideData.generalTips.map((tip, idx) => (
                                             <li key={idx} className="flex gap-2 text-sm text-amber-900 leading-relaxed font-medium">
                                                 <ChevronRight className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                                                 {tip}
                                             </li>
                                         ))}
                                     </ul>
                                </div>
                            )}

                            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Your Personalized Practice Questions</h2>
                            
                            <div className="space-y-4">
                                {guideData.guide.map((qa, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-teal-300 transition-colors">
                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start gap-3">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-black flex items-center justify-center shrink-0">
                                                    Q{idx + 1}
                                                </div>
                                                <h3 className="text-[15px] font-bold text-slate-800 mt-1.5 leading-snug">
                                                    {qa.question}
                                                </h3>
                                            </div>
                                            {!questionHelp[idx] && (
                                                <button 
                                                   onClick={() => handleGetHelp(idx, qa.question)}
                                                   disabled={loadingHelp[idx]}
                                                   className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-teal-600 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1.5 rounded-lg transition-colors border border-teal-100"
                                                >
                                                   {loadingHelp[idx] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bot className="w-3.5 h-3.5" />}
                                                   {loadingHelp[idx] ? 'Thinking...' : 'AI Help'}
                                                </button>
                                            )}
                                        </div>
                                        <div className="p-5 space-y-4">
                                            {/* Practice Area */}
                                            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4">
                                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Your Practice Answer</label>
                                                <textarea 
                                                     className="w-full p-3 border border-slate-200 rounded-lg min-h-[100px] focus:ring-2 focus:ring-teal-500 focus:outline-none transition-all text-[13px] font-medium text-slate-800"
                                                     placeholder="Type your answer here before revealing the optimal answer..."
                                                     value={mockAnswers[idx] || ""}
                                                     onChange={(e) => setMockAnswers(prev => ({...prev, [idx]: e.target.value}))}
                                                     disabled={!!mockFeedback[idx] || loadingFeedback[idx]}
                                                />
                                                <div className="mt-3 flex items-center justify-between">
                                                    {!revealedAnswers[idx] ? (
                                                        <button 
                                                            onClick={() => setRevealedAnswers(prev => ({...prev, [idx]: true}))}
                                                            className="text-[12px] text-slate-500 font-bold hover:text-slate-700 underline underline-offset-2"
                                                        >
                                                            Skip & Reveal Answer
                                                        </button>
                                                    ) : <div/>}

                                                    {!mockFeedback[idx] && (
                                                        <button 
                                                            onClick={() => handleSubmitMockAnswer(idx)}
                                                            disabled={loadingFeedback[idx] || !mockAnswers[idx]}
                                                            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-[12px] shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50"
                                                        >
                                                            {loadingFeedback[idx] && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                            Submit for AI Feedback
                                                        </button>
                                                    )}
                                                </div>

                                                {mockFeedback[idx] && (
                                                    <div className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl custom-fade-in space-y-2">
                                                        <h3 className="font-bold text-emerald-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                                                            <Bot className="w-3.5 h-3.5" /> AI Evaluation Feedback
                                                        </h3>
                                                        <p className="text-[13px] text-emerald-900 leading-relaxed font-medium">
                                                            {mockFeedback[idx]}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Revealed Answer & Tip */}
                                            {revealedAnswers[idx] && (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4">
                                                        <h4 className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                            <MessageSquare className="w-3.5 h-3.5" /> Optimal Answer Structure
                                                        </h4>
                                                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                                                            {qa.answer}
                                                        </p>
                                                    </div>

                                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                                                        <h4 className="text-xs font-black text-emerald-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                            <UserCheck className="w-3.5 h-3.5" /> Pro Tip to Stand Out
                                                        </h4>
                                                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium">
                                                            {qa.tip}
                                                        </p>
                                                    </div>

                                                    {questionHelp[idx] && (
                                                        <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 mt-2">
                                                            <h4 className="text-xs font-black text-teal-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                <Bot className="w-3.5 h-3.5" /> Real-time AI Assistant Insight
                                                            </h4>
                                                            <p className="text-[13px] text-teal-900 leading-relaxed font-medium">
                                                                {questionHelp[idx]}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="pt-4 flex flex-wrap justify-center gap-4">
                                <button 
                                    onClick={() => navigate('/realtime-mock-interview', { state: { guideData, role } })}
                                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl font-bold shadow-md shadow-teal-200 transition-all flex items-center gap-2"
                                >
                                    Start Live Mock Interview (Voice)
                                </button>
                                <button 
                                    onClick={handleAddMore}
                                    disabled={loadingMore}
                                    className="px-6 py-2.5 bg-white border border-slate-200 hover:border-teal-300 hover:bg-teal-50 text-slate-700 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-teal-600" />}
                                    {loadingMore ? 'Loading more...' : 'Add More Questions'}
                                </button>
                            </div>
                            </div>
                        )}
                </main>
            </div>
        </div>
    );
}
