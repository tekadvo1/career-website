import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';
import { useAlert } from '../contexts/AlertContext';
import { 
    Briefcase, Building, Link2, CheckCircle, BrainCircuit, Search, 
    ArrowRight, Edit3, Save, Target, FileText, Compass 
} from 'lucide-react';
import { getUser } from '../utils/auth';

interface Requirement {
    id: string;
    category: string;
    name: string;
    type: 'Required' | 'Preferred' | 'Mentioned';
    excerpt: string;
}

interface ComparisonResult {
    requirement_id: string;
    status: 'Confirmed' | 'Related Experience' | 'Learning' | 'Not Enough Information';
    explanation: string;
    related_user_data: string | null;
    recommended_next_step: string;
}

interface SkillComparisonData {
    id?: number;
    role_analysis_id?: number | null;
    job_title: string;
    company_name: string;
    job_description: string;
    source_url: string;
    requirements: Requirement[];
    comparison_results: ComparisonResult[];
    skill_snapshot: any;
    updated_at?: string;
}

export default function SkillComparison() {
    const { showAlert } = useAlert();
    const location = useLocation();
    
    // Auth context
    const user = getUser() || {};
    
    // State
    const [stage, setStage] = useState<1 | 2 | 3>(1);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [savedComparisonId, setSavedComparisonId] = useState<number | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    // Form data
    const [jobTitle, setJobTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [sourceUrl, setSourceUrl] = useState('');
    
    // Data
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [comparisons, setComparisons] = useState<ComparisonResult[]>([]);
    const [skillSnapshot, setSkillSnapshot] = useState<any>({});
    const [roleAnalysisId, setRoleAnalysisId] = useState<number | null>(null);

    // Initialize from location state or session
    useEffect(() => {
        let currentRoleId: number | null = null;
        if (location.state?.role_analysis_id) {
            currentRoleId = location.state.role_analysis_id;
        } else {
            const lastStateRaw = sessionStorage.getItem('lastRoleAnalysis');
            if (lastStateRaw) {
                try {
                    const parsed = JSON.parse(lastStateRaw);
                    if (parsed.id) currentRoleId = parsed.id;
                } catch (e) {}
            }
        }
        
        if (currentRoleId) {
            setRoleAnalysisId(currentRoleId);
            loadSavedComparison(currentRoleId);
            loadUserSkills(currentRoleId);
        }
    }, [location.state]);

    const loadSavedComparison = async (analysisId: number) => {
        try {
            const res = await apiFetch(`/api/skill-comparison/saved?role_analysis_id=${analysisId}`);
            if (res.ok) {
                const data = await res.json();
                if (data.data) {
                    const comp = data.data;
                    setSavedComparisonId(comp.id);
                    setJobTitle(comp.job_title || '');
                    setCompanyName(comp.company_name || '');
                    setJobDescription(comp.job_description || '');
                    setSourceUrl(comp.source_url || '');
                    setRequirements(comp.requirements || []);
                    setComparisons(comp.comparison_results || []);
                    setIsSaved(true);
                    
                    if (comp.comparison_results?.length > 0) {
                        setStage(3);
                    } else if (comp.requirements?.length > 0) {
                        setStage(2);
                    }
                }
            }
        } catch (err) {
            console.error("Failed to load saved comparison", err);
        }
    };

    const loadUserSkills = async (_analysisId: number) => {
        // Fetch role analysis details to get confirmed skills
        try {
            // This is a placeholder. In a real implementation, we would fetch the user's role analysis
            // and roadmap progress to build the snapshot.
            const userContextRes = await apiFetch(`/api/role/dashboard-context?userId=${user.id}`);
            if (userContextRes.ok) {
                const data = await userContextRes.json();
                setSkillSnapshot(data.data || {});
            }
        } catch (err) {
            console.error("Failed to load user skills", err);
        }
    };

    const handleExtract = async () => {
        if (!jobDescription.trim()) {
            showAlert("Please paste a job description.", "error");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiFetch('/api/skill-comparison/extract', {
                method: 'POST',
                body: JSON.stringify({ job_description: jobDescription })
            });
            const data = await res.json();
            if (data.requirements) {
                setRequirements(data.requirements);
                setStage(2);
                setIsSaved(false);
            } else {
                showAlert(data.error || "Failed to extract requirements.", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Error connecting to AI service.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCompare = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch('/api/skill-comparison/compare', {
                method: 'POST',
                body: JSON.stringify({ 
                    requirements, 
                    skill_snapshot: skillSnapshot 
                })
            });
            const data = await res.json();
            if (data.comparisons) {
                setComparisons(data.comparisons);
                setStage(3);
                setIsSaved(false);
                // Auto-save after comparison
                handleSave(data.comparisons);
            } else {
                showAlert(data.error || "Failed to compare skills.", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Error connecting to AI service.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (compsToSave = comparisons) => {
        setIsSaving(true);
        try {
            const payload: SkillComparisonData = {
                id: savedComparisonId || undefined,
                role_analysis_id: roleAnalysisId,
                job_title: jobTitle,
                company_name: companyName,
                job_description: jobDescription,
                source_url: sourceUrl,
                requirements: requirements,
                comparison_results: compsToSave,
                skill_snapshot: skillSnapshot,
            };

            const res = await apiFetch('/api/skill-comparison/save', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setSavedComparisonId(data.id);
                setIsSaved(true);
                showAlert("Comparison saved successfully.", "success");
            } else {
                showAlert("Failed to save comparison.", "error");
            }
        } catch (err) {
            console.error("Save error:", err);
            showAlert("Failed to save comparison.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row font-sans">
            <div className="z-50 shrink-0"><Sidebar activePage="tools" /></div>
            
            <div className="flex-1 overflow-y-auto relative w-full lg:ml-0">
                <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-10 relative z-10 w-full">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                                <Search className="w-6 h-6 text-emerald-600" />
                                Compare a Job Description
                            </h1>
                            <p className="text-slate-600 text-sm mt-1">
                                Understand the requirements and see what to learn next.
                            </p>
                        </div>
                        {stage > 1 && (
                            <button
                                onClick={() => handleSave()}
                                disabled={isSaving || isSaved}
                                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 ${
                                    isSaved 
                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <Save className="w-4 h-4" />
                                {isSaved ? 'Saved to Account' : isSaving ? 'Saving...' : 'Save Comparison'}
                            </button>
                        )}
                    </div>

                    {/* Progress indicator */}
                    <div className="flex items-center gap-2 mb-8 text-sm font-bold text-slate-400">
                        <span className={stage >= 1 ? 'text-emerald-600' : ''}>1. Job Details</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className={stage >= 2 ? 'text-emerald-600' : ''}>2. Review Requirements</span>
                        <ArrowRight className="w-4 h-4" />
                        <span className={stage === 3 ? 'text-emerald-600' : ''}>3. Compare & Plan</span>
                    </div>

                    {/* Stage 1: Input */}
                    {stage === 1 && (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="block text-[12px] font-bold text-slate-600">Job Title (Optional)</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input 
                                            value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                                            className="w-full text-sm pl-9 p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g. Senior React Developer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[12px] font-bold text-slate-600">Company (Optional)</label>
                                    <div className="relative">
                                        <Building className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                        <input 
                                            value={companyName} onChange={e => setCompanyName(e.target.value)}
                                            className="w-full text-sm pl-9 p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="e.g. Acme Corp"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-bold text-slate-600">Source URL (Optional)</label>
                                <div className="relative">
                                    <Link2 className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="url"
                                        value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                                        className="w-full text-sm pl-9 p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-bold text-slate-600">
                                    Job Description <span className="text-red-500">*</span>
                                </label>
                                <p className="text-[11px] text-slate-500 mb-2">Paste the responsibilities and requirements.</p>
                                <textarea 
                                    value={jobDescription} onChange={e => setJobDescription(e.target.value)}
                                    maxLength={15000}
                                    rows={10}
                                    className="w-full text-sm p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono resize-y"
                                    placeholder="Paste job description here..."
                                />
                                <div className="text-right text-[10px] text-slate-400">{jobDescription.length}/15000</div>
                            </div>

                            <button 
                                onClick={handleExtract}
                                disabled={isLoading || !jobDescription.trim()}
                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <Search className="w-4 h-4" />}
                                {isLoading ? 'Extracting Requirements...' : 'Extract Requirements'}
                            </button>
                        </div>
                    )}

                    {/* Stage 2: Review Requirements */}
                    {stage === 2 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-bold text-slate-900">Review Extracted Requirements</h2>
                                    <button onClick={() => setStage(1)} className="text-sm text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                                        <Edit3 className="w-3 h-3" /> Edit Input
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 mb-6">We've identified these requirements from the description. You can review them before we compare against your skills.</p>
                                
                                <div className="space-y-3">
                                    {requirements.map((req) => (
                                        <div key={req.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="font-bold text-slate-800">{req.name}</div>
                                                <div className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                                    req.type === 'Required' ? 'bg-red-100 text-red-700' :
                                                    req.type === 'Preferred' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-slate-200 text-slate-700'
                                                }`}>
                                                    {req.type}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500 italic flex items-start gap-1">
                                                <FileText className="w-3 h-3 shrink-0 mt-0.5" />
                                                "{req.excerpt}"
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 flex gap-3">
                                    <button 
                                        onClick={handleCompare}
                                        disabled={isLoading}
                                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? <BrainCircuit className="w-4 h-4 animate-pulse" /> : <Target className="w-4 h-4" />}
                                        {isLoading ? 'Comparing Skills...' : 'Compare with My Skills'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Stage 3: Compare & Plan */}
                    {stage === 3 && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-lg font-bold text-slate-900">Skill Comparison Results</h2>
                                    <button onClick={() => setStage(2)} className="text-sm text-emerald-600 font-bold flex items-center gap-1 hover:underline">
                                        <ArrowRight className="w-3 h-3 rotate-180" /> Back to Requirements
                                    </button>
                                </div>
                                
                                <div className="space-y-4">
                                    {comparisons.map((comp) => {
                                        const req = requirements.find(r => r.id === comp.requirement_id);
                                        if (!req) return null;
                                        
                                        let statusColor = "bg-slate-100 text-slate-700 border-slate-200";
                                        let statusIcon = <Compass className="w-4 h-4" />;
                                        
                                        if (comp.status === 'Confirmed') {
                                            statusColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
                                            statusIcon = <CheckCircle className="w-4 h-4 text-emerald-500" />;
                                        } else if (comp.status === 'Related Experience') {
                                            statusColor = "bg-blue-50 text-blue-700 border-blue-200";
                                            statusIcon = <CheckCircle className="w-4 h-4 text-blue-500" />;
                                        } else if (comp.status === 'Learning') {
                                            statusColor = "bg-orange-50 text-orange-700 border-orange-200";
                                            statusIcon = <Target className="w-4 h-4 text-orange-500" />;
                                        }
                                        
                                        return (
                                            <div key={comp.requirement_id} className={`p-4 border rounded-xl flex flex-col gap-3 ${statusColor}`}>
                                                <div className="flex justify-between items-start gap-4">
                                                    <div>
                                                        <div className="font-bold mb-1 flex items-center gap-2">
                                                            {statusIcon}
                                                            {req.name}
                                                        </div>
                                                        <div className="text-sm opacity-90">{comp.explanation}</div>
                                                    </div>
                                                    <div className="shrink-0 text-xs font-bold uppercase tracking-wider opacity-60">
                                                        {req.type}
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-2 text-xs font-semibold bg-white/50 p-2 rounded flex items-center justify-between">
                                                    <span>Action: {comp.recommended_next_step}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
