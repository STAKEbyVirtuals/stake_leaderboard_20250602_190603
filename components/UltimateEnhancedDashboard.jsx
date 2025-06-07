import React, { useState, useEffect, useCallback } from 'react';

// 🎯 Ultimate Complete Dashboard - Mobile Optimized
const UltimateEnhancedDashboard = ({ userAddress = "0x95740c952739faed6527fc1f5fc3b5bee10dae15" }) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLive, setIsLive] = useState(true);
  const [showJeetWarning, setShowJeetWarning] = useState(false);
  const [jeetWarningStep, setJeetWarningStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
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
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Phase 1 end date (example: 19 days from now)
  const phase1EndDate = new Date(Date.now() + (19 * 24 * 60 * 60 * 1000));
  const phase2StartDate = new Date(Date.now() + (19.1 * 24 * 60 * 60 * 1000));

  // 🆕 Enhanced real-time calculated dummy data
  const userData = {
    address: userAddress,
    rank: 12,
    grade: "Genesis OG",
    grade_emoji: "🌌",
    
    // Staking information
    total_staked: 150000,
    virtual_staked: 50000,
    display_staked: 200000,
    
    // Phase 1 allocation calculation
    stake_score: 4150327,
    phase1_allocation_percent: 8.62,
    phase1_allocation_tokens: 431250,
    phase1_allocation_usd: 1078,
    
    // Grade information
    current_multiplier: 5.0,
    next_grade: null, // Genesis is max level
    
    // Phase status
    current_phase: 1,
    phase_status: "active",
    is_diamond_hand_eligible: true, // Joined within 24 hours
    
    // Time information
    first_stake_timestamp: Date.now() / 1000 - (38 * 24 * 60 * 60), // 38 days ago
    holding_days: 38.6,
    
    // Ranking information
    total_participants: 1247,
    rank_change_24h: 3, // Up
    predicted_rank_24h: 8,
    
    // 3 upgrade track status
    upgrade_tracks: {
      fast_track: {
        available: false, // Genesis is max level
        required_stake: 100000,
        current_progress: 0,
        next_tier: null
      },
      regular_track: {
        available: false, // Genesis is max level
        days_remaining: 0,
        next_tier: null
      },
      diamond_hand: {
        available: false, // Genesis is max level
        phase_end_countdown: Math.floor((phase1EndDate.getTime() - Date.now()) / 1000),
        next_tier: null
      }
    },
    
    // Calculated real-time values
    get real_time_score() {
      const secondsElapsed = (currentTime / 1000) - this.first_stake_timestamp;
      const daysElapsed = secondsElapsed / (24 * 60 * 60);
      const rawScore = this.display_staked * daysElapsed;
      return rawScore;
    },
    
    get multiplied_score() {
      return this.real_time_score * this.current_multiplier;
    },
    
    get score_per_second() {
      return this.display_staked / (24 * 60 * 60);
    },
    
    get multiplied_score_per_second() {
      return this.score_per_second * this.current_multiplier;
    },
    
    get stakehouse_score() {
      return this.real_time_score * 0.15;
    },
    
    get stakehouse_per_second() {
      return (this.display_staked * 0.15) / (24 * 60 * 60);
    },
    
    get real_time_holding() {
      const totalSeconds = Math.floor((currentTime / 1000) - this.first_stake_timestamp);
      return {
        days: Math.floor(totalSeconds / (24 * 60 * 60)),
        hours: Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60)),
        minutes: Math.floor((totalSeconds % (60 * 60)) / 60),
        seconds: totalSeconds % 60
      };
    },
    
    get percentile() {
      return ((this.total_participants - this.rank) / this.total_participants) * 100;
    }
  };

  // Number formatting
  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return Math.floor(num).toLocaleString();
  };

  const formatScore = (num) => {
    return (num / 1000000).toFixed(2) + 'M';
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
      // Actual JEET processing
      alert("JEET processed! Grade reset and Phase 2 participation disabled.");
      setShowJeetWarning(false);
      setJeetWarningStep(0);
    }
  };

  // Copy contract address
  const copyStakeAddress = () => {
    const stakeAddress = "0x1234567890abcdef1234567890abcdef12345678";
    navigator.clipboard.writeText(stakeAddress);
    alert("STAKE contract address copied!");
  };

  // 🔥 Top key metrics cards - Mobile Optimized
  const MetricCard = ({ title, value, subtitle, trend, color, icon, isLive = false, highlight = false }) => (
    <div style={{
      background: highlight 
        ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,193,7,0.1))'
        : 'rgba(255,255,255,0.05)',
      border: highlight 
        ? '2px solid rgba(255,215,0,0.3)'
        : '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? '16px 12px' : '20px',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
      minHeight: isMobile ? 'auto' : '140px'
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
        fontSize: isMobile ? 18 : 24,
        fontWeight: 900,
        color: color || '#fff',
        marginBottom: 4,
        fontFamily: 'monospace',
        lineHeight: 1.2
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

  // 🎯 Enhanced position gauge - Mobile Optimized
  const EnhancedPositionGauge = () => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 24,
      marginBottom: isMobile ? 16 : 24
    }}>
      <h3 style={{
        fontSize: isMobile ? 16 : 18,
        fontWeight: 700,
        color: '#fff',
        margin: `0 0 ${isMobile ? 12 : 16}px 0`,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        🎯 Global Leaderboard Position
      </h3>
      
      {/* Enhanced gauge bar */}
      <div style={{
        position: 'relative',
        height: isMobile ? 20 : 24,
        background: 'rgba(255,255,255,0.1)',
        borderRadius: isMobile ? 10 : 12,
        overflow: 'visible',
        marginBottom: isMobile ? 12 : 16
      }}>
        {/* Main gauge */}
        <div style={{
          width: `${userData.percentile}%`,
          height: '100%',
          background: `linear-gradient(90deg, #4ade80, #22c55e)`,
          borderRadius: isMobile ? 10 : 12,
          transition: 'width 0.3s ease'
        }} />
        
        {/* Current position (fire 🔥) */}
        <div style={{
          position: 'absolute',
          left: `${userData.percentile}%`,
          top: isMobile ? -1 : -2,
          transform: 'translateX(-50%)',
          fontSize: isMobile ? 16 : 20,
          filter: 'drop-shadow(0 0 8px rgba(255,69,0,0.8))',
          zIndex: 3
        }}>
          🔥
        </div>
        
        {/* Max grade position (steak 🥩) */}
        <div style={{
          position: 'absolute',
          right: isMobile ? 6 : 8,
          top: isMobile ? -1 : -2,
          fontSize: isMobile ? 16 : 20,
          filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.8))',
          zIndex: 2
        }}>
          🥩
        </div>
        
        {/* Gauge bar labels */}
        <div style={{
          position: 'absolute',
          left: `${userData.percentile}%`,
          bottom: isMobile ? -16 : -20,
          transform: 'translateX(-50%)',
          fontSize: isMobile ? 8 : 10,
          color: '#4ade80',
          fontWeight: 700
        }}>
          Current
        </div>
        
        <div style={{
          position: 'absolute',
          right: isMobile ? 6 : 8,
          bottom: isMobile ? -16 : -20,
          fontSize: isMobile ? 8 : 10,
          color: '#ffd700',
          fontWeight: 700
        }}>
          Genesis
        </div>
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: isMobile ? 12 : 16,
        fontSize: isMobile ? 11 : 13,
        marginTop: isMobile ? 20 : 0
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#4ade80', 
            fontWeight: 700, 
            fontSize: isMobile ? 14 : 16 
          }}>
            #{userData.rank}
          </div>
          <div style={{ color: '#999' }}>Current Rank</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#4ade80', 
            fontWeight: 700, 
            fontSize: isMobile ? 14 : 16 
          }}>
            Top {userData.percentile.toFixed(1)}%
          </div>
          <div style={{ color: '#999' }}>Elite Tier</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            color: '#4ade80', 
            fontWeight: 700, 
            fontSize: isMobile ? 14 : 16 
          }}>
            {userData.total_participants - userData.rank}
          </div>
          <div style={{ color: '#999' }}>Users Below</div>
        </div>
      </div>
    </div>
  );

  // 📈 Rank trend prediction - Mobile Optimized
  const RankTrend = () => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 24,
      marginBottom: isMobile ? 16 : 24
    }}>
      <h3 style={{
        fontSize: isMobile ? 16 : 18,
        fontWeight: 700,
        color: '#fff',
        margin: `0 0 ${isMobile ? 12 : 16}px 0`,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        📈 Rank Movement Prediction
      </h3>
      
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
            color: '#4ade80', 
            fontSize: isMobile ? 9 : 11, 
            marginTop: 4 
          }}>
            ↗ +{userData.rank - userData.predicted_rank_24h} Rise
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
            18h 34m
          </div>
          <div style={{ 
            color: '#999', 
            fontSize: isMobile ? 10 : 12 
          }}>
            To Next Rank
          </div>
          <div style={{ 
            color: '#8b5cf6', 
            fontSize: isMobile ? 9 : 11, 
            marginTop: 4 
          }}>
            Current Trend
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
        💡 Current Trend: <span style={{ color: '#4ade80', fontWeight: 600 }}>+0.83 ranks/day</span> Rising
      </div>
    </div>
  );

  // 🚀 3 Tier Upgrade Tracks - Mobile Optimized
  const UpgradeTracksRow = () => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 16 : 24
    }}>
      <h3 style={{
        fontSize: isMobile ? 16 : 18,
        fontWeight: 700,
        color: '#fff',
        margin: `0 0 ${isMobile ? 12 : 16}px 0`,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }}>
        🎯 Tier Upgrade Tracks
      </h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
        gap: isMobile ? 8 : 12
      }}>
        {/* Fast Track */}
        <div style={{
          background: userData.upgrade_tracks.fast_track.available 
            ? 'rgba(255,107,53,0.1)' 
            : 'rgba(107,114,128,0.1)',
          border: userData.upgrade_tracks.fast_track.available 
            ? '1px solid rgba(255,107,53,0.3)' 
            : '1px solid rgba(107,114,128,0.3)',
          borderRadius: 12,
          padding: isMobile ? '12px 8px' : 16,
          textAlign: 'center',
          opacity: userData.upgrade_tracks.fast_track.available ? 1 : 0.6,
          display: isMobile ? 'flex' : 'block',
          alignItems: isMobile ? 'center' : 'stretch',
          gap: isMobile ? 12 : 0
        }}>
          <div style={{ 
            fontSize: isMobile ? 16 : 20, 
            marginBottom: isMobile ? 0 : 8,
            flexShrink: 0
          }}>
            ⚡
          </div>
          <div style={{ flex: 1, textAlign: isMobile ? 'left' : 'center' }}>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 700,
              color: userData.upgrade_tracks.fast_track.available ? '#ff6b35' : '#6b7280',
              marginBottom: 4
            }}>
              Fast Track
            </div>
            <div style={{
              fontSize: isMobile ? 10 : 11,
              color: '#999',
              marginBottom: isMobile ? 0 : 8,
              lineHeight: 1.3
            }}>
              +100K Stake
            </div>
          </div>
          <div style={{
            fontSize: isMobile ? 10 : 12,
            color: userData.upgrade_tracks.fast_track.available ? '#ff6b35' : '#6b7280',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {userData.upgrade_tracks.fast_track.available ? 'Instant' : 'MAX'}
          </div>
        </div>

        {/* Regular Track */}
        <div style={{
          background: userData.upgrade_tracks.regular_track.available 
            ? 'rgba(74,222,128,0.1)' 
            : 'rgba(107,114,128,0.1)',
          border: userData.upgrade_tracks.regular_track.available 
            ? '1px solid rgba(74,222,128,0.3)' 
            : '1px solid rgba(107,114,128,0.3)',
          borderRadius: 12,
          padding: isMobile ? '12px 8px' : 16,
          textAlign: 'center',
          opacity: userData.upgrade_tracks.regular_track.available ? 1 : 0.6,
          display: isMobile ? 'flex' : 'block',
          alignItems: isMobile ? 'center' : 'stretch',
          gap: isMobile ? 12 : 0
        }}>
          <div style={{ 
            fontSize: isMobile ? 16 : 20, 
            marginBottom: isMobile ? 0 : 8,
            flexShrink: 0
          }}>
            📅
          </div>
          <div style={{ flex: 1, textAlign: isMobile ? 'left' : 'center' }}>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 700,
              color: userData.upgrade_tracks.regular_track.available ? '#4ade80' : '#6b7280',
              marginBottom: 4
            }}>
              Regular Track
            </div>
            <div style={{
              fontSize: isMobile ? 10 : 11,
              color: '#999',
              marginBottom: isMobile ? 0 : 8,
              lineHeight: 1.3
            }}>
              Hold 5 Days
            </div>
          </div>
          <div style={{
            fontSize: isMobile ? 10 : 12,
            color: userData.upgrade_tracks.regular_track.available ? '#4ade80' : '#6b7280',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {userData.upgrade_tracks.regular_track.available 
              ? `${userData.upgrade_tracks.regular_track.days_remaining}d` 
              : 'MAX'}
          </div>
        </div>

        {/* Diamond Hand Track */}
        <div style={{
          background: userData.upgrade_tracks.diamond_hand.available 
            ? 'rgba(139,92,246,0.1)' 
            : 'rgba(107,114,128,0.1)',
          border: userData.upgrade_tracks.diamond_hand.available 
            ? '1px solid rgba(139,92,246,0.3)' 
            : '1px solid rgba(107,114,128,0.3)',
          borderRadius: 12,
          padding: isMobile ? '12px 8px' : 16,
          textAlign: 'center',
          opacity: userData.upgrade_tracks.diamond_hand.available ? 1 : 0.6,
          display: isMobile ? 'flex' : 'block',
          alignItems: isMobile ? 'center' : 'stretch',
          gap: isMobile ? 12 : 0
        }}>
          <div style={{ 
            fontSize: isMobile ? 16 : 20, 
            marginBottom: isMobile ? 0 : 8,
            flexShrink: 0
          }}>
            💎
          </div>
          <div style={{ flex: 1, textAlign: isMobile ? 'left' : 'center' }}>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 700,
              color: userData.upgrade_tracks.diamond_hand.available ? '#8b5cf6' : '#6b7280',
              marginBottom: 4
            }}>
              Diamond Hand
            </div>
            <div style={{
              fontSize: isMobile ? 10 : 11,
              color: '#999',
              marginBottom: isMobile ? 0 : 8,
              lineHeight: 1.3
            }}>
              Till Phase End
            </div>
          </div>
          <div style={{
            fontSize: isMobile ? 10 : 12,
            color: userData.upgrade_tracks.diamond_hand.available ? '#8b5cf6' : '#6b7280',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {userData.upgrade_tracks.diamond_hand.available 
              ? formatCountdown(userData.upgrade_tracks.diamond_hand.phase_end_countdown)
              : 'MAX'}
          </div>
        </div>
      </div>
      
      {/* Description */}
      <div style={{
        marginTop: 12,
        padding: isMobile ? 8 : 12,
        background: 'rgba(255,215,0,0.05)',
        border: '1px solid rgba(255,215,0,0.2)',
        borderRadius: 8,
        textAlign: 'center'
      }}>
        <div style={{ 
          color: '#ffd700', 
          fontSize: isMobile ? 10 : 12, 
          fontWeight: 600 
        }}>
          👑 Genesis OG is already the maximum level!
        </div>
      </div>
    </div>
  );

  // 💰 Phase 1 Allocation Card - Mobile Optimized
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
              VIRTUAL ({userData.phase1_allocation_percent}%)
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
          🕐 Actual Release Date: December 7, 2025 (151 days)
        </div>
      </div>
    </div>
  );

  // 🎖️ Grade Information Card - Mobile Optimized
  const GradeInfo = () => (
    <div style={{
      background: 'linear-gradient(135deg, rgba(74,222,128,0.15), rgba(34,197,94,0.1))',
      border: '2px solid rgba(74,222,128,0.3)',
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 16 : 24,
      marginBottom: isMobile ? 16 : 24
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 12 : 16,
        marginBottom: isMobile ? 12 : 16
      }}>
        <div style={{
          fontSize: isMobile ? 36 : 48,
          filter: 'drop-shadow(0 4px 8px rgba(74,222,128,0.4))'
        }}>
          {userData.grade_emoji}
        </div>
        <div>
          <h2 style={{
            fontSize: isMobile ? 18 : 24,
            fontWeight: 900,
            color: '#fff',
            margin: '0 0 4px 0'
          }}>
            {userData.grade}
          </h2>
          <div style={{
            fontSize: isMobile ? 14 : 16,
            color: '#4ade80',
            fontWeight: 700
          }}>
            {userData.current_multiplier}x Multiplier
          </div>
        </div>
      </div>
      
      <div style={{
        background: 'rgba(0,0,0,0.2)',
        borderRadius: 12,
        padding: isMobile ? 12 : 16
      }}>
        <h4 style={{
          fontSize: isMobile ? 12 : 14,
          color: '#4ade80',
          margin: '0 0 8px 0',
          fontWeight: 700
        }}>
          🎁 Current Grade Benefits
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? 4 : 8,
          fontSize: isMobile ? 10 : 12,
          color: '#ccc'
        }}>
          <div>✅ Max Reward Multiplier (5.0x)</div>
          <div>✅ Genesis Exclusive Channel</div>
          <div>✅ Priority Support Service</div>
          <div>✅ Beta Features Early Access</div>
          <div>✅ NFT Airdrop Priority</div>
          <div>✅ VIP Customer Support</div>
        </div>
      </div>
      
      <div style={{
        marginTop: isMobile ? 12 : 16,
        padding: isMobile ? 8 : 12,
        background: 'rgba(255,215,0,0.1)',
        border: '1px solid rgba(255,215,0,0.3)',
        borderRadius: 8,
        textAlign: 'center'
      }}>
        <div style={{ color: '#ffd700', fontWeight: 700, fontSize: isMobile ? 12 : 14 }}>
          👑 MAX LEVEL REACHED!
        </div>
        <div style={{ 
          color: '#999', 
          fontSize: isMobile ? 10 : 12, 
          marginTop: 4 
        }}>
          Already at maximum grade
        </div>
      </div>
    </div>
  );

  // ⏰ Time Information + Action Buttons - Mobile Optimized
  const TimeAndActions = () => (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: isMobile ? 12 : 16,
      padding: isMobile ? 16 : 20,
      textAlign: 'center'
    }}>
      <h4 style={{
        fontSize: isMobile ? 14 : 16,
        fontWeight: 700,
        color: '#fff',
        margin: `0 0 ${isMobile ? 10 : 12}px 0`
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
          { value: userData.real_time_holding.days, label: 'Days' },
          { value: userData.real_time_holding.hours, label: 'Hours' },
          { value: userData.real_time_holding.minutes, label: 'Min' },
          { value: userData.real_time_holding.seconds, label: 'Sec' }
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

  // JEET Warning Modal - Mobile Optimized
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
        
        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .mobile-grid-2x3 {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .mobile-single-column {
            grid-template-columns: 1fr !important;
          }
          
          .mobile-touch-target {
            min-height: 44px !important;
            min-width: 44px !important;
          }
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
        
        {/* 🔥 Top: Key metrics cards - Mobile Optimized (2x3 grid on mobile) */}
        <div 
          className={isMobile ? "mobile-grid-2x3" : ""}
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: isMobile ? 8 : 16,
            marginBottom: isMobile ? 16 : 24
          }}
        >
          <MetricCard
            icon="🥩"
            title="stSTAKE"
            value={formatNumber(userData.display_staked)}
            subtitle={`Real: ${formatNumber(userData.total_staked)} + Event: ${formatNumber(userData.virtual_staked)}`}
            trend={`+${userData.score_per_second.toFixed(2)}/sec`}
            color="#4ade80"
            isLive={isLive}
          />
          
          <MetricCard
            icon="🎯"
            title="STAKE Score"
            value={formatScore(userData.multiplied_score)}
            subtitle={`Raw: ${formatScore(userData.real_time_score)} × ${userData.current_multiplier}`}
            trend={`+${userData.multiplied_score_per_second.toFixed(1)}/sec`}
            color="#ffd700"
            isLive={isLive}
          />
          
          <MetricCard
            icon="🏠"
            title="STAKEHOUSE"
            value={formatNumber(userData.stakehouse_score)}
            subtitle="Coming Soon"
            trend={`+${userData.stakehouse_per_second.toFixed(2)}/sec`}
            color="#8b5cf6"
            isLive={isLive}
          />
          
          <MetricCard
            icon="🏆"
            title="Current Rank"
            value={`#${userData.rank}`}
            subtitle={`out of ${userData.total_participants}`}
            trend={userData.rank_change_24h > 0 ? `↗ +${userData.rank_change_24h}` : `↘ ${userData.rank_change_24h}`}
            color="#ef4444"
          />
          
          {/* Phase 1 allocation card spans 2 columns on mobile */}
          <div style={{ 
            gridColumn: isMobile ? '1 / -1' : 'auto'
          }}>
            <MetricCard
              icon="💎"
              title="Phase 1 Allocation"
              value={`${userData.phase1_allocation_percent}%`}
              subtitle={formatNumber(userData.phase1_allocation_tokens) + " VIRTUAL"}
              trend={`$${formatNumber(userData.phase1_allocation_usd)}`}
              color="#ffd700"
              highlight={true}
            />
          </div>
        </div>
        
        {/* Main content area - Mobile: Single column */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: isMobile ? 16 : 24
        }}>
          {/* Left: Position gauge + Tier upgrade tracks + Rank trend */}
          <div>
            <EnhancedPositionGauge />
            <UpgradeTracksRow />
            <RankTrend />
          </div>
          
          {/* Right: Phase 1 allocation + Grade info + Time/Actions */}
          <div>
            <Phase1AllocationCard />
            <GradeInfo />
            <TimeAndActions />
          </div>
        </div>
      </div>
      
      {/* JEET warning modal */}
      <JeetWarningModal />
    </div>
  );
};

export default UltimateEnhancedDashboard;