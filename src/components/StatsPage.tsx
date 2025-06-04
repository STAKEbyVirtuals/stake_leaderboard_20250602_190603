import { LeaderboardItem } from './types';
import { formatNumber } from './utils';

interface StatsPageProps {
  data: LeaderboardItem[];
}

export function StatsPage({ data }: StatsPageProps) {
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
            {formatNumber(totalStaked)}
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
            {formatNumber(avgStake)}
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