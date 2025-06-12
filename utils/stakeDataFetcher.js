// utils/stakeDataFetcher.js
// STAKE 리더보드 실데이터 연동 유틸리티 (최종 수정본)

// Apps Script Web App URL (배포 후 받은 URL로 교체)
const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

// 캐시 설정
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5분 캐싱

/**
 * 전체 리더보드 데이터 가져오기
 */
export async function fetchLeaderboardData(forceRefresh = false) {
  try {
    // 캐시 확인
    const now = Date.now();
    if (!forceRefresh && cachedData && (now - cacheTimestamp < CACHE_DURATION)) {
      console.log('📦 캐시된 데이터 반환');
      return cachedData;
    }

    console.log('🔄 Apps Script에서 데이터 가져오는 중...');
    const response = await fetch(APPS_SCRIPT_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'Failed to fetch data');
    }

    // 캐시 업데이트
    cachedData = data;
    cacheTimestamp = now;

    console.log(`✅ 데이터 로드 완료: ${data.total_rows}명`);
    return data;

  } catch (error) {
    console.error('❌ 데이터 가져오기 실패:', error);
    throw error;
  }
}

/**
 * 특정 지갑 주소의 데이터 찾기
 */
/**
 * 특정 지갑 주소의 데이터 찾기 (없으면 기본값 반환)
 */
export function findUserData(leaderboard, walletAddress) {
  if (!walletAddress) return null;

  // 리더보드에서 찾기
  if (leaderboard && Array.isArray(leaderboard)) {
    const found = leaderboard.find(user =>
      user.address.toLowerCase() === walletAddress.toLowerCase()
    );
    if (found) return found;
  }

  // 없으면 신규 유저용 기본값 반환
  console.log('🆕 신규 유저 감지:', walletAddress);
  return createDefaultUserData(walletAddress);
}

/**
 * 24시간 후 예상 순위 계산
 */
function calculatePredictedRank24h(userData, allActiveUsers) {
  if (!userData || !allActiveUsers || allActiveUsers.length === 0) {
    return userData?.rank || 1;
  }

  // 내 현재 총 포인트 (이미 멀티플라이어와 박스 포인트 포함됨)
  const myCurrentTotalScore = parseFloat(userData.real_time_score) || 0;
  
  // 내 P/S
  const myPointsPerSecond = parseFloat(userData.points_per_second) || 0;
  
  // 내 24시간 후 예상 포인트
  const myFutureScore = myCurrentTotalScore + (myPointsPerSecond * 24 * 60 * 60);

  // 다른 사용자들의 24시간 후 예상 포인트 계산
  let higherScoreCount = 0;

  allActiveUsers.forEach(user => {
    if (user.address === userData.address) return;

    // 다른 유저도 동일하게 처리
    const userCurrentTotalScore = parseFloat(user.time_score) || 0;
    const userMultiplier = getTierInfo(user.grade).multiplier;
    const userBoxPoints = parseFloat(user.box_points_earned) || 0;
    const userTotalScore = (userCurrentTotalScore * userMultiplier) + userBoxPoints;
    
    const userPointsPerSecond = parseFloat(user.points_per_second) || 0;
    const userFutureScore = userTotalScore + (userPointsPerSecond * 24 * 60 * 60);

    if (userFutureScore > myFutureScore) {
      higherScoreCount++;
    }
  });

  return higherScoreCount + 1;
}

/**
 * 신규 유저용 기본 데이터 생성
 */
function createDefaultUserData(walletAddress) {
  const now = Date.now() / 1000;

  return {
    address: walletAddress,
    rank: 9999,
    grade: "VIRGEN",
    grade_emoji: "🐸",
    percentile: 100.0,
    total_staked: 0,
    time_score: 0,
    holding_days: 0,
    stake_count: 0,
    unstake_count: 0,
    is_active: false,
    current_phase: 1,
    phase_score: 0,
    total_score_all_phases: 0,
    airdrop_share_phase: 0,
    airdrop_share_total: 0,
    first_stake_time: now,
    last_action_time: now,
    rank_change_24h: 0,
    score_change_24h: 0,
    phase_rank_history: "P1:9999",
    grill_temperature: 0,
    points_per_second: 0,
    predicted_next_tier: "Sizzlin' Noob",
    virtual_staked: 0,
    referral_bonus_earned: 0,
    referral_code: "",
    referral_count: 0,
    current_box_type: "",
    total_boxes_opened: 0,
    box_points_earned: 0,
    genesis_snapshot_qualified: false
  };
}

/**
 * 사용자 데이터를 대시보드용 포맷으로 변환 (최종본)
 */
