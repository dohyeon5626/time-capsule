import { useEffect } from 'react';
import { Check } from 'lucide-react';

const Toast = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 w-max max-w-[90vw]">
      <div className="bg-slate-800/95 text-white px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border border-slate-700 flex items-center gap-3">
        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-sm font-medium truncate">{message}</span>
      </div>
    </div>
  );
};

export default Toast;
