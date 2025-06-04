import { LeaderboardItem } from './types';
import { TreemapBox } from './TreemapBox';
import { useTreemapLayout } from './treemapUtils';
import { getRankBadge } from './utils';

interface LeaderboardPageProps {
  data: LeaderboardItem[];
  modal: LeaderboardItem | null;
  setModal: (item: LeaderboardItem | null) => void;
  isMobile: boolean;
  isDesktop: boolean;
}

export function LeaderboardPage({ data, modal, setModal, isMobile, isDesktop }: LeaderboardPageProps) {
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