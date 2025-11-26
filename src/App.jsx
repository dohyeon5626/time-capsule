import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, Unlock, Copy, Calendar as CalendarIcon, 
  MessageSquare, User, ArrowRight, Image as ImageIcon,
  Info, Check, X, ChevronRight, Menu, HelpCircle,
  Plus, Trash2, KeyRound, Eye, EyeOff, AlertCircle, 
  Smartphone, Share2, Link as LinkIcon, ChevronLeft, ChevronDown,
  UserCheck, Send, Clock, Sparkles, Rocket, Hourglass, Shield, Home, Download, Camera,
  Mail, Database, BookOpen, Keyboard, Github, AlertTriangle, Star, ThumbsUp
} from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * [API Layer]
 * ------------------------------------------------------------------
 */
const api = {
  createCapsule: async (data) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const id = Math.random().toString(36).substring(2, 11);
        const capsule = { 
            ...data, 
            id, 
            createdAt: new Date().toISOString() 
        };
        
        const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
        capsules.push(capsule);
        localStorage.setItem('capsules', JSON.stringify(capsules));
        
        resolve(id);
      }, 800);
    });
  },
  getCapsule: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
        const found = capsules.find(c => c.id === id);
        resolve(found || null);
      }, 500);
    });
  },
  getStats: async () => {
    const capsules = JSON.parse(localStorage.getItem('capsules') || '[]');
    const now = new Date();
    let waiting = 0;
    let sent = 0;
    capsules.forEach(c => {
      if (new Date(c.openDate) > now) waiting++;
      else sent++;
    });
    return { waiting, sent };
  }
};


// --- Helper Functions ---
const formatDate = (dateInput) => {
  if(!dateInput) return '';
  const date = new Date(dateInput);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatDateSimple = (dateInput) => {
  const date = new Date(dateInput);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  return `${y}-${m}-${d} ${h}:00`;
};

const calculateTimeLeft = (targetDateStr) => {
  const difference = +new Date(targetDateStr) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }
  return timeLeft;
};

const formatPhoneNumber = (value) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, '');
  const length = phoneNumber.length;
  if (length < 4) return phoneNumber;
  if (length < 8) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
};

const isValidPhoneNumber = (phone) => {
    const cleaned = ('' + phone).replace(/\D/g, '');
    return /^01([0|1|6|7|8|9])([0-9]{3,4})([0-9]{4})$/.test(cleaned);
};

const copyToClipboard = (text) => {
  if (!text) return;
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.left = "-9999px";
  textArea.style.top = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('Copy failed', err);
  }
  document.body.removeChild(textArea);
};

// --- Components ---

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

const Loading = () => (
  <div className="flex flex-col items-center justify-center h-screen bg-[#0f172a] text-white">
    <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(37,99,235,0.3)]"></div>
    <p className="text-slate-400 text-sm font-medium tracking-wide animate-pulse">LOADING...</p>
  </div>
);

// Ad Banner Component
const AdBanner = ({ className }) => (
  <div className={`w-full h-20 bg-slate-900/50 border border-slate-800/50 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group transition-colors hover:bg-slate-800/50 ${className}`}>
     <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] group-hover:bg-[position:200%_0,0_0] transition-all duration-1000"></div>
     <span className="text-[10px] text-slate-600 font-medium tracking-widest uppercase mb-1">Advertisement</span>
     <span className="text-xs text-slate-500">광고 영역</span>
  </div>
);

