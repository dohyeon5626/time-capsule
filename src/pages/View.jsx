import { useState, useEffect } from 'react';
import {
  ArrowRight,
  CalendarIcon,
  Clock,
  Copy,
  Download,
  Eye,
  EyeOff,
  Home,
  KeyRound,
  Lock,
  Share2,
  Trash2,
  Unlock,
  User,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import CryptoJS from 'crypto-js';
import Toast from '../components/Toast';
import Loading from '../components/Loading';
import { getCapsuleRequest } from '../etc/api';
import {
  calculateTimeLeft,
  copyToClipboard,
  formatDate,
} from '../etc/helpers';

const View = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [viewCapsuleData, setViewCapsuleData] = useState(null);
  const [message, setMessage] = useState('');

  const [timeLeft, setTimeLeft] = useState(0);
  const [viewUnlockPassword, setViewUnlockPassword] = useState('');
  const [showViewPassword, setShowViewPassword] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [forceUnlock, setForceUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams(location.search);
    const id = params.get('id');
    if (!id) {
      navigate('/', { state: { message: '잘못된 접근입니다.' } });
      return;
    }

    (async () => {
      try {
        const data = await getCapsuleRequest(id.trim());
        if (data) {
          setViewCapsuleData({ id: id, ...data });
          if (!data.usePasswordKey) setMessage(data.message);
          setLoading(false);
        } else {
          navigate('/', {
            state: { message: '해당 코드를 가진 캡슐을 찾을 수 없습니다.' },
          });
        }
      } catch (error) {
        navigate('/', { state: { message: '조회 중 오류가 발생했습니다.' } });
      }
    })();
  }, [location.search, navigate]);

  useEffect(() => {
    if (viewCapsuleData) {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(viewCapsuleData.openDate));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [viewCapsuleData]);

  const handleUnlock = () => {
    const resultMessage = CryptoJS.AES.decrypt(viewCapsuleData.message, viewUnlockPassword).toString(CryptoJS.enc.Utf8);

    if (resultMessage.startsWith('MSG_')) {
      setMessage(resultMessage.substring(4));
      setIsDecrypting(true);
      setTimeout(() => {
        setIsDecrypting(false);
        setIsUnlocked(true);
      }, 1500);
    } else {
      setUnlockError('암호가 일치하지 않습니다.');
      if (window.navigator.vibrate) window.navigator.vibrate(200);
    }
  };

  const handleShareInView = async () => {
    if (!viewCapsuleData) return;
    const shareData = {
      title: 'Time Capsule',
      text: `${viewCapsuleData.from}님의 타임캡슐을 확인해보세요.`,
      url: window.location.href,
    };
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      copyToClipboard(shareData.url);
      setToastMessage('링크가 복사되었습니다.');
    }
  };

  const handleDownloadImage = async () => {
    const element = document.getElementById('capture-target');
    if (!element) return;

    setToastMessage('이미지 저장 중...');

    const capture = (el) => {
      window
        .html2canvas(el, { backgroundColor: '#0f172a' })
        .then((canvas) => {
          const link = document.createElement('a');
          link.download = `timecapsule-${viewCapsuleData.id}.png`;
          link.href = canvas.toDataURL();
          link.click();
          setToastMessage('이미지가 저장되었습니다.');
        })
        .catch((err) => {
          setToastMessage('이미지 저장에 실패했습니다.');
        });
    };

    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      script.onload = () => capture(element);
      document.head.appendChild(script);
    } else {
      capture(element);
    }
  };

  if (loading) {
    return <Loading></Loading>;
  }

  const isOpen = new Date() >= new Date(viewCapsuleData.openDate) || forceUnlock;
  const needsPassword = viewCapsuleData.usePasswordKey && !isUnlocked;

  if (!isOpen) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans">
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors z-20"
        >
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="w-full max-w-sm text-center relative z-10">
          <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
            <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
            <div className="relative w-40 h-40 bg-[#1e293b] rounded-full flex items-center justify-center border-4 border-[#334155] shadow-[0_0_50px_rgba(59,130,246,0.2)] z-10">
              <Lock className="w-16 h-16 text-slate-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-slate-100">
            아직 열 수 없습니다
          </h2>
          <div className="bg-[#1e293b]/80 inline-block px-5 py-2 rounded-full border border-slate-700/50 mb-10 backdrop-blur-sm">
            <p className="text-slate-400 text-sm font-mono">
              개봉:{' '}
              <span className="text-blue-400 font-bold ml-1">
                {formatDate(new Date(viewCapsuleData.openDate))}
              </span>
            </p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(timeLeft).map(([unit, val]) => (
              <div
                key={unit}
                className="bg-[#1e293b]/80 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center shadow-lg backdrop-blur-sm"
              >
                <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">
                  {String(val).padStart(2, '0')}
                </div>
                <div className="text-[9px] text-slate-500 uppercase mt-1 font-bold tracking-wider">
                  {unit}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setForceUnlock(true)}
            className="mt-12 text-[10px] text-slate-600 hover:text-rose-500 transition-colors border border-slate-800 hover:border-rose-500/30 px-3 py-1 rounded bg-slate-900"
          >
            DEV: 즉시 해제 (테스트용)
          </button>
        </div>
      </div>
    );
  }

  if (isDecrypting) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center font-sans">
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        <div className="w-full max-w-xs text-center">
          <div className="mb-8 relative">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Unlock className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-lg font-bold text-emerald-400 mb-2 animate-pulse">
            확인 중...
          </h2>
        </div>
      </div>
    );
  }

  if (needsPassword) {
    return (
      <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans">
        <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        <button
          onClick={() => navigate('/')}
          className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors z-20"
        >
          <ArrowRight className="w-6 h-6 rotate-180" />
        </button>
        <div className="w-full max-w-sm bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-2xl text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
          <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700">
            <KeyRound className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">보안 캡슐</h2>
          <p className="text-slate-400 text-xs mb-8 leading-relaxed">
            이 캡슐은 암호화되어 보호받고 있습니다.
            <br />
            작성자가 설정한 암호키를 입력하여 해제하세요.
          </p>
          <div className="relative mb-2">
            <input
              type={showViewPassword ? 'text' : 'password'}
              value={viewUnlockPassword}
              onChange={(e) => {
                setViewUnlockPassword(e.target.value);
                setUnlockError('');
              }}
              placeholder="암호키 입력"
              className="w-full bg-[#0f172a] border border-slate-600 rounded-xl p-4 pr-12 text-white text-center text-lg focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
            />
            <button
              type="button"
              onClick={() => setShowViewPassword(!showViewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
            >
              {showViewPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {unlockError && (
            <p className="text-xs text-rose-500 mb-4 animate-shake">
              {unlockError}
            </p>
          )}
          <button
            onClick={handleUnlock}
            className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-bold mt-4 shadow-lg shadow-emerald-900/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" /> 잠금 해제
          </button>
        </div>
      </div>
    );
  }

  const openDateObj = new Date(viewCapsuleData.openDate);
  const deletionDate = new Date(openDateObj);
  deletionDate.setFullYear(openDateObj.getFullYear() + 1);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] -z-10"></div>

      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors z-20"
      >
        <ArrowRight className="w-6 h-6 rotate-180" />
      </button>

      <div
        id="capture-target"
        className="w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-700"
      >
        <div className="flex justify-between items-end mb-8 border-b border-slate-700/50 pb-4">
          <span className="text-left text-[10px] text-slate-500 font-bold uppercase tracking-widest block">
            From {viewCapsuleData.from}
          </span>
        </div>

        <div className="mb-8 relative">
          <p className="whitespace-pre-wrap leading-loose text-slate-100 text-sm font-light relative z-10">
            {message}
          </p>
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-slate-700/50 flex-wrap">
          <div className="flex flex-col">
            <div className="flex items-center text-xs text-slate-500">
              <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
              작성일: {formatDate(new Date(viewCapsuleData.createdAt))}
            </div>
            <div className="flex items-center text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              개봉일: {formatDate(new Date(viewCapsuleData.openDate))}
            </div>
            <div className="flex items-center text-xs text-rose-400/80 mt-1">
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              삭제 예정일: {formatDate(deletionDate)} (1년 보관)
            </div>
          </div>

          <button
            onClick={() => {
              copyToClipboard(viewCapsuleData.message);
              setToastMessage('내용이 복사되었습니다.');
            }}
            className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors bg-slate-800 rounded h-fit mt-4"
          >
            <Copy className="w-3 h-3" /> 내용 복사
          </button>
        </div>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3 mt-6">
        <div className="flex gap-3">
          <button
            onClick={handleShareInView}
            className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Share2 className="w-4 h-4" /> 공유하기
          </button>
          <button
            onClick={handleDownloadImage}
            className="flex-1 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"
          >
            <Download className="w-4 h-4" /> 사진 저장
          </button>
        </div>

        {/* <div className="w-full mt-2">
            <AdBanner />
        </div> */}

        <button
          onClick={() => navigate('/')}
          className="w-full py-3.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <Home className="w-4 h-4" /> 홈으로 돌아가기
        </button>
      </div>
    </div>
  );
};

export default View;
