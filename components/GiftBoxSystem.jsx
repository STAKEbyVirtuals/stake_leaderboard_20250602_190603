import React, { useState, useEffect } from 'react';
import { BoxSyncManager } from '../utils/boxSyncManager';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

const GiftBoxSystem = ({ 
  userData,
  isMobile = false,
  onPointsUpdate = () => {} // 포인트 업데이트 콜백
}) => {
  // 🆕 실제 백엔드 상태 관리 (원본 로직)
  const [currentBox, setCurrentBox] = useState(null);
  const [nextDropTime, setNextDropTime] = useState(null);
  const [boxExpireTime, setBoxExpireTime] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedBoxes, setOpenedBoxes] = useState([]);
  const [showReward, setShowReward] = useState(null);
  const [showRatesInfo, setShowRatesInfo] = useState(false);
  const [selectedTierForRates, setSelectedTierForRates] = useState('FLAME_JUGGLER');

  // 🔄 백엔드 동기화 관리자 (완전 복구)
  const [boxSync] = useState(() => {
    if (userData?.address) {
      // DEBUG_BOX_SYSTEM: 초기화 로그
      // console.log('🔧 [DEBUG] BoxSyncManager 초기화:', {
      //   userAddress: userData.address,
      //   appsScriptUrl: APPS_SCRIPT_URL,
      //   timestamp: new Date().toISOString()
      // });
      return new BoxSyncManager(APPS_SCRIPT_URL, userData.address);
    }
    // DEBUG_BOX_SYSTEM: 초기화 실패 로그
    // console.log('❌ [DEBUG] BoxSyncManager 초기화 실패: userData.address 없음');
    return null;
  });

  // 🎁 원본 박스 시스템 (프로젝트 지식과 완전 동일)
  const BOX_SYSTEM = {
    "COMMON": {
      name: "일반 상자",
      emoji: "📦",
      multiplier: 10,
      color: "#9ca3af",
      glow: "rgba(156, 163, 175, 0.5)",
      rarity: "Common"
    },
    "UNCOMMON": {
      name: "고급 상자",
      emoji: "🎁",
      multiplier: 15,
      color: "#22c55e",
      glow: "rgba(34, 197, 94, 0.5)",
      rarity: "Uncommon"
    },
    "RARE": {
      name: "희귀 상자",
      emoji: "💎",
      multiplier: 20,
      color: "#3b82f6",
      glow: "rgba(59, 130, 246, 0.5)",
      rarity: "Rare"
    },
    "EPIC": {
      name: "영웅 상자",
      emoji: "🔮",
      multiplier: 35,
      color: "#9333ea",
      glow: "rgba(147, 51, 234, 0.5)",
      rarity: "Epic"
    },
    "UNIQUE": {
      name: "유니크 상자",
      emoji: "🧙‍♂️",
      multiplier: 50,
      color: "#fbbf24",
      glow: "rgba(251, 191, 36, 0.5)",
      rarity: "Unique"
    },
    "LEGENDARY": {
      name: "전설 상자",
      emoji: "⚡",
      multiplier: 70,
      color: "#ef4444",
      glow: "rgba(239, 68, 68, 0.5)",
      rarity: "Legendary"
    },
    "GENESIS": {
      name: "창세 상자",
      emoji: "👑",
      multiplier: 100,
      color: "#10b981",
      glow: "rgba(16, 185, 129, 0.8)",
      rarity: "Genesis"
    }
  };

  // 🎯 원본 드롭률 시스템 (1/3 감소 시스템)
  const DROP_RATES = {
    "GENESIS_OG": {
      "COMMON": 3, "UNCOMMON": 5, "RARE": 7, "EPIC": 10,
      "UNIQUE": 12, "LEGENDARY": 13, "GENESIS": 50
    },
    "HEAVY_EATER": {
      "COMMON": 5, "UNCOMMON": 8, "RARE": 12, "EPIC": 15,
      "UNIQUE": 18, "LEGENDARY": 25, "GENESIS": 16.67
    },
    "STAKE_WIZARD": {
      "COMMON": 8, "UNCOMMON": 12, "RARE": 18, "EPIC": 22,
      "UNIQUE": 30, "LEGENDARY": 8.33, "GENESIS": 5.56
    },
    "GRILLUMINATI": {
      "COMMON": 12, "UNCOMMON": 18, "RARE": 25, "EPIC": 35,
      "UNIQUE": 10, "LEGENDARY": 2.78, "GENESIS": 1.85
    },
    "FLAME_JUGGLER": {
      "COMMON": 18, "UNCOMMON": 25, "RARE": 40, "EPIC": 11.67,
      "UNIQUE": 3.33, "LEGENDARY": 0.93, "GENESIS": 0.62
    },
    "FLIPSTARTER": {
      "COMMON": 25, "UNCOMMON": 45, "RARE": 13.33, "EPIC": 3.89,
      "UNIQUE": 1.11, "LEGENDARY": 0.31, "GENESIS": 0.21
    },
    "SIZZLIN_NOOB": {
      "COMMON": 55, "UNCOMMON": 15, "RARE": 4.44, "EPIC": 1.30,
      "UNIQUE": 0.37, "LEGENDARY": 0.10, "GENESIS": 0.07
    }
  };

  // 🔧 등급별 멀티플라이어 조회 (원본 로직)
  const getUserMultiplier = (tier) => {
    const tierMultipliers = {
      "Genesis OG": 2.0,
      "Heavy Eater": 1.8,
      "Stake Wizard": 1.6,
      "Grilluminati": 1.4,
      "Flame Juggler": 1.25,
      "Flipstarter": 1.1,
      "Sizzlin' Noob": 1.0
    };
    return tierMultipliers[tier] || 1.0;
  };

  // 🔧 유틸리티 함수들
  const formatTimeLeft = (targetTime) => {
    if (!targetTime) return "00:00:00";
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toLocaleString();
  };

  // 🎲 상자 생성 로직 (원본과 동일)
  const generateRandomBox = () => {
    const tierKey = userData?.grade?.toUpperCase().replace(/[\s']/g, '_') || 'SIZZLIN_NOOB';
    const rates = DROP_RATES[tierKey] || DROP_RATES["SIZZLIN_NOOB"];
    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [boxType, rate] of Object.entries(rates)) {
      cumulative += rate;
      if (random <= cumulative) {
        return boxType;
      }
    }
    return "COMMON";
  };

  // 💰 포인트 계산 (원본 로직 - 1분 기준)
  const calculateBoxPoints = (type) => {
    if (!userData) return 0;
    
    const boxMultiplier = BOX_SYSTEM[type].multiplier;
    const userMultiplier = getUserMultiplier(userData.grade);
    const userStake = userData.display_staked || 0;
    
    // 1분 기준 포인트 계산
    const minutePoints = userStake / 24 / 60;
    return Math.floor(minutePoints * boxMultiplier * userMultiplier);
  };

  // 🎁 상자 오픈 (안전한 백엔드 연동 복구)
  const openBox = () => {
    if (!currentBox || isOpening || !userData || !boxSync) return;

    setIsOpening(true);

    setTimeout(() => {
      const points = calculateBoxPoints(currentBox);
      const boxInfo = BOX_SYSTEM[currentBox];
      const userAddress = userData.address;

      // 1. 즉시 로컬 업데이트 (UI 반응성)
      const currentTotal = parseFloat(localStorage.getItem(`boxTotalPoints_${userAddress}`) || 0);
      const newTotal = currentTotal + points;
      localStorage.setItem(`boxTotalPoints_${userAddress}`, newTotal.toString());

      // 커스텀 이벤트 발생
      window.dispatchEvent(new CustomEvent('boxPointsUpdated', {
        detail: { address: userAddress, newPoints: points, totalPoints: newTotal }
      }));

      // 2. 즉시 UI 업데이트
      const reward = {
        type: currentBox,
        points: points,
        boxInfo: boxInfo,
        timestamp: Date.now()
      };

      setShowReward(reward);
      setOpenedBoxes(prev => [reward, ...prev].slice(0, 10));
      setCurrentBox(null);
      setBoxExpireTime(null);
      setIsOpening(false);

      // 다음 드롭 시간 설정 (테스트용 3초)
      const newNextDrop = Date.now() + (3 * 1000); // 3초
      setNextDropTime(newNextDrop);

      // localStorage 정리
      localStorage.removeItem(`currentBox_${userAddress}`);
      localStorage.removeItem(`boxExpireTime_${userAddress}`);
      localStorage.setItem(`nextDropTime_${userAddress}`, newNextDrop.toString());

      // 🔄 3. 안전한 서버 저장 (BoxSyncManager 사용)
      const boxData = {
        type: currentBox,
        boxMultiplier: boxInfo.multiplier,
        userMultiplier: getUserMultiplier(userData.grade),
        points: points
      };

      // DEBUG_BOX_SYSTEM: 상자 오픈 상세 로그
      // console.log('📦 [DEBUG] 상자 오픈 데이터:', {
      //   상자타입: currentBox,
      //   박스배수: boxInfo.multiplier,
      //   유저배수: getUserMultiplier(userData.grade),
      //   계산포인트: points,
      //   유저주소: userData.address,
      //   timestamp: new Date().toISOString()
      // });

      try {
        if (boxSync) {
          // DEBUG_BOX_SYSTEM: BoxSyncManager 호출 로그
          // console.log('🔄 [DEBUG] BoxSyncManager.recordBox() 호출 시작');
          const result = boxSync.recordBox(boxData);
          // console.log('✅ [DEBUG] BoxSyncManager.recordBox() 성공:', result);
        } else {
          // DEBUG_BOX_SYSTEM: BoxSyncManager null 에러 로그
          // console.error('❌ [DEBUG] BoxSyncManager가 null입니다');
        }
      } catch (error) {
        // DEBUG_BOX_SYSTEM: BoxSyncManager 에러 로그
        // console.error('❌ [DEBUG] BoxSyncManager.recordBox() 실패:', {
        //   error: error.message,
        //   stack: error.stack,
        //   boxData: boxData
        // });
      }

      // 부모 컴포넌트에 포인트 업데이트 알림
      onPointsUpdate(points);

      // 5초 후 리워드 알림 숨김
      setTimeout(() => setShowReward(null), 5000);
      
      console.log(`✅ 상자 오픈 완료: ${currentBox} → +${points} 포인트`);
    }, 2000);
  };

  // 🔄 초기화 (한 번만 실행, 타이머 초기화 문제 해결)
  useEffect(() => {
    if (!userData?.address) return;

    const userAddress = userData.address;

    // 저장된 상자 상태 복원 (초기에만)
    const savedBox = localStorage.getItem(`currentBox_${userAddress}`);
    const savedExpireTime = localStorage.getItem(`boxExpireTime_${userAddress}`);
    const savedNextDrop = localStorage.getItem(`nextDropTime_${userAddress}`);

    // 초기 상태 설정
    if (savedBox && savedExpireTime) {
      const expireTime = parseInt(savedExpireTime);
      if (Date.now() < expireTime) {
        setCurrentBox(savedBox);
        setBoxExpireTime(expireTime);
        // DEBUG_BOX_SYSTEM: 상자 복원 로그
        // console.log('🔄 저장된 상자 복원:', savedBox);
      } else {
        localStorage.removeItem(`currentBox_${userAddress}`);
        localStorage.removeItem(`boxExpireTime_${userAddress}`);
        // DEBUG_BOX_SYSTEM: 만료된 상자 정리 로그
        // console.log('🗑️ 만료된 상자 정리');
      }
    }

    if (savedNextDrop) {
      setNextDropTime(parseInt(savedNextDrop));
      // DEBUG_BOX_SYSTEM: 드롭 시간 복원 로그
      // console.log('🔄 저장된 드롭 시간 복원:', new Date(parseInt(savedNextDrop)));
    } else if (!savedBox) {
      // 첫 드롭 시간 설정 (테스트용 3초)
      const initialDrop = Date.now() + (3 * 1000); // 3초
      setNextDropTime(initialDrop);
      localStorage.setItem(`nextDropTime_${userAddress}`, initialDrop.toString());
      // DEBUG_BOX_SYSTEM: 첫 드롭 시간 설정 로그
      // console.log('🆕 첫 드롭 시간 설정:', new Date(initialDrop));
    }

    // 사용자 티어 설정 (초기에만)
    if (userData.grade) {
      const tierKey = userData.grade.toUpperCase().replace(/[\s']/g, '_');
      setSelectedTierForRates(tierKey);
    }

    // 백엔드 동기화 시작 (BoxSyncManager)
    if (boxSync) {
      // DEBUG_BOX_SYSTEM: 자동 동기화 시작 로그
      // console.log('🔄 [DEBUG] BoxSyncManager.startAutoSync() 호출');
      boxSync.startAutoSync();
      // console.log('✅ [DEBUG] BoxSyncManager 자동 동기화 시작 완료');
      
      // DEBUG_BOX_SYSTEM: 동기화 상태 모니터링 (10초마다)
      // const syncMonitor = setInterval(() => {
      //   if (boxSync.syncQueue) {
      //     console.log('📊 [DEBUG] 동기화 큐 상태:', {
      //       큐길이: boxSync.syncQueue.length,
      //       동기화중: boxSync.isSyncing,
      //       timestamp: new Date().toISOString()
      //     });
      //   }
      // }, 10000); // 10초마다 체크

      // cleanup 함수에 모니터 정리 추가
      const originalCleanup = () => {
        // DEBUG_BOX_SYSTEM: 동기화 모니터 정리
        // clearInterval(syncMonitor);
        if (boxSync) {
          boxSync.cleanup();
          // DEBUG_BOX_SYSTEM: BoxSyncManager 정리 로그
          // console.log('🛑 [DEBUG] BoxSyncManager 정리 완료');
        }
      };

      return originalCleanup;
    } else {
      // DEBUG_BOX_SYSTEM: BoxSyncManager 초기화 실패 로그
      // console.error('❌ [DEBUG] BoxSyncManager가 초기화되지 않았습니다');
    }
  }, [userData?.address]); // userData.address가 변경될 때만 실행

  // 🕐 실시간 타이머 (독립 실행, 의존성 최소화로 초기화 방지)
  useEffect(() => {
    if (!userData?.address) return;

    // DEBUG_BOX_SYSTEM: 타이머 시작 로그
    // console.log('⏰ 타이머 시작');

    const timer = setInterval(() => {
      const now = Date.now();
      const userAddress = userData.address;

      // localStorage에서 직접 읽어서 최신 상태 확인 (state 의존 제거)
      const savedBox = localStorage.getItem(`currentBox_${userAddress}`);
      const savedExpireTime = localStorage.getItem(`boxExpireTime_${userAddress}`);
      const savedNextDrop = localStorage.getItem(`nextDropTime_${userAddress}`);

      const currentExpireTime = savedExpireTime ? parseInt(savedExpireTime) : null;
      const currentNextDrop = savedNextDrop ? parseInt(savedNextDrop) : null;

      // 새 상자 드랍 체크
      if (currentNextDrop && now >= currentNextDrop && !savedBox) {
        const newBox = generateRandomBox();
        
        // 만료 시간 설정 (24시간)
        const expireTime = now + (24 * 60 * 60 * 1000); // 24시간

        // 상태 업데이트
        setCurrentBox(newBox);
        setBoxExpireTime(expireTime);
        setNextDropTime(null);

        // localStorage 업데이트
        localStorage.setItem(`currentBox_${userAddress}`, newBox);
        localStorage.setItem(`boxExpireTime_${userAddress}`, expireTime.toString());
        localStorage.removeItem(`nextDropTime_${userAddress}`);

        // DEBUG_BOX_SYSTEM: 새 상자 드롭 로그
        // console.log(`🎁 [DEBUG] 새 상자 드롭:`, {
        //   상자타입: newBox,
        //   만료시간: new Date(expireTime).toISOString(),
        //   유저주소: userAddress,
        //   현재시간: new Date().toISOString()
        // });
      }

      // 상자 만료 체크
      if (currentExpireTime && now >= currentExpireTime && savedBox) {
        // DEBUG_BOX_SYSTEM: 상자 만료 로그
        // console.log('⏰ [DEBUG] 상자 만료됨:', {
        //   만료된상자: savedBox,
        //   만료시간: new Date(currentExpireTime).toISOString(),
        //   다음드롭: new Date(newNextDrop).toISOString(),
        //   현재시간: new Date().toISOString()
        // });
        
        // 다음 드롭 시간 설정 (테스트용 3초)
        const newNextDrop = now + (3 * 1000); // 3초

        // 상태 업데이트
        setCurrentBox(null);
        setBoxExpireTime(null);
        setNextDropTime(newNextDrop);

        // localStorage 업데이트
        localStorage.removeItem(`currentBox_${userAddress}`);
        localStorage.removeItem(`boxExpireTime_${userAddress}`);
        localStorage.setItem(`nextDropTime_${userAddress}`, newNextDrop.toString());

        // DEBUG_BOX_SYSTEM: 다음 드롭 예정 로그
        // console.log(`⏰ [DEBUG] 다음 드롭 예정:`, {
        //   다음드롭시간: new Date(newNextDrop).toISOString(),
        //   유저주소: userAddress
        // });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      // DEBUG_BOX_SYSTEM: 타이머 정리 로그
      // console.log('🛑 타이머 정리');
    };
  }, [userData?.address]); // userData.address만 의존성으로 유지

  if (!userData) return null;

  return (
    <>
      {/* 🆕 CSS 애니메이션 (원본과 동일) */}
      <style jsx>{`
        @keyframes boxFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes boxShake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        
        @keyframes rewardPop {
          0% { transform: scale(0) rotate(-10deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(5deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        
        .box-float {
          animation: boxFloat 3s ease-in-out infinite;
        }
        
        .box-shake {
          animation: boxShake 0.5s ease-in-out infinite;
        }
        
        .sparkle {
          animation: sparkle 1.5s ease-in-out infinite;
        }
        
        .reward-pop {
          animation: rewardPop 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
        border: '2px solid rgba(139,92,246,0.3)',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? 20 : 24,
        marginBottom: isMobile ? 16 : 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? 16 : 20
        }}>
          <h2 style={{
            fontSize: isMobile ? 18 : 22,
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🎁 Gift Box System
          </h2>

          <div style={{
            fontSize: 11,
            background: 'rgba(139,92,246,0.2)',
            color: '#8b5cf6',
            padding: '4px 8px',
            borderRadius: 6,
            fontWeight: 600
          }}>
            Every 6H
          </div>
        </div>

        {/* 메인 상자 영역 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? 16 : 24,
          marginBottom: isMobile ? 16 : 20
        }}>
          {/* 현재 상자 */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 16,
            padding: isMobile ? 16 : 20,
            textAlign: 'center',
            minHeight: isMobile ? 150 : 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative'
          }}>
            {currentBox ? (
              <>
                {/* 현재 상자 표시 */}
                <div
                  className={isOpening ? "box-shake" : "box-float"}
                  onClick={openBox}
                  style={{
                    fontSize: isMobile ? 40 : 60,
                    marginBottom: 12,
                    cursor: 'pointer',
                    filter: `drop-shadow(0 0 20px ${BOX_SYSTEM[currentBox].glow})`,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isMobile) e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isMobile) e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {BOX_SYSTEM[currentBox].emoji}
                </div>

                <div style={{
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 700,
                  color: BOX_SYSTEM[currentBox].color,
                  marginBottom: 8
                }}>
                  {BOX_SYSTEM[currentBox].name}
                </div>

                <div style={{
                  fontSize: isMobile ? 10 : 12,
                  color: '#999',
                  marginBottom: 8
                }}>
                  User: {getUserMultiplier(userData.grade)}x × Box: {BOX_SYSTEM[currentBox].multiplier}x
                </div>

                <div style={{
                  fontSize: isMobile ? 11 : 12,
                  color: '#4ade80',
                  fontFamily: 'monospace',
                  marginBottom: 8,
                  fontWeight: 600
                }}>
                  +{formatNumber(calculateBoxPoints(currentBox))} Points
                </div>

                <div style={{
                  fontSize: isMobile ? 9 : 10,
                  color: '#fbbf24',
                  background: 'rgba(251,191,36,0.1)',
                  padding: '2px 6px',
                  borderRadius: 4,
                  border: '1px solid rgba(251,191,36,0.2)',
                  marginBottom: 8
                }}>
                  = {formatNumber(userData.display_staked)} × {getUserMultiplier(userData.grade)} × {BOX_SYSTEM[currentBox].multiplier}
                </div>

                {!isOpening && (
                  <div style={{
                    fontSize: isMobile ? 10 : 11,
                    color: '#fbbf24',
                    background: 'rgba(251,191,36,0.1)',
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: '1px solid rgba(251,191,36,0.3)',
                    marginBottom: 8
                  }}>
                    👆 Click to Open!
                  </div>
                )}

                {/* 만료 시간 */}
                <div style={{
                  fontSize: isMobile ? 10 : 11,
                  color: '#ef4444',
                  fontFamily: 'monospace',
                  background: 'rgba(239,68,68,0.1)',
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(239,68,68,0.3)'
                }}>
                  ⏰ {formatTimeLeft(boxExpireTime)}
                </div>

                {/* 반짝임 효과 */}
                {Array.from({ length: 3 }, (_, i) => (
                  <div
                    key={i}
                    className="sparkle"
                    style={{
                      position: 'absolute',
                      top: `${20 + i * 30}%`,
                      left: `${15 + i * 25}%`,
                      width: 6,
                      height: 6,
                      background: BOX_SYSTEM[currentBox].color,
                      borderRadius: '50%',
                      animationDelay: `${i * 0.5}s`
                    }}
                  />
                ))}
              </>
            ) : (
              <>
                {/* 대기 상태 */}
                <div style={{
                  fontSize: isMobile ? 32 : 48,
                  marginBottom: 12,
                  opacity: 0.5
                }}>
                  📦
                </div>
                <div style={{
                  fontSize: isMobile ? 14 : 16,
                  color: '#999',
                  marginBottom: 8
                }}>
                  Next Box In
                </div>
                <div style={{
                  fontSize: isMobile ? 16 : 20,
                  fontWeight: 700,
                  color: '#8b5cf6',
                  fontFamily: 'monospace'
                }}>
                  {formatTimeLeft(nextDropTime)}
                </div>
              </>
            )}
          </div>

          {/* 상자 정보 */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 16,
            padding: isMobile ? 16 : 20
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12
            }}>
              <h4 style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                color: '#8b5cf6',
                margin: 0
              }}>
                📊 Your Drop Rates
              </h4>

              <button
                onClick={() => setShowRatesInfo(!showRatesInfo)}
                style={{
                  background: 'rgba(139,92,246,0.2)',
                  border: '1px solid rgba(139,92,246,0.5)',
                  borderRadius: 6,
                  color: '#8b5cf6',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '4px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(139,92,246,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(139,92,246,0.2)';
                }}
              >
                ℹ️ Info
              </button>
            </div>

            {/* 드랍률 그리드 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 6
            }}>
              {['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY', 'GENESIS']
                .map(boxType => {
                  const tierKey = userData?.grade?.toUpperCase().replace(/[\s']/g, '_') || "SIZZLIN_NOOB";
                  const dropRates = DROP_RATES[tierKey] || DROP_RATES["SIZZLIN_NOOB"];
                  const rate = dropRates[boxType] || 0;
                  return (
                    <div key={boxType} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '6px 8px',
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 6,
                      fontSize: isMobile ? 10 : 11,
                      border: rate > 20 ? `1px solid ${BOX_SYSTEM[boxType].color}40` : '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <span style={{ fontSize: isMobile ? 10 : 12 }}>
                          {BOX_SYSTEM[boxType].emoji}
                        </span>
                        <span style={{
                          color: BOX_SYSTEM[boxType].color,
                          fontSize: isMobile ? 9 : 10,
                          fontWeight: 600
                        }}>
                          {BOX_SYSTEM[boxType].rarity}
                        </span>
                      </div>
                      <span style={{
                        color: rate > 20 ? BOX_SYSTEM[boxType].color : '#fff',
                        fontWeight: rate > 20 ? 700 : 600,
                        fontFamily: 'monospace',
                        fontSize: isMobile ? 9 : 10
                      }}>
                        {rate.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* 최근 획득 내역 */}
        {openedBoxes.length > 0 && (
          <div style={{
            background: 'rgba(0,0,0,0.2)',
            borderRadius: 12,
            padding: isMobile ? 12 : 16
          }}>
            <h4 style={{
              fontSize: isMobile ? 13 : 14,
              fontWeight: 700,
              color: '#8b5cf6',
              margin: '0 0 12px 0'
            }}>
              📜 Recent Rewards
            </h4>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              maxHeight: 100,
              overflowY: 'auto'
            }}>
              {openedBoxes.slice(0, 3).map((reward, index) => (
                <div key={reward.timestamp} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 8px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: 6,
                  fontSize: isMobile ? 10 : 11
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}>
                    <span>{reward.boxInfo.emoji}</span>
                    <span style={{ color: reward.boxInfo.color }}>
                      {reward.boxInfo.rarity}
                    </span>
                  </div>
                  <span style={{
                    color: '#4ade80',
                    fontWeight: 600,
                    fontFamily: 'monospace'
                  }}>
                    +{formatNumber(reward.points)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 리워드 알림 팝업 */}
      {showReward && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #1a1d29 0%, #252833 50%, #1e2028 100%)',
          border: `3px solid ${showReward.boxInfo.color}`,
          borderRadius: 20,
          padding: isMobile ? 24 : 32,
          textAlign: 'center',
          boxShadow: `0 0 50px ${showReward.boxInfo.glow}, 0 25px 50px rgba(0,0,0,0.5)`,
          minWidth: isMobile ? 280 : 320
        }}
          className="reward-pop"
        >
          <div style={{
            fontSize: isMobile ? 48 : 64,
            marginBottom: 16,
            filter: `drop-shadow(0 0 20px ${showReward.boxInfo.glow})`
          }}>
            {showReward.boxInfo.emoji}
          </div>

          <h3 style={{
            fontSize: isMobile ? 18 : 22,
            fontWeight: 800,
            color: showReward.boxInfo.color,
            margin: '0 0 8px 0'
          }}>
            {showReward.boxInfo.name}
          </h3>

          <div style={{
            fontSize: isMobile ? 24 : 32,
            fontWeight: 900,
            color: '#4ade80',
            marginBottom: 8,
            fontFamily: 'monospace'
          }}>
            +{formatNumber(showReward.points)}
          </div>

          <div style={{
            fontSize: isMobile ? 12 : 14,
            color: '#999'
          }}>
            Points Added!
          </div>
        </div>
      )}

      {/* 🆕 원본 스타일 드롭률 정보 모달 */}
      {showRatesInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? 16 : 20
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #1a1d29 0%, #252833 50%, #1e2028 100%)',
            borderRadius: isMobile ? 16 : 20,
            padding: isMobile ? 20 : 32,
            maxWidth: isMobile ? '90vw' : 600,
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            border: '2px solid rgba(139,92,246,0.3)'
          }}>
            {/* 헤더 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <h3 style={{
                fontSize: isMobile ? 18 : 22,
                fontWeight: 800,
                color: '#8b5cf6',
                margin: 0
              }}>
                📊 Drop Rates by Tier
              </h3>
              
              <button
                onClick={() => setShowRatesInfo(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 18,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* 티어 선택 */}
            <div style={{
              marginBottom: 20
            }}>
              <div style={{
                fontSize: 14,
                color: '#ccc',
                marginBottom: 12
              }}>
                Select tier to view drop rates:
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: 8
              }}>
                {Object.keys(DROP_RATES).map(tier => (
                  <button
                    key={tier}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedTierForRates(tier);
                    }}
                    style={{
                      background: selectedTierForRates === tier
                        ? 'rgba(139,92,246,0.3)'
                        : 'rgba(255,255,255,0.05)',
                      border: '2px solid',
                      borderColor: selectedTierForRates === tier
                        ? 'rgba(139,92,246,0.6)'
                        : 'rgba(255,255,255,0.1)',
                      borderRadius: 8,
                      color: selectedTierForRates === tier ? '#8b5cf6' : '#ccc',
                      fontSize: isMobile ? 10 : 12,
                      fontWeight: 600,
                      padding: '8px 4px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center'
                    }}
                  >
                    {tier.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* 선택된 티어의 드랍률 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              padding: 16
            }}>
              <h4 style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                color: '#fff',
                margin: '0 0 16px 0'
              }}>
                {selectedTierForRates.replace('_', ' ')} Drop Rates
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 8
              }}>
                {['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY', 'GENESIS']
                  .map(boxType => {
                    const rates = DROP_RATES[selectedTierForRates] || DROP_RATES["SIZZLIN_NOOB"];
                    const rate = rates[boxType] || 0;
                    return (
                      <div key={boxType} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: 8,
                        fontSize: isMobile ? 12 : 14,
                        border: '1px solid rgba(255,255,255,0.05)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8
                        }}>
                          <span style={{ fontSize: isMobile ? 14 : 16 }}>
                            {BOX_SYSTEM[boxType].emoji}
                          </span>
                          <div>
                            <div style={{ 
                              color: BOX_SYSTEM[boxType].color,
                              fontSize: isMobile ? 11 : 12,
                              fontWeight: 700
                            }}>
                              {BOX_SYSTEM[boxType].rarity}
                            </div>
                            <div style={{ 
                              color: '#999',
                              fontSize: isMobile ? 9 : 10
                            }}>
                              {BOX_SYSTEM[boxType].multiplier}x
                            </div>
                          </div>
                        </div>
                        <span style={{ 
                          color: '#fff',
                          fontWeight: 600,
                          fontFamily: 'monospace',
                          fontSize: isMobile ? 12 : 14
                        }}>
                          {rate.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
              </div>
              
              {/* 설명 */}
              <div style={{
                marginTop: 16,
                padding: 12,
                background: 'rgba(139,92,246,0.1)',
                borderRadius: 8,
                border: '1px solid rgba(139,92,246,0.2)'
              }}>
                <div style={{
                  fontSize: isMobile ? 11 : 12,
                  color: '#8b5cf6',
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  💡 How it works:
                </div>
                <div style={{
                  fontSize: isMobile ? 10 : 11,
                  color: '#ccc',
                  lineHeight: 1.4
                }}>
                  • Points = Stake × User Tier Multiplier × Box Multiplier<br/>
                  • Higher tier = Better drop rates for rare boxes<br/>
                  • Genesis gets 50% chance for Genesis boxes<br/>
                  • Boxes drop every 6 hours, expire in 24 hours
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GiftBoxSystem;