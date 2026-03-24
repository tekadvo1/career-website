import { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Settings, Rocket, Code, Terminal, BrainCircuit, Sparkles, X, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';
import { useAlert } from '../contexts/AlertContext';

export default function TechStack() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [role, setRole] = useState("Software Engineer");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);

    const cleanRole = (r: string) => r ? r.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() : r;

    useEffect(() => {
        let currentRole = "Software Engineer";
        const lastStateRaw = sessionStorage.getItem('lastRoleAnalysis');
        if (lastStateRaw) {
            try {
                const lastRoleState = JSON.parse(lastStateRaw);
                if (lastRoleState?.role) {
                    currentRole = cleanRole(lastRoleState.role);
                    setRole(currentRole);
                }
            } catch (e) {}
        }
        
        const savedResult = localStorage.getItem(`techStack_${currentRole}`);
        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult));
            } catch (err) {}
        }
    }, []);

    useEffect(() => {
        if (!role) return;
        const savedResult = localStorage.getItem(`techStack_${role}`);
        if (savedResult) {
            try {
                setResult(JSON.parse(savedResult));
            } catch (err) {}
        } else {
            setResult(null);
        }
    }, [role]);

    const handleAnalyze = () => {
        if (result) {
            setShowRefreshConfirm(true);
            return;
        }
        executeAnalyze();
    };

    const executeAnalyze = async () => {
        setShowRefreshConfirm(false);

        setIsLoading(true);
        setResult(null);

        const formData = new FormData();
        formData.append('role', role);
        if (selectedFile) {
            formData.append('resume', selectedFile);
        }

        try {
            const res = await apiFetch('/api/ai/tech-stack', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            if (data.languages || data.frameworks || data.tools) {
                setResult(data);
                localStorage.setItem(`techStack_${role}`, JSON.stringify(data));
            } else {
                showAlert("Failed to analyze. Please try again.", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Error connecting to AI service.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-900">
            <div className="z-50 shrink-0"><Sidebar activePage="tech-stack" /></div>
            
            <div className="flex-1 overflow-y-auto relative w-full lg:ml-0">
                <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-teal-50 via-slate-50/50 to-transparent pointer-events-none" />
                
                <div className="max-w-5xl mx-auto px-4 py-8 md:px-8 md:py-10 relative z-10 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5 bg-white p-5 md:p-6 rounded-2xl shadow-[0_2px_15px_-5px_rgba(0,0,0,0.05)] border border-slate-100">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="p-2.5 shadow-sm bg-gradient-to-br from-teal-500 to-emerald-500 text-white rounded-xl">
                                    <Terminal className="w-5 h-5" />
                                </div>
                                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
                                    FindStreak Tech Stack
                                </h1>
                            </div>
                            <p className="text-slate-500 max-w-2xl text-[14px] leading-relaxed">
                                Get a real-time, AI-powered breakdown of the exact programming languages, frameworks, and modern tools you need based on the absolute latest industry trends for your role.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Configuration Sidebar */}
                        <div className="lg:col-span-1 space-y-4">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                                <h2 className="text-[13px] font-bold text-slate-700 uppercase mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <Settings className="w-4 h-4 text-teal-500" />
                                    FindStreak AI Search
                                </h2>
                                
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[12px] font-bold text-slate-600">Target Role</label>
                                        <input 
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="w-full text-sm p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-slate-50 hover:bg-white"
                                            placeholder="e.g. Software Engineer"
                                        />
                                        <div className="flex items-start gap-1 p-1.5 bg-teal-50 rounded text-[10px] text-teal-700 border border-teal-100 mt-1">
                                            <BrainCircuit className="w-3 h-3 flex-shrink-0 mt-0.5" />
                                            <p>Automatically synced with your currently active Career Workspace.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[12px] font-bold text-slate-600 flex items-center justify-between">
                                            Resume <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Optional</span>
                                        </label>
                                        <p className="text-[11px] text-slate-500 mb-2 leading-tight">
                                            Upload your resume so the AI can skip foundational tech you already know and focus on trending tools to push you forward.
                                        </p>
                                        <input 
                                            type="file" 
                                            accept=".pdf,.doc,.docx" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files.length > 0) setSelectedFile(e.target.files[0]);
                                            }} 
                                        />
                                        
                                        <div 
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`w-full border-2 border-dashed transition-all duration-200 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer group ${
                                                selectedFile ? 'border-teal-400 bg-teal-50/50' : 'border-slate-300 hover:border-teal-400 hover:bg-teal-50/30 bg-slate-50'
                                            }`}
                                        >
                                            {selectedFile ? (
                                                <div className="flex flex-col items-center text-teal-700">
                                                    <FileText className="w-6 h-6 text-teal-500 mb-2" />
                                                    <span className="font-bold text-[12px] text-center line-clamp-1 truncate w-[180px]">{selectedFile.name}</span>
                                                    <span className="text-[10px] mt-1 text-teal-500 font-medium">Click to change</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center">
                                                    <UploadCloud className="w-6 h-6 mb-2 text-slate-400 group-hover:text-teal-500 transition-colors" />
                                                    <span className="font-bold text-slate-700 text-[12px]">Upload PDF/Word</span>
                                                </div>
                                            )}
                                        </div>
                                        {selectedFile && (
                                            <button 
                                                onClick={() => setSelectedFile(null)}
                                                className="w-full mt-2 py-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-red-500 hover:bg-red-50 rounded"
                                            >
                                                <X className="w-3 h-3" /> Remove File
                                            </button>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={handleAnalyze}
                                        disabled={isLoading || !role}
                                        className="w-full mt-4 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <Sparkles className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                                        {isLoading ? 'Searching live trends...' : 'Generate Tech Stack'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Results View */}
                        <div className="lg:col-span-2 space-y-4">
                            {isLoading ? (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200">
                                    <BrainCircuit className="w-12 h-12 text-teal-400 animate-pulse mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700">FindStreak AI is analyzing...</h3>
                                    <p className="text-sm text-slate-500 mt-2">Connecting to live industry data for {role}.</p>
                                </div>
                            ) : result ? (
                                <div className="space-y-4">
                                    <div className="bg-white rounded-2xl shadow-sm border border-teal-100 p-5 bg-gradient-to-r from-teal-50/50 to-transparent">
                                        <p className="text-sm font-semibold text-teal-900 leading-relaxed italic">
                                            "{result.summary}"
                                        </p>
                                    </div>

                                    {/* Programming Languages */}
                                    {result.languages && result.languages.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                            <Code className="w-4 h-4 text-emerald-600" />
                                            <h3 className="font-bold text-sm text-slate-800">Programming Languages</h3>
                                        </div>
                                        <div className="p-4 grid gap-3">
                                            {result.languages && result.languages.map((lang: any, i: number) => (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-[14px] text-slate-800">{lang.name}</span>
                                                            {lang.status && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{lang.status}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[12px] text-slate-600">{lang.reason}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate('/tech-guide', { state: { techName: lang.name, role: role, category: 'Programming Language' } })}
                                                        className="px-3 py-1.5 mt-2 sm:mt-0 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 hover:bg-emerald-50 rounded-lg text-[11px] font-bold shadow-sm transition-all whitespace-nowrap flex-shrink-0"
                                                    >
                                                        View Guide
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    )}

                                    {/* Frameworks */}
                                    {result.frameworks && result.frameworks.length > 0 && (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-blue-600" />
                                            <h3 className="font-bold text-sm text-slate-800">Frameworks</h3>
                                        </div>
                                        <div className="p-4 grid gap-3">
                                            {result.frameworks && result.frameworks.map((fw: any, i: number) => (
                                                <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2 bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-[14px] text-slate-800">{fw.name}</span>
                                                            {fw.status && (
                                                                <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{fw.status}</span>
                                                            )}
                                                        </div>
                                                        <p className="text-[12px] text-slate-600">{fw.reason}</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => navigate('/tech-guide', { state: { techName: fw.name, role: role, category: 'Framework' } })}
                                                        className="px-3 py-1.5 mt-2 sm:mt-0 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-lg text-[11px] font-bold shadow-sm transition-all whitespace-nowrap flex-shrink-0"
                                                    >
                                                        View Guide
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    )}

                                    {/* Modern Tools */}
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-orange-500" />
                                            <h3 className="font-bold text-sm text-slate-800">Essential Developer Tools</h3>
                                        </div>
                                        <div className="p-4 grid gap-3 sm:grid-cols-2">
                                            {result.tools && result.tools.map((tm: any, i: number) => (
                                                <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-bold text-[13px] text-slate-800">{tm.name}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 mb-2 font-medium uppercase">{tm.category}</p>
                                                        <p className="text-[12px] text-slate-600 leading-snug">{tm.reason}</p>
                                                    </div>
                                                    <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                                                        <button 
                                                            onClick={() => navigate('/tech-guide', { state: { techName: tm.name, role: role, category: tm.category } })}
                                                            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-orange-600 hover:border-orange-300 hover:bg-orange-50 rounded-lg text-[11px] font-bold shadow-sm transition-all whitespace-nowrap"
                                                        >
                                                            View Guide
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Trending Keywords */}
                                    {result.trending && result.trending.length > 0 && (
                                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                                            <h3 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 text-purple-500" />
                                                Trending "Buzzwords" to mention in interviews
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {result.trending.map((t: string, i: number) => (
                                                    <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-full text-[12px] font-bold">
                                                        #{t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-200 border-dashed">
                                    <div className="w-16 h-16 bg-teal-50 text-teal-200 rounded-full flex items-center justify-center mb-4">
                                        <Rocket className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-400">Ready to discover your optimal stack</h3>
                                    <p className="text-sm text-slate-400 mt-1">Upload your optional resume and click Generate.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Refresh Confirmation Modal */}
            {showRefreshConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-gradient-to-r from-amber-50 to-white">
                            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-900">Refresh Tech Stack?</h3>
                                <p className="text-[12px] text-slate-500 mt-0.5">Your current data will be replaced.</p>
                            </div>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-slate-700 leading-relaxed mb-6">
                                Are you sure you want to generate a new tech stack? The current information will be lost and you will receive new, real-time trending data from the AI.
                            </p>
                            <div className="flex items-center justify-end gap-3 pb-1">
                                <button 
                                    onClick={() => setShowRefreshConfirm(false)}
                                    className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={executeAnalyze}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
                                >
                                    Yes, Refresh Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
