import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem { id: number; message: string; type: ToastType; }

interface ToastContextType { addToast: (message: string, type?: ToastType) => void; }
const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

let globalAddToast: (message: string, type?: ToastType) => void = () => {};
export function toast(message: string, type: ToastType = 'success') { globalAddToast(message, type); }
export function useToast() { return useContext(ToastContext); }

const icons = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  let counter = 0;

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = ++counter;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  globalAddToast = addToast;

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${colors[t.type]} animate-slide-in min-w-[300px]`}>
              <Icon className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}><X className="w-4 h-4" /></button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
