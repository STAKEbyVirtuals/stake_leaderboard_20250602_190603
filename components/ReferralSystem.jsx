// components/ReferralSystem.jsx - 추천인 시스템 핵심 로직
import React, { useState, useEffect } from 'react';

class ReferralCore {
  // 🎯 지갑 주소 → 추천인 코드 생성 (크로스 디바이스 호환)
  static generateReferralCode(walletAddress) {
    if (!walletAddress) return null;
    
    // 지갑 주소 정리 (0x 제거, 소문자 변환)
    const cleaned = walletAddress.toLowerCase().replace('0x', '');
    
    // 해시 생성 (예측 어렵게)
    const hash = this.createHash(cleaned);
    
    // STAKE + 6자리 형태로 반환
    return `STAKE${hash.toUpperCase()}`;
  }
  
  // 🔐 간단하지만 예측 어려운 해시 함수
  static createHash(str) {
    let hash = 0;
    let hash2 = 1;
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash2 = hash2 * 33 + char;
      hash = hash & hash; // 32비트 정수
      hash2 = hash2 & hash2;
    }
    
    // 두 해시 조합으로 더 복잡하게
    const combined = Math.abs(hash + hash2);
    return combined.toString(36).slice(0, 6).padEnd(6, '0');
  }
  
  // 📊 추천인 관계 저장/조회
  static saveReferralData(referrerCode, refereeWallet) {
    try {
      const referralData = this.getReferralData();
      const timestamp = Date.now();
      
      // 새로운 추천 관계 추가
      if (!referralData.relationships[refereeWallet]) {
        referralData.relationships[refereeWallet] = {
          referrer: referrerCode,
          joined_at: timestamp,
          points_earned: 0,
          points_given: 0
        };
        
        // 추천인의 피추천인 목록에 추가
        if (!referralData.referrers[referrerCode]) {
          referralData.referrers[referrerCode] = {
            total_referrals: 0,
            total_points_earned: 0,
            referees: []
          };
        }
        
        referralData.referrers[referrerCode].total_referrals++;
        referralData.referrers[referrerCode].referees.push({
          wallet: refereeWallet,
          joined_at: timestamp,
          points_contributed: 0
        });
        
        // 저장
        localStorage.setItem('stake_referral_data', JSON.stringify(referralData));
        console.log(`✅ 추천 관계 저장: ${referrerCode} → ${refereeWallet}`);
        
        return true;
      }
      
      return false; // 이미 추천 관계가 있음
    } catch (error) {
      console.error('추천 데이터 저장 실패:', error);
      return false;
    }
  }
  
  // 📖 저장된 추천인 데이터 조회
  static getReferralData() {
    try {
      const data = localStorage.getItem('stake_referral_data');
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('추천 데이터 조회 실패:', error);
    }
    
    // 기본 구조 반환
    return {
      relationships: {}, // { "0x...": { referrer: "STAKE123", joined_at: timestamp } }
      referrers: {},     // { "STAKE123": { total_referrals: 5, referees: [...] } }
      last_updated: Date.now()
    };
  }
  
  // 💰 포인트 분배 계산 (5% + 2% 시스템)
  static calculateReferralPoints(userWallet, earnedPoints) {
    const referralData = this.getReferralData();
    const userRelation = referralData.relationships[userWallet];
    
    if (!userRelation) return { level1: 0, level2: 0 };
    
    const level1Points = Math.floor(earnedPoints * 0.05); // 5%
    let level2Points = 0;
    
    // 2차 추천인 찾기 (내 추천인의 추천인)
    const myReferrerCode = userRelation.referrer;
    if (myReferrerCode) {
      // 내 추천인의 지갑 주소 찾기
      const myReferrerWallet = this.findWalletByCode(myReferrerCode);
      if (myReferrerWallet) {
        const referrerRelation = referralData.relationships[myReferrerWallet];
        if (referrerRelation && referrerRelation.referrer) {
          level2Points = Math.floor(earnedPoints * 0.02); // 2%
        }
      }
    }
    
    return { level1: level1Points, level2: level2Points };
  }
  
  // 🔍 추천인 코드로 지갑 주소 찾기
  static findWalletByCode(referralCode) {
    const referralData = this.getReferralData();
    
    // 모든 관계에서 해당 코드를 가진 지갑 찾기
    for (const [wallet, relation] of Object.entries(referralData.relationships)) {
      const walletCode = this.generateReferralCode(wallet);
      if (walletCode === referralCode) {
        return wallet;
      }
    }
    
    return null;
  }
  
  // 📈 내 추천 통계 조회
  static getMyReferralStats(walletAddress) {
    const myCode = this.generateReferralCode(walletAddress);
    const referralData = this.getReferralData();
    const myStats = referralData.referrers[myCode];
    
    return {
      my_code: myCode,
      total_referrals: myStats?.total_referrals || 0,
      total_points_earned: myStats?.total_points_earned || 0,
      referees: myStats?.referees || [],
      my_referrer: referralData.relationships[walletAddress]?.referrer || null
    };
  }
  
  // 🔄 포인트 분배 실행
  static distributeReferralPoints(userWallet, earnedPoints) {
    try {
      const distribution = this.calculateReferralPoints(userWallet, earnedPoints);
      const referralData = this.getReferralData();
      const userRelation = referralData.relationships[userWallet];
      
      if (!userRelation || (!distribution.level1 && !distribution.level2)) {
        return { success: false, distributed: { level1: 0, level2: 0 } };
      }
      
      // 1차 추천인에게 포인트 지급
      if (distribution.level1 > 0) {
        const referrerCode = userRelation.referrer;
        if (referralData.referrers[referrerCode]) {
          referralData.referrers[referrerCode].total_points_earned += distribution.level1;
          
          // 피추천인별 기여도 업데이트
          const referee = referralData.referrers[referrerCode].referees.find(r => r.wallet === userWallet);
          if (referee) {
            referee.points_contributed += distribution.level1;
          }
        }
      }
      
      // 2차 추천인에게 포인트 지급
      if (distribution.level2 > 0) {
        const myReferrerWallet = this.findWalletByCode(userRelation.referrer);
        if (myReferrerWallet) {
          const grandReferrerRelation = referralData.relationships[myReferrerWallet];
          if (grandReferrerRelation) {
            const grandReferrerCode = grandReferrerRelation.referrer;
            if (referralData.referrers[grandReferrerCode]) {
              referralData.referrers[grandReferrerCode].total_points_earned += distribution.level2;
            }
          }
        }
      }
      
      // 사용자의 포인트 기여도 업데이트
      userRelation.points_given += (distribution.level1 + distribution.level2);
      
      // 데이터 저장
      referralData.last_updated = Date.now();
      localStorage.setItem('stake_referral_data', JSON.stringify(referralData));
      
      console.log(`💰 포인트 분배 완료:`, distribution);
      
      return { 
        success: true, 
        distributed: distribution,
        total_distributed: distribution.level1 + distribution.level2
      };
      
    } catch (error) {
      console.error('포인트 분배 실패:', error);
      return { success: false, distributed: { level1: 0, level2: 0 } };
    }
  }
}

