import { Globe, Linkedin, ChevronRight, Briefcase, GraduationCap, Code } from 'lucide-react';
import type { ThemeProps } from './types';

export default function ExecutiveClassic({ data, displayName }: ThemeProps) {
    const featuredProjects = data.experiences.filter(e => e.isProject && e.isFeatured);
    const otherProjects = data.experiences.filter(e => e.isProject && !e.isFeatured);
    const allProjects = [...featuredProjects, ...otherProjects];
    const workExperiences = data.experiences.filter(e => !e.isProject);

    const hasProjects = allProjects.length > 0;
    const hasAbout = !!data.about;
    const hasExperience = workExperiences.length > 0;
    const hasSkills = data.skills && data.skills.length > 0;

    const headline = workExperiences.length > 0 ? workExperiences[0].role : (hasProjects ? "Technical Leader" : "Professional");

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans">
            {/* Header */}
            <header className="bg-[#0F172A] text-white border-b-4 border-[#1D4ED8]">
                <div className="max-w-5xl mx-auto px-6 py-12 md:py-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{displayName}</h1>
                            <h2 className="text-xl md:text-2xl text-blue-300 font-medium">{headline}</h2>
                        </div>
                        <div className="flex flex-wrap gap-4">
                            {data.linkedin && (
                                <a href={data.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                                    <Linkedin className="w-4 h-4" /> LinkedIn
                                </a>
                            )}
                            {data.website && (
                                <a href={data.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                                    <Globe className="w-4 h-4" /> Website
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Nav */}
            <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 flex gap-8 text-sm font-bold text-slate-600">
                    {hasAbout && <button onClick={() => scrollToSection('about')} className="py-4 hover:text-blue-700 transition-colors">Executive Summary</button>}
                    {hasExperience && <button onClick={() => scrollToSection('experience')} className="py-4 hover:text-blue-700 transition-colors">Experience</button>}
                    {hasProjects && <button onClick={() => scrollToSection('projects')} className="py-4 hover:text-blue-700 transition-colors">Key Initiatives</button>}
                    {hasSkills && <button onClick={() => scrollToSection('skills')} className="py-4 hover:text-blue-700 transition-colors">Core Competencies</button>}
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* Main Content Area */}
                <div className="md:col-span-8 space-y-16">
                    {/* Executive Summary */}
                    {hasAbout && (
                        <section id="about" className="scroll-mt-20">
                            <h3 className="text-2xl font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                                <Briefcase className="w-6 h-6 text-blue-700" />
                                Executive Summary
                            </h3>
                            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                                <p className="text-base text-slate-700 leading-relaxed whitespace-pre-wrap">
                                    {data.about}
                                </p>
                            </div>
                        </section>
                    )}

                    {/* Experience */}
                    {hasExperience && (
                        <section id="experience" className="scroll-mt-20">
                            <h3 className="text-2xl font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                                <GraduationCap className="w-6 h-6 text-blue-700" />
                                Professional Experience
                            </h3>
                            <div className="space-y-6">
                                {workExperiences.map((exp, idx) => (
                                    <div key={idx} className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                                            <div>
                                                <h4 className="text-xl font-bold text-[#0F172A]">{exp.title}</h4>
                                                <p className="text-base font-semibold text-blue-700">{exp.role}</p>
                                            </div>
                                            <div className="text-sm font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded w-fit">
                                                {exp.date}
                                            </div>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {exp.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Projects / Initiatives */}
                    {hasProjects && (
                        <section id="projects" className="scroll-mt-20">
                            <h3 className="text-2xl font-bold text-[#0F172A] mb-6 flex items-center gap-3">
                                <Code className="w-6 h-6 text-blue-700" />
                                Key Initiatives & Projects
                            </h3>
                            <div className="space-y-8">
                                {allProjects.map((proj, idx) => (
                                    <div key={proj.id || idx} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="bg-slate-50 px-8 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-lg font-bold text-[#0F172A]">{proj.title}</h4>
                                                <p className="text-sm font-semibold text-slate-600">{proj.role} &bull; {proj.date}</p>
                                            </div>
                                            <div className="flex gap-3">
                                                {proj.repoUrl && <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1">Source <ChevronRight className="w-4 h-4"/></a>}
                                                {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-blue-700 hover:text-blue-800 transition-colors flex items-center gap-1">Demo <ChevronRight className="w-4 h-4"/></a>}
                                            </div>
                                        </div>
                                        <div className="p-8 space-y-6">
                                            <p className="text-slate-700 leading-relaxed">
                                                {proj.summary || proj.description}
                                            </p>

                                            {(proj.problem || proj.built || proj.challenge) && (
                                                <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                                                    {proj.problem && (
                                                        <div>
                                                            <h5 className="text-sm font-bold text-[#0F172A] mb-2">Business Challenge</h5>
                                                            <p className="text-sm text-slate-600 leading-relaxed">{proj.problem}</p>
                                                        </div>
                                                    )}
                                                    {proj.built && (
                                                        <div>
                                                            <h5 className="text-sm font-bold text-[#0F172A] mb-2">Solution Implemented</h5>
                                                            <p className="text-sm text-slate-600 leading-relaxed">{proj.built}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {proj.technologies && (
                                                <div className="pt-4 flex flex-wrap gap-2">
                                                    <span className="text-sm font-bold text-slate-900 mr-2 py-1">Technologies:</span>
                                                    {proj.technologies.split(',').map((tech: string, j: number) => tech.trim() ? (
                                                        <span key={j} className="px-2 py-1 text-xs font-semibold bg-blue-50 text-blue-800 rounded">{tech.trim()}</span>
                                                    ) : null)}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>

                {/* Sidebar (Skills) */}
                <div className="md:col-span-4">
                    {hasSkills && (
                        <div id="skills" className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 sticky top-24">
                            <h3 className="text-lg font-bold text-[#0F172A] mb-4 border-b pb-3">Core Competencies</h3>
                            <ul className="space-y-2">
                                {data.skills.map((skill, idx) => (
                                    <li key={idx} className="flex items-center gap-3 text-slate-700 font-medium">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                                        {skill}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}
