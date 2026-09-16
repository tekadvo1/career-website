import { Github, ArrowUpRight } from 'lucide-react';
import type { ThemeProps } from './types';

export default function CreativeStudio({ data, displayName }: ThemeProps) {
    const featuredProjects = data.experiences.filter(e => e.isProject && e.isFeatured);
    const otherProjects = data.experiences.filter(e => e.isProject && !e.isFeatured);
    const allProjects = [...featuredProjects, ...otherProjects];
    const workExperiences = data.experiences.filter(e => !e.isProject);

    const hasProjects = allProjects.length > 0;
    const hasAbout = !!data.about;
    const hasExperience = workExperiences.length > 0;
    const hasSkills = data.skills && data.skills.length > 0;

    const headline = workExperiences.length > 0 ? workExperiences[0].role : (hasProjects ? "Creative Developer" : "Designer & Developer");

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-[#2D2A26] font-sans selection:bg-[#FFD166] selection:text-[#2D2A26]">
            {/* Header */}
            <header className="px-6 py-8 md:p-12 flex justify-between items-center max-w-7xl mx-auto">
                <div className="text-xl font-black tracking-tighter uppercase">{displayName}</div>
                <div className="flex gap-4">
                    {data.linkedin && <a href={data.linkedin} target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-[#FF6B6B] transition-colors uppercase tracking-widest">LinkedIn</a>}
                    {data.website && <a href={data.website} target="_blank" rel="noreferrer" className="text-sm font-bold hover:text-[#FF6B6B] transition-colors uppercase tracking-widest">Website</a>}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
                
                {/* Hero */}
                <section id="about" className="py-12 md:py-24 max-w-5xl">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                        {headline.toUpperCase()}
                    </h1>
                    {hasAbout && (
                        <p className="text-2xl md:text-3xl font-medium leading-snug text-[#4A4743] max-w-3xl">
                            {data.about}
                        </p>
                    )}
                </section>

                {/* Projects */}
                {hasProjects && (
                    <section id="projects" className="py-20 border-t-2 border-[#2D2A26]">
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-16">Selected Works</h2>
                        
                        <div className="space-y-32">
                            {allProjects.map((proj, idx) => {
                                const isEven = idx % 2 === 0;
                                return (
                                    <div key={proj.id || idx} className={`flex flex-col md:flex-row gap-12 md:gap-24 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                                        
                                        {/* Large Title Area */}
                                        <div className="md:w-5/12 flex flex-col justify-between">
                                            <div>
                                                <h3 className="text-5xl md:text-6xl font-black tracking-tight mb-4 leading-none">{proj.title}</h3>
                                                <div className="text-lg font-bold text-[#FF6B6B] mb-8">{proj.role}</div>
                                            </div>
                                            
                                            <div className="flex flex-col gap-4">
                                                {proj.liveUrl && (
                                                    <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xl font-black hover:text-[#FF6B6B] transition-colors w-fit group">
                                                        Visit Site <ArrowUpRight className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                                    </a>
                                                )}
                                                {proj.repoUrl && (
                                                    <a href={proj.repoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-lg font-bold text-[#4A4743] hover:text-[#2D2A26] transition-colors w-fit">
                                                        <Github className="w-5 h-5" /> Source Code
                                                    </a>
                                                )}
                                            </div>
                                        </div>

                                        {/* Content Area */}
                                        <div className="md:w-7/12 bg-white p-8 md:p-12 border-2 border-[#2D2A26] shadow-[8px_8px_0px_0px_#2D2A26]">
                                            <div className="space-y-8">
                                                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                                    {proj.summary || proj.description}
                                                </p>

                                                {(proj.problem || proj.built || proj.challenge) && (
                                                    <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t-2 border-[#2D2A26]/10">
                                                        {proj.problem && (
                                                            <div>
                                                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Problem</h4>
                                                                <p className="text-base text-[#4A4743] leading-relaxed">{proj.problem}</p>
                                                            </div>
                                                        )}
                                                        {proj.built && (
                                                            <div>
                                                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Solution</h4>
                                                                <p className="text-base text-[#4A4743] leading-relaxed">{proj.built}</p>
                                                            </div>
                                                        )}
                                                        {proj.challenge && (
                                                            <div className="sm:col-span-2">
                                                                <h4 className="text-sm font-black uppercase tracking-widest mb-2">Challenge</h4>
                                                                <p className="text-base text-[#4A4743] leading-relaxed">{proj.challenge}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {proj.technologies && (
                                                    <div className="pt-8">
                                                        <div className="flex flex-wrap gap-2">
                                                            {proj.technologies.split(',').map((tech: string, j: number) => tech.trim() ? (
                                                                <span key={j} className="px-3 py-1 text-sm font-bold border-2 border-[#2D2A26] rounded-full">{tech.trim()}</span>
                                                            ) : null)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                <div className="grid md:grid-cols-2 gap-24 pt-20 border-t-2 border-[#2D2A26]">
                    {/* Experience */}
                    {hasExperience && (
                        <section id="experience">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-12">Experience</h2>
                            <div className="space-y-12">
                                {workExperiences.map((exp, idx) => (
                                    <div key={idx} className="group">
                                        <p className="text-sm font-bold text-[#FF6B6B] mb-2">{exp.date}</p>
                                        <h3 className="text-2xl font-black mb-1">{exp.title}</h3>
                                        <p className="text-lg font-bold text-[#4A4743] mb-4">{exp.role}</p>
                                        <p className="text-base leading-relaxed text-[#4A4743]">{exp.description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Skills */}
                    {hasSkills && (
                        <section id="skills">
                            <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-12">Expertise</h2>
                            <div className="flex flex-wrap gap-3">
                                {data.skills.map((skill, idx) => (
                                    <div key={idx} className="text-xl md:text-2xl font-black bg-[#2D2A26] text-white px-6 py-3 transform rotate-1 hover:-rotate-1 transition-transform">
                                        {skill}
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            </main>
        </div>
    );
}
