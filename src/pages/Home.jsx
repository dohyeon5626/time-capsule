import { useState, useEffect } from 'react';
import {
  ArrowRight,
  BookOpen,
  Database,
  Github,
  Hourglass,
  Info,
  KeyRound,
  Keyboard,
  Mail,
  Rocket,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import GuideModal from '../components/GuideModal';
import IdModal from '../components/IdModal';
import Toast from '../components/Toast';
import { copyToClipboard } from '../etc/helpers';
import { getStatsRequest } from '../etc/api';

const Home = () => {
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualIdError, setManualIdError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [waitingCount, setWaitingCount] = useState(0);
  const [sentCount, setSentCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setIsIdModalOpen(true);
      setManualIdError(location.state.message);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    getStatsRequest()
      .then(data => {
        setWaitingCount(data.waiting);
        setSentCount(data.sent);
      });
  }, []);

  const fetchCapsule = (id) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
      setManualIdError('코드를 입력해주세요.');
      return;
    }
    if (id.includes('/')) {
      setManualIdError('유효하지 않은 문자(/)가 포함되어 있습니다.');
      return;
    }
    navigate(`/view?id=${id.trim()}`);
  };

  const handleShareSite = async () => {
    const url = window.location.origin + window.location.pathname;
    const shareData = {
      title: 'Time Capsule',
      url: url,
    };
    if (window.navigator.share) {
      await window.navigator.share(shareData);
    } else {
      copyToClipboard(url);
      setToastMessage('링크가 복사되었습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans relative overflow-hidden">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />

      <IdModal
        isOpen={isIdModalOpen}
        onClose={() => {
          setIsIdModalOpen(false);
          setManualId('');
          setManualIdError('');
        }}
        manualId={manualId}
        setManualId={setManualId}
        manualIdError={manualIdError}
        setManualIdError={setManualIdError}
        fetchCapsule={fetchCapsule}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] -z-10"></div>

      <header className="sticky top-0 z-20 w-full border-b border-slate-800/50 bg-[#0f172a]/95 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => {
              setIsIdModalOpen(true);
            }}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-slate-800/50"
          >
            <Keyboard className="w-4 h-4" />
            <span>코드 입력하기</span>
          </button>

          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-full hover:bg-slate-800/50"
          >
            <BookOpen className="w-4 h-4" />
            <span>사용 가이드</span>
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 flex flex-col justify-center max-w-md mx-auto w-full pt-10 pb-6 z-10">
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/30 border border-blue-500/20 rounded-full w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-[10px] font-bold text-blue-200 tracking-wide">
              DIGITAL TIME CAPSULE
            </span>
          </div>
          { waitingCount != 0 || sentCount != 0 ? <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full w-fit">
            { waitingCount != 0 ? <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Hourglass className="w-3 h-3 text-amber-400" />
              <span>
                Waiting: <strong className="text-white">{waitingCount}</strong>
              </span>
            </div> : null }
            { waitingCount != 0 && sentCount != 0 ? <div className="w-px h-3 bg-slate-700"></div> : null}
            { sentCount != 0 ? <div className="flex items-center gap-1 text-[10px] text-slate-400">
              <Rocket className="w-3 h-3 text-emerald-400" />
              <span>
                Sent: <strong className="text-white">{sentCount}</strong>
              </span>
            </div> : null }
          </div> : null }
        </div>

        <h1 className="text-4xl font-extrabold leading-tight mb-4 text-slate-50">
          미래로 보내는
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            당신의 이야기
          </span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-12">
          소중한 추억을 타임캡슐에 안전하게 담아보세요.
          <br />
          약속된 그 날, 정확하게 전달해 드립니다.
        </p>

        <div className="mb-12 flex flex-col gap-3">
          <button
            onClick={() => navigate('/new')}
            className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] text-lg flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="relative z-10">타임캡슐 만들기</span>
            <ArrowRight className="relative z-10 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={handleShareSite}
            className="w-full py-3 rounded-2xl border border-slate-700 hover:bg-slate-800/50 text-slate-300 text-sm font-bold flex items-center justify-center gap-2 transition-colors"
          >
            친구에게 추천하기
          </button>
        </div>

        <div className="mt-auto">
          {/* <div className="mb-4">
             <AdBanner />
           </div> */}

          <h3 className="text-slate-200 font-bold text-base mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-500" />
            시작하기 전 안내
          </h3>
          <div className="flex flex-col gap-3">
            <div className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 flex flex-col items-start gap-1 hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg shrink-0">
                  <KeyRound className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm mb-1">
                    철저한 보안 암호화
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    암호키 설정 시 <strong>AES 알고리즘</strong>이 적용되어
                    사용자가 설정한 <strong>암호키</strong> 없이는 복호화가
                    불가능합니다. (메시지, 사진 암호화)<br />
                    서버에 암호키를 저장하지 않기 때문에, <br/>
                    <strong className="text-emerald-400">키를 분실하시면 복구가 불가능합니다.</strong> 안전하게 보관해 주세요.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-[#1e293b]/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-5 flex flex-col items-start gap-1 hover:border-slate-600 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg shrink-0">
                  <Database className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <div className="font-bold text-slate-200 text-sm mb-1">
                    데이터 보관 정책
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    개봉 후 <strong>최대 10년 동안 데이터가 보존</strong>되며,
                    <br />
                    그 이후에는 영구적으로 삭제됩니다.
                    <br />
                    간직하고 싶다면, 보존 기간 내에 다운로드해주세요.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsIdModalOpen(true)}
          className="mt-6 py-2 text-slate-500 text-xs text-center hover:text-slate-300 transition-colors"
        >
          이미 캡슐 코드가 있으신가요?{' '}
          <span className="underline underline-offset-4 ml-1">
            코드 입력하기
          </span>
        </button>
      </main>

      <footer className="w-full border-t border-slate-800/50 bg-[#0f172a] py-6 mt-auto">
        <div className="max-w-md mx-auto px-6 flex items-center justify-between text-slate-500">
          <a
            href="mailto:time-capsule@dohyeon5626.com"
            className="hover:text-blue-400 transition-colors p-2 hover:bg-slate-800 rounded-lg"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>

          <span className="text-xs font-medium tracking-wider opacity-60 hover:opacity-100 transition-opacity cursor-default">
            dohyeon5626
          </span>

          <a
            href="https://github.com/dohyeon5626/time-capsule"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Home;
