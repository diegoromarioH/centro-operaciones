import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`ro-toast ${toast.type === 'error' ? 'ro-toast-error' : 'ro-toast-success'}`}>
      {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      <span>{toast.msg}</span>
    </div>
  );
}
