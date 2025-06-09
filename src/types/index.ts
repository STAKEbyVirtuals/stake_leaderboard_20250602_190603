/**
 * @fileoverview Leaderboard 관련 타입 정의
 */

// 리더보드 항목의 데이터 구조를 정의합니다.
// 이 타입은 백엔드에서 받아오는 데이터의 형태와 일치해야 합니다.
export interface LeaderboardItem {
  discordId: string; // Discord ID
  discordUsername: string; // Discord 사용자 이름
  twitterUsername: string; // Twitter 사용자 이름 (X 계정)
  walletAddress: string; // 지갑 주소
  score: number; // 최종 점수
  tier: string; // 현재 티어 (등급)
  profileImage: string; // 프로필 이미지 URL
  // 추가적으로 필요한 필드들을 여기에 정의합니다.
  // 예: stakingAmount, lastUpdated, referralCount 등
  current_grill_power: number; // 현재 그릴 파워
  rank: number; // 순위 (프론트엔드에서 계산될 수 있음)
  staking_amount: number; // 스테이킹 금액
  daily_points_sum: number; // 일일 포인트 합계
  total_points: number; // 총 포인트
  snapshot_eligibility: string; // 스냅샷 적격성
  referral_code: string; // 추천인 코드
  referred_by: string; // 누구에게 추천받았는지
  // ... 기타 39개 컬럼에 해당하는 필드들
  cumulative_daily_points: number; // 누적 일일 포인트 (예: 그릴 온도 계산용)
  grill_temperature: number; // 그릴 온도
  genesis_og_eligible: boolean; // 제네시스 OG 자격 여부
  estimated_next_tier: string; // 예상 다음 티어
  current_box_type: string; // 현재 할당된 상자 타입
  // 페이즈 관련 필드 (예시)
  phase1_points: number;
  phase2_points: number;
  phase3_points: number;
  // ... (필요에 따라 더 많은 필드 추가)
}

// 기타 리더보드 관련 타입들이 필요하다면 여기에 추가합니다.
// 예:
// export interface LeaderboardData {
//   last_updated: string;
//   total_rows: number;
//   columns: number;
//   leaderboard: LeaderboardItem[];
// } 