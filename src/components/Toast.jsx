import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

let addToastFn = null;

export function toast(message, type = 'success') {
  if (addToastFn) addToastFn({ message, type, id: Date.now() });
}

const icons = {
  success: <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />,
  error: <XCircle size={16} className="text-red-600 flex-shrink-0" />,
  warning: <AlertTriangle size={16} className="text-amber-600 flex-shrink-0" />,
  info: <Info size={16} className="text-blue-600 flex-shrink-0" />,
};

const bgMap = {
  success: 'bg-emerald-50 border-emerald-200 shadow-emerald-500/5',
  error: 'bg-red-50 border-red-200 shadow-red-500/5',
  warning: 'bg-amber-50 border-amber-200 shadow-amber-500/5',
  info: 'bg-blue-50 border-blue-200 shadow-blue-500/5',
};

const textMap = {
  success: 'text-emerald-800',
  error: 'text-red-800',
  warning: 'text-amber-800',
  info: 'text-blue-800',
};

function ToastItem({ toast: t, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(t.id), 8000); // Increased to 8 seconds so user can read it
    return () => clearTimeout(timer);
  }, [t.id, onRemove]);

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgMap[t.type]} shadow-lg min-w-[280px] max-w-sm animate-enter`}>
      {icons[t.type]}
      <p className={`text-sm font-medium flex-1 ${textMap[t.type]}`}>{t.message}</p>
      <button onClick={() => onRemove(t.id)} className="text-slate-400 hover:text-slate-600 transition-colors ml-1 p-0.5 rounded hover:bg-white/50">
        <X size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((t) => {
    setToasts(prev => [...prev.slice(-3), t]);
  }, []);

  useEffect(() => {
    addToastFn = add;
    return () => { addToastFn = null; };
  }, [add]);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5">
      {toasts.map(t => (
        <ToastItem key={t.id} toast={t} onRemove={remove} />
      ))}
    </div>
  );
}
