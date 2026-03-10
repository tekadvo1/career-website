import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertMessage {
  id: number;
  message: string;
  type: AlertType;
}

interface AlertContextType {
  showAlert: (message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error('useAlert must be used within AlertProvider');
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alerts, setAlerts] = useState<AlertMessage[]>([]);

  const showAlert = (message: string, type: AlertType = 'info') => {
    const id = Date.now();
    setAlerts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setAlerts(prev => prev.filter(a => a.id !== id));
    }, 4000);
  };

  const removeAlert = (id: number) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2">
        {alerts.map(alert => (
          <div 
            key={alert.id}
            className={`
              flex flex-col gap-1 p-4 rounded-xl shadow-xl border animate-in slide-in-from-bottom-5 fade-in duration-300 w-80 max-w-[90vw]
              ${alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : ''}
              ${alert.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' : ''}
              ${alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-800' : ''}
              ${alert.type === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
            `}
          >
            <div className="flex items-start gap-3">
                <div className="mt-0.5 flex-shrink-0">
                  {alert.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600" />}
                  {alert.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                  {alert.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-sm font-bold whitespace-pre-wrap leading-tight">{alert.message}</p>
                </div>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-1 -m-1"
                >
                  <X className="w-4 h-4" />
                </button>
            </div>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};
