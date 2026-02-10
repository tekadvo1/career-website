import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Send,
  Sparkles,
  User,
  Bot,
  Lightbulb,
  BookOpen,
  Code,
  ArrowLeft,
  Zap,
  Info,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Mock AI responses based on common questions
const generateAIResponse = (userMessage: string, eli5Mode: boolean, role: string): string => {
  const message = userMessage.toLowerCase();

  // ELI5 Mode responses
  if (eli5Mode) {
    if (message.includes("react") || message.includes("component")) {
      return "Think of React like building with LEGO blocks! 🧱\n\nEach LEGO block is a 'component' - like a button, a picture, or a text box. You can put these blocks together to build a whole website, just like you put LEGO blocks together to build a house!\n\nThe cool thing? You can use the same LEGO block (component) over and over again. If you make one red button, you can use it 10 times without building it again!";
    }
    if (message.includes("api") || message.includes("rest")) {
      return "Imagine you're at a restaurant! 🍔\n\nYou (the website) look at the menu and order food. The waiter takes your order to the kitchen. The kitchen makes your food and the waiter brings it back to you.\n\nAn API is like that waiter! It takes requests from your website, gets information from a server (the kitchen), and brings it back. That's how websites get information like weather, news, or user profiles!";
    }
    if (message.includes("variable") || message.includes("variables")) {
      return "A variable is like a toy box! 🎁\n\nImagine you have a box labeled 'My Favorite Toy'. Today, you put a teddy bear in it. Tomorrow, you might put a car in it instead.\n\nIn programming, a variable is a box that holds information. The box has a name (like 'score' or 'userName'), and you can put different things in it - numbers, words, or lists!";
    }
    if (message.includes("loop") || message.includes("for loop")) {
      return "A loop is like doing the same thing over and over! 🔄\n\nImagine your mom asks you to clean up 10 toys. Instead of saying 'pick up toy 1, pick up toy 2, pick up toy 3...' 10 times, you just say 'keep picking up toys until all 10 are done!'\n\nThat's what a loop does - it repeats an action multiple times automatically, so you don't have to write the same code again and again!";
    }
    if (message.includes("function")) {
      return "A function is like a recipe! 👨‍🍳\n\nWhen you want to make cookies, you follow a recipe: mix ingredients, bake, and get cookies! You don't have to remember all the steps every time - you just follow the recipe.\n\nIn programming, a function is a recipe for your code. You give it a name (like 'makeCookies'), and whenever you need to do those steps, you just use that name instead of writing everything again!";
    }
  }

  // Regular mode responses
  if (message.includes("start") || message.includes("begin")) {
    return `Great question! To start learning ${role}, I recommend:\n\n1. **Foundation First**: Begin with the fundamentals in Phase 1 of your roadmap. Master the basics before moving to advanced topics.\n\n2. **Hands-On Practice**: Build small projects immediately. Don't just watch tutorials - code along and experiment!\n\n3. **Daily Consistency**: Dedicate 1-2 hours daily rather than cramming on weekends. Consistency beats intensity.\n\n4. **Use Multiple Resources**: Combine video tutorials, documentation, and interactive coding platforms.\n\nWould you like specific recommendations for any particular skill?`;
  }

  if (message.includes("react")) {
    return `React is a JavaScript library for building user interfaces. Here's what you need to know:\n\n**Core Concepts:**\n• **Components**: Reusable UI building blocks\n• **Props**: Data passed from parent to child components\n• **State**: Dynamic data that can change\n• **Hooks**: Functions that let you use React features (useState, useEffect)\n\n**Learning Path:**\n1. Master JavaScript first (ES6+ features)\n2. Learn JSX syntax\n3. Understand component lifecycle\n4. Practice with hooks\n5. Build real projects\n\n**Best Resources:**\n• Official React docs (react.dev)\n• FreeCodeCamp React course\n• Build a todo app, weather app, and blog\n\nNeed help with any specific React concept?`;
  }

  if (message.includes("javascript") || message.includes("js")) {
    return `JavaScript is the language that makes websites interactive. Here's your learning roadmap:\n\n**Fundamentals:**\n• Variables (let, const, var)\n• Data types (strings, numbers, booleans, objects, arrays)\n• Functions and arrow functions\n• Conditionals (if/else, switch)\n• Loops (for, while, forEach)\n\n**ES6+ Features:**\n• Destructuring\n• Spread/rest operators\n• Template literals\n• Promises and async/await\n• Modules (import/export)\n\n**Practice Resources:**\n1. JavaScript.info - comprehensive guide\n2. freeCodeCamp JavaScript course\n3. Build 30 projects in 30 days\n4. Solve coding challenges on Codewars\n\nWhat specific JS topic would you like to dive deeper into?`;
  }

  if (message.includes("algorithm") || message.includes("data structure")) {
    return `Data Structures & Algorithms are crucial for problem-solving. Here's how to master them:\n\n**Essential Data Structures:**\n1. Arrays & Strings\n2. Linked Lists\n3. Stacks & Queues\n4. Hash Tables/Maps\n5. Trees & Graphs\n6. Heaps\n\n**Important Algorithms:**\n• Searching: Binary Search\n• Sorting: Quick Sort, Merge Sort\n• Two Pointers\n• Sliding Window\n• Recursion\n• Dynamic Programming\n\n**Study Strategy:**\n1. Learn one data structure at a time\n2. Solve 10-15 easy problems for each\n3. Understand time/space complexity\n4. Practice on LeetCode/HackerRank\n5. Review and optimize solutions\n\n**Timeline:** 3-6 months with daily practice\n\nWhich data structure would you like to start with?`;
  }

  if (message.includes("portfolio") || message.includes("project")) {
    return `Building a strong portfolio is essential! Here's what makes a great portfolio:\n\n**Must-Have Projects:**\n1. **Personal Website**: Showcase your skills and about yourself\n2. **CRUD Application**: Todo app, blog, or inventory system\n3. **API Integration**: Weather app, movie database, or news aggregator\n4. **Full-Stack Project**: E-commerce, social media clone, or dashboard\n5. **Original Idea**: Something unique that solves a real problem\n\n**Portfolio Tips:**\n✅ Clean, responsive design\n✅ Live demos + GitHub links\n✅ Clear README with screenshots\n✅ Explain your tech choices\n✅ Show your problem-solving process\n✅ Include 3-5 quality projects (not 20 tutorials)\n\n**Deployment:**\n• Frontend: Vercel, Netlify, GitHub Pages\n• Backend: Render, Railway, Heroku\n\nNeed ideas for a standout project?`;
  }

  if (message.includes("interview") || message.includes("job")) {
    return `Let me help you prepare for ${role} interviews!\n\n**Technical Preparation:**\n• Solve 150-200 LeetCode problems (Easy: 60%, Medium: 35%, Hard: 5%)\n• Study system design basics\n• Practice coding without IDE\n• Review data structures & algorithms\n\n**Behavioral Prep:**\n• Prepare STAR method stories\n• Research the company\n• Have questions ready\n• Practice mock interviews\n\n**Interview Process:**\n1. Phone Screen (30 min)\n2. Technical Screen (1 hour coding)\n3. Onsite/Virtual (4-5 hours)\n   - 2-3 coding rounds\n   - 1 system design\n   - 1 behavioral\n\n**Resources:**\n• Cracking the Coding Interview book\n• Pramp/Interviewing.io for mock interviews\n• Glassdoor for company-specific questions\n\nWhat specific area would you like to focus on?`;
  }

  if (message.includes("css") || message.includes("styling")) {
    return `CSS is essential for styling web applications. Here's what to master:\n\n**Core Concepts:**\n• Selectors and specificity\n• Box model (margin, padding, border)\n• Display properties (block, inline, flex, grid)\n• Positioning (static, relative, absolute, fixed)\n• Responsive design (media queries)\n\n**Modern CSS:**\n• Flexbox - for 1D layouts\n• Grid - for 2D layouts\n• CSS Variables\n• Animations & Transitions\n• Pseudo-classes & Pseudo-elements\n\n**Frameworks to Learn:**\n1. Tailwind CSS - utility-first\n2. Bootstrap - component library\n3. Sass/SCSS - CSS preprocessor\n\n**Practice Projects:**\n• Clone popular website layouts\n• Build responsive navigation\n• Create animated landing pages\n\nNeed help with a specific CSS concept?`;
  }

  // Default response
  return `That's a great question about ${role}! I'm here to help you learn.\n\nI can assist with:\n\n📚 **Learning Resources**: Best courses, tutorials, and documentation\n💻 **Technical Concepts**: Explanations of programming concepts\n🎯 **Career Advice**: Job preparation and interview tips\n🛠️ **Tools & Technologies**: How to use specific tools\n🚀 **Project Ideas**: Suggestions for portfolio projects\n📈 **Study Plans**: How to structure your learning\n\n**Try asking:**\n• "How do I start learning React?"\n• "What projects should I build?"\n• "How do I prepare for interviews?"\n• "Explain APIs in simple terms"\n\nWhat would you like to know more about?`;
};

