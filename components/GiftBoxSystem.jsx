// GiftBoxSystem.jsx 상단에 추가
import React, { useState, useEffect } from 'react';
import { BoxSyncManager } from '../utils/boxSyncManager';

const APPS_SCRIPT_URL = process.env.NEXT_PUBLIC_APPS_SCRIPT_URL || '';

const GiftBoxSystem = ({
  userStake = 100000,
  userTier = "FLAME_JUGGLER",
  userAddress,
  isMobile = false
}) => {
  const [currentBox, setCurrentBox] = useState(null);
  const [nextDropTime, setNextDropTime] = useState(null);
  const [boxExpireTime, setBoxExpireTime] = useState(null);
  const [isOpening, setIsOpening] = useState(false);
  const [openedBoxes, setOpenedBoxes] = useState([]);
  const [showReward, setShowReward] = useState(null);
  const [showRatesInfo, setShowRatesInfo] = useState(false);
  const [selectedTierForRates, setSelectedTierForRates] = useState(userTier);

  // 컴포넌트 내부
  const [boxSync] = useState(() => new BoxSyncManager(APPS_SCRIPT_URL, userAddress));

  // 상자 시스템 정의 (STAKE 프로젝트 티어 색상 적용)
  // 상자 시스템 정의 (STAKE 프로젝트 티어 색상 적용)
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

  // 티어별 드랍 확률 (1/3 감소 시스템)
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

  // 등급별 멀티플라이어 조회
  const getUserMultiplier = (tier) => {
    //console.log('🔍 받은 tier:', tier); // 디버깅용

    const tierMultipliers = {
      "Genesis OG": 2.0,          // ← 이렇게 수정
      "Heavy Eater": 1.8,
      "Stake Wizard": 1.6,
      "Grilluminati": 1.4,
      "Flame Juggler": 1.25,
      "Flipstarter": 1.1,
      "Sizzlin' Noob": 1.0
    };

    const multiplier = tierMultipliers[tier] || 1.0;
    //console.log('🎯 적용된 멀티플라이어:', multiplier);

    return multiplier;
  };

  // 상자 드랍 로직
  const generateRandomBox = () => {
    const tierKey = userTier?.toUpperCase().replace(/[\s']/g, '_');
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

  // 포인트 계산 (userStake × 1분 × 본인 등급 멀티플라이어 × 상자 멀티플라이어)
  const calculateBoxPoints = (type) => {
    const boxMultiplier = BOX_SYSTEM[type].multiplier;
    const userMultiplier = getUserMultiplier(userTier);

    // 1분 기준 포인트 계산
    const minutePoints = userStake / 24 / 60;

    return Math.floor(minutePoints * boxMultiplier * userMultiplier);
  };

  // 시간 포맷팅
  const formatTimeLeft = (targetTime) => {
    if (!targetTime) return "00:00:00";
    const now = Date.now();
    const diff = Math.max(0, targetTime - now);

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // openBox 함수 수정
  // GiftBoxSystem.jsx의 openBox 함수 전체 교체
  const openBox = () => {
    if (!currentBox || isOpening) return;

    setIsOpening(true);

    setTimeout(() => {
      const points = calculateBoxPoints(currentBox);
      const boxInfo = BOX_SYSTEM[currentBox];

      // 1. 즉시 로컬 업데이트
      const currentTotal = parseFloat(localStorage.getItem(`boxTotalPoints_${userAddress}`) || 0);
      const newTotal = currentTotal + points;
      localStorage.setItem(`boxTotalPoints_${userAddress}`, newTotal.toString());

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

      const newNextDrop = Date.now() + (3 * 1000);
      setNextDropTime(newNextDrop);

      // localStorage 정리
      localStorage.removeItem(`currentBox_${userAddress}`);
      localStorage.removeItem(`boxExpireTime_${userAddress}`);
      localStorage.setItem(`nextDropTime_${userAddress}`, newNextDrop.toString());

      // 3. 서버 저장은 백그라운드에서 (기다리지 않음)
      const boxData = {
        timestamp: Date.now(),
        type: currentBox,
        boxMultiplier: boxInfo.multiplier,
        userMultiplier: getUserMultiplier(userTier),
        points: points
      };

      // 비동기로 서버 저장 (await 없음)
      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: window.location.hostname === 'localhost' ? 'no-cors' : 'cors',
        body: JSON.stringify({
          type: 'box_sync',
          address: userAddress,
          boxes: [boxData]
        })
      }).then(() => {
        console.log('✅ 서버 저장 완료');
      }).catch(error => {
        console.error('서버 저장 실패:', error);
        // 실패해도 이미 로컬은 업데이트됨
      });

      setTimeout(() => setShowReward(null), 5000);
    }, 2000);
  };
  // useEffect에 추가
  useEffect(() => {
    boxSync.startAutoSync();

    return () => {
      boxSync.cleanup();
    };
  }, []);

  // 초기화 및 타이머 관리
  // 초기화 및 타이머 관리
  useEffect(() => {
    // 저장된 상자 상태 복원
    const savedBox = localStorage.getItem(`currentBox_${userAddress}`);
    const savedExpireTime = localStorage.getItem(`boxExpireTime_${userAddress}`);
    const savedNextDrop = localStorage.getItem(`nextDropTime_${userAddress}`);

    if (savedBox && savedExpireTime) {
      const expireTime = parseInt(savedExpireTime);
      if (Date.now() < expireTime) {
        // 아직 유효한 상자
        setCurrentBox(savedBox);
        setBoxExpireTime(expireTime);
      } else {
        // 만료된 상자 정리
        localStorage.removeItem(`currentBox_${userAddress}`);
        localStorage.removeItem(`boxExpireTime_${userAddress}`);
      }
    }

    if (savedNextDrop) {
      setNextDropTime(parseInt(savedNextDrop));
    } else if (!currentBox) {
      //setNextDropTime(Date.now() + (6 * 60 * 60 * 1000));
      setNextDropTime(Date.now() + (1 * 1 * 3 * 1000));
    }

    const timer = setInterval(() => {
      const now = Date.now();

      // 새 상자 드랍 체크
      if (nextDropTime && now >= nextDropTime && !currentBox) {
        const newBox = generateRandomBox();
        setCurrentBox(newBox);
        //setBoxExpireTime(now + (24 * 60 * 60 * 1000));
        setBoxExpireTime(now + (1 * 1 * 3 * 1000));
        setNextDropTime(null);

        // 상자 상태 저장
        localStorage.setItem(`currentBox_${userAddress}`, newBox);
        localStorage.setItem(`boxExpireTime_${userAddress}`, (now + (24 * 60 * 60 * 1000)).toString());
        localStorage.removeItem(`nextDropTime_${userAddress}`);
      }

      // 상자 만료 체크
      if (boxExpireTime && now >= boxExpireTime && currentBox) {
        setCurrentBox(null);
        setBoxExpireTime(null);
        //const newNextDrop = now + (6 * 60 * 60 * 1000);
        const newNextDrop = now + (3 * 1000);
        setNextDropTime(newNextDrop);

        // 상태 정리
        localStorage.removeItem(`currentBox_${userAddress}`);
        localStorage.removeItem(`boxExpireTime_${userAddress}`);
        localStorage.setItem(`nextDropTime_${userAddress}`, newNextDrop.toString());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextDropTime, boxExpireTime, currentBox, userAddress]);

  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toLocaleString();
  };

  return (
    <>
      {/* CSS 애니메이션 */}
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
                  User: {getUserMultiplier(userTier)}x × Box: {BOX_SYSTEM[currentBox].multiplier}x
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
                  = {formatNumber(userStake)} × {getUserMultiplier(userTier)} × {BOX_SYSTEM[currentBox].multiplier}
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

            {/* 드랍률 그리드 - COMMON부터 정렬 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 6
            }}>
              {['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'UNIQUE', 'LEGENDARY', 'GENESIS']
                .map(boxType => {
                  const tierKey = userTier?.toUpperCase().replace(/[\s']/g, '_') || "SIZZLIN_NOOB";
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

      {/* 드랍률 정보 모달 */}
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
                      e.stopPropagation();
                      setSelectedTierForRates(tier);
                    }}
                    style={{
                      background: selectedTierForRates === tier
                        ? 'rgba(139,92,246,0.3)'
                        : 'rgba(255,255,255,0.05)',
                      border: '2px solid transparent',  // 항상 2px 유지
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
                    {tier.replace('_', ' ')}
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
                  • Points = Stake × User Tier Multiplier × Box Multiplier<br />
                  • Higher tier = Better drop rates for rare boxes<br />
                  • Genesis gets 50% chance for Genesis boxes<br />
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