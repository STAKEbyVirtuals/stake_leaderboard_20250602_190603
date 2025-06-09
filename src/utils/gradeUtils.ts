/**
 * @fileoverview 티어(등급) 및 랭크 배지 관련 유틸리티 함수들.
 */

import { IMAGE_PATHS, TIER_GRADES } from '../components/constants';
import { LeaderboardItem } from '../types'; // LeaderboardItem 타입을 사용합니다.

/**
 * 특정 티어 등급에 해당하는 아바타 이미지 경로를 반환합니다.
 * @param tier 티어 등급 문자열.
 * @returns 아바타 이미지 경로.
 */
export const getTierAvatar = (tier: string): string => {
  switch (tier) {
    case 'Sizzlin\' Noob':
      return IMAGE_PATHS.TIER_AVATAR_SIZZLIN_NOOB;
    case 'Flipstarter':
      return '/images/avatars/flipstarter.png'; // 예시: 다른 아바타 경로
    case 'Flame Juggler':
      return '/images/avatars/flame_juggler.png';
    case 'Grilluminati':
      return '/images/avatars/grilluminati.png';
    case 'Stake Wizard':
      return '/images/avatars/stake_wizard.png';
    case 'Heavy Eater':
      return '/images/avatars/heavy_eater.png';
    case 'Genesis OG':
      return '/images/avatars/genesis_og.png';
    default:
      return IMAGE_PATHS.PROFILE_PLACEHOLDER; // 기본 플레이스홀더 이미지
  }
};

/**
 * 사용자의 랭크에 따라 랭크 배지 이미지 경로를 반환합니다.
 * @param rank 사용자의 순위.
 * @returns 랭크 배지 이미지 경로.
 */
export const getRankBadge = (rank: number): string => {
  if (rank === 1) {
    return IMAGE_PATHS.RANK_BADGE_GOLD;
  }
  if (rank >= 2 && rank <= 10) {
    return IMAGE_PATHS.RANK_BADGE_SILVER;
  }
  if (rank >= 11 && rank <= 50) {
    return IMAGE_PATHS.RANK_BADGE_BRONZE;
  }
  return ''; // 배지가 없는 경우 빈 문자열 반환
};

/**
 * 현재 티어에 따라 다음 예상 티어를 반환합니다.
 * 이 함수는 Apps Script의 `predictNextTier` 로직과 유사할 수 있습니다.
 * @param currentTier 현재 사용자의 티어.
 * @returns 다음 예상 티어 문자열.
 */
export const predictNextTier = (currentTier: string): string => {
  const currentIndex = TIER_GRADES.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === TIER_GRADES.length - 1) {
    // 현재 티어가 없거나 이미 최고 티어인 경우
    return currentTier;
  }
  return TIER_GRADES[currentIndex + 1];
};

/**
 * 사용자의 점수를 기반으로 티어(등급)를 결정합니다.
 * 이 로직은 백엔드(Apps Script)에서 계산된 `tier` 값을 주로 사용하겠지만,
 * 프론트엔드에서 시뮬레이션하거나 특정 기준에 따라 티어를 결정해야 할 때 사용될 수 있습니다.
 * (실제 티어 결정 로직은 백엔드와 동기화되어야 합니다.)
 * @param score 사용자의 점수.
 * @returns 티어 등급 문자열.
 */
export const determineTierByScore = (score: number): string => {
  // TODO: 실제 티어 결정 기준에 따라 로직 구현
  // 이는 백엔드 로직과 일치해야 합니다. Apps Script의 calculatePowerBasedTemperature를 참조하세요.
  // 예시:
  if (score >= 10000) return 'Genesis OG';
  if (score >= 5000) return 'Heavy Eater';
  if (score >= 2000) return 'Stake Wizard';
  if (score >= 1000) return 'Grilluminati';
  if (score >= 500) return 'Flame Juggler';
  if (score >= 100) return 'Flipstarter';
  return 'Sizzlin\' Noob';
};

/**
 * 유저 객체에서 티어를 가져옵니다. (안전하게 접근)
 * @param user LeaderboardItem 객체.
 * @returns 유저의 티어 문자열 또는 기본값.
 */
export const getUserTier = (user: LeaderboardItem): string => {
  return user.tier || 'Sizzlin\' Noob'; // 기본 티어
};

export function getGradeImagePath(grade: string): string {
  const gradeImages: Record<string, string> = {
    "Genesis OG": "/images/grades/genesis-og.png",
    "Heavy Eater": "/images/grades/heavy-eater.png",
    "Stake Wizard": "/images/grades/stake-wizard.png", // 'Steak Wizard'에서 'Stake Wizard'로 수정
    "Grilluminati": "/images/grades/grilluminati.png",
    "Flame Juggler": "/images/grades/flame-juggler.png",
    "Flipstarter": "/images/grades/flipstarter.png",
    "Sizzlin' Noob": "/images/grades/sizzlin-noob.png",
    "Jeeted": "/images/grades/jeeted.png"
  };
  return gradeImages[grade] || "/images/grades/default.png";
}

export function getGradeAvatar(grade: string): string {
  return gradeEmoji[grade] || "❓";
}

export function getBoxSize(width: number, height: number): 'large' | 'medium' | 'small' | 'tiny' {
  const area = width * height;
  if (area > 20000) return 'large';
  if (area > 12000) return 'medium';
  if (area > 5000) return 'small';
  return 'tiny';
} 