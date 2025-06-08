// components/ReferralTracker.jsx - URL 파라미터 감지 및 추적
import React, { useEffect, useState } from 'react';
import { ReferralCore } from './ReferralSystem';

const ReferralTracker = ({ walletAddress, onReferralDetected }) => {
  const [detectedReferrer, setDetectedReferrer] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [trackingHistory, setTrackingHistory] = useState([]);

  // 컴포넌트 마운트 시 URL 파라미터 확인
  useEffect(() => {
    checkForReferralCode();
    loadTrackingHistory();
  }, []);

  // 지갑 연결 시 추천 관계 저장
  useEffect(() => {
    if (walletAddress && detectedReferrer) {
      processReferralConnection();
    }
  }, [walletAddress, detectedReferrer]);

  // 🔍 URL에서 추천인 코드 감지
  const checkForReferralCode = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      
      if (refCode && refCode.startsWith('STAKE') && refCode.length === 11) {
        console.log(`🎯 추천인 코드 감지: ${refCode}`);
        
        // 유효한 형식인지 확인
        if (isValidReferralCode(refCode)) {
          setDetectedReferrer(refCode);
          saveToTrackingHistory(refCode);
          
          // 부모 컴포넌트에 알림
          if (onReferralDetected) {
            onReferralDetected(refCode);
          }
          
          // URL에서 ref 파라미터 제거 (깔끔하게)
          const newUrl = new URL(window.location);
          newUrl.searchParams.delete('ref');
          window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
          
          // 성공 토스트 표시
          showReferralToast(refCode);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('추천인 코드 감지 실패:', error);
      return false;
    }
  };

  // 🔐 추천인 코드 유효성 검사
  const isValidReferralCode = (code) => {
    // STAKE + 6자리 형식 확인
    const pattern = /^STAKE[A-Z0-9]{6}$/;
    return pattern.test(code);
  };

  // 📝 추적 히스토리 저장
  const saveToTrackingHistory = (refCode) => {
    const history = getTrackingHistory();
    const newEntry = {
      referrer_code: refCode,
      detected_at: Date.now(),
      user_agent: navigator.userAgent,
      referrer_url: document.referrer || 'direct',
      ip_hash: generateSimpleHash(navigator.userAgent + Date.now()), // 간단한 식별자
    };
    
    history.unshift(newEntry); // 최신 항목을 앞에
    
    // 최대 50개 항목만 보관
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem('stake_referral_tracking', JSON.stringify(history));
    setTrackingHistory(history);
  };

  // 📖 추적 히스토리 로드
  const loadTrackingHistory = () => {
    const history = getTrackingHistory();
    setTrackingHistory(history);
  };

  const getTrackingHistory = () => {
    try {
      const data = localStorage.getItem('stake_referral_tracking');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('추적 히스토리 로드 실패:', error);
      return [];
    }
  };

  // 🔗 추천 관계 연결 처리
  const processReferralConnection = async () => {
    if (!walletAddress || !detectedReferrer) return;
    
    setIsTracking(true);
    
    try {
      // 자기 자신 추천 확인
      const myCode = ReferralCore.generateReferralCode(walletAddress);
      if (myCode === detectedReferrer) {
        console.log('⚠️ 자기 추천 감지 - 허용됨');
        showSelfReferralToast();
      }
      
      // 추천 관계 저장
      const success = ReferralCore.saveReferralData(detectedReferrer, walletAddress);
      
      if (success) {
        console.log(`✅ 추천 관계 연결 성공: ${detectedReferrer} → ${walletAddress}`);
        showSuccessToast(detectedReferrer);
        
        // 연결 완료 후 상태 초기화
        setTimeout(() => {
          setDetectedReferrer(null);
        }, 3000);
      } else {
        console.log('ℹ️ 이미 추천 관계가 존재함');
        showExistingConnectionToast();
      }
      
    } catch (error) {
      console.error('추천 관계 연결 실패:', error);
      showErrorToast();
    }
    
    setIsTracking(false);
  };

  // 🔨 간단한 해시 생성기
  const generateSimpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  };

  // 🍞 토스트 메시지들
  const showReferralToast = (code) => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`🎁 추천인 코드 감지: ${code}`, 'success');
    } else {
      console.log(`🎁 추천인 코드 감지: ${code}`);
    }
  };

  const showSuccessToast = (code) => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`✅ 추천 관계 연결 완료! 보너스 포인트를 받을 수 있습니다.`, 'success');
    }
  };

  const showSelfReferralToast = () => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`😄 자기 추천이 감지되었습니다 (허용됨)`, 'info');
    }
  };

  const showExistingConnectionToast = () => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`ℹ️ 이미 추천 관계가 설정되어 있습니다`, 'info');
    }
  };

  const showErrorToast = () => {
    if (typeof window !== 'undefined' && window.showToast) {
      window.showToast(`❌ 추천 관계 연결에 실패했습니다`, 'error');
    }
  };

  // 🎮 UI 렌더링 (개발용 - 운영에서는 숨김 가능)
  const renderTrackingStatus = () => {
    if (!detectedReferrer && trackingHistory.length === 0) {
      return null; // 추천인 관련 활동이 없으면 숨김
    }

    return (
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
        <h4 className="text-blue-400 font-bold mb-3 flex items-center gap-2">
          🔍 Referral Tracking Status
        </h4>
        
        {/* 현재 감지된 추천인 */}
        {detectedReferrer && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-green-400 font-semibold text-sm">
                  🎯 Detected Referrer
                </div>
                <div className="font-mono text-white font-bold">
                  {detectedReferrer}
                </div>
              </div>
              {isTracking && (
                <div className="flex items-center gap-2 text-yellow-400">
                  <div className="w-4 h-4 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                  <span className="text-sm">연결중...</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 추적 히스토리 */}
        {trackingHistory.length > 0 && (
          <div>
            <div className="text-gray-400 text-sm mb-2">
              📊 Recent Tracking History ({trackingHistory.length})
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {trackingHistory.slice(0, 5).map((entry, index) => (
                <div key={index} className="flex items-center justify-between bg-blue-500/5 rounded p-2">
                  <div className="font-mono text-xs text-gray-300">
                    {entry.referrer_code}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(entry.detected_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 🔧 디버그 정보 (개발용)
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV !== 'development') return null;

    return (
      <details className="bg-gray-800/50 rounded-lg p-3 mt-4">
        <summary className="text-gray-400 text-sm cursor-pointer mb-2">
          🛠️ Debug Info (개발용)
        </summary>
        <div className="space-y-2 text-xs">
          <div>
            <span className="text-gray-500">Current URL:</span>
            <div className="font-mono text-gray-300 break-all">
              {typeof window !== 'undefined' ? window.location.href : 'SSR'}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Detected Referrer:</span>
            <span className="font-mono text-white ml-2">
              {detectedReferrer || 'None'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Is Tracking:</span>
            <span className="text-white ml-2">
              {isTracking ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="text-gray-500">Wallet Connected:</span>
            <span className="text-white ml-2">
              {walletAddress ? 'Yes' : 'No'}
            </span>
          </div>
          {walletAddress && (
            <div>
              <span className="text-gray-500">My Code:</span>
              <span className="font-mono text-yellow-400 ml-2">
                {ReferralCore.generateReferralCode(walletAddress)}
              </span>
            </div>
          )}
        </div>
      </details>
    );
  };

  return (
    <div>
      {renderTrackingStatus()}
      {renderDebugInfo()}
    </div>
  );
};

// 🌍 전역 함수: 다른 컴포넌트에서 추천인 코드 감지
export const detectReferralFromURL = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    if (refCode && refCode.startsWith('STAKE') && refCode.length === 11) {
      return refCode;
    }
    return null;
  } catch (error) {
    console.error('추천인 코드 감지 실패:', error);
    return null;
  }
};

// 🔗 전역 함수: 현재 페이지에 추천인 코드 추가
export const addReferralToCurrentURL = (referralCode) => {
  try {
    const currentUrl = new URL(window.location);
    currentUrl.searchParams.set('ref', referralCode);
    return currentUrl.toString();
  } catch (error) {
    console.error('추천인 URL 생성 실패:', error);
    return window.location.href;
  }
};

export default ReferralTracker;