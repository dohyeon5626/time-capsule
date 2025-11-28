import { useTimeCapsule } from './hooks/useTimeCapsule';

import Loading from './components/Loading';
import Toast from './components/Toast';
import Home from './components/Home';
import Create from './components/Create';
import Success from './components/Success';
import View from './components/View';
import IdModal from './components/IdModal';
import GuideModal from './components/GuideModal';

export default function App() {
  const {
    view, setView,
    loading,
    isIdModalOpen, setIsIdModalOpen,
    isGuideOpen, setIsGuideOpen,
    manualId, setManualId,
    manualIdError, setManualIdError,
    toastMessage, setToastMessage,
    capsuleStats,
    formData, setFormData,
    errors, setErrors,
    recipients, setRecipients,
    createdCapsuleId,
    viewCapsuleData,
    handleCopyToClipboard,
    handleRecipientChange,
    addRecipient,
    removeRecipient,
    setDateOffset,
    handleSendToMe,
    createCapsule,
    fetchCapsule,
    shareLink,
    handleShareInView,
    handleDownloadImage,
  } = useTimeCapsule();

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
