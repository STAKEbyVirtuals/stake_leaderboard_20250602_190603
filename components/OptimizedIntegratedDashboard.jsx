import React, { useState, useEffect } from 'react';
// 🆕 실제 데이터 fetcher import
import {
  fetchLeaderboardData,
  findUserData,
  formatUserDataForDashboard,
  calculateLeaderboardStats,
  getActiveUsers
} from '../utils/stakeDataFetcher';

// 🆕 분리된 컴포넌트들 import
import GrillTemperature from './GrillTemperature';
import GiftBoxSystem from './GiftBoxSystem';

const OptimizedIntegratedDashboard = ({ userAddress = "0x95740c952739faed6527fc1f5fc3b5bee10dae15" }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLive, setIsLive] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showJeetWarning, setShowJeetWarning] = useState(false);
  const [jeetWarningStep, setJeetWarningStep] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [realtimeScore, setRealtimeScore] = useState(0);
  const [gaugeAnimated, setGaugeAnimated] = useState(false);
  const [copiedContract, setCopiedContract] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [boxPointsAccumulated, setBoxPointsAccumulated] = useState(0);

  // 🆕 실데이터 상태 관리
  const [systemStats, setSystemStats] = useState(null);

  // 🔧 실제 데이터 로드 함수
  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('📊 리더보드 데이터 로딩 중...');
      const response = await fetchLeaderboardData();

      if (!response || !response.leaderboard) {
        // 데이터가 없어도 계속 진행
        console.log('⚠️ 리더보드 데이터 없음, 기본값 사용');
      }

      // 시스템 통계 계산 (데이터 없으면 기본값)
      const stats = response?.leaderboard
        ? calculateLeaderboardStats(response.leaderboard)
        : { total_users: 0, active_users: 0, jeeted_users: 0, genesis_count: 0, avg_stake: 0, total_staked: 0 };
      setSystemStats(stats);

      // 사용자 데이터 찾기 (없으면 기본값 생성됨)
      const rawUserData = findUserData(response?.leaderboard || [], userAddress);

      // 활성 사용자 목록
      const activeUsers = response?.leaderboard
        ? getActiveUsers(response.leaderboard)
        : [];

      // 대시보드용 포맷으로 변환
      const formattedData = formatUserDataForDashboard(
        rawUserData,
        stats,
        activeUsers
      );

      setUserData(formattedData);
      setRealtimeScore(formattedData.real_time_score);
      setBoxPointsAccumulated(formattedData.box_points_earned || 0); // 박스 포인트 초기화
      console.log('✅ 사용자 데이터 로드 완료:', formattedData);

    } catch (err) {
      console.error('❌ 데이터 로드 실패:', err);
      // 에러가 나도 기본값으로 계속 진행
      const defaultData = createDefaultUserData(userAddress);
      const formattedData = formatUserDataForDashboard(
        defaultData,
        { total_users: 0, active_users: 0, jeeted_users: 0, genesis_count: 0, avg_stake: 0, total_staked: 0 },
        []
      );
      setUserData(formattedData);
      setRealtimeScore(0);
    } finally {
      setIsLoading(false);
    }
  };

  // 🆕 실시간 스코어 업데이트 로직
  const updateRealTimeScores = () => {
    if (!userData) return;

    const currentTimeSec = Date.now() / 1000;
    const holdingSeconds = currentTimeSec - userData.first_stake_timestamp;
    const holdingDays = holdingSeconds / (24 * 60 * 60);

    // 실시간 점수 재계산 (박스 포인트 포함)
    const baseScore = userData.display_staked * holdingDays * userData.current_multiplier;
    const realTimeScore = baseScore + boxPointsAccumulated; // 박스 포인트 추가
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

    setRealtimeScore(realTimeScore);
  };

  // 🎁 기프트박스에서 포인트 업데이트 콜백
  const handleGiftBoxPointsUpdate = (points) => {
    // 박스 포인트 누적
    setBoxPointsAccumulated(prev => prev + points);

    // userData의 box_points_earned도 업데이트
    setUserData(prev => ({
      ...prev,
      box_points_earned: (prev.box_points_earned || 0) + points,
      real_time_score: prev.real_time_score + points
    }));
  };

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Real-time clock
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

  // Gauge animation
  useEffect(() => {
    if (userData && !gaugeAnimated) {
      setTimeout(() => {
        setGaugeAnimated(true);
      }, 500);
    }
  }, [userData, gaugeAnimated]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: '20px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🥩</div>
          <div style={{ fontSize: 20, marginBottom: 10 }}>Loading STAKE Data...</div>
          <div style={{ fontSize: 14, color: '#666' }}>Fetching real-time blockchain data</div>
          <div style={{
            width: 200,
            height: 4,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 2,
            margin: '20px auto',
            overflow: 'hidden'
          }}>
            <div style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, #4ade80, #22c55e)',
              borderRadius: 2,
              animation: 'pulse 2s infinite'
            }} />
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div style={{
        background: '#0a0a0a',
        minHeight: '100vh',
        padding: '20px',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>❌</div>
          <div style={{ fontSize: 20, marginBottom: 10, color: '#ef4444' }}>Connection Error</div>
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
            🔄 Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  // 유틸리티 함수들
  const formatNumber = (num) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
  };

  const formatFullNumber = (num) => {
    return Math.floor(num).toLocaleString();
  };

  const copyStakeAddress = () => {
    const stakeAddress = "0xBa13ae24684bee910820Be1Fcf52067332F8412f";
    navigator.clipboard.writeText(stakeAddress).then(() => {
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2000);
    }).catch(() => {
      alert(`Contract address: ${stakeAddress}`);
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadUserData().finally(() => {
      setIsRefreshing(false);
      setGaugeAnimated(false);
      setTimeout(() => setGaugeAnimated(true), 100);
    });
  };

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

  // 내장 컴포넌트들 (모듈화되지 않은 것들)
  // EnhancedTierPositionCard 컴포넌트 완전 개선 버전
  // EnhancedTierPositionCard 컴포넌트 완전 개선 버전
  const EnhancedTierPositionCard = () => {
    const [localAnimateScore, setLocalAnimateScore] = useState(false);

    useEffect(() => {
      const interval = setInterval(() => {
        setLocalAnimateScore(true);
        setTimeout(() => setLocalAnimateScore(false), 300);
      }, 2000);
      return () => clearInterval(interval);
    }, []);

    // 등급 이모지 헬퍼 함수
    const getGradeEmoji = (grade) => {
      const gradeEmojis = {
        'Genesis OG': '🌌',
        'Heavy Eater': '💨',
        'Stake Wizard': '🧙',
        'Grilluminati': '👁️',
        'Flame Juggler': '🔥',
        'Flipstarter': '🥩',
        'Sizzlin\' Noob': '🆕',
        'VIRGEN': '🐸'
      };
      return gradeEmojis[grade] || '❓';
    };

    return (
      <div style={{
        background: userData.bg_gradient,
        border: `3px solid ${userData.tier_color}`,
        borderRadius: isMobile ? 16 : 24,
        padding: isMobile ? 20 : 32,
        marginBottom: isMobile ? 16 : 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 30px ${userData.tier_glow_color}`
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
          radial-gradient(circle at 80% 80%, ${userData.tier_color}08 0%, transparent 50%)
        `,
          backgroundSize: '200px 200px, 150px 150px',
          pointerEvents: 'none',
          opacity: 0.3
        }} />

        {/* Phase Badge + Refresh */}
        <div style={{
          position: 'absolute',
          top: isMobile ? 12 : 16,
          right: isMobile ? 12 : 16,
          display: 'flex',
          gap: 8,
          alignItems: 'center'
        }}>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 6,
              padding: '6px 8px',
              color: '#fff',
              fontSize: 12,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.2s'
            }}
          >
            <span style={{
              display: 'inline-block',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none'
            }}>
              🔄
            </span>
            {isRefreshing ? 'Updating...' : 'Refresh'}
          </button>

          <div style={{
            background: userData.tier_color,
            color: '#000',
            padding: isMobile ? '4px 8px' : '6px 12px',
            borderRadius: 8,
            fontSize: isMobile ? 10 : 12,
            fontWeight: 900
          }}>
            PHASE 1
          </div>
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
            marginTop: isMobile ? 36 : 40
          }}>
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
              boxShadow: `0 0 20px ${userData.tier_glow_color}`
            }}>
              {userData.grade_emoji}

              {/* Rotating ring */}
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

            <div style={{ flex: 1 }}>
              <h1 style={{
                fontSize: isMobile ? 18 : 28,
                fontWeight: 900,
                color: userData.tier_color,
                margin: '0 0 8px 0',
                textShadow: `0 0 20px ${userData.tier_glow_color}`
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

              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
                <div style={{
                  fontSize: isMobile ? 20 : 32,
                  fontWeight: 900,
                  color: '#fff',
                  fontFamily: 'monospace',
                  transform: localAnimateScore ? 'scale(1.02)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                  textShadow: '0 0 10px rgba(255,255,255,0.3)'
                }}>
                  {formatFullNumber(realtimeScore)}
                </div>

                <div style={{
                  background: userData.tier_color,
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: isMobile ? 12 : 16,
                  fontWeight: 900,
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
                +{userData.score_per_second?.toFixed(2) || '0.00'} P/sec
              </div>
            </div>
          </div>

          {/* Ranking Gauge */}
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

            <div style={{
              height: isMobile ? 16 : 20,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 10,
              overflow: 'hidden',
              position: 'relative',
              marginBottom: 8
            }}>
              <div style={{
                height: '100%',
                background: `linear-gradient(90deg, ${userData.tier_color}, ${userData.tier_color}80)`,
                width: gaugeAnimated ? `${userData.percentile}%` : '0%',
                borderRadius: 10,
                position: 'relative',
                zIndex: 2,
                transition: 'width 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: `0 0 20px ${userData.tier_glow_color}`
              }} />

              <div style={{
                position: 'absolute',
                left: gaugeAnimated ? `${userData.percentile}%` : '0%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: isMobile ? 16 : 20,
                zIndex: 3,
                transition: 'left 2.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                filter: `drop-shadow(0 0 8px ${userData.tier_color})`
              }}>
                ⭐
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: isMobile ? 10 : 12,
              color: '#999'
            }}>
              <span>0% (Bottom)</span>
              <span style={{
                color: userData.tier_color,
                fontWeight: 700
              }}>
                {userData.percentile.toFixed(1)}%
              </span>
              <span>100% (Top)</span>
            </div>
          </div>

          {/* Points Breakdown - 높이 줄이기 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: isMobile ? 8 : 12,
            marginBottom: isMobile ? 12 : 16
          }}>
            <div style={{
              background: 'rgba(74,222,128,0.1)',
              border: '1px solid rgba(74,222,128,0.3)',
              borderRadius: 8,
              padding: isMobile ? 8 : 12,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? 9 : 10,
                color: '#4ade80',
                marginBottom: 2,
                fontWeight: 600
              }}>
                By Stake
              </div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'monospace'
              }}>
                {formatNumber(userData.points_breakdown?.by_stake || 0)} P
              </div>
            </div>

            <div style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 8,
              padding: isMobile ? 8 : 12,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? 9 : 10,
                color: '#f59e0b',
                marginBottom: 2,
                fontWeight: 600
              }}>
                By Referral
              </div>
              <div style={{
                fontSize: isMobile ? 12 : 14,
                fontWeight: 900,
                color: '#fff',
                fontFamily: 'monospace'
              }}>
                {formatNumber(userData.points_breakdown?.by_referral || 0)} P
              </div>
            </div>
          </div>

          {/* Rank Movement Prediction - 실데이터 연동 */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            border: `1px solid ${userData.border_color}`,
            borderRadius: 8,
            padding: isMobile ? 8 : 12
          }}>
            <h4 style={{
              fontSize: isMobile ? 11 : 12,
              fontWeight: 700,
              color: '#fff',
              margin: '0 0 8px 0',
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              📈 Rank Movement Prediction
            </h4>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 8,
              marginBottom: 8
            }}>
              {/* 24h Prediction */}
              <div style={{
                background: 'rgba(74,222,128,0.1)',
                border: '1px solid rgba(74,222,128,0.2)',
                borderRadius: 6,
                padding: isMobile ? 6 : 8,
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#4ade80',
                  fontSize: isMobile ? 14 : 16,
                  fontWeight: 900,
                  marginBottom: 2
                }}>
                  #{userData.predicted_rank_24h || userData.rank}
                </div>
                <div style={{
                  color: '#999',
                  fontSize: isMobile ? 8 : 9,
                  marginBottom: 2
                }}>
                  24h Prediction
                </div>
                <div style={{
                  color: (userData.predicted_rank_24h || userData.rank) < userData.rank ? '#4ade80' :
                    (userData.predicted_rank_24h || userData.rank) > userData.rank ? '#ef4444' : '#999',
                  fontSize: isMobile ? 7 : 8,
                  fontWeight: 600
                }}>
                  {(() => {
                    const currentRank = userData.rank;
                    const predictedRank = userData.predicted_rank_24h || currentRank;
                    const difference = currentRank - predictedRank;

                    if (difference > 0) {
                      return `↗ +${difference} Rise`;
                    } else if (difference < 0) {
                      return `↘ ${difference} Drop`;
                    } else {
                      return '→ No Change';
                    }
                  })()}
                </div>
              </div>

              {/* Grade Change Prediction */}
              <div style={{
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                borderRadius: 6,
                padding: isMobile ? 6 : 8,
                textAlign: 'center'
              }}>
                <div style={{
                  color: '#8b5cf6',
                  fontSize: isMobile ? 10 : 11,
                  fontWeight: 700,
                  marginBottom: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2
                }}>
                  <span>{getGradeEmoji(userData.predicted_next_tier)}</span>
                  <span style={{ fontSize: isMobile ? 8 : 9 }}>
                    {userData.predicted_next_tier || 'Next Grade'}
                  </span>
                </div>
                <div style={{
                  color: '#999',
                  fontSize: isMobile ? 8 : 9,
                  marginBottom: 2
                }}>
                  Next Grade
                </div>
                <div style={{
                  color: '#4ade80',
                  fontSize: isMobile ? 7 : 8,
                  fontWeight: 600
                }}>
                  {userData.grade === 'Genesis OG' ? '👑 MAX' :
                    userData.grade === 'VIRGEN' ? '↗ Start Staking' :
                      '↗ ~7d'}
                </div>
              </div>
            </div>

            {/* Power Comparison - 실데이터 */}
            <div style={{
              fontSize: isMobile ? 9 : 10,
              color: '#ccc',
              textAlign: 'center',
              padding: isMobile ? 4 : 6,
              background: 'rgba(255,255,255,0.02)',
              borderRadius: 4
            }}>
              💡 Your Power: <span style={{
                color: userData.score_per_second > 0 ? '#4ade80' : '#666',
                fontWeight: 600
              }}>
                {userData.score_per_second?.toFixed(2) || '0.00'} pts/sec
              </span> •
              Average: <span style={{
                color: '#fbbf24',
                fontWeight: 600
              }}>
                ~{((userData.score_per_second || 0) * 0.7).toFixed(2)} pts/sec
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };


  const StakeAmountCard = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,193,7,0.1))',
      border: '2px solid rgba(255,215,0,0.3)',
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 16 : 24,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 8,
        left: 8,
        fontSize: isMobile ? 16 : 20,
        filter: 'drop-shadow(0 0 4px rgba(255,215,0,0.6))'
      }}>
        🏦
      </div>

      <h3 style={{
        fontSize: isMobile ? 16 : 18,
        fontWeight: 700,
        color: '#ffd700',
        margin: `0 0 ${isMobile ? 12 : 16}px 0`,
        textAlign: 'center'
      }}>
        🥩 My stSTAKE
      </h3>

      {/* Gray box with improved layout */}
      <div style={{
        background: 'rgba(200,200,200,0.9)',
        borderRadius: 8,
        padding: '10px 14px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 4
        }}>
          <div style={{
            fontSize: isMobile ? 20 : 24,
            fontWeight: 900,
            color: '#2a2a2a',
            fontFamily: 'monospace'
          }}>
            {userData.display_staked?.toLocaleString() || '0'}
          </div>
          <div style={{
            fontSize: isMobile ? 12 : 14,
            fontWeight: 700,
            color: '#4a4a4a'
          }}>
            stSTAKE
          </div>
        </div>

        <div style={{
          fontSize: isMobile ? 11 : 12,
          color: '#2a2a2a',
          fontWeight: 600,
          fontFamily: 'monospace'
        }}>
          ≈ ${((userData.display_staked || 0) * 0.0025).toLocaleString()}
        </div>
      </div>
    </div>
  );

  // Phase 1 할당 카드
  const Phase1AllocationCard = () => {
    const phase1EndTime = new Date('2025-06-27T09:59:59Z').getTime();
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
      const updateTimer = () => {
        const now = Date.now();
        const diff = phase1EndTime - now;

        if (diff <= 0) {
          setTimeLeft('Phase Ended');
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          setTimeLeft(`${days}d ${hours}h`);
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 60000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div style={{
        background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
        border: '2px solid rgba(16,185,129,0.3)',
        borderRadius: isMobile ? 16 : 20,
        padding: isMobile ? 16 : 24,
        marginBottom: isMobile ? 16 : 24,
        position: 'relative'
      }}>
        <h3 style={{
          fontSize: isMobile ? 14 : 16,
          fontWeight: 700,
          color: '#10b981',
          margin: `0 0 ${isMobile ? 12 : 16}px 0`,
          textAlign: 'center'
        }}>
          💎 Phase 1 Balance
        </h3>

        {/* Gray box with improved layout */}
        <div style={{
          background: 'rgba(200,200,200,0.9)',
          borderRadius: 8,
          padding: '10px 14px',
          marginBottom: 16,
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginBottom: 4
          }}>
            <div style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 900,
              color: '#2a2a2a',
              fontFamily: 'monospace'
            }}>
              {userData.phase1_allocation_tokens?.toLocaleString() || '0'}
            </div>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 700,
              color: '#4a4a4a'
            }}>
              $STAKE
            </div>
          </div>

          <div style={{
            fontSize: isMobile ? 11 : 12,
            color: '#2a2a2a',
            fontWeight: 600,
            fontFamily: 'monospace'
          }}>
            ≈ ${userData.phase1_allocation_usd?.toLocaleString() || '0'}
          </div>
        </div>

        <div style={{
          background: 'rgba(16,185,129,0.1)',
          borderRadius: 10,
          padding: 12,
          textAlign: 'center',
          marginBottom: 16
        }}>
          <div style={{ color: '#10b981', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
            🔥 Top {userData.percentile?.toFixed(1) || '0.0'}% Elite Tier!
          </div>
          <div style={{ color: '#ccc', fontSize: 11 }}>
            {userData.phase1_allocation_percent?.toFixed(2) || '0.00'}% of Phase 1 Pool
          </div>
        </div>

        <div style={{
          marginTop: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 12
        }}>
          <button
            onClick={handleJeetWarning}
            style={{
              padding: '14px 20px',
              background: 'rgba(239,68,68,0.1)',
              border: '2px solid rgba(239,68,68,0.2)',
              borderRadius: 12,
              color: '#ef4444',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '48px'
            }}
          >
            💰 Claim
          </button>

          <button
            style={{
              padding: '14px 20px',
              background: 'rgba(16,185,129,0.1)',
              border: '2px solid rgba(16,185,129,0.2)',
              borderRadius: 12,
              color: '#10b981',
              fontSize: 14,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: '48px'
            }}
          >
            🚀 Phase 2
          </button>
        </div>

        <div style={{
          marginTop: 16,
          padding: 12,
          background: 'rgba(251,191,36,0.1)',
          border: '1px solid rgba(251,191,36,0.3)',
          borderRadius: 8,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, color: '#fbbf24', fontWeight: 600, marginBottom: 4 }}>
            🕐 Phase 1 ends in: {timeLeft}
          </div>
          <div style={{ fontSize: 10, color: '#fbbf24' }}>
            Claim available: December 7, 2025
          </div>
        </div>
      </div>
    );
  };

  // STAKEHOUSE 카드 (전체 너비)
  const StakehouseCard = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
      border: '3px solid rgba(139,92,246,0.4)',
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 20 : 24,
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: isMobile ? 12 : 16,
        right: isMobile ? 12 : 16,
        background: '#8b5cf6',
        color: '#fff',
        padding: isMobile ? '4px 8px' : '6px 12px',
        borderRadius: 8,
        fontSize: isMobile ? 10 : 12,
        fontWeight: 900
      }}>
        COMING SOON
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 16 : 20
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 16 : 20
        }}>
          <div style={{
            width: isMobile ? 60 : 80,
            height: isMobile ? 60 : 80,
            background: 'radial-gradient(circle, rgba(139,92,246,0.4), rgba(139,92,246,0.1))',
            border: '2px solid #8b5cf6',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 24 : 32
          }}>
            🏠
          </div>

          <div>
            <h2 style={{
              fontSize: isMobile ? 16 : 20,
              fontWeight: 900,
              color: '#8b5cf6',
              margin: '0 0 4px 0'
            }}>
              STAKEHOUSE
            </h2>

            <div style={{ fontSize: isMobile ? 10 : 12, color: '#999', marginBottom: 8 }}>
              Enhanced Rewards System
            </div>

            <div style={{
              fontSize: isMobile ? 18 : 24,
              fontWeight: 900,
              color: '#fff',
              fontFamily: 'monospace'
            }}>
              {formatNumber(userData.stakehouse_score || 0)} P
            </div>

            <div style={{ fontSize: isMobile ? 9 : 11, color: '#8b5cf6', fontWeight: 600, marginTop: 4 }}>
              +{userData.stakehouse_per_second?.toFixed(2) || '0.00'} P/sec (Accumulating)
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(0,0,0,0.3)',
          borderRadius: 12,
          padding: isMobile ? 16 : 20,
          textAlign: 'center',
          maxWidth: isMobile ? '60%' : '40%'
        }}>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#8b5cf6', fontWeight: 600, marginBottom: 8 }}>
            🚀 Points accumulating for launch!
          </div>
          <div style={{ fontSize: isMobile ? 10 : 12, color: '#999' }}>
            Your STAKEHOUSE points will be converted to enhanced rewards when the system goes live.
          </div>
        </div>
      </div>
    </div>
  );

  // 홀딩 타임 카드
  const HoldingTimeCard = () => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 16 : 24
    }}>
      <h4 style={{
        fontSize: isMobile ? 14 : 16,
        fontWeight: 700,
        color: '#fff',
        margin: '0 0 12px 0',
        textAlign: 'center'
      }}>
        ⏰ Holding Time (Real-time)
      </h4>

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
            <div style={{ color: '#4ade80', fontSize: isMobile ? 14 : 16, fontWeight: 900 }}>
              {item.value.toString().padStart(2, '0')}
            </div>
            <div style={{ color: '#999', fontSize: isMobile ? 8 : 10 }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>

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
          minHeight: '48px'
        }}>
          🛒 Stake More
        </button>

        <button
          onClick={copyStakeAddress}
          style={{
            padding: isMobile ? '12px 16px' : '10px 16px',
            background: copiedContract ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)',
            border: copiedContract ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: copiedContract ? '#4ade80' : '#fff',
            fontSize: isMobile ? 12 : 11,
            fontWeight: 600,
            cursor: 'pointer',
            minHeight: '44px',
            transition: 'all 0.3s'
          }}
        >
          {copiedContract ? '✅ Copied!' : '📋 Contract Address'}
        </button>
      </div>
    </div>
  );

  // JEET 경고 모달
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
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? 16 : 20
      }}>
        <div style={{
          background: '#1a1d29',
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
                minHeight: '48px'
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
                minHeight: '48px'
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
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes sparkle {
            0%, 100% { opacity: 0; transform: scale(0); }
            50% { opacity: 1; transform: scale(1); }
          }
          @keyframes flame {
            0%, 100% { 
              transform: translateX(-50%) scale(1) rotate(-1deg);
              filter: brightness(1);
            }
            25% { 
              transform: translateX(-50%) scale(1.05) rotate(1deg);
              filter: brightness(1.2);
            }
            50% { 
              transform: translateX(-50%) scale(0.95) rotate(-0.5deg);
              filter: brightness(0.9);
            }
            75% { 
              transform: translateX(-50%) scale(1.02) rotate(0.5deg);
              filter: brightness(1.1);
            }
          }
        `
      }} />

      <div style={{
        maxWidth: isMobile ? '100%' : 1400,
        margin: '0 auto'
      }}>
        {/* Mobile: Gift Box at top, PC: integrated in layout */}
        {isMobile && (
          <GiftBoxSystem
            userData={userData}
            isMobile={isMobile}
            onPointsUpdate={handleGiftBoxPointsUpdate}
          />
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: isMobile ? 16 : 24,
          marginBottom: isMobile ? 16 : 24
        }}>
          <div>
            <EnhancedTierPositionCard />
            <GrillTemperature userData={userData} isMobile={isMobile} />
            <StakeAmountCard />
          </div>

          <div>
            {/* PC only: Gift Box System */}
            {!isMobile && (
              <GiftBoxSystem
                userData={userData}
                isMobile={isMobile}
                onPointsUpdate={handleGiftBoxPointsUpdate}
              />
            )}
            <Phase1AllocationCard />
            <HoldingTimeCard />
          </div>
        </div>

        {/* Bottom: STAKEHOUSE Full Width */}
        <div style={{ marginTop: isMobile ? 16 : 24 }}>
          <StakehouseCard />
        </div>

        {/* Mobile: Holding Time at bottom */}
        {isMobile && <HoldingTimeCard />}
      </div>

      <JeetWarningModal />
    </div>
  );
};

export default OptimizedIntegratedDashboard;