import React, { useRef, useEffect } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface ChatComposerProps {
  inputMessage: string;
  setInputMessage: (val: string) => void;
  onSendMessage: () => void;
  isTyping: boolean;
}

export default function ChatComposer({
  inputMessage,
  setInputMessage,
  onSendMessage,
  isTyping
}: ChatComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [inputMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent submission if composing (e.g., CJK input)
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isTyping) {
        onSendMessage();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && !isTyping) {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-slate-200">
      <div className="max-w-4xl mx-auto">
        <form 
          onSubmit={handleSubmit}
          className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent transition-all"
        >
          <textarea
            ref={textareaRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Shift+Enter for new line)"
            className="flex-1 max-h-48 min-h-[44px] bg-transparent resize-none p-3 focus:outline-none text-slate-700 text-sm md:text-base scrollbar-thin scrollbar-thumb-slate-300"
            disabled={isTyping}
            rows={1}
            aria-label="Message input"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="shrink-0 p-3 mb-1 mr-1 rounded-xl bg-emerald-600 text-white disabled:bg-slate-200 disabled:text-slate-400 hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            aria-label="Send message"
          >
            {isTyping ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
        <div className="text-center mt-2">
          <p className="text-[11px] text-slate-400">
            AI can make mistakes. Consider verifying critical information.
          </p>
        </div>
      </div>
    </div>
  );
}
