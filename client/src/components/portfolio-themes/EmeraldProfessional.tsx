import { Github, Globe, Linkedin, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import type { ThemeProps } from './types';

export default function EmeraldProfessional({ data, displayName }: ThemeProps) {
    const [expandedProjectId, setExpandedProjectId] = useState<string | number | null>(null);

    const featuredProjects = data.experiences.filter(e => e.isProject && e.isFeatured);
    const otherProjects = data.experiences.filter(e => e.isProject && !e.isFeatured);
    const allProjects = [...featuredProjects, ...otherProjects];
    const workExperiences = data.experiences.filter(e => !e.isProject);

    const hasProjects = allProjects.length > 0;
    const hasAbout = !!data.about;
    const hasExperience = workExperiences.length > 0;
    const hasSkills = data.skills && data.skills.length > 0;

    const headline = workExperiences.length > 0 ? workExperiences[0].role : (hasProjects ? "Software Creator" : "Professional");

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Header */}
            <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-emerald-100 px-8 py-4 flex items-center justify-between">
                <div className="font-extrabold text-xl text-emerald-950 tracking-tight">{displayName}</div>
                <div className="hidden sm:flex items-center gap-6 text-[14px] font-semibold">
                    {hasProjects && <button onClick={() => scrollToSection('projects')} className="text-slate-600 hover:text-emerald-700 transition-colors">Projects</button>}
                    {hasAbout && <button onClick={() => scrollToSection('about')} className="text-slate-600 hover:text-emerald-700 transition-colors">About</button>}
                    {hasExperience && <button onClick={() => scrollToSection('experience')} className="text-slate-600 hover:text-emerald-700 transition-colors">Experience</button>}
                    {hasSkills && <button onClick={() => scrollToSection('skills')} className="text-slate-600 hover:text-emerald-700 transition-colors">Skills</button>}
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-16 space-y-32">
                {/* Introduction */}
                <section id="about" className="space-y-6 max-w-3xl animate-in slide-in-from-bottom-4 duration-700 pt-8">
                    <h1 className="text-5xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        {displayName}
                    </h1>
                    <h2 className="text-2xl sm:text-3xl font-semibold text-emerald-700">
                        {headline}
                    </h2>
                    
                    {hasAbout && (
                        <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-wrap max-w-2xl">
                            {data.about}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 pt-6">
                        {hasProjects && (
                            <button onClick={() => scrollToSection('projects')} className="px-6 py-3 rounded-lg font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-sm">
                                View Projects
                            </button>
                        )}
                        {data.linkedin && (
                            <a href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors">
                                <Linkedin className="w-5 h-5 text-[#0A66C2]" /> LinkedIn
                            </a>
                        )}
                        {data.website && (
                            <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-colors">
                                <Globe className="w-5 h-5" /> Website
                            </a>
                        )}
                    </div>
                </section>

                {/* Projects */}
                {hasProjects && (
                    <section id="projects" className="scroll-mt-24">
                        <div className="flex items-center gap-4 mb-10">
                            <h3 className="text-3xl font-extrabold text-slate-900">Featured Projects</h3>
                            <div className="h-px bg-emerald-100 flex-1"></div>
                        </div>
                        <div className="grid grid-cols-1 gap-8">
                            {allProjects.map((proj, idx) => {
                                const isExpanded = expandedProjectId === proj.id;
                                return (
                                    <div key={proj.id || idx} className="bg-white rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow p-8">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                                            <div className="flex-1 space-y-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h4 className="text-2xl font-bold text-slate-900">{proj.title}</h4>
                                                        {proj.isFeatured && <span className="text-[11px] uppercase font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Featured</span>}
                                                    </div>
                                                    <p className="text-[14px] font-semibold text-emerald-600">{proj.role} &bull; {proj.date}</p>
                                                </div>
                                                
                                                <p className="text-base leading-relaxed text-slate-600">
                                                    {proj.summary || proj.description}
                                                </p>

                                                {proj.technologies && (
                                                    <div className="flex flex-wrap gap-2 pt-2">
                                                        {proj.technologies.split(',').map((tech: string, j: number) => tech.trim() ? (
                                                            <span key={j} className="px-3 py-1 text-[13px] font-bold rounded-lg bg-slate-50 text-slate-700 border border-slate-200">{tech.trim()}</span>
                                                        ) : null)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex flex-row md:flex-col gap-3 shrink-0">
                                                {proj.liveUrl && (
                                                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-[14px] transition-colors">
                                                        <ExternalLink className="w-4 h-4" /> Live Demo
                                                    </a>
                                                )}
                                                {proj.repoUrl && (
                                                    <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-[14px] transition-colors shadow-sm">
                                                        <Github className="w-4 h-4" /> Source Code
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {(proj.problem || proj.built || proj.contribution || proj.challenge || proj.learned || proj.nextSteps) && (
                                            <div className="mt-8 pt-6 border-t border-emerald-50">
                                                <button 
                                                    onClick={() => setExpandedProjectId(isExpanded ? null : proj.id)}
                                                    className="flex items-center gap-2 text-[14px] font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                                                >
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                    {isExpanded ? 'Hide Details' : 'Read Case Study'}
                                                </button>
                                                
                                                {isExpanded && (
                                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 animate-in slide-in-from-top-2 duration-300">
                                                        {proj.problem && (
                                                            <div>
                                                                <h5 className="text-[13px] uppercase font-extrabold tracking-wider text-slate-900 mb-3 border-l-2 border-emerald-500 pl-3">The Problem</h5>
                                                                <p className="text-[15px] leading-relaxed text-slate-600">{proj.problem}</p>
                                                            </div>
                                                        )}
                                                        {proj.built && (
                                                            <div>
                                                                <h5 className="text-[13px] uppercase font-extrabold tracking-wider text-slate-900 mb-3 border-l-2 border-emerald-500 pl-3">What Was Built</h5>
                                                                <p className="text-[15px] leading-relaxed text-slate-600">{proj.built}</p>
                                                            </div>
                                                        )}
                                                        {proj.contribution && (
                                                            <div>
                                                                <h5 className="text-[13px] uppercase font-extrabold tracking-wider text-slate-900 mb-3 border-l-2 border-emerald-500 pl-3">My Contribution</h5>
                                                                <p className="text-[15px] leading-relaxed text-slate-600">{proj.contribution}</p>
                                                            </div>
                                                        )}
                                                        {proj.challenge && (
                                                            <div>
                                                                <h5 className="text-[13px] uppercase font-extrabold tracking-wider text-slate-900 mb-3 border-l-2 border-emerald-500 pl-3">Challenge & Solution</h5>
                                                                <p className="text-[15px] leading-relaxed text-slate-600">{proj.challenge}</p>
                                                            </div>
                                                        )}
                                                        {proj.learned && (
                                                            <div>
                                                                <h5 className="text-[13px] uppercase font-extrabold tracking-wider text-slate-900 mb-3 border-l-2 border-emerald-500 pl-3">Lessons Learned</h5>
                                                                <p className="text-[15px] leading-relaxed text-slate-600">{proj.learned}</p>
                                                            </div>
                                                        )}
                                                        {proj.nextSteps && (
                                                            <div>
                                                                <h5 className="text-[13px] uppercase font-extrabold tracking-wider text-slate-900 mb-3 border-l-2 border-emerald-500 pl-3">Next Steps</h5>
                                                                <p className="text-[15px] leading-relaxed text-slate-600">{proj.nextSteps}</p>
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
                    <section id="experience" className="scroll-mt-24">
                        <div className="flex items-center gap-4 mb-10">
                            <h3 className="text-3xl font-extrabold text-slate-900">Experience</h3>
                            <div className="h-px bg-emerald-100 flex-1"></div>
                        </div>
                        <div className="space-y-12 border-l-[3px] border-emerald-100 ml-2 sm:ml-4 pl-8 sm:pl-10 py-4 relative">
                            {workExperiences.map((exp, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[45px] sm:-left-[53px] top-1.5 w-6 h-6 rounded-full bg-emerald-500 border-[6px] border-white shadow-sm"></div>
                                    <h4 className="text-xl font-bold text-slate-900">{exp.title}</h4>
                                    <p className="text-[15px] font-semibold mt-1 mb-4 text-emerald-700">{exp.role} <span className="font-normal text-slate-500 ml-2">&bull; {exp.date}</span></p>
                                    <p className="text-[15px] leading-relaxed text-slate-600 whitespace-pre-wrap max-w-3xl">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {hasSkills && (
                    <section id="skills" className="scroll-mt-24 pb-12">
                        <div className="flex items-center gap-4 mb-8">
                            <h3 className="text-3xl font-extrabold text-slate-900">Skills & Expertise</h3>
                            <div className="h-px bg-emerald-100 flex-1"></div>
                        </div>
                        <div className="flex flex-wrap gap-3 max-w-4xl">
                            {data.skills.map((skill, idx) => (
                                <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-[14px] font-bold shadow-sm">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
