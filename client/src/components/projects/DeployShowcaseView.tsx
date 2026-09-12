import { useState, useEffect } from 'react';
import { 
    Rocket, CheckCircle2, Circle, Globe, ExternalLink, 
    FileText, Sparkles, Loader2, Github, Save
} from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
import type { Project, DeployData, CaseStudyDraft, CheckStatus } from './projectModel';
import { useAlert } from '../../contexts/AlertContext';

interface DeployShowcaseViewProps {
    project: Project;
    onUpdateProject: (p: Project) => void;
}

export default function DeployShowcaseView({ project, onUpdateProject }: DeployShowcaseViewProps) {
    const { showAlert } = useAlert();
    const userString = sessionStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : {};

    const [isGenerating, setIsGenerating] = useState(false);
    
    const deployData: DeployData = project.deploy_data || {
        preparedChecks: {},
        repoUrl: '',
        liveUrl: '',
        postDeployChecks: {}
    };

    const [preparedChecks, setPreparedChecks] = useState<Record<string, CheckStatus>>(deployData.preparedChecks || {});
    const [repoUrl, setRepoUrl] = useState(deployData.repoUrl || '');
    const [liveUrl, setLiveUrl] = useState(deployData.liveUrl || '');
    const [linksSaveState, setLinksSaveState] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');

    // Case Study Draft
    const initialDraft = project.portfolio_draft?.title ? project.portfolio_draft : deployData.caseStudyDraft;
    const [caseStudy, setCaseStudy] = useState<CaseStudyDraft | null>(initialDraft || null);
    const [portfolioSaveState, setPortfolioSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>(project.portfolio_draft?.title ? 'saved' : 'idle');
    const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

    const checklistItems = [
        { id: 'build', label: 'Local build succeeds without errors' },
        { id: 'secrets', label: 'No hardcoded secrets (API keys, passwords) in code' },
        { id: 'readme', label: 'README.md is updated with setup instructions' },
        { id: 'git', label: 'Code is committed and pushed to main branch' }
    ];

    useEffect(() => {
        if (repoUrl !== (deployData.repoUrl || '') || liveUrl !== (deployData.liveUrl || '')) {
            setLinksSaveState('unsaved');
        }
    }, [repoUrl, liveUrl, deployData.repoUrl, deployData.liveUrl]);

    const saveDeployData = async (newData: Partial<DeployData>, customPortfolioDraft?: any) => {
        const updatedDeployData = {
            ...deployData,
            preparedChecks,
            repoUrl,
            liveUrl,
            postDeployChecks: deployData.postDeployChecks || {},
            caseStudyDraft: caseStudy || undefined,
            ...newData
        };

        const updatedProject = { ...project, deploy_data: updatedDeployData };
        if (customPortfolioDraft) {
            updatedProject.portfolio_draft = customPortfolioDraft;
        }
        onUpdateProject(updatedProject);

        await apiFetch('/api/role/update-project-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user.id,
                projectId: project.id || project.projectId,
                progress: project.progress_data,
                deployData: updatedDeployData,
                portfolioDraft: customPortfolioDraft !== undefined ? customPortfolioDraft : project.portfolio_draft,
                lastUpdated: new Date().toISOString()
            })
        });
    };

    const togglePrepareCheck = (id: string) => {
        const newChecks = { ...preparedChecks };
        newChecks[id] = newChecks[id] === 'passed' ? 'not_checked' : 'passed';
        setPreparedChecks(newChecks);
        saveDeployData({ preparedChecks: newChecks }).catch(() => {});
    };

    const validateUrl = (url: string) => {
        if (!url) return true; // empty is allowed
        return url.startsWith('http://') || url.startsWith('https://');
    };

    const handleSaveLinks = async () => {
        let finalRepoUrl = repoUrl;
        let finalLiveUrl = liveUrl;

        if (repoUrl && !validateUrl(repoUrl)) finalRepoUrl = 'https://' + repoUrl;
        if (liveUrl && !validateUrl(liveUrl)) finalLiveUrl = 'https://' + liveUrl;

        setRepoUrl(finalRepoUrl);
        setLiveUrl(finalLiveUrl);
        setLinksSaveState('saving');

        try {
            await saveDeployData({ repoUrl: finalRepoUrl, liveUrl: finalLiveUrl });
            setLinksSaveState('saved');
            setTimeout(() => { if (linksSaveState === 'saving') setLinksSaveState('idle') }, 2000);
        } catch (e) {
            setLinksSaveState('error');
        }
    };

    const generateCaseStudy = async () => {
        if (caseStudy && caseStudy.title) {
            if (!confirm("This will overwrite your current draft. Are you sure?")) return;
        }

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
                await saveDeployData({ caseStudyDraft: data.caseStudyDraft });
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

    const addToPortfolio = async () => {
        if (!caseStudy) {
            showAlert("Please create a case study first.", "error");
            return;
        }

        setPortfolioSaveState('saving');
        try {
            const updatedDraft = {
                ...caseStudy,
                repoUrl,
                liveUrl,
                isProject: true,
                role: project.role || "Developer",
                date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            };
            
            await saveDeployData({}, updatedDraft);
            setPortfolioSaveState('saved');
            showAlert("Saved to portfolio draft!", "success");
        } catch (e) {
            setPortfolioSaveState('error');
            showAlert("Failed to save to portfolio.", "error");
        }
    };

    const updateCaseStudyField = (field: keyof CaseStudyDraft, value: string) => {
        if (caseStudy) {
            setCaseStudy({ ...caseStudy, [field]: value });
            setPortfolioSaveState('idle'); // marked as dirty
        }
    };

    const getDeploymentGuidance = () => {
        const architecture = project.blueprint_data?.architecture?.type?.toLowerCase() || '';
        if (architecture.includes('frontend') || architecture.includes('static')) {
            return "For static sites and frontend frameworks, consider deploying on Vercel, Netlify, or GitHub Pages. Connect your repository, configure the build settings, and deploy.";
        }
        if (architecture.includes('backend') || architecture.includes('api')) {
            return "For backend services, platforms like Render, Railway, or Heroku are great. Make sure you set your environment variables and define a start script.";
        }
        if (architecture.includes('full')) {
            return "For full-stack apps, you can deploy the frontend on Vercel/Netlify and backend on Render/Railway, or use a unified platform like Railway or Heroku.";
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

                {/* Section 2: Publish & Links */}
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
                                placeholder="https://my-awesome-project.com"
                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex justify-end mt-2">
                            <button
                                onClick={handleSaveLinks}
                                disabled={linksSaveState === 'saving' || linksSaveState === 'idle'}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    linksSaveState === 'saved' ? 'bg-emerald-100 text-emerald-700' :
                                    linksSaveState === 'unsaved' ? 'bg-slate-900 text-white hover:bg-slate-800' :
                                    linksSaveState === 'error' ? 'bg-red-100 text-red-700' :
                                    'bg-slate-100 text-slate-400'
                                }`}
                            >
                                {linksSaveState === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                {linksSaveState === 'unsaved' ? 'Save Links' :
                                 linksSaveState === 'saving' ? 'Saving...' :
                                 linksSaveState === 'saved' ? 'Saved' :
                                 linksSaveState === 'error' ? 'Retry Save' : 'Save Links'}
                            </button>
                        </div>
                    </div>
                </section>

                {/* Section 3 & 4: Showcase & Portfolio Draft */}
                <section className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[15px] font-bold text-slate-800">3. Case Study & Portfolio</h3>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={generateCaseStudy}
                                disabled={isGenerating}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                                {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                {caseStudy ? "Regenerate AI Draft" : "Generate AI Draft"}
                            </button>
                        </div>
                    </div>

                    {!caseStudy ? (
                        <div className="text-center p-8 bg-white border border-dashed border-slate-300 rounded-lg">
                            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                            <p className="text-[14px] text-slate-500 mb-4">
                                Start with an AI-generated draft or create your case study from scratch.
                            </p>
                            <button
                                onClick={() => setCaseStudy({ title: project.title, problem: '', built: '', technologies: '', challenge: '' })}
                                className="text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg"
                            >
                                Start Manually
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                            <div className="flex border-b border-slate-200">
                                <button
                                    onClick={() => setActiveTab('edit')}
                                    className={`flex-1 py-2 text-sm font-medium ${activeTab === 'edit' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Editor
                                </button>
                                <button
                                    onClick={() => setActiveTab('preview')}
                                    className={`flex-1 py-2 text-sm font-medium ${activeTab === 'preview' ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                                >
                                    Preview
                                </button>
                            </div>

                            {activeTab === 'edit' && (
                                <div className="p-5 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Project Title</label>
                                        <input
                                            type="text"
                                            value={caseStudy.title}
                                            onChange={(e) => updateCaseStudyField('title', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">The Problem</label>
                                        <textarea
                                            value={caseStudy.problem}
                                            onChange={(e) => updateCaseStudyField('problem', e.target.value)}
                                            rows={2}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">What was built</label>
                                        <textarea
                                            value={caseStudy.built}
                                            onChange={(e) => updateCaseStudyField('built', e.target.value)}
                                            rows={3}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Technologies Used</label>
                                        <input
                                            type="text"
                                            value={caseStudy.technologies}
                                            onChange={(e) => updateCaseStudyField('technologies', e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Challenges Overcome</label>
                                        <textarea
                                            value={caseStudy.challenge}
                                            onChange={(e) => updateCaseStudyField('challenge', e.target.value)}
                                            rows={3}
                                            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preview' && (
                                <div className="p-6 bg-slate-50 space-y-4">
                                    <h4 className="text-xl font-bold text-slate-900">{caseStudy.title}</h4>
                                    <div className="flex gap-4">
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
                                    <div className="text-[14px] text-slate-700 space-y-3">
                                        <p><strong>Problem:</strong> {caseStudy.problem}</p>
                                        <p><strong>Solution:</strong> {caseStudy.built}</p>
                                        <p><strong>Technologies:</strong> {caseStudy.technologies}</p>
                                        <p><strong>Challenges:</strong> {caseStudy.challenge}</p>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                                <span className="text-xs text-slate-500">
                                    {portfolioSaveState === 'saved' ? 'Draft is up to date' : 'Unsaved changes'}
                                </span>
                                <button 
                                    onClick={addToPortfolio}
                                    disabled={portfolioSaveState === 'saving'}
                                    className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg text-[13px] font-medium transition-colors"
                                >
                                    {portfolioSaveState === 'saving' ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                    {project.portfolio_draft?.title ? 'Update Portfolio Draft' : 'Save to Portfolio'}
                                </button>
                            </div>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
