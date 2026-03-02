import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Sparkles, Lightbulb, CheckCircle2 } from "lucide-react";

export default function RoadmapGuideView() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { role, topicName, subtopics } = location.state || { 
      role: "Software Engineer", 
      topicName: "Unknown Topic",
      subtopics: []
  };

  const [isLoading, setIsLoading] = useState(true);
  const [guideContent, setGuideContent] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchGuide = async () => {
      setIsLoading(true);
      setError(false);
      try {
        let promptText = `Assume the role of an expert friendly tutor. Create a comprehensive, easy-to-understand complete study guide for the topic: "${topicName}". `;
        if (subtopics && subtopics.length > 0) {
            promptText += `Make sure to explicitly cover these subtopics: ${subtopics.join(", ")}. `;
        }
        promptText += `Explain the fundamental concepts clearly, provide real-world examples, and list the best practices. Keep it highly readable, structured, and engaging. Use emojis appropriately to make it visually appealing.`;

        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: promptText,
            context: "Generate a complete viewing guide page tailored for the user's roadmap.",
            role: role,
          }),
        });

        if (!res.ok) throw new Error("Failed to generate guide");

        const data = await res.json();
        setGuideContent(data.reply || "No guide content generated.");
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuide();
  }, [topicName, role, subtopics]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
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
              <h1 className="font-bold text-slate-900 leading-tight">Interactive Guide</h1>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white text-[10px] sm:text-xs font-semibold shadow-sm overflow-hidden shrink-0">
             <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" /> <span className="hidden sm:inline">AI Generated</span><span className="sm:hidden">AI</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto mb-10">
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-10">
                <div className="mb-6 md:mb-8 border-b border-slate-100 pb-5 md:pb-6">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 leading-tight">Comprehension Guide: {topicName}</h2>
                    <p className="text-slate-500 text-xs sm:text-sm flex items-center gap-1.5">
                       <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500" /> Tailored for the {role} path
                    </p>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
                        <p className="text-slate-500 animate-pulse font-medium">Generating your complete, easy-to-understand guide...</p>
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
                    <div className="prose prose-slate prose-emerald lg:prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight hover:prose-a:text-emerald-600 whitespace-pre-wrap leading-relaxed text-slate-700">
                        {guideContent}
                    </div>
                )}
            </div>

            {!isLoading && !error && (
                <div className="mt-6 flex flex-col sm:flex-row justify-end">
                    <button onClick={() => navigate(-1)} className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold shadow-md transition-colors">
                       <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> Mark as Understood & Return
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
