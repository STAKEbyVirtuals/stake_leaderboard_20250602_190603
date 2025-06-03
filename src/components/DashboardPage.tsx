import { LeaderboardItem } from './types';
import { tierColors, CONSTANTS } from './constants';
import { getRankBadge, formatCurrency } from './utils';

interface DashboardPageProps {
  data: LeaderboardItem[];
  wallet: string | null;
}

export function DashboardPage({ data, wallet }: DashboardPageProps) {
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

  const allocatedStake = (myData.value / 100) * CONSTANTS.TOTAL_PHASE_REWARD;
  const allocatedVirtual = allocatedStake * CONSTANTS.VIRTUAL_RATE;
  const dollarValue = allocatedStake * CONSTANTS.STAKE_PRICE;

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
            ≈ ${formatCurrency(dollarValue)}
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