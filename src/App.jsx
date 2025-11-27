import React, { useState, useEffect } from 'react';
import { api } from './api';
import { 
  formatPhoneNumber, isValidPhoneNumber, copyToClipboard, calculateTimeLeft, formatDate
} from './utils/helpers';

import Loading from './components/Loading';
import Toast from './components/Toast';
import Home from './components/Home';
import Create from './components/Create';
import Success from './components/Success';
import View from './components/View';
import IdModal from './components/IdModal';
import GuideModal from './components/GuideModal';


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
  const [errors, setErrors] = useState({}); 

  const [recipients, setRecipients] = useState([
    { name: '', phone: '' }
  ]);
  
  const [createdCapsuleId, setCreatedCapsuleId] = useState(null);
  const [viewCapsuleData, setViewCapsuleData] = useState(null);

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

  const validateForm = () => {
    const newErrors = {};
    let firstErrorId = null;

    const setError = (key, msg, elementId) => {
        newErrors[key] = msg;
        if (!firstErrorId) firstErrorId = elementId;
    };

    if (!formData.from.trim()) setError('from', "보내는 사람을 입력해주세요.", 'input-from');
    
    if (!formData.senderPhone.trim()) setError('senderPhone', "전화번호를 입력해주세요.", 'input-senderPhone');
    else if (!isValidPhoneNumber(formData.senderPhone)) setError('senderPhone', "올바른 전화번호 형식이 아닙니다.", 'input-senderPhone');

    recipients.forEach((r, i) => {
        if (!r.name.trim()) setError(`recipient_${i}_name`, "받는 사람을 입력해주세요.", `input-recipient-${i}-name`);
        
        if (!r.phone.trim()) setError(`recipient_${i}_phone`, "전화번호를 입력해주세요.", `input-recipient-${i}-phone`);
        else if (!isValidPhoneNumber(r.phone)) setError(`recipient_${i}_phone`, "올바른 전화번호 형식이 아닙니다.", `input-recipient-${i}-phone`);
    });

    if (!formData.openDate) setError('openDate', "개봉 날짜를 선택해주세요.", 'input-openDate');

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
        openDate: formData.openDate,
        passwordKey: formData.passwordKey,
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

  const renderContent = () => {
    switch (view) {
      case 'create':
        return <Create 
          setView={setView}
          formData={formData}
          setFormData={setFormData}
          recipients={recipients}
          handleRecipientChange={handleRecipientChange}
          addRecipient={addRecipient}
          removeRecipient={removeRecipient}
          errors={errors}
          setErrors={setErrors}
          setDateOffset={setDateOffset}
          handleSendToMe={handleSendToMe}
          createCapsule={createCapsule}
        />;
      case 'success':
        return <Success
          formData={formData}
          recipients={recipients}
          createdCapsuleId={createdCapsuleId}
          handleCopyToClipboard={handleCopyToClipboard}
          shareLink={shareLink}
          setFormData={setFormData}
          setRecipients={setRecipients}
          setErrors={setErrors}
          setView={setView}
        />;
      case 'view':
        return <View
          viewCapsuleData={viewCapsuleData}
          setView={setView}
          handleCopyToClipboard={handleCopyToClipboard}
          handleShareInView={handleShareInView}
          handleDownloadImage={handleDownloadImage}
        />;
      case 'home':
      default:
        return <Home
          capsuleStats={capsuleStats}
          setView={setView}
          setIsIdModalOpen={setIsIdModalOpen}
          setIsGuideOpen={setIsGuideOpen}
        />;
    }
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

      <GuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      {renderContent()}
    </div>
  );
}
