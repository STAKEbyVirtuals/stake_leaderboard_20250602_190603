// components/TweetSubmissionForm.jsx - 구글폼 연결 모달 + 증명서 생성
import React, { useState, useEffect } from 'react';
import CompletionCertificate from './CompletionCertificate'; // 🆕 증명서 컴포넌트

const TweetSubmissionForm = ({ isOpen, onClose, walletAddress }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // 🔧 구글폼 URL (실제 생성된 폼 URL로 교체 필요)
  const GOOGLE_FORM_URL = 'https://forms.gle/your-actual-form-id'; // ⚠️ 실제 폼 URL로 교체

  // ESC 키로 닫기
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden'; // 스크롤 방지
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  // 구글폼 열기
  const handleOpenGoogleForm = () => {
    setIsSubmitting(true);
    
    // 구글폼을 새 창에서 열기
    const formWindow = window.open(GOOGLE_FORM_URL, '_blank', 'width=800,height=900,scrollbars=yes');
    
    // 폼 창이 닫히는지 감지 (선택사항)
    const checkClosed = setInterval(() => {
      if (formWindow?.closed) {
        clearInterval(checkClosed);
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // 3초 후 모달 자동 닫기
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    }, 1000);

    // 10초 후 자동으로 감지 중단 (메모리 누수 방지)
    setTimeout(() => {
      clearInterval(checkClosed);
      setIsSubmitting(false);
    }, 10000);
  };

  // 나중에 제출하기
  const handleSubmitLater = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 py-20 safe-area-inset">
      {/* 배경 오버레이 - 고정 */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 - 모바일 최적화 */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-orange-500/30 rounded-none sm:rounded-3xl shadow-2xl w-full max-w-lg mx-4 max-h-[80vh] sm:max-h-[85vh] flex flex-col">
        {/* 닫기 버튼 - 모바일/데스크톱 차별화 */}
        <div className="flex justify-end p-3 pb-7 sm:p-4 sm:pb-6 sm:rounded-t-3xl overflow-hidden">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-700/50 transition-colors border border-gray-600/30"
          >
            ×
          </button>
        </div>

        {/* 스크롤 가능한 컨텐츠 영역 - 모바일 여백 증가 */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8 sm:pb-8 pt-2 sm:pt-0 scrollbar-thin scrollbar-thumb-orange-500/50 scrollbar-track-gray-800/30 min-h-0">

        {isSubmitted ? (
          // 제출 완료 상태
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-green-400 mb-4">
              Submission Completed!
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Your submission is under review. Results will be available within 24 hours.
            </p>
            <p className="text-orange-400 text-sm font-semibold">
              This window will close automatically...
            </p>
          </div>
        ) : (
          <>
            {/* 모달 헤더 */}
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Almost Done!
              </h2>
              <p className="text-gray-300 text-sm">
                Submit your tweet to claim your 50,000 stSTAKE reward
              </p>
            </div>

            {/* 제출 안내 */}
            <div className="space-y-6 mb-8">
              {/* 🆕 증명서 다운로드 섹션 */}
              <CompletionCertificate walletAddress={walletAddress} />
              {/* 단계 안내 */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
                  📋 How to Submit
                </h4>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">1.</span>
                    <span>Download your certificate image above</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">2.</span>
                    <span>Attach the image to your tweet</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">3.</span>
                    <span>Click "Submit Tweet" to open verification form</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">4.</span>
                    <span>Paste your tweet URL and submit</span>
                  </div>
                </div>
              </div>

              {/* 지갑 정보 표시 */}
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                  🔗 Connected Wallet
                </h4>
                <div className="font-mono text-sm text-gray-300 bg-black/30 rounded px-3 py-2 break-all">
                  {walletAddress}
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  Make sure this wallet address is included in your tweet
                </p>
              </div>

              {/* 중요 안내 */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                  ⚠️ Important
                </h4>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• One submission per wallet address</li>
                  <li>• One submission per X account</li>
                  <li>• X account must be 30+ days old</li>
                  <li>• Tweet must contain your wallet address</li>
                </ul>
              </div>
            </div>

            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={handleOpenGoogleForm}
                disabled={isSubmitting}
                className={`
                  w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-300
                  ${isSubmitting 
                    ? 'bg-gray-600 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-orange-500 to-red-500 hover:scale-105 shadow-lg'
                  }
                `}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Opening Form...
                  </div>
                ) : (
                  <>📝 Submit Tweet for Verification</>
                )}
              </button>

              <button
                onClick={handleSubmitLater}
                className="w-full py-3 px-6 rounded-xl font-semibold text-gray-400 border border-gray-600 hover:bg-gray-700/30 hover:text-white transition-all duration-300"
              >
                Submit Later
              </button>
            </div>

            {/* 도움말 */}
            <div className="mt-6 text-center pb-4">
              <p className="text-xs text-gray-500">
                Need help? Contact us via Discord or Telegram
              </p>
            </div>
          </>
        )}
        </div>
      </div>
    </div>
  );
};

export default TweetSubmissionForm;