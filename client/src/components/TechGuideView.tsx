import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Sparkles, BookOpen, Terminal, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function TechGuideView() {
  const navigate = useNavigate();
  const location = useLocation();
  const { techName, role, category } = location.state || { techName: "Unknown Tech", role: "Software Engineer", category: "Tool" };

  // Guide State
  const [guideContent, setGuideContent] = useState("");
  const [isGuideLoading, setIsGuideLoading] = useState(true);

  // Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user'|'ai', content: string}[]>([
      { role: 'ai', content: `Hi! I'm your professional AI mentor for ${techName}. I'm here to help you understand how to install, configure, and use it perfectly for your role as a ${role}. What do you need help with?` }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Step-by-Step Guide
  useEffect(() => {
    const fetchGuide = async () => {
      setIsGuideLoading(true);
      try {
        const promptText = `Assume the role of an expert Senior ${role}. Create a complete, step-by-step professional learning guide for "${techName}" (${category}). 
        Include:
        1. **Overview & Professional Use Case**: Why is this used in the industry?
        2. **Installation / Setup Guide**: Step-by-step instructions.
        3. **Core Concepts**: The 3 most important things to master.
        4. **Real-world Example/Scenario**: Provide a quick code/cli snippet or concrete example of how it's used daily.
        Use markdown, keep it highly readable, and format it beautifully.`;

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: promptText,
            context: `Generate a professional step-by-step installation and learning guide for ${techName}.`,
            role: role,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setGuideContent(data.reply || "No guide content generated.");
        }
      } catch (err) {
        setGuideContent("Failed to load the guide. Please try again.");
      } finally {
        setIsGuideLoading(false);
      }
    };
    fetchGuide();
  }, [techName, role, category]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = chatInput;
    setChatInput("");
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsChatLoading(true);

    try {
      const promptContext = `You are an expert AI mentor specializing in ${techName}. The user is learning this via your step by step guide. Answer their specific questions professionally and concisely.`;
      
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: promptContext,
          role: role,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setChatMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'ai', content: "Sorry, I ran into an error processing that." }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'ai', content: "Network error. Please try again." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans h-screen overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
                onClick={() => navigate(-1)} 
                className="p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors border border-transparent hover:border-slate-200"
                title="Go Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                 <h1 className="font-extrabold text-slate-900 leading-tight text-lg">Mastering {techName}</h1>
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{category}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-xs font-bold shadow-inner">
             <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Professional AI Guide Active
          </div>
        </div>
      </div>

      {/* Main Content Split View */}
      <div className="flex-1 overflow-hidden flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        
        {/* Left Panel: Step-by-Step Guide */}
        <div className="w-full md:w-3/5 h-full overflow-y-auto p-4 md:p-6 bg-[#F8FAFC]">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 min-h-full relative">
                
                <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                    <Terminal className="w-6 h-6 text-indigo-500" />
                    Complete Installation & Usage Guide
                </h2>

                {isGuideLoading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                         <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                         <p className="text-slate-500 font-medium">AI is writing your professional custom guide...</p>
                    </div>
                ) : (
                    <div className="prose prose-slate prose-indigo max-w-none text-[15px] leading-relaxed">
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-extrabold text-slate-900 mt-8 mb-4 border-b pb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold text-slate-800 mt-6 mb-3 flex items-center gap-2" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold text-slate-800 mt-5 mb-2" {...props} />,
                                p: ({node, ...props}) => <p className="mb-4 text-slate-700" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-4 space-y-1.5 text-slate-700 marker:text-indigo-500" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-4 space-y-1.5 text-slate-700 marker:font-bold marker:text-indigo-600" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                code({node, inline, className, children, ...props}: any) {
                                  const match = /language-(\w+)/.exec(className || '')
                                  return !inline ? (
                                    <div className="my-5 rounded-xl overflow-hidden shadow-lg border border-slate-800 bg-slate-900">
                                      <div className="flex items-center px-4 py-1.5 bg-slate-950 border-b border-slate-800">
                                        <span className="text-[11px] font-mono text-slate-400 font-bold uppercase">{match?.[1] || 'sh'}</span>
                                      </div>
                                      <pre className="p-4 overflow-x-auto text-[13px] text-emerald-400 font-mono leading-relaxed" {...props}>
                                        <code className={className}>{children}</code>
                                      </pre>
                                    </div>
                                  ) : (
                                    <code className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.5 rounded text-[13px] font-mono font-bold" {...props}>
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
        </div>

        {/* Right Panel: Interactive AI Chat */}
        <div className="w-full md:w-2/5 h-full border-l border-slate-200 bg-white flex flex-col shadow-[-5px_0_15px_-5px_rgba(0,0,0,0.05)] z-10 m-0">
            {/* Chat Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center shadow-md">
                    <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-slate-900 leading-tight">AI Mentor: {techName}</h3>
                    <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                    </p>
                </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-[14px] leading-relaxed ${
                            msg.role === 'user' 
                                ? 'bg-indigo-600 text-white rounded-br-sm shadow-md' 
                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm'
                        }`}>
                            <ReactMarkdown
                              components={{
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                code: ({node, inline, className, children, ...props}: any) => (
                                    <code className={`${msg.role === 'user' ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-100 text-indigo-600'} px-1 py-0.5 rounded text-[12px] font-mono`} {...props}>
                                        {children}
                                    </code>
                                )
                              }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center">
                             <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                             <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 bg-white border-t border-slate-200">
                <div className="relative flex items-center">
                    <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage() }}
                        placeholder="Ask how to solve issues, command lines..."
                        className="w-full bg-slate-100 border-none rounded-xl py-3 pl-4 pr-12 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all font-medium"
                    />
                    <button 
                        onClick={handleSendMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        className="absolute right-2 p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:bg-slate-400"
                    >
                        <Send className="w-4 h-4 -mr-[1px] mt-[1px]" />
                    </button>
                </div>
                <p className="text-center mt-2 text-[10px] text-slate-400">Press ENTER to send your message.</p>
            </div>
        </div>

      </div>
    </div>
  );
}
