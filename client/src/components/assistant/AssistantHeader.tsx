import { Menu, Maximize2, Minimize2, Sparkles, X } from 'lucide-react';
import type { AssistantContextData } from './types';

interface AssistantHeaderProps {
  currentSessionTitle?: string;
  contextData?: AssistantContextData;
  isHistoryVisible: boolean;
  toggleHistory: () => void;
  isFocusMode: boolean;
  toggleFocusMode: () => void;
}

export default function AssistantHeader({
  currentSessionTitle,
  contextData,
  isHistoryVisible,
  toggleHistory,
  isFocusMode,
  toggleFocusMode
}: AssistantHeaderProps) {
  
  const getContextLabel = () => {
    if (!contextData) return "General conversation";
    switch (contextData.type) {
      case "roadmap":
        return `Career track: ${contextData.topicName || 'Software Engineer'}`;
      case "project":
        return `Project: ${contextData.projectTitle || 'Personal Project'}`;
      case "lesson":
        return `Lesson: ${contextData.topicName}`;
      default:
        return "General conversation";
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-slate-200">
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          onClick={toggleHistory}
          className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors md:hidden focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label={isHistoryVisible ? "Hide conversation history" : "Show conversation history"}
          title="Conversation history"
        >
          {isHistoryVisible ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-2 rounded-lg shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-slate-900 truncate">AI Learning Assistant</h1>
            {currentSessionTitle && (
              <>
                <span className="text-slate-300 hidden sm:inline">•</span>
                <span className="text-sm text-slate-600 truncate hidden sm:inline" title={currentSessionTitle}>
                  {currentSessionTitle}
                </span>
              </>
            )}
          </div>
          <p className="text-xs font-medium text-slate-500 truncate">
            {getContextLabel()}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-4">
        <button
          onClick={toggleHistory}
          className="hidden md:flex p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label={isHistoryVisible ? "Hide conversation history" : "Show conversation history"}
          title="Toggle history panel"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          onClick={toggleFocusMode}
          className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          aria-label={isFocusMode ? "Exit focus mode" : "Enter focus mode"}
          title={isFocusMode ? "Exit focus mode" : "Enter focus mode"}
        >
          {isFocusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
