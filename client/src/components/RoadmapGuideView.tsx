import { apiFetch } from '../utils/apiFetch';
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Lightbulb, MessageSquare, Terminal, ChevronRight, Menu, PanelRightClose, PanelRightOpen, CheckCircle } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import AIChatAssistant from './roadmap/AIChatAssistant';

export default function RoadmapGuideView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { role, topicName: initialTopicName, topicId: initialTopicId, subtopics: initialSubtopics, roadmap } = location.state || { 
      role: "Software Engineer", 
      topicName: "Unknown Topic",
      topicId: "unknown-id",
      subtopics: [],
      roadmap: []
  };

  const [currentTopic, setCurrentTopic] = useState({
      name: initialTopicName,
      id: initialTopicId,
      subtopics: initialSubtopics
  });

  const [isLoading, setIsLoading] = useState(true);
  const [guideContent, setGuideContent] = useState("");
  const [error, setError] = useState(false);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar
  const [isAiOpen, setIsAiOpen] = useState(true); // Desktop AI panel

  // Auto-scroll to top when topic changes
  useEffect(() => {
     const scrollContainer = document.getElementById('guide-scroll-container');
     if (scrollContainer) scrollContainer.scrollTo(0, 0);
  }, [currentTopic.id]);

  useEffect(() => {
    const fetchGuide = async () => {
      setIsLoading(true);
      setError(false);
      try {
        const res = await apiFetch("/api/role/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            role: role,
            topicName: currentTopic.name,
            topicId: currentTopic.id,
            subtopics: currentTopic.subtopics
          }),
        });

        if (!res.ok) throw new Error("Failed to fetch guide");

        const data = await res.json();
        setGuideContent(data.guideContent || "No guide content generated.");
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuide();
  }, [currentTopic.name, currentTopic.id, role, currentTopic.subtopics]);

  const handleTopicClick = (name: string, id: string, subtopics: string[] | null) => {
      setCurrentTopic({ name, id, subtopics: subtopics || [] });
      setIsSidebarOpen(false); // close mobile sidebar on click
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0 z-30 shadow-sm">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <h1 className="font-bold text-slate-900 leading-tight hidden sm:block">Interactive Workspace</h1>
              <h1 className="font-bold text-slate-900 leading-tight sm:hidden">Workspace</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
             >
                <Menu className="w-5 h-5" />
             </button>
             <button 
                onClick={() => setIsAiOpen(!isAiOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 font-medium text-sm transition-colors"
             >
                {isAiOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                <span>AI Tutor</span>
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left Sidebar (Roadmap Outline) */}
          <div className={`
              absolute lg:static inset-y-0 left-0 z-20 w-64 bg-white border-r border-slate-200 overflow-y-auto transform transition-transform duration-300 ease-in-out
              ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
              <div className="p-4">
                  <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Roadmap Outline</h3>
                  {roadmap && roadmap.length > 0 ? (
                      <div className="space-y-6">
                          {roadmap.map((phase: any, phaseIdx: number) => (
                              <div key={phaseIdx}>
                                  <h4 className="font-bold text-slate-900 text-sm mb-2">{phase.title || phase.phase}</h4>
                                  <div className="space-y-1 border-l-2 border-slate-100 ml-2 pl-2">
                                      {(phase.topics || phase.skills || []).map((skillObj: any, topicIdx: number) => {
                                          const name = typeof skillObj === 'string' ? skillObj : skillObj.name;
                                          const id = typeof skillObj === 'string' ? undefined : skillObj.id;
                                          const subtopics = typeof skillObj === 'string' ? null : skillObj.subtopics;
                                          const isCurrent = currentTopic.name === name;

                                          return (
                                              <button
                                                  key={topicIdx}
                                                  onClick={() => handleTopicClick(name, id, subtopics)}
                                                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                                                      isCurrent 
                                                      ? 'bg-emerald-50 text-emerald-700 font-bold' 
                                                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                                                  }`}
                                              >
                                                  <span className="truncate">{name}</span>
                                                  {isCurrent && <ChevronRight className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <p className="text-sm text-slate-500 italic">No outline available.</p>
                  )}
              </div>
          </div>

          {/* Mobile Overlay */}
          {isSidebarOpen && (
              <div 
                className="absolute inset-0 bg-slate-900/20 z-10 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
          )}

          {/* Center Content (Lesson Guide) */}
          <div id="guide-scroll-container" className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth">
            <div className="max-w-4xl mx-auto px-4 py-8 pb-12 sm:pb-8">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
                    <div className="mb-6 md:mb-8 border-b border-slate-100 pb-5 md:pb-6">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase tracking-widest border border-indigo-100">AI Lesson</span>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-[10px] font-semibold shadow-sm overflow-hidden shrink-0">
                               <Sparkles className="w-3 h-3 flex-shrink-0" /> <span>AI Generated</span>
                            </div>
                        </div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{currentTopic.name}</h2>
                        <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5">
                           <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Tailored for the {role} path
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                            <p className="text-slate-500 animate-pulse font-medium">Generating your structured lesson...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                <span className="font-bold text-xl">!</span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">Guide Generation Failed</h3>
                            <p className="text-slate-500 mb-4">We encountered an issue creating your guide. Please try again later.</p>
                            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
                                Try Again
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 text-slate-700 leading-relaxed text-[15px] sm:text-base">
                          <ReactMarkdown 
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-3xl font-extrabold text-slate-900 mt-10 mb-6 pb-2 border-b border-slate-200" {...props} />,
                              h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4 flex items-center gap-2 text-indigo-900" {...props} />,
                              h3: ({node, ...props}) => <h3 className="text-xl font-bold text-slate-900 mt-8 mb-3" {...props} />,
                              p: ({node, ...props}) => <p className="mb-5 last:mb-0 leading-loose" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-emerald-500" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-emerald-500 marker:font-bold" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              a: ({node, ...props}) => <a className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-400 bg-emerald-50/50 p-4 rounded-r-xl my-6 italic text-slate-800" {...props} />,
                              code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                return !inline ? (
                                  <div className="my-6 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
                                    <div className="flex items-center px-4 py-2 bg-slate-950 border-b border-slate-800">
                                      <Terminal className="w-4 h-4 text-slate-400 mr-2" />
                                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{match?.[1] || 'code'}</span>
                                    </div>
                                    <pre className="p-4 overflow-x-auto text-sm text-emerald-400 font-mono leading-relaxed" {...props}>
                                      <code className={className}>
                                        {children}
                                      </code>
                                    </pre>
                                  </div>
                                ) : (
                                  <code className="bg-slate-100 text-pink-600 border border-slate-200 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {guideContent}
                          </ReactMarkdown>
                        </div>
                    )}
                </div>

                {!isLoading && !error && (
                    <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                        <button 
                           onClick={() => {
                               // Toggle AI Tutor or send it a message
                               setIsAiOpen(true);
                           }} 
                           className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-white border-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 rounded-xl font-semibold shadow-sm transition-all lg:hidden"
                        >
                           <MessageSquare className="w-5 h-5 flex-shrink-0" /> Ask AI Tutor
                        </button>
                        <button onClick={() => navigate(-1)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition-colors">
                           <CheckCircle className="w-5 h-5 flex-shrink-0" /> Mark as Understood & Return
                        </button>
                    </div>
                )}
            </div>
          </div>

          {/* Right Sidebar (AI Tutor) */}
          <div className={`
              absolute lg:static inset-y-0 right-0 z-20 w-80 bg-slate-900 transform transition-transform duration-300 ease-in-out flex flex-col
              ${isAiOpen ? 'translate-x-0' : 'translate-x-full lg:hidden hidden'}
          `}>
              {/* Important: we add a key to AIChatAssistant based on currentTopic.id so it completely resets history/context when changing topics */}
              <AIChatAssistant 
                 key={currentTopic.id || currentTopic.name}
                 isOpen={true} 
                 onClose={() => setIsAiOpen(false)} 
                 context={{ 
                     type: 'roadmap',
                     topicName: currentTopic.name,
                     guideContent: guideContent,
                     currentTask: `The user is studying: ${currentTopic.name}. You are their AI tutor for this specific topic. Use the lesson guide as your context.` 
                 }}  
                 role={role} 
                 isEmbedded={true}
                 initialQuery={""}
              />
          </div>

      </div>
    </div>
  );
}
