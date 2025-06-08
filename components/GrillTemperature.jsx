import React, { useState, useEffect } from 'react';

const GrillTemperature = ({ 
  userStake = 100000, 
  referralBonus = 5000, 
  userTier = "FLAME_JUGGLER",
  totalUsers = 1247,
  userRank = 156,
  isMobile = false 
}) => {
  const [currentTemp, setCurrentTemp] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [flameIntensity, setFlameIntensity] = useState(0);

  // 페이즈별 티어 분배 기준 (퍼센타일)
  const TIER_THRESHOLDS = {
    "GENESIS_OG": 1,      // 상위 1%
    "HEAVY_EATER": 5,     // 상위 2-5%
    "STAKE_WIZARD": 15,   // 상위 6-15%
    "GRILLUMINATI": 30,   // 상위 16-30%
    "FLAME_JUGGLER": 50,  // 상위 31-50%
    "FLIPSTARTER": 75,    // 상위 51-75%
    "SIZZLIN_NOOB": 100   // 상위 76-100%
  };

  // 티어별 색상 및 정보
  const TIER_INFO = {
    "GENESIS_OG": { color: "#10b981", emoji: "🌌", name: "Genesis OG" },
    "HEAVY_EATER": { color: "#ef4444", emoji: "💨", name: "Heavy Eater" },
    "STAKE_WIZARD": { color: "#fbbf24", emoji: "🧙", name: "Stake Wizard" },
    "GRILLUMINATI": { color: "#9333ea", emoji: "👁️", name: "Grilluminati" },
    "FLAME_JUGGLER": { color: "#3b82f6", emoji: "🔥", name: "Flame Juggler" },
    "FLIPSTARTER": { color: "#22c55e", emoji: "🥩", name: "Flipstarter" },
    "SIZZLIN_NOOB": { color: "#9ca3af", emoji: "🆕", name: "Sizzlin' Noob" }
  };

  // 그릴온도 계산 (본인 스테이크 + 추천인 보너스)
  const calculateGrillTemperature = () => {
    // 초당 포인트 = 스테이크 수량 + 추천인 보너스
    const basePointsPerSecond = userStake / (24 * 60 * 60); // 일일 포인트를 초당으로
    const referralPointsPerSecond = referralBonus / (24 * 60 * 60);
    const totalPointsPerSecond = basePointsPerSecond + referralPointsPerSecond;
    
    // 전체 유저 대비 상대적 위치로 온도 계산
    const percentile = ((totalUsers - userRank) / totalUsers) * 100;
    
    // 온도 매핑: 상위 1% = 1000°F, 상위 50% = 500°F (적정온도)
    let temperature;
    if (percentile >= 99) temperature = 950 + (percentile - 99) * 50; // 상위 1%: 950-1000°F
    else if (percentile >= 90) temperature = 700 + (percentile - 90) * 27.8; // 상위 10%: 700-950°F
    else if (percentile >= 50) temperature = 500 + (percentile - 50) * 5; // 상위 50%: 500-700°F
    else if (percentile >= 25) temperature = 300 + (percentile - 25) * 8; // 상위 75%: 300-500°F
    else temperature = percentile * 12; // 하위 25%: 0-300°F
    
    return Math.min(Math.max(Math.round(temperature), 0), 1000);
  };

  // 다음 페이즈 예상 티어 계산
  const getPredictedTier = () => {
    const percentile = ((totalUsers - userRank) / totalUsers) * 100;
    
    for (const [tier, threshold] of Object.entries(TIER_THRESHOLDS)) {
      if (percentile <= threshold) {
        return tier;
      }
    }
    return "SIZZLIN_NOOB";
  };

  // 불꽃 강도 계산 (온도 기반)
  const calculateFlameIntensity = (temp) => {
    if (temp >= 800) return 1.0;      // 최고 강도
    if (temp >= 600) return 0.8;
    if (temp >= 400) return 0.6;
    if (temp >= 200) return 0.4;
    return 0.2;                       // 최소 강도
  };

  // 온도 색상 계산
  const getTemperatureColor = (temp) => {
    if (temp >= 800) return "#ff0000";      // 빨강 (위험)
    if (temp >= 600) return "#ff4500";      // 주황빨강
    if (temp >= 500) return "#ffa500";      // 주황 (적정)
    if (temp >= 300) return "#ffff00";      // 노랑
    if (temp >= 100) return "#87ceeb";      // 하늘색
    return "#4169e1";                       // 파랑 (차가움)
  };

  // 실시간 온도 업데이트
  useEffect(() => {
    const newTemp = calculateGrillTemperature();
    setCurrentTemp(newTemp);
    setFlameIntensity(calculateFlameIntensity(newTemp));
    
    // 애니메이션 트리거
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 1000);
    
    // 실시간 업데이트 (10초마다)
    const interval = setInterval(() => {
      const updatedTemp = calculateGrillTemperature();
      setCurrentTemp(updatedTemp);
      setFlameIntensity(calculateFlameIntensity(updatedTemp));
    }, 10000);

    return () => clearInterval(interval);
  }, [userStake, referralBonus, userRank]);

  const predictedTier = getPredictedTier();
  const predictedTierInfo = TIER_INFO[predictedTier];
  const tempColor = getTemperatureColor(currentTemp);

  return (
    <>
      {/* CSS 애니메이션 정의 */}
      <style jsx>{`
        @keyframes fireFlicker {
          0%, 100% { 
            transform: scale(1) rotate(-1deg);
            filter: brightness(1);
          }
          25% { 
            transform: scale(1.05) rotate(1deg);
            filter: brightness(1.2);
          }
          50% { 
            transform: scale(0.95) rotate(-0.5deg);
            filter: brightness(0.9);
          }
          75% { 
            transform: scale(1.02) rotate(0.5deg);
            filter: brightness(1.1);
          }
        }
        
        @keyframes tempPulse {
          0%, 100% { 
            transform: scale(1);
            text-shadow: 0 0 10px ${tempColor};
          }
          50% { 
            transform: scale(1.05);
            text-shadow: 0 0 20px ${tempColor};
          }
        }
        
        @keyframes gaugeGlow {
          0%, 100% { 
            box-shadow: 0 0 20px ${tempColor}40;
          }
          50% { 
            box-shadow: 0 0 40px ${tempColor}80;
          }
        }
        
        .fire-animation {
          animation: fireFlicker ${2 - flameIntensity}s infinite ease-in-out;
        }
        
        .temp-pulse {
          animation: tempPulse 2s infinite ease-in-out;
        }
        
        .gauge-glow {
          animation: gaugeGlow 3s infinite ease-in-out;
        }
      `}</style>

      <div style={{
        background: 'linear-gradient(135deg, rgba(255,69,0,0.15), rgba(255,140,0,0.1))',
        border: `2px solid ${tempColor}40`,
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? 20 : 24,
        marginBottom: isMobile ? 16 : 24,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* 배경 불꽃 효과 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 70%, ${tempColor}20, transparent 60%)`,
          pointerEvents: 'none',
          opacity: flameIntensity
        }} />

        {/* 헤더 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: isMobile ? 20 : 24,
          position: 'relative',
          zIndex: 2
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
            🌡️ Grill Temperature
          </h2>
          
          <div style={{
            fontSize: isMobile ? 10 : 12,
            background: 'rgba(0,0,0,0.3)',
            color: tempColor,
            padding: '4px 8px',
            borderRadius: 6,
            fontWeight: 600,
            border: `1px solid ${tempColor}50`
          }}>
            LIVE
          </div>
        </div>

        {/* 메인 온도 게이지 */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          gap: isMobile ? 20 : 32,
          marginBottom: isMobile ? 20 : 24,
          position: 'relative',
          zIndex: 2
        }}>
          {/* 원형 온도 게이지 */}
          <div style={{
            position: 'relative',
            width: isMobile ? 120 : 160,
            height: isMobile ? 120 : 160,
            flexShrink: 0
          }}>
            {/* 배경 원 */}
            <svg width="100%" height="100%" style={{ position: 'absolute' }}>
              <circle
                cx="50%"
                cy="50%"
                r={isMobile ? 50 : 70}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              <circle
                cx="50%"
                cy="50%"
                r={isMobile ? 50 : 70}
                fill="none"
                stroke={tempColor}
                strokeWidth="8"
                strokeDasharray={`${(currentTemp / 1000) * 440} 440`}
                strokeLinecap="round"
                transform={`rotate(-90 ${isMobile ? 60 : 80} ${isMobile ? 60 : 80})`}
                className="gauge-glow"
                style={{ 
                  transition: 'stroke-dasharray 1s ease-out',
                  filter: `drop-shadow(0 0 8px ${tempColor})`
                }}
              />
            </svg>
            
            {/* 중앙 온도 표시 */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <div 
                className="temp-pulse"
                style={{
                  fontSize: isMobile ? 24 : 32,
                  fontWeight: 900,
                  color: tempColor,
                  fontFamily: 'monospace',
                  lineHeight: 1
                }}
              >
                {currentTemp}°F
              </div>
              <div style={{
                fontSize: isMobile ? 10 : 12,
                color: '#999',
                marginTop: 4
              }}>
                MAX 1000°F
              </div>
            </div>

            {/* 불꽃 이펙트 */}
            {currentTemp > 200 && (
              <div 
                className="fire-animation"
                style={{
                  position: 'absolute',
                  bottom: -10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: isMobile ? 16 : 20,
                  opacity: flameIntensity,
                  filter: `hue-rotate(${(currentTemp / 1000) * 60}deg)`
                }}
              >
                🔥🔥🔥
              </div>
            )}
          </div>

          {/* 온도 정보 */}
          <div style={{ flex: 1 }}>
            <h3 style={{
              fontSize: isMobile ? 16 : 18,
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 12px 0'
            }}>
              Temperature Analysis
            </h3>

            {/* 온도 상태 */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: 12,
              marginBottom: 16
            }}>
              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 8,
                padding: 12,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                  Current Status
                </div>
                <div style={{ 
                  fontSize: isMobile ? 14 : 16, 
                  fontWeight: 700, 
                  color: tempColor 
                }}>
                  {currentTemp >= 800 ? '🔥 BLAZING HOT' :
                   currentTemp >= 500 ? '🌡️ PERFECT TEMP' :
                   currentTemp >= 300 ? '⚡ WARMING UP' :
                   currentTemp >= 100 ? '❄️ GETTING WARM' : '🧊 COLD START'}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.3)',
                borderRadius: 8,
                padding: 12,
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>
                  Points/Second Power
                </div>
                <div style={{ 
                  fontSize: isMobile ? 14 : 16, 
                  fontWeight: 700, 
                  color: '#4ade80' 
                }}>
                  {((userStake + referralBonus) / (24 * 60 * 60)).toFixed(2)}
                </div>
              </div>
            </div>

            {/* 온도 범위 가이드 */}
            <div style={{
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 8,
              padding: 12,
              fontSize: isMobile ? 10 : 11,
              color: '#ccc'
            }}>
              <div><strong style={{ color: '#ff0000' }}>800-1000°F:</strong> Elite Zone (Top 1-5%)</div>
              <div><strong style={{ color: '#ffa500' }}>500-800°F:</strong> Perfect Zone (Top 10-50%)</div>
              <div><strong style={{ color: '#87ceeb' }}>200-500°F:</strong> Active Zone (Top 50-80%)</div>
              <div><strong style={{ color: '#4169e1' }}>0-200°F:</strong> Starting Zone</div>
            </div>
          </div>
        </div>

        {/* 다음 페이즈 티어 예측 */}
        <div style={{
          background: `linear-gradient(135deg, ${predictedTierInfo.color}20, ${predictedTierInfo.color}10)`,
          border: `1px solid ${predictedTierInfo.color}40`,
          borderRadius: 12,
          padding: isMobile ? 16 : 20,
          position: 'relative',
          zIndex: 2
        }}>
          <h4 style={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            color: predictedTierInfo.color,
            margin: '0 0 12px 0',
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            🔮 Next Phase Prediction
          </h4>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 12
          }}>
            <div style={{
              width: isMobile ? 50 : 60,
              height: isMobile ? 50 : 60,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${predictedTierInfo.color}, ${predictedTierInfo.color}88)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: isMobile ? 20 : 24,
              border: `2px solid ${predictedTierInfo.color}`,
              boxShadow: `0 0 20px ${predictedTierInfo.color}40`
            }}>
              {predictedTierInfo.emoji}
            </div>

            <div>
              <div style={{
                fontSize: isMobile ? 16 : 18,
                fontWeight: 800,
                color: '#fff',
                marginBottom: 4
              }}>
                {predictedTierInfo.name}
              </div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: predictedTierInfo.color,
                fontWeight: 600
              }}>
                Based on current grill temperature
              </div>
            </div>
          </div>

          <div style={{
            fontSize: isMobile ? 11 : 12,
            color: '#ccc',
            lineHeight: 1.4
          }}>
            💡 <strong>Tip:</strong> Higher grill temperature = Better tier position in next phase. 
            Keep your temperature above 500°F for optimal results!
          </div>
        </div>
      </div>
    </>
  );
};

export default GrillTemperature;