import { AlertTriangle, X } from 'lucide-react';

const IdModal = ({
  isOpen,
  onClose,
  manualId,
  setManualId,
  manualIdError,
  setManualIdError,
  fetchCapsule,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] rounded-2xl p-6 w-full max-w-sm border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-0 zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-white text-lg">캡슐 열기</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <input
          type="text"
          value={manualId}
          onChange={(e) => {
            setManualId(e.target.value);
            setManualIdError('');
          }}
          placeholder="전달받은 코드를 입력하세요"
          className={`w-full bg-[#0f172a] border ${
            manualIdError
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-600 focus:border-blue-500'
          } rounded-xl p-4 text-white text-base mb-2 focus:ring-1 outline-none transition-all placeholder:text-slate-600`}
          autoFocus
        />
        {manualIdError && (
          <p className="text-xs text-rose-500 mb-4 ml-1 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {manualIdError}
          </p>
        )}

        <button
          onClick={() => fetchCapsule(manualId)}
          className={`w-full py-4 rounded-xl text-white font-bold text-base shadow-lg transition-transform active:scale-[0.98] ${
            manualIdError
              ? 'bg-slate-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500'
          }`}
        >
          확인
        </button>
      </div>
    </div>
  );
};

export default IdModal;
