import { PHASE_SCHEDULE } from '../components/constants';

export function getPhaseStartDate(phase: number): Date {
  switch(phase) {
    case 1: return PHASE_SCHEDULE.LAUNCH_DATE;
    case 2: return PHASE_SCHEDULE.PHASE_2_START;
    case 3: return PHASE_SCHEDULE.PHASE_3_START;
    case 4: return PHASE_SCHEDULE.PHASE_4_START;
    case 5: return PHASE_SCHEDULE.PHASE_5_START;
    case 6: return PHASE_SCHEDULE.PHASE_6_START;
    default: return PHASE_SCHEDULE.PHASE_2_START;
  }
}

/**
 * @fileoverview 프로젝트 페이즈(단계) 관련 유틸리티 함수들.
 */

// 페이즈 정의 (예시: 시작 및 종료 날짜/시간)
export const PHASES = [
  {
    id: 1,
    name: 'Phase 1: Genesis Launch',
    startDate: new Date('2025-05-27T00:00:00Z').getTime() / 1000, // Unix Timestamp in seconds
    endDate: new Date('2025-06-10T23:59:59Z').getTime() / 1000,
  },
  {
    id: 2,
    name: 'Phase 2: Ecosystem Growth',
    startDate: new Date('2025-06-11T00:00:00Z').getTime() / 1000,
    endDate: new Date('2025-06-25T23:59:59Z').getTime() / 1000,
  },
  {
    id: 3,
    name: 'Phase 3: Final Push',
    startDate: new Date('2025-06-26T00:00:00Z').getTime() / 1000,
    endDate: new Date('2025-07-10T23:59:59Z').getTime() / 1000,
  },
  // ... 필요한 경우 더 많은 페이즈 추가
];

/**
 * 현재 활성화된 페이즈를 반환합니다.
 * @param currentTime 현재 시간 (Unix 타임스탬프, 초 단위).
 * @returns 현재 활성화된 페이즈 객체 또는 null.
 */
export const getCurrentPhase = (currentTime: number): typeof PHASES[0] | null => {
  for (const phase of PHASES) {
    if (currentTime >= phase.startDate && currentTime <= phase.endDate) {
      return phase;
    }
  }
  return null;
};

/**
 * 특정 페이즈가 시작되었는지 확인합니다.
 * @param phaseId 확인할 페이즈의 ID.
 * @param currentTime 현재 시간 (Unix 타임스탬프, 초 단위).
 * @returns 페이즈가 시작되었으면 true, 아니면 false.
 */
export const isPhaseStarted = (phaseId: number, currentTime: number): boolean => {
  const phase = PHASES.find(p => p.id === phaseId);
  return phase ? currentTime >= phase.startDate : false;
};

/**
 * 특정 페이즈가 종료되었는지 확인합니다.
 * @param phaseId 확인할 페이즈의 ID.
 * @param currentTime 현재 시간 (Unix 타임스탬프, 초 단위).
 * @returns 페이즈가 종료되었으면 true, 아니면 false.
 */
export const isPhaseEnded = (phaseId: number, currentTime: number): boolean => {
  const phase = PHASES.find(p => p.id === phaseId);
  return phase ? currentTime > phase.endDate : false;
};

/**
 * 다음 페이즈까지 남은 시간을 계산합니다.
 * @param currentTime 현재 시간 (Unix 타임스탬프, 초 단위).
 * @returns 다음 페이즈까지 남은 시간 (초) 또는 null (다음 페이즈가 없거나 이미 시작된 경우).
 */
export const getTimeUntilNextPhase = (currentTime: number): number | null => {
  for (const phase of PHASES) {
    if (currentTime < phase.startDate) {
      return phase.startDate - currentTime;
    }
  }
  return null; // 모든 페이즈가 이미 시작되었거나 종료됨
}; 