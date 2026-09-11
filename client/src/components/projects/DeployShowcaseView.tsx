import { useState, useEffect } from 'react';
import { 
    Rocket, CheckCircle2, Circle, Globe, ExternalLink, Link2, 
    FileText, Sparkles, Loader2, ArrowRight, Github
} from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
import { Project, DeployData, CaseStudyDraft, CheckStatus } from './projectModel';
import { useAlert } from '../../contexts/AlertContext';
import { useNavigate } from 'react-router-dom';

interface DeployShowcaseViewProps {
    project: Project;
    onUpdateProject: (p: Project) => void;
    onBack: () => void;
}

export default function DeployShowcaseView({ project, onUpdateProject, onBack }: DeployShowcaseViewProps) {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const userString = sessionStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};

    const [isSaving, setIsSaving] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    // Default structure if undefined
    const deployData: DeployData = project.deploy_data || {
        preparedChecks: {},
        repoUrl: '',
        liveUrl: '',
        postDeployChecks: {}
    };

    const [preparedChecks, setPreparedChecks] = useState<Record<string, CheckStatus>>(deployData.preparedChecks || {});
    const [repoUrl, setRepoUrl] = useState(deployData.repoUrl || '');
    const [liveUrl, setLiveUrl] = useState(deployData.liveUrl || '');
    const [postDeployChecks, setPostDeployChecks] = useState<Record<string, CheckStatus>>(deployData.postDeployChecks || {});
    const [caseStudy, setCaseStudy] = useState<CaseStudyDraft | null>(deployData.caseStudyDraft || null);

    const checklistItems = [
        { id: 'build', label: 'Local build succeeds without errors' },
        { id: 'secrets', label: 'No hardcoded secrets (API keys, passwords) in code' },
        { id: 'readme', label: 'README.md is updated with setup instructions' },
        { id: 'git', label: 'Code is committed and pushed to main branch' }
    ];

    const postChecks = [
        { id: 'live', label: 'Live URL opens successfully' },
        { id: 'repo', label: 'Repository is public (if applicable)' }
    ];

    const saveDeployData = async (newData: Partial<DeployData>) => {
        setIsSaving(true);
        const updatedDeployData = {
            ...deployData,
            preparedChecks,
            repoUrl,
            liveUrl,
            postDeployChecks,
            caseStudyDraft: caseStudy || undefined,
            ...newData
        };

        const updatedProject = { ...project, deploy_data: updatedDeployData };
        onUpdateProject(updatedProject);

        try {
            await apiFetch('/api/role/update-project-progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    projectId: project.id || project.projectId,
                    progress: project.progress_data,
                    deployData: updatedDeployData,
                    lastUpdated: new Date().toISOString()
                })
            });
        } catch (e) {
            showAlert("Failed to save deployment data.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const togglePrepareCheck = (id: string) => {
        const newChecks = { ...preparedChecks };
        newChecks[id] = newChecks[id] === 'passed' ? 'not_checked' : 'passed';
        setPreparedChecks(newChecks);
        saveDeployData({ preparedChecks: newChecks });
    };

    const togglePostCheck = (id: string) => {
        const newChecks = { ...postDeployChecks };
        newChecks[id] = newChecks[id] === 'passed' ? 'not_checked' : 'passed';
        setPostDeployChecks(newChecks);
        saveDeployData({ postDeployChecks: newChecks });
    };

    const generateCaseStudy = async () => {
        setIsGenerating(true);
        try {
            const res = await apiFetch(`/api/role/project/${project.id || project.projectId}/generate-case-study`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id })
            });
            const data = await res.json();
            if (data.success && data.caseStudyDraft) {
                setCaseStudy(data.caseStudyDraft);
                saveDeployData({ caseStudyDraft: data.caseStudyDraft });
                showAlert("Case study generated successfully!", "success");
            } else {
                showAlert("Could not generate case study.", "error");
            }
        } catch (e) {
            showAlert("Error generating case study.", "error");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleUrlBlur = () => {
        if (repoUrl && !repoUrl.startsWith('http')) {
            setRepoUrl('https://' + repoUrl);
        }
        if (liveUrl && !liveUrl.startsWith('http')) {
            setLiveUrl('https://' + liveUrl);
        }
        saveDeployData({ repoUrl, liveUrl });
    };

    const addToPortfolio = () => {
        if (!caseStudy) {
            showAlert("Please generate a case study first.", "error");
            return;
        }

        const detailsStr = sessionStorage.getItem('user_portfolio_details');
        const details = detailsStr ? JSON.parse(detailsStr) : {};
        
        const experiences = details.experiences || [];
        
        // Prevent duplicate by checking title
        const isDuplicate = experiences.some((exp: any) => exp.title === caseStudy.title);
        
        if (!isDuplicate) {
            const newExperience = {
                title: caseStudy.title,
                role: project.role || "Developer",
                date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                description: `${caseStudy.problem} ${caseStudy.built} Technologies: ${caseStudy.technologies}.`,
                isProject: true,
                liveUrl: liveUrl || undefined,
                repoUrl: repoUrl || undefined
            };
            
            details.experiences = [newExperience, ...experiences];
            sessionStorage.setItem('user_portfolio_details', JSON.stringify(details));
        }

        showAlert("Added to portfolio draft!", "success");
        navigate('/portfolio');
    };

    const architecture = project.blueprint_data?.architecture?.type?.toLowerCase() || '';
    const getDeploymentGuidance = () => {
        if (architecture.includes('frontend') || architecture.includes('static')) {
            return "For static sites and frontend frameworks, consider deploying on Vercel, Netlify, or GitHub Pages. Connect your repository, configure the build settings (e.g., 'npm run build'), and deploy.";
        }
        if (architecture.includes('backend') || architecture.includes('api')) {
            return "For backend services, platforms like Render, Railway, or Heroku are great. Make sure you set your environment variables (like PORT) and define a start script.";
        }
        if (architecture.includes('full')) {
            return "For full-stack apps, you can deploy the frontend on Vercel/Netlify and backend on Render/Railway, or use a unified platform like Railway or Heroku to host both and a database.";
        }
        return "Refer to your stack's official documentation for deployment best practices.";
    };

    return (
        <div className="flex-1 overflow-y-auto bg-white p-8 animate-in fade-in">
            <div className="max-w-3xl mx-auto space-y-10 pb-20">
                {/* Header */}
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3 mb-2">
                        <Rocket className="w-6 h-6 text-emerald-600" />
                        Deploy & Showcase
                    </h2>
                    <p className="text-slate-600">
                        Prepare your project for the real world, get it hosted, and create a professional case study for your portfolio.
                    </p>
                </div>

                {/* Section 1: Prepare */}
                <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-4">1. Prepare for Deployment</h3>
                    <div className="space-y-3">
                        {checklistItems.map(item => {
                            const isChecked = preparedChecks[item.id] === 'passed';
                            return (
                                <button 
                                    key={item.id}
                                    onClick={() => togglePrepareCheck(item.id)}
                                    className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-white transition-colors"
                                >
                                    {isChecked ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-slate-300 shrink-0" />
                                    )}
                                    <span className={`text-[14px] ${isChecked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* Section 2: Publish */}
                <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-2">2. Publish Your Project</h3>
                    <div className="bg-white p-4 rounded-lg border border-slate-100 text-[14px] text-slate-700 leading-relaxed mb-4">
                        <p>{getDeploymentGuidance()}</p>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                                <Github className="w-3.5 h-3.5" /> Repository URL
                            </label>
                            <input 
                                type="url" 
                                value={repoUrl}
                                onChange={(e) => setRepoUrl(e.target.value)}
                                onBlur={handleUrlBlur}
                                placeholder="https://github.com/username/repo"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center gap-2">
                                <Globe className="w-3.5 h-3.5" /> Live Project URL
                            </label>
                            <input 
                                type="url" 
                                value={liveUrl}
                                onChange={(e) => setLiveUrl(e.target.value)}
                                onBlur={handleUrlBlur}
                                placeholder="https://my-awesome-project.com"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                    </div>
                </section>

                {/* Section 3: Showcase */}
                <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <h3 className="text-[15px] font-bold text-slate-800 mb-4 flex items-center justify-between">
                        3. Showcase Your Work
                        {!caseStudy && (
                            <button 
                                onClick={generateCaseStudy}
                                disabled={isGenerating}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                            >
                                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                Generate Case Study
                            </button>
                        )}
                    </h3>

                    {caseStudy ? (
                        <div className="bg-white border border-emerald-100 rounded-lg p-5 shadow-sm space-y-4">
                            <div>
                                <h4 className="text-lg font-bold text-slate-900">{caseStudy.title}</h4>
                                <div className="flex gap-4 mt-2">
                                    {liveUrl && (
                                        <a href={liveUrl} target="_blank" rel="noreferrer" className="text-[13px] text-emerald-600 font-medium flex items-center gap-1 hover:underline">
                                            <ExternalLink className="w-3.5 h-3.5" /> View Live
                                        </a>
                                    )}
                                    {repoUrl && (
                                        <a href={repoUrl} target="_blank" rel="noreferrer" className="text-[13px] text-slate-500 font-medium flex items-center gap-1 hover:underline">
                                            <Github className="w-3.5 h-3.5" /> View Source
                                        </a>
                                    )}
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">The Problem</span>
                                    <p className="text-[13px] text-slate-700 mt-0.5">{caseStudy.problem}</p>
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">What was built</span>
                                    <p className="text-[13px] text-slate-700 mt-0.5">{caseStudy.built}</p>
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Technologies</span>
                                    <p className="text-[13px] text-slate-700 mt-0.5">{caseStudy.technologies}</p>
                                </div>
                                <div>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Challenges Overcome</span>
                                    <p className="text-[13px] text-slate-700 mt-0.5">{caseStudy.challenge}</p>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                                <button 
                                    onClick={addToPortfolio}
                                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    <FileText className="w-4 h-4" />
                                    Add to Portfolio
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-8 bg-white border border-dashed border-slate-200 rounded-lg">
                            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-[14px] text-slate-500">
                                Use AI to generate a professional case study describing what you built, the challenges you faced, and the technologies you used.
                            </p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
