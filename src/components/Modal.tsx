import { useEffect } from "react";
import { LeaderboardItem } from './types';
import { tierColors, CONSTANTS } from './constants';
import { getRankBadge, formatCurrency } from './utils';

interface ModalProps {
  modal: LeaderboardItem;
  onClose: () => void;
}

export function Modal({ modal, onClose }: ModalProps) {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [onClose]);

  const allocatedStake = (modal.value / 100) * CONSTANTS.TOTAL_PHASE_REWARD;
  const allocatedVirtual = allocatedStake * CONSTANTS.VIRTUAL_RATE;
  const dollarValue = allocatedStake * CONSTANTS.STAKE_PRICE;

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
                  ≈ ${formatCurrency(dollarValue)}
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