export function formatUserDataForDashboard(userData, systemStats, allActiveUsers) {
  if (!userData) return null;

  const tierInfo = getTierInfo(userData.grade);

  // 시간 관련 계산
  const firstStakeTime = userData.first_stake_time * 1000;
  const currentTime = Date.now();
  const holdingSeconds = (currentTime - firstStakeTime) / 1000;
  const holdingDays = holdingSeconds / (24 * 60 * 60);

  // 스테이킹 총량
  const totalStaked = parseFloat(userData.total_staked) || 0;
  const virtualStaked = parseFloat(userData.virtual_staked) || 0;
  const displayStaked = totalStaked + virtualStaked;

  // 실시간 점수 계산
  const realTimeScore = displayStaked * holdingDays;
  const scorePerSecond = displayStaked / (24 * 60 * 60);

  // 추천 보너스 (현재 모두 0)
  const referralBonusEarned = parseFloat(userData.referral_bonus_earned) || 0;

  // 포인트 분해 (추천 시스템 미가동)
  const pointsByStake = realTimeScore; // 100%
  const pointsByReferral = referralBonusEarned; // 현재 0

  // 24시간 후 예상 순위 계산
  const predictedRank = calculatePredictedRank24h(userData, allActiveUsers);

  return {
    // 기본 정보
    address: userData.address,

    // 티어 정보
    grade: userData.grade,
    grade_emoji: userData.grade_emoji,
    tier_color: tierInfo.color,
    tier_glow_color: tierInfo.glowColor,
    bg_gradient: tierInfo.bgGradient,
    border_color: tierInfo.borderColor,
    current_multiplier: tierInfo.multiplier,

    // 스테이킹 정보
    total_staked: totalStaked,
    virtual_staked: virtualStaked,
    display_staked: displayStaked,

    // Phase 1 할당
    phase1_allocation_percent: parseFloat(userData.airdrop_share_phase) || 0,
    phase1_allocation_tokens: calculatePhase1Tokens(userData.airdrop_share_phase),
    phase1_allocation_usd: calculatePhase1USD(userData.airdrop_share_phase),

    // 순위 정보
    rank: parseInt(userData.rank) || 0,
    total_participants: systemStats?.active_users || 0, // 활성 사용자만
    rank_change_24h: parseInt(userData.rank_change_24h) || 0,
    predicted_rank_24h: predictedRank, // ✅ 실제 계산값
    percentile: parseFloat(userData.percentile) || 0,

    // 그릴온도
    grill_temperature: parseFloat(userData.grill_temperature) || 0,
    points_per_second: parseFloat(userData.points_per_second) || 0,
    predicted_next_tier: userData.predicted_next_tier || '',

    // 시간 정보
    first_stake_timestamp: userData.first_stake_time || 0,
    holding_days: holdingDays,

    // 상태
    is_active: userData.is_active === true || userData.is_active === 'TRUE',
    current_phase: parseInt(userData.current_phase) || 1,
    phase_status: "active",
    is_diamond_hand_eligible: userData.is_active === true || userData.is_active === 'TRUE',

    // 포인트 정보 (실시간 계산)
    // 포인트 정보 (실시간 계산)
    real_time_score: realTimeScore * tierInfo.multiplier,
    score_per_second: scorePerSecond * tierInfo.multiplier,
    points_per_second: scorePerSecond * tierInfo.multiplier,  // 추가!
    stakehouse_score: realTimeScore * tierInfo.multiplier * 0.15,
    stakehouse_per_second: scorePerSecond * tierInfo.multiplier * 0.15,

    // 포인트 분해 (✅ by_stake로 변경)
    points_breakdown: {
      by_stake: pointsByStake,      // 스테이킹으로 얻은 포인트
      by_referral: pointsByReferral  // 추천으로 얻은 포인트 (현재 0)
    },

    // ❌ 업그레이드 트랙 폐기
    // upgrade_tracks 제거

    // 추천인
    referral_code: userData.referral_code || '',
    referral_count: parseInt(userData.referral_count) || 0,
    referral_bonus_earned: referralBonusEarned,

    // 선물상자
    current_box_type: userData.current_box_type || '',
    total_boxes_opened: parseInt(userData.total_boxes_opened) || 0,
    box_points_earned: parseFloat(userData.box_points_earned) || 0,

    // Genesis 자격
    genesis_snapshot_qualified: userData.genesis_snapshot_qualified === true || userData.genesis_snapshot_qualified === 'TRUE',

    // Phase 1 종료까지 남은 시간 (초)
    phase_end_countdown: Math.max(0, (new Date('2025-06-27T09:59:59Z').getTime() - Date.now()) / 1000),

    // 실시간 holding 계산을 위한 getter
    get real_time_holding() {
      const totalSeconds = Math.floor((Date.now() / 1000) - this.first_stake_timestamp);
      return {
        days: Math.floor(totalSeconds / (24 * 60 * 60)),
        hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
        minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
        seconds: totalSeconds % 60
      };
    },

    // 🆕 pending 박스 포인트 가져오기
    get pending_box_points() {
      const savedQueue = localStorage.getItem(`boxSyncQueue_${userData.address}`);
      if (savedQueue) {
        try {
          const queue = JSON.parse(savedQueue);
          return queue.reduce((total, item) => total + (item.points || 0), 0);
        } catch (e) {
          return 0;
        }
      }
      return 0;
    }
  };
}

/**
 * 티어별 정보 가져오기
 */
