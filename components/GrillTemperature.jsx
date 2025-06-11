import React, { useState, useEffect } from 'react';

const GrillTemperature = ({
  userData,
  isMobile = false
}) => {
  const [showTempInfo, setShowTempInfo] = useState(false);

  // 🔥 실데이터 기반 온도 계산
  const grill_temperature = userData?.grill_temperature || 0;
  const score_per_second = userData?.score_per_second || 0;
  const predicted_next_tier = userData?.predicted_next_tier || 'Sizzlin\' Noob';

  // 온도 0일 때 처리
  const tempColor = grill_temperature === 0 ? "#666666" :  // 회색
    grill_temperature >= 800 ? "#ff0000" :
      grill_temperature >= 600 ? "#ff4500" :
        grill_temperature >= 500 ? "#ffa500" :
          grill_temperature >= 300 ? "#ffff00" :
            grill_temperature >= 100 ? "#87ceeb" : "#4169e1";

  const flameIntensity = grill_temperature === 0 ? 0 :  // 불꽃 없음
    grill_temperature >= 800 ? 1.0 :
      grill_temperature >= 600 ? 0.8 :
        grill_temperature >= 400 ? 0.6 :
          grill_temperature >= 200 ? 0.4 : 0.2;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,69,0,0.15), rgba(255,140,0,0.1))',
      border: `2px solid ${tempColor}40`,
      borderRadius: isMobile ? 16 : 20,
      padding: isMobile ? 16 : 20,
      marginBottom: isMobile ? 16 : 24,
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background glow effect */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `radial-gradient(circle at 30% 70%, ${tempColor}20, transparent 60%)`,
        pointerEvents: 'none',
        opacity: flameIntensity
      }} />

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: isMobile ? 16 : 20,
        position: 'relative',
        zIndex: 2
      }}>
        <h2 style={{
          fontSize: isMobile ? 16 : 18,
          fontWeight: 800,
          color: '#fff',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          🌡️ Grill Temperature
        </h2>

        <button
          onClick={() => setShowTempInfo(!showTempInfo)}
          style={{
            background: 'rgba(255,69,0,0.2)',
            border: '1px solid rgba(255,69,0,0.5)',
            borderRadius: 6,
            color: '#ff4500',
            fontSize: 10,
            fontWeight: 600,
            padding: '4px 8px',
            cursor: 'pointer'
          }}
        >
          ℹ️ Info
        </button>
      </div>

      {/* Main display - horizontal layout */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 2,
        marginBottom: isMobile ? 16 : 20
      }}>
        {/* Larger circular gauge */}
        <div style={{
          position: 'relative',
          width: isMobile ? 100 : 120,
          height: isMobile ? 100 : 120,
          flexShrink: 0
        }}>
          <svg width="100%" height="100%">
            <circle
              cx="50%"
              cy="50%"
              r={isMobile ? 40 : 50}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="6"
            />
            <circle
              cx="50%"
              cy="50%"
              r={isMobile ? 40 : 50}
              fill="none"
              stroke={tempColor}
              strokeWidth="6"
              strokeDasharray={`${(grill_temperature / 1000) * 314} 314`}
              strokeLinecap="round"
              transform={`rotate(-90 ${isMobile ? 50 : 60} ${isMobile ? 50 : 60})`}
              style={{
                filter: `drop-shadow(0 0 8px ${tempColor})`,
                transition: 'stroke-dasharray 1s ease-out'
              }}
            />
          </svg>

          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? 20 : 24,
              fontWeight: 900,
              color: tempColor,
              fontFamily: 'monospace',
              textShadow: `0 0 10px ${tempColor}`
            }}>
              {grill_temperature}°F
            </div>
          </div>
        </div>

        {/* Temperature info */}
        
        <div style={{ flex: 1, marginLeft: 20 }}>
          <div style={{
            fontSize: isMobile ? 14 : 16,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8
          }}>
            {grill_temperature === 0 ? '🥶 Cold Grill' : '🔥 Total Firepower'}
          </div>
          <div style={{
            fontSize: isMobile ? 18 : 22,
            fontWeight: 900,
            color: tempColor,
            fontFamily: 'monospace',
            marginBottom: 4
          }}>
            {score_per_second.toFixed(2)} pts/sec
          </div>
          <div style={{
            fontSize: isMobile ? 10 : 11,
            color: grill_temperature === 0 ? '#666' : '#999'
          }}>
            {grill_temperature === 0 ? 'START STAKING' : 'TOTAL'}
          </div>
        </div>

        {/* Real vs Event breakdown - moved to right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          minWidth: isMobile ? 120 : 140
        }}>
          <div style={{
            background: 'rgba(74,222,128,0.1)',
            border: '1px solid rgba(74,222,128,0.3)',
            borderRadius: 6,
            padding: isMobile ? 6 : 8,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? 9 : 10,
              color: '#4ade80',
              marginBottom: 2,
              fontWeight: 600
            }}>
              stSTAKE
            </div>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 900,
              color: '#4ade80',
              fontFamily: 'monospace'
            }}>
              {score_per_second.toFixed(2)}
            </div>
          </div>

          <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 6,
            padding: isMobile ? 6 : 8,
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: isMobile ? 9 : 10,
              color: '#f59e0b',
              marginBottom: 2,
              fontWeight: 600
            }}>
              Referral
            </div>
            <div style={{
              fontSize: isMobile ? 12 : 14,
              fontWeight: 900,
              color: '#f59e0b',
              fontFamily: 'monospace'
            }}>
              {(userData?.referral_bonus_earned || 0).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Next Phase Prediction */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: isMobile ? 12 : 16,
        position: 'relative',
        zIndex: 2
      }}>
        <h4 style={{
          fontSize: isMobile ? 12 : 14,
          fontWeight: 700,
          color: '#ccc',
          margin: '0 0 12px 0',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          👑 Next Phase Prediction
        </h4>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12
        }}>
          <div style={{
            width: isMobile ? 40 : 50,
            height: isMobile ? 40 : 50,
            background: 'radial-gradient(circle, rgba(156,163,175,0.4), rgba(156,163,175,0.1))',
            border: '2px solid #9ca3af',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: isMobile ? 16 : 20,
            flexShrink: 0
          }}>
            🆕
          </div>

          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 800,
              color: '#fff',
              marginBottom: 4
            }}>
              {predicted_next_tier}
            </div>
            <div style={{
              fontSize: isMobile ? 10 : 11,
              color: '#999'
            }}>
              Based on current grill temperature
            </div>
          </div>

          <div style={{
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: 8,
            padding: isMobile ? 8 : 10,
            maxWidth: isMobile ? 120 : 150
          }}>
            <div style={{
              fontSize: isMobile ? 10 : 11,
              color: '#fbbf24',
              fontWeight: 600,
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4
            }}>
              💡 Tip:
            </div>
            <div style={{
              fontSize: isMobile ? 9 : 10,
              color: '#fbbf24',
              lineHeight: 1.3
            }}>
              Higher grill temperature = Better tier position in next phase. Keep your temperature above 500°F for optimal results!
            </div>
          </div>
        </div>
      </div>

      {/* 🆕 원본 스타일 온도 정보 모달 */}
      {showTempInfo && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
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
            padding: isMobile ? 20 : 32,
            maxWidth: isMobile ? '90vw' : 500,
            width: '100%',
            border: '2px solid rgba(255,69,0,0.3)'
          }}>
            {/* 헤더 */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20
            }}>
              <h3 style={{
                fontSize: isMobile ? 18 : 22,
                fontWeight: 800,
                color: '#ff4500',
                margin: 0
              }}>
                🌡️ Temperature Zones
              </h3>

              <button
                onClick={() => setShowTempInfo(false)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: '#fff',
                  fontSize: 18,
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ×
              </button>
            </div>

            {/* 온도 구간 정보 */}
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: 12,
              padding: 16
            }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  fontSize: isMobile ? 14 : 16,
                  color: '#fff',
                  fontWeight: 700,
                  marginBottom: 12
                }}>
                  Temperature Performance Zones
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { range: '800-1000°F', zone: 'Elite Zone', desc: 'Top 1-5%', color: '#ff0000' },
                    { range: '500-800°F', zone: 'Perfect Zone', desc: 'Top 10-50%', color: '#ffa500' },
                    { range: '200-500°F', zone: 'Active Zone', desc: 'Top 50-80%', color: '#87ceeb' },
                    { range: '0-200°F', zone: 'Starting Zone', desc: 'Getting Started', color: '#4169e1' }
                  ].map((zone, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: 8,
                      border: `1px solid ${zone.color}40`
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12
                      }}>
                        <div style={{
                          width: 12,
                          height: 12,
                          background: zone.color,
                          borderRadius: '50%',
                          boxShadow: `0 0 8px ${zone.color}`
                        }} />
                        <div>
                          <div style={{
                            fontSize: isMobile ? 12 : 14,
                            fontWeight: 700,
                            color: zone.color
                          }}>
                            {zone.range}
                          </div>
                          <div style={{
                            fontSize: isMobile ? 10 : 12,
                            color: '#ccc'
                          }}>
                            {zone.zone}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: isMobile ? 11 : 13,
                        color: '#999',
                        fontWeight: 600
                      }}>
                        {zone.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 현재 상태 */}
              <div style={{
                padding: 12,
                background: `linear-gradient(135deg, ${tempColor}20, ${tempColor}10)`,
                borderRadius: 8,
                border: `1px solid ${tempColor}40`,
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: isMobile ? 11 : 12,
                  color: tempColor,
                  fontWeight: 600,
                  marginBottom: 4
                }}>
                  🔥 Your Current Temperature
                </div>
                <div style={{
                  fontSize: isMobile ? 18 : 24,
                  fontWeight: 900,
                  color: tempColor,
                  fontFamily: 'monospace'
                }}>
                  {grill_temperature}°F
                </div>
                <div style={{
                  fontSize: isMobile ? 10 : 11,
                  color: '#ccc',
                  marginTop: 4
                }}>
                  {grill_temperature >= 800 ? 'Elite Zone' :
                    grill_temperature >= 500 ? 'Perfect Zone' :
                      grill_temperature >= 200 ? 'Active Zone' : 'Starting Zone'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GrillTemperature;