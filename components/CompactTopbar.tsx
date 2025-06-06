// 📁 components/CompactTopbar.tsx - 개선된 버전

import React, { useState, useEffect } from 'react';
import { ConnectButton } from "@rainbow-me/rainbowkit";

// 페이즈 일정 (기존과 동일)
const PHASE_SCHEDULE = {
  PHASE_1_END: new Date('2025-06-30T23:59:59Z'),
  PHASE_2_START: new Date('2025-07-01T00:00:00Z'),
  PHASE_3_START: new Date('2025-08-01T00:00:00Z'),
  PHASE_4_START: new Date('2025-09-01T00:00:00Z'),
  PHASE_5_START: new Date('2025-10-01T00:00:00Z'),
  PHASE_6_START: new Date('2025-11-01T00:00:00Z'),
};

// 카운트다운 훅
function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
          total: difference
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return timeLeft;
}

// 🆕 개선된 CompactTopbar 컴포넌트
interface CompactTopbarProps {
  isMobile: boolean;
  onMobileMenuToggle: () => void;
  currentPhase?: number;
  totalPhases?: number;
  onPhaseClick?: (phase: number) => void;
}

const CompactTopbar: React.FC<CompactTopbarProps> = ({ 
  isMobile, 
  onMobileMenuToggle, 
  currentPhase = 1, 
  totalPhases = 6,
  onPhaseClick 
}) => {
  const phase1TimeLeft = useCountdown(PHASE_SCHEDULE.PHASE_1_END);

  return (
    <>
      {/* 🎨 개선된 컴팩트 상단바 스타일 */}
      <style jsx>{`
        .compact-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: ${isMobile ? '72px' : '60px'};
          background: rgba(10, 10, 10, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          z-index: 100;
          display: flex;
          align-items: ${isMobile ? 'center' : 'center'};
          justify-content: space-between;
          padding: 0 ${isMobile ? '16px' : '32px'};
        }

        .logo-section {
          display: ${isMobile ? 'flex' : 'none'};
          align-items: center;
          flex: 0 0 auto;
        }

        /* 🎯 개선된 로고 스타일 - 앤틱 골드 맥박 + 링 */
        .logo-circle {
          width: ${isMobile ? '48px' : '36px'};
          height: ${isMobile ? '48px' : '36px'};
          border-radius: 50%;
          background: linear-gradient(135deg, #b8860b, #d4af37);
          border: 2px solid rgba(184, 134, 11, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
          animation: logoPulse 2s infinite;
        }

        .logo-circle:hover {
          transform: scale(1.05);
          box-shadow: 0 8px 25px rgba(184, 134, 11, 0.4);
        }

        .logo-circle:active {
          transform: scale(0.95);
        }

        /* 맥박 링 효과 - 앤틱 골드 */
        .logo-circle::after {
          content: '';
          position: absolute;
          inset: -4px;
          border: 2px solid rgba(184, 134, 11, 0.3);
          border-radius: 50%;
          animation: pulseRing 2s infinite;
          pointer-events: none;
        }

        /* 로고 이미지 스타일 */
        .logo-image {
          width: 100%;
          height: 100%;
          background-image: url('/images/logo.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 50%;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          z-index: 1;
        }

        /* 로고 이미지 로딩 실패시 백업 */
        .logo-image-fallback {
          font-size: ${isMobile ? '20px' : '16px'};
          filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
          z-index: 1;
          color: white;
          font-weight: bold;
        }

        /* MENU 라벨 */
        .menu-label {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 9px;
          color: rgba(255,255,255,0.6);
          font-weight: 600;
          letter-spacing: 0.5px;
          white-space: nowrap;
          opacity: 0.8;
          display: ${isMobile ? 'block' : 'none'};
        }

        /* 맥박 애니메이션 - 앤틱 골드 */
        @keyframes logoPulse {
          0%, 100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.4);
          }
          50% { 
            transform: scale(1.02);
            box-shadow: 0 0 0 10px rgba(184, 134, 11, 0);
          }
        }

        @keyframes pulseRing {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }

        .phase-section {
          flex: 1;
          display: flex;
          flex-direction: ${isMobile ? 'column' : 'row'};
          align-items: center;
          justify-content: center;
          gap: ${isMobile ? '8px' : '24px'};
          height: ${isMobile ? '100%' : 'auto'};
          margin: 0 ${isMobile ? '16px' : '0'};
        }

        .phase-progress,
        .countdown {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          border-radius: ${isMobile ? '10px' : '12px'};
          font-weight: 600;
          width: ${isMobile ? '240px' : '320px'};
          height: ${isMobile ? '26px' : 'auto'};
          padding: ${isMobile ? '6px 12px' : '8px 16px'};
          font-size: ${isMobile ? '11px' : '13px'};
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .phase-progress {
          background: rgba(74, 222, 128, 0.12);
          border: 1px solid rgba(74, 222, 128, 0.25);
        }

        .countdown {
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.25);
          color: #ef4444;
        }

        .phase-dots {
          display: flex;
          align-items: center;
          gap: ${isMobile ? '3px' : '4px'};
        }

        .phase-dot {
          width: ${isMobile ? '14px' : '18px'};
          height: ${isMobile ? '14px' : '18px'};
          border-radius: 50%;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-size: ${isMobile ? '7px' : '9px'};
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .phase-dot.active {
          background: linear-gradient(135deg, #4ade80, #22c55e);
          color: white;
          box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
          animation: pulse-glow 2s infinite;
        }

        .phase-dot.completed {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .phase-dot.upcoming {
          background: rgba(107, 114, 128, 0.4);
          color: #9ca3af;
          transform: scale(0.9);
        }

        .phase-connector {
          width: ${isMobile ? '8px' : '12px'};
          height: ${isMobile ? '1.5px' : '2px'};
          background: linear-gradient(90deg, #10b981, #22c55e);
          border-radius: 1px;
        }

        .phase-connector.upcoming {
          background: rgba(107, 114, 128, 0.4);
        }

        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 16px rgba(74, 222, 128, 0.8);
            transform: scale(1.05);
          }
        }

        .countdown-time {
          color: white;
          font-family: monospace;
          font-weight: 700;
        }

        .wallet-section {
          display: flex;
          align-items: center;
          flex: 0 0 auto;
          position: relative;
        }

        .wallet-section .connect-button {
          display: ${isMobile ? 'none' : 'block'};
        }

        /* 🎯 개선된 지갑 아바타 - 로고와 동일한 테두리 두께 */
        .wallet-avatar {
          width: ${isMobile ? '48px' : '36px'};
          height: ${isMobile ? '48px' : '36px'};
          border-radius: 50%;
          background: rgba(107, 114, 128, 0.1);
          border: 2px solid rgba(107, 114, 128, 0.3);
          display: ${isMobile ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .wallet-avatar:hover {
          background: rgba(107, 114, 128, 0.2);
          border-color: rgba(107, 114, 128, 0.5);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(107, 114, 128, 0.2);
        }

        .wallet-avatar:active {
          transform: scale(0.95);
        }

        /* 연결됨 상태 스타일 - 회색 유지, 이모티콘 제거 */
        .wallet-avatar.connected {
          background: rgba(107, 114, 128, 0.15);
          border: 2px solid rgba(107, 114, 128, 0.4);
          box-shadow: 0 0 8px rgba(107, 114, 128, 0.2);
        }

        .wallet-avatar.connected:hover {
          background: rgba(107, 114, 128, 0.25);
          border-color: rgba(107, 114, 128, 0.6);
          box-shadow: 0 0 12px rgba(107, 114, 128, 0.3);
        }

        /* 지갑 아이콘 */
        .wallet-icon {
          width: ${isMobile ? '24px' : '18px'};
          height: ${isMobile ? '24px' : '18px'};
          color: #6b7280;
          font-size: ${isMobile ? '20px' : '16px'};
          transition: all 0.2s;
        }

        .wallet-avatar.connected .wallet-icon {
          color: #6b7280;
          filter: none;
        }

        /* 연결 상태 인디케이터 - 회색 톤 */
        .connection-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #6b7280;
          border: 2px solid #0a0a0a;
          animation: connectionPulse 2s infinite;
        }

        @keyframes connectionPulse {
          0%, 100% { 
            box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.4);
          }
          50% { 
            box-shadow: 0 0 0 4px rgba(107, 114, 128, 0);
          }
        }
      `}</style>

      {/* 🏗️ 컴팩트 상단 고정바 구조 */}
      <div className="compact-topbar">
        {/* 1. 개선된 로고 섹션 (모바일만) */}
        <div className="logo-section">
          <div className="logo-circle" onClick={onMobileMenuToggle}>
            <div 
              className="logo-image"
              onError={(e) => {
                // 이미지 로딩 실패시 백업 표시
                const target = e.currentTarget as HTMLDivElement;
                const nextEl = target.nextElementSibling as HTMLDivElement;
                target.style.display = 'none';
                if (nextEl) nextEl.style.display = 'flex';
              }}
            />
            <div 
              className="logo-image-fallback" 
              style={{ 
                display: 'none', 
                alignItems: 'center', 
                justifyContent: 'center', 
                width: '100%', 
                height: '100%' 
              }}
            >
              🥩
            </div>
            <div className="menu-label">MENU</div>
          </div>
        </div>

        {/* 2. 페이즈 + 카운트다운 섹션 */}
        <div className="phase-section">
          {/* 페이즈 진행바 */}
          <div className="phase-progress">
            <span style={{ color: '#4ade80' }}>📊 Phase</span>
            <div className="phase-dots">
              {Array.from({ length: totalPhases }, (_, index) => {
                const phase = index + 1;
                const isActive = phase === currentPhase;
                const isCompleted = phase < currentPhase;
                const isUpcoming = phase > currentPhase;
                
                return (
                  <React.Fragment key={phase}>
                    <button
                      className={`phase-dot ${
                        isActive ? 'active' : 
                        isCompleted ? 'completed' : 'upcoming'
                      }`}
                      onClick={() => onPhaseClick?.(phase)}
                    >
                      {isCompleted ? '✓' : phase}
                    </button>
                    
                    {phase < totalPhases && (
                      <div className={`phase-connector ${
                        phase >= currentPhase ? 'upcoming' : ''
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          
          {/* 카운트다운 */}
          <div className="countdown">
            <span>⚠️ Phase 1 ends in</span>
            <span className="countdown-time">
              {phase1TimeLeft.total > 0 ? (
                `${phase1TimeLeft.days}d ${phase1TimeLeft.hours.toString().padStart(2, '0')}h ${phase1TimeLeft.minutes.toString().padStart(2, '0')}m ${phase1TimeLeft.seconds.toString().padStart(2, '0')}s`
              ) : '완료'}
            </span>
          </div>
        </div>

        {/* 3. 개선된 지갑 섹션 */}
        <div className="wallet-section">
          {/* PC용 연결 버튼 */}
          <div className="connect-button">
            <ConnectButton
              accountStatus="address"
              chainStatus="icon"
              showBalance={false}
              label="💰 Connect Wallet"
            />
          </div>
          
          {/* 모바일용 개선된 아바타 버튼 */}
          <div className="wallet-avatar">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                  <div
                    className={connected ? 'connected' : ''}
                    onClick={connected ? openAccountModal : openConnectModal}
                    style={{ 
                      cursor: 'pointer', 
                      width: '100%', 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      position: 'relative'
                    }}
                  >
                    <div className="wallet-icon">
                      👤
                    </div>
                    {connected && <div className="connection-indicator" />}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompactTopbar;