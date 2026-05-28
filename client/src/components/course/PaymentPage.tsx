import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Shield, CreditCard, Landmark, AlertCircle, Loader2 } from 'lucide-react';
import { apiFetch } from '../../utils/apiFetch';

interface InvoiceData {
  invoice_code: string;
  total_amount: string;
  payment_status: string;
}

export default function PaymentPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingStripe, setProcessingStripe] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await apiFetch(`/api/pay/${code}`);
        const data = await res.json();
        
        if (data.success) {
          setInvoice(data.invoice);
        } else {
          setError(data.error || 'Invoice not found');
        }
      } catch (err) {
        setError('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    
    if (code) {
      fetchInvoice();
      
      // Set up real-time SSE listener
      const eventSource = new EventSource(`/api/pay/${code}/stream`);
      
      eventSource.addEventListener('update', (e) => {
        try {
          const data = JSON.parse(e.data);
          if (data.status === 'paid' || data.status === 'cancelled') {
             setInvoice(prev => prev ? { ...prev, payment_status: data.status } : null);
          }
        } catch (err) {
          console.error('Error parsing SSE data:', err);
        }
      });

      return () => {
        eventSource.close();
      };
    }
  }, [code]);

  const handleStripePayment = async () => {
    setProcessingStripe(true);
    try {
      const res = await apiFetch(`/api/pay/${code}/stripe`, { method: 'POST' });
      const data = await res.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || 'Failed to initialize payment');
        setProcessingStripe(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setProcessingStripe(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center border border-rose-100">
          <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invalid Link</h2>
          <p className="text-slate-500 mb-6">{error || 'This payment link is invalid or has expired.'}</p>
          <button onClick={() => navigate('/')} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold w-full hover:bg-slate-800 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (invoice.payment_status === 'paid') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center border border-emerald-100">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Payment Complete!</h2>
          <p className="text-slate-600 mb-6">This invoice has already been paid successfully.</p>
          <button onClick={() => navigate('/')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold w-full hover:bg-emerald-700 transition-colors">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (invoice.payment_status === 'cancelled') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Invoice Cancelled</h2>
          <p className="text-slate-500">This payment request has been cancelled by the administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold mb-4">
            <Shield className="w-4 h-4" /> Secure Payment
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Complete Your Payment</h1>
          <p className="text-slate-500 mt-2">Invoice #{invoice.invoice_code}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/40 border border-slate-100 h-fit">
            <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">Order Summary</h2>
            
            <div className="flex justify-between items-end mb-8">
              <div>
                <p className="text-sm font-semibold text-slate-500 mb-1">Total Due</p>
                <p className="text-4xl font-black text-slate-900">${parseFloat(invoice.total_amount).toFixed(2)}</p>
              </div>
              <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">USD</span>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">Immediate access to your selected FindStreak courses.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-600">Lifetime access & future updates.</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 text-lg px-1">Select Payment Method</h3>
            
            {/* Stripe Card Payment */}
            <button 
              onClick={handleStripePayment}
              disabled={processingStripe}
              className="w-full bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-lg shadow-emerald-500/10 text-left transition-transform hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Pay via Card</h4>
                    <p className="text-sm text-slate-500">Credit, Debit, or Apple/Google Pay</p>
                  </div>
                </div>
                {processingStripe ? (
                  <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-500 flex items-center justify-center">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                  </div>
                )}
              </div>
            </button>

            {/* Bank Transfer (Zero Fees) */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm transition-all">
              <button 
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Direct Bank Transfer</h4>
                    <p className="text-sm text-slate-500">Zero processing fees</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${showBankDetails ? 'border-slate-800' : 'border-slate-300'}`}>
                  {showBankDetails && <div className="w-3 h-3 bg-slate-800 rounded-full" />}
                </div>
              </button>
              
              {showBankDetails && (
                <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm text-slate-600 mb-4">
                    Please transfer the exact amount to the following account. Your invoice will be activated manually once funds clear.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 space-y-3 font-mono text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Bank</span>
                      <span className="font-semibold">Chase Bank</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Account Name</span>
                      <span className="font-semibold">FindStreak LLC</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Account No.</span>
                      <span className="font-semibold select-all">1234567890</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-sans">Routing No.</span>
                      <span className="font-semibold select-all">098765432</span>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 flex justify-between">
                      <span className="text-slate-500 font-sans font-bold">Reference</span>
                      <span className="font-black text-emerald-600 select-all tracking-wider">{invoice.invoice_code}</span>
                    </div>
                  </div>
                  <p className="text-xs text-rose-500 mt-3 font-semibold text-center">
                    * You MUST include the reference code above.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-400 font-medium">
            Payments are secured and encrypted. By continuing, you agree to our Terms of Service.
          </p>
        </div>

      </div>
    </div>
  );
}
