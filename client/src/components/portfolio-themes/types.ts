export interface PortfolioData {
    about: string;
    experiences: any[];
    skills: string[];
    linkedin: string;
    website: string;
    theme: string;
}

export interface ThemeProps {
    data: PortfolioData;
    displayName: string;
}