function getTierInfo(grade) {
  const tierMap = {
    'Genesis OG': {
      color: '#10b981',
      glowColor: 'rgba(16, 185, 129, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
      borderColor: 'rgba(16,185,129,0.5)',
      multiplier: 2.0
    },
    'Heavy Eater': {
      color: '#ef4444',
      glowColor: 'rgba(239, 68, 68, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))',
      borderColor: 'rgba(239,68,68,0.5)',
      multiplier: 1.8
    },
    'Stake Wizard': {
      color: '#fbbf24',
      glowColor: 'rgba(251, 191, 36, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
      borderColor: 'rgba(251,191,36,0.5)',
      multiplier: 1.6
    },
    'Grilluminati': {
      color: '#9333ea',
      glowColor: 'rgba(147, 51, 234, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(147,51,234,0.15), rgba(147,51,234,0.05))',
      borderColor: 'rgba(147,51,234,0.5)',
      multiplier: 1.4
    },
    'Flame Juggler': {
      color: '#3b82f6',
      glowColor: 'rgba(59, 130, 246, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
      borderColor: 'rgba(59,130,246,0.5)',
      multiplier: 1.25
    },
    'Flipstarter': {
      color: '#22c55e',
      glowColor: 'rgba(34, 197, 94, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(34,197,94,0.15), rgba(34,197,94,0.05))',
      borderColor: 'rgba(34,197,94,0.5)',
      multiplier: 1.1
    },
    'Sizzlin\' Noob': {
      color: '#9ca3af',
      glowColor: 'rgba(156, 163, 175, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(156,163,175,0.15), rgba(156,163,175,0.05))',
      borderColor: 'rgba(156,163,175,0.5)',
      multiplier: 1.0
    },
    'Jeeted': {
      color: '#6b7280',
      glowColor: 'rgba(107, 114, 128, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(107,114,128,0.15), rgba(107,114,128,0.05))',
      borderColor: 'rgba(107,114,128,0.5)',
      multiplier: 0
    },
    'VIRGEN': {
      color: '#1e1e1e',
      glowColor: 'rgba(30, 30, 30, 0.6)',
      bgGradient: 'linear-gradient(135deg, rgba(30,30,30,0.15), rgba(30,30,30,0.05))',
      borderColor: 'rgba(30,30,30,0.5)',
      multiplier: 0
    }
  };

  return tierMap[grade] || tierMap['Sizzlin\' Noob'];
}

/**
 * Phase 1 토큰 계산
 */
function calculatePhase1Tokens(sharePercent) {
  const TOTAL_SUPPLY = 1_000_000_000;
  const AIRDROP_PERCENT = 0.25;
  const PHASE_REWARD = (TOTAL_SUPPLY * AIRDROP_PERCENT) / 6; // 6 phases

  return Math.floor(PHASE_REWARD * (sharePercent / 100));
}

/**
 * Phase 1 USD 가치 계산 (예시 가격)
 */
function calculatePhase1USD(sharePercent) {
  const tokens = calculatePhase1Tokens(sharePercent);
  const PRICE_PER_TOKEN = 0.0025; // 예시 가격

  return Math.floor(tokens * PRICE_PER_TOKEN);
}

/**
 * 리더보드 통계 계산
 */
export function calculateLeaderboardStats(leaderboard) {
  if (!leaderboard || !Array.isArray(leaderboard)) {
    return {
      total_users: 0,
      active_users: 0,
      jeeted_users: 0,
      genesis_count: 0,
      avg_stake: 0,
      total_staked: 0
    };
  }

  const activeUsers = leaderboard.filter(u => u.is_active === true || u.is_active === 'TRUE');
  const jeetedUsers = leaderboard.filter(u => !(u.is_active === true || u.is_active === 'TRUE'));
  const genesisUsers = leaderboard.filter(u => u.grade === 'Genesis OG');

  const totalStaked = leaderboard.reduce((sum, u) => sum + (parseFloat(u.total_staked) || 0), 0);
  const avgStake = activeUsers.length > 0 ? totalStaked / activeUsers.length : 0;

  return {
    total_users: leaderboard.length,
    active_users: activeUsers.length,
    jeeted_users: jeetedUsers.length,
    genesis_count: genesisUsers.length,
    avg_stake: avgStake,
    total_staked: totalStaked
  };
}

/**
 * 상위 N명 리더보드 가져오기
 */
export function getTopLeaders(leaderboard, limit = 10) {
  if (!leaderboard || !Array.isArray(leaderboard)) return [];

  return leaderboard
    .filter(u => u.is_active === true || u.is_active === 'TRUE')
    .sort((a, b) => (parseInt(a.rank) || 999999) - (parseInt(b.rank) || 999999))
    .slice(0, limit);
}

/**
 * 활성 사용자만 필터링
 */
export function getActiveUsers(leaderboard) {
  if (!leaderboard || !Array.isArray(leaderboard)) return [];

  return leaderboard.filter(u => u.is_active === true || u.is_active === 'TRUE');
}