import { apiFetch } from '../utils/apiFetch';
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Lightbulb, Terminal, PanelRightClose, PanelRightOpen, CheckCircle, Circle, ChevronLeft, ChevronRight, Copy, Check, RefreshCw, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import AIChatAssistant from './roadmap/AIChatAssistant';

// --- UI Utilities ---
const Button = ({ children, className = '', variant = 'default', ...props }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:opacity-50 disabled:cursor-not-allowed h-10 px-4 py-2 cursor-pointer";
  const variants = {
    default: "bg-emerald-600 text-white hover:bg-emerald-700",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-700"
  };
  return <button className={`${baseStyle} ${variants[variant as keyof typeof variants] || variants.default} ${className}`} {...props}>{children}</button>;
};

const CodeBlock = ({ inline, className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    const [copied, setCopied] = useState(false);
    
    if (inline) {
        return <code className="bg-slate-100 text-emerald-800 border border-slate-200 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>{children}</code>;
    }

    const copyCode = () => {
        navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="my-6 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm relative group">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200">
                <div className="flex items-center gap-2 text-slate-500">
                    <Terminal className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">{match?.[1] || 'Code Example'}</span>
                </div>
                <button onClick={copyCode} className="text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-xs font-semibold focus:outline-none">
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy'}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-slate-800 font-mono leading-relaxed" {...props}>
                <code className={className}>{children}</code>
            </pre>
        </div>
    );
};

export default function RoadmapGuideView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { role, topicName: initialTopicName, topicId: initialTopicId, subtopics: initialSubtopics, roadmap, parentTopicName: initialParentTopicName } = location.state || { 
      role: "Software Engineer", 
      topicName: "Unknown Topic",
      topicId: "unknown-id",
      subtopics: [],
      roadmap: [],
      parentTopicName: undefined
  };

  const [currentTopic, setCurrentTopic] = useState({
      name: initialTopicName,
      id: initialTopicId,
      subtopics: initialSubtopics,
      parentName: initialParentTopicName,
      isSubtopic: !!initialParentTopicName
  });

  const [isLoading, setIsLoading] = useState(true);
  const [guideContent, setGuideContent] = useState("");
  const [error, setError] = useState(false);
  const [aiLayout, setAiLayout] = useState<'hidden'|'normal'|'maximized'>('hidden'); // AI panel hidden by default to maximize reading width
  
  // Progress State
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'|'failed'>('idle');

  // Preview State
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewContent, setPreviewContent] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Flatten roadmap for sequential navigation
  const flattenedTopics: any[] = [];
  if (roadmap && roadmap.length > 0) {
      roadmap.forEach((phase: any) => {
          (phase.topics || phase.skills || []).forEach((skillObj: any) => {
              const name = typeof skillObj === 'string' ? skillObj : skillObj.name;
              const id = typeof skillObj === 'string' ? undefined : skillObj.id;
              const subtopics = typeof skillObj === 'string' ? null : skillObj.subtopics;
              
              flattenedTopics.push({ id, name, subtopics, phaseName: phase.title || phase.phase, isSubtopic: false, parentName: null });
              
              if (subtopics && subtopics.length > 0) {
                  subtopics.forEach((sub: any) => {
                      const subName = typeof sub === 'string' ? sub : sub.name;
                      flattenedTopics.push({ id, name: subName, parentName: name, phaseName: phase.title || phase.phase, isSubtopic: true });
                  });
              }
          });
      });
  }

  const currentIndex = flattenedTopics.findIndex(t => 
      ((t.id && t.id === currentTopic.id) || t.name === currentTopic.name) && 
      (t.isSubtopic === currentTopic.isSubtopic)
  );
  
  const previousTopic = currentIndex > 0 ? flattenedTopics[currentIndex - 1] : null;
  const nextTopic = currentIndex < flattenedTopics.length - 1 ? flattenedTopics[currentIndex + 1] : null;
  const currentPhaseName = currentIndex >= 0 ? flattenedTopics[currentIndex].phaseName : "Learning Path";
  
  // Subtopics inherit completion status from their parent topic.
  const completionCheckName = currentTopic.isSubtopic ? currentTopic.parentName : currentTopic.name;
  const isCurrentTopicComplete = (currentTopic.id && completedTopics.has(currentTopic.id)) || completedTopics.has(completionCheckName);

  // Auto-scroll to top when topic changes
  useEffect(() => {
     const scrollContainer = document.getElementById('guide-scroll-container');
     if (scrollContainer) scrollContainer.scrollTo(0, 0);
  }, [currentTopic.id]);

  // Load user progress
  useEffect(() => {
      const loadProgress = async () => {
          try {
              const userStr = sessionStorage.getItem('user');
              if (userStr) {
                  const user = JSON.parse(userStr);
                  const res = await apiFetch(`/api/role/progress?role=${encodeURIComponent(role)}&userId=${user.id}`);
                  const data = await res.json();
                  if (data.success && Array.isArray(data.completedTopics)) {
                      setCompletedTopics(new Set(data.completedTopics));
                  }
              }
          } catch (e) { console.error("Failed to load progress", e); }
      };
      loadProgress();
  }, [role]);

  // Fetch or Preview Guide
  const fetchGuide = async (preview = false, saveRegeneratedContent?: string) => {
      if (preview) setIsRegenerating(true);
      else {
          setIsLoading(true);
          setError(false);
      }

      try {
        const payload: any = {
            role: role,
            topicName: currentTopic.name,
            topicId: currentTopic.id,
            subtopics: currentTopic.subtopics,
            parentTopicName: currentTopic.parentName
        };

        if (preview) payload.previewRegenerate = true;
        if (saveRegeneratedContent) {
            payload.saveRegenerated = true;
            payload.guideContent = saveRegeneratedContent;
        }

        const res = await apiFetch("/api/role/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to fetch guide");

        const data = await res.json();
        
        if (preview) {
            setPreviewContent(data.guideContent);
            setIsPreviewing(true);
        } else {
            setGuideContent(data.guideContent || "No lesson content generated.");
            setIsPreviewing(false);
            setPreviewContent("");
        }
      } catch (err) {
        console.error(err);
        if (!preview && !saveRegeneratedContent) setError(true);
        else alert("Failed to regenerate guide. Please try again.");
      } finally {
        setIsLoading(false);
        setIsRegenerating(false);
      }
  };

  useEffect(() => {
    fetchGuide();
    // Reset statuses when changing topics
    setSaveStatus('idle');
  }, [currentTopic.name, currentTopic.id, role]);

  const handleTopicNav = (topic: any) => {
      if (topic) {
          setCurrentTopic({ 
              name: topic.name, 
              id: topic.id, 
              subtopics: topic.subtopics || [],
              parentName: topic.parentName,
              isSubtopic: topic.isSubtopic
          });
      }
  };

  const markCompleteAndContinue = async () => {
      if (isSaving) return;
      if (isCurrentTopicComplete || currentTopic.isSubtopic) {
          // Already complete OR it's a subtopic (subtopics don't have their own completion checkbox), just navigate next
          if (nextTopic) handleTopicNav(nextTopic);
          else navigate('/roadmap', { state: { role, roadmap } });
          return;
      }

      setIsSaving(true);
      setSaveStatus('saving');
      
      try {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
              const user = JSON.parse(userStr);
              const response = await apiFetch('/api/role/progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id, role, topicName: currentTopic.name, topicId: currentTopic.id, isCompleted: true })
              });
              
              if (!response.ok) throw new Error("Failed to save progress");
              
              setCompletedTopics(prev => {
                  const newSet = new Set(prev);
                  if (currentTopic.id) newSet.add(currentTopic.id);
                  newSet.add(currentTopic.name);
                  return newSet;
              });
              setSaveStatus('saved');
              
              // Proceed
              setTimeout(() => {
                  if (nextTopic) handleTopicNav(nextTopic);
                  else navigate('/roadmap', { state: { role, roadmap } });
              }, 600);
          }
      } catch (error) {
          console.error("Save failed", error);
          setSaveStatus('failed');
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="h-[100dvh] bg-slate-50 flex flex-col font-sans overflow-hidden text-slate-900">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 flex-shrink-0 z-30 shadow-sm relative">
        <div className="px-4 md:px-6 py-3 flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <button 
                onClick={() => navigate('/roadmap', { state: { role, roadmap } })} 
                className="flex items-center gap-2 p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors font-medium whitespace-nowrap"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">My Learning</span>
            </button>
            <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>
            <div className="hidden sm:flex flex-col min-w-0">
               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider truncate">{currentPhaseName}</span>
               <span className="text-sm font-bold text-slate-900 truncate">{currentTopic.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
             <div className="hidden sm:flex items-center gap-2 text-sm font-semibold">
                 {isCurrentTopicComplete ? (
                     <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle className="w-4 h-4" /> Completed</span>
                 ) : (
                     <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded-md"><Circle className="w-4 h-4" /> Not started</span>
                 )}
             </div>
             <button 
                onClick={() => navigate('/resources', { state: { role, topicContext: { topicName: currentTopic.isSubtopic ? currentTopic.parentName : currentTopic.name, subtopicName: currentTopic.isSubtopic ? currentTopic.name : null, returnTo: '/roadmap-guide' }, roadmap, ...location.state } })}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors border bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
             >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Resources</span>
             </button>
             <button 
                onClick={() => setAiLayout(aiLayout !== 'hidden' ? 'hidden' : 'normal')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors border ${aiLayout !== 'hidden' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
             >
                {aiLayout !== 'hidden' ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                <span className="hidden sm:inline">AI Tutor</span>
             </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
          
          {/* Main Reading Area */}
          <div id="guide-scroll-container" className="flex-1 overflow-y-auto bg-slate-50 scroll-smooth relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
                
                {/* Mobile Topic Title */}
                <div className="sm:hidden mb-6">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{currentPhaseName}</span>
                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">{currentTopic.name}</h2>
                    <div className="mt-3 flex items-center gap-2 text-sm font-semibold">
                        {isCurrentTopicComplete ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md"><CheckCircle className="w-4 h-4" /> Completed</span>
                        ) : (
                            <span className="flex items-center gap-1.5 text-slate-500 bg-slate-100 px-2 py-1 rounded-md"><Circle className="w-4 h-4" /> Not started</span>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10 mb-6 relative">
                    
                    {/* Header Badges */}
                    <div className="absolute top-6 right-6 flex items-center gap-2">
                        <button 
                            onClick={() => fetchGuide(true)}
                            disabled={isRegenerating || isLoading}
                            title="Regenerate lesson"
                            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin text-emerald-600' : ''}`} />
                        </button>
                    </div>

                    <div className="mb-8 pb-6 border-b border-slate-100 hidden sm:block pr-12">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{currentTopic.name}</h2>
                        <p className="text-slate-500 text-sm flex items-center gap-1.5">
                           <Lightbulb className="w-4 h-4 text-emerald-500" /> Tailored for the {role} path
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
                            <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mx-auto mb-2" />
                            <h3 className="text-lg font-bold text-slate-900">Loading lesson content</h3>
                            <p className="text-slate-500">Retrieving the guide for this topic...</p>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center max-w-md mx-auto">
                            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                                <span className="font-bold text-2xl">!</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Lesson Unavailable</h3>
                            <p className="text-slate-600 mb-6">We encountered an issue loading or generating the content for this topic. Your progress is safe.</p>
                            <Button onClick={() => fetchGuide()} className="w-full">
                                Retry Loading
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 text-slate-600 leading-relaxed text-[15px] sm:text-base">
                          <ReactMarkdown 
                            components={{
                              h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold text-slate-900 mt-8 mb-4 hidden" {...props} />, // H1 hidden as we show title in header
                              h2: ({node, ...props}) => {
                                  // Parse section letters to add accents
                                  const text = String(props.children);
                                  const isA = text.includes('A.');
                                  const isB = text.includes('B.');
                                  const isC = text.includes('C.');
                                  const isD = text.includes('D.');
                                  const isE = text.includes('E.');
                                  return (
                                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-12 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2" {...props}>
                                         {isA && <Sparkles className="w-5 h-5 text-emerald-500" />}
                                         {isB && <BookOpen className="w-5 h-5 text-blue-500" />}
                                         {isC && <Terminal className="w-5 h-5 text-indigo-500" />}
                                         {isD && <Terminal className="w-5 h-5 text-orange-500" />}
                                         {isE && <CheckCircle className="w-5 h-5 text-teal-500" />}
                                         {props.children}
                                      </h2>
                                  );
                              },
                              h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-8 mb-3" {...props} />,
                              p: ({node, ...props}) => <p className="mb-5 last:mb-0 leading-loose" {...props} />,
                              ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 space-y-2 marker:text-emerald-500" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal pl-6 mb-6 space-y-2 marker:text-emerald-500 marker:font-bold" {...props} />,
                              li: ({node, ...props}) => <li className="pl-1" {...props} />,
                              a: ({node, ...props}) => <a className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-emerald-400 bg-emerald-50/50 p-5 rounded-r-xl my-6 text-slate-800 text-sm font-medium" {...props} />,
                              code: CodeBlock
                            }}
                          >
                            {isPreviewing ? previewContent : guideContent}
                          </ReactMarkdown>
                        </div>
                    )}

                    {isPreviewing && (
                        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-10 shadow-lg">
                            <div>
                                <p className="font-bold text-amber-900 text-sm">Previewing Regenerated Lesson</p>
                                <p className="text-xs text-amber-700 mt-0.5">This content is not saved yet.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => { setIsPreviewing(false); setPreviewContent(''); }} className="bg-white">Discard</Button>
                                <Button onClick={() => fetchGuide(false, previewContent)} className="bg-amber-600 hover:bg-amber-700 text-white">Apply & Save</Button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Completion Controls */}
                {!isLoading && !error && !isPreviewing && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                        <Button 
                            variant="outline" 
                            onClick={() => handleTopicNav(previousTopic)}
                            disabled={!previousTopic}
                            className="w-full sm:w-auto shadow-sm gap-2"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous Topic
                        </Button>
                        
                        <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
                            {saveStatus === 'failed' && <span className="text-sm font-semibold text-red-600">Save failed. Try again.</span>}
                            <Button 
                                onClick={markCompleteAndContinue} 
                                disabled={isSaving || saveStatus === 'saved'}
                                className={`w-full sm:w-auto shadow-md gap-2 ${(isCurrentTopicComplete || currentTopic.isSubtopic) ? 'bg-slate-900 hover:bg-slate-800' : ''}`}
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                                ) : saveStatus === 'saved' ? (
                                    <><Check className="w-4 h-4" /> Saved!</>
                                ) : (isCurrentTopicComplete || currentTopic.isSubtopic) ? (
                                    <>Continue to Next <ChevronRight className="w-4 h-4" /></>
                                ) : (
                                    <><CheckCircle className="w-4 h-4" /> Mark Complete & Continue</>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
          </div>

          {/* Right Sidebar (AI Tutor) */}
          <div className={`
              absolute lg:static inset-y-0 right-0 z-20 bg-white transform transition-all duration-300 ease-in-out flex flex-col border-l border-slate-200 shadow-2xl lg:shadow-none overflow-hidden
              ${aiLayout === 'maximized' ? 'w-full translate-x-0' : aiLayout === 'normal' ? 'w-full sm:w-[400px] xl:w-[450px] translate-x-0' : 'w-full sm:w-[400px] xl:w-[450px] translate-x-full lg:hidden hidden'}
          `}>
              <AIChatAssistant 
                 isOpen={aiLayout !== 'hidden'} 
                 onClose={() => setAiLayout('hidden')}
                 aiLayout={aiLayout}
                 setAiLayout={setAiLayout} 
                 context={{ 
                     type: 'roadmap',
                     topicName: currentTopic.name,
                     topicId: currentTopic.id,
                     subtopicName: currentTopic.isSubtopic ? currentTopic.name : undefined,
                     guideContent: guideContent,
                     currentTask: `The user is studying: ${currentTopic.name}. You are their AI tutor for this specific topic. Use the lesson guide as your context.` 
                 }}  
                 role={role} 
              />
          </div>

      </div>
    </div>
  );
}
