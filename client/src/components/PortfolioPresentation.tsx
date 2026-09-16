import { Shield } from 'lucide-react';
import EmeraldProfessional from './portfolio-themes/EmeraldProfessional';
import MinimalEditorial from './portfolio-themes/MinimalEditorial';
import MidnightDeveloper from './portfolio-themes/MidnightDeveloper';
import CreativeStudio from './portfolio-themes/CreativeStudio';
import ExecutiveClassic from './portfolio-themes/ExecutiveClassic';
import type { PortfolioData } from './portfolio-themes/types';

interface PortfolioPresentationProps {
    data: PortfolioData;
    displayName: string;
    isPublic: boolean;
    isPrivate?: boolean;
}

export default function PortfolioPresentation({ data, displayName, isPublic, isPrivate }: PortfolioPresentationProps) {
    // Filter data to check if actually empty
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

    if (isPublic && isPrivate) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
                <Shield className="w-16 h-16 text-slate-300 mb-6 mx-auto" />
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Portfolio is Private</h1>
                <p className="max-w-md mx-auto text-slate-600 leading-relaxed">This portfolio is currently private or unpublished. Please check back later.</p>
            </div>
        );
    }

    if (isActuallyEmpty) {
        return (
            <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
                <div className="min-h-[50vh] w-full max-w-2xl flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-white shadow-sm">
                    <h3 className="text-xl font-bold text-slate-700">Portfolio is empty</h3>
                    <p className="text-slate-500 mt-2 max-w-sm">No content is available to display yet.</p>
                </div>
            </div>
        );
    }

    // Map themes including backwards compatibility
    const themeKey = data.theme || 'minimalist';
    
    switch (themeKey) {
        case 'dark':
            return <MidnightDeveloper data={data} displayName={displayName} />;
        case 'executive':
            return <ExecutiveClassic data={data} displayName={displayName} />;
        case 'emerald':
            return <EmeraldProfessional data={data} displayName={displayName} />;
        case 'creative':
            return <CreativeStudio data={data} displayName={displayName} />;
        case 'minimalist':
        default:
            return <MinimalEditorial data={data} displayName={displayName} />;
    }
}
