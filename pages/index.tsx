"use client";
import { useEffect, useState } from "react";
import { treemap, hierarchy } from "d3-hierarchy";
import axios from "axios";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import Image from 'next/image';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from 'recharts';

// JSON API URL (구글시트 or GitHub JSON)
const SHEET_BEST_URL = '/leaderboard.json';

// --- 유틸리티 및 타입 ---
const tierColors: Record<string, string> = {
  "Genesis OG": "#4ade80",
  "Heavy Eater": "#22d3ee", 
  "Steak Wizard": "#818cf8",
  "Grilluminati": "#f472b6",
  "Flame Juggler": "#fb923c",
  "Flipstarter": "#64748b",
  "Sizzlin' Noob": "#475569",
  "Jeeted": "#ef4444",
};

// 숫자 포맷팅 함수들
function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toLocaleString();
}

function formatNumberChange(baseNum: number, changePercent: number): { value: string; isPositive: boolean } {
  const changeAmount = (baseNum * changePercent) / 100;
  const isPositive = changeAmount >= 0;
  const formattedChange = formatLargeNumber(Math.abs(changeAmount));
  return {
    value: (isPositive ? '+' : '-') + formattedChange,
    isPositive
  };
}

// 등급 이미지 매핑 함수 (최적화 버전)
function getGradeImagePath(grade: string): string {
  const gradeImages: Record<string, string> = {
    "Genesis OG": "/images/grades/genesis-og.png",
    "Smoke Flexer": "/images/grades/smoke-flexer.png", 
    "Steak Wizard": "/images/grades/steak-wizard.png",
    "Grilluminati": "/images/grades/grilluminati.png",
    "Flame Juggler": "/images/grades/flame-juggler.png",
    "Flipstarter": "/images/grades/flipstarter.png",
    "Sizzlin' Noob": "/images/grades/sizzlin-noob.png",
    "Jeeted": "/images/grades/jeeted.png"
  };
  return gradeImages[grade] || "/images/grades/default.png";
}

// Next.js Image 최적화 아바타 컴포넌트
function OptimizedGradeAvatar({ 
  grade, 
  isMobile
}: { 
  grade: string; 
  isMobile: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const size = isMobile ? 36 : 42;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 8,
      background: `linear-gradient(135deg, ${tierColors[grade] || "#475569"}, ${tierColors[grade] || "#475569"}88)`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "2px solid rgba(255,255,255,0.1)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* 배경 패턴 효과 */}
      <div style={{
        position: "absolute",
        top: -10,
        right: -10,
        width: 20,
        height: 20,
        background: "rgba(255,255,255,0.1)",
        borderRadius: "50%",
        opacity: 0.6
      }} />
      <div style={{
        position: "absolute",
        bottom: -5,
        left: -5,
        width: 15,
        height: 15,
        background: "rgba(255,255,255,0.05)",
        borderRadius: "50%"
      }} />
      
      {/* Next.js 최적화 이미지 */}
      {!imageError && typeof window !== 'undefined' && (
        <img
          src={getGradeImagePath(grade)}
          alt={grade}
          width={size}
          height={size}
          style={{
            borderRadius: 6,
            objectFit: "cover",
            width: "100%",
            height: "100%"
          }}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      )}
      
      {/* 백업 아바타 (이미지 실패 시 또는 SSR) */}
      {(imageError || typeof window === 'undefined') && (
        <span style={{ 
          fontSize: isMobile ? 18 : 22,
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
          zIndex: 1
        }}>
          {getGradeAvatar(grade)}
        </span>
      )}
    </div>
  );
}

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

// d3 treemap 레이아웃
function useTreemapLayout(data: LeaderboardItem[], width: number, height: number) {
  if (!data || data.length === 0) return [];
  const root = hierarchy({ children: data } as any)
    .sum((d: any) => d.value)
    .sort((a, b) => (b.value as number) - (a.value as number));
  treemap().size([width, height]).paddingInner(2).paddingOuter(3)(root);
  return root.leaves();
}

// --- 유틸 함수 ---
function getRankBadge(rank: number) {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 10) return `🔥`;
  return "⭐";
}
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

// --- 메인 Treemap 박스 ---
function TreemapBox({ item, x, y, width, height, onClick }: {
  item: LeaderboardItem;
  x: number; y: number; width: number; height: number; onClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const area = width * height;
  const isLarge = area > 15000, isMedium = area > 8000, isSmall = area > 3000;
  const rankSize = isLarge ? 14 : isMedium ? 12 : isSmall ? 10 : 9;
  const percentSize = isLarge ? 28 : isMedium ? 22 : isSmall ? 18 : 14;
  const chartHeight = isLarge ? 40 : isMedium ? 30 : 20;
  const bgColors: Record<number, string> = {
    1: "#4ade80", 2: "#22d3ee", 3: "#818cf8", 4: "#f472b6", 5: "#fb923c",
  };
  const getBackgroundColor = (rank: number) => (rank <= 5 ? bgColors[rank] : rank <= 10 ? "#64748b" : "#475569");
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "absolute", left: x, top: y, width: width - 2, height: height - 2,
        background: getBackgroundColor(item.rank), cursor: "pointer", display: "flex", flexDirection: "column",
        color: "#fff", transition: "all 0.2s", transform: isHovered ? "scale(0.98)" : "scale(1)",
        opacity: isHovered ? 0.9 : 1, overflow: "hidden", padding: isSmall ? "8px" : "4px"
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
        {(isMedium || isLarge) && <div style={{ fontSize: rankSize, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>#{item.rank}</div>}
        <div style={{ fontSize: percentSize, fontWeight: 800, lineHeight: 1, marginBottom: 4 }}>{item.value.toFixed(1)}%</div>
        {isMedium && (
          <div style={{ fontSize: rankSize - 2, opacity: 0.7, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "90%" }}>
            {item.name}
          </div>
        )}
      </div>
    </div>
  );
}

// --- 사이드바 및 아이템 ---
function SidebarItem({ icon, text, isActive = false, onClick, disabled = false, collapsed = false }:{
  icon: string; text: string; isActive?: boolean; onClick?: () => void; disabled?: boolean; collapsed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex", alignItems: "center", gap: collapsed ? 0 : 12,
        padding: collapsed ? "12px 8px" : "12px 16px",
        background: isActive ? "rgba(74,222,128,0.1)" : disabled ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.03)",
        border: isActive ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(255,255,255,0.05)",
        borderRadius: 12, color: disabled ? "#666" : isActive ? "#4ade80" : "#fff",
        cursor: disabled ? "not-allowed" : "pointer", width: "100%", textAlign: "left", transition: "all 0.2s",
        fontSize: 16, fontWeight: isActive ? 700 : 600, justifyContent: collapsed ? "center" : "flex-start"
      }}
    >
      <span style={{ fontSize: 20, minWidth: 20 }}>{icon}</span>
      {!collapsed && (<><span>{text}</span>{disabled && <span style={{ marginLeft: "auto", fontSize: 16 }}>🔒</span>}</>)}
    </button>
  );
}

