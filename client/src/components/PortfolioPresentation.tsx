import { useState } from 'react';
import { Github, Globe, Linkedin, ChevronDown, ChevronUp, ExternalLink, Shield } from 'lucide-react';

interface PortfolioData {
    about: string;
    experiences: any[];
    skills: string[];
    linkedin: string;
    website: string;
    theme: string;
}

interface PortfolioPresentationProps {
    data: PortfolioData;
    displayName: string;
    t: any; // Theme object from THEMES
    isPublic: boolean;
    isPrivate?: boolean;
}

export default function PortfolioPresentation({ data, displayName, t, isPublic, isPrivate }: PortfolioPresentationProps) {
    const [expandedProjectId, setExpandedProjectId] = useState<string | number | null>(null);

    // Filter data
    const featuredProjects = data.experiences.filter(e => e.isProject && e.isFeatured);
    const otherProjects = data.experiences.filter(e => e.isProject && !e.isFeatured);
    const allProjects = [...featuredProjects, ...otherProjects];
    const workExperiences = data.experiences.filter(e => !e.isProject);

    const hasProjects = allProjects.length > 0;
    const hasAbout = !!data.about;
    const hasExperience = workExperiences.length > 0;
    const hasSkills = data.skills && data.skills.length > 0;
    const hasContact = !!(data.linkedin || data.website);

    const isActuallyEmpty = !hasProjects && !hasAbout && !hasExperience && !hasSkills && !hasContact;

    // Headings derived from data
    const headline = workExperiences.length > 0 ? workExperiences[0].role : (hasProjects ? "Software Creator" : "Professional");

    if (isPublic && isPrivate) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-6 text-center ${t.bg}`}>
                <Shield className="w-16 h-16 text-slate-300 mb-6 mx-auto" />
                <h1 className={`text-3xl font-bold ${t.textPrimary} mb-3`}>Portfolio is Private</h1>
                <p className={`max-w-md mx-auto ${t.textSecondary} leading-relaxed`}>This portfolio is currently private or unpublished. Please check back later.</p>
            </div>
        );
    }

    if (isActuallyEmpty) {
        return (
            <div className={`min-h-[50vh] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50`}>
                <h3 className="text-xl font-bold text-slate-700">Portfolio is empty</h3>
                <p className="text-slate-500 mt-2 max-w-sm">No content is available to display yet.</p>
            </div>
        );
    }

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className={`min-h-screen font-sans ${t.bg}`}>
            {/* Header / Nav */}
            <nav className={`sticky top-0 z-50 ${t.card} border-b px-6 py-4 flex items-center justify-between shadow-sm`}>
                <div className={`font-bold text-lg ${t.textPrimary}`}>{displayName}</div>
                <div className="hidden sm:flex items-center gap-6 text-[13px] font-semibold">
                    {hasProjects && <button onClick={() => scrollToSection('projects')} className={`${t.textSecondary} hover:${t.accentText} transition-colors`}>Projects</button>}
                    {hasAbout && <button onClick={() => scrollToSection('about')} className={`${t.textSecondary} hover:${t.accentText} transition-colors`}>About</button>}
                    {hasExperience && <button onClick={() => scrollToSection('experience')} className={`${t.textSecondary} hover:${t.accentText} transition-colors`}>Experience</button>}
                    {hasSkills && <button onClick={() => scrollToSection('skills')} className={`${t.textSecondary} hover:${t.accentText} transition-colors`}>Skills</button>}
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-16 space-y-24">
                
                {/* Introduction */}
                <section id="intro" className="space-y-6 max-w-3xl animate-in slide-in-from-bottom-4 duration-700">
                    <h1 className={`text-4xl sm:text-5xl font-extrabold ${t.textPrimary} tracking-tight`}>
                        {displayName}
                    </h1>
                    <h2 className={`text-xl sm:text-2xl font-semibold ${t.accentText}`}>
                        {headline}
                    </h2>
                    
                    {hasAbout && (
                        <p className={`text-base sm:text-lg ${t.textSecondary} leading-relaxed whitespace-pre-wrap max-w-2xl`}>
                            {data.about}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        {hasProjects && (
                            <button onClick={() => scrollToSection('projects')} className={`px-6 py-3 rounded-lg font-bold text-[14px] transition-colors ${t.primaryBtn}`}>
                                View Projects
                            </button>
                        )}
                        {data.linkedin && (
                            <a href={data.linkedin} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-[14px] transition-colors ${t.card} ${t.textPrimary} hover:bg-slate-50 border`}>
                                <Linkedin className="w-4 h-4 text-[#0A66C2]" /> LinkedIn
                            </a>
                        )}
                        {data.website && (
                            <a href={data.website} target="_blank" rel="noreferrer" className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-[14px] transition-colors ${t.card} ${t.textPrimary} hover:bg-slate-50 border`}>
                                <Globe className="w-4 h-4" /> Website
                            </a>
                        )}
                    </div>
                </section>

                {/* Projects */}
                {hasProjects && (
                    <section id="projects" className="scroll-mt-24 space-y-8">
                        <h3 className={`text-2xl font-bold ${t.textPrimary} flex items-center gap-3`}>
                            Projects <span className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></span>
                        </h3>
                        <div className="grid grid-cols-1 gap-6">
                            {allProjects.map((proj, idx) => {
                                const isExpanded = expandedProjectId === proj.id;
                                return (
                                    <div key={proj.id || idx} className={`${t.card} rounded-xl border p-6 sm:p-8 transition-all duration-300`}>
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <h4 className={`text-xl font-bold ${t.textPrimary} flex items-center gap-3`}>
                                                        {proj.title}
                                                        {proj.isFeatured && <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${t.badge}`}>Featured</span>}
                                                    </h4>
                                                    <p className={`text-[13px] font-semibold mt-1 ${t.textSecondary}`}>{proj.role} &bull; {proj.date}</p>
                                                </div>
                                                
                                                <p className={`text-[15px] leading-relaxed ${t.textSecondary}`}>
                                                    {proj.summary || proj.description}
                                                </p>

                                                {proj.technologies && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {proj.technologies.split(',').map((tech: string, j: number) => tech.trim() ? (
                                                            <span key={j} className={`px-2.5 py-1 text-[12px] font-bold rounded-md ${t.skillBadge}`}>{tech.trim()}</span>
                                                        ) : null)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-row sm:flex-col gap-3 shrink-0">
                                                {proj.liveUrl && (
                                                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg font-bold text-[13px] transition-colors`}>
                                                        <ExternalLink className="w-4 h-4" /> Live Demo
                                                    </a>
                                                )}
                                                {proj.repoUrl && (
                                                    <a href={proj.repoUrl} target="_blank" rel="noreferrer" className={`flex items-center justify-center gap-2 px-4 py-2 ${t.card} hover:bg-slate-50 border border-slate-200 ${t.textPrimary} rounded-lg font-bold text-[13px] transition-colors`}>
                                                        <Github className="w-4 h-4" /> Code
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Expandable Case Study Details */}
                                        {(proj.problem || proj.built || proj.contribution || proj.challenge || proj.learned || proj.nextSteps) && (
                                            <div className="mt-8 pt-6 border-t border-slate-100">
                                                <button 
                                                    onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                                                    className={`flex items-center gap-2 text-[13px] font-bold ${t.accentText} hover:opacity-80 transition-opacity`}
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    {isExpanded ? 'Hide Case Study' : 'Read Case Study'}
                                                </button>
                                                
                                                {isExpanded && (
                                                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in slide-in-from-top-2 duration-300">
                                                        {proj.problem && (
                                                            <div>
                                                                <h5 className={`text-[12px] uppercase font-extrabold tracking-wider ${t.textPrimary} mb-2`}>The Problem</h5>
                                                                <p className={`text-[14px] leading-relaxed ${t.textSecondary}`}>{proj.problem}</p>
                                                            </div>
                                                        )}
                                                        {proj.built && (
                                                            <div>
                                                                <h5 className={`text-[12px] uppercase font-extrabold tracking-wider ${t.textPrimary} mb-2`}>What Was Built</h5>
                                                                <p className={`text-[14px] leading-relaxed ${t.textSecondary}`}>{proj.built}</p>
                                                            </div>
                                                        )}
                                                        {proj.contribution && (
                                                            <div>
                                                                <h5 className={`text-[12px] uppercase font-extrabold tracking-wider ${t.textPrimary} mb-2`}>My Contribution</h5>
                                                                <p className={`text-[14px] leading-relaxed ${t.textSecondary}`}>{proj.contribution}</p>
                                                            </div>
                                                        )}
                                                        {proj.challenge && (
                                                            <div>
                                                                <h5 className={`text-[12px] uppercase font-extrabold tracking-wider ${t.textPrimary} mb-2`}>Challenge & Solution</h5>
                                                                <p className={`text-[14px] leading-relaxed ${t.textSecondary}`}>{proj.challenge}</p>
                                                            </div>
                                                        )}
                                                        {proj.learned && (
                                                            <div>
                                                                <h5 className={`text-[12px] uppercase font-extrabold tracking-wider ${t.textPrimary} mb-2`}>Lessons Learned</h5>
                                                                <p className={`text-[14px] leading-relaxed ${t.textSecondary}`}>{proj.learned}</p>
                                                            </div>
                                                        )}
                                                        {proj.nextSteps && (
                                                            <div>
                                                                <h5 className={`text-[12px] uppercase font-extrabold tracking-wider ${t.textPrimary} mb-2`}>Next Steps</h5>
                                                                <p className={`text-[14px] leading-relaxed ${t.textSecondary}`}>{proj.nextSteps}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {hasExperience && (
                    <section id="experience" className="scroll-mt-24 space-y-8">
                        <h3 className={`text-2xl font-bold ${t.textPrimary} flex items-center gap-3`}>
                            Experience <span className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></span>
                        </h3>
                        <div className="space-y-6 border-l-2 border-slate-200 ml-3 pl-6 sm:pl-8 py-2 relative">
                            {workExperiences.map((exp, idx) => (
                                <div key={idx} className="relative">
                                    <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-4 h-4 rounded-full ${t.accentBg} border-4 ${t.card}`}></div>
                                    <h4 className={`text-lg font-bold ${t.textPrimary}`}>{exp.title}</h4>
                                    <p className={`text-[14px] font-semibold mt-1 mb-3 ${t.accentText}`}>{exp.role} <span className={`font-normal ${t.textSecondary}`}>&bull; {exp.date}</span></p>
                                    <p className={`text-[14px] leading-relaxed ${t.textSecondary} whitespace-pre-wrap max-w-3xl`}>{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {hasSkills && (
                    <section id="skills" className="scroll-mt-24 space-y-6">
                        <h3 className={`text-2xl font-bold ${t.textPrimary} flex items-center gap-3`}>
                            Skills <span className="h-px bg-slate-200 flex-1 ml-4 hidden sm:block"></span>
                        </h3>
                        <div className="flex flex-wrap gap-2.5 max-w-3xl">
                            {data.skills.map((skill, idx) => (
                                <span key={idx} className={`px-4 py-2 text-[14px] font-bold rounded-lg border ${t.skillBadge}`}>
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}

            </main>
            
            {/* Footer */}
            <footer className={`mt-24 py-8 border-t ${t.card} text-center`}>
                <p className={`text-[13px] ${t.textSecondary} font-medium`}>
                    {isPublic ? `© ${new Date().getFullYear()} ${displayName}. All rights reserved.` : "Preview Mode — Content not yet published."}
                </p>
            </footer>
        </div>
    );
}
