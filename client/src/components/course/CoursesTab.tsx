import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Tag, Sparkles } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
import { useAlert } from '../../contexts/AlertContext';

interface Course {
  id: number;
  title: string;
  description: string;
  price: string; // comes as string from postgres decimal
  is_active: boolean;
  created_at: string;
}

export default function CoursesTab() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const { showAlert } = useAlert();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const generateDescription = async () => {
    if (!title.trim()) {
      showAlert('Please enter a course title first to generate a description', 'warning');
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await apiFetch('/api/admin/courses/generate-description', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      const data = await res.json();
      if (data.success) {
        setDescription(data.description);
        showAlert('Description generated successfully!', 'success');
      } else {
        showAlert(data.error || 'Failed to generate description', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error generating description', 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await apiFetch('/api/admin/courses');
      const data = await res.json();
      if (data.success) {
        setCourses(data.courses);
      }
    } catch (err) {
      console.error(err);
      showAlert('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setTitle(course.title);
      setDescription(course.description || '');
      setPrice(course.price);
      setIsActive(course.is_active);
    } else {
      setEditingCourse(null);
      setTitle('');
      setDescription('');
      setPrice('');
      setIsActive(true);
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      
      const res = await apiFetch(url, {
        method,
        body: JSON.stringify({ title, description, price, is_active: isActive }),
      });
      const data = await res.json();
      
      if (data.success) {
        showAlert(`Course ${editingCourse ? 'updated' : 'added'} successfully`, 'success');
        setShowModal(false);
        fetchCourses();
      } else {
        showAlert(data.error || 'Failed to save course', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error saving course', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to deactivate this course?')) return;
    try {
      const res = await apiFetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showAlert('Course deactivated', 'success');
        fetchCourses();
      } else {
        showAlert(data.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error deleting course', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading courses...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button 
          onClick={() => openModal()}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <div className="col-span-full p-12 text-center border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
            No courses available yet. Add one to get started!
          </div>
        ) : (
          courses.map(course => (
            <div key={course.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm flex flex-col ${course.is_active ? 'border-slate-200' : 'border-red-200 bg-red-50/30 opacity-70'}`}>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{course.title}</h4>
                  <div className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-sm flex items-center gap-1 border border-emerald-100 whitespace-nowrap">
                    <Tag className="w-3 h-3" /> ${parseFloat(course.price).toFixed(2)}
                  </div>
                </div>
                <p className="text-sm text-slate-500 mb-4 flex-1 line-clamp-3">{course.description || 'No description provided.'}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${course.is_active ? 'bg-slate-100 text-slate-600' : 'bg-red-100 text-red-600'}`}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(course)} className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                    {course.is_active && (
                      <button onClick={() => handleDelete(course.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">{editingCourse ? 'Edit Course' : 'Add Course'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Course Title *</label>
                <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. Full Stack Masterclass" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price (USD) *</label>
                <input required type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" placeholder="e.g. 199.99" />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Description</label>
                  <button 
                    type="button" 
                    onClick={generateDescription}
                    disabled={generatingAi}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200 disabled:opacity-50"
                  >
                    <Sparkles className={`w-3 h-3 ${generatingAi ? 'animate-pulse' : ''}`} />
                    {generatingAi ? 'Generating...' : 'AI Generate'}
                  </button>
                </div>
                <textarea rows={6} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none" placeholder="Describe the course..." />
              </div>
              
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="isActive" 
                  checked={isActive} 
                  onChange={e => setIsActive(e.target.checked)} 
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Course is active and available for sale</label>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