function Sidebar({ isOpen, onClose, wallet, currentPage, onPageChange, isMobile, isDesktop }:{
  isOpen: boolean; onClose: () => void; wallet: string; currentPage: string; onPageChange: (page: string) => void; isMobile: boolean; isDesktop: boolean;
}) {
  const sidebarWidth = isMobile ? "280px" : isDesktop ? "240px" : "280px";
  const isCollapsed = false;
  return (
    <>
      {isMobile && isOpen && <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.6)", zIndex: 998, backdropFilter: "blur(4px)" }} onClick={onClose} />}
      <div style={{
        position: "fixed", top: 0, left: 0, width: sidebarWidth, height: "100vh",
        background: "linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        transform: (isMobile && !isOpen) ? "translateX(-100%)" : "translateX(0)",
        transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", zIndex: 999,
        padding: "20px 16px", display: "flex", flexDirection: "column", gap: 8, boxShadow: "2px 0 20px rgba(0,0,0,0.3)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, paddingBottom: 16, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🥩</span>
            {!isCollapsed && (
              <h2 style={{
                color: "#fff", margin: 0, fontSize: 18, fontWeight: 700,
                background: "linear-gradient(135deg, #4ade80, #22c55e)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
              }}>STAKE</h2>
            )}
          </div>
          {isMobile && (
            <button onClick={onClose} style={{ background: "none", border: "none", color: "#999", fontSize: 24, cursor: "pointer", padding: 4 }}>×</button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <SidebarItem icon="🏆" text="Leaderboard" isActive={currentPage === "leaderboard"} onClick={() => onPageChange("leaderboard")} collapsed={isCollapsed} />
          <SidebarItem icon="👤" text="My Dashboard" isActive={currentPage === "dashboard"} onClick={() => onPageChange("dashboard")} disabled={!wallet} collapsed={isCollapsed} />
          <SidebarItem icon="📊" text="Statistics" isActive={currentPage === "stats"} onClick={() => onPageChange("stats")} collapsed={isCollapsed} />
        </div>
        <div style={{ marginTop: "auto", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <ConnectButton
            accountStatus="address"
            chainStatus="icon"
            showBalance={false}
            label={isCollapsed ? "💰" : "Connect Wallet"}
          />
        </div>
      </div>
    </>
  );
}

// --- Layout 컴포넌트 ---
function Layout({
  children, currentPage, onPageChange, wallet, isMobile, isDesktop
}:{
  children: React.ReactNode; currentPage: string; onPageChange: (page: string) => void; wallet: string; isMobile: boolean; isDesktop: boolean;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarWidth = isDesktop ? 240 : 0;
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0a0a" }}>
      <Sidebar isOpen={isDesktop || sidebarOpen} onClose={() => setSidebarOpen(false)} wallet={wallet} currentPage={currentPage} onPageChange={onPageChange} isMobile={isMobile} isDesktop={isDesktop} />
      <main style={{ flex: 1, marginLeft: isDesktop ? sidebarWidth : 0, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {isMobile && (
          <header style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}>
            <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "#fff", fontSize: 24, cursor: "pointer", padding: 8 }}>☰</button>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, color: "#fff" }}>🥩 STAKE Leaderboard</h1>
            <div style={{ width: 40 }} />
          </header>
        )}
        <div style={{ flex: 1, padding: isMobile ? "16px" : "20px 24px" }}>
          {children}
        </div>
      </main>
    </div>
  );
}


// Top Rankings 리스트 컴포넌트 (10/25/50/전체)
function Top10Leaderboard({ data, isMobile }: { data: LeaderboardItem[]; isMobile: boolean }) {
  const [currentTab, setCurrentTab] = useState<'10' | '25' | '50' | 'all'>('10');
  
  const getDisplayCount = (tab: string) => {
    switch(tab) {
      case '10': return 10;
      case '25': return 25;
      case '50': return 50;
      case 'all': return data.length;
      default: return 10;
    }
  };

  const displayCount = getDisplayCount(currentTab);
  
  // 활성 사용자만 스테이킹 수량으로 정렬하여 새로운 순위 부여
  const sortedData = [...data]
    .filter(item => item.grade !== "Jeeted" && item.total_staked > 0) // Jeet 제외
    .sort((a, b) => b.total_staked - a.total_staked); // 스테이킹 수량으로 정렬
  
  const displayData = sortedData.slice(0, displayCount);

  const totalAllocation = displayData.reduce((sum, item) => sum + item.value, 0);
  const totalStaked = displayData.reduce((sum, item) => sum + item.total_staked, 0);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: 20,
      border: "1px solid rgba(255,255,255,0.1)",
      height: "fit-content"
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        paddingBottom: 16,
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <h2 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#fff",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          🏆 Top {currentTab === 'all' ? 'All' : currentTab} Rankings
        </h2>
        <div style={{
          fontSize: 12,
          color: "#666",
          background: "rgba(255,255,255,0.05)",
          padding: "4px 8px",
          borderRadius: 6
        }}>
          Live
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: "flex",
        background: "rgba(255,255,255,0.05)",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        gap: 2
      }}>
        {[
          { key: '10', label: 'Top 10' },
          { key: '25', label: 'Top 25' },
          { key: '50', label: 'Top 50' },
          { key: 'all', label: 'All' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setCurrentTab(tab.key as any)}
            style={{
              flex: 1,
              padding: isMobile ? "8px 12px" : "10px 16px",
              background: currentTab === tab.key 
                ? "rgba(74,222,128,0.15)" 
                : "transparent",
              border: currentTab === tab.key 
                ? "1px solid rgba(74,222,128,0.3)" 
                : "1px solid transparent",
              borderRadius: 8,
              color: currentTab === tab.key ? "#4ade80" : "#999",
              fontSize: isMobile ? 12 : 14,
              fontWeight: currentTab === tab.key ? 700 : 600,
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              if (currentTab !== tab.key) {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.color = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (currentTab !== tab.key) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#999";
              }
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 요약 통계 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", // 3개 컬럼으로 변경
        gap: 12,
        marginBottom: 20
      }}>
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 12,
          padding: 16,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#4ade80",
            marginBottom: 4
          }}>
            {formatLargeNumber(totalAllocation * 1000000)} {/* 실제 토큰 수량으로 변환 */}
          </div>
          <div style={{
            fontSize: 12,
            color: "#999",
            fontWeight: 600
          }}>
            Top {currentTab === 'all' ? 'All' : currentTab} 할당량
          </div>
          <div style={{
            fontSize: 10,
            color: "#4ade80",
            marginTop: 2
          }}>
            +2.1%
          </div>
        </div>
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 12,
          padding: 16,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 24,
            fontWeight: 900,
            color: "#8b5cf6",
            marginBottom: 4
          }}>
            {formatLargeNumber(totalStaked)}
          </div>
          <div style={{
            fontSize: 12,
            color: "#999",
            fontWeight: 600
          }}>
            Top {currentTab === 'all' ? 'All' : currentTab} 스테이킹
          </div>
          <div style={{
            fontSize: 10,
            color: "#8b5cf6",
            marginTop: 2
          }}>
            +5.7%
          </div>
        </div>
        {/* Jeet 통계 카드 - 위아래 분할 */}
        <div style={{
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: 16,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          height: "100%" // 다른 카드와 높이 맞춤
        }}>
          {/* 상단: 활성 스테이킹 지갑 수 */}
          <div style={{ flex: 1, borderBottom: "1px solid rgba(239,68,68,0.2)", paddingBottom: 8, marginBottom: 8 }}>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#4ade80", // 긍정적인 녹색
              marginBottom: 2
            }}>
              {displayData.length}
            </div>
            <div style={{
              fontSize: 10,
              color: "#999",
              fontWeight: 600
            }}>
              Active Wallets
            </div>
          </div>
          
          {/* 하단: Jeet 지갑 수 */}
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: 20,
              fontWeight: 800,
              color: "#ef4444",
              marginBottom: 2
            }}>
              {(() => {
                // 탭별 Jeet 계산 (예시 - 실제 데이터 구조에 맞게 조정 필요)
                const totalInRange = (() => {
                  switch(currentTab) {
                    case '10': return 15; // 실제로는 상위 15개 중 10개만 활성
                    case '25': return 35; // 실제로는 상위 35개 중 25개만 활성  
                    case '50': return 68; // 실제로는 상위 68개 중 50개만 활성
                    case 'all': return 1247; // 전체 사용자 수
                    default: return 15;
                  }
                })();
                const jeetInRange = totalInRange - displayData.length;
                return jeetInRange.toLocaleString();
              })()}
            </div>
            <div style={{
              fontSize: 10,
              color: "#999",
              fontWeight: 600,
              marginBottom: 2
            }}>
              Jeet Users
            </div>
            <div style={{
              fontSize: 9,
              color: "#ef4444"
            }}>
              +{Math.floor(Math.random() * 5 + 1)} today
            </div>
          </div>
        </div>
      </div>

      {/* 헤더 바 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: isMobile ? "8px 12px" : "10px 16px",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 8,
        marginBottom: 12
      }}>
        {/* Rank 헤더 */}
        <div style={{
          minWidth: isMobile ? 35 : 50, // 더 줄임 (40→35, 55→50)
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Rank
        </div>

        {/* Address & Grade 헤더 */}
        <div style={{
          flex: 1,
          minWidth: isMobile ? 120 : 170, // 더 확대 (110→120, 150→170)
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          paddingLeft: 0
        }}>
          {isMobile ? "Address" : "Address & Grade"}
        </div>

        {/* Allocation 헤더 */}
        <div style={{
          textAlign: "right",
          minWidth: isMobile ? 55 : 65, // 더 줄임 (60→55, 70→65)
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          {isMobile ? "Alloc" : "Allocation"}
        </div>

        {/* Staked 헤더 */}
        <div style={{
          textAlign: "right",
          minWidth: isMobile ? 55 : 65, // 더 줄임 (60→55, 70→65)
          fontSize: 11,
          fontWeight: 700,
          color: "#999",
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          Staked
        </div>
      </div>

      {/* 순위 리스트 - 스크롤 가능한 컨테이너 */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: 8,
        maxHeight: currentTab === 'all' ? '400px' : currentTab === '50' ? '350px' : 'none',
        overflowY: currentTab === 'all' || currentTab === '50' ? 'auto' : 'visible',
        paddingRight: currentTab === 'all' || currentTab === '50' ? '8px' : '0'
      }}>
        {displayData.map((item, index) => {
          // 실제 순위 변동 계산 (더 현실적인 값들)
          const rankChange = Math.floor(Math.random() * 3) - 1; // -1 to +1
          const allocationChangePercent = (Math.random() * 20 - 10); // -10% to +10%
          const stakingChangePercent = (Math.random() * 30 - 15); // -15% to +15%
          
          // 실제 할당량과 스테이킹 수량 계산
          const totalTokens = 100000000; // 1억 토큰 가정
          const actualAllocation = (item.value / 100) * totalTokens;
          const actualStaking = item.total_staked;
          
          // 변동량 계산
          const allocationChange = formatNumberChange(actualAllocation, allocationChangePercent);
          const stakingChange = formatNumberChange(actualStaking, stakingChangePercent);
          
          return (
            <div
              key={item.address}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: isMobile ? "10px 12px" : "12px 16px",
                background: index < 3 
                  ? "rgba(255,215,0,0.05)" 
                  : "rgba(255,255,255,0.02)",
                border: index < 3 
                  ? "1px solid rgba(255,215,0,0.2)" 
                  : "1px solid rgba(255,255,255,0.05)",
                borderRadius: 12,
                transition: "all 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = index < 3 
                  ? "rgba(255,215,0,0.08)" 
                  : "rgba(255,255,255,0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = index < 3 
                  ? "rgba(255,215,0,0.05)" 
                  : "rgba(255,255,255,0.02)";
              }}
            >
              {/* 순위 */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 4 : 5, // PC 간격 줄임
                minWidth: isMobile ? 40 : 55 // PC 줄임 (70→55)
              }}>
                <span style={{ fontSize: isMobile ? 16 : 17 }}> {/* PC 아이콘 크기 줄임 */}
                  {getRankBadge(index + 1)}
                </span>
                <div>
                  <div style={{
                    fontSize: isMobile ? 13 : 13, // PC도 13으로 줄임
                    fontWeight: 700,
                    color: "#fff"
                  }}>
                    #{index + 1}
                  </div>
                  {rankChange !== 0 && (
                    <div style={{
                      fontSize: 10,
                      color: rankChange > 0 ? "#ef4444" : "#4ade80",
                      display: "flex",
                      alignItems: "center",
                      gap: 2
                    }}>
                      {rankChange > 0 ? "↓" : "↑"}{Math.abs(rankChange)}
                    </div>
                  )}
                </div>
              </div>

              {/* 등급 이미지 & 주소/등급 정보 */}
              <div style={{ 
                flex: 1, 
                minWidth: isMobile ? 90 : 130, // PC minWidth 늘림
                display: "flex",
                alignItems: "center",
                gap: isMobile ? 8 : 10
              }}>
                {/* 등급 이미지/아바타 - Next.js 최적화 */}
                <OptimizedGradeAvatar 
                  grade={item.grade}
                  isMobile={isMobile}
                />

                {/* 주소 및 등급 텍스트 */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: isMobile ? 11 : 12,
                    fontWeight: 600,
                    color: "#fff",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: 4
                  }}>
                    {isMobile 
                      ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` 
                      : `${item.address.slice(0, 8)}...${item.address.slice(-6)}` // PC는 다시 길게
                    }
                  </div>
                  <div style={{
                    fontSize: isMobile ? 9 : 10,
                    color: tierColors[item.grade] || "#999",
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    overflow: "hidden"
                  }}>
                    <span style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                    }}>
                      {isMobile 
                        ? item.grade.split(' ')[0] 
                        : item.grade // PC는 전체 등급명 표시
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* 할당량 (실제 수량) */}
              <div style={{ textAlign: "right", minWidth: isMobile ? 70 : 90 }}>
                <div style={{
                  fontSize: isMobile ? 12 : 15, // 모바일에서 폰트 크기 줄임
                  fontWeight: 800,
                  color: "#fff",
                  marginBottom: 2
                }}>
                  {formatLargeNumber(actualAllocation)}
                </div>
                <div style={{
                  fontSize: 9,
                  color: allocationChange.isPositive ? "#4ade80" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 2
                }}>
                  {allocationChange.value}
                </div>
              </div>

              {/* 스테이킹 수량 (실제 수량) */}
              <div style={{ textAlign: "right", minWidth: isMobile ? 70 : 90 }}>
                <div style={{
                  fontSize: isMobile ? 12 : 15, // 모바일에서 폰트 크기 줄임
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: 2
                }}>
                  {formatLargeNumber(actualStaking)}
                </div>
                <div style={{
                  fontSize: 9,
                  color: stakingChange.isPositive ? "#4ade80" : "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  gap: 2
                }}>
                  {stakingChange.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 더보기 버튼 */}
      {currentTab !== 'all' && (
        <button
          onClick={() => setCurrentTab('all')}
          style={{
            width: "100%",
            padding: "12px",
            marginTop: 16,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          }}
        >
          View All Rankings ({data.length}) →
        </button>
      )}
    </div>
  );
}

// 업데이트된 LeaderboardPage 컴포넌트
function LeaderboardPage({ data, modal, setModal, isMobile, isDesktop }:{
  data: LeaderboardItem[]; 
  modal: LeaderboardItem | null; 
  setModal: (item: LeaderboardItem | null) => void; 
  isMobile: boolean; 
  isDesktop: boolean;
}) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const topData = sorted.slice(0, 20);
  const treemapWidth = isMobile ? 350 : isDesktop ? 600 : 500;
  const treemapHeight = isMobile ? 400 : isDesktop ? 500 : 450;
  const items = useTreemapLayout(topData, treemapWidth, treemapHeight);

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: isMobile ? "column" : "row", 
      gap: 24, 
      height: "100%" 
    }}>
      {/* 모바일에서는 Top 10이 위에 표시 */}
      {isMobile && (
        <Top10Leaderboard data={data} isMobile={isMobile} />
      )}

      {/* Treemap 섹션 */}
      <section style={{ 
        flex: isMobile ? "none" : isDesktop ? "0 0 auto" : "1", 
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

      {/* 데스크탑에서는 Top 10이 오른쪽에 표시 */}
      {!isMobile && (
        <section style={{ 
          flex: "1", 
          minWidth: 400,
          maxWidth: 500
        }}>
          <Top10Leaderboard data={data} isMobile={isMobile} />
        </section>
      )}
    </div>
  );
}

// 등급별 배수 정보
const gradeMultipliers: Record<string, number> = {
  "Genesis OG": 5.0,
  "Smoke Flexer": 4.2,
  "Steak Wizard": 3.5,
  "Grilluminati": 3.0,
  "Flame Juggler": 2.5,
  "Flipstarter": 2.0,
  "Sizzlin' Noob": 1.5,
  "Jeeted": 1.0,
};

// 등급별 다음 등급 정보
const nextGrade: Record<string, string> = {
  "Sizzlin' Noob": "Flipstarter",
  "Flipstarter": "Flame Juggler", 
  "Flame Juggler": "Grilluminati",
  "Grilluminati": "Steak Wizard",
  "Steak Wizard": "Smoke Flexer",
  "Smoke Flexer": "Genesis OG",
  "Genesis OG": "Max Level",
};

// 개선된 등급 메인 카드
function EnhancedGradeCard({ myData, isMobile }: { myData: LeaderboardItem; isMobile: boolean }) {
  const currentMultiplier = gradeMultipliers[myData.grade] || 1.0;
  const nextGradeName = nextGrade[myData.grade];
  const nextMultiplier = nextGradeName !== "Max Level" ? gradeMultipliers[nextGradeName] : currentMultiplier;
  
  // 더미 포인트 계산 (스테이킹 수량 × 보유 기간)
  const stakePoints = myData.total_staked * myData.holding_days;
  const mysteryPoints = Math.floor(stakePoints * 0.75 + Math.random() * 1000); // 더미 비공개 포인트
  
  // 다음 등급까지 필요한 포인트 (더미)
  const nextGradeRequired = stakePoints * 1.5;
  const progress = Math.min((stakePoints / nextGradeRequired) * 100, 100);

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(74,222,128,0.12), rgba(34,197,94,0.08))",
      border: "2px solid rgba(74,222,128,0.3)",
      borderRadius: 24,
      padding: isMobile ? "24px" : "32px",
      position: "relative",
      overflow: "hidden",
      marginBottom: 24
    }}>
      {/* 배경 글로우 효과 */}
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 30% 20%, ${tierColors[myData.grade]}20, transparent 70%)`,
        pointerEvents: "none"
      }} />

      {/* 상단: 등급 정보 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: isMobile ? 16 : 24,
        marginBottom: 24,
        position: "relative",
        zIndex: 1
      }}>
        {/* 큰 등급 이미지 */}
        <div style={{
          width: isMobile ? 80 : 120,
          height: isMobile ? 80 : 120,
          borderRadius: 20,
          background: `linear-gradient(135deg, ${tierColors[myData.grade] || "#475569"}, ${tierColors[myData.grade] || "#475569"}88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "3px solid rgba(255,255,255,0.2)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* 배경 패턴 */}
          <div style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 40,
            height: 40,
            background: "rgba(255,255,255,0.1)",
            borderRadius: "50%",
            opacity: 0.6
          }} />
          
          <span style={{ 
            fontSize: isMobile ? 36 : 56,
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))"
          }}>
            {getGradeAvatar(myData.grade)}
          </span>
        </div>

        {/* 등급명 + 배수 정보 */}
        <div style={{ flex: 1 }}>
          <h2 style={{
            fontSize: isMobile ? 24 : 32,
            fontWeight: 900,
            color: "#fff",
            margin: "0 0 8px 0",
            textShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>
            {myData.grade}
          </h2>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 8,
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(255,215,0,0.2)",
              color: "#ffd700",
              padding: "6px 12px",
              borderRadius: 8,
              fontSize: isMobile ? 14 : 16,
              fontWeight: 700
            }}>
              {currentMultiplier}x Multiplier
            </div>
            
            {nextGradeName !== "Max Level" && (
              <div style={{
                fontSize: isMobile ? 12 : 14,
                color: "#999",
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                Next: {nextGradeName} ({nextMultiplier}x) →
              </div>
            )}
          </div>

          <div style={{
            fontSize: isMobile ? 14 : 16,
            color: "#4ade80",
            fontWeight: 600
          }}>
            Rank #{myData.rank} • Top {myData.percentile.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* 중단: 포인트 정보 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
        marginBottom: 24,
        position: "relative",
        zIndex: 1
      }}>
        {/* STAKE Points */}
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#4ade80",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              🥩 STAKE Points
            </h3>
            <div style={{
              fontSize: 10,
              background: "rgba(74,222,128,0.2)",
              color: "#4ade80",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 600
            }}>
              Active
            </div>
          </div>
          
          <div style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 8
          }}>
            {formatLargeNumber(stakePoints)}
          </div>

          {/* 진행률 바 */}
          {nextGradeName !== "Max Level" && (
            <>
              <div style={{
                width: "100%",
                height: 8,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 4,
                overflow: "hidden",
                marginBottom: 8
              }}>
                <div style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #4ade80, #22c55e)",
                  borderRadius: 4,
                  transition: "width 0.3s ease"
                }} />
              </div>
              <div style={{
                fontSize: 11,
                color: "#999",
                display: "flex",
                justifyContent: "space-between"
              }}>
                <span>{progress.toFixed(1)}% to {nextGradeName}</span>
                <span>{formatLargeNumber(nextGradeRequired)}</span>
              </div>
            </>
          )}
        </div>

        {/* Mystery Points */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 20,
          position: "relative"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h3 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#8b5cf6",
              margin: 0,
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}>
              ❓ ??? Points
            </h3>
            <div style={{
              fontSize: 10,
              background: "rgba(139,92,246,0.2)",
              color: "#8b5cf6",
              padding: "2px 6px",
              borderRadius: 4,
              fontWeight: 600
            }}>
              Coming Soon
            </div>
          </div>
          
          <div style={{
            fontSize: isMobile ? 24 : 28,
            fontWeight: 900,
            color: "#8b5cf6",
            marginBottom: 8
          }}>
            {formatLargeNumber(mysteryPoints)}
          </div>

          <div style={{
            fontSize: 11,
            color: "#8b5cf6",
            opacity: 0.8
          }}>
            Future Token Distribution
          </div>

          {/* 미스터리 효과 */}
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 20,
            opacity: 0.3
          }}>
            ✨
          </div>
        </div>
      </div>

      {/* 하단: 액션 버튼 */}
      <div style={{
        position: "relative",
        zIndex: 1
      }}>
        <a
          href="https://app.virtuals.io/virtuals/26083"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "16px 24px",
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 4px 20px rgba(255,107,53,0.3)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(255,107,53,0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(255,107,53,0.3)";
          }}
        >
          <span style={{ fontSize: 18 }}>🚀</span>
          Buy More STAKE
          <span style={{ fontSize: 14, opacity: 0.8 }}>↗</span>
        </a>
      </div>
    </div>
  );
}

// 빈 대시보드 컴포넌트 (스테이킹 독려용)
function EmptyDashboard({ wallet, isMobile }: { wallet: string; isMobile: boolean }) {
  // 예상 스테이킹 시뮬레이션 (더미 데이터)
  const simulatedStakeAmount = 1000; // 1000 STAKE 기준
  const estimatedPoints = simulatedStakeAmount * 30; // 30일 기준
  const startingGrade = "Sizzlin' Noob";
  const startingMultiplier = 1.5;

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: 24, 
      maxWidth: 1000, 
      margin: "0 auto" 
    }}>
      {/* 메인 히어로 섹션 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,53,0.12), rgba(247,147,30,0.08))",
        border: "2px solid rgba(255,107,53,0.3)",
        borderRadius: 24,
        padding: isMobile ? "32px 24px" : "48px 32px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* 배경 효과 */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 50% 20%, rgba(255,107,53,0.15), transparent 70%)",
          pointerEvents: "none"
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          {/* 아이콘 */}
          <div style={{
            fontSize: isMobile ? 64 : 80,
            marginBottom: 24,
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 4px 8px rgba(255,107,53,0.3))"
          }}>
            🚀
          </div>

          {/* 메인 메시지 */}
          <h1 style={{
            fontSize: isMobile ? 28 : 36,
            fontWeight: 900,
            color: "#fff",
            marginBottom: 16,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)"
          }}>
            Start Your STAKE Journey
          </h1>

          <p style={{
            fontSize: isMobile ? 16 : 18,
            color: "#ff6b35",
            marginBottom: 32,
            lineHeight: 1.6,
            maxWidth: 500,
            margin: "0 auto 32px auto"
          }}>
            Your wallet is connected but you haven't started staking yet. 
            Join the leaderboard and start earning multiplied rewards!
          </p>

          {/* 지갑 주소 표시 */}
          <div style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            padding: "12px 20px",
            fontSize: 14,
            fontFamily: "monospace",
            color: "#999",
            marginBottom: 32,
            display: "inline-block"
          }}>
            🔗 {wallet.slice(0, 8)}...{wallet.slice(-6)}
          </div>
        </div>
      </div>

      {/* 예상 혜택 미리보기 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
        gap: 16
      }}>
        {/* 시작 등급 */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12
          }}>
            🆕
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#8b5cf6",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Starting Grade
          </h3>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 4
          }}>
            {startingGrade}
          </div>
          <div style={{
            fontSize: 12,
            color: "#8b5cf6",
            opacity: 0.8
          }}>
            {startingMultiplier}x Multiplier
          </div>
        </div>

        {/* 예상 포인트 */}
        <div style={{
          background: "rgba(74,222,128,0.08)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center"
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12
          }}>
            🎯
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#4ade80",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            Estimated Points
          </h3>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 4
          }}>
            {formatLargeNumber(estimatedPoints)}
          </div>
          <div style={{
            fontSize: 12,
            color: "#4ade80",
            opacity: 0.8
          }}>
            After 30 days
          </div>
        </div>

        {/* 미스터리 포인트 */}
        <div style={{
          background: "rgba(139,92,246,0.08)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 20,
          textAlign: "center",
          position: "relative"
        }}>
          <div style={{
            fontSize: 32,
            marginBottom: 12
          }}>
            ❓
          </div>
          <h3 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#8b5cf6",
            margin: "0 0 8px 0",
            textTransform: "uppercase",
            letterSpacing: "0.5px"
          }}>
            ??? Points
          </h3>
          <div style={{
            fontSize: 18,
            fontWeight: 800,
            color: "#8b5cf6",
            marginBottom: 4
          }}>
            Coming Soon
          </div>
          <div style={{
            fontSize: 12,
            color: "#8b5cf6",
            opacity: 0.8
          }}>
            Future Rewards
          </div>

          {/* 미스터리 반짝임 */}
          <div style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 16,
            opacity: 0.4
          }}>
            ✨
          </div>
        </div>
      </div>

      {/* 스테이킹 혜택 안내 */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: isMobile ? "24px" : "32px"
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: "#fff",
          margin: "0 0 20px 0",
          textAlign: "center"
        }}>
          🎁 Why Stake TOKENS?
        </h3>

        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 20
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🏆</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Climb the Leaderboard
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                Compete with other stakers and earn your place in the rankings
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>⚡</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Multiplied Rewards
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                Higher grades unlock bigger multipliers for maximum returns
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>💎</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Exclusive Benefits
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                Access special features and future token distributions
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>📈</span>
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, color: "#fff", margin: "0 0 4px 0" }}>
                Long-term Growth
              </h4>
              <p style={{ fontSize: 14, color: "#999", margin: 0, lineHeight: 1.5 }}>
                The longer you stake, the more points and rewards you earn
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 큰 액션 버튼 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,107,53,0.1), rgba(247,147,30,0.05))",
        border: "2px solid rgba(255,107,53,0.2)",
        borderRadius: 20,
        padding: isMobile ? "24px" : "32px",
        textAlign: "center"
      }}>
        <h3 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          color: "#fff",
          margin: "0 0 16px 0"
        }}>
          Ready to Start? 🚀
        </h3>

        <p style={{
          fontSize: 16,
          color: "#ff6b35",
          marginBottom: 24,
          lineHeight: 1.5
        }}>
          Get your first STAKE tokens and join the leaderboard today!
        </p>

        <a
          href="https://app.virtuals.io/virtuals/26083"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "20px 40px",
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
            borderRadius: 16,
            border: "none",
            cursor: "pointer",
            transition: "all 0.3s ease",
            boxShadow: "0 8px 32px rgba(255,107,53,0.4)",
            transform: "translateY(0)"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,107,53,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 32px rgba(255,107,53,0.4)";
          }}
        >
          <span style={{ fontSize: 24 }}>🛒</span>
          Buy STAKE Tokens
          <span style={{ fontSize: 16, opacity: 0.8 }}>↗</span>
        </a>
      </div>
    </div>
  );
}

// 포지션 게이지 섹션 컴포넌트
function PositionGaugeSection({ myData, isMobile }: { myData: LeaderboardItem; isMobile: boolean }) {
  // 더미 히스토리 데이터 (7일간 순위 변동)
  const rankingHistory = [
    { day: 'Mon', rank: myData.rank + 3, change: 0 },
    { day: 'Tue', rank: myData.rank + 1, change: 2 },
    { day: 'Wed', rank: myData.rank + 2, change: -1 },
    { day: 'Thu', rank: myData.rank, change: 2 },
    { day: 'Fri', rank: myData.rank - 1, change: -1 },
    { day: 'Sat', rank: myData.rank + 1, change: 1 },
    { day: 'Today', rank: myData.rank, change: -1 }
  ];

  // 전체 대비 위치 계산
  const totalUsers = 1247; // 더미 전체 사용자 수
  const percentilePosition = ((totalUsers - myData.rank) / totalUsers) * 100;
  
  // 최근 7일 평균 변동
  const avgChange = rankingHistory.reduce((sum, day) => sum + Math.abs(day.change), 0) / 7;
  const trendDirection = rankingHistory[rankingHistory.length - 1].rank < rankingHistory[0].rank ? 'up' : 'down';

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20,
      padding: isMobile ? "24px" : "32px",
      marginBottom: 24
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32
      }}>
        <h2 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          color: "#fff",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          📊 Position Analysis
        </h2>
        <div style={{
          fontSize: 12,
          background: trendDirection === 'up' ? "rgba(74,222,128,0.2)" : "rgba(239,68,68,0.2)",
          color: trendDirection === 'up' ? "#4ade80" : "#ef4444",
          padding: "4px 12px",
          borderRadius: 8,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 4
        }}>
          {trendDirection === 'up' ? '📈' : '📉'} 
          {trendDirection === 'up' ? 'Rising' : 'Falling'}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 24
      }}>
        {/* 전체 대비 위치 게이지 */}
        <div style={{
          background: "rgba(74,222,128,0.05)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 16,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#4ade80",
            margin: "0 0 20px 0",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            🎯 Global Position
          </h3>

          {/* 원형 게이지 */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 20
          }}>
            <div style={{
              position: "relative",
              width: 120,
              height: 120,
              marginBottom: 16
            }}>
              {/* 배경 원 */}
              <svg width="120" height="120" style={{ position: "absolute" }}>
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="#4ade80"
                  strokeWidth="8"
                  strokeDasharray={`${percentilePosition * 3.14} 314`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1s ease" }}
                />
              </svg>
              
              {/* 중앙 텍스트 */}
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                textAlign: "center"
              }}>
                <div style={{
                  fontSize: 24,
                  fontWeight: 900,
                  color: "#4ade80"
                }}>
                  {percentilePosition.toFixed(1)}%
                </div>
                <div style={{
                  fontSize: 10,
                  color: "#999",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px"
                }}>
                  Top
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#fff",
                marginBottom: 4
              }}>
                Rank #{myData.rank}
              </div>
              <div style={{
                fontSize: 13,
                color: "#999"
              }}>
                out of {totalUsers.toLocaleString()} stakers
              </div>
            </div>
          </div>

          {/* 위치 상세 정보 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 12
          }}>
            <div style={{
              background: "rgba(74,222,128,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ color: "#4ade80", fontWeight: 700 }}>
                {(totalUsers - myData.rank).toLocaleString()}
              </div>
              <div style={{ color: "#999" }}>Users Below</div>
            </div>
            <div style={{
              background: "rgba(239,68,68,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ color: "#ef4444", fontWeight: 700 }}>
                {(myData.rank - 1).toLocaleString()}
              </div>
              <div style={{ color: "#999" }}>Users Above</div>
            </div>
          </div>
        </div>

        {/* 순위 변동 그래프 */}
        <div style={{
          background: "rgba(139,92,246,0.05)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 16,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: "#8b5cf6",
            margin: "0 0 20px 0",
            display: "flex",
            alignItems: "center",
            gap: 8
          }}>
            📈 7-Day Trend
          </h3>

          {/* 미니 차트 */}
          <div style={{
            height: 100,
            display: "flex",
            alignItems: "end",
            justifyContent: "space-between",
            marginBottom: 20,
            padding: "0 8px"
          }}>
            {rankingHistory.map((day, index) => {
              const maxRank = Math.max(...rankingHistory.map(d => d.rank));
              const minRank = Math.min(...rankingHistory.map(d => d.rank));
              const range = maxRank - minRank || 1;
              const height = 80 - ((day.rank - minRank) / range) * 60;
              
              return (
                <div key={day.day} style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8
                }}>
                  <div style={{
                    width: 20,
                    height: Math.max(height, 10),
                    background: index === rankingHistory.length - 1 
                      ? "linear-gradient(180deg, #8b5cf6, #a855f7)" 
                      : "rgba(139,92,246,0.3)",
                    borderRadius: "4px 4px 0 0",
                    position: "relative"
                  }}>
                    {/* 순위 변동 표시 */}
                    {day.change !== 0 && (
                      <div style={{
                        position: "absolute",
                        top: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10,
                        color: day.change > 0 ? "#ef4444" : "#4ade80"
                      }}>
                        {day.change > 0 ? '↓' : '↑'}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: "#999",
                    textAlign: "center",
                    transform: "rotate(-45deg)",
                    transformOrigin: "center"
                  }}>
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 트렌드 요약 */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            fontSize: 12
          }}>
            <div style={{
              background: "rgba(139,92,246,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ color: "#8b5cf6", fontWeight: 700 }}>
                ±{avgChange.toFixed(1)}
              </div>
              <div style={{ color: "#999" }}>Avg Daily Change</div>
            </div>
            <div style={{
              background: trendDirection === 'up' 
                ? "rgba(74,222,128,0.1)" 
                : "rgba(239,68,68,0.1)",
              padding: "8px 12px",
              borderRadius: 8,
              textAlign: "center"
            }}>
              <div style={{ 
                color: trendDirection === 'up' ? "#4ade80" : "#ef4444", 
                fontWeight: 700 
              }}>
                {Math.abs(rankingHistory[rankingHistory.length - 1].rank - rankingHistory[0].rank)}
              </div>
              <div style={{ color: "#999" }}>7-Day Change</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 인사이트 */}
      <div style={{
        marginTop: 24,
        padding: 20,
        background: "rgba(255,255,255,0.02)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12
        }}>
          <span style={{ fontSize: 16 }}>💡</span>
          <h4 style={{
            fontSize: 14,
            fontWeight: 700,
            color: "#fff",
            margin: 0
          }}>
            Position Insights
          </h4>
        </div>
        
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 16,
          fontSize: 13,
          color: "#ccc",
          lineHeight: 1.5
        }}>
          <div>
            <strong style={{ color: "#4ade80" }}>
              You're in the top {percentilePosition.toFixed(0)}%
            </strong> of all stakers. 
            {percentilePosition < 10 ? " You're an elite staker! 🔥" : 
             percentilePosition < 25 ? " You're doing great! 📈" : 
             " Keep climbing to reach the elite tier! 💪"}
          </div>
          <div>
            <strong style={{ color: "#8b5cf6" }}>
              {trendDirection === 'up' ? 'Rising trend' : 'Falling trend'}
            </strong> over the past week. 
            {trendDirection === 'up' ? 
              " Your strategy is working! Keep it up. 🚀" : 
              " Consider increasing your stake to climb back up. 📊"}
          </div>
        </div>
      </div>
    </div>
  );
}

// 등급업 가이드 섹션 컴포넌트
function GradeUpgradeGuide({ myData, isMobile }: { myData: LeaderboardItem; isMobile: boolean }) {
  const currentMultiplier = gradeMultipliers[myData.grade] || 1.0;
  const nextGradeName = nextGrade[myData.grade];
  const nextMultiplier = nextGradeName !== "Max Level" ? gradeMultipliers[nextGradeName] : currentMultiplier;
  
  // 현재 포인트 (스테이킹 × 기간)
  const currentPoints = myData.total_staked * myData.holding_days;
  
  // 다음 등급 조건들 (더미 데이터)
  const upgradeConditions = {
    requiredPoints: currentPoints * 1.8, // 현재의 1.8배
    requiredStaking: myData.total_staked * 1.5, // 현재의 1.5배
    requiredDays: Math.max(60, myData.holding_days + 30), // 최소 60일 또는 +30일
    requiredConsistency: 14 // 14일 연속 보유
  };

  // 진행률 계산
  const pointsProgress = Math.min((currentPoints / upgradeConditions.requiredPoints) * 100, 100);
  const stakingProgress = Math.min((myData.total_staked / upgradeConditions.requiredStaking) * 100, 100);
  const daysProgress = Math.min((myData.holding_days / upgradeConditions.requiredDays) * 100, 100);
  const consistencyProgress = 85; // 더미 일관성 점수

  // 예상 달성 시간 계산
  const pointsNeeded = Math.max(0, upgradeConditions.requiredPoints - currentPoints);
  const stakingNeeded = Math.max(0, upgradeConditions.requiredStaking - myData.total_staked);
  const daysNeeded = Math.max(0, upgradeConditions.requiredDays - myData.holding_days);
  
  // 현재 속도 기준 예상 시간
  const estimatedDays = Math.max(daysNeeded, Math.ceil(pointsNeeded / (myData.total_staked || 1)));

  // 다음 등급이 없는 경우 (최고 등급)
  if (nextGradeName === "Max Level") {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(255,215,0,0.15), rgba(255,193,7,0.08))",
        border: "2px solid rgba(255,215,0,0.3)",
        borderRadius: 20,
        padding: isMobile ? "24px" : "32px",
        textAlign: "center",
        marginBottom: 24
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👑</div>
        <h2 style={{
          fontSize: isMobile ? 24 : 28,
          fontWeight: 900,
          color: "#ffd700",
          margin: "0 0 12px 0"
        }}>
          Maximum Level Reached!
        </h2>
        <p style={{
          fontSize: 16,
          color: "#ffecb3",
          margin: 0,
          lineHeight: 1.5
        }}>
          Congratulations! You've reached the highest grade. 
          Keep staking to maintain your elite status and earn maximum rewards.
        </p>
      </div>
    );
  }

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20,
      padding: isMobile ? "24px" : "32px",
      marginBottom: 24
    }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 32
      }}>
        <h2 style={{
          fontSize: isMobile ? 20 : 24,
          fontWeight: 800,
          color: "#fff",
          margin: 0,
          display: "flex",
          alignItems: "center",
          gap: 8
        }}>
          🎯 Grade Upgrade Path
        </h2>
        <div style={{
          fontSize: 12,
          background: "rgba(255,193,7,0.2)",
          color: "#ffc107",
          padding: "4px 12px",
          borderRadius: 8,
          fontWeight: 600
        }}>
          Next: {nextGradeName}
        </div>
      </div>

      {/* 다음 등급 미리보기 */}
      <div style={{
        background: `linear-gradient(135deg, ${tierColors[nextGradeName]}15, ${tierColors[nextGradeName]}08)`,
        border: `1px solid ${tierColors[nextGradeName]}40`,
        borderRadius: 16,
        padding: 24,
        marginBottom: 32,
        display: "flex",
        alignItems: "center",
        gap: 20
      }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: 16,
          background: `linear-gradient(135deg, ${tierColors[nextGradeName]}, ${tierColors[nextGradeName]}88)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px solid rgba(255,255,255,0.2)",
          fontSize: 40
        }}>
          {getGradeAvatar(nextGradeName)}
        </div>

        <div style={{ flex: 1 }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#fff",
            margin: "0 0 8px 0"
          }}>
            {nextGradeName}
          </h3>
          
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap"
          }}>
            <div style={{
              background: "rgba(255,215,0,0.2)",
              color: "#ffd700",
              padding: "4px 12px",
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 700
            }}>
              {nextMultiplier}x Multiplier (+{(nextMultiplier - currentMultiplier).toFixed(1)}x)
            </div>
            
            <div style={{
              fontSize: 14,
              color: "#4ade80",
              fontWeight: 600
            }}>
              {((nextMultiplier - currentMultiplier) / currentMultiplier * 100).toFixed(0)}% more rewards
            </div>
          </div>
        </div>
      </div>

      {/* 달성 조건들 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
        gap: 16,
        marginBottom: 24
      }}>
        {/* STAKE Points 조건 */}
        <div style={{
          background: "rgba(74,222,128,0.05)",
          border: "1px solid rgba(74,222,128,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#4ade80",
              margin: 0
            }}>
              🥩 STAKE Points
            </h4>
            <span style={{
              fontSize: 12,
              color: pointsProgress >= 100 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {pointsProgress.toFixed(0)}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            {formatLargeNumber(currentPoints)} / {formatLargeNumber(upgradeConditions.requiredPoints)}
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${pointsProgress}%`,
              height: "100%",
              background: pointsProgress >= 100 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #ffc107, #ff9800)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            {pointsProgress >= 100 ? "✅ Completed!" : `${formatLargeNumber(pointsNeeded)} more needed`}
          </div>
        </div>

        {/* 스테이킹 수량 조건 */}
        <div style={{
          background: "rgba(139,92,246,0.05)",
          border: "1px solid rgba(139,92,246,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#8b5cf6",
              margin: 0
            }}>
              💰 Staking Amount
            </h4>
            <span style={{
              fontSize: 12,
              color: stakingProgress >= 100 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {stakingProgress.toFixed(0)}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            {formatLargeNumber(myData.total_staked)} / {formatLargeNumber(upgradeConditions.requiredStaking)}
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${stakingProgress}%`,
              height: "100%",
              background: stakingProgress >= 100 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #8b5cf6, #a855f7)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            {stakingProgress >= 100 ? "✅ Completed!" : `${formatLargeNumber(stakingNeeded)} more needed`}
          </div>
        </div>

        {/* 보유 기간 조건 */}
        <div style={{
          background: "rgba(34,197,94,0.05)",
          border: "1px solid rgba(34,197,94,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#22c55e",
              margin: 0
            }}>
              ⏰ Holding Period
            </h4>
            <span style={{
              fontSize: 12,
              color: daysProgress >= 100 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {daysProgress.toFixed(0)}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            {myData.holding_days} / {upgradeConditions.requiredDays} days
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${daysProgress}%`,
              height: "100%",
              background: daysProgress >= 100 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #22c55e, #16a34a)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            {daysProgress >= 100 ? "✅ Completed!" : `${daysNeeded} more days`}
          </div>
        </div>

        {/* 일관성 점수 */}
        <div style={{
          background: "rgba(239,68,68,0.05)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: 20
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#ef4444",
              margin: 0
            }}>
              🎯 Consistency
            </h4>
            <span style={{
              fontSize: 12,
              color: consistencyProgress >= 80 ? "#4ade80" : "#ffc107",
              fontWeight: 600
            }}>
              {consistencyProgress}%
            </span>
          </div>

          <div style={{
            fontSize: 16,
            fontWeight: 800,
            color: "#fff",
            marginBottom: 8
          }}>
            12 / {upgradeConditions.requiredConsistency} days
          </div>

          {/* 진행률 바 */}
          <div style={{
            width: "100%",
            height: 6,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 3,
            overflow: "hidden",
            marginBottom: 8
          }}>
            <div style={{
              width: `${consistencyProgress}%`,
              height: "100%",
              background: consistencyProgress >= 80 
                ? "linear-gradient(90deg, #4ade80, #22c55e)"
                : "linear-gradient(90deg, #ef4444, #dc2626)",
              borderRadius: 3,
              transition: "width 0.3s ease"
            }} />
          </div>

          <div style={{
            fontSize: 11,
            color: "#999"
          }}>
            Consecutive holding streak
          </div>
        </div>
      </div>

      {/* 예상 달성 시간 및 혜택 */}
      <div style={{
        background: "linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,152,0,0.05))",
        border: "1px solid rgba(255,193,7,0.2)",
        borderRadius: 16,
        padding: 24
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: 24,
          alignItems: "center"
        }}>
          <div>
            <h4 style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#ffc107",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              ⏱️ Estimated Time to Upgrade
            </h4>
            <div style={{
              fontSize: 24,
              fontWeight: 900,
              color: "#fff",
              marginBottom: 8
            }}>
              {estimatedDays} days
            </div>
            <div style={{
              fontSize: 13,
              color: "#ffcc02",
              opacity: 0.8
            }}>
              Based on current staking rate
            </div>
          </div>

          <div>
            <h4 style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#ffc107",
              margin: "0 0 12px 0",
              display: "flex",
              alignItems: "center",
              gap: 8
            }}>
              💎 Upgrade Benefits
            </h4>
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              fontSize: 13,
              color: "#fff"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚡</span>
                <span>+{((nextMultiplier - currentMultiplier) / currentMultiplier * 100).toFixed(0)}% reward multiplier</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🏆</span>
                <span>Higher leaderboard prestige</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>🎁</span>
                <span>Exclusive grade benefits</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- 완성된 MyDashboardPage (모든 섹션 포함) ---
function MyDashboardPage({ data, wallet }:{ data: LeaderboardItem[]; wallet: string }) {
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;
  
  if (!wallet) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 24 }}>🔒</div>
      <h2 style={{ color: "#fff", marginBottom: 16, fontSize: 24 }}>Connect Your Wallet</h2>
      <p style={{ color: "#999", fontSize: 16, maxWidth: 400, lineHeight: 1.5 }}>Please connect your wallet to view your personal dashboard and staking statistics.</p>
    </div>
  }

  // 연결된 지갑의 데이터 찾기
  const myData = data.find(item => item.address.toLowerCase() === wallet.toLowerCase());
  
  // 데이터가 없으면 빈 대시보드 표시
  if (!myData) {
    return <EmptyDashboard wallet={wallet} isMobile={isMobile} />;
  }

  // 데이터가 있으면 완전한 대시보드 표시
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
      {/* 등급 메인 카드 */}
      <EnhancedGradeCard myData={myData} isMobile={isMobile} />
      
      {/* 포지션 게이지 섹션 */}
      <PositionGaugeSection myData={myData} isMobile={isMobile} />
      
      {/* 등급업 가이드 섹션 */}
      <GradeUpgradeGuide myData={myData} isMobile={isMobile} />
    </div>
  );
}

// 개선된 StatsPage 컴포넌트 - pages/index.tsx의 StatsPage 함수를 이것으로 교체하세요

// 더미 트렌드 데이터 생성
const generateTrendData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const baseStaking = 45000000;
  const baseUsers = 800;
  
  return days.map((day, index) => {
    const growth = Math.random() * 0.1 + 0.02; // 2-12% 성장
    const stakingAmount = baseStaking * (1 + growth * index);
    const activeUsers = baseUsers + Math.floor(Math.random() * 50 + index * 20);
    
    return {
      day,
      staking: Math.floor(stakingAmount),
      users: activeUsers,
      newStakers: Math.floor(Math.random() * 25 + 15),
      avgStake: Math.floor(stakingAmount / activeUsers)
    };
  });
};

// 등급별 분포 데이터
const gradeDistribution = [
  { grade: 'Genesis OG', count: 45, color: '#4ade80', multiplier: 5.0 },
  { grade: 'Smoke Flexer', count: 12, color: '#22d3ee', multiplier: 4.2 },
  { grade: 'Steak Wizard', count: 67, color: '#818cf8', multiplier: 3.5 },
  { grade: 'Grilluminati', count: 89, color: '#f472b6', multiplier: 3.0 },
  { grade: 'Flame Juggler', count: 156, color: '#fb923c', multiplier: 2.5 },
  { grade: 'Flipstarter', count: 234, color: '#64748b', multiplier: 2.0 },
  { grade: 'Sizzlin\' Noob', count: 298, color: '#475569', multiplier: 1.5 },
  { grade: 'Jeeted', count: 327, color: '#ef4444', multiplier: 1.0 }
];

// 배수별 리워드 분석 데이터
const multiplierAnalysis = gradeDistribution.map(grade => {
  const totalStaked = grade.count * (Math.random() * 2000000 + 500000); // 더미 스테이킹
  const expectedReward = totalStaked * grade.multiplier * 0.001; // 더미 리워드 계산
  
  return {
    grade: grade.grade,
    count: grade.count,
    totalStaked: Math.floor(totalStaked),
    multiplier: grade.multiplier,
    expectedReward: Math.floor(expectedReward),
    avgPerUser: Math.floor(expectedReward / grade.count),
    color: grade.color
  };
});

// 상위 vs 하위 비교 데이터
const tierComparison = [
  {
    tier: 'Top 10%',
    users: 93,
    avgStake: 2450000,
    avgMultiplier: 4.2,
    totalReward: 45600000,
    color: '#4ade80'
  },
  {
    tier: 'Middle 80%',
    users: 744,
    avgStake: 890000,
    avgMultiplier: 2.1,
    totalReward: 32400000,
    color: '#818cf8'
  },
  {
    tier: 'Bottom 10%',
    users: 92,
    avgStake: 156000,
    avgMultiplier: 1.2,
    totalReward: 2100000,
    color: '#ef4444'
  }
];

// 실시간 활동 피드 더미 데이터
const generateActivityFeed = () => {
  const activities = [
    { type: 'rank_up', user: '0x95740c...ae15', from: 2, to: 1, time: '2m ago' },
    { type: 'new_staker', user: '0x8fc1a0...e74', amount: 1250000, time: '5m ago' },
    { type: 'rank_down', user: '0xca0bcd...477', from: 15, to: 18, time: '8m ago' },
    { type: 'big_stake', user: '0x40d258...858', amount: 5000000, time: '12m ago' },
    { type: 'grade_up', user: '0xd7afa0...031', from: 'Flame Juggler', to: 'Grilluminati', time: '15m ago' },
    { type: 'new_staker', user: '0xe302da...332', amount: 850000, time: '18m ago' },
    { type: 'rank_up', user: '0xe5a8be...d28', from: 45, to: 42, time: '22m ago' },
    { type: 'unstake', user: '0x8fc1a0...e74', amount: 750000, time: '25m ago' },
  ];
  
  return activities;
};

// 글로벌 건강도 지표
const healthMetrics = {
  stakingRatio: 78.5, // 전체 토큰 중 스테이킹 비율
  activeRatio: 85.2, // 활성 사용자 비율
  retentionRate: 92.1, // 7일 유지율
  growthRate: 15.7, // 주간 성장률
  diversityIndex: 0.73, // 등급 다양성 지수 (0-1)
  liquidityHealth: 88.9 // 유동성 건강도
};

// 차트 색상 팔레트
const chartColors = {
  primary: '#4ade80',
  secondary: '#818cf8', 
  accent: '#f472b6',
  warning: '#fb923c',
  danger: '#ef4444',
  neutral: '#64748b'
};

// 탭 데이터
const statsTabs = [
  { id: 'overview', label: '📊 Overview', icon: '📊' },
  { id: 'trends', label: '📈 Trends', icon: '📈' },
  { id: 'grades', label: '🏆 Grades', icon: '🏆' },
  { id: 'rewards', label: '💰 Rewards', icon: '💰' },
  { id: 'comparison', label: '⚖️ Compare', icon: '⚖️' },
  { id: 'activity', label: '⚡ Activity', icon: '⚡' },
];

// 개선된 StatsPage 컴포넌트
function StatsPage({ data }: { data: LeaderboardItem[] }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  
  const isMobile = windowSize.width < 768;
  const isTablet = windowSize.width < 1024;
  
  // 실제 데이터에서 계산된 통계
  const totalStaked = data.reduce((sum, item) => sum + item.total_staked, 0);
  const activeWallets = data.filter(item => item.total_staked > 0).length;
  const avgStake = totalStaked / (activeWallets || 1);
  const topStaker = data.reduce((max, item) => item.total_staked > max.total_staked ? item : max, data[0]);
  
  // 트렌드 데이터
  const trendData = generateTrendData();
  const activityFeed = generateActivityFeed();

  // 윈도우 리사이즈 핸들러
  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    if (typeof window !== 'undefined') {
      window.addEventListener("resize", handleResize);
      handleResize();
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  // 숫자 포맷팅 함수
  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toLocaleString();
  };

  // 탭 렌더링
  const renderTabs = () => (
    <div style={{
      display: 'flex',
      background: 'rgba(255,255,255,0.05)',
      borderRadius: 16,
      padding: 4,
      marginBottom: 32,
      gap: 2,
      overflowX: 'auto',
      flexWrap: isMobile ? 'wrap' : 'nowrap'
    }}>
      {statsTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          style={{
            flex: isMobile ? '1 1 calc(50% - 4px)' : '1',
            padding: isMobile ? '12px 8px' : '14px 16px',
            background: activeTab === tab.id 
              ? 'rgba(74,222,128,0.15)' 
              : 'transparent',
            border: activeTab === tab.id 
              ? '1px solid rgba(74,222,128,0.3)' 
              : '1px solid transparent',
            borderRadius: 12,
            color: activeTab === tab.id ? '#4ade80' : '#999',
            fontSize: isMobile ? 12 : 14,
            fontWeight: activeTab === tab.id ? 700 : 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? 4 : 8,
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: isMobile ? 14 : 16 }}>{tab.icon}</span>
          {!isMobile && <span>{tab.label.split(' ')[1]}</span>}
        </button>
      ))}
    </div>
  );

  // Overview 탭 컨텐츠
  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 메인 통계 카드들 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : isTablet ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
        gap: 16
      }}>
        <div style={{
          background: 'rgba(74,222,128,0.08)',
          border: '1px solid rgba(74,222,128,0.2)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#4ade80', marginBottom: 8 }}>
            {formatNumber(totalStaked)}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#fff', fontWeight: 600 }}>Total Staked</div>
          <div style={{ fontSize: 10, color: '#4ade80', marginTop: 4 }}>+12.5% this week</div>
        </div>

        <div style={{
          background: 'rgba(129,140,248,0.08)',
          border: '1px solid rgba(129,140,248,0.2)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#818cf8', marginBottom: 8 }}>
            {activeWallets.toLocaleString()}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#fff', fontWeight: 600 }}>Active Stakers</div>
          <div style={{ fontSize: 10, color: '#818cf8', marginTop: 4 }}>+8.3% this week</div>
        </div>

        <div style={{
          background: 'rgba(244,114,182,0.08)',
          border: '1px solid rgba(244,114,182,0.2)',
          borderRadius: 16,
          padding: 20,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, color: '#f472b6', marginBottom: 8 }}>
            {formatNumber(avgStake)}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#fff', fontWeight: 600 }}>Avg Stake</div>
          <div style={{ fontSize: 10, color: '#f472b6', marginTop: 4 }}>+3.7% this week</div>
        </div>

        {!isMobile && (
          <div style={{
            background: 'rgba(251,146,60,0.08)',
            border: '1px solid rgba(251,146,60,0.2)',
            borderRadius: 16,
            padding: 20,
            textAlign: 'center'
          }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: '#fb923c', marginBottom: 8 }}>
              {((activeWallets / 1247) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>Participation</div>
            <div style={{ fontSize: 10, color: '#fb923c', marginTop: 4 }}>+2.1% this week</div>
          </div>
        )}
      </div>

      {/* 글로벌 건강도 지표 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          🌍 Ecosystem Health
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: 20
        }}>
          {Object.entries(healthMetrics).map(([key, value]) => {
            const labels: Record<string, string> = {
              stakingRatio: 'Staking Ratio',
              activeRatio: 'Active Users',
              retentionRate: 'Retention',
              growthRate: 'Growth Rate',
              diversityIndex: 'Diversity',
              liquidityHealth: 'Liquidity'
            };
            
            const getColor = (val: number) => {
              if (val >= 80) return '#4ade80';
              if (val >= 60) return '#fb923c';
              return '#ef4444';
            };

            return (
              <div key={key} style={{ textAlign: 'center' }}>
                <div style={{
                  width: isMobile ? 60 : 80,
                  height: isMobile ? 60 : 80,
                  borderRadius: '50%',
                  background: `conic-gradient(${getColor(value)} ${value * 3.6}deg, rgba(255,255,255,0.1) 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  position: 'relative'
                }}>
                  <div style={{
                    width: isMobile ? 45 : 60,
                    height: isMobile ? 45 : 60,
                    borderRadius: '50%',
                    background: '#0a0a0a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isMobile ? 12 : 14,
                    fontWeight: 700,
                    color: getColor(value)
                  }}>
                    {value.toFixed(1)}%
                  </div>
                </div>
                <div style={{
                  fontSize: isMobile ? 11 : 13,
                  color: '#fff',
                  fontWeight: 600
                }}>
                  {labels[key]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Trends 탭 컨텐츠
  const renderTrends = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 스테이킹 트렌드 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          📈 Staking Trends (7 Days)
        </h3>

        <div style={{ height: isMobile ? 250 : 300, marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="stakingGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  formatNumber(value),
                  name === 'staking' ? 'Total Staked' : name === 'users' ? 'Active Users' : name
                ]}
              />
              <Area 
                type="monotone" 
                dataKey="staking" 
                stroke="#4ade80" 
                strokeWidth={2}
                fill="url(#stakingGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 트렌드 요약 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 16
        }}>
          {[
            { label: 'Peak Day', value: 'Friday', color: '#4ade80' },
            { label: 'Growth Rate', value: '+15.7%', color: '#4ade80' },
            { label: 'New Stakers', value: '147', color: '#818cf8' },
            { label: 'Avg Daily', value: formatNumber(trendData[trendData.length - 1].staking), color: '#f472b6' }
          ].map((item, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                color: item.color,
                marginBottom: 4
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize: 11,
                color: '#999'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Grades 탭 컨텐츠
  const renderGrades = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 등급별 분포 차트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 24
      }}>
        {/* 도넛 차트 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 24px 0',
            textAlign: 'center'
          }}>
            🏆 Grade Distribution
          </h3>

          <div style={{ height: isMobile ? 250 : 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 80 : 120}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    background: 'rgba(0,0,0,0.9)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string) => [value, 'Users']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 등급별 상세 리스트 */}
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20,
          padding: 24
        }}>
          <h3 style={{
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: '0 0 24px 0'
          }}>
            📊 Grade Details
          </h3>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            maxHeight: isMobile ? 250 : 300,
            overflowY: 'auto'
          }}>
            {gradeDistribution.map((grade, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <div style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    background: grade.color
                  }} />
                  <div>
                    <div style={{
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 600,
                      color: '#fff'
                    }}>
                      {grade.grade}
                    </div>
                    <div style={{
                      fontSize: 11,
                      color: grade.color
                    }}>
                      {grade.multiplier}x multiplier
                    </div>
                  </div>
                </div>
                <div style={{
                  textAlign: 'right'
                }}>
                  <div style={{
                    fontSize: isMobile ? 14 : 16,
                    fontWeight: 700,
                    color: '#fff'
                  }}>
                    {grade.count}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#999'
                  }}>
                    {((grade.count / gradeDistribution.reduce((sum, g) => sum + g.count, 0)) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Rewards 탭 컨텐츠  
  const renderRewards = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 배수별 리워드 분석 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          💰 Multiplier Reward Analysis
        </h3>

        <div style={{ height: isMobile ? 250 : 350, marginBottom: 20 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={multiplierAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="grade" 
                stroke="#999" 
                fontSize={10}
                tick={{ fill: '#999' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  formatNumber(value),
                  name === 'expectedReward' ? 'Expected Reward' : name
                ]}
              />
              <Bar 
                dataKey="expectedReward" 
                fill="#4ade80"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 리워드 요약 통계 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 16
        }}>
          {[
            { 
              label: 'Total Rewards', 
              value: formatNumber(multiplierAnalysis.reduce((sum, item) => sum + item.expectedReward, 0)),
              color: '#4ade80' 
            },
            { 
              label: 'Highest Multiplier', 
              value: `${Math.max(...multiplierAnalysis.map(item => item.multiplier))}x`,
              color: '#fb923c' 
            },
            { 
              label: 'Avg Per User', 
              value: formatNumber(multiplierAnalysis.reduce((sum, item) => sum + item.avgPerUser, 0) / multiplierAnalysis.length),
              color: '#818cf8' 
            },
            { 
              label: 'Top Grade Bonus', 
              value: '+400%',
              color: '#f472b6' 
            }
          ].map((item, index) => (
            <div key={index} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 12,
              padding: 16,
              textAlign: 'center'
            }}>
              <div style={{
                fontSize: isMobile ? 14 : 16,
                fontWeight: 700,
                color: item.color,
                marginBottom: 4
              }}>
                {item.value}
              </div>
              <div style={{
                fontSize: 11,
                color: '#999'
              }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Comparison 탭 컨텐츠
  const renderComparison = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 상위 vs 하위 비교 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <h3 style={{
          fontSize: 20,
          fontWeight: 700,
          color: '#fff',
          margin: '0 0 24px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }}>
          ⚖️ Tier Comparison Analysis
        </h3>

        {/* 비교 차트 */}
        <div style={{ height: isMobile ? 250 : 300, marginBottom: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tierComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="tier" 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
              />
              <YAxis 
                stroke="#999" 
                fontSize={12}
                tick={{ fill: '#999' }}
                tickFormatter={(value) => formatNumber(value)}
              />
              <Tooltip 
                contentStyle={{
                  background: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8,
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  formatNumber(value),
                  name === 'avgStake' ? 'Avg Stake' : 
                  name === 'totalReward' ? 'Total Reward' : name
                ]}
              />
              <Bar dataKey="avgStake" fill="#4ade80" radius={[2, 2, 0, 0]} />
              <Bar dataKey="totalReward" fill="#818cf8" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 비교 상세 카드들 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 16
        }}>
          {tierComparison.map((tier, index) => (
            <div key={index} style={{
              background: `${tier.color}15`,
              border: `1px solid ${tier.color}40`,
              borderRadius: 16,
              padding: 20
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 16
              }}>
                <h4 style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: tier.color,
                  margin: 0
                }}>
                  {tier.tier}
                </h4>
                <div style={{
                  fontSize: 18,
                  color: tier.color
                }}>
                  {index === 0 ? '👑' : index === 1 ? '🎯' : '🔽'}
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Users</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {tier.users.toLocaleString()}
                  </span>
                </div>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Avg Stake</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {formatNumber(tier.avgStake)}
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Avg Multiplier</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: tier.color }}>
                    {tier.avgMultiplier}x
                  </span>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: 12, color: '#999' }}>Total Reward</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                    {formatNumber(tier.totalReward)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Activity 탭 컨텐츠
  const renderActivity = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* 실시간 활동 피드 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: 24
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24
        }}>
          <h3 style={{
            fontSize: 20,
            fontWeight: 700,
            color: '#fff',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8
          }}>
            ⚡ Live Activity Feed
          </h3>
          <div style={{
            fontSize: 12,
            background: 'rgba(74,222,128,0.2)',
            color: '#4ade80',
            padding: '4px 8px',
            borderRadius: 6,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#4ade80',
              animation: 'pulse 2s infinite'
            }} />
            Live
          </div>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          maxHeight: 400,
          overflowY: 'auto'
        }}>
          {activityFeed.map((activity, index) => {
            const getActivityIcon = (type: string) => {
              switch(type) {
                case 'rank_up': return '📈';
                case 'rank_down': return '📉';
                case 'new_staker': return '🆕';
                case 'big_stake': return '💎';
                case 'grade_up': return '⬆️';
                case 'unstake': return '📤';
                default: return '⚡';
              }
            };

            const getActivityColor = (type: string) => {
              switch(type) {
                case 'rank_up': return '#4ade80';
                case 'rank_down': return '#ef4444';
                case 'new_staker': return '#818cf8';
                case 'big_stake': return '#f472b6';
                case 'grade_up': return '#fb923c';
                case 'unstake': return '#64748b';
                default: return '#999';
              }
            };

            const getActivityText = (activity: any) => {
              switch(activity.type) {
                case 'rank_up':
                  return `moved up from #${activity.from} to #${activity.to}`;
                case 'rank_down':
                  return `dropped from #${activity.from} to #${activity.to}`;
                case 'new_staker':
                  return `staked ${formatNumber(activity.amount)} STAKE`;
                case 'big_stake':
                  return `made a big stake of ${formatNumber(activity.amount)} STAKE`;
                case 'grade_up':
                  return `upgraded from ${activity.from} to ${activity.to}`;
                case 'unstake':
                  return `unstaked ${formatNumber(activity.amount)} STAKE`;
                default:
                  return 'performed an action';
              }
            };

            return (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: 12,
                transition: 'all 0.2s'
              }}>
                <div style={{
                  fontSize: 20,
                  marginRight: 12
                }}>
                  {getActivityIcon(activity.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: isMobile ? 13 : 14,
                    color: '#fff',
                    marginBottom: 2
                  }}>
                    <span style={{
                      fontFamily: 'monospace',
                      color: getActivityColor(activity.type),
                      fontWeight: 600
                    }}>
                      {activity.user}
                    </span>
                    {' '}
                    <span style={{ color: '#ccc' }}>
                      {getActivityText(activity)}
                    </span>
                  </div>
                  <div style={{
                    fontSize: 11,
                    color: '#666'
                  }}>
                    {activity.time}
                  </div>
                </div>

                <div style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: getActivityColor(activity.type),
                  opacity: 0.7
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // 현재 탭에 따른 컨텐츠 렌더링
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview': return renderOverview();
      case 'trends': return renderTrends();
      case 'grades': return renderGrades();
      case 'rewards': return renderRewards();
      case 'comparison': return renderComparison();
      case 'activity': return renderActivity();
      default: return renderOverview();
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: 24, 
      maxWidth: 1400, 
      margin: '0 auto',
      padding: isMobile ? '0' : '0 20px'
    }}>
      {/* 페이지 헤더 */}
      <div style={{ 
        textAlign: 'center',
        marginBottom: 16
      }}>
        <h1 style={{ 
          fontSize: isMobile ? 24 : 32, 
          fontWeight: 900, 
          color: '#fff', 
          margin: '0 0 8px 0',
          background: 'linear-gradient(135deg, #4ade80, #22c55e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          📊 Advanced Analytics
        </h1>
        <p style={{
          fontSize: isMobile ? 14 : 16,
          color: '#999',
          margin: 0
        }}>
          Deep insights into the STAKE ecosystem
        </p>
      </div>

      {/* 탭 네비게이션 */}
      {renderTabs()}

      {/* 탭 컨텐츠 */}
      {renderTabContent()}
    </div>
  );
}

// --- 모달 ---
function SimpleModal({ modal, onClose }:{ modal: LeaderboardItem; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);
  return (
    <div style={{ position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "linear-gradient(135deg, #1a1d29 0%, #252833 50%, #1e2028 100%)", borderRadius: 24, width: 380, maxWidth: "95vw",
        padding: 0, color: "#fff", fontSize: 16, boxShadow: "0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)",
        border: "2px solid rgba(255,255,255,0.05)", overflow: "hidden", position: "relative", transform: "scale(1)"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: 16, right: 20, fontSize: 28,
          color: "#666", background: "none", border: "none", cursor: "pointer", zIndex: 10, borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center"
        }}>×</button>
        <div style={{ background: tierColors[modal.grade] || tierColors["Sizzlin' Noob"], padding: "32px 32px 24px", textAlign: "center", borderRadius: "24px 24px 0 0", position: "relative" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{getRankBadge(modal.rank)}</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", textShadow: "0 2px 4px rgba(255,255,255,0.3)", letterSpacing: "1px", marginBottom: 4 }}>{modal.grade}</div>
          <div style={{ display: "inline-block", background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "4px 12px", fontSize: 14, fontWeight: 700, color: "#fff" }}>Rank #{modal.rank}</div>
        </div>
        <div style={{ padding: "28px 32px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: 20, fontSize: 15, fontFamily: "monospace", color: "#a0a0a0", fontWeight: 600, background: "rgba(255,255,255,0.05)", padding: "8px 16px", borderRadius: 8 }}>
            {modal.address.slice(0, 10)}...{modal.address.slice(-8)}
          </div>
          <div style={{ textAlign: "center", marginBottom: 24, background: "linear-gradient(135deg, rgba(255,107,107,0.1), rgba(238,90,36,0.1))", borderRadius: 16, padding: "20px" }}>
            <div style={{ fontSize: 42, fontWeight: 900, background: "linear-gradient(135deg, #ff6b6b, #ee5a24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8, lineHeight: 1 }}>{modal.value.toFixed(2)}%</div>
            <div style={{ fontSize: 14, color: "#888", fontWeight: 600 }}>Phase 1 Allocation</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Home Page ---
export default function Home() {
  const { address: wallet } = useAccount();
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<LeaderboardItem | null>(null);
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [currentPage, setCurrentPage] = useState("leaderboard");
  const isDesktop = windowSize.width >= 1024;
  const isMobile = windowSize.width < 768;

  const fetchLeaderboardData = async () => {
    try {
      setLoading(true); setError(null);
      const response = await axios.get(SHEET_BEST_URL, { timeout: 30000, headers: { 'Content-Type': 'application/json' } });
      if (!response.data) throw new Error('응답 데이터가 없습니다');
      let rawData;
      if (response.data.leaderboard) rawData = response.data.leaderboard;
      else if (Array.isArray(response.data)) rawData = response.data;
      else throw new Error('알 수 없는 데이터 형식');
      if (!Array.isArray(rawData) || rawData.length === 0) throw new Error('유효하지 않은 데이터 배열');
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
      if (totalValue > 0) transformedData.forEach(item => { item.value = (item.value / totalValue) * 100; });
      setData(transformedData);
    } catch (err: any) {
      setError(err.message); setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18 }}>
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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0a0a0a', color: '#fff', fontSize: 18 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>No Data Available</div>
          <div style={{ fontSize: 16, color: '#999', marginBottom: 20 }}>{error || 'Please check leaderboard.json'}</div>
          <button onClick={fetchLeaderboardData} style={{ padding: "12px 24px", background: "#4ade80", color: "#000", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: 700 }}>Retry</button>
        </div>
      </div>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <MyDashboardPage data={data} wallet={wallet || ""} />;
      case "stats":
        return <StatsPage data={data} />;
      case "leaderboard":
      default:
        return <LeaderboardPage 
          data={data} 
          modal={modal} 
          setModal={setModal} 
          isMobile={isMobile} 
          isDesktop={isDesktop}
        />;
    }
  };

  return (
    <Layout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      wallet={wallet || ""}
      isMobile={isMobile}
      isDesktop={isDesktop}
    >
      {renderCurrentPage()}
      {modal && <SimpleModal modal={modal} onClose={() => setModal(null)} />}
    </Layout>
  );
}
