// components/OptimizedIntegratedDashboard.jsx
import React, { useState, useEffect } from 'react';
import ReferralSystem from './ReferralSystem';
import ReferralDashboard from './ReferralDashboard';
import GrillTemperature from './GrillTemperature';
import GiftBoxSystem from './GiftBoxSystem';
// 🆕 데이터 fetcher import
import {
  fetchLeaderboardData,
  findUserData,
  formatUserDataForDashboard,
  calculateLeaderboardStats,
  getActiveUsers
} from '../utils/stakeDataFetcher';

// 🎯 Optimized Integrated Dashboard - 실데이터 연동 버전
const OptimizedIntegratedDashboard = ({ userAddress = null }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLive, setIsLive] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showJeetWarning, setShowJeetWarning] = useState(false);
  const [jeetWarningStep, setJeetWarningStep] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🆕 실데이터 상태 관리
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [error, setError] = useState(null);

  // 수정 // OptimizedIntegratedDashboard.jsx
  const [localBoxPoints, setLocalBoxPoints] = useState(0);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Real-time clock (updates every second)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 200);

      // 🆕 실시간 스코어 업데이트 (userData가 있을 때만)
      if (userData) {
        updateRealTimeScores();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [userData]);

  // 🆕 실데이터 로드
  useEffect(() => {
    loadUserData();
  }, [userAddress]);

  // OptimizedIntegratedDashboard.jsx의 useEffect 교체 (55번 줄부터)
  useEffect(() => {
    console.log('🎯 대시보드 상자 포인트 초기화');
    console.log('유저 주소:', userAddress);

    // 초기 로드
    const savedPoints = localStorage.getItem(`boxTotalPoints_${userAddress}`);
    console.log('저장된 포인트:', savedPoints);

    const localPoints = parseFloat(savedPoints) || 0;
    const serverPoints = userData?.box_points_earned || 0;

    console.log('로컬:', localPoints, '서버:', serverPoints);

    // 더 큰 값 사용 (로컬이 더 최신)
    setLocalBoxPoints(Math.max(localPoints, serverPoints));

    // 실시간 업데이트 리스너
    const handleBoxUpdate = (event) => {
      console.log('📦 박스 업데이트 이벤트 수신:', event.detail);

      if (event.detail.address === userAddress) {
        console.log('✅ 주소 일치! 포인트 업데이트:', event.detail.totalPoints);
        setLocalBoxPoints(event.detail.totalPoints);
      } else {
        console.log('❌ 주소 불일치:', event.detail.address, '!==', userAddress);
      }
    };

    window.addEventListener('boxPointsUpdated', handleBoxUpdate);
    console.log('🎧 이벤트 리스너 등록 완료');

    return () => {
      window.removeEventListener('boxPointsUpdated', handleBoxUpdate);
      console.log('🔇 이벤트 리스너 제거');
    };
  }, [userAddress, userData]);

  // 🆕 데이터 로드 함수
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📊 리더보드 데이터 로딩 중...');
      const response = await fetchLeaderboardData();

      if (!response || !response.leaderboard) {
        throw new Error('데이터 형식이 올바르지 않습니다');
      }

      // 시스템 통계 계산
      const stats = calculateLeaderboardStats(response.leaderboard);
      setSystemStats(stats);

      // 사용자 데이터 찾기
      const rawUserData = findUserData(response.leaderboard, userAddress);

      if (!rawUserData) {
        throw new Error('해당 지갑 주소를 찾을 수 없습니다');
      }

      // 활성 사용자 목록 (24시간 예상 순위 계산용)
      const activeUsers = getActiveUsers(response.leaderboard);

      // 대시보드용 포맷으로 변환
      const formattedData = formatUserDataForDashboard(
        rawUserData,
        stats,
        activeUsers
      );

      setUserData(formattedData);
      console.log('✅ 사용자 데이터 로드 완료:', formattedData);

    } catch (err) {
      console.error('❌ 데이터 로드 실패:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 실시간 스코어 업데이트
  const updateRealTimeScores = () => {
    if (!userData) return;

    const currentTimeSec = Date.now() / 1000;
    const holdingSeconds = currentTimeSec - userData.first_stake_timestamp;
    const holdingDays = holdingSeconds / (24 * 60 * 60);

    // 실시간 점수 재계산
    const realTimeScore = userData.display_staked * holdingDays * userData.current_multiplier;
    const scorePerSecond = (userData.display_staked * userData.current_multiplier) / (24 * 60 * 60);

    setUserData(prev => ({
      ...prev,
      real_time_score: realTimeScore,
      score_per_second: scorePerSecond,
      stakehouse_score: realTimeScore * 0.15,
      stakehouse_per_second: scorePerSecond * 0.15,
      holding_days: holdingDays,
      // 실시간 holding 시간 업데이트
      real_time_holding: (() => {
        const totalSeconds = Math.floor(holdingSeconds);
        return {
          days: Math.floor(totalSeconds / (24 * 60 * 60)),
          hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
          minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
          seconds: totalSeconds % 60
        };
      })()
    }));
  };

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUserData().finally(() => {
      setIsRefreshing(false);
    });
  };

  // Phase dates
  const phase1EndDate = new Date('2025-06-27T09:59:59Z');

  // 로딩 중일 때
  if (isLoading) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: isMobile ? '12px' : '20px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🥩</div>
          <div style={{ fontSize: 20, marginBottom: 10 }}>Loading STAKE Data...</div>
          <div style={{ fontSize: 14, color: '#666' }}>Fetching from blockchain</div>
        </div>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: isMobile ? '12px' : '20px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
          <div style={{ fontSize: 20, marginBottom: 10, color: '#ef4444' }}>Error Loading Data</div>
          <div style={{ fontSize: 14, color: '#999', marginBottom: 20 }}>{error}</div>
          <button
            onClick={loadUserData}
            style={{
              padding: '12px 24px',
              background: '#ef4444',
              border: 'none',
              borderRadius: 8,
              color: '#fff',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (!userData) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: isMobile ? '12px' : '20px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🔍</div>
          <div style={{ fontSize: 20, marginBottom: 10 }}>No Data Found</div>
          <div style={{ fontSize: 14, color: '#999' }}>Wallet address not found in leaderboard</div>
        </div>
      </div>
    );
  }

  // Number formatting
  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
  };

  const formatScore = (num) => {
    //return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
  };

  // Time formatting (countdown)
  const formatCountdown = (seconds) => {
    if (seconds <= 0) return "Complete";
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${Math.floor((seconds % (60 * 60)) / 60)}m`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // JEET warning handler
  const handleJeetWarning = () => {
    if (jeetWarningStep === 0) {
      setJeetWarningStep(1);
      setShowJeetWarning(true);
    }
  };

  const confirmJeet = () => {
    if (jeetWarningStep === 1) {
      setJeetWarningStep(2);
    } else {
      alert("JEET processed! Grade reset and Phase 2 participation disabled.");
      setShowJeetWarning(false);
      setJeetWarningStep(0);
    }
  };

  // Copy contract address
  const copyStakeAddress = () => {
    const stakeAddress = "0xBa13ae24684bee910820Be1Fcf52067332F8412f";
    navigator.clipboard.writeText(stakeAddress);
    alert("STAKE contract address copied!");
  };

  // 🔥 Top key metrics cards - Reduced and Optimized
  const MetricCard = ({ title, value, subtitle, trend, color, icon, isLive = false, highlight = false, special = false }) => (
    <div style={{
      background: special
        ? 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,193,7,0.1))'
        : highlight
          ? 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.1))'
          : 'rgba(255,255,255,0.05)',
      border: special
        ? '3px solid rgba(255,215,0,0.4)'
        : highlight
          ? '2px solid rgba(74,222,128,0.3)'
          : '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? '16px 12px' : '20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      minHeight: isMobile ? 'auto' : '140px',
      boxShadow: special ? '0 0 20px rgba(255,215,0,0.2)' : 'none'
    }}>
      {isLive && (
        <div style={{
          position: 'absolute',
          top: isMobile ? 6 : 8,
          right: isMobile ? 6 : 8,
          width: isMobile ? 6 : 8,
          height: isMobile ? 6 : 8,
          background: '#4ade80',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
      )}

      {/* Vault Icon for stSTAKE */}
      {special && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          fontSize: isMobile ? 16 : 20,
          filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
        }}>
          🏦
        </div>
      )}

      <div style={{
        fontSize: isMobile ? 12 : 14,
        color: '#999',
        marginBottom: isMobile ? 6 : 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4
      }}>
        <span style={{ fontSize: isMobile ? 14 : 16 }}>{icon}</span>
        {title}
      </div>

      <div style={{
        fontSize: isMobile ? 20 : 28,
        fontWeight: 900,
        color: color || '#fff',
        marginBottom: 4,
        fontFamily: 'monospace',
        lineHeight: 1.2,
        textShadow: special ? '0 0 10px rgba(255,215,0,0.4)' : 'none'
      }}>
        {value}
      </div>

      {subtitle && (
        <div style={{
          fontSize: isMobile ? 9 : 11,
          color: '#666',
          marginBottom: isMobile ? 6 : 8,
          lineHeight: 1.3
        }}>
          {subtitle}
        </div>
      )}

      {trend && (
        <div style={{
          fontSize: isMobile ? 9 : 11,
          color: trend.startsWith('+') ? '#4ade80' : '#ef4444',
          fontWeight: 600
        }}>
          {trend}
        </div>
      )}
    </div>
  );

  // 🎯 Enhanced Gaming-Style Tier Position Card with Integrated Rank Prediction
  const EnhancedTierPositionCard = () => (
    <div className="tier-card-glow" style={{
      background: userData.bg_gradient,
      border: `3px solid ${userData.tier_color}`,
      borderRadius: isMobile ? 16 : 24,
      padding: isMobile ? 20 : 32,
      marginBottom: isMobile ? 16 : 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, ${userData.tier_color}10 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${userData.tier_color}08 0%, transparent 50%),
          linear-gradient(45deg, rgba(255,255,255,0.02) 25%, transparent 25%),
          linear-gradient(-45deg, rgba(255,255,255,0.02) 25%, transparent 25%)
        `,
        backgroundSize: '200px 200px, 150px 150px, 30px 30px, 30px 30px',
        pointerEvents: 'none',
        opacity: 0.3
      }} />

      {/* Phase Badge */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 12 : 16,
        right: isMobile ? 12 : 16,
        background: userData.tier_color,
        color: '#000',
        padding: isMobile ? '4px 8px' : '6px 12px',
        borderRadius: 8,
        fontSize: isMobile ? 10 : 12,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '1px',
        boxShadow: `0 0 10px ${userData.tier_glow_color}`
      }}>
        PHASE 1
      </div>

      {/* Live Indicator */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 12 : 16,
        left: isMobile ? 12 : 16,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: 'rgba(74,222,128,0.2)',
        border: '1px solid rgba(74,222,128,0.5)',
        borderRadius: 20,
        padding: '4px 8px',
        fontSize: isMobile ? 10 : 11,
        color: '#4ade80'
      }}>
        <div style={{
          width: 6,
          height: 6,
          background: '#4ade80',
          borderRadius: '50%',
          animation: 'pulse 2s infinite'
        }} />
        LIVE
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Main Content */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 16 : 24,
          marginBottom: isMobile ? 20 : 24,
          marginTop: isMobile ? 16 : 20
        }}>
          {/* Tier Avatar */}
          <div style={{
            width: isMobile ? 80 : 120,
            height: isMobile ? 80 : 120,
            background: `radial-gradient(circle, ${userData.tier_color}40, ${userData.tier_color}10)`,
            border: `3px solid ${userData.tier_color}`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 32 : 48,
            position: 'relative',
            flexShrink: 0,
            boxShadow: `0 0 20px ${userData.tier_glow_color}, inset 0 0 20px ${userData.tier_glow_color}`
          }}>
            {userData.grade_emoji}

            {/* Tier Ring Animation */}
            <div style={{
              position: 'absolute',
              top: -4,
              left: -4,
              right: -4,
              bottom: -4,
              border: `2px solid ${userData.tier_color}`,
              borderRadius: '50%',
              borderTop: '2px solid transparent',
              animation: 'spin 4s linear infinite'
            }} />
          </div>

          {/* Title & Score */}
          <div style={{ flex: 1 }}>
            <h1 style={{
              fontSize: isMobile ? 18 : 28,
              fontWeight: 900,
              color: userData.tier_color,
              margin: '0 0 8px 0',
              textShadow: `0 0 20px ${userData.tier_glow_color}`,
              filter: `drop-shadow(0 0 8px ${userData.tier_glow_color})`
            }}>
              {userData.grade}
            </h1>

            <div style={{
              fontSize: isMobile ? 12 : 16,
              color: '#999',
              marginBottom: 8
            }}>
              Rank #{userData.rank} • Top {userData.percentile.toFixed(1)}%
            </div>

            {/* Real-time Score with Multiplier */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <div className="score-animation" style={{
                fontSize: isMobile ? 20 : 32,
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'monospace',
                textShadow: '0 0 10px rgba(255,255,255,0.3)'
              }}>
                {(userData.real_time_score + localBoxPoints) >= 1000000000 ? ((userData.real_time_score + localBoxPoints) / 1000000000).toFixed(2) + 'B' :
                  (userData.real_time_score + localBoxPoints) >= 1000000 ? ((userData.real_time_score + localBoxPoints) / 1000000).toFixed(2) + 'M' :
                    (userData.real_time_score + localBoxPoints) >= 1000 ? ((userData.real_time_score + localBoxPoints) / 1000).toFixed(1) + 'K' :
                      Math.floor(userData.real_time_score + localBoxPoints).toLocaleString()} P
              </div>

              {/* Multiplier Badge */}
              <div style={{
                background: userData.tier_color,
                color: '#000',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: isMobile ? 12 : 16,
                fontWeight: 900,
                textShadow: 'none',
                boxShadow: `0 0 8px ${userData.tier_glow_color}`
              }}>
                {userData.current_multiplier}x
              </div>
            </div>

            <div style={{
              fontSize: isMobile ? 10 : 12,
              color: '#4ade80',
              fontWeight: 600,
              marginTop: 4
            }}>
              +{userData.score_per_second.toFixed(2)} P/sec
            </div>
          </div>
        </div>

        {/* Phase Ranking Gauge */}
        <div style={{
          marginBottom: isMobile ? 16 : 20
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8
          }}>
            <span style={{
              fontSize: isMobile ? 12 : 14,
              color: '#ccc',
              fontWeight: 600
            }}>
              Phase 1 Ranking
            </span>
            <span style={{
              fontSize: isMobile ? 12 : 14,
              color: userData.tier_color,
              fontWeight: 700
            }}>
              #{userData.rank} / {userData.total_participants}
            </span>
          </div>

          {/* Ranking Gauge Bar */}
          <div style={{
            height: isMobile ? 12 : 16,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 8,
            overflow: 'hidden',
            position: 'relative',
            marginBottom: 8
          }}>
            <div className="rank-gauge-fill" style={{
              height: '100%',
              background: `linear-gradient(90deg, ${userData.tier_color}, ${userData.tier_color}80)`,
              width: `${userData.percentile}%`,
              borderRadius: 8,
              position: 'relative',
              boxShadow: `0 0 10px ${userData.tier_glow_color}`
            }} />

            {/* Current position marker (fire 🔥) */}
            <div style={{
              position: 'absolute',
              left: `${userData.percentile}%`,
              top: isMobile ? -4 : -6,
              transform: 'translateX(-50%)',
              fontSize: isMobile ? 16 : 20,
              filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.8))',
              zIndex: 3
            }}>
              🔥
            </div>
          </div>

          {/* Gauge Labels */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: isMobile ? 10 : 12,
            color: '#999'
          }}>
            <span>#{userData.total_participants} ({userData.total_participants} total)</span>
            <span style={{
              position: 'relative',
              left: `${userData.percentile - 50}%`,
              color: userData.tier_color,
              fontWeight: 700,
              filter: `drop-shadow(0 0 4px ${userData.tier_glow_color})`
            }}>
              #{userData.rank}
            </span>
            <span>#1 (Top)</span>
          </div>
        </div>

        {/* Points Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: isMobile ? 12 : 16,
          marginBottom: isMobile ? 16 : 20
        }}>
          <div style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 12,
            padding: isMobile ? 12 : 16,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? 10 : 12,
              color: '#4ade80',
              marginBottom: 4,
              fontWeight: 600
            }}>
              By Stake
            </div>
            <div style={{
              fontSize: isMobile ? 14 : 18,
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'monospace'
            }}>
              {formatNumber(userData.points_breakdown.by_stake)} P
            </div>
          </div>

          <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12,
            padding: isMobile ? 12 : 16,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? 10 : 12,
              color: '#f59e0b',
              marginBottom: 4,
              fontWeight: 600
            }}>
              By Referral
            </div>
            <div style={{
              fontSize: isMobile ? 14 : 18,
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'monospace'
            }}>
              {formatNumber(userData.points_breakdown.by_referral)} P
            </div>
          </div>
        </div>

        {/* 🆕 Integrated Rank Movement Prediction */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          border: `1px solid ${userData.border_color}`,
          borderRadius: 12,
          padding: isMobile ? 16 : 20
        }}>
          <h4 style={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            color: '#fff',
            margin: `0 0 ${isMobile ? 12 : 16}px 0`,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            📈 Rank Movement Prediction
          </h4>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 12 : 16,
            marginBottom: isMobile ? 12 : 16
          }}>
            <div style={{
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.2)',
              borderRadius: 12,
              padding: isMobile ? 12 : 16,
              textAlign: 'center'
            }}>
              <div style={{
                color: '#4ade80',
                fontSize: isMobile ? 18 : 20,
                fontWeight: 900
              }}>
                #{userData.predicted_rank_24h}
              </div>
              <div style={{
                color: '#999',
                fontSize: isMobile ? 10 : 12
              }}>
                24h Prediction
              </div>
              <div style={{
                color: userData.predicted_rank_24h < userData.rank ? '#4ade80' : '#ef4444',
                fontSize: isMobile ? 9 : 11,
                marginTop: 4
              }}>
                {userData.predicted_rank_24h < userData.rank
                  ? `↗ +${userData.rank - userData.predicted_rank_24h} Rise`
                  : userData.predicted_rank_24h > userData.rank
                    ? `↘ -${userData.predicted_rank_24h - userData.rank} Drop`
                    : '→ No Change'
                }
              </div>
            </div>

            <div style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 12,
              padding: isMobile ? 12 : 16,
              textAlign: 'center'
            }}>
              <div style={{
                color: '#8b5cf6',
                fontSize: isMobile ? 18 : 20,
                fontWeight: 900
              }}>
                {formatNumber(userData.grill_temperature)}°F
              </div>
              <div style={{
                color: '#999',
                fontSize: isMobile ? 10 : 12
              }}>
                Grill Temperature
              </div>
              <div style={{
                color: '#8b5cf6',
                fontSize: isMobile ? 9 : 11,
                marginTop: 4
              }}>
                Next: {userData.predicted_next_tier}
              </div>
            </div>
          </div>

          <div style={{
            fontSize: isMobile ? 11 : 13,
            color: '#ccc',
            textAlign: 'center',
            padding: isMobile ? 8 : 12,
            background: 'rgba(255,255,255,0.02)',
            borderRadius: 8
          }}>
            💡 Your Power: <span style={{ color: '#4ade80', fontWeight: 600 }}>{userData.points_per_second.toFixed(2)} pts/sec</span> •
            Average: <span style={{ color: '#fbbf24', fontWeight: 600 }}>~{(userData.display_staked / userData.total_participants / (24 * 60 * 60)).toFixed(2)} pts/sec</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 🏠 STAKEHOUSE Gaming Card - Coming Soon
  const StakehouseCard = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
      border: '3px solid rgba(139,92,246,0.4)',
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 20 : 24,
      marginBottom: isMobile ? 16 : 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background Pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `
          radial-gradient(circle at 20% 20%, rgba(139,92,246,0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 50%)
        `,
        backgroundSize: '200px 200px, 150px 150px',
        pointerEvents: 'none',
        opacity: 0.5
      }} />

      {/* Coming Soon Badge */}
      <div style={{
        position: 'absolute',
        top: isMobile ? 12 : 16,
        right: isMobile ? 12 : 16,
        background: '#8b5cf6',
        color: '#fff',
        padding: isMobile ? '4px 8px' : '6px 12px',
        borderRadius: 8,
        fontSize: isMobile ? 10 : 12,
        fontWeight: 900,
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        COMING SOON
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Main Content */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 16 : 20,
          marginBottom: isMobile ? 16 : 20
        }}>
          {/* STAKEHOUSE Icon */}
          <div style={{
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            background: 'radial-gradient(circle, rgba(139,92,246,0.4), rgba(139,92,246,0.1))',
            border: '2px solid #8b5cf6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 24 : 32,
            position: 'relative',
            flexShrink: 0
          }}>
            🏠

            {/* Loading Ring */}
            <div style={{
              position: 'absolute',
              top: -3,
              left: -3,
              right: -3,
              bottom: -3,
              border: '2px solid transparent',
              borderTop: '2px solid #8b5cf6',
              borderRadius: '50%',
              animation: 'spin 3s linear infinite'
            }} />
          </div>

          {/* Title & Score */}
          <div style={{ flex: 1 }}>
            <h2 style={{
              fontSize: isMobile ? 16 : 20,
              fontWeight: 900,
              color: '#8b5cf6',
              margin: '0 0 4px 0'
            }}>
              STAKEHOUSE
            </h2>

            <div style={{
              fontSize: isMobile ? 10 : 12,
              color: '#999',
              marginBottom: 8
            }}>
              Enhanced Rewards System
            </div>

            {/* Points Counter */}
            <div style={{
              fontSize: isMobile ? 18 : 24,
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'monospace'
            }}>
              {formatNumber(userData.stakehouse_score)} P
            </div>

            <div style={{
              fontSize: isMobile ? 9 : 11,
              color: '#8b5cf6',
              fontWeight: 600,
              marginTop: 4
            }}>
              +{userData.stakehouse_per_second.toFixed(2)} P/sec (Accumulating)
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: isMobile ? 12 : 16,
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: isMobile ? 12 : 14,
            color: '#8b5cf6',
            fontWeight: 600,
            marginBottom: 8
          }}>
            🚀 Points are accumulating for the upcoming launch!
          </div>
          <div style={{
            fontSize: isMobile ? 10 : 12,
            color: '#999'
          }}>
            Your STAKEHOUSE points will be converted to enhanced rewards when the system goes live.
          </div>
        </div>
      </div>
    </div>
  );

  // 💰 Phase 1 Allocation Card with JEET Options
  const Phase1AllocationCard = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,193,7,0.1))',
      border: '2px solid rgba(255,215,0,0.3)',
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 16 : 24,
      marginBottom: isMobile ? 16 : 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at 30% 20%, rgba(255,215,0,0.2), transparent 70%)',
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        <h3 style={{
          fontSize: isMobile ? 16 : 20,
          fontWeight: 800,
          color: '#ffd700',
          margin: `0 0 ${isMobile ? 12 : 16}px 0`,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          💎 Phase 1 Expected Allocation
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? 16 : 20,
          marginBottom: isMobile ? 12 : 16
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: isMobile ? 22 : 28,
              fontWeight: 900,
              color: '#fff',
              marginBottom: 4,
              fontFamily: 'monospace'
            }}>
              {formatNumber(userData.phase1_allocation_tokens)}
            </div>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              color: '#ffd700',
              fontWeight: 600
            }}>
              VIRTUAL ({userData.phase1_allocation_percent.toFixed(2)}%)
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: isMobile ? 22 : 28,
              fontWeight: 900,
              color: '#4ade80',
              marginBottom: 4,
              fontFamily: 'monospace'
            }}>
              ${formatNumber(userData.phase1_allocation_usd)}
            </div>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              color: '#4ade80',
              fontWeight: 600
            }}>
              Current Market Value
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 12,
          padding: isMobile ? 12 : 16,
          textAlign: 'center'
        }}>
          <div style={{
            color: '#ffd700',
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            marginBottom: 4
          }}>
            🔥 Top {userData.percentile.toFixed(1)}% Elite Tier!
          </div>
          <div style={{
            color: '#999',
            fontSize: isMobile ? 10 : 12
          }}>
            Final Rank: #{userData.rank} / {userData.total_participants} users
          </div>
        </div>

        {/* Phase 1 end and choice buttons */}
        <div style={{
          marginTop: isMobile ? 16 : 20,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 12
        }}>
          <button
            onClick={handleJeetWarning}
            style={{
              padding: isMobile ? '16px 20px' : '14px 20px',
              background: 'rgba(239,68,68,0.15)',
              border: '2px solid rgba(239,68,68,0.3)',
              borderRadius: 12,
              color: '#ef4444',
              fontSize: isMobile ? 16 : 14,
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
              minHeight: '48px' // Touch-friendly
            }}
          >
            💰 Claim Now
          </button>

          <button style={{
            padding: isMobile ? '16px 20px' : '14px 20px',
            background: 'rgba(74,222,128,0.15)',
            border: '2px solid rgba(74,222,128,0.3)',
            borderRadius: 12,
            color: '#4ade80',
            fontSize: isMobile ? 16 : 14,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s',
            minHeight: '48px' // Touch-friendly
          }}>
            🚀 Continue Phase 2
          </button>
        </div>

        <div style={{
          marginTop: 12,
          fontSize: isMobile ? 9 : 11,
          color: '#999',
          textAlign: 'center'
        }}>
          🕐 Actual Release Date: December 7, 2025 ({Math.floor((new Date('2025-12-07') - new Date()) / (1000 * 60 * 60 * 24))} days)
        </div>
      </div>
    </div>
  );

  // ⏰ Time Information + Action Buttons with Refresh
  const TimeAndActions = () => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 20,
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: isMobile ? 10 : 12
      }}>
        <h4 style={{
          fontSize: isMobile ? 14 : 16,
          fontWeight: 700,
          color: '#fff',
          margin: 0
        }}>
          ⏰ Holding Time (Real-time)
        </h4>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 8,
            padding: '6px 12px',
            color: '#4ade80',
            fontSize: isMobile ? 10 : 12,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            transition: 'all 0.2s'
          }}
          disabled={isRefreshing}
        >
          <span style={{
            animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
          }}>
            🔄
          </span>
          {isRefreshing ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: isMobile ? 6 : 8,
        marginBottom: isMobile ? 12 : 16,
        fontFamily: 'monospace'
      }}>
        {[
          { value: userData.real_time_holding?.days || 0, label: 'Days' },
          { value: userData.real_time_holding?.hours || 0, label: 'Hours' },
          { value: userData.real_time_holding?.minutes || 0, label: 'Min' },
          { value: userData.real_time_holding?.seconds || 0, label: 'Sec' }
        ].map((item, index) => (
          <div key={index} style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.2)',
            borderRadius: 8,
            padding: isMobile ? '6px 2px' : '8px 4px',
            textAlign: 'center'
          }}>
            <div style={{
              color: '#4ade80',
              fontSize: isMobile ? 14 : 16,
              fontWeight: 900
            }}>
              {item.value.toString().padStart(2, '0')}
            </div>
            <div style={{
              color: '#999',
              fontSize: isMobile ? 8 : 10
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: isMobile ? 10 : 8
      }}>
        <button style={{
          padding: isMobile ? '14px 20px' : '12px 20px',
          background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
          border: 'none',
          borderRadius: 12,
          color: '#fff',
          fontSize: isMobile ? 16 : 14,
          fontWeight: 700,
          cursor: 'pointer',
          minHeight: '48px' // Touch-friendly
        }}>
          🛒 Stake More
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: isMobile ? 10 : 8
        }}>
          <button
            onClick={copyStakeAddress}
            style={{
              padding: isMobile ? '12px 16px' : '10px 16px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: '#fff',
              fontSize: isMobile ? 12 : 11,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: '44px' // Touch-friendly
            }}
          >
            📋 STAKE Address
          </button>

          <button style={{
            padding: isMobile ? '12px 16px' : '10px 16px',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 8,
            color: '#8b5cf6',
            fontSize: isMobile ? 12 : 11,
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '44px' // Touch-friendly
          }}>
            🏠 STAKEHOUSE
          </button>
        </div>
      </div>
    </div>
  );

  // JEET Warning Modal
  const JeetWarningModal = () => {
    if (!showJeetWarning) return null;

    const warningContent = jeetWarningStep === 1 ? {
      title: "⚠️ Are you sure you want to claim?",
      content: "You won't be able to participate in Phase 2 and will miss bigger reward opportunities.",
      confirmText: "Continue",
      cancelText: "Cancel"
    } : {
      title: "🚨 Final Warning!",
      content: "Claiming will JEET process you and reset all grades.\nPhase 2-6 participation disabled, no exceptions for Genesis OG!\nAre you absolutely sure?",
      confirmText: "Yes, Claim Now",
      cancelText: "No, Cancel"
    };

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0,0,0,0.9)',
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
          padding: isMobile ? 24 : 32,
          maxWidth: isMobile ? '90vw' : 500,
          width: '100%',
          textAlign: 'center',
          border: jeetWarningStep === 1
            ? '2px solid rgba(239,68,68,0.3)'
            : '3px solid rgba(239,68,68,0.5)'
        }}>
          <h2 style={{
            fontSize: isMobile ? 20 : (jeetWarningStep === 1 ? 24 : 28),
            fontWeight: 900,
            color: '#ef4444',
            margin: '0 0 16px 0'
          }}>
            {warningContent.title}
          </h2>

          <p style={{
            fontSize: isMobile ? 14 : 16,
            color: '#fff',
            lineHeight: 1.5,
            marginBottom: 24,
            whiteSpace: 'pre-line'
          }}>
            {warningContent.content}
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 16
          }}>
            <button
              onClick={() => {
                setShowJeetWarning(false);
                setJeetWarningStep(0);
              }}
              style={{
                padding: '16px 24px',
                background: 'rgba(107,114,128,0.2)',
                border: '1px solid rgba(107,114,128,0.3)',
                borderRadius: 12,
                color: '#9ca3af',
                fontSize: isMobile ? 14 : 16,
                fontWeight: 600,
                cursor: 'pointer',
                minHeight: '48px' // Touch-friendly
              }}
            >
              {warningContent.cancelText}
            </button>

            <button
              onClick={confirmJeet}
              style={{
                padding: '16px 24px',
                background: 'rgba(239,68,68,0.2)',
                border: '2px solid rgba(239,68,68,0.5)',
                borderRadius: 12,
                color: '#ef4444',
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                cursor: 'pointer',
                minHeight: '48px' // Touch-friendly
              }}
            >
              {warningContent.confirmText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: '#0a0a0a',
      minHeight: '100vh',
      padding: isMobile ? '12px' : '20px',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* CSS animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes scoreCountUp {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
        
        @keyframes tierGlow {
          0%, 100% { 
            box-shadow: 0 0 20px ${userData.tier_glow_color}, 
                        0 0 40px ${userData.tier_glow_color},
                        inset 0 0 20px ${userData.tier_glow_color};
          }
          50% { 
            box-shadow: 0 0 30px ${userData.tier_glow_color}, 
                        0 0 60px ${userData.tier_glow_color},
                        inset 0 0 30px ${userData.tier_glow_color};
          }
        }
        
        @keyframes rankGaugeFill {
          0% { width: 0%; }
          100% { width: ${userData.percentile}%; }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .score-animation {
          animation: ${isAnimating ? 'scoreCountUp 0.2s ease-out' : 'none'};
        }
        
        .tier-card-glow {
          animation: tierGlow 3s ease-in-out infinite;
        }
        
        .rank-gauge-fill {
          animation: rankGaugeFill 2s ease-out;
        }
      `}</style>

      <div style={{
        maxWidth: isMobile ? '100%' : 1400,
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: isMobile ? 20 : 32
        }}>
          <h1 style={{
            fontSize: isMobile ? 24 : 32,
            fontWeight: 900,
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #4ade80, #22c55e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            🎯 Ultimate Dashboard
          </h1>
          <div style={{
            fontSize: isMobile ? 12 : 14,
            color: '#999',
            fontFamily: 'monospace'
          }}>
            {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </div>
        </div>

        {/* 🔥 Top: Key metrics cards - Reduced and Optimized (3 cards) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 8 : 16,
          marginBottom: isMobile ? 16 : 24
        }}>
          {/* stSTAKE - Special Vault Style */}
          <div style={{
            gridColumn: isMobile ? '1 / -1' : 'auto'
          }}>
            <MetricCard
              icon="🥩"
              title="stSTAKE"
              value={formatNumber(userData.display_staked)}
              subtitle={`Real: ${formatNumber(userData.total_staked)} + Event: ${formatNumber(userData.virtual_staked)}`}
              trend={`+${userData.score_per_second.toFixed(2)}/sec`}
              color="#ffd700"
              isLive={isLive}
              special={true}
            />
          </div>

          {/* 메트릭 카드 수정 */}
          <MetricCard
            icon="🎯"
            title="STAKE Score"
            value={formatScore(userData.real_time_score + localBoxPoints)}
            subtitle={`Stake: ${formatScore(userData.real_time_score)} + Box: ${formatScore(localBoxPoints)}`}
            trend={`+${(userData.score_per_second * userData.current_multiplier).toFixed(1)}/sec`}
            color="#10b981"
            isLive={isLive}
            highlight={true}
          />

          <MetricCard
            icon="🏆"
            title="Current Rank"
            value={`#${userData.rank}`}
            subtitle={`out of ${userData.total_participants}`}
            trend={userData.rank_change_24h > 0 ? `↗ +${userData.rank_change_24h}` : userData.rank_change_24h < 0 ? `↘ ${userData.rank_change_24h}` : '→ No change'}
            color="#ef4444"
          />
        </div>

        {/* Main content area - Mobile: Single column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: isMobile ? 16 : 24
        }}>
          {/* Left: Enhanced Tier Position */}
          <div>
            <EnhancedTierPositionCard />
            <StakehouseCard />
          </div>

          {/* Right: Phase 1 allocation + Time/Actions */}
          <div>
            <Phase1AllocationCard />
            <TimeAndActions />
          </div>
        </div>

        {/* 🌡️ 그릴온도 시스템 */}
        <GrillTemperature
          userStake={userData.display_staked}
          referralBonus={userData.referral_bonus_earned}
          userTier={userData.grade}
          userRank={userData.rank}
          totalUsers={userData.total_participants}
          isMobile={isMobile}
        />

        {/* 🎁 선물상자 시스템 */}
        <GiftBoxSystem
          userStake={userData.display_staked}
          userTier={userData.grade}
          userAddress={userAddress}
          isMobile={isMobile}
        />

        {/* 🚀 추천인 시스템 섹션 추가 */}
        {userAddress && (
          <div style={{
            marginTop: isMobile ? 24 : 32,
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 16 : 24
          }}>
            {/* 추천인 시스템 카드 */}
            <div style={{
              gridColumn: isMobile ? '1 / -1' : 'auto'
            }}>
              <ReferralSystem walletAddress={userAddress} />
            </div>

            {/* 추천인 대시보드 */}
            <div style={{
              gridColumn: isMobile ? '1 / -1' : 'auto'
            }}>
              <ReferralDashboard walletAddress={userAddress} />
            </div>
          </div>
        )}
      </div>

      {/* JEET warning modal */}
      <JeetWarningModal />
    </div>
  );
};

export default OptimizedIntegratedDashboard;