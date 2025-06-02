"use client";
import { useEffect, useState } from "react";
import { treemap, hierarchy } from "d3-hierarchy";
import axios from "axios";

// GitHub Pages JSON API URL
const SHEET_BEST_URL = '/leaderboard.json';

// 등급별 컬러 매핑
const tierColors: Record<string, string> = {
  "Genesis OG": "linear-gradient(135deg,#00e0d5 0%,#00b8d4 100%)",
  "Smoke Flexer": "linear-gradient(135deg,#ff4343 0%,#ff6b6b 100%)",
  "Steak Wizard": "linear-gradient(135deg,#bc6ff1 0%,#d084ff 100%)",
  "Grilluminati": "linear-gradient(135deg,#ffd700 0%,#ffed4e 100%)",
  "Flame Juggler": "linear-gradient(135deg,#62b6fa 0%,#82d4ff 100%)",
  "Flipstarter": "linear-gradient(135deg,#8cffa3 0%,#a8ffb8 100%)",
  "Sizzlin' Noob": "linear-gradient(135deg,#fff9e2 70%,#ffe9a6 100%)",
  "Jeeted": "linear-gradient(135deg,#eaf1f4 60%,#bed8db 100%)",
};

// 등급 매핑
const gradeToTierMap: Record<string, string> = {
  "Genesis OG": "GENESIS_OG",
  "Smoke Flexer": "SMOKE_FLEXER", 
  "Steak Wizard": "STEAK_WIZARD",
  "Grilluminati": "GRILLUMINATI",
  "Flame Juggler": "FLAME_JUGGLER",
  "Flipstarter": "FLIPSTARTER",
  "Sizzlin' Noob": "SIZZLIN_NOOB",
  "Jeeted": "JEETED"
};

// 등급별 이미지 매핑
const getGradeImage = (grade: string) => {
  const images: Record<string, string> = {
    "Genesis OG": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NTYpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDU2IiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzAwZTBkNSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMGI4ZDQiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Smoke Flexer": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NTcpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDU3IiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI2ZmNDM0MyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZjZiNmIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Steak Wizard": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NTgpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDU4IiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI2JjNmZmMSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNkMDg0ZmYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Grilluminati": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NTkpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDU5IiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZDcwMCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmVkNGUiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Flame Juggler": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NjApIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDYwIiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzYyYjZmYSIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4MmQ0ZmYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Flipstarter": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NjEpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDYxIiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iIzhjZmZhMyIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNhOGZmYjgiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Sizzlin' Noob": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NjIpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDYyIiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI2ZmZjllMiIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZmU5YTYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K",
    "Jeeted": "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiByeD0iMjAiIGZpbGw9InVybCgjZ3JhZGllbnQwXzEyM180NjMpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWRpZW50MF8xMjNfNDYzIiB4MT0iMCIgeTE9IjAiIHgyPSIxMDAiIHkyPSIxMDAiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agc3RvcC1jb2xvcj0iI2VhZjFmNCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNiZWQ4ZGIiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K"
  };
  return images[grade] || images["Sizzlin' Noob"];
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

// 개선된 모달 컴포넌트
function SimpleModal({ modal, onClose }: { modal: LeaderboardItem; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  // 할당 토큰 계산
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
          background: "rgba(0,0,0,0.85)", zIndex: 99, display: "flex",
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
              width: 80, height: 80, margin: "0 auto 16px",
              borderRadius: 20, overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              border: "3px solid rgba(255,255,255,0.2)"
            }}>
              <img 
                src={getGradeImage(modal.grade)}
                alt={modal.grade}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
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
              할당 순위 #{modal.rank}
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
                🎯 Phase 1 할당 보상
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
                <span style={{ color: "#999" }}>현재 스테이킹:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  {modal.total_staked.toLocaleString()} STAKE
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>보유 기간:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>{modal.time}</span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>타임 스코어:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  {modal.score.toLocaleString()}
                </span>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>퍼센타일:</span>
                <span style={{ color: "#fff", fontWeight: 600 }}>
                  상위 {modal.percentile.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// 리더보드 테이블 컴포넌트
function LeaderboardTable({ data, isDesktop }: { data: LeaderboardItem[]; isDesktop: boolean }) {
  const topData = data.slice(0, 10);

  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: isDesktop ? "20px" : "16px",
      border: "1px solid rgba(255,255,255,0.1)"
    }}>
      <div style={{
        fontSize: isDesktop ? 18 : 16,
        fontWeight: 700,
        color: "#fff",
        marginBottom: 16,
        textAlign: "center"
      }}>
        🏆 Top 10 Rankers
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {topData.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.1)"
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
  );
}