const InputGroup = ({ label, icon: Icon, required, error, children, className, action }) => (
  <div className={`space-y-1.5 ${className}`}>
    <div className="flex justify-between items-end mb-1">
        <label className="flex items-center text-sm font-semibold text-slate-300">
        {Icon && <Icon className="w-4 h-4 mr-1.5 text-blue-400" />}
        {label}
        {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
        {action}
    </div>
    {children}
    {error && <p className="text-xs text-rose-500 flex items-center mt-1"><AlertCircle className="w-3 h-3 mr-1"/> {error}</p>}
  </div>
);

const AutoTextArea = ({ value, onChange, placeholder, className, minHeight = "12rem", id, maxLength }) => {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      // Reset height to shrink if needed
      textareaRef.current.style.height = minHeight; 
      const scrollHeight = textareaRef.current.scrollHeight;
      
      // Always expand to fit content (no max height limit as requested)
      textareaRef.current.style.height = `${Math.max(scrollHeight, parseInt(minHeight))}px`;
      textareaRef.current.style.overflowY = "hidden";
    }
  }, [value, minHeight]);

  return (
    <div className="relative">
        <textarea
        id={id}
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        style={{ minHeight }}
        maxLength={maxLength}
        />
        {maxLength && (
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 bg-slate-900/50 px-2 py-0.5 rounded-full backdrop-blur-sm">
                {value.length} / {maxLength}
            </div>
        )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange, error, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const getInitialHour = () => {
      if (value) return new Date(value).getHours();
      const now = new Date();
      return now.getHours() + 1;
  };
  const [selectedHour, setSelectedHour] = useState(getInitialHour());
  
  useEffect(() => {
      if(value) {
          const d = new Date(value);
          if (!isNaN(d.getTime())) {
            setViewDate(d);
            setSelectedHour(d.getHours());
          }
      }
  }, [value]);

  const displayValue = value ? formatDateSimple(new Date(value)) : '';

  const handleConfirm = () => {
    const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), viewDate.getDate(), selectedHour, 0, 0);
    const today = new Date();
    
    if (selected < today) {
        alert("미래 날짜를 선택해주세요.");
        return;
    }

    const offsetDate = new Date(selected.getTime() - (selected.getTimezoneOffset() * 60000));
    onChange(offsetDate.toISOString().slice(0, 16));
    setIsOpen(false);
  };

  const handleDateClick = (day) => {
      const newDate = new Date(viewDate);
      newDate.setDate(day);
      setViewDate(newDate);
  };

  const changeMonth = (delta) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay(); 
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-9"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const d = new Date(year, month, i);
        const dTime = d.getTime();
        const isPast = dTime < todayStart;
        const isSelected = viewDate.getDate() === i;
        const isToday = now.toDateString() === d.toDateString();

        days.push(
            <button
                key={i}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isPast) handleDateClick(i);
                }}
                disabled={isPast}
                className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm transition-all
                    ${isSelected ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-900/50' : ''}
                    ${isToday && !isSelected ? 'border border-blue-500 text-blue-400' : ''}
                    ${isPast ? 'text-slate-700 cursor-not-allowed' : 'hover:bg-slate-800 text-slate-300'}
                `}
            >
                {i}
            </button>
        );
    }
    return days;
  };

  const renderTimeSlots = () => {
      const slots = [];
      const now = new Date();
      const isToday = viewDate.toDateString() === now.toDateString();
      const currentHour = now.getHours();

      for(let i=0; i<24; i++) {
          const isSelected = selectedHour === i;
          const isPastHour = isToday && i <= currentHour;
          if (isPastHour) continue; 

          slots.push(
              <button 
                key={i}
                onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHour(i);
                }}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium border transition-all
                    ${isSelected 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50' 
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200'}
                `}
              >
                  {String(i).padStart(2, '0')}:00
              </button>
          );
      }
      if (slots.length === 0 && isToday) {
          return <div className="text-xs text-slate-500 w-full text-center py-2">오늘 가능한 시간이 없습니다. 미래 날짜를 선택해주세요.</div>
      }
      return slots;
  };

  return (
    <>
        <div 
            id={id}
            onClick={() => setIsOpen(true)}
            className={`w-full bg-[#1e293b] border ${error ? 'border-rose-500' : 'border-slate-700/50 hover:border-blue-500'} rounded-xl p-3.5 text-white text-sm cursor-pointer flex justify-between items-center transition-all group`}
        >
            <span className={displayValue ? 'text-white font-medium' : 'text-slate-600'}>
                {displayValue || '날짜와 시간을 선택하세요'}
            </span>
            <div className="flex items-center gap-2">
                {displayValue && <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">변경</span>}
                <CalendarIcon className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
        </div>

        {isOpen && (
            <div 
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in"
                onClick={() => setIsOpen(false)}
            >
                <div className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                    <div className="p-4 flex items-center justify-between border-b border-slate-700/50 bg-slate-900/50">
                        <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded"><ChevronLeft className="w-5 h-5 text-slate-400"/></button>
                        <span className="text-white font-bold text-lg">
                            {viewDate.getFullYear()}. {String(viewDate.getMonth() + 1).padStart(2, '0')}
                        </span>
                        <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded"><ChevronRight className="w-5 h-5 text-slate-400"/></button>
                    </div>
                    <div className="overflow-y-auto custom-scrollbar">
                        <div className="p-4 border-b border-slate-700/30">
                            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                                {['일','월','화','수','목','금','토'].map(d => (
                                    <span key={d} className="text-[10px] text-slate-500 font-bold uppercase">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1 place-items-center">
                                {renderCalendar()}
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Clock className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-bold text-white">시간 선택</span>
                            </div>
                            <div className="flex flex-wrap gap-2 justify-start max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                {renderTimeSlots()}
                            </div>
                        </div>
                    </div>
                    <div className="p-4 border-t border-slate-700/50 flex justify-between items-center bg-slate-900/30">
                        <div className="text-xs text-slate-400">
                            {viewDate.getMonth()+1}월 {viewDate.getDate()}일 {selectedHour}시
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors">취소</button>
                            <button onClick={handleConfirm} className="px-5 py-2 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-lg transition-colors">확인</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};


// --- Main App ---
export default function App() {
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('home'); 
  const [loading, setLoading] = useState(true);
  const [isIdModalOpen, setIsIdModalOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false); 
  const [manualId, setManualId] = useState('');
  const [manualIdError, setManualIdError] = useState('');
  const [toastMessage, setToastMessage] = useState(''); 
  
  const [capsuleStats, setCapsuleStats] = useState({ waiting: 0, sent: 0 });

  const [formData, setFormData] = useState({
    from: '',
    senderPhone: '', 
    message: '',
    openDate: '',
    passwordKey: '', 
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({}); 

  const [viewUnlockPassword, setViewUnlockPassword] = useState('');
  const [showViewPassword, setShowViewPassword] = useState(false); // Added state for view password visibility
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [forceUnlock, setForceUnlock] = useState(false);
  const [unlockError, setUnlockError] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false); 

  const [recipients, setRecipients] = useState([
    { name: '', phone: '' }
  ]);
  
  const [createdCapsuleId, setCreatedCapsuleId] = useState(null);
  const [viewCapsuleData, setViewCapsuleData] = useState(null);
  const [timeLeft, setTimeLeft] = useState({});

  // Initialization
  useEffect(() => {
    let uid = localStorage.getItem('tc_uid');
    if (!uid) {
        uid = 'anon_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('tc_uid', uid);
    }
    setUser({ uid });

    api.getStats().then(stats => {
        setCapsuleStats(stats);
        setLoading(false);
    });

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id && !id.includes('/')) {
      fetchCapsule(id);
    }
  }, []);

  useEffect(() => {
    if (view === 'view' && viewCapsuleData) {
      const target = new Date(viewCapsuleData.openDate);
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft(target));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [view, viewCapsuleData]);

  // Clear errors when switching views
  useEffect(() => {
      setErrors({});
  }, [view]);

  const handleCopyToClipboard = (text, msg) => {
      copyToClipboard(text);
      setToastMessage(msg);
  };

  const handleRecipientChange = (index, field, value) => {
    const newRecipients = [...recipients];
    if (field === 'phone') {
        newRecipients[index][field] = formatPhoneNumber(value);
    } else {
        newRecipients[index][field] = value;
    }
    setRecipients(newRecipients);
    if (errors[`recipient_${index}_${field}`]) {
        const newErrors = {...errors};
        delete newErrors[`recipient_${index}_${field}`];
        setErrors(newErrors);
    }
  };

  const addRecipient = () => setRecipients([...recipients, { name: '', phone: '' }]);
  
  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
    }
  };

  const setDateOffset = (type) => {
      const date = new Date();
      switch(type) {
          case '100days': date.setDate(date.getDate() + 100); break;
          case '1year': date.setFullYear(date.getFullYear() + 1); break;
          case 'christmas':
              const currentYear = date.getFullYear();
              const christmas = new Date(currentYear, 11, 25); 
              if (date > christmas) date.setFullYear(currentYear + 1, 11, 25);
              else date.setFullYear(currentYear, 11, 25);
              break;
          default: return;
      }
      date.setHours(9, 0, 0, 0);
      const offsetDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      setFormData(prev => ({ ...prev, openDate: offsetDate.toISOString().slice(0, 16) }));
      if(errors.openDate) setErrors({...errors, openDate: null});
  };

  const handleSendToMe = () => {
      if (!formData.from.trim() || !formData.senderPhone.trim()) {
          setToastMessage("보내는 사람의 이름과 전화번호를 먼저 입력해주세요.");
          return;
      }
      const newRecipients = [...recipients];
      newRecipients[0] = { name: formData.from, phone: formData.senderPhone };
      setRecipients(newRecipients);
      setErrors(prev => { 
          const newErr = { ...prev }; 
          delete newErr.recipient_0_name;
          delete newErr.recipient_0_phone; 
          return newErr; 
      });
  };
  
  const handleShareSite = async () => {
    const url = window.location.origin + window.location.pathname;
    const shareData = {
        title: '메멘토 - 타임캡슐',
        text: '미래로 보내는 당신의 이야기',
        url: url
    };
    if (navigator.share) {
        try { await navigator.share(shareData); } catch (err) { console.log('Share canceled'); }
    } else {
        handleCopyToClipboard(url, "링크가 복사되었습니다.");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let firstErrorId = null;

    const setError = (key, msg, elementId) => {
        newErrors[key] = msg;
        if (!firstErrorId) firstErrorId = elementId;
    };

    // Visual Order
    // 1. Sender
    if (!formData.from.trim()) setError('from', "보내는 사람을 입력해주세요.", 'input-from');
    
    if (!formData.senderPhone.trim()) setError('senderPhone', "전화번호를 입력해주세요.", 'input-senderPhone');
    else if (!isValidPhoneNumber(formData.senderPhone)) setError('senderPhone', "올바른 전화번호 형식이 아닙니다.", 'input-senderPhone');

    // 2. Recipients
    recipients.forEach((r, i) => {
        if (!r.name.trim()) setError(`recipient_${i}_name`, "받는 사람을 입력해주세요.", `input-recipient-${i}-name`);
        
        if (!r.phone.trim()) setError(`recipient_${i}_phone`, "전화번호를 입력해주세요.", `input-recipient-${i}-phone`);
        else if (!isValidPhoneNumber(r.phone)) setError(`recipient_${i}_phone`, "올바른 전화번호 형식이 아닙니다.", `input-recipient-${i}-phone`);
    });

    // 3. Open Date
    if (!formData.openDate) setError('openDate', "개봉 날짜를 선택해주세요.", 'input-openDate');

    // 4. Message
    if (!formData.message.trim()) setError('message', "메시지를 입력해주세요.", 'input-message');
    if (formData.message.length > 3000) setError('message', "메시지는 3000자까지 입력 가능합니다.", 'input-message');

    setErrors(newErrors);

    if (firstErrorId) {
        const element = document.getElementById(firstErrorId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (window.navigator.vibrate) window.navigator.vibrate(200);
    }

    return Object.keys(newErrors).length === 0;
  };

  const createCapsule = async () => {
    if (!validateForm()) {
        return;
    }
    const validRecipients = recipients.filter(r => r.name.trim() && r.phone.trim());
    setLoading(true);
    try {
      const newId = await api.createCapsule({
        type: 'capsule',
        recipients: validRecipients,
        from: formData.from,
        senderPhone: formData.senderPhone,
        message: formData.message,
        openDate: formData.openDate, // Stored as ISO string
        passwordKey: formData.passwordKey,
        // createdAt is handled by server (or mock)
      });
      
      setCreatedCapsuleId(newId);
      setView('success');
    } catch (error) {
      console.error("Error:", error);
      setToastMessage("저장에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCapsule = async (id) => {
    if (!id || typeof id !== 'string' || id.trim() === '') {
        setManualIdError("코드를 입력해주세요.");
        return;
    }
    if (id.includes('/')) {
        setManualIdError("유효하지 않은 문자(/)가 포함되어 있습니다.");
        return;
    }
    setLoading(true);
    try {
      const data = await api.getCapsule(id.trim());
      if (data) {
        setViewCapsuleData({ id: id, ...data });
        setView('view');
        setIsIdModalOpen(false);
        setManualId('');
        setManualIdError('');
        setIsUnlocked(false); 
        setForceUnlock(false);
        setViewUnlockPassword('');
        setUnlockError('');
        setIsDecrypting(false);
        setShowViewPassword(false); // Reset password visibility
      } else {
        setManualIdError("해당 코드를 가진 캡슐을 찾을 수 없습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      setManualIdError("조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = () => {
      if (viewUnlockPassword === viewCapsuleData.passwordKey) {
          setIsDecrypting(true);
          setTimeout(() => {
              setIsDecrypting(false);
              setIsUnlocked(true);
          }, 1500); 
      } else {
          setUnlockError("암호가 일치하지 않습니다.");
          if (window.navigator.vibrate) window.navigator.vibrate(200);
      }
  };

  const shareLink = async () => {
      const shareData = {
          title: 'Time Capsule',
          text: `${formData.from || '누군가'}로부터 타임캡슐이 도착했습니다.`,
          url: `${window.location.origin}${window.location.pathname}?id=${createdCapsuleId}`
      };
      if (navigator.share) {
          try { await navigator.share(shareData); } catch (err) { console.log('Share canceled'); }
      } else {
          handleCopyToClipboard(shareData.url, "링크가 복사되었습니다. 친구에게 공유해보세요!");
      }
  };

  const handleShareInView = async () => {
      if(!viewCapsuleData) return;
      const shareData = {
          title: 'Time Capsule',
          text: `${viewCapsuleData.from}님의 타임캡슐을 확인해보세요.`,
          url: window.location.href
      };
      if (navigator.share) {
          try { await navigator.share(shareData); } catch (err) { console.log('Share canceled'); }
      } else {
          handleCopyToClipboard(shareData.url, "링크가 복사되었습니다.");
      }
  };

  const handleDownloadImage = async () => {
      const element = document.getElementById('capture-target');
      if(!element) return;
      
      setToastMessage("이미지 저장 중...");
      
      // Dynamically load html2canvas
      if (!window.html2canvas) {
          const script = document.createElement('script');
          script.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
          script.onload = () => capture(element);
          document.head.appendChild(script);
      } else {
          capture(element);
      }

      function capture(el) {
          window.html2canvas(el, { backgroundColor: '#0f172a' }).then(canvas => {
              const link = document.createElement('a');
              link.download = `timecapsule-${viewCapsuleData.id}.png`;
              link.href = canvas.toDataURL();
              link.click();
              setToastMessage("이미지가 저장되었습니다.");
          }).catch(err => {
              console.error(err);
              setToastMessage("이미지 저장에 실패했습니다.");
          });
      }
  };

  // --- Render Views ---

  const renderHome = () => (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans relative overflow-hidden">
       <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
       <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] -z-10"></div>
       
       <header className="sticky top-0 z-20 w-full border-b border-slate-800/50 bg-[#0f172a]/95 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex justify-between items-center">
            <button 
                onClick={() => { setIsIdModalOpen(true); setManualId(''); setManualIdError(''); }}
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
                <span className="text-[10px] font-bold text-blue-200 tracking-wide">DIGITAL TIME CAPSULE</span>
            </div>
            <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full w-fit">
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Hourglass className="w-3 h-3 text-amber-400" />
                    <span>Waiting: <strong className="text-white">{capsuleStats.waiting}</strong></span>
                </div>
                <div className="w-px h-3 bg-slate-700"></div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                    <Rocket className="w-3 h-3 text-emerald-400" />
                    <span>Sent: <strong className="text-white">{capsuleStats.sent}</strong></span>
                </div>
            </div>
        </div>

        <h1 className="text-4xl font-extrabold leading-tight mb-4 text-slate-50">
          미래로 보내는<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">당신의 이야기</span>
        </h1>
        <p className="text-slate-400 text-sm leading-relaxed mb-12">
          소중한 추억을 타임캡슐에 안전하게 담아보세요.<br/>
          약속된 그 날, 정확하게 전달해 드립니다.
        </p>

        <div className="mb-12 flex flex-col gap-3">
          <button 
            onClick={() => setView('create')}
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
            {/* AD Placement: Below main content in Home */}
           <div className="mb-4">
             <AdBanner />
           </div>

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
                        <div className="font-bold text-slate-200 text-sm mb-1">철저한 보안 암호화</div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            암호키 설정 시 <strong>AES256 알고리즘</strong>이 적용되어 사용자가 설정한 <strong>암호키</strong> 없이는 복호화가 불가능합니다.<br/>
                            개발자도 볼 수 없는 완벽한 보안을 제공합니다.
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
                        <div className="font-bold text-slate-200 text-sm mb-1">데이터 보관 정책</div>
                        <p className="text-slate-400 text-xs leading-relaxed">
                            개봉 후 <strong>최대 1년 동안 데이터가 보존</strong>되며,<br/>
                            그 이후에는 영구적으로 삭제됩니다.<br/>
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
            이미 캡슐 코드가 있으신가요? <span className="underline underline-offset-4 ml-1">코드 입력하기</span>
        </button>
      </main>

      <footer className="w-full border-t border-slate-800/50 bg-[#0f172a] py-6 mt-auto">
         <div className="max-w-md mx-auto px-6 flex items-center justify-between text-slate-500">
            <a href="mailto:developer@dohyeon5626.com" className="hover:text-blue-400 transition-colors p-2 hover:bg-slate-800 rounded-lg" aria-label="Email">
                <Mail className="w-5 h-5" />
            </a>
            
            <span className="text-xs font-medium tracking-wider opacity-60 hover:opacity-100 transition-opacity cursor-default">dohyeon5626</span>

            <a href="https://github.com/dohyeon5626" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg" aria-label="GitHub">
                <Github className="w-5 h-5" />
            </a>
        </div>
      </footer>

      {isIdModalOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => {
                setIsIdModalOpen(false); 
                setManualId('');
                setManualIdError('');
            }}
        >
          <div 
            className="bg-[#1e293b] sm:rounded-2xl rounded-t-2xl p-6 w-full max-w-sm border-t sm:border border-slate-700 shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-white text-lg">캡슐 열기</h3>
              <button onClick={() => { setIsIdModalOpen(false); setManualIdError(''); setManualId(''); }} className="p-1 hover:bg-slate-700 rounded-full transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <input 
              type="text" 
              value={manualId}
              onChange={(e) => {
                  setManualId(e.target.value);
                  setManualIdError('');
              }}
              placeholder="전달받은 코드를 입력하세요"
              className={`w-full bg-[#0f172a] border ${manualIdError ? 'border-rose-500 focus:border-rose-500' : 'border-slate-600 focus:border-blue-500'} rounded-xl p-4 text-white text-base mb-2 focus:ring-1 outline-none transition-all placeholder:text-slate-600`}
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
              className={`w-full py-4 rounded-xl text-white font-bold text-base shadow-lg transition-transform active:scale-[0.98] ${manualIdError ? 'bg-slate-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
              확인
            </button>
          </div>
        </div>
      )}

      {isGuideOpen && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in"
            onClick={() => setIsGuideOpen(false)}
        >
            <div 
                className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl p-6 relative overflow-y-auto max-h-[80vh] custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={() => setIsGuideOpen(false)}
                    className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    사용 가이드
                </h3>
                
                <div className="space-y-6">
                    {/* Step 1 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold text-sm">1</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">편지 작성</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">미래의 나 혹은 친구에게 전하고 싶은 이야기를 작성합니다. 사진도 함께 담을 수 있습니다.</p>
                        </div>
                    </div>
                    
                    {/* Step 2 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">2</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">봉인 설정</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">캡슐이 열릴 날짜와 시간을 정합니다. 암호키를 설정하면 더욱 안전하게 보관됩니다.</p>
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-sm">3</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">보관 및 공유</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">개봉 날짜가 되면 <strong>받는 사람의 전화번호로 알림톡</strong>이 발송됩니다.</p>
                        </div>
                    </div>

                    {/* Step 4 */}
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 font-bold text-sm">4</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">추억 개봉</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">지정된 시간이 되면 캡슐을 열 수 있습니다. 암호가 설정된 경우 암호키가 필요합니다.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={() => setIsGuideOpen(false)}
                    className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                    확인했습니다
                </button>
            </div>
        </div>
      )}
    </div>
  );

  const renderCreate = () => (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
        <header className="sticky top-0 z-20 w-full border-b border-slate-800/50 bg-[#0f172a]/95 backdrop-blur-sm">
            <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
                <button onClick={() => setView('home')} className="text-slate-400 hover:text-white transition-colors -ml-2 p-2">
                    <ArrowRight className="w-6 h-6 rotate-180" />
                </button>
                <span className="font-bold text-sm tracking-wide">타임캡슐 작성</span>
                <div className="w-8"></div>
            </div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full pb-40">
            <div className="space-y-1 mb-8">
                <h2 className="text-2xl font-bold text-slate-100">미래로 보내는 편지</h2>
                <p className="text-slate-400 text-xs">필수 항목(*)을 모두 입력해주세요.</p>
            </div>

            <div className="space-y-8">
                {/* Sender Section */}
                <div className="space-y-3">
                    <label className="flex items-center text-sm font-semibold text-slate-300">
                        <User className="w-4 h-4 mr-1.5 text-blue-400" />
                        보내는 사람 <span className="text-rose-500 ml-1">*</span>
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        <div className="col-span-2">
                            <input 
                                id="input-from"
                                type="text" 
                                value={formData.from} 
                                onChange={(e) => { setFormData({...formData, from: e.target.value}); if(errors.from) setErrors({...errors, from: null}); }} 
                                className={`w-full bg-[#1e293b] border ${errors.from ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/50 focus:border-blue-500'} rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`} 
                                placeholder="이름" 
                            />
                        </div>
                        <div className="col-span-3">
                            <input 
                                id="input-senderPhone"
                                type="tel" 
                                value={formData.senderPhone} 
                                onChange={(e) => { setFormData({...formData, senderPhone: formatPhoneNumber(e.target.value)}); if(errors.senderPhone) setErrors({...errors, senderPhone: null}); }} 
                                className={`w-full bg-[#1e293b] border ${errors.senderPhone ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/50 focus:border-blue-500'} rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`} 
                                placeholder="010-0000-0000" 
                            />
                        </div>
                    </div>
                    {(errors.from || errors.senderPhone) && 
                      <p className="text-xs text-rose-500 flex items-center mt-1">
                         <AlertCircle className="w-3 h-3 mr-1"/> 
                         {errors.from ? "보내는 사람을 입력해주세요." : errors.senderPhone === "올바른 형식이 아닙니다." ? "올바른 형식이 아닙니다." : "전화번호를 입력해주세요."}
                      </p>
                    }
                </div>
                
                {/* Recipient Section */}
                <div className="space-y-3">
                    <div className="flex justify-between items-end mb-1">
                        <label className="flex items-center text-sm font-semibold text-slate-300"><Send className="w-4 h-4 mr-1.5 text-blue-400" /> 받는 사람 <span className="text-rose-500 ml-1">*</span></label>
                        <div className="flex gap-2">
                            <button onClick={handleSendToMe} className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md hover:bg-emerald-400/20 transition-colors flex items-center gap-1 font-medium"><UserCheck className="w-3 h-3" /> 나에게</button>
                            {recipients.length < 5 && <button onClick={addRecipient} className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md hover:bg-blue-400/20 transition-colors flex items-center gap-1 font-medium"><Plus className="w-3 h-3" /> 추가</button>}
                        </div>
                    </div>
                    <div className="space-y-3">
                        {recipients.map((recipient, index) => (
                            <div key={index} className="animate-fade-in group">
                                <div className="grid grid-cols-5 gap-2">
                                    <div className="col-span-2">
                                        <input 
                                            id={`input-recipient-${index}-name`}
                                            type="text" 
                                            value={recipient.name} 
                                            onChange={(e) => handleRecipientChange(index, 'name', e.target.value)} 
                                            className={`w-full bg-[#1e293b] border ${errors[`recipient_${index}_name`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/50 focus:border-blue-500'} rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`} 
                                            placeholder="이름" 
                                        />
                                    </div>
                                    <div className="col-span-3 relative">
                                        <input 
                                            id={`input-recipient-${index}-phone`}
                                            type="tel" 
                                            value={recipient.phone} 
                                            onChange={(e) => handleRecipientChange(index, 'phone', e.target.value)} 
                                            className={`w-full bg-[#1e293b] border ${errors[`recipient_${index}_phone`] ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/50 focus:border-blue-500'} rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`} 
                                            placeholder="010-0000-0000" 
                                        />
                                        {recipients.length > 1 && <button onClick={() => removeRecipient(index)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>}
                                    </div>
                                </div>
                                {(errors[`recipient_${index}_name`] || errors[`recipient_${index}_phone`]) && (
                                    <p className="text-xs text-rose-500 flex items-center mt-1 ml-1">
                                        <AlertCircle className="w-3 h-3 mr-1"/>
                                        {errors[`recipient_${index}_name`] ? "받는 사람을 입력해주세요." : errors[`recipient_${index}_phone`] === "올바른 형식이 아닙니다." ? "올바른 형식이 아닙니다." : "전화번호를 입력해주세요."}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-start gap-2"><Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" /><p className="text-[11px] text-slate-400 leading-relaxed">개봉 날짜가 되면 입력하신 번호로 <strong>알림톡이 발송됩니다.</strong><br/>(번호는 알림 발송 용도로만 사용됩니다)</p></div>
                    </div>
                </div>
                
                <div id="input-openDate">
                    <InputGroup label="개봉 날짜" icon={CalendarIcon} required error={errors.openDate}>
                        <CustomDatePicker value={formData.openDate} onChange={(iso) => { setFormData({...formData, openDate: iso}); if(errors.openDate) setErrors({...errors, openDate: null}); }} error={errors.openDate} />
                        <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                            <button onClick={() => setDateOffset('100days')} className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded-lg transition-colors">+100일</button>
                            <button onClick={() => setDateOffset('1year')} className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded-lg transition-colors">+1년</button>
                            <button onClick={() => setDateOffset('christmas')} className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-emerald-400/80 rounded-lg transition-colors">다가오는 크리스마스 🎄</button>
                        </div>
                    </InputGroup>
                </div>

                <div className="h-px bg-slate-800/80 my-6"></div>

                <InputGroup label="메시지" icon={MessageSquare} required error={errors.message}>
                    <AutoTextArea id="input-message" value={formData.message} onChange={(e) => { setFormData({...formData, message: e.target.value}); if(errors.message) setErrors({...errors, message: null}); }} placeholder="미래의 나에게, 혹은 소중한 사람에게 전하고 싶은 이야기를 자유롭게 적어주세요." className={`w-full bg-[#1e293b] border ${errors.message ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/50 focus:border-blue-500'} rounded-xl p-4 text-white text-sm outline-none resize-none custom-scrollbar`} maxLength={3000} />
                </InputGroup>

                <div className="bg-[#1e293b]/50 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors"><ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-400" /></div>
                    <h4 className="text-slate-300 text-sm font-semibold mb-1">사진 추가 (선택)</h4>
                    <p className="text-slate-500 text-xs">최대 3장까지 업로드 가능합니다.</p>
                </div>

                <InputGroup label={<>암호키 설정 <span className="text-[10px] text-slate-500 ml-2 font-normal bg-slate-800 px-1.5 py-0.5 rounded">선택사항</span></>} icon={KeyRound} error={errors.passwordKey}>
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={formData.passwordKey} onChange={(e) => { setFormData({...formData, passwordKey: e.target.value}); if(errors.passwordKey) setErrors({...errors, passwordKey: null}); }} className={`w-full bg-[#1e293b] border ${errors.passwordKey ? 'border-rose-500 focus:border-rose-500' : 'border-slate-700/50 focus:border-emerald-500'} rounded-xl py-3.5 pl-4 pr-12 text-white text-sm outline-none`} placeholder="복호화에 사용할 암호" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">{showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                    </div>
                    <div className="mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="flex items-start gap-2"><Lock className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" /><p className="text-[11px] text-slate-400 leading-relaxed">암호키는 <strong>서버에 저장되지 않습니다</strong>. 입력하신 키로 메시지가 암호화되어 저장되므로, 오직 키를 가진 사람만 메시지를 볼 수 있습니다. (키 분실 시 복구 불가)</p></div>
                    </div>
                </InputGroup>
            </div>
            
            <div className="my-8">
               <AdBanner />
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0f172a] via-[#0f172a] to-transparent z-10">
                <div className="max-w-md mx-auto">
                    <p className="text-[10px] text-slate-600 text-center mb-3">
                        한번 묻힌 캡슐은 <strong>수정 및 삭제가 불가능</strong>합니다.
                    </p>
                    <button 
                        onClick={createCapsule}
                        className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-base"
                    >
                        <span>타임캡슐 묻기</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </main>
    </div>
  );

  const renderSuccess = () => (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-6 text-center font-sans relative">
      <div className="absolute top-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px] -z-10"></div>
      <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-emerald-500/50 animate-bounce-short">
        <Check className="w-10 h-10 text-emerald-500" />
      </div>
      <h2 className="text-3xl font-bold mb-3 text-slate-100">전송 완료!</h2>
      <p className="text-slate-400 text-sm mb-10 leading-relaxed max-w-xs mx-auto">
        타임캡슐이 안전하게 묻혔습니다.<br/>
        <span className="text-emerald-400 font-semibold">{formatDate(new Date(formData.openDate))}</span>에<br/>
        {recipients.length > 0 ? <span className="text-white font-bold">{recipients.length}명</span> : <span className="text-slate-400">지정된 수신자</span>}에게 알림톡이 전송됩니다.
      </p>
      
      {!formData.passwordKey && (
          <div className="w-full max-w-xs bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                  <div className="text-amber-400 font-bold text-xs mb-1">보안 주의</div>
                  <p className="text-amber-200/70 text-[11px] leading-relaxed">암호키를 설정하지 않았으므로, <strong>캡슐 코드만 있으면 누구나</strong> 내용을 볼 수 있습니다. 코드 공유 시 유의해주세요.</p>
              </div>
          </div>
      )}

      <div className="w-full max-w-xs bg-[#1e293b] border border-slate-700 rounded-2xl p-6 mb-4 relative group cursor-pointer hover:border-blue-500/50 transition-all shadow-xl"
        onClick={() => handleCopyToClipboard(createdCapsuleId, "캡슐 코드가 복사되었습니다.")}
      >
        <div className="text-xs text-slate-500 mb-2 text-left font-medium uppercase tracking-wider">캡슐 코드</div>
        <div className="font-mono text-xl font-bold text-blue-400 break-all">{createdCapsuleId}</div>
        <div className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-slate-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white text-slate-500 transition-colors">
            <Copy className="w-5 h-5" />
        </div>
      </div>

      <button onClick={shareLink} className="w-full max-w-xs py-3.5 mb-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg">
        <Share2 className="w-4 h-4" />
        링크로 공유하기
      </button>
      
      <div className="w-full max-w-xs mb-4">
         <AdBanner />
      </div>

      <button onClick={() => { setFormData({from:'', senderPhone: '', message:'', openDate:'', passwordKey:''}); setRecipients([{name:'', phone:''}]); setErrors({}); setView('home'); }} className="w-full max-w-xs py-3.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:text-white hover:bg-slate-800 transition-colors">
        홈으로 돌아가기
      </button>
    </div>
  );

  // Unlocked View (Updated)
  const renderUnlocked = () => {
      // Calculate deletion date
      const openDateObj = new Date(viewCapsuleData.openDate);
      const deletionDate = new Date(openDateObj);
      deletionDate.setFullYear(openDateObj.getFullYear() + 1);

      return (
          <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] -z-10"></div>
             <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] -z-10"></div>

             <button 
                onClick={() => setView('home')} 
                className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors z-20"
            >
                <ArrowRight className="w-6 h-6 rotate-180" />
            </button>

            <div id="capture-target" className="w-full max-w-md bg-[#1e293b] border border-slate-700 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500"></div>
                
                <div className="flex justify-between items-end mb-8 border-b border-slate-700/50 pb-6">
                    <div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">To</span>
                        <div className="flex flex-col gap-1.5">
                            {viewCapsuleData.recipients?.length > 0 ? (
                                viewCapsuleData.recipients.map((r, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center border border-slate-600">
                                            <User className="w-4 h-4 text-slate-300"/>
                                        </div>
                                        <div>
                                            <span className="text-sm font-bold text-slate-200 block">{r.name}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <span className="text-xl font-bold text-slate-400">나에게</span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">From</span>
                        <div className="inline-flex items-center bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/50">
                                <span className="text-sm text-white font-bold">{viewCapsuleData.from}</span>
                        </div>
                    </div>
                </div>

                {/* Content Area - Removed max height and scroll */}
                <div className="mb-8 relative">
                    <p className="whitespace-pre-wrap leading-loose text-slate-100 text-sm font-light relative z-10">
                        {viewCapsuleData.message}
                    </p>
                </div>
                
                <div className="flex items-end justify-between pt-4 border-t border-slate-700/50 mb-6">
                    <div className="flex flex-col gap-1">
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
                    
                    {/* Copy Button (Moved to Bottom Right) */}
                    <button 
                        onClick={() => handleCopyToClipboard(viewCapsuleData.message, "내용이 복사되었습니다.")}
                        className="text-[10px] flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors bg-slate-800 px-2 py-1 rounded h-fit"
                    >
                        <Copy className="w-3 h-3" /> 내용 복사
                    </button>
                </div>
            </div>

            <div className="w-full max-w-md flex flex-col gap-3 mt-6">
                <div className="flex gap-3">
                    <button onClick={handleShareInView} className="flex-1 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"><Share2 className="w-4 h-4" /> 공유하기</button>
                    <button onClick={handleDownloadImage} className="flex-1 py-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors shadow-lg"><Download className="w-4 h-4" /> 사진 저장</button>
                </div>
                
                <div className="w-full mt-2">
                    <AdBanner />
                </div>
                
                <button onClick={() => setView('home')} className="w-full py-3.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"><Home className="w-4 h-4" /> 홈으로 돌아가기</button>
            </div>
          </div>
      );
  };

  const renderView = () => {
    if (!viewCapsuleData) return null;
    const isOpen = new Date() >= new Date(viewCapsuleData.openDate) || forceUnlock;
    const needsPassword = viewCapsuleData.passwordKey && !isUnlocked;

    if (!isOpen) { // Locked State
        return (
            <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans">
                <button onClick={() => setView('home')} className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors z-20"><ArrowRight className="w-6 h-6 rotate-180" /></button>
                <div className="w-full max-w-sm text-center relative z-10">
                    <div className="relative w-48 h-48 mx-auto mb-12 flex items-center justify-center">
                        <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping opacity-75"></div>
                        <div className="absolute inset-0 bg-blue-500/10 rounded-full animate-pulse"></div>
                        <div className="relative w-40 h-40 bg-[#1e293b] rounded-full flex items-center justify-center border-4 border-[#334155] shadow-[0_0_50px_rgba(59,130,246,0.2)] z-10">
                            <Lock className="w-16 h-16 text-slate-400" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-slate-100">아직 열 수 없습니다</h2>
                    <div className="bg-[#1e293b]/80 inline-block px-5 py-2 rounded-full border border-slate-700/50 mb-10 backdrop-blur-sm">
                        <p className="text-slate-400 text-sm font-mono">개봉: <span className="text-blue-400 font-bold ml-1">{formatDate(new Date(viewCapsuleData.openDate))}</span></p>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        {Object.entries(timeLeft).map(([unit, val]) => (
                            <div key={unit} className="bg-[#1e293b]/80 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center shadow-lg backdrop-blur-sm">
                                <div className="text-2xl font-bold font-mono text-blue-400 tabular-nums">{String(val).padStart(2, '0')}</div>
                                <div className="text-[9px] text-slate-500 uppercase mt-1 font-bold tracking-wider">{unit}</div>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => setForceUnlock(true)} className="mt-12 text-[10px] text-slate-600 hover:text-rose-500 transition-colors border border-slate-800 hover:border-rose-500/30 px-3 py-1 rounded bg-slate-900">DEV: 즉시 해제 (테스트용)</button>
                </div>
            </div>
        );
    }

    if (isDecrypting) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center font-sans">
                <div className="w-full max-w-xs text-center">
                    <div className="mb-8 relative">
                        <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 flex items-center justify-center"><Unlock className="w-6 h-6 text-emerald-500" /></div>
                    </div>
                    <h2 className="text-lg font-bold text-emerald-400 mb-2 animate-pulse">확인 중...</h2>
                </div>
            </div>
        );
    }

    if (needsPassword) {
        return (
            <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans">
                 <button onClick={() => setView('home')} className="absolute top-6 left-6 text-slate-400 hover:text-white p-2 bg-slate-800/50 rounded-full transition-colors z-20"><ArrowRight className="w-6 h-6 rotate-180" /></button>
                <div className="w-full max-w-sm bg-[#1e293b] p-8 rounded-3xl border border-slate-700 shadow-2xl text-center animate-in zoom-in-95 duration-300 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500"></div>
                    <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-slate-700"><KeyRound className="w-10 h-10 text-emerald-400" /></div>
                    <h2 className="text-xl font-bold mb-2">보안 캡슐</h2>
                    <p className="text-slate-400 text-xs mb-8 leading-relaxed">이 캡슐은 암호화되어 보호받고 있습니다.<br/>작성자가 설정한 암호키를 입력하여 해제하세요.</p>
                    <div className="relative mb-2">
                        <input type={showViewPassword ? "text" : "password"} value={viewUnlockPassword} onChange={(e) => { setViewUnlockPassword(e.target.value); setUnlockError(''); }} placeholder="암호키 입력" className="w-full bg-[#0f172a] border border-slate-600 rounded-xl p-4 pr-12 text-white text-center text-lg focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700" />
                        <button type="button" onClick={() => setShowViewPassword(!showViewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1">{showViewPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}</button>
                    </div>
                    {unlockError && <p className="text-xs text-rose-500 mb-4 animate-shake">{unlockError}</p>}
                    <button onClick={handleUnlock} className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-xl text-white font-bold mt-4 shadow-lg shadow-emerald-900/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2"><Unlock className="w-4 h-4" /> 잠금 해제</button>
                </div>
            </div>
        );
    }

    return renderUnlocked();
  };

  if (loading) return <Loading />;

  return (
    <div className="font-sans antialiased selection:bg-blue-500/30 selection:text-blue-100">
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        .animate-bounce-short { animation: bounce-short 2s infinite; }
        @keyframes bounce-short { 0%, 100% { transform: translateY(-5%); } 50% { transform: translateY(0); } }
        
        /* Global Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #0f172a; 
        }
        ::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
        
        /* Firefox */
        * {
          scrollbar-width: thin;
          scrollbar-color: #334155 #0f172a;
        }

        /* Utility Classes */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #475569; border-radius: 4px; }
        
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      
      {view === 'home' && renderHome()}
      {view === 'create' && renderCreate()}
      {view === 'success' && renderSuccess()}
      {view === 'view' && renderView()}
    </div>
  );
}