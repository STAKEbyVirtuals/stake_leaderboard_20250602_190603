// utils/pointsCalculation.js - 추천인 시스템이 통합된 포인트 계산
import { ReferralCore } from '../components/ReferralSystem';

// 🧮 기존 포인트 계산에 추천인 보너스 통합
class EnhancedPointsCalculation {
  
  // 📊 사용자의 총 포인트 계산 (기본 + 추천인 보너스)
  static calculateTotalUserPoints(userData) {
    try {
      // 1. 기본 포인트 계산 (기존 로직)
      const basePoints = this.calculateBasePoints(userData);
      
      // 2. 추천인 보너스 포인트 조회
      const referralBonus = this.getReferralBonusPoints(userData.wallet_address);
      
      // 3. 총 포인트 = 기본 + 추천인 보너스
      const totalPoints = basePoints + referralBonus;
      
      return {
        base_points: basePoints,
        referral_bonus: referralBonus,
        total_points: totalPoints,
        breakdown: {
          staking_points: userData.total_staked * userData.holding_days,
          multiplier_bonus: (userData.total_staked * userData.holding_days) * (userData.current_multiplier - 1),
          referral_level1: this.getLevel1Bonus(userData.wallet_address),
          referral_level2: this.getLevel2Bonus(userData.wallet_address)
        }
      };
    } catch (error) {
      console.error('포인트 계산 실패:', error);
      return {
        base_points: 0,
        referral_bonus: 0,
        total_points: 0,
        breakdown: {}
      };
    }
  }
  
  // 🎯 기본 포인트 계산 (스테이킹 × 기간 × 배수)
  static calculateBasePoints(userData) {
    const stakingPoints = userData.total_staked * userData.holding_days;
    const multiplierBonus = stakingPoints * (userData.current_multiplier || 1);
    return Math.floor(multiplierBonus);
  }
  
  // 🎁 추천인 보너스 포인트 조회
  static getReferralBonusPoints(walletAddress) {
    if (!walletAddress) return 0;
    
    const stats = ReferralCore.getMyReferralStats(walletAddress);
    return stats?.total_points_earned || 0;
  }
  
  // 🥇 1차 추천인 보너스만 조회
  static getLevel1Bonus(walletAddress) {
    const stats = ReferralCore.getMyReferralStats(walletAddress);
    return Math.floor((stats?.total_points_earned || 0) * 0.8); // 80%가 1차에서
  }
  
  // 🥈 2차 추천인 보너스만 조회  
  static getLevel2Bonus(walletAddress) {
    const stats = ReferralCore.getMyReferralStats(walletAddress);
    return Math.floor((stats?.total_points_earned || 0) * 0.2); // 20%가 2차에서
  }
  
  // 💰 새로운 포인트 획득 시 추천인에게 분배
  static distributeNewPoints(userWallet, newPoints) {
    try {
      console.log(`💰 새로운 포인트 분배 시작: ${userWallet} → ${newPoints} 포인트`);
      
      // 추천인 보너스 계산 및 분배
      const distribution = ReferralCore.distributeReferralPoints(userWallet, newPoints);
      
      if (distribution.success) {
        console.log(`✅ 추천인 보너스 분배 완료:`, distribution);
        
        // 분배 이벤트 발생 (UI 업데이트용)
        this.emitPointsDistributionEvent({
          user: userWallet,
          original_points: newPoints,
          distributed: distribution.distributed,
          total_distributed: distribution.total_distributed
        });
        
        return distribution;
      }
      
      return { success: false, distributed: { level1: 0, level2: 0 } };
    } catch (error) {
      console.error('포인트 분배 실패:', error);
      return { success: false, distributed: { level1: 0, level2: 0 } };
    }
  }
  
  // 📢 포인트 분배 이벤트 발생
  static emitPointsDistributionEvent(data) {
    try {
      const event = new CustomEvent('stakePointsDistributed', {
        detail: data
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.log('이벤트 발생 실패:', error);
    }
  }
  
  // 📊 전체 리더보드 포인트 재계산 (추천인 보너스 포함)
  static recalculateLeaderboardWithReferrals(leaderboardData) {
    try {
      const updatedLeaderboard = leaderboardData.map(user => {
        const enhanced = this.calculateTotalUserPoints({
          wallet_address: user.address,
          total_staked: user.total_staked,
          holding_days: user.holding_days,
          current_multiplier: this.getMultiplierByGrade(user.grade)
        });
        
        return {
          ...user,
          base_score: enhanced.base_points,
          referral_bonus: enhanced.referral_bonus,
          total_score_with_referrals: enhanced.total_points,
          enhanced_breakdown: enhanced.breakdown
        };
      });
      
      // 새로운 총점으로 재정렬
      return updatedLeaderboard.sort((a, b) => 
        b.total_score_with_referrals - a.total_score_with_referrals
      );
    } catch (error) {
      console.error('리더보드 재계산 실패:', error);
      return leaderboardData;
    }
  }
  
  // 🏆 등급별 배수 조회
  static getMultiplierByGrade(grade) {
    const multipliers = {
      "Genesis OG": 2.0,
      "Heavy Eater": 1.8,
      "Steak Wizard": 1.6,
      "Grilluminati": 1.4,
      "Flame Juggler": 1.25,
      "Flipstarter": 1.1,
      "Sizzlin' Noob": 1.0,
      "Jeeted": 1.0
    };
    return multipliers[grade] || 1.0;
  }
  
  // 🔄 실시간 포인트 업데이트 (기존 + 추천인)
  static getRealtimeUserPoints(userData, currentTimestamp = Date.now()) {
    try {
      // 실시간 기본 포인트
      const realtimeBasePoints = this.calculateRealtimeBase(userData, currentTimestamp);
      
      // 추천인 보너스 (변동 없음)
      const referralBonus = this.getReferralBonusPoints(userData.wallet_address);
      
      // 실시간 총점
      const realtimeTotal = realtimeBasePoints + referralBonus;
      
      return {
        realtime_base: realtimeBasePoints,
        referral_bonus: referralBonus,
        realtime_total: realtimeTotal,
        points_per_second: this.calculatePointsPerSecond(userData)
      };
    } catch (error) {
      console.error('실시간 포인트 계산 실패:', error);
      return {
        realtime_base: 0,
        referral_bonus: 0,
        realtime_total: 0,
        points_per_second: 0
      };
    }
  }
  
  // ⏱️ 실시간 기본 포인트 계산
  static calculateRealtimeBase(userData, currentTimestamp) {
    const stakingStartTime = userData.first_stake_time * 1000; // 초 → 밀리초
    const secondsElapsed = (currentTimestamp - stakingStartTime) / 1000;
    const daysElapsed = secondsElapsed / (24 * 60 * 60);
    
    const rawScore = userData.total_staked * daysElapsed;
    const multiplier = this.getMultiplierByGrade(userData.grade);
    
    return Math.floor(rawScore * multiplier);
  }
  
  // 📈 초당 포인트 증가량
  static calculatePointsPerSecond(userData) {
    const multiplier = this.getMultiplierByGrade(userData.grade);
    return (userData.total_staked * multiplier) / (24 * 60 * 60);
  }
  
  // 🎯 추천인 성과 요약
  static getReferralPerformanceSummary(walletAddress) {
    try {
      const stats = ReferralCore.getMyReferralStats(walletAddress);
      const referralData = ReferralCore.getReferralData();
      
      // 내가 기여한 총 포인트 (내 추천인들이 받은 보너스)
      let totalContributed = 0;
      Object.values(referralData.relationships).forEach(relation => {
        if (relation.referrer === stats.my_code) {
          totalContributed += relation.points_given || 0;
        }
      });
      
      return {
        my_referral_code: stats.my_code,
        total_referrals: stats.total_referrals,
        total_bonus_earned: stats.total_points_earned,
        total_contributed_to_others: totalContributed,
        estimated_monthly_bonus: Math.floor(stats.total_points_earned * 1.2), // 20% 성장 가정
        referral_efficiency: stats.total_referrals > 0 ? 
          Math.floor(stats.total_points_earned / stats.total_referrals) : 0
      };
    } catch (error) {
      console.error('추천인 성과 요약 실패:', error);
      return {
        my_referral_code: null,
        total_referrals: 0,
        total_bonus_earned: 0,
        total_contributed_to_others: 0,
        estimated_monthly_bonus: 0,
        referral_efficiency: 0
      };
    }
  }
}

// 🎮 React Hook: 실시간 포인트 추적 (추천인 포함)
export const useEnhancedRealtimePoints = (userData) => {
  const [enhancedPoints, setEnhancedPoints] = useState({
    realtime_total: 0,
    referral_bonus: 0,
    points_per_second: 0
  });
  
  useEffect(() => {
    if (!userData?.wallet_address) return;
    
    const updatePoints = () => {
      const updated = EnhancedPointsCalculation.getRealtimeUserPoints(userData);
      setEnhancedPoints(updated);
    };
    
    // 초기 로드
    updatePoints();
    
    // 1초마다 업데이트
    const interval = setInterval(updatePoints, 1000);
    
    // 추천인 보너스 업데이트 감지
    const handleReferralUpdate = () => {
      setTimeout(updatePoints, 500); // 약간의 지연 후 업데이트
    };
    
    window.addEventListener('stakePointsDistributed', handleReferralUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('stakePointsDistributed', handleReferralUpdate);
    };
  }, [userData]);
  
  return enhancedPoints;
};

// Export
export { EnhancedPointsCalculation };
export default EnhancedPointsCalculation;