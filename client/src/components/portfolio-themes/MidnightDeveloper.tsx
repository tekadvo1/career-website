import { Github, Globe, Linkedin, ExternalLink, Terminal } from 'lucide-react';
import type { ThemeProps } from './types';

export default function MidnightDeveloper({ data, displayName }: ThemeProps) {
    const featuredProjects = data.experiences.filter(e => e.isProject && e.isFeatured);
    const otherProjects = data.experiences.filter(e => e.isProject && !e.isFeatured);
    const allProjects = [...featuredProjects, ...otherProjects];
    const workExperiences = data.experiences.filter(e => !e.isProject);

    const hasProjects = allProjects.length > 0;
    const hasAbout = !!data.about;
    const hasExperience = workExperiences.length > 0;
    const hasSkills = data.skills && data.skills.length > 0;

    const headline = workExperiences.length > 0 ? workExperiences[0].role : (hasProjects ? "Software Engineer" : "Developer");

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-300 font-sans selection:bg-indigo-500/30">
            {/* Developer Header */}
            <header className="sticky top-0 z-50 bg-[#020617]/90 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3 font-mono font-bold text-slate-200">
                        <Terminal className="w-5 h-5 text-indigo-400" />
                        <span>~/{displayName.toLowerCase().replace(/\s+/g, '-')}</span>
                    </div>
                    <nav className="hidden sm:flex gap-6 text-[13px] font-mono text-slate-400">
                        {hasProjects && <button onClick={() => scrollToSection('projects')} className="hover:text-indigo-400 transition-colors">./projects</button>}
                        {hasAbout && <button onClick={() => scrollToSection('about')} className="hover:text-indigo-400 transition-colors">./about</button>}
                        {hasExperience && <button onClick={() => scrollToSection('experience')} className="hover:text-indigo-400 transition-colors">./experience</button>}
                    </nav>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-20 space-y-32">
                
                {/* Introduction */}
                <section id="about" className="space-y-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">{displayName}</h1>
                        <h2 className="text-xl md:text-2xl font-mono text-indigo-400 mt-4">&gt; {headline}</h2>
                    </div>
                    
                    {hasAbout && (
                        <p className="text-lg leading-relaxed text-slate-400 max-w-2xl whitespace-pre-wrap">
                            {data.about}
                        </p>
                    )}

                    <div className="flex gap-4 pt-6">
                        {data.linkedin && (
                            <a href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-300 hover:border-slate-500 hover:text-white transition-all font-mono text-sm">
                                <Linkedin className="w-4 h-4 text-[#0A66C2]" /> linkedin
                            </a>
                        )}
                        {data.website && (
                            <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-700 rounded text-slate-300 hover:border-slate-500 hover:text-white transition-all font-mono text-sm">
                                <Globe className="w-4 h-4" /> website
                            </a>
                        )}
                    </div>
                </section>

                {/* Projects */}
                {hasProjects && (
                    <section id="projects" className="scroll-mt-24 space-y-12">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                            <span className="text-indigo-500 font-mono">01.</span> Projects
                            <div className="h-px bg-slate-800 flex-1 ml-4"></div>
                        </h3>
                        
                        <div className="grid gap-8">
                            {allProjects.map((proj, idx) => (
                                <div key={proj.id || idx} className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 md:p-8 hover:border-slate-700 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-bold text-slate-100">{proj.title}</h4>
                                                {proj.isFeatured && <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">Featured</span>}
                                            </div>
                                            <p className="text-sm font-mono text-slate-500 mb-6">{proj.role} // {proj.date}</p>
                                            
                                            <p className="text-slate-400 leading-relaxed mb-6">
                                                {proj.summary || proj.description}
                                            </p>

                                            {(proj.problem || proj.built || proj.challenge) && (
                                                <div className="space-y-6 mb-8 p-4 bg-slate-950 rounded border border-slate-800/50">
                                                    {proj.problem && (
                                                        <div>
                                                            <h5 className="text-xs font-mono text-slate-500 mb-1">## Problem</h5>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{proj.problem}</p>
                                                        </div>
                                                    )}
                                                    {proj.built && (
                                                        <div>
                                                            <h5 className="text-xs font-mono text-slate-500 mb-1">## Implementation</h5>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{proj.built}</p>
                                                        </div>
                                                    )}
                                                    {proj.challenge && (
                                                        <div>
                                                            <h5 className="text-xs font-mono text-slate-500 mb-1">## Challenge</h5>
                                                            <p className="text-sm text-slate-300 leading-relaxed">{proj.challenge}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {proj.technologies && (
                                                <div className="flex flex-wrap gap-2">
                                                    {proj.technologies.split(',').map((tech: string, j: number) => tech.trim() ? (
                                                        <span key={j} className="px-2 py-1 text-[12px] font-mono rounded bg-slate-800 text-indigo-300">{tech.trim()}</span>
                                                    ) : null)}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-row md:flex-col gap-3 shrink-0">
                                            {proj.repoUrl && (
                                                <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-mono text-sm transition-colors">
                                                    <Github className="w-4 h-4" /> Source
                                                </a>
                                            )}
                                            {proj.liveUrl && (
                                                <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded font-mono text-sm transition-colors">
                                                    <ExternalLink className="w-4 h-4" /> App
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience */}
                {hasExperience && (
                    <section id="experience" className="scroll-mt-24 space-y-12">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                            <span className="text-indigo-500 font-mono">02.</span> Experience
                            <div className="h-px bg-slate-800 flex-1 ml-4"></div>
                        </h3>
                        
                        <div className="space-y-10 border-l border-slate-800 ml-2 pl-8 relative">
                            {workExperiences.map((exp, idx) => (
                                <div key={idx} className="relative group">
                                    <div className="absolute -left-[37px] top-1.5 w-3 h-3 rounded-full bg-slate-800 group-hover:bg-indigo-500 transition-colors"></div>
                                    <h4 className="text-lg font-bold text-slate-200">{exp.title}</h4>
                                    <p className="text-sm font-mono text-indigo-400 mt-1 mb-3">{exp.role} <span className="text-slate-600 ml-2">[{exp.date}]</span></p>
                                    <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Skills */}
                {hasSkills && (
                    <section id="skills" className="scroll-mt-24 space-y-8 pb-20">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                            <span className="text-indigo-500 font-mono">03.</span> Skills
                            <div className="h-px bg-slate-800 flex-1 ml-4"></div>
                        </h3>
                        
                        <div className="font-mono text-sm text-slate-400 flex flex-wrap gap-x-8 gap-y-4">
                            {data.skills.map((skill, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <span className="text-indigo-500">&gt;</span> {skill}
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}
