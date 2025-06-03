"use client";
import { useEffect, useState } from "react";
import { treemap, hierarchy } from "d3-hierarchy";
import axios from "axios";

// GitHub Pages JSON API URL
const SHEET_BEST_URL = '/leaderboard.json';

// 새로운 등급별 프리미엄 색상 시스템
const tierColors: Record<string, string> = {
  "Genesis OG": "linear-gradient(135deg, #ff0080 0%, #ff8c00 25%, #ffd700 50%, #00ff00 75%, #00bfff 100%)",
  "Smoke Flexer": "linear-gradient(135deg, #ff0080 0%, #ff4040 100%)",
  "Steak Wizard": "linear-gradient(135deg, #6b46c1 0%, #8b5cf6 100%)",
  "Grilluminati": "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)",
  "Flame Juggler": "linear-gradient(135deg, #ea580c 0%, #fb923c 100%)",
  "Flipstarter": "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
  "Sizzlin' Noob": "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
  "Jeeted": "linear-gradient(135deg, #dc2626 0%, #7f1d1d 100%)",
};

// 데이터 타입
interface LeaderboardItem {
  name: string;
  value: number;
  tier: string;
  change: string;
  score: number;
  time: string;
  rank: number;
  total_staked: number;
  grade: string;
  percentile: number;
  address: string;
  stake_count: number;
  holding_days: number;
}

// d3 트리맵 레이아웃
function useTreemapLayout(data: LeaderboardItem[], width: number, height: number) {
  if (!data || data.length === 0) return [];
  
  const root = hierarchy({ children: data } as any)
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value as number) - (a.value as number));
    
  treemap().size([width, height]).paddingInner(2).paddingOuter(3)(root);
  return root.leaves();
}

// 랭킹 배지
function getRankBadge(rank: number) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return `🔥`;
  return "⭐";
}

// 트렌드 아이콘 함수
function getTrendIcon(change: string) {
  const changeNum = parseFloat(change);
  if (changeNum > 5) return "🚀";
  if (changeNum > 2) return "📈";
  if (changeNum > 0) return "⬆️";
  if (changeNum === 0) return "➡️";
  if (changeNum > -2) return "⬇️";
  if (changeNum > -5) return "📉";
  return "💀";
}

// 등급별 아바타 함수
function getGradeAvatar(grade: string) {
  const avatars: Record<string, string> = {
    "Genesis OG": "🌌",
    "Smoke Flexer": "💨",
    "Steak Wizard": "🧙",
    "Grilluminati": "👁️",
    "Flame Juggler": "🔥",
    "Flipstarter": "🥩",
    "Sizzlin' Noob": "🆕",
    "Jeeted": "💀"
  };
  return avatars[grade] || "❓";
}

