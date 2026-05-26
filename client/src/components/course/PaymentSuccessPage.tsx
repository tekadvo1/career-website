import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 max-w-lg w-full shadow-2xl text-center border border-emerald-100">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border-4 border-emerald-50">
          <CheckCircle className="w-12 h-12 text-emerald-500" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Payment Successful!</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
          Thank you for your purchase. Your payment for Invoice #{code} has been securely processed. 
          The administrator will grant you access to your courses shortly.
        </p>

        <div className="space-y-3">
          <button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            Go to Homepage <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
