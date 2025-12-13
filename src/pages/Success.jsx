import { useState, useEffect } from 'react';
import { AlertTriangle, Check, Copy, Share2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import Toast from '../components/Toast';
import { copyToClipboard, formatDate } from '../etc/helpers';

const Success = () => {
  useEffect(() => {
    document.title = '생성 완료 | 디지털 타임캡슐';

    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      meta.setAttribute('content', 'noindex, nofollow');
      document.head.appendChild(meta);
    } else {
      meta.setAttribute('content', 'noindex, nofollow');
    }

    return () => {
      const meta = document.querySelector('meta[name="robots"]');
      if (meta) {
        document.head.removeChild(meta);
      }
      document.title = '디지털 타임캡슐';
    };
  }, []);

  const [toastMessage, setToastMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  if (!location.state) {
    navigate('/', { replace: true });
    return null;
  }

  const { formData, recipients, createdCapsuleId } = location.state;

  const shareLink = async () => {
    const shareData = {
      title: 'Time Capsule',
      url: `${window.location.origin}/#/view?id=${createdCapsuleId}`,
    };
    if (window.navigator.share) {
      await window.navigator.share(shareData);
    } else {
      copyToClipboard(shareData.url);
      setToastMessage('링크가 복사되었습니다. 친구에게 공유해보세요!');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center font-sans relative">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <div className="absolute top-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -z-10"></div>
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/50 animate-bounce-short">
        <Check className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-3xl font-bold mb-3 text-slate-100">전송 완료!</h2>
      <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-xs mx-auto">
        타임캡슐이 안전하게 묻혔습니다.
        <br />
        <span className="text-emerald-400 font-semibold">
          {formatDate(new Date(formData.openDate))}
        </span>
        에<br />
        {recipients.length > 0 ? (
          <span className="text-white font-bold">{recipients.length}명</span>
        ) : (
          <span className="text-slate-400">지정된 수신자</span>
        )}
        에게 알림톡이 전송됩니다.
      </p>

      {!formData.passwordKey && (
        <div className="w-full max-w-xs bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-amber-400 font-bold text-xs mb-1">
              보안 주의
            </div>
            <p className="text-amber-200/70 text-[11px] leading-relaxed">
              암호키를 설정하지 않았으므로,{' '}
              <strong>캡슐 코드만 있으면 누구나</strong> 내용을 볼 수 있습니다.
              코드 공유 시 유의해주세요.
            </p>
          </div>
        </div>
      )}

      <div
        className="w-full max-w-xs bg-[#1e293b] border border-slate-700 rounded-2xl p-6 mb-4 relative group cursor-pointer hover:border-blue-500/50 transition-all shadow-xl"
        onClick={() => {
          copyToClipboard(createdCapsuleId);
          setToastMessage('캡슐 코드가 복사되었습니다.');
        }}
      >
        <div className="text-xs text-slate-500 mb-2 text-left font-medium uppercase tracking-wider">
          캡슐 코드
        </div>
        <div className="font-mono text-l font-bold text-blue-400 break-all">
          {createdCapsuleId}
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white text-slate-500 transition-colors">
          <Copy className="w-5 h-5" />
        </div>
      </div>

      <button
        onClick={shareLink}
        className="w-full max-w-xs py-3.5 mb-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        링크로 공유하기
      </button>

      {/* <div className="w-full max-w-xs mb-4">
                <AdBanner />
            </div> */}

      <button
        onClick={() => {
          navigate('/');
        }}
        className="w-full max-w-xs py-3.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:text-white hover:bg-slate-800 transition-colors"
      >
        홈으로 돌아가기
      </button>
    </div>
  );
};

export default Success;