// 지갑 연결 컴포넌트
function WalletConnect({ wallet, onConnect, onDisconnect }: { 
  wallet: string | null; 
  onConnect: () => void; 
  onDisconnect: () => void; 
}) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)",
      borderRadius: 16,
      padding: "20px",
      border: "1px solid rgba(255,255,255,0.1)",
      textAlign: "center"
    }}>
      <div style={{
        fontSize: 18,
        fontWeight: 700,
        color: "#fff",
        marginBottom: 16
      }}>
        💰 Wallet Connection
      </div>

      {wallet ? (
        <div>
          <div style={{
            fontSize: 14,
            color: "#4ade80",
            marginBottom: 12,
            fontFamily: "monospace"
          }}>
            Connected: {wallet}
          </div>
          <button
            onClick={onDisconnect}
            style={{
              padding: "12px 24px",
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 12,
              color: "#ef4444",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 14
            }}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: 14,
            color: "#999",
            marginBottom: 16
          }}>
            Connect your wallet to see your ranking
          </div>
          <button
            onClick={onConnect}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #4ade80, #22c55e)",
              border: "none",
              borderRadius: 12,
              color: "#000",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 14,
              boxShadow: "0 4px 12px rgba(74,222,128,0.3)"
            }}
          >
            Connect Wallet
          </button>
        </div>
      )}
    </div>
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

  // 반응형 계산
  const isDesktop = windowSize.width >= 1024;
  const isMobile = windowSize.width < 768;

  // 데이터 로드 함수
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
          tier: gradeToTierMap[item.grade] || "SIZZLIN_NOOB",
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

  // 지갑 연결 함수들
  const connectWallet = () => {
    const mockAddress = "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6);
    setWallet(mockAddress);
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
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

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const topData = sorted.slice(0, 20);

  // 레이아웃 계산
  let treemapWidth, treemapHeight, sidebarWidth;
  
  if (isMobile) {
    // 모바일: 세로 레이아웃
    treemapWidth = windowSize.width - 16;
    treemapHeight = Math.min(500, windowSize.height * 0.6);
    sidebarWidth = windowSize.width - 16;
  } else if (isDesktop) {
    // 데스크톱: 가로 레이아웃 (트리맵 70%, 사이드바 30%)
    sidebarWidth = Math.min(380, windowSize.width * 0.3);
    treemapWidth = windowSize.width - sidebarWidth - 48;
    treemapHeight = windowSize.height - 120;
  } else {
    // 태블릿: 세로 레이아웃
    treemapWidth = windowSize.width - 32;
    treemapHeight = Math.min(600, windowSize.height * 0.6);
    sidebarWidth = windowSize.width - 32;
  }

  const items = useTreemapLayout(topData, treemapWidth, treemapHeight);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#fff",
      padding: isMobile ? "8px" : "16px"
    }}>
      {/* 헤더 */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: isMobile ? "16px 8px" : "20px 16px",
        marginBottom: 16
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? 24 : 32,
            fontWeight: 900,
            margin: 0,
            background: "linear-gradient(135deg, #4ade80, #22c55e)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            🥩 STAKE Leaderboard
          </h1>
          <p style={{
            fontSize: isMobile ? 14 : 16,
            color: "#999",
            margin: "4px 0 0 0"
          }}>
            Phase 1 • Live Data • Updated {lastUpdate.toLocaleTimeString()}
          </p>
        </div>

        {!isMobile && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            <div style={{
              fontSize: 14,
              color: "#999"
            }}>
              Phase Ends In: <span style={{ color: "#4ade80", fontWeight: 700 }}>13d 4h 22m</span>
            </div>
            
            {wallet ? (
              <button
                onClick={disconnectWallet}
                style={{
                  padding: "8px 16px",
                  background: "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 12,
                  color: "#ef4444",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                {wallet}
              </button>
            ) : (
              <button
                onClick={connectWallet}
                style={{
                  padding: "8px 16px",
                  background: "linear-gradient(135deg, #4ade80, #22c55e)",
                  border: "none",
                  borderRadius: 12,
                  color: "#000",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                Connect Wallet
              </button>
            )}
          </div>
        )}
      </header>

      {/* 메인 컨텐츠 */}
      <main style={{
        display: "flex",
        flexDirection: isDesktop ? "row" : "column",
        gap: 16,
        maxWidth: "100%"
      }}>
        {/* 트리맵 섹션 */}
        <section style={{
          flex: isDesktop ? "1" : "none",
          order: isMobile ? 2 : 1
        }}>
          <div style={{
            background: "rgba(255,255,255,0.03)",
            borderRadius: 16,
            padding: 16,
            border: "1px solid rgba(255,255,255,0.1)",
            position: "relative",
            width: treemapWidth,
            height: treemapHeight,
            overflow: "hidden"
          }}>
            <div style={{
              fontSize: 18,
              fontWeight: 700,
              marginBottom: 16,
              textAlign: "center"
            }}>
              🔥 Top 20 Allocation Map
            </div>

            <div style={{
              position: "relative",
              width: treemapWidth - 32,
              height: treemapHeight - 60
            }}>
              {items.map((d, i) => {
                const item = d.data as LeaderboardItem;
                const boxWidth = d.x1 - d.x0 - 2;
                const boxHeight = d.y1 - d.y0 - 2;
                const isTiny = boxWidth < 60 || boxHeight < 40;
                
                return (
                  <div
                    key={i}
                    onClick={() => setModal(item)}
                    style={{
                      position: "absolute",
                      left: d.x0,
                      top: d.y0,
                      width: Math.max(20, boxWidth),
                      height: Math.max(20, boxHeight),
                      background: tierColors[item.grade] || tierColors["Sizzlin' Noob"],
                      borderRadius: 8,
                      padding: isTiny ? "4px" : "8px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      fontSize: isTiny ? 10 : 12,
                      fontWeight: 700,
                      color: "#1a1a1a",
                      border: "1px solid rgba(255,255,255,0.2)",
                      transition: "all 0.2s",
                      overflow: "hidden"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)";
                      e.currentTarget.style.zIndex = "10";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                      e.currentTarget.style.zIndex = "1";
                    }}
                  >
                    {!isTiny && (
                      <>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginBottom: 4
                        }}>
                          <span style={{ fontSize: 14 }}>{getRankBadge(item.rank)}</span>
                          <span style={{ fontSize: 10, opacity: 0.8 }}>#{item.rank}</span>
                        </div>
                        
                        <div style={{
                          fontSize: boxWidth < 100 ? 10 : 11,
                          fontWeight: 600,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                          whiteSpace: "nowrap"
                        }}>
                          {item.name}
                        </div>
                      </>
                    )}
                    
                    <div style={{
                      fontSize: isTiny ? 10 : 14,
                      fontWeight: 900,
                      textAlign: "center",
                      color: "#1a1a1a"
                    }}>
                      {item.value.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 사이드바 */}
        <aside style={{
          width: isDesktop ? sidebarWidth : "100%",
          order: isMobile ? 1 : 2,
          display: "flex",
          flexDirection: "column",
          gap: 16
        }}>
          {/* 지갑 연결 (모바일에서만) */}
          {isMobile && (
            <WalletConnect 
              wallet={wallet} 
              onConnect={connectWallet} 
              onDisconnect={disconnectWallet} 
            />
          )}

          {/* 리더보드 테이블 */}
          <LeaderboardTable data={sorted} isDesktop={isDesktop} />

          {/* 통계 정보 */}
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
              textAlign: "center"
            }}>
              📊 Phase 1 Stats
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Total Participants:</span>
                <span style={{ fontWeight: 700 }}>{data.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Phase Reward:</span>
                <span style={{ fontWeight: 700 }}>41.67M STAKE</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#999" }}>Time Remaining:</span>
                <span style={{ fontWeight: 700, color: "#4ade80" }}>13d 4h 22m</span>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* 모달 */}
      {modal && (
        <SimpleModal
          modal={modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}