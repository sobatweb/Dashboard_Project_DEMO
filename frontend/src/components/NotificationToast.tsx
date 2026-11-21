import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { notification, notify } = useApp();

  if (!notification) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    error: <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
  };

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    error: 'bg-rose-50 border-rose-200 text-rose-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg transition-all animate-bounce-short max-w-md bg-white">
      <div className={`p-1.5 rounded-lg ${bgColors[notification.type]}`}>
        {icons[notification.type]}
      </div>
      <p className="text-sm font-medium text-slate-800 flex-1">{notification.message}</p>
      <button
        onClick={() => notify('', 'info')}
        className="text-slate-400 hover:text-slate-600 transition p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
