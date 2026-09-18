import React, { useState } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';
import type { ChatSession } from './types';

interface ConversationSidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onRenameSession: (id: string, newTitle: string) => void;
  onDeleteSession: (id: string) => void;
  isLoading: boolean;
}

export default function ConversationSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onRenameSession,
  onDeleteSession,
  isLoading
}: ConversationSidebarProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const startEdit = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const submitEdit = (e: React.FormEvent | React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameSession(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const cancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const confirmDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDeleteSession(id);
    setDeletingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200 w-full sm:w-72 shrink-0">
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={onNewChat}
          className="flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          aria-label="Start new conversation"
        >
          <Plus className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-slate-300">
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
          Recent Conversations
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center p-8 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-sm text-slate-500 text-center p-4">
            No previous conversations.
          </div>
        ) : (
          <div className="space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group relative flex flex-col p-3 rounded-lg cursor-pointer transition-colors ${
                  activeSessionId === session.id
                    ? 'bg-emerald-50 text-emerald-900 shadow-sm ring-1 ring-emerald-200'
                    : 'hover:bg-white text-slate-700 hover:shadow-sm'
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSelectSession(session.id);
                  }
                }}
                aria-current={activeSessionId === session.id ? "true" : "false"}
              >
                {editingId === session.id ? (
                  <form onSubmit={(e) => submitEdit(e, session.id)} className="flex items-center w-full" onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 min-w-0 text-sm border border-emerald-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      aria-label="Edit conversation title"
                    />
                    <button type="submit" className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded ml-1" aria-label="Save title">
                      <Check className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={cancelEdit} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded" aria-label="Cancel editing">
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : deletingId === session.id ? (
                  <div className="flex flex-col w-full" onClick={e => e.stopPropagation()}>
                    <span className="text-sm text-red-600 font-medium mb-2">Delete this chat?</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => confirmDelete(e, session.id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium py-1.5 rounded transition-colors"
                      >
                        Delete
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-medium py-1.5 rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id ? 'text-emerald-500' : 'text-slate-400'}`} />
                      <span className="text-sm font-medium truncate">{session.title}</span>
                    </div>
                    
                    <div className="opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center shrink-0 ml-2">
                      <button
                        onClick={(e) => startEdit(e, session)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        aria-label="Rename conversation"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingId(session.id); }}
                        className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        aria-label="Delete conversation"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
                
                {editingId !== session.id && deletingId !== session.id && (
                  <div className="text-[10px] text-slate-400 mt-1 pl-6">
                    {new Date(session.updatedAt).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
