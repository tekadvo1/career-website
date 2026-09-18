import React, { useRef, useEffect, useState, UIEvent } from 'react';
import { ArrowDown, Sparkles, MessageSquare, Wrench, Lightbulb, Map } from 'lucide-react';
import { Message } from './types';
import AssistantMessage from './AssistantMessage';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isTyping: boolean;
  onPromptClick: (prompt: string) => void;
}

export default function MessageList({
  messages,
  isLoading,
  isTyping,
  onPromptClick
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // Initial prompt buttons
  const promptButtons = [
    { text: "Explain a concept", icon: <Lightbulb className="w-4 h-4 text-amber-500" /> },
    { text: "Give me a hint", icon: <Sparkles className="w-4 h-4 text-emerald-500" /> },
    { text: "Help debug an error", icon: <Wrench className="w-4 h-4 text-rose-500" /> },
    { text: "Help plan my next learning step", icon: <Map className="w-4 h-4 text-blue-500" /> },
  ];

  const handleScroll = (e: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
    
    setIsAutoScrolling(isNearBottom);
    setShowScrollButton(!isNearBottom);
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  // Auto scroll when messages change or typing state changes
  useEffect(() => {
    if (isAutoScrolling) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  return (
    <div className="relative flex-1 bg-white overflow-hidden flex flex-col">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300"
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center min-h-full p-8 text-center max-w-2xl mx-auto mt-12 md:mt-24">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
              <Sparkles className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
              What would you like to understand or work on?
            </h2>
            <p className="text-slate-600 mb-8 max-w-md">
              I'm here to help you debug code, explain complex concepts, and guide your learning journey.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              {promptButtons.map((btn, i) => (
                <button
                  key={i}
                  onClick={() => onPromptClick(btn.text)}
                  className="flex items-center gap-3 p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-slate-100 shrink-0">
                    {btn.icon}
                  </div>
                  <span className="text-sm font-medium text-slate-700">{btn.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {messages.map((msg, index) => (
            <AssistantMessage key={msg.id || index} message={msg} />
          ))}
          
          {isTyping && (
            <div className="py-6 px-4 md:px-8 bg-slate-50">
              <div className="max-w-4xl mx-auto flex gap-4 md:gap-6">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 py-1.5 h-8">
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {showScrollButton && messages.length > 0 && (
        <button
          onClick={() => {
            setIsAutoScrolling(true);
            scrollToBottom();
          }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-full shadow-md border border-slate-200 hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 z-10"
          aria-label="Jump to latest"
        >
          <ArrowDown className="w-4 h-4" />
          <span className="text-sm font-medium">Jump to latest</span>
        </button>
      )}
    </div>
  );
}
