import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import { apiFetch } from '../utils/apiFetch';
import { useAlert } from '../contexts/AlertContext';
import { 
    Search, FileText, Plus, Save, Trash2, Edit3, 
    ArrowLeft, ExternalLink, X, Clock, AlertTriangle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Note {
    id: number;
    title: string;
    body?: string;
    excerpt?: string;
    tags?: string[];
    related_type?: string;
    related_id?: string;
    related_title?: string;
    revision: number;
    updated_at: string;
}

export default function MyLearningNotes() {
    const { showAlert } = useAlert();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();

    // State
    const [notes, setNotes] = useState<Note[]>([]);
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const [editTitle, setEditTitle] = useState('');
    const [editBody, setEditBody] = useState('');
    
    // Status
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved'|'saving'|'unsaved'|'error'>('saved');
    const [conflictError, setConflictError] = useState<string | null>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all'|'lesson'|'project'>('all');

    // Load list
    const loadNotes = useCallback(async () => {
        setIsLoading(true);
        try {
            let url = `/api/notes?`;
            if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;
            if (activeFilter !== 'all') url += `related_type=${activeFilter}&`;
            
            const res = await apiFetch(url);
            if (res.ok) {
                const data = await res.json();
                setNotes(data.notes || []);
            }
        } catch (err) {
            console.error("Failed to load notes", err);
            showAlert("Failed to load notes", "error");
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, activeFilter, showAlert]);

    useEffect(() => {
        loadNotes();
    }, [loadNotes]);

    // Pre-fill from location state (e.g. redirected from a lesson)
    useEffect(() => {
        const state = location.state as any;
        if (state?.action === 'new_note' && state?.related_type) {
            handleNewNote(state.related_type, state.related_id, state.related_title);
            // clear state so it doesn't trigger again on refresh
            navigate(location.pathname, { replace: true });
        }
    }, [location, navigate]);

    // Load specific note from URL
    useEffect(() => {
        const noteId = searchParams.get('id');
        if (noteId && (!selectedNote || selectedNote.id !== Number(noteId))) {
            loadSingleNote(Number(noteId));
        } else if (!noteId && selectedNote) {
            setSelectedNote(null);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    // Warn before unload
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    const loadSingleNote = async (id: number) => {
        try {
            const res = await apiFetch(`/api/notes/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSelectedNote(data.note);
                setEditTitle(data.note.title);
                setEditBody(data.note.body);
                setHasUnsavedChanges(false);
                setSaveStatus('saved');
                setConflictError(null);
            }
        } catch (err) {
            console.error("Failed to load note", err);
            showAlert("Failed to load note", "error");
        }
    };

    const handleNewNote = (relType?: string, relId?: string, relTitle?: string) => {
        if (hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes. Discard them?")) return;
        }
        const newNote: Note = {
            id: 0,
            title: 'Untitled Note',
            body: '',
            revision: 0,
            updated_at: new Date().toISOString(),
            related_type: relType,
            related_id: relId,
            related_title: relTitle
        };
        setSelectedNote(newNote);
        setEditTitle(newNote.title);
        setEditBody(newNote.body || '');
        setIsEditing(true);
        setHasUnsavedChanges(false);
        setSaveStatus('unsaved');
        setConflictError(null);
        setSearchParams({ id: 'new' });
    };

    const handleSelectNote = (note: Note) => {
        if (hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes. Discard them?")) return;
        }
        setSearchParams({ id: note.id.toString() });
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!selectedNote) return;
        setIsSaving(true);
        setSaveStatus('saving');
        setConflictError(null);

        const payload = {
            title: editTitle,
            body: editBody,
            revision: selectedNote.revision,
            related_type: selectedNote.related_type,
            related_id: selectedNote.related_id,
            related_title: selectedNote.related_title
        };

        try {
            const url = selectedNote.id === 0 ? '/api/notes' : `/api/notes/${selectedNote.id}`;
            const method = selectedNote.id === 0 ? 'POST' : 'PUT';

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            if (res.status === 409) {
                setSaveStatus('error');
                setConflictError(data.error);
                return;
            }

            if (res.ok && data.note) {
                setSelectedNote(data.note);
                setSaveStatus('saved');
                setHasUnsavedChanges(false);
                if (selectedNote.id === 0) {
                    setSearchParams({ id: data.note.id.toString() }, { replace: true });
                }
                loadNotes(); // refresh list
            } else {
                setSaveStatus('error');
                showAlert(data.error || "Failed to save note", "error");
            }
        } catch (err) {
            console.error("Save error", err);
            setSaveStatus('error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedNote || selectedNote.id === 0) {
            setSelectedNote(null);
            setSearchParams({});
            return;
        }
        
        if (!window.confirm("Are you sure you want to delete this note?")) return;

        try {
            const res = await apiFetch(`/api/notes/${selectedNote.id}`, { method: 'DELETE' });
            if (res.ok) {
                setSelectedNote(null);
                setSearchParams({});
                loadNotes();
                showAlert("Note deleted", "success");
            } else {
                showAlert("Failed to delete note", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Failed to delete note", "error");
        }
    };

    const handleRenameNoteList = (e: React.MouseEvent, note: Note) => {
        e.stopPropagation();
        if (hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes. Discard them?")) return;
        }
        setSearchParams({ id: note.id.toString() });
        // The URL change triggers loadSingleNote which sets isEditing(false).
        // Wait for the note to load, then set isEditing(true)
        setTimeout(() => setIsEditing(true), 100);
    };

    const handleDeleteNoteList = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this note?")) return;
        
        try {
            const res = await apiFetch(`/api/notes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                if (selectedNote?.id === id) {
                    setSelectedNote(null);
                    setSearchParams({});
                }
                loadNotes();
                showAlert("Note deleted", "success");
            } else {
                showAlert("Failed to delete note", "error");
            }
        } catch (err) {
            console.error(err);
            showAlert("Failed to delete note", "error");
        }
    };

    // Body change handler
    const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEditBody(e.target.value);
        setHasUnsavedChanges(true);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    };
    
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditTitle(e.target.value);
        setHasUnsavedChanges(true);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    };

    const removeAssociation = () => {
        if (!selectedNote) return;
        setSelectedNote({ ...selectedNote, related_type: undefined, related_id: undefined, related_title: undefined });
        setHasUnsavedChanges(true);
        if (saveStatus === 'saved') setSaveStatus('unsaved');
    };

    const navigateToAssociation = () => {
        if (!selectedNote || !selectedNote.related_type || !selectedNote.related_id) return;
        if (hasUnsavedChanges) {
            if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
        }
        if (selectedNote.related_type === 'lesson') {
            navigate(`/roadmap?lesson=${selectedNote.related_id}`);
        } else if (selectedNote.related_type === 'project') {
            navigate(`/projects/workspace/${selectedNote.related_id}`);
        }
    };

    const isMobileSelected = searchParams.get('id') !== null;

    return (
        <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row font-sans">
            <div className="z-50 shrink-0"><Sidebar activePage="tools" /></div>
            
            <div className="flex-1 flex overflow-hidden w-full relative">
                
                {/* LIST PANEL */}
                <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-[100dvh] absolute md:relative z-10 transition-transform ${isMobileSelected ? '-translate-x-full md:translate-x-0' : 'translate-x-0'}`}>
                    <div className="p-4 border-b border-slate-200 flex flex-col gap-4 bg-white">
                        <div className="flex justify-between items-center">
                            <h1 className="text-xl font-bold text-slate-900">My Notes</h1>
                            <button 
                                onClick={() => handleNewNote()}
                                className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center hover:bg-emerald-200 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="relative">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search notes..."
                                className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                        </div>
                        <div className="flex gap-2">
                            {(['all', 'lesson', 'project'] as const).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter)}
                                    className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                                        activeFilter === filter 
                                        ? 'bg-slate-800 text-white' 
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-8 text-center text-sm text-slate-400">Loading...</div>
                        ) : notes.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center">
                                <FileText className="w-8 h-8 text-slate-300 mb-3" />
                                <div className="text-sm font-bold text-slate-600 mb-1">No notes found</div>
                                <div className="text-xs text-slate-400">Create a note to get started.</div>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {notes.map(note => (
                                    <button
                                        key={note.id}
                                        onClick={() => handleSelectNote(note)}
                                        className={`group w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                                            selectedNote?.id === note.id ? 'bg-emerald-50 hover:bg-emerald-50 border-l-4 border-l-emerald-500 pl-3' : 'border-l-4 border-l-transparent'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-1 gap-2">
                                            <div className="font-bold text-sm text-slate-900 line-clamp-1">{note.title}</div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={(e) => handleRenameNoteList(e, note)}
                                                    className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                                                    title="Rename Note"
                                                >
                                                    <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button 
                                                    onClick={(e) => handleDeleteNoteList(e, note.id)}
                                                    className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                                                    title="Delete Note"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-500 line-clamp-2 mb-2 pr-6">{note.excerpt || 'Empty note'}</div>
                                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> 
                                                {new Date(note.updated_at).toLocaleDateString()}
                                            </span>
                                            {note.related_type && (
                                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500 capitalize">
                                                    {note.related_type}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* EDITOR PANEL */}
                <div className={`flex-1 bg-slate-50 flex flex-col h-[100dvh] absolute md:relative w-full z-20 transition-transform ${isMobileSelected ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
                    {selectedNote ? (
                        <>
                            {/* Editor Header */}
                            <div className="h-16 px-4 md:px-6 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => setSearchParams({})}
                                        className="md:hidden w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </button>
                                    
                                    {isEditing ? (
                                        <input 
                                            value={editTitle}
                                            onChange={handleTitleChange}
                                            className="text-lg font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 px-0 max-w-[200px] md:max-w-md"
                                            placeholder="Note Title"
                                        />
                                    ) : (
                                        <h2 className="text-lg font-bold text-slate-900 truncate max-w-[200px] md:max-w-md">{editTitle}</h2>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-xs font-bold text-slate-400 hidden sm:inline-block">
                                        {saveStatus === 'saving' && 'Saving...'}
                                        {saveStatus === 'saved' && 'Saved'}
                                        {saveStatus === 'unsaved' && 'Unsaved changes'}
                                        {saveStatus === 'error' && <span className="text-red-500">Save failed</span>}
                                    </span>
                                    
                                    {!isEditing ? (
                                        <button 
                                            onClick={() => setIsEditing(true)}
                                            className="px-3 py-1.5 md:px-4 md:py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50"
                                        >
                                            <Edit3 className="w-4 h-4" /> <span className="hidden sm:inline">Edit</span>
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={handleSave}
                                            disabled={isSaving || saveStatus === 'saved'}
                                            className="px-3 py-1.5 md:px-4 md:py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
                                        >
                                            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save</span>
                                        </button>
                                    )}
                                    
                                    <button 
                                        onClick={handleDelete}
                                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Conflict Error */}
                            {conflictError && (
                                <div className="bg-red-50 p-4 border-b border-red-200 flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                    <div>
                                        <div className="text-sm font-bold text-red-800">Save Conflict</div>
                                        <div className="text-sm text-red-700 mt-1">{conflictError}</div>
                                        <div className="flex gap-3 mt-3">
                                            <button onClick={() => loadSingleNote(selectedNote.id)} className="text-sm bg-white px-3 py-1.5 border border-red-200 rounded font-bold text-red-700 hover:bg-red-50">Reload Server Version</button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Association Banner */}
                            {selectedNote.related_type && (
                                <div className="bg-blue-50 px-4 py-3 md:px-6 border-b border-blue-100 flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-blue-800 capitalize">{selectedNote.related_type}:</span>
                                        <span className="text-blue-900 truncate max-w-[200px] sm:max-w-md">{selectedNote.related_title || selectedNote.related_id}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button onClick={navigateToAssociation} className="text-blue-600 font-bold hover:underline flex items-center gap-1 text-xs">
                                            Open <ExternalLink className="w-3 h-3" />
                                        </button>
                                        {isEditing && (
                                            <button onClick={removeAssociation} className="text-slate-400 hover:text-slate-600" title="Remove association">
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Editor/Preview Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-white">
                                {isEditing ? (
                                    <textarea
                                        value={editBody}
                                        onChange={handleBodyChange}
                                        placeholder="Start writing using Markdown..."
                                        className="w-full h-full min-h-[500px] bg-transparent border-none focus:outline-none focus:ring-0 resize-none font-mono text-sm leading-relaxed text-slate-800"
                                    />
                                ) : (
                                    <div className="prose prose-slate max-w-none prose-emerald">
                                        {editBody ? (
                                            <ReactMarkdown>{editBody}</ReactMarkdown>
                                        ) : (
                                            <div className="text-slate-400 italic">This note is empty. Click Edit to start writing.</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 hidden md:flex">
                            <FileText className="w-16 h-16 text-slate-200 mb-4" />
                            <h3 className="text-lg font-bold text-slate-700 mb-2">My Learning Notes</h3>
                            <p className="text-sm text-slate-500 max-w-sm mb-6">Select a note from the list or create a new one to start writing.</p>
                            <button 
                                onClick={() => handleNewNote()}
                                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-700 shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> New Note
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
