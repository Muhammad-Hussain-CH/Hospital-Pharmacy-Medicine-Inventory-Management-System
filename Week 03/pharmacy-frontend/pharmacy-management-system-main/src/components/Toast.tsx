import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { useData } from '../context/DataContext';

export default function Toast() {
  const { toasts, dismissToast } = useData();

  if (!toasts.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="toast-in flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl min-w-[280px] max-w-xs"
          style={{
            background: toast.type === 'success' ? '#ECFDF5' : toast.type === 'error' ? '#FEF2F2' : '#EFF6FF',
            borderLeft: `4px solid ${toast.type === 'success' ? '#059669' : toast.type === 'error' ? '#DC2626' : '#2563EB'}`,
          }}
        >
          {toast.type === 'success' && <CheckCircle size={18} className="text-emerald-600 shrink-0" />}
          {toast.type === 'error' && <XCircle size={18} className="text-red-600 shrink-0" />}
          {toast.type === 'info' && <Info size={18} className="text-blue-600 shrink-0" />}
          <span className="text-sm font-medium text-gray-800 flex-1">{toast.message}</span>
          <button onClick={() => dismissToast(toast.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
