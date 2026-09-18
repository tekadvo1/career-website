import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';
import { getUser } from '../utils/auth';

import AssistantHeader from './assistant/AssistantHeader';
import ConversationSidebar from './assistant/ConversationSidebar';
import MessageList from './assistant/MessageList';
import ChatComposer from './assistant/ChatComposer';
import { ChatSession, Message, AssistantContextData } from './assistant/types';

export default function AILearningAssistant() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();
  
  // Roles and context
  const lastStateRaw = localStorage.getItem('lastRoleAnalysis') || sessionStorage.getItem('lastRoleAnalysis');
  const lastRoleState = lastStateRaw ? JSON.parse(lastStateRaw) : null;
  const _rawAIRole = location.state?.role || lastRoleState?.role || "Software Engineer";
  const role = _rawAIRole.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim() || "Software Engineer";

  const [contextData, setContextData] = useState<AssistantContextData>({
    type: "roadmap",
    topicName: role
  });

  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const initialLoadDone = useRef(false);

  // Sync sessions on mount
  useEffect(() => {
    if (user?.id) {
      setIsHistoryLoading(true);
      apiFetch(`/api/ai/chat-sessions?role=${encodeURIComponent(role)}`)
        .then(res => res.json())
        .then(async data => {
          if (data.success && data.sessions) {
            const parsed = data.sessions.map((s: any) => ({
              ...s,
              messages: [],
              updatedAt: new Date(s.updated_at)
            }));
            setChatHistory(parsed);
            
            // Auto select latest chat if no chat is selected and we didn't come with context
            if (!location.state?.topicContext && parsed.length > 0 && !currentChatId && !initialLoadDone.current) {
              loadSessionMessages(parsed[0].id);
            }
          }
        })
        .catch(err => console.error("Could not sync chat sessions", err))
        .finally(() => {
          setIsHistoryLoading(false);
          initialLoadDone.current = true;
        });
    } else {
      setIsHistoryLoading(false);
    }
    // eslint-disable-next-line
  }, [user?.id, role]);

  // Handle incoming context from other pages
  useEffect(() => {
    if (location.state?.topicContext) {
      const contextStr = location.state.topicContext;
      handlePromptClick(contextStr);
      // Clear state so it doesn't re-trigger on refresh
      window.history.replaceState({}, document.title);
    }
    // eslint-disable-next-line
  }, [location.state]);

  const loadSessionMessages = async (sessionId: string) => {
    setCurrentChatId(sessionId);
    // Find session locally if messages exist
    const session = chatHistory.find(s => s.id === sessionId);
    if (session && session.messages.length > 0) {
      setMessages(session.messages);
      if (window.innerWidth < 768) setShowHistoryPanel(false);
      return;
    }

    try {
      setMessages([]);
      const res = await apiFetch(`/api/ai/chat-sessions/${sessionId}/messages`);
      const data = await res.json();
      if (data.success && data.messages) {
        const msgs = data.messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
        setMessages(msgs);
        setChatHistory(prev => prev.map(s => s.id === sessionId ? { ...s, messages: msgs } : s));
      }
    } catch (e) {
      console.error("Failed to load messages for session", e);
    }

    if (window.innerWidth < 768) setShowHistoryPanel(false);
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    setMessages([]);
    if (window.innerWidth < 768) setShowHistoryPanel(false);
  };

  const handlePromptClick = (prompt: string) => {
    setInputMessage(prompt);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMsgContent = inputMessage.trim();
    setInputMessage("");
    setIsTyping(true);

    const sessionIdToUse = currentChatId || `session_${Date.now()}`;
    if (!currentChatId) {
      setCurrentChatId(sessionIdToUse);
      // Optimistically add to history
      setChatHistory(prev => [{
        id: sessionIdToUse,
        title: "New Conversation",
        messages: [],
        updatedAt: new Date()
      }, ...prev]);
    }

    const tempUserId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempUserId,
      type: "user",
      content: userMsgContent,
      timestamp: new Date(),
      status: "sending"
    }]);

    try {
      const assistantMsgId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev.map(m => m.id === tempUserId ? { ...m, status: "sent" as const } : m),
        {
          id: assistantMsgId,
          type: "assistant",
          content: "",
          timestamp: new Date()
        }
      ]);

      const res = await apiFetch(`/api/ai/chat-sessions/${sessionIdToUse}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsgContent,
          context: `You are an AI Learning Assistant for the role: ${role}. Provide clear, educational, and structured responses.`,
          role: role,
          stream: true
        })
      });

      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                streamedContent += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId ? { ...m, content: streamedContent } : m
                ));
              }
            } catch(e) {}
          }
        }
      }

      // Sync the newly received messages back to the chat history array so switching retains them
      setChatHistory(prev => prev.map(s => {
        if (s.id === sessionIdToUse) {
          // Keep title if it was generated, or update it
          return {
            ...s,
            updatedAt: new Date(),
            messages: [
              ...s.messages,
              { id: tempUserId, type: "user", content: userMsgContent, timestamp: new Date() },
              { id: assistantMsgId, type: "assistant", content: streamedContent, timestamp: new Date() }
            ]
          };
        }
        return s;
      }));

    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => prev.map(m => m.id === tempUserId ? { ...m, status: "failed" as const } : m));
    } finally {
      setIsTyping(false);
    }
  };

  const handleRenameSession = async (id: string, newTitle: string) => {
    try {
      setChatHistory(prev => prev.map(s => s.id === id ? { ...s, title: newTitle } : s));
      await apiFetch(`/api/ai/chat-sessions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle })
      });
    } catch (e) {
      console.error("Rename failed", e);
    }
  };

  const handleDeleteSession = async (id: string) => {
    try {
      setChatHistory(prev => prev.filter(s => s.id !== id));
      if (currentChatId === id) {
        handleNewChat();
      }
      await apiFetch(`/api/ai/chat-sessions/${id}`, { method: "DELETE" });
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  const currentSession = chatHistory.find(s => s.id === currentChatId);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Global App Sidebar */}
      {!isFocusMode && (
        <div className="hidden lg:block w-64 shrink-0 shadow-lg z-20">
          <Sidebar />
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className="flex flex-1 flex-col md:flex-row overflow-hidden relative">
        
        {/* Mobile History Drawer Overlay */}
        {showHistoryPanel && (
          <div 
            className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setShowHistoryPanel(false)}
            aria-hidden="true"
          />
        )}

        {/* Conversation Sidebar */}
        <div className={`
          absolute md:relative z-50 md:z-10 h-full transition-transform duration-300 ease-in-out
          ${showHistoryPanel || (!isFocusMode && window.innerWidth >= 768) ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:hidden'}
        `}>
          <ConversationSidebar 
            sessions={chatHistory}
            activeSessionId={currentChatId}
            onSelectSession={loadSessionMessages}
            onNewChat={handleNewChat}
            onRenameSession={handleRenameSession}
            onDeleteSession={handleDeleteSession}
            isLoading={isHistoryLoading}
          />
        </div>

        {/* Main Conversation Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          <AssistantHeader 
            currentSessionTitle={currentSession?.title}
            contextData={contextData}
            isHistoryVisible={showHistoryPanel || (!isFocusMode && window.innerWidth >= 768)}
            toggleHistory={() => setShowHistoryPanel(prev => !prev)}
            isFocusMode={isFocusMode}
            toggleFocusMode={() => setIsFocusMode(!isFocusMode)}
          />
          
          <MessageList 
            messages={messages}
            isLoading={isHistoryLoading && !initialLoadDone.current}
            isTyping={isTyping}
            onPromptClick={handlePromptClick}
          />

          <ChatComposer 
            inputMessage={inputMessage}
            setInputMessage={setInputMessage}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
          />
        </div>
      </div>
    </div>
  );
}
