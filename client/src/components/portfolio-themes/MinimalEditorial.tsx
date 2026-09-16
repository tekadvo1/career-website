import { Globe, Linkedin, ArrowRight, ExternalLink } from 'lucide-react';
import type { ThemeProps } from './types';

export default function MinimalEditorial({ data, displayName }: ThemeProps) {
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
        <div className="min-h-screen bg-[#FDFDFC] text-stone-900 font-sans selection:bg-stone-200">
            {/* Minimal Header */}
            <header className="px-8 py-10 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                    <p className="text-stone-500 font-medium mt-1">{headline}</p>
                </div>
                <nav className="flex gap-6 text-[13px] font-bold tracking-widest uppercase text-stone-500">
                    {hasProjects && <button onClick={() => scrollToSection('projects')} className="hover:text-stone-900 transition-colors">Work</button>}
                    {hasAbout && <button onClick={() => scrollToSection('about')} className="hover:text-stone-900 transition-colors">About</button>}
                    {hasExperience && <button onClick={() => scrollToSection('experience')} className="hover:text-stone-900 transition-colors">Experience</button>}
                </nav>
            </header>

            <main className="max-w-4xl mx-auto px-8 py-12 space-y-32">
                
                {/* Introduction */}
                {hasAbout && (
                    <section id="about" className="max-w-2xl animate-in fade-in duration-1000">
                        <p className="text-xl md:text-2xl leading-relaxed font-medium text-stone-800 whitespace-pre-wrap">
                            {data.about}
                        </p>
                        
                        <div className="flex gap-6 mt-8">
                            {data.linkedin && (
                                <a href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold transition-colors">
                                    <Linkedin className="w-5 h-5" /> LinkedIn
                                </a>
                            )}
                            {data.website && (
                                <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-bold transition-colors">
                                    <Globe className="w-5 h-5" /> Website
                                </a>
                            )}
                        </div>
                    </section>
                )}

                {/* Projects */}
                {hasProjects && (
                    <section id="projects" className="scroll-mt-24 space-y-20">
                        <h2 className="text-sm font-bold tracking-widest uppercase text-stone-400 border-b border-stone-200 pb-4">Selected Work</h2>
                        
                        <div className="space-y-32">
                            {allProjects.map((proj, idx) => (
                                <article key={proj.id || idx} className="group">
                                    <header className="mb-8">
                                        <div className="flex items-baseline justify-between mb-4">
                                            <h3 className="text-3xl md:text-4xl font-bold tracking-tight group-hover:text-stone-600 transition-colors">{proj.title}</h3>
                                            <span className="text-stone-400 font-medium">{proj.date}</span>
                                        </div>
                                        <p className="text-lg text-stone-500 font-medium">{proj.role}</p>
                                    </header>

                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                                        <div className="md:col-span-7 space-y-6">
                                            <p className="text-lg leading-relaxed text-stone-800">
                                                {proj.summary || proj.description}
                                            </p>

                                            {(proj.problem || proj.built || proj.challenge) && (
                                                <div className="space-y-8 pt-8">
                                                    {proj.problem && (
                                                        <div>
                                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">The Problem</h4>
                                                            <p className="text-stone-700 leading-relaxed">{proj.problem}</p>
                                                        </div>
                                                    )}
                                                    {proj.built && (
                                                        <div>
                                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">The Solution</h4>
                                                            <p className="text-stone-700 leading-relaxed">{proj.built}</p>
                                                        </div>
                                                    )}
                                                    {proj.challenge && (
                                                        <div>
                                                            <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-2">Challenges</h4>
                                                            <p className="text-stone-700 leading-relaxed">{proj.challenge}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <aside className="md:col-span-5 space-y-10">
                                            {proj.technologies && (
                                                <div>
                                                    <h4 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-4">Technologies</h4>
                                                    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-stone-800 font-medium">
                                                        {proj.technologies.split(',').map((tech: string, j: number) => tech.trim() ? (
                                                            <li key={j}>{tech.trim()}</li>
                                                        ) : null)}
                                                    </ul>
                                                </div>
                                            )}

                                            {(proj.liveUrl || proj.repoUrl) && (
                                                <div className="flex flex-col gap-4 pt-4 border-t border-stone-200">
                                                    {proj.liveUrl && (
                                                        <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-stone-900 hover:text-stone-500 transition-colors group/link">
                                                            Visit Project <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                                        </a>
                                                    )}
                                                    {proj.repoUrl && (
                                                        <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 font-bold text-stone-500 hover:text-stone-900 transition-colors group/link">
                                                            View Source <ExternalLink className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                                        </a>
                                                    )}
                                                </div>
                                            )}
                                        </aside>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* Experience & Skills */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-8 pb-20">
                    {hasExperience && (
                        <section id="experience" className="space-y-12">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-stone-400 border-b border-stone-200 pb-4">Experience</h2>
                            <div className="space-y-12">
                                {workExperiences.map((exp, idx) => (
                                    <div key={idx}>
                                        <h3 className="text-xl font-bold text-stone-900">{exp.title}</h3>
                                        <p className="text-stone-500 font-medium mt-1 mb-4">{exp.role} <span className="mx-2">&mdash;</span> {exp.date}</p>
                                        <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {hasSkills && (
                        <section id="skills" className="space-y-8">
                            <h2 className="text-sm font-bold tracking-widest uppercase text-stone-400 border-b border-stone-200 pb-4">Capabilities</h2>
                            <ul className="space-y-3">
                                {data.skills.map((skill, idx) => (
                                    <li key={idx} className="text-lg font-medium text-stone-800">{skill}</li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