// 미니 차트 생성 함수
function generateMiniChart(item: LeaderboardItem): string {
  // 임시 데이터 생성 (실제로는 히스토리 데이터 사용)
  const points: number[] = [];
  const baseValue = item.value;
  
  // 30일 간의 모의 데이터 생성
  for (let i = 0; i < 30; i++) {
    const volatility = 0.1; // 변동성
    const trend = parseFloat(item.change) / 100; // 전체 트렌드
    const dailyChange = (Math.random() - 0.5) * volatility + trend / 30;
    const prevValue = i === 0 ? baseValue * 0.9 : points[i - 1];
    points.push(Math.max(0.1, prevValue * (1 + dailyChange)));
  }

  // SVG 패스 생성
  const width = 60;
  const height = 20;
  const minValue = Math.min(...points);
  const maxValue = Math.max(...points);
  const range = maxValue - minValue || 1;

  const pathData = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * width;
      const y = height - ((value - minValue) / range) * height;
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  // 트렌드에 따른 색상
  const isPositive = parseFloat(item.change) >= 0;
  const strokeColor = isPositive ? '#4ade80' : '#f87171';

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="gradient-${item.rank}" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:${strokeColor};stop-opacity:0.3" />
          <stop offset="100%" style="stop-color:${strokeColor};stop-opacity:0" />
        </linearGradient>
      </defs>
      <path d="${pathData} L ${width} ${height} L 0 ${height} Z" 
            fill="url(#gradient-${item.rank})" />
      <path d="${pathData}" 
            stroke="${strokeColor}" 
            stroke-width="1.5" 
            fill="none" 
            opacity="0.8" />
    </svg>
  `;
}

type BoxSize = "tiny" | "small" | "medium" | "large" | "xlarge";

function getBoxSize(width: number, height: number): BoxSize {
  const area = width * height;
  if (area < 3000) return "tiny";
  if (area < 8000) return "small"; 
  if (area < 15000) return "medium";
  if (area < 25000) return "large";
  return "xlarge";
}

// 개선된 트리맵 박스 컴포넌트
function TreemapBox({ 
  item, 
  x, 
  y, 
  width, 
  height, 
  onClick 
}: {
  item: LeaderboardItem;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
}) {
  const boxSize = getBoxSize(width, height);
  const [isHovered, setIsHovered] = useState(false);
  
  // 할당 토큰 계산
  const totalPhaseReward = 41670000;
  const allocatedStake = (item.value / 100) * totalPhaseReward;
  const dollarValue = allocatedStake * 0.52;

  // 크기별 컨텐츠 조정
  const layouts = {
    tiny: {
      showAddress: false,
      showReward: false,
      showChange: false,
      showChart: false,
      showAvatar: false,
      fontSize: 10,
      padding: "4px"
    },
    small: {
      showAddress: false,
      showReward: false,
      showChange: true,
      showChart: false,
      showAvatar: true,
      fontSize: 11,
      padding: "6px"
    },
    medium: {
      showAddress: true,
      showReward: false,
      showChange: true,
      showChart: true,
      showAvatar: true,
      fontSize: 12,
      padding: "8px"
    },
    large: {
      showAddress: true,
      showReward: true,
      showChange: true,
      showChart: true,
      showAvatar: true,
      fontSize: 13,
      padding: "10px"
    },
    xlarge: {
      showAddress: true,
      showReward: true,
      showChange: true,
      showChart: true,
      showAvatar: true,
      fontSize: 14,
      padding: "12px"
    }
  };

  const layout = layouts[boxSize];

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: Math.max(40, width - 2),
        height: Math.max(40, height - 2),
        background: tierColors[item.grade] || tierColors["Sizzlin' Noob"],
        borderRadius: 0, // 둥근 모서리 제거
        padding: layout.padding,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontSize: layout.fontSize,
        fontWeight: 600,
        color: "#fff",
        border: isHovered ? "2px solid #ffffff80" : "1px solid #ffffff20",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        transform: isHovered ? "scale(1.02)" : "scale(1)",
        zIndex: isHovered ? 10 : 1,
        boxShadow: isHovered 
          ? "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" 
          : "0 2px 8px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
        overflow: "hidden",
        backdropFilter: "blur(1px)"
      }}
    >
      {/* 상단: 순위 + 등급 + 아바타 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: boxSize === "tiny" ? 2 : 4
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: boxSize === "tiny" ? 2 : 4
        }}>
          {layout.showAvatar && (
            <div style={{
              fontSize: 16,
              background: "rgba(0,0,0,0.3)",
              borderRadius: "50%",
              width: 20,
              height: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              {getGradeAvatar(item.grade)}
            </div>
          )}
          <span style={{ 
            fontSize: boxSize === "tiny" ? 12 : 16,
            filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.8))"
          }}>
            {getRankBadge(item.rank)}
          </span>
          <span style={{
            fontSize: boxSize === "tiny" ? 8 : 10,
            fontWeight: 800,
            background: "rgba(0,0,0,0.3)",
            padding: "1px 4px",
            borderRadius: 4,
            textShadow: "0 1px 2px rgba(0,0,0,0.8)"
          }}>
            #{item.rank}
          </span>
        </div>
        
        {boxSize !== "tiny" && (
          <div style={{
            fontSize: 8,
            background: "rgba(0,0,0,0.4)",
            padding: "1px 4px",
            borderRadius: 4,
            textAlign: "right",
            textShadow: "0 1px 2px rgba(0,0,0,0.8)"
          }}>
            {item.grade.split(" ")[0]}
          </div>
        )}
      </div>

      {/* 미니 차트 (medium 이상) */}
      {layout.showChart && (
        <div style={{
          marginBottom: 4,
          opacity: 0.8,
          display: "flex",
          justifyContent: "center"
        }}>
          <div dangerouslySetInnerHTML={{ __html: generateMiniChart(item) }} />
        </div>
      )}

      {/* 지갑 주소 (medium 이상) */}
      {layout.showAddress && (
        <div style={{
          fontSize: layout.fontSize - 1,
          fontFamily: "monospace",
          opacity: 0.9,
          textShadow: "0 1px 2px rgba(0,0,0,0.8)",
          marginBottom: 2
        }}>
          {item.address.slice(0, 6)}...{item.address.slice(-4)}
        </div>
      )}

      {/* 메인 할당률 */}
      <div style={{
        fontSize: boxSize === "tiny" ? 14 : boxSize === "small" ? 16 : 20,
        fontWeight: 900,
        textAlign: "center",
        textShadow: "0 2px 4px rgba(0,0,0,0.8)",
        margin: "auto 0"
      }}>
        {item.value.toFixed(1)}%
      </div>

      {/* 하단 정보 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        fontSize: layout.fontSize - 1
      }}>
        {/* 변동률 (small 이상) */}
        {layout.showChange && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "rgba(0,0,0,0.3)",
            padding: "1px 3px",
            borderRadius: 4,
            textShadow: "0 1px 2px rgba(0,0,0,0.8)"
          }}>
            <span style={{ fontSize: 8 }}>{getTrendIcon(item.change)}</span>
            <span style={{ 
              fontSize: layout.fontSize - 2,
              fontWeight: 700,
              color: parseFloat(item.change) >= 0 ? "#4ade80" : "#f87171"
            }}>
              {parseFloat(item.change) >= 0 ? "+" : ""}{item.change}%
            </span>
          </div>
        )}

        {/* 예상 보상 (large 이상) */}
        {layout.showReward && (
          <div style={{
            textAlign: "right",
            background: "rgba(0,0,0,0.3)",
            padding: "2px 4px",
            borderRadius: 4,
            textShadow: "0 1px 2px rgba(0,0,0,0.8)"
          }}>
            <div style={{ 
              fontSize: layout.fontSize - 2,
              color: "#fbbf24",
              fontWeight: 700
            }}>
              {allocatedStake > 1000000 
                ? `${(allocatedStake / 1000000).toFixed(1)}M` 
                : `${(allocatedStake / 1000).toFixed(0)}K`} STAKE
            </div>
            <div style={{ 
              fontSize: layout.fontSize - 3,
              color: "#4ade80",
              fontWeight: 600
            }}>
              ${dollarValue > 1000000 
                ? `${(dollarValue / 1000000).toFixed(1)}M` 
                : `${(dollarValue / 1000).toFixed(0)}K`}
            </div>
          </div>
        )}
      </div>

      {/* 호버시 글로우 효과 */}
      {isHovered && (
        <div style={{
          position: "absolute",
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          background: `linear-gradient(45deg, ${tierColors[item.grade]})`,
          filter: "blur(4px)",
          opacity: 0.6,
          zIndex: -1,
          borderRadius: 0
        }} />
      )}
    </div>
  );
}

// 사이드바 아이템 컴포넌트
function SidebarItem({ 
  icon, 
  text, 
  isActive = false, 
  onClick, 
  disabled = false,
  collapsed = false 
}: {
  icon: string;
  text: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? 0 : 12,
        padding: collapsed ? "12px 8px" : "12px 16px",
        background: isActive 
          ? "rgba(74,222,128,0.1)" 
          : disabled 
            ? "rgba(255,255,255,0.02)" 
            : "rgba(255,255,255,0.03)",
        border: isActive 
          ? "1px solid rgba(74,222,128,0.3)" 
          : "1px solid rgba(255,255,255,0.05)",
        borderRadius: 12,
        color: disabled ? "#666" : isActive ? "#4ade80" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer",
        width: "100%",
        textAlign: "left",
        transition: "all 0.2s",
        fontSize: 16,
        fontWeight: isActive ? 700 : 600,
        justifyContent: collapsed ? "center" : "flex-start"
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isActive) {
          e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }
      }}
    >
      <span style={{ fontSize: 20, minWidth: 20 }}>{icon}</span>
      {!collapsed && (
        <>
          <span>{text}</span>
          {disabled && <span style={{ marginLeft: "auto", fontSize: 16 }}>🔒</span>}
        </>
      )}
    </button>
  );
}

// 사이드바 컴포넌트
function Sidebar({ 
  isOpen, 
  onClose, 
  wallet, 
  onConnectWallet, 
  onDisconnectWallet,
  currentPage,
  onPageChange,
  isMobile,
  isDesktop 
}: {
  isOpen: boolean;
  onClose: () => void;
  wallet: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobile: boolean;
  isDesktop: boolean;
}) {
  const sidebarWidth = isMobile ? "280px" : isDesktop ? "240px" : "280px";
  const isCollapsed = false;

  return (
    <>
      {isMobile && isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.6)",
            zIndex: 998,
            backdropFilter: "blur(4px)"
          }}
          onClick={onClose}
        />
      )}
      
      <div
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: sidebarWidth,
          height: "100vh",
          background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)",
          border: "1px solid rgba(255,255,255,0.1)",
          transform: (isMobile && !isOpen) ? "translateX(-100%)" : "translateX(0)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 999,
          padding: "20px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          boxShadow: "2px 0 20px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            <span style={{ fontSize: 24 }}>🥩</span>
            {!isCollapsed && (
              <h2 style={{ 
                color: "#fff", 
                margin: 0, 
                fontSize: 18, 
                fontWeight: 700,
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                STAKE
              </h2>
            )}
          </div>
          
          {isMobile && (
            <button 
              onClick={onClose} 
              style={{ 
                background: "none", 
                border: "none", 
                color: "#999", 
                fontSize: 24, 
                cursor: "pointer",
                padding: 4
              }}
            >×</button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SidebarItem
            icon="🏆"
            text="Leaderboard"
            isActive={currentPage === "leaderboard"}
            onClick={() => onPageChange("leaderboard")}
            collapsed={isCollapsed}
          />
          
          <SidebarItem
            icon="👤"
            text="My Dashboard"
            isActive={currentPage === "dashboard"}
            onClick={() => onPageChange("dashboard")}
            disabled={!wallet}
            collapsed={isCollapsed}
          />
          
          <SidebarItem
            icon="📊"
            text="Statistics"
            isActive={currentPage === "stats"}
            onClick={() => onPageChange("stats")}
            collapsed={isCollapsed}
          />
          
          <SidebarItem
            icon="🎯"
            text="Phase Info"
            isActive={currentPage === "phase"}
            onClick={() => onPageChange("phase")}
            collapsed={isCollapsed}
          />
          
          <SidebarItem
            icon="⚙️"
            text="Settings"
            isActive={currentPage === "settings"}
            onClick={() => onPageChange("settings")}
            collapsed={isCollapsed}
          />
          
          <SidebarItem
            icon="❓"
            text="Help & FAQ"
            isActive={currentPage === "help"}
            onClick={() => onPageChange("help")}
            collapsed={isCollapsed}
          />
        </div>

        {!isCollapsed && (
          <div style={{
            marginTop: 24,
            padding: 16,
            background: "rgba(255,255,255,0.03)",
            borderRadius: 12,
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{
              fontSize: 14,
              color: "#4ade80",
              fontWeight: 700,
              marginBottom: 8
            }}>
              Phase 1 Progress
            </div>
            <div style={{
              fontSize: 12,
              color: "#999",
              lineHeight: 1.4
            }}>
              <div>⏰ 13d 4h 22m remaining</div>
              <div>🎯 41.67M STAKE reward</div>
              <div style={{ marginTop: 8 }}>
                <div style={{
                  width: "100%",
                  height: 4,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                  overflow: "hidden"
                }}>
                  <div style={{
                    width: "67%",
                    height: "100%",
                    background: "linear-gradient(90deg, #4ade80, #22c55e)",
                    borderRadius: 2
                  }} />
                </div>
                <div style={{ fontSize: 11, color: "#4ade80", marginTop: 4 }}>
                  67% complete
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div style={{ 
          marginTop: "auto", 
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.1)"
        }}>
          {wallet ? (
            <div style={{
              background: "rgba(74,222,128,0.08)",
              padding: 12,
              borderRadius: 12,
              border: "1px solid rgba(74,222,128,0.2)"
            }}>
              {!isCollapsed && (
                <>
                  <div style={{ 
                    fontSize: 12, 
                    color: "#4ade80", 
                    fontWeight: 600,
                    marginBottom: 4
                  }}>
                    🟢 Connected
                  </div>
                  <div style={{ 
                    fontFamily: "monospace", 
                    fontSize: 13, 
                    color: "#fff",
                    marginBottom: 8
                  }}>
                    {wallet}
                  </div>
                  <button
                    onClick={onDisconnectWallet}
                    style={{
                      width: "100%",
                      padding: "6px 12px",
                      background: "rgba(239,68,68,0.1)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 6,
                      color: "#ef4444",
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer"
                    }}
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={onConnectWallet}
              style={{
                width: "100%",
                padding: isCollapsed ? "12px 8px" : "12px 16px",
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                border: "none",
                borderRadius: 12,
                color: "#000",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                boxShadow: "0 4px 12px rgba(74,222,128,0.2)"
              }}
            >
              {isCollapsed ? "💰" : "Connect Wallet"}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// 메인 레이아웃 컴포넌트
function Layout({ 
  children, 
  currentPage, 
  onPageChange,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  isMobile,
  isDesktop 
}: {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  wallet: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isMobile: boolean;
  isDesktop: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarWidth = isDesktop ? 240 : 0;

  return (
    <div style={{ 
      display: "flex", 
      minHeight: "100vh",
      background: "#0a0a0a"
    }}>
      <Sidebar
        isOpen={isDesktop || sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        wallet={wallet}
        onConnectWallet={onConnectWallet}
        onDisconnectWallet={onDisconnectWallet}
        currentPage={currentPage}
        onPageChange={onPageChange}
        isMobile={isMobile}
        isDesktop={isDesktop}
      />

      <main style={{
        flex: 1,
        marginLeft: isDesktop ? sidebarWidth : 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column"
      }}>
        {isMobile && (
          <header style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                fontSize: 24,
                cursor: "pointer",
                padding: 8
              }}
            >
              ☰
            </button>
            
            <h1 style={{
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
              color: "#fff"
            }}>
              🥩 STAKE Leaderboard
            </h1>
            
            <div style={{ width: 40 }} />
          </header>
        )}

        <div style={{ 
          flex: 1, 
          padding: isMobile ? "16px" : "20px 24px" 
        }}>
          {children}
        </div>
      </main>
    </div>
  );
}

// 리더보드 페이지
function LeaderboardPage({ data, modal, setModal, isMobile, isDesktop }: {
  data: LeaderboardItem[];
  modal: LeaderboardItem | null;
  setModal: (item: LeaderboardItem | null) => void;
  isMobile: boolean;
  isDesktop: boolean;
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const topData = sorted.slice(0, 20);
  const treemapWidth = isMobile ? 350 : isDesktop ? 800 : 600;
  const treemapHeight = isMobile ? 400 : isDesktop ? 500 : 450;
  const items = useTreemapLayout(topData, treemapWidth, treemapHeight);

  return (
    <div style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      gap: 24,
      height: "100%"
    }}>
      <section style={{
        flex: isMobile ? "none" : "1",
        minWidth: 0
      }}>
        <div style={{
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16,
          padding: 20,
          border: "1px solid rgba(255,255,255,0.1)",
          height: "fit-content"
        }}>
          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 20,
            textAlign: "center",
            color: "#fff",
            margin: "0 0 20px 0"
          }}>
            🔥 Top 20 Allocation Map
          </h2>

          <div style={{
            position: "relative",
            width: treemapWidth,
            height: treemapHeight,
            overflow: "hidden",
            borderRadius: 12,
            margin: "0 auto"
          }}>
            {items.map((d, i) => {
              const item = d.data as LeaderboardItem;
              const boxWidth = d.x1 - d.x0 - 2;
              const boxHeight = d.y1 - d.y0 - 2;
              
              return (
                <TreemapBox
                  key={i}
                  item={item}
                  x={d.x0}
                  y={d.y0}
                  width={boxWidth}
                  height={boxHeight}
                  onClick={() => setModal(item)}
                />
              );
            })}
          </div>
        </div>
      </section>

      {!isMobile && (
        <aside style={{
          width: 350,
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            padding: 20,
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <h3 style={{
              fontSize: 18,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 16,
              textAlign: "center",
              margin: "0 0 16px 0"
            }}>
              🏆 Top 10 Rankers
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {topData.slice(0, 10).map((item, index) => (
                <div
                  key={index}
                  onClick={() => setModal(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 12,
                    border: "1px solid rgba(255,255,255,0.1)",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      fontSize: 20,
                      minWidth: 24,
                      textAlign: "center"
                    }}>
                      {getRankBadge(item.rank)}
                    </div>
                    
                    <div>
                      <div style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                        fontFamily: "monospace"
                      }}>
                        {item.name}
                      </div>
                      <div style={{
                        fontSize: 12,
                        color: "#999",
                        marginTop: 2
                      }}>
                        {item.grade}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: "#4ade80"
                    }}>
                      {item.value.toFixed(2)}%
                    </div>
                    <div style={{
                      fontSize: 12,
                      color: +item.change > 0 ? "#2ecc71" : "#e74c3c",
                      marginTop: 2
                    }}>
                      {+item.change > 0 ? "+" : ""}{item.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.1)"
          }}>
            <div style={{
              fontSize: 16,
              fontWeight: 700,
              marginBottom: 12,
              textAlign: "center",
              color: "#fff"
            }}>
              📊 Phase 1 Stats
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999", fontSize: 14 }}>Total Participants:</span>
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{data.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999", fontSize: 14 }}>Phase Reward:</span>
                <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>41.67M STAKE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999", fontSize: 14 }}>Avg. Allocation:</span>
                <span style={{ fontWeight: 700, color: "#4ade80", fontSize: 14 }}>
                  {(100 / data.length).toFixed(3)}%
                </span>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

// 마이 대시보드 페이지
function MyDashboardPage({ data, wallet }: { data: LeaderboardItem[]; wallet: string | null }) {
  if (!wallet) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
        <h2 style={{ color: "#fff", marginBottom: 16, fontSize: 24 }}>Connect Your Wallet</h2>
        <p style={{ color: "#999", fontSize: 16, maxWidth: 400, lineHeight: 1.5 }}>
          Please connect your wallet to view your personal dashboard and staking statistics.
        </p>
      </div>
    );
  }

  const myData = data.find(item => item.address.toLowerCase() === wallet.toLowerCase());

  if (!myData) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "60vh",
        textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🔍</div>
        <h2 style={{ color: "#fff", marginBottom: 16, fontSize: 24 }}>Wallet Not Found</h2>
        <p style={{ color: "#999", fontSize: 16, maxWidth: 400, lineHeight: 1.5 }}>
          Your wallet address is not found in the current leaderboard. Please make sure you have staked TOKENS.
        </p>
      </div>
    );
  }

  const totalPhaseReward = 41670000;
  const allocatedStake = (myData.value / 100) * totalPhaseReward;
  const virtualRate = 0.32;
  const allocatedVirtual = allocatedStake * virtualRate;
  const stakePrice = 0.52;
  const dollarValue = allocatedStake * stakePrice;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 1000,
      margin: "0 auto"
    }}>
      <div style={{
        background: tierColors[myData.grade] || tierColors["Sizzlin' Noob"],
        borderRadius: 20,
        padding: 24,
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{
          fontSize: 48,
          marginBottom: 8
        }}>
          {getRankBadge(myData.rank)}
        </div>
        
        <h1 style={{
          fontSize: 28,
          fontWeight: 900,
          color: "#1a1a1a",
          margin: "0 0 8px 0",
          textShadow: "0 2px 4px rgba(255,255,255,0.3)"
        }}>
          {myData.grade}
        </h1>
        
        <div style={{
          fontSize: 18,
          fontWeight: 700,
          color: "rgba(26,26,26,0.8)",
          marginBottom: 16
        }}>
          Rank #{myData.rank} • Top {myData.percentile.toFixed(1)}%
        </div>

        <div style={{
          fontSize: 36,
          fontWeight: 900,
          color: "#1a1a1a",
          textShadow: "0 2px 8px rgba(255,255,255,0.4)"
        }}>
          {myData.value.toFixed(2)}%
        </div>
        
        <div style={{
          fontSize: 14,
          color: "rgba(26,26,26,0.7)",
          marginTop: 4
        }}>
          Phase 1 Allocation
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 16
      }}>
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 20
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#4ade80",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            🎯 Expected Rewards
          </div>
          
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8
          }}>
            {allocatedStake.toLocaleString(undefined, { 
              minimumFractionDigits: 0, 
              maximumFractionDigits: 0 
            })} STAKE
          </div>
          
          <div style={{
            fontSize: 14,
            color: "#22d3ee",
            marginBottom: 4
          }}>
            ≈ {allocatedVirtual.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })} VIRTUAL
          </div>
          
          <div style={{
            fontSize: 16,
            color: "#4ade80",
            fontWeight: 700
          }}>
            ≈ ${dollarValue.toLocaleString(undefined, { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            💰 Current Stake
          </div>
          
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8
          }}>
            {myData.total_staked.toLocaleString()} STAKE
          </div>
          
          <div style={{
            fontSize: 14,
            color: "#999"
          }}>
            {myData.stake_count} transactions
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            ⏰ Holding Period
          </div>
          
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8
          }}>
            {Math.floor(myData.holding_days)}d {Math.floor((myData.holding_days % 1) * 24)}h
          </div>
          
          <div style={{
            fontSize: 14,
            color: "#999"
          }}>
            Time Score: {myData.score.toLocaleString()}
          </div>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 20
        }}>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            📈 Recent Change
          </div>
          
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: +myData.change > 0 ? "#2ecc71" : "#e74c3c",
            marginBottom: 8
          }}>
            {+myData.change > 0 ? "+" : ""}{myData.change}%
          </div>
          
          <div style={{
            fontSize: 14,
            color: "#999"
          }}>
            Since last update
          </div>
        </div>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 20,
          textAlign: "center",
          margin: "0 0 20px 0"
        }}>
          🏆 Grade Progress
        </h3>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16
        }}>
          <div style={{
            fontSize: 14,
            color: "#999"
          }}>
            Current Grade
          </div>
          <div style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#4ade80"
          }}>
            {myData.grade}
          </div>
        </div>

        <div style={{
          width: "100%",
          height: 8,
          background: "rgba(255,255,255,0.1)",
          borderRadius: 4,
          overflow: "hidden",
          marginBottom: 12
        }}>
          <div style={{
            width: `${100 - myData.percentile}%`,
            height: "100%",
            background: "linear-gradient(90deg, #4ade80, #22c55e)",
            borderRadius: 4
          }} />
        </div>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#999"
        }}>
          <span>Top 100%</span>
          <span>Top {myData.percentile.toFixed(1)}%</span>
          <span>Top 1%</span>
        </div>
      </div>
    </div>
  );
}

// 통계 페이지
function StatsPage({ data }: { data: LeaderboardItem[] }) {
  const totalStaked = data.reduce((sum, item) => sum + item.total_staked, 0);
  const activeWallets = data.filter(item => item.total_staked > 0).length;
  const avgStake = totalStaked / activeWallets;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: 24,
      maxWidth: 1200,
      margin: "0 auto"
    }}>
      <h1 style={{
        fontSize: 28,
        fontWeight: 700,
        color: "#fff",
        textAlign: "center",
        margin: 0
      }}>
        📊 Platform Statistics
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: 20
      }}>
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#4ade80",
            marginBottom: 8
          }}>
            {activeWallets.toLocaleString()}
          </div>
          <div style={{
            fontSize: 16,
            color: "#fff",
            fontWeight: 600
          }}>
            Active Stakers
          </div>
        </div>

        <div style={{
          background: "rgba(255,107,107,0.08)",
          border: "1px solid rgba(255,107,107,0.2)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#ff6b6b",
            marginBottom: 8
          }}>
            {(totalStaked / 1000000).toFixed(1)}M
          </div>
          <div style={{
            fontSize: 16,
            color: "#fff",
            fontWeight: 600
          }}>
            Total Staked
          </div>
        </div>

        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#8b5cf6",
            marginBottom: 8
          }}>
            {(avgStake / 1000).toFixed(0)}K
          </div>
          <div style={{
            fontSize: 16,
            color: "#fff",
            fontWeight: 600
          }}>
            Avg. Stake
          </div>
        </div>

        <div style={{
          background: "rgba(255,215,0,0.08)",
          border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: 16,
          padding: 24,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 36,
            fontWeight: 900,
            color: "#ffd700",
            marginBottom: 8
          }}>
            41.67M
          </div>
          <div style={{
            fontSize: 16,
            color: "#fff",
            fontWeight: 600
          }}>
            Phase Reward
          </div>
        </div>
      </div>

      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: 40,
        textAlign: "center"
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📈</div>
        <h2 style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 12
        }}>
          Advanced Analytics Coming Soon
        </h2>
        <p style={{
          fontSize: 16,
          color: "#999",
          maxWidth: 500,
          margin: "0 auto",
          lineHeight: 1.5
        }}>
          We're working on detailed charts, historical data, and trend analysis. 
          Stay tuned for more insights!
        </p>
      </div>
    </div>
  );
}

// 모달 컴포넌트
function SimpleModal({ modal, onClose }: { modal: LeaderboardItem; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const totalPhaseReward = 41670000;
  const allocatedStake = (modal.value / 100) * totalPhaseReward;
  const virtualRate = 0.32;
  const allocatedVirtual = allocatedStake * virtualRate;
  const stakePrice = 0.52;
  const dollarValue = allocatedStake * stakePrice;

  return (
    <>
      <style jsx>{`
        @keyframes modalAppear {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
      <div
        style={{
          position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex",
          alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
        }}
        onClick={onClose}
      >
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: "linear-gradient(135deg, #1a1d29 0%, #252833 50%, #1e2028 100%)",
            borderRadius: 24, width: 380, maxWidth: "95vw",
            padding: 0, color: "#fff", fontSize: 16,
            boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
            border: "2px solid rgba(255,255,255,0.05)",
            overflow: "hidden",
            position: "relative",
            transform: "scale(1)",
            animation: "modalAppear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)"
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 20, fontSize: 28,
              color: "#666", background: "none", border: "none", cursor: "pointer",
              zIndex: 10, transition: "all 0.2s", borderRadius: "50%", 
              width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center"
            }}
          >×</button>
          
          <div style={{
            background: tierColors[modal.grade] || tierColors["Sizzlin' Noob"],
            padding: "32px 32px 24px", textAlign: "center",
            borderRadius: "24px 24px 0 0", position: "relative"
          }}>
            <div style={{ 
              fontSize: 48, marginBottom: 12
            }}>
              {getRankBadge(modal.rank)}
            </div>
            
            <div style={{ 
              fontSize: 20, fontWeight: 800, color: "#1a1a1a", 
              textShadow: "0 2px 4px rgba(255,255,255,0.3)",
              letterSpacing: "1px", marginBottom: 4
            }}>
              {modal.grade}
            </div>
            
            <div style={{
              display: "inline-block", background: "rgba(0,0,0,0.2)",
              borderRadius: 12, padding: "4px 12px", fontSize: 14,
              fontWeight: 700, color: "#fff"
            }}>
              Rank #{modal.rank}
            </div>
          </div>

          <div style={{ padding: "28px 32px 32px" }}>
            <div style={{ 
              textAlign: "center", marginBottom: 20,
              fontSize: 15, fontFamily: "monospace", 
              color: "#a0a0a0", fontWeight: 600,
              background: "rgba(255,255,255,0.05)", 
              padding: "8px 16px", borderRadius: 8
            }}>
              {modal.address.slice(0, 10)}...{modal.address.slice(-8)}
            </div>
            
            <div style={{ 
              textAlign: "center", marginBottom: 24,
              background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(238,90,36,0.1))",
              borderRadius: 16, padding: "20px"
            }}>
              <div style={{ 
                fontSize: 42, fontWeight: 900, 
                background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: 8, lineHeight: 1
              }}>
                {modal.value.toFixed(2)}%
              </div>
              <div style={{ 
                fontSize: 14, color: "#888", fontWeight: 600
              }}>
                Phase 1 Allocation
              </div>
              
              <div style={{ 
                marginTop: 12, fontSize: 16, fontWeight: 700,
                color: +modal.change > 0 ? "#2ecc71" : "#e74c3c"
              }}>
                {+modal.change > 0 ? "📈 +" : "📉 "}{modal.change}%
              </div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, rgba(76,222,128,0.08), rgba(34,197,94,0.08))",
              borderRadius: 16, padding: "20px", marginBottom: 20,
              border: "1px solid rgba(76,222,128,0.2)"
            }}>
              <div style={{
                fontSize: 16, fontWeight: 700, color: "#4ade80",
                marginBottom: 16, textAlign: "center"
              }}>
                🎯 Expected Rewards
              </div>
              
              <div style={{ marginBottom: 12 }}>
                <div style={{ 
                  fontSize: 24, fontWeight: 900, color: "#fff",
                  textAlign: "center"
                }}>
                  {allocatedStake.toLocaleString(undefined, { 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                  })} STAKE
                </div>
              </div>
              
              <div style={{ marginBottom: 8, textAlign: "center" }}>
                <span style={{ 
                  fontSize: 16, color: "#22d3ee", fontWeight: 700
                }}>
                  ≈ {allocatedVirtual.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} VIRTUAL
                </span>
              </div>
              
              <div style={{ textAlign: "center" }}>
                <span style={{ 
                  fontSize: 18, color: "#4ade80", fontWeight: 800
                }}>
                  ≈ ${dollarValue.toLocaleString(undefined, { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </span>
              </div>
            </div>

            <div style={{ 
              display: "flex", flexDirection: "column", gap: 10,
              fontSize: 14, lineHeight: 1.4,
              background: "rgba(255,255,255,0.02)",
              borderRadius: 12, padding: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Current Stake:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  {modal.total_staked.toLocaleString()} STAKE
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Holding Period:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{modal.time}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Time Score:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  {modal.score.toLocaleString()}
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Percentile:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  Top {modal.percentile.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function Home() {
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<LeaderboardItem | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [currentPage, setCurrentPage] = useState("leaderboard");

  const isDesktop = windowSize.width >= 1024;
  const isMobile = windowSize.width < 768;

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(SHEET_BEST_URL, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.data) {
        throw new Error('응답 데이터가 없습니다');
      }
      
      let rawData;
      if (response.data.leaderboard) {
        rawData = response.data.leaderboard;
      } else if (Array.isArray(response.data)) {
        rawData = response.data;
      } else {
        throw new Error('알 수 없는 데이터 형식');
      }
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('유효하지 않은 데이터 배열');
      }
      
      const transformedData: LeaderboardItem[] = rawData
        .filter((item: any) => item.is_active !== false && Number(item.total_staked) > 0)
        .slice(0, 100)
        .map((item: any, index: number) => ({
          name: item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : `Unknown${index}`,
          value: Number(item.airdrop_share_phase) || Math.random() * 2 + 1,
          tier: item.grade || "Sizzlin' Noob",
          change: (Math.random() * 1.5 - 0.5).toFixed(2),
          score: Number(item.time_score) || 0,
          time: Math.round(Number(item.holding_days) || 0) + "d",
          rank: Number(item.rank) || index + 1,
          total_staked: Number(item.total_staked) || 0,
          grade: item.grade || "Sizzlin' Noob",
          percentile: Number(item.percentile) || 100,
          address: item.address || "",
          stake_count: Number(item.stake_count) || 0,
          holding_days: Number(item.holding_days) || 0
        }));
      
      const totalValue = transformedData.reduce((sum, item) => sum + item.value, 0);
      if (totalValue > 0) {
        transformedData.forEach(item => {
          item.value = (item.value / totalValue) * 100;
        });
      }
      
      setData(transformedData);
      setLastUpdate(new Date());
      
    } catch (err: any) {
      setError(err.message);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = () => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);
    setWallet(mockAddress);
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowSize({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🥩</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>STAKE Leaderboard</div>
          <div style={{ fontSize: 16, color: '#999' }}>Loading live data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>No Data Available</div>
          <div style={{ fontSize: 16, color: '#999', marginBottom: 20 }}>
            {error || 'Please check leaderboard.json'}
          </div>
          <button 
            onClick={fetchLeaderboardData}
            style={{
              padding: "12px 24px", background: "#4ade80", color: "#000",
              border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 700
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <MyDashboardPage data={data} wallet={wallet} />;
      case "stats":
        return <StatsPage data={data} />;
      case "leaderboard":
      default:
        return (
          <LeaderboardPage 
            data={data} 
            modal={modal} 
            setModal={setModal}
            isMobile={isMobile}
            isDesktop={isDesktop}
          />
        );
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      wallet={wallet}
      onConnectWallet={connectWallet}
      onDisconnectWallet={disconnectWallet}
      isMobile={isMobile}
      isDesktop={isDesktop}
    >
      {renderCurrentPage()}
      
      {modal && (
        <SimpleModal
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
    </Layout>
  );
}