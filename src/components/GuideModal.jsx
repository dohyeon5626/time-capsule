import React from 'react';
import { X, BookOpen } from 'lucide-react';

const GuideModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-6 animate-in fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-[#1e293b] w-full max-w-sm rounded-2xl border border-slate-700 shadow-2xl p-6 relative overflow-y-auto max-h-[80vh] custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 hover:bg-slate-700 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
                
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-blue-400" />
                    사용 가이드
                </h3>
                
                <div className="space-y-6">

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400 font-bold text-sm">1</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">편지 작성</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">미래의 나 혹은 친구에게 전하고 싶은 이야기를 작성합니다. 사진도 함께 담을 수 있습니다.</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 text-purple-400 font-bold text-sm">2</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">봉인 설정</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">캡슐이 열릴 날짜와 시간을 정합니다. 암호키를 설정하면 더욱 안전하게 보관됩니다.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-sm">3</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">보관 및 공유</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">개봉 날짜가 되면 <strong>받는 사람의 전화번호로 알림톡</strong>이 발송됩니다.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 text-amber-400 font-bold text-sm">4</div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-1">추억 개봉</h4>
                            <p className="text-slate-400 text-xs leading-relaxed">지정된 시간이 되면 캡슐을 열 수 있습니다. 암호가 설정된 경우 암호키가 필요합니다.</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="w-full mt-8 py-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-colors"
                >
                    확인했습니다
                </button>
            </div>
        </div>
    );
};

export default GuideModal;