const suggestedQuestions = [
  "How do I start learning as a beginner?",
  "What projects should I build for my portfolio?",
  "Explain React to me",
  "How do I prepare for technical interviews?",
  "What's the difference between frontend and backend?",
  "How long will it take to become job-ready?",
];

export default function AILearningAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = location.state?.role || "Software Engineer";
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi! I'm your AI Learning Assistant! 👋\n\nI'm here to help you on your journey to becoming a ${role}. I can:\n\n✨ Answer questions about programming concepts\n📚 Recommend learning resources\n💡 Explain complex topics in simple terms\n🎯 Help you with your roadmap\n🚀 Suggest practice projects\n\nYou can also toggle "ELI5 Mode" (Explain Like I'm 5) for super simple explanations!\n\nWhat would you like to learn about today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [eli5Mode, setEli5Mode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(inputMessage, eli5Mode, role),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-9 h-9 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-slate-900">AI Learning Assistant</h1>
                </div>
                <p className="text-xs text-slate-600">Ask me anything about {role}</p>
              </div>
            </div>

            {/* ELI5 Mode Toggle */}
            <div className="flex items-center gap-2 p-2.5 bg-purple-50 rounded-lg border border-purple-200">
              <Lightbulb className="w-4 h-4 text-purple-600" />
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={eli5Mode}
                    onChange={(e) => setEli5Mode(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
                <label className="text-xs font-medium cursor-pointer">
                  ELI5 Mode
                  <span className="block text-xs font-normal text-slate-600">
                    {eli5Mode ? "Simple ON" : "Normal"}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ELI5 Info */}
          {eli5Mode && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-yellow-900">ELI5 Mode Active</p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  All explanations will be simplified using everyday examples and analogies!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Container */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col" style={{ height: "500px" }}>
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-2 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 ${
                    message.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-100 text-slate-900"
                  }`}
                >
                  <p className="text-xs whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  <p
                    className={`text-xs mt-1.5 ${
                      message.role === "user" ? "text-indigo-200" : "text-slate-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                {message.role === "user" && (
                  <div className="w-7 h-7 bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-slate-100 rounded-xl px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions */}
          {messages.length <= 1 && (
            <div className="px-4 pb-3">
              <p className="text-xs font-semibold text-slate-600 mb-2">Suggested Questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {suggestedQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="text-left text-xs p-2 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-lg transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-slate-200 p-3 bg-slate-50">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={eli5Mode ? "Ask me anything (I'll explain simply!)..." : "Ask me anything about your learning journey..."}
                className="flex-1 px-3 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent text-sm"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleSuggestedQuestion("What projects should I build?")}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Code className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs">Project Ideas</p>
                <p className="text-xs text-slate-600">Get suggestions</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleSuggestedQuestion("Recommend learning resources")}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs">Resources</p>
                <p className="text-xs text-slate-600">Best materials</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-3 hover:shadow-xl transition-shadow cursor-pointer" onClick={() => handleSuggestedQuestion("How do I prepare for interviews?")}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-xs">Interview Prep</p>
                <p className="text-xs text-slate-600">Get ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
