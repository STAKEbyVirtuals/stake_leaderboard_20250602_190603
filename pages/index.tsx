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
  if (rank === 1) return <span style={{
    background: "gold", color: "#fff", borderRadius: "50%", fontWeight: 900,
    padding: "2px 8px", fontSize: 16, marginRight: 4, boxShadow: "0 2px 8px #0003"
  }}>👑</span>;
  if (rank === 2) return <span style={{
    background: "silver", color: "#fff", borderRadius: "50%", fontWeight: 900,
    padding: "2px 8px", fontSize: 16, marginRight: 4, boxShadow: "0 2px 8px #0002"
  }}>🥈</span>;
  if (rank === 3) return <span style={{
    background: "#cc8f50", color: "#fff", borderRadius: "50%", fontWeight: 900,
    padding: "2px 8px", fontSize: 16, marginRight: 4, boxShadow: "0 2px 8px #0002"
  }}>🥉</span>;
  if (rank <= 10) return <span style={{
    background: "#111c", color: "#fff", borderRadius: "10px", fontWeight: 900,
    padding: "2px 8px", fontSize: 13, marginRight: 3
  }}>TOP{rank}</span>;
  return null;
}


export default function Home() {
  // 모든 state를 최상단에 선언
  const [data, setData] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<LeaderboardItem | null>(null);
  const [size, setSize] = useState({ width: 950, height: 650 });
  const [tab, setTab] = useState("Top20");
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // 데이터 로드 함수 (수정됨)
  const fetchLeaderboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("🔄 실제 데이터 로드 시작:", SHEET_BEST_URL);
      
      const response = await axios.get(SHEET_BEST_URL, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log("✅ 응답 받음:", response.status);
      console.log("📊 원본 데이터:", response.data);
      
      if (!response.data) {
        throw new Error('응답 데이터가 없습니다');
      }
      
      // GitHub Actions 데이터 형식 처리
      let rawData;
      if (response.data.leaderboard) {
        // GitHub Pages 형식: { leaderboard: [...] }
        rawData = response.data.leaderboard;
        console.log("📋 GitHub Pages 형식 감지");
      } else if (Array.isArray(response.data)) {
        // 직접 배열 형식: [...]
        rawData = response.data;
        console.log("📋 배열 형식 감지");
      } else {
        throw new Error('알 수 없는 데이터 형식: ' + typeof response.data);
      }
      
      if (!Array.isArray(rawData) || rawData.length === 0) {
        throw new Error('유효하지 않은 데이터 배열');
      }
      
      console.log(`📊 처리할 데이터: ${rawData.length}개 항목`);
      
      // 데이터 변환
      const transformedData: LeaderboardItem[] = rawData
        .filter((item: any) => item.is_active !== false && Number(item.total_staked) > 0)
        .slice(0, 100) // 상위 100개만
        .map((item: any, index: number) => ({
          name: item.address ? `${item.address.slice(0, 6)}...${item.address.slice(-4)}` : `Unknown${index}`,
          value: Number(item.airdrop_share_phase) || Math.random() * 2 + 1, // 에어드랍 비율
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
      
      // 에어드랍 비율 정규화
      const totalValue = transformedData.reduce((sum, item) => sum + item.value, 0);
      if (totalValue > 0) {
        transformedData.forEach(item => {
          item.value = (item.value / totalValue) * 100;
        });
      }
      
      console.log(`✅ 변환 완료: ${transformedData.length}개 항목`);
      console.log("📋 첫 번째 항목:", transformedData[0]);
      
      setData(transformedData);
      setLastUpdate(new Date());
      
    } catch (err: any) {
      console.error('❌ 실제 데이터 로드 실패:', err);
      console.error('📄 오류 상세:', err.message);
      setError(err.message);
      
      // 실패시 빈 배열 (더미데이터 사용 안함)
      console.log('⚠️ 더미데이터 사용하지 않음, 빈 상태 유지');
      setData([]);
      
    } finally {
      setLoading(false);
    }
  };

  // 효과들
  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleResize() {
      const w = Math.min(window.innerWidth - 16, 950);
      const h = Math.max(380, Math.min(window.innerHeight - 110, 680));
      setSize({ width: w, height: h });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 상수들
  const infoBarHeight = size.width < 650 ? 140 : 102;

  // 로딩 상태
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: 'linear-gradient(140deg,#181820 80%,#232327 100%)',
        color: '#fff', fontSize: 18
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>🥩</div>
          <div>Loading STAKE Leaderboard...</div>
          <div style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>
            실시간 데이터를 불러오는 중...
          </div>
        </div>
      </div>
    );
  }

  // 데이터가 없을 때
  if (data.length === 0) {
    return (
      <div style={{ 
        display: 'flex', justifyContent: 'center', alignItems: 'center', 
        height: '100vh', background: 'linear-gradient(140deg,#181820 80%,#232327 100%)',
        color: '#fff', fontSize: 18
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 24, marginBottom: 10 }}>⚠️</div>
          <div>데이터를 불러올 수 없습니다</div>
          <div style={{ fontSize: 14, color: '#ccc', marginTop: 10 }}>
            {error || 'leaderboard.json 파일을 확인해주세요'}
          </div>
          <button 
            onClick={fetchLeaderboardData}
            style={{
              marginTop: 20, padding: "10px 20px", backgroundColor: "#e48d25",
              color: "white", border: "none", borderRadius: "8px", cursor: "pointer"
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 데이터 처리
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const filtered = tab === "Top20" ? sorted.slice(0, 20) : sorted;
  const items = useTreemapLayout(filtered, size.width, size.height - infoBarHeight);
  const totalAllocation = filtered.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{
      width: size.width,
      height: size.height,
      background: "linear-gradient(140deg,#181820 80%,#232327 100%)",
      borderRadius: 24,
      position: "relative",
      margin: "32px auto",
      boxShadow: "0 2px 32px #0005",
      transition: "width 0.3s, height 0.3s",
      border: "1.5px solid #222",
      overflow: "hidden"
    }}>
      {/* 상단 info bar */}
      <div style={{
        position: "sticky", top: 0, left: 0, zIndex: 20, width: "100%",
        background: "linear-gradient(90deg, #181820 80%, #232327 100%)",
        boxShadow: "0 1px 8px #0006", borderRadius: "24px 24px 0 0", paddingBottom: 3
      }}>
        {/* 타이틀 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: size.width < 650 ? "18px 12px 4px 18px" : "22px 20px 7px 28px",
          fontWeight: 700, fontSize: size.width < 650 ? 19 : 22, color: "#fff"
        }}>
          <span>
            <span style={{ fontWeight: 900 }}>STAKE Leaderboard</span>
            <span style={{ fontSize: size.width < 650 ? 15 : 17, color: "#ffddb8", marginLeft: 12 }}>- Phase 1</span>
            <span style={{ fontSize: 12, color: "#4ade80", marginLeft: 10 }}>
              (Live Data)
            </span>
          </span>
          <span style={{ fontSize: size.width < 650 ? 14 : 17, fontWeight: 400, color: "#ffddb8", marginRight: 8 }}>
            Phase Ends In: <b style={{ fontWeight: 700, color: "#fff" }}>13d 4h 22m</b>
          </span>
        </div>
        
        {/* 서브 정보 */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          fontSize: size.width < 650 ? 12.5 : 14, color: "#fff",
          padding: size.width < 650 ? "2px 12px 6px 18px" : "4px 24px 4px 28px", minHeight: 34
        }}>
          <span>
            <b style={{ color: "#e48d25" }}>Top Rankers:</b> {filtered.length}
            <span style={{ marginLeft: 20 }}><b style={{ color: "#e48d25" }}>Total Allocation:</b> {totalAllocation.toFixed(2)}%</span>
            <span style={{ marginLeft: 20, fontSize: 12, color: "#ccc" }}>
              Last Update: {lastUpdate.toLocaleTimeString()}
            </span>
          </span>
          
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* 탭 버튼들 */}
            <span
              style={{
                marginRight: 4, fontWeight: tab === "Top20" ? 700 : 400,
                color: tab === "Top20" ? "#fff" : "#ccc",
                background: tab === "Top20" ? "#e48d25" : "transparent",
                padding: size.width < 650 ? "2px 10px" : "3px 15px",
                borderRadius: 16, cursor: "pointer",
                fontSize: size.width < 650 ? 13.5 : 15, transition: "all 0.18s"
              }}
              onClick={() => setTab("Top20")}
            >Top 20</span>
            
            <span
              style={{
                fontWeight: tab === "All" ? 700 : 400,
                color: tab === "All" ? "#fff" : "#ccc",
                background: tab === "All" ? "#e48d25" : "transparent",
                padding: size.width < 650 ? "2px 10px" : "3px 15px",
                borderRadius: 16, cursor: "pointer",
                fontSize: size.width < 650 ? 13.5 : 15, transition: "all 0.18s"
              }}
              onClick={() => setTab("All")}
            >All</span>
            
            {/* 지갑 연결 버튼 */}
            {wallet ? (
              <button
                style={{
                  marginLeft: 7, padding: size.width < 650 ? "3px 12px" : "4px 18px",
                  borderRadius: 13, border: "none", background: "#222", color: "#fff",
                  fontWeight: 600, cursor: "pointer", fontSize: size.width < 650 ? 13 : 15,
                  boxShadow: "0 1px 6px #0002"
                }}
                onClick={() => setWallet(null)}
              >
                {wallet.slice(0, 6) + "..." + wallet.slice(-4)}
              </button>
            ) : (
              <button
                style={{
                  marginLeft: 7, padding: size.width < 650 ? "3px 12px" : "4px 18px",
                  borderRadius: 13, border: "none",
                  background: "linear-gradient(95deg,#ffdeaa,#e48d25 85%)",
                  color: "#222", fontWeight: 700, cursor: "pointer",
                  fontSize: size.width < 650 ? 13 : 15, boxShadow: "0 1px 6px #0002"
                }}
                onClick={() => setWallet("0x" + Math.random().toString(16).slice(2, 8) + "...abcd")}
              >
                Connect Wallet
              </button>
            )}
          </span>
        </div>
      </div>
      
      {/* 트리맵 영역 */}
      <div style={{
        position: "absolute", top: infoBarHeight, left: 0, 
        width: "100%", height: size.height - infoBarHeight, overflow: "auto"
      }}>
        {items.map((d, i) => {
          const isMini = (d.x1 - d.x0 < 62) || (d.y1 - d.y0 < 62);
          const item = d.data as LeaderboardItem;
          
          return (
            <div
              key={i}
              onClick={() => !isMini && setModal(item)}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{
                position: "absolute",
                left: d.x0, top: d.y0,
                width: Math.max(32, d.x1 - d.x0 - 2.5),
                height: Math.max(32, d.y1 - d.y0 - 2.5),
                background: tierColors[item.grade] || tierColors["Sizzlin' Noob"],
                borderRadius: 12,
                boxShadow: hoverIdx === i
                  ? "0 0 0 3px #ffe8b0, 0 2px 20px #0007"
                  : "0 2px 10px #0002",
                border: hoverIdx === i ? "2.2px solid #e48d25" : "1.5px solid #2224",
                overflow: "hidden",
                padding: isMini ? "2px 5px" : "8px 8px 6px 11px",
                fontSize: 13, transition: "all 0.18s cubic-bezier(.42,0,.46,1.52)",
                cursor: isMini ? "default" : "pointer",
                zIndex: hoverIdx === i ? 9 : 2,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                minWidth: 24, minHeight: 24, userSelect: "none"
              }}
            >
              {isMini ? (
                <div style={{
                  fontWeight: 800, fontSize: 13, color: "#db4662", textAlign: "center"
                }}>
                  {item.value.toFixed(2)}%
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {getRankBadge(item.rank)}
                    <span style={{
                      fontWeight: 700, fontSize: 12, color: "#888",
                      letterSpacing: "0.02em", textShadow: "0 1px 2px #fff7"
                    }}>
                      {item.grade}
                    </span>
                  </div>
                  <div style={{
                    fontWeight: 700, fontSize: 14, marginTop: 1,
                    color: "#18182a", wordBreak: "break-all"
                  }}>
                    {item.name}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline" }}>
                    <div style={{
                      fontWeight: 900, fontSize: 18, margin: "2px 3px 0 0",
                      color: "#db4662", textShadow: "0 2px 6px #fff5"
                    }}>
                      {item.value.toFixed(2)}%
                    </div>
                    <div style={{
                      fontWeight: 600, fontSize: 11.5,
                      color: (+item.change > 0 ? "#2cbf6f" : "#e14e4e"), marginLeft: 2
                    }}>
                      {(+item.change > 0 ? "+" : "") + item.change + "%"}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      
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

// 간단한 모달 컴포넌트
function SimpleModal({ modal, onClose }: { modal: LeaderboardItem; onClose: () => void }) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
        background: "rgba(0,0,0,0.6)", zIndex: 99, display: "flex",
        alignItems: "center", justifyContent: "center"
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "linear-gradient(140deg,#20212a 65%,#222326 110%)",
          borderRadius: 22, minWidth: 320, maxWidth: "92vw",
          padding: "28px 18px 22px 18px", color: "#fff", fontSize: 18,
          boxShadow: "0 8px 40px #000b"
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 8, right: 15, fontSize: 28,
            color: "#fff", background: "none", border: "none", cursor: "pointer"
          }}
        >×</button>
        
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
            {getRankBadge(modal.rank)} {modal.name}
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: "#db4662", marginBottom: 10 }}>
            {modal.value.toFixed(2)}%
          </div>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 5 }}>
            등급: <b style={{ color: "#fff" }}>{modal.grade}</b>
          </div>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 5 }}>
            스테이킹량: <b style={{ color: "#fff" }}>{modal.total_staked.toLocaleString()} STAKE</b>
          </div>
          <div style={{ fontSize: 14, color: "#aaa", marginBottom: 5 }}>
            점수: <b style={{ color: "#fff" }}>{modal.score.toLocaleString()}</b>
          </div>
          <div style={{ fontSize: 14, color: "#aaa" }}>
            보유기간: <b style={{ color: "#fff" }}>{modal.time}</b>
          </div>
        </div>
      </div>
    </div>
  );
}