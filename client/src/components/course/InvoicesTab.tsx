import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Link as LinkIcon, Copy, Search, ExternalLink, X } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';
import { useAlert } from '../../contexts/AlertContext';

interface Invoice {
  id: number;
  invoice_code: string;
  customer_name: string;
  customer_email: string;
  total_amount: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  payment_method: string | null;
  created_at: string;
}

interface Customer {
  id: number;
  full_name: string;
  email: string;
}

interface Course {
  id: number;
  title: string;
  price: string;
}

export default function InvoicesTab() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { showAlert } = useAlert();

  // Wizard state
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<number[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await apiFetch('/api/admin/invoices');
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error(err);
      showAlert('Failed to load invoices', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openWizard = async () => {
    setStep(1);
    setSelectedCustomerId(null);
    setSelectedCourseIds([]);
    setNotes('');
    setGeneratedLink('');
    setShowModal(true);

    try {
      const [custRes, courseRes] = await Promise.all([
        apiFetch('/api/admin/customers'),
        apiFetch('/api/admin/courses')
      ]);
      const custData = await custRes.json();
      const courseData = await courseRes.json();
      
      if (custData.success) setCustomers(custData.customers);
      if (courseData.success) setCourses(courseData.courses.filter((c: any) => c.is_active));
    } catch (err) {
      console.error('Failed to load wizard data', err);
    }
  };

  const handleCreateInvoice = async () => {
    setSaving(true);
    try {
      const res = await apiFetch('/api/admin/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customerId: selectedCustomerId,
          courseIds: selectedCourseIds,
          notes
        })
      });
      const data = await res.json();
      
      if (data.success) {
        const url = `${window.location.origin}/pay/${data.invoice.invoice_code}`;
        setGeneratedLink(url);
        setStep(3); // Success step
        fetchInvoices();
        showAlert('Payment link generated successfully', 'success');
      } else {
        showAlert(data.error || 'Failed to create invoice', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error creating invoice', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleCourse = (id: number) => {
    setSelectedCourseIds(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showAlert('Copied to clipboard!', 'success');
  };

  const confirmBankTransfer = async (id: number) => {
    if (!window.confirm('Are you sure you want to mark this invoice as PAID via bank transfer?')) return;
    try {
      const res = await apiFetch(`/api/admin/invoices/${id}/confirm`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        showAlert('Invoice marked as paid', 'success');
        fetchInvoices();
      } else {
        showAlert('Failed to confirm payment', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error confirming payment', 'error');
    }
  };

  const cancelInvoice = async (id: number) => {
    if (!window.confirm('Cancel this invoice? The link will no longer work.')) return;
    try {
      const res = await apiFetch(`/api/admin/invoices/${id}/cancel`, { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        showAlert('Invoice cancelled', 'info');
        fetchInvoices();
      } else {
        showAlert('Failed to cancel invoice', 'error');
      }
    } catch (err) {
      console.error(err);
      showAlert('Error cancelling invoice', 'error');
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    inv.invoice_code.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateTotal = () => {
    return selectedCourseIds.reduce((sum, id) => {
      const course = courses.find(c => c.id === id);
      return sum + (course ? parseFloat(course.price) : 0);
    }, 0);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading invoices...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or code..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <button 
          onClick={openWizard}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Create Payment Link
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Code</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No invoices generated yet.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-mono font-medium text-slate-900">{inv.invoice_code}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{inv.customer_name}</div>
                      <div className="text-xs text-slate-500">{inv.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ${parseFloat(inv.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${inv.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 
                          inv.payment_status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                          'bg-amber-100 text-amber-800'}
                      `}>
                        {inv.payment_status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => copyToClipboard(`${window.location.origin}/pay/${inv.invoice_code}`)} 
                        title="Copy Payment Link"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />
                      </button>
                      
                      {inv.payment_status === 'pending' && (
                        <>
                          <button 
                            onClick={() => confirmBankTransfer(inv.id)} 
                            title="Confirm Bank Transfer"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => cancelInvoice(inv.id)} 
                            title="Cancel Invoice"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {step === 1 ? 'Select Customer' : step === 2 ? 'Select Courses' : 'Link Generated'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 mb-4">Choose a customer to generate a payment link for.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customers.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCustomerId(c.id)}
                        className={`p-4 border rounded-xl cursor-pointer transition-all ${selectedCustomerId === c.id ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'}`}
                      >
                        <div className="font-bold text-slate-900">{c.full_name}</div>
                        <div className="text-xs text-slate-500 mt-1">{c.email}</div>
                      </div>
                    ))}
                  </div>
                  {customers.length === 0 && (
                    <div className="p-4 text-center text-amber-600 bg-amber-50 rounded-xl">
                      No customers found. Please add a customer first in the Customers tab.
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <p className="text-sm text-slate-600">Select the courses to include in this invoice.</p>
                  <div className="space-y-3">
                    {courses.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => toggleCourse(c.id)}
                        className={`p-4 border rounded-xl cursor-pointer flex justify-between items-center transition-all ${selectedCourseIds.includes(c.id) ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-300'}`}
                      >
                        <div className="font-medium text-slate-900">{c.title}</div>
                        <div className="font-bold text-emerald-700">${parseFloat(c.price).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-slate-700">Total Amount:</span>
                      <span className="text-2xl font-black text-slate-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Optional Notes</label>
                      <input type="text" value={notes} onChange={e => setNotes(e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500" placeholder="e.g. Special bundle discount applied" />
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center py-8 space-y-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900">Invoice Created!</h4>
                    <p className="text-sm text-slate-500 mt-2">The payment link has been generated and emailed to the customer.</p>
                  </div>
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
                    <span className="font-mono text-sm text-slate-600 truncate select-all">{generatedLink}</span>
                    <button 
                      onClick={() => copyToClipboard(generatedLink)}
                      className="shrink-0 flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="w-4 h-4" /> Copy
                    </button>
                  </div>

                  <a 
                    href={generatedLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                  >
                    Preview Payment Page <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 flex justify-between bg-slate-50">
              {step < 3 ? (
                <>
                  <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                    Cancel
                  </button>
                  {step === 1 ? (
                    <button 
                      onClick={() => setStep(2)} 
                      disabled={!selectedCustomerId}
                      className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Next Step
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => setStep(1)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors">
                        Back
                      </button>
                      <button 
                        onClick={handleCreateInvoice} 
                        disabled={selectedCourseIds.length === 0 || saving}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors disabled:opacity-50"
                      >
                        {saving ? 'Generating...' : <><LinkIcon className="w-4 h-4" /> Generate Link</>}
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button onClick={() => setShowModal(false)} className="w-full px-5 py-2.5 text-sm font-bold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-xl transition-colors">
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
