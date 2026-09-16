import { useState } from 'react';
import { Sparkles, X, Check, Loader2, AlertCircle } from 'lucide-react';
import { apiFetch } from '../utils/apiFetch';

interface PortfolioWritingHelpProps {
    fieldId: string;
    fieldLabel: string;
    currentValue: string;
    projectId?: string | number;
    onApply: (suggestedText: string) => void;
    onClose: () => void;
}

export default function PortfolioWritingHelp({ 
    fieldId, 
    fieldLabel, 
    currentValue, 
    projectId, 
    onApply, 
    onClose 
}: PortfolioWritingHelpProps) {
    const [notes, setNotes] = useState('');
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getHelperText = (fieldId: string) => {
        if (fieldId.includes('skills')) return "List the skills you have without formatting; AI will categorize them.";
        if (fieldId.includes('about')) return "Briefly list your background, current role, and goals.";
        if (fieldId.includes('problem')) return "Who is this project for, and what pain point does it solve?";
        if (fieldId.includes('built')) return "What is the final product and its key features?";
        if (fieldId.includes('contribution')) return "What specific parts did you build yourself?";
        if (fieldId.includes('challenge')) return "Name one technical issue and how you fixed it.";
        if (fieldId.includes('learned')) return "What are the main takeaways from this project?";
        if (fieldId.includes('nextSteps')) return "What would you add if you had more time?";
        if (fieldId.includes('description')) return "List your main responsibilities and achievements.";
        return "Provide short factual notes.";
    };

    const handleGenerate = async () => {
        if (!notes.trim()) {
            setError("Please provide some factual notes first.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuggestion('');

        try {
            const res = await apiFetch('/api/portfolio/writing-help', {
                method: 'POST',
                body: JSON.stringify({ fieldId, fieldLabel, notes, currentValue, projectId })
            });
            const data = await res.json();
            
            if (data.success && data.suggestion) {
                setSuggestion(data.suggestion);
            } else {
                setError(data.message || "Failed to generate suggestion.");
            }
        } catch (err) {
            setError("An error occurred while connecting to the AI service.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 mt-2 mb-4 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> AI Assist: {fieldLabel}
                </h4>
                <button onClick={onClose} className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100 p-1 rounded transition-colors" title="Close AI Assistant">
                    <X className="w-4 h-4" />
                </button>
            </div>
            
            {!suggestion && (
                <div className="space-y-3">
                    <p className="text-[12px] text-emerald-700 font-medium">
                        {getHelperText(fieldId)}
                    </p>
                    <textarea 
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Built a caching layer, reduced load times..."
                        rows={2}
                        className="w-full p-2 border border-emerald-200 rounded-md text-[13px] focus:ring-2 focus:ring-emerald-500 bg-white placeholder-emerald-300"
                    />
                    {error && (
                        <div className="flex items-center gap-1.5 text-red-600 text-[12px] font-medium bg-red-50 p-2 rounded border border-red-100">
                            <AlertCircle className="w-3.5 h-3.5" /> {error}
                        </div>
                    )}
                    <div className="flex justify-end">
                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading || !notes.trim()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-[12px] font-bold flex items-center gap-1.5 disabled:opacity-50 transition-colors"
                        >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                            Generate Suggestion
                        </button>
                    </div>
                </div>
            )}

            {suggestion && (
                <div className="space-y-3">
                    <p className="text-[12px] text-emerald-700 font-medium">
                        Review and edit the suggestion before applying to your draft:
                    </p>
                    <textarea 
                        value={suggestion}
                        onChange={(e) => setSuggestion(e.target.value)}
                        rows={6}
                        className="w-full p-2 border border-emerald-300 rounded-md text-[13px] focus:ring-2 focus:ring-emerald-500 bg-white"
                    />
                    <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => { setSuggestion(''); setError(null); }}
                            className="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-1.5 rounded-md text-[12px] font-bold transition-colors"
                        >
                            Discard
                        </button>
                        <button 
                            onClick={() => onApply(suggestion)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-[12px] font-bold flex items-center gap-1.5 transition-colors"
                        >
                            <Check className="w-3.5 h-3.5" />
                            Apply to Draft
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
