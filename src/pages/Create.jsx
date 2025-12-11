import { useState, useRef } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CalendarIcon,
  Eye,
  EyeOff,
  ImageIcon,
  Info,
  KeyRound,
  Lock,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  User,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import CryptoJS from 'crypto-js';
import AutoTextArea from '../components/AutoTextArea';
import CustomDatePicker from '../components/CustomDatePicker';
import InputGroup from '../components/InputGroup';
import Toast from '../components/Toast';
import Loading from '../components/Loading';
import { createCapsuleRequest } from '../etc/api';
import { formatPhoneNumber, isValidPhoneNumber, reSizeImageUrl, fileToDataURL, b64ToBlob } from '../etc/helpers';

const Create = () => {
  const [toastMessage, setToastMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    from: '',
    senderPhone: '',
    message: '',
    openDate: '',
    passwordKey: '',
  });
  const fileInputRef = useRef(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [recipients, setRecipients] = useState([{ name: '', phone: '' }]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (uploadedImageUrl) {
      setUploadedImageUrl(null);
      return;
    }
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size < 40960) {
        setUploadedImageUrl(await fileToDataURL(file));
        setUploadedImageFile(file);
      } else {
        setUploadedImageUrl(await reSizeImageUrl(file));
      }
    }
  }

  const handleRecipientChange = (index, field, value) => {
    const newRecipients = [...recipients];
    if (field === 'phone') {
      newRecipients[index][field] = formatPhoneNumber(value);
    } else {
      newRecipients[index][field] = value;
    }
    setRecipients(newRecipients);
    if (errors[`recipient_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`recipient_${index}_${field}`];
      setErrors(newErrors);
    }
  };

  const addRecipient = () =>
    setRecipients([...recipients, { name: '', phone: '' }]);

  const removeRecipient = (index) => {
    if (recipients.length > 1) {
      const newRecipients = recipients.filter((_, i) => i !== index);
      setRecipients(newRecipients);
    }
  };

  const setDateOffset = (type) => {
    const date = new Date();
    switch (type) {
      case '100days':
        date.setDate(date.getDate() + 100);
        break;
      case '1year':
        date.setFullYear(date.getFullYear() + 1);
        break;
      case 'new-year':
        date.setFullYear(date.getFullYear() + 1, 0, 1);
        break;
      case 'christmas':
        date.setFullYear(date.getFullYear() + 1, 11, 25);
        break;
      default:
        return;
    }
    date.setHours(9, 0, 0, 0);
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    setFormData((prev) => ({
      ...prev,
      openDate: offsetDate.toISOString().slice(0, 16),
    }));
    if (errors.openDate) setErrors({ ...errors, openDate: null });
  };

  const handleSendToMe = () => {
    if (!formData.from.trim() || !formData.senderPhone.trim()) {
      setToastMessage('보내는 사람의 이름과 전화번호를 먼저 입력해주세요.');
      return;
    }
    const newRecipients = [...recipients];
    newRecipients[0] = { name: formData.from, phone: formData.senderPhone };
    setRecipients(newRecipients);
    setErrors((prev) => {
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

    if (!formData.from.trim())
      setError('from', '보내는 사람을 입력해주세요.', 'input-from');

    if (!formData.senderPhone.trim())
      setError('senderPhone', '전화번호를 입력해주세요.', 'input-senderPhone');
    else if (!isValidPhoneNumber(formData.senderPhone))
      setError(
        'senderPhone',
        '올바른 전화번호 형식이 아닙니다.',
        'input-senderPhone'
      );

    recipients.forEach((r, i) => {
      if (!r.name.trim())
        setError(
          `recipient_${i}_name`,
          '받는 사람을 입력해주세요.',
          `input-recipient-${i}-name`
        );

      if (!r.phone.trim())
        setError(
          `recipient_${i}_phone`,
          '전화번호를 입력해주세요.',
          `input-recipient-${i}-phone`
        );
      else if (!isValidPhoneNumber(r.phone))
        setError(
          `recipient_${i}_phone`,
          '올바른 전화번호 형식이 아닙니다.',
          `input-recipient-${i}-phone`
        );
    });

    if (!formData.openDate)
      setError('openDate', '개봉 날짜를 선택해주세요.', 'input-openDate');

    if (!formData.message.trim())
      setError('message', '메시지를 입력해주세요.', 'input-message');
    if (formData.message.length > 3000)
      setError('message', '메시지는 3000자까지 입력 가능합니다.', 'input-message');

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
    setLoading(true);
    const validRecipients = recipients.filter(
      (r) => r.name.trim() && r.phone.trim()
    );
    try {
      const reqFormData = new FormData();
      reqFormData.append("recipients", JSON.stringify(validRecipients));
      reqFormData.append("senderName", formData.from);
      reqFormData.append("senderPhone", formData.senderPhone);
      reqFormData.append("message", formData.message);
      reqFormData.append("openDate", formData.openDate);
      reqFormData.append("usePasswordKey", Boolean(formData.passwordKey));
      if (uploadedImageUrl) {
        reqFormData.append('originalHeader', uploadedImageUrl.split(',')[0]);
        if(uploadedImageFile) {
          reqFormData.append("image", uploadedImageFile);
        } else {
          if (formData.passwordKey) {
            const imageCiphertext = CryptoJS.AES.encrypt(uploadedImageUrl.split(',')[1], formData.passwordKey).toString();
            reqFormData.append('image', b64ToBlob(imageCiphertext), 'encrypted_original.dat');
          } else {
            reqFormData.append('image', b64ToBlob(uploadedImageUrl.split(',')[1]), 'resized_image.jpeg');
          }
        }
      }

      const createdCapsuleId = await createCapsuleRequest(reqFormData);
      navigate('/complete', {
        replace: true,
        state: { formData, recipients, createdCapsuleId },
      });
    } catch (error) {
      setLoading(false);
      setToastMessage('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  if(loading) {
    return <Loading></Loading>
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans">
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <header className="sticky top-0 z-20 w-full border-b border-slate-800/50 bg-[#0f172a]/95 backdrop-blur-sm">
        <div className="max-w-md mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-400 hover:text-white transition-colors -ml-2 p-2"
          >
            <ArrowRight className="w-6 h-6 rotate-180" />
          </button>
          <span className="font-bold text-sm tracking-wide">타임캡슐 작성</span>
          <div className="w-8"></div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8 max-w-md mx-auto w-full pb-40">
        <div className="space-y-1 mb-8">
          <h2 className="text-2xl font-bold text-slate-100">
            미래로 보내는 편지
          </h2>
          <p className="text-slate-400 text-xs">필수 항목(*)을 모두 입력해주세요.</p>
        </div>

        <div className="space-y-8">
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
                  onChange={(e) => {
                    setFormData({ ...formData, from: e.target.value });
                    if (errors.from) setErrors({ ...errors, from: null });
                  }}
                  className={`w-full bg-[#1e293b] border ${
                    errors.from
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-700/50 focus:border-blue-500'
                  } rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`}
                  placeholder="이름"
                />
              </div>
              <div className="col-span-3">
                <input
                  id="input-senderPhone"
                  type="tel"
                  value={formData.senderPhone}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      senderPhone: formatPhoneNumber(e.target.value),
                    });
                    if (errors.senderPhone)
                      setErrors({ ...errors, senderPhone: null });
                  }}
                  className={`w-full bg-[#1e293b] border ${
                    errors.senderPhone
                      ? 'border-rose-500 focus:border-rose-500'
                      : 'border-slate-700/50 focus:border-blue-500'
                  } rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`}
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
            {(errors.from || errors.senderPhone) && (
              <p className="text-xs text-rose-500 flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.from
                  ? '보내는 사람을 입력해주세요.'
                  : errors.senderPhone === '올바른 형식이 아닙니다.'
                  ? '올바른 형식이 아닙니다.'
                  : '전화번호를 입력해주세요.'}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-end mb-1">
              <label className="flex items-center text-sm font-semibold text-slate-300">
                <Send className="w-4 h-4 mr-1.5 text-blue-400" /> 받는 사람{' '}
                <span className="text-rose-500 ml-1">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSendToMe}
                  className="text-xs text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md hover:bg-emerald-400/20 transition-colors flex items-center gap-1 font-medium"
                >
                  <UserCheck className="w-3 h-3" /> 나에게
                </button>
                {recipients.length < 5 && (
                  <button
                    onClick={addRecipient}
                    className="text-xs text-blue-400 bg-blue-400/10 px-2 py-1 rounded-md hover:bg-blue-400/20 transition-colors flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3 h-3" /> 추가
                  </button>
                )}
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
                        onChange={(e) =>
                          handleRecipientChange(index, 'name', e.target.value)
                        }
                        className={`w-full bg-[#1e293b] border ${
                          errors[`recipient_${index}_name`]
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-700/50 focus:border-blue-500'
                        } rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`}
                        placeholder="이름"
                      />
                    </div>
                    <div className="col-span-3 relative">
                      <input
                        id={`input-recipient-${index}-phone`}
                        type="tel"
                        value={recipient.phone}
                        onChange={(e) =>
                          handleRecipientChange(index, 'phone', e.target.value)
                        }
                        className={`w-full bg-[#1e293b] border ${
                          errors[`recipient_${index}_phone`]
                            ? 'border-rose-500 focus:border-rose-500'
                            : 'border-slate-700/50 focus:border-blue-500'
                        } rounded-xl p-3.5 text-white text-sm outline-none placeholder-slate-600 transition-all`}
                        placeholder="010-0000-0000"
                      />
                      {recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  {(errors[`recipient_${index}_name`] ||
                    errors[`recipient_${index}_phone`]) && (
                    <p className="text-xs text-rose-500 flex items-center mt-1 ml-1">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors[`recipient_${index}_name`]
                        ? '받는 사람을 입력해주세요.'
                        : errors[`recipient_${index}_phone`] ===
                          '올바른 형식이 아닙니다.'
                        ? '올바른 형식이 아닙니다.'
                        : '전화번호를 입력해주세요.'}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  개봉 날짜가 되면 입력하신 번호로{' '}
                  <strong>알림톡이 발송됩니다.</strong>
                  <br />
                  (번호는 알림 발송 용도로만 사용됩니다)
                </p>
              </div>
            </div>
          </div>

          <div id="input-openDate">
            <InputGroup
              label="개봉 날짜"
              icon={CalendarIcon}
              required
              error={errors.openDate}
            >
              <CustomDatePicker
                value={formData.openDate}
                onChange={(iso) => {
                  setFormData({ ...formData, openDate: iso });
                  if (errors.openDate) setErrors({ ...errors, openDate: null });
                }}
                error={errors.openDate}
              />
              <div className="flex gap-2 mt-2 overflow-x-auto pb-1 no-scrollbar">
                <button
                  onClick={() => setDateOffset('100days')}
                  className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
                >
                  +100일
                </button>
                <button
                  onClick={() => setDateOffset('1year')}
                  className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 rounded-lg transition-colors"
                >
                  +1년
                </button>
                <button
                  onClick={() => setDateOffset('new-year')}
                  className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded-lg transition-colors"
                >
                  {new Date().getFullYear() + 1}년 새해 ☀️
                </button>
                <button
                  onClick={() => setDateOffset('christmas')}
                  className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs rounded-lg transition-colors"
                >
                  {new Date().getFullYear() + 1}년 크리스마스 🎄
                </button>
              </div>
            </InputGroup>
          </div>

          <div className="h-px bg-slate-800/80 my-6"></div>

          <InputGroup
            label="메시지"
            icon={MessageSquare}
            required
            error={errors.message}
          >
            <AutoTextArea
              id="input-message"
              value={formData.message}
              onChange={(e) => {
                setFormData({ ...formData, message: e.target.value });
                if (errors.message) setErrors({ ...errors, message: null });
              }}
              placeholder="미래의 나에게, 혹은 소중한 사람에게 전하고 싶은 이야기를 자유롭게 적어주세요."
              className={`w-full bg-[#1e293b] border ${
                errors.message
                  ? 'border-rose-500 focus:border-rose-500'
                  : 'border-slate-700/50 focus:border-blue-500'
              } rounded-xl p-4 text-white text-sm outline-none resize-none custom-scrollbar`}
              maxLength={3000}
            />
          </InputGroup>

          {uploadedImageUrl ? 
            <div onClick={handleClick} className="bg-[#1e293b]/50 border border-slate-700 hover:border-slate-500 rounded-xl flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
              <img 
                src={uploadedImageUrl} 
                alt="File Preview" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>:
            <div onClick={handleClick} className="bg-[#1e293b]/50 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors cursor-pointer group">
              <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:bg-slate-700 transition-colors">
                <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
              </div>
              <h4 className="text-slate-300 text-sm font-semibold mb-1">
                사진 추가 (선택)
              </h4>
              <p className="text-slate-500 text-xs">최대 1장까지 업로드 가능합니다.</p>
            </div>
          }
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

          <InputGroup
            label={
              <>
                암호키 설정{' '}
                <span className="text-[10px] text-slate-500 ml-2 font-normal bg-slate-800 px-1.5 py-0.5 rounded">
                  선택사항
                </span>
              </>
            }
            icon={KeyRound}
            error={errors.passwordKey}
          >
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.passwordKey}
                onChange={(e) => {
                  setFormData({ ...formData, passwordKey: e.target.value });
                  if (errors.passwordKey)
                    setErrors({ ...errors, passwordKey: null });
                }}
                className={`w-full bg-[#1e293b] border ${
                  errors.passwordKey
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-slate-700/50 focus:border-emerald-500'
                } rounded-xl py-3.5 pl-4 pr-12 text-white text-sm outline-none`}
                placeholder="복호화에 사용할 암호"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            <div className="mt-2 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
              <div className="flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  입력하신 키로 메시지 및 사진이 암호화되어 저장되므로,<br/> 오직 키를 가진 사람만 메시지 및 사진을 볼 수 있습니다.<br/>
                  서버에 암호키를 저장하지 않기 때문에, <br/>
                  <strong className="text-emerald-400">키를 분실하시면 복구가 불가능합니다.</strong> 안전하게 보관해 주세요.
                </p>
              </div>
            </div>
          </InputGroup>
        </div>

        {/* <div className="my-8">
           <AdBanner />
        </div> */}

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
};

export default Create;
