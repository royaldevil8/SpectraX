import { useEffect, useState } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastData {
  id: number;
  message: string;
  variant?: 'success' | 'warning' | 'info';
}

export function Toast({ toast, onClose }: { toast: ToastData; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle2 size={16} className="text-success" />,
    warning: <AlertTriangle size={16} className="text-warning" />,
    info: <Info size={16} className="text-accent-cyan" />,
  };
  const variant = toast.variant || 'info';

  return (
    <div className="animate-slide-up flex items-center gap-3 bg-bg-elevated border border-border rounded-lg px-4 py-3 shadow-xl min-w-[320px]">
      {icons[variant]}
      <span className="text-sm text-text-primary flex-1">{toast.message}</span>
      <button onClick={onClose} className="text-text-muted hover:text-text-primary">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }: { toasts: ToastData[]; onClose: (id: number) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const showToast = (message: string, variant: 'success' | 'warning' | 'info' = 'info') => {
    setToasts((prev) => [...prev, { id: Date.now(), message, variant }]);
  };
  const closeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));
  return { toasts, showToast, closeToast };
}
