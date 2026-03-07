import { useState, useRef, useEffect } from 'react';
import { 
    Briefcase, 
    UploadCloud, 
    Sparkles, 
    ChevronRight, 
    Lightbulb, 
    UserCheck, 
    MessageSquare,
    Loader2
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
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [role, setRole] = useState("Software Engineer");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [guideData, setGuideData] = useState<GuideResponse | null>(null);

    useEffect(() => {
        // Hydrate role
        const lastStateRaw = localStorage.getItem('lastRoleAnalysis');
        if (lastStateRaw) {
             const parsed = JSON.parse(lastStateRaw);
             if (parsed.role) setRole(parsed.role);
        }
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

            const data = await res.json();
            setGuideData(data as GuideResponse);
        } catch (error: unknown) {
            alert(error instanceof Error ? error.message : "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC] font-sans">
            <Sidebar activePage="interview-guide" />
            
            <div className="flex-1 overflow-auto md:ml-0">
                <main className="max-w-4xl mx-auto px-4 py-8 md:px-8">
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="p-2.5 bg-indigo-100 rounded-xl">
                              <MessageSquare className="w-6 h-6 text-indigo-600" />
                           </div>
                           <h1 className="text-2xl font-bold text-slate-800">AI Interview Prep Guide</h1>
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
                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                        placeholder="e.g. Backend Developer"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Resume (Optional but recommended)</label>
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className={"w-full border-2 border-dashed rounded-xl flex items-center justify-center p-3 transition-colors cursor-pointer " + (selectedFile ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50')}
                                >
                                    {selectedFile ? (
                                        <span className="text-sm font-bold text-indigo-700 truncate max-w-[200px]">{selectedFile.name}</span>
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
                                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all font-medium text-sm text-slate-800"
                                  placeholder="e.g. System Design, React hooks, Behavioral..."
                             />
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button 
                                onClick={handleGenerate}
                                disabled={loading}
                                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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

                            <h2 className="text-xl font-bold text-slate-800 mt-8 mb-4">Your Personalized Questions</h2>
                            
                            <div className="space-y-4">
                                {guideData.guide.map((qa, idx) => (
                                    <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group hover:border-indigo-300 transition-colors">
                                        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-black flex items-center justify-center shrink-0">
                                                    Q{idx + 1}
                                                </div>
                                                <h3 className="text-[15px] font-bold text-slate-800 mt-1.5 leading-snug">
                                                    {qa.question}
                                                </h3>
                                            </div>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                                                <h4 className="text-xs font-black text-indigo-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