// 🎮 React 컴포넌트: 추천인 시스템 UI
const ReferralSystem = ({ walletAddress, currentPoints = 0 }) => {
  const [myStats, setMyStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // 데이터 로드
  useEffect(() => {
    if (walletAddress) {
      loadReferralData();
    }
  }, [walletAddress]);

  const loadReferralData = () => {
    setIsLoading(true);
    try {
      const stats = ReferralCore.getMyReferralStats(walletAddress);
      setMyStats(stats);
    } catch (error) {
      console.error('추천 데이터 로드 실패:', error);
    }
    setIsLoading(false);
  };

  // 추천 링크 복사
  const copyReferralLink = () => {
    if (!myStats?.my_code) return;
    
    const currentUrl = window.location.origin;
    const referralLink = `${currentUrl}?ref=${myStats.my_code}`;
    
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('복사 실패:', err);
      // 폴백: 수동 복사를 위한 prompt
      prompt('추천 링크를 복사하세요:', referralLink);
    });
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-6 h-6 bg-purple-500/30 rounded"></div>
            <div className="w-32 h-5 bg-purple-500/30 rounded"></div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-4 bg-purple-500/20 rounded"></div>
            <div className="w-3/4 h-4 bg-purple-500/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!walletAddress || !myStats) {
    return (
      <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6 text-center">
        <div className="text-4xl mb-3">🔗</div>
        <h3 className="text-white font-bold mb-2">Connect Wallet</h3>
        <p className="text-gray-400 text-sm">지갑을 연결하여 추천인 시스템을 사용하세요</p>
      </div>
    );
  }

  return (
    <div className="bg-purple-500/10 border-2 border-purple-500/30 rounded-xl p-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          🎁 Referral System
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-purple-400 hover:text-purple-300 text-sm font-semibold"
        >
          {showDetails ? '간단히' : '자세히'}
        </button>
      </div>

      {/* 내 추천인 코드 */}
      <div className="bg-black/30 rounded-lg p-4 mb-6">
        <label className="text-purple-400 text-sm font-semibold mb-2 block">
          🔑 My Referral Code
        </label>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-purple-500/20 border border-purple-500/40 rounded-lg px-4 py-3">
            <div className="font-mono text-lg font-bold text-white">
              {myStats.my_code}
            </div>
          </div>
          <button
            onClick={copyReferralLink}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              copied 
                ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
                : 'bg-purple-500/20 border border-purple-500/40 text-purple-400 hover:bg-purple-500/30'
            }`}
          >
            {copied ? '✅ Copied!' : '📋 Copy Link'}
          </button>
        </div>
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {myStats.total_referrals}
          </div>
          <div className="text-green-400/80 text-sm font-semibold">
            Total Referrals
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">
            {myStats.total_points_earned.toLocaleString()}
          </div>
          <div className="text-yellow-400/80 text-sm font-semibold">
            Bonus Points
          </div>
        </div>
      </div>

      {/* 내가 추천받은 사람 */}
      {myStats.my_referrer && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-blue-400">👆</span>
            <span className="text-blue-400 font-semibold text-sm">Referred by</span>
          </div>
          <div className="font-mono text-white font-bold">
            {myStats.my_referrer}
          </div>
        </div>
      )}

      {/* 상세 정보 */}
      {showDetails && myStats.referees.length > 0 && (
        <div className="bg-black/20 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            👥 My Referees ({myStats.referees.length})
          </h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {myStats.referees.map((referee, index) => (
              <div key={index} className="flex items-center justify-between bg-purple-500/10 rounded-lg p-3">
                <div>
                  <div className="font-mono text-sm text-white">
                    {referee.wallet.slice(0, 6)}...{referee.wallet.slice(-4)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(referee.joined_at).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-400">
                    +{referee.points_contributed.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 안내 메시지 */}
      <div className="mt-6 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-orange-400 text-lg">💡</span>
          <div>
            <h4 className="text-orange-400 font-semibold text-sm mb-1">
              How it works
            </h4>
            <ul className="text-gray-300 text-xs space-y-1">
              <li>• Share your referral link to earn bonus points</li>
              <li>• Get 5% of your direct referees' points</li>
              <li>• Get 2% of your indirect referees' points</li>
              <li>• No limits on referrals!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export
export { ReferralCore, ReferralSystem };
export default ReferralSystem;