import { useState } from "react";
import { CONSTANTS } from './constants';

interface SidebarItemProps {
  icon: string;
  text: string;
  isActive?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  collapsed?: boolean;
}

function SidebarItem({ 
  icon, 
  text, 
  isActive = false, 
  onClick, 
  disabled = false,
  collapsed = false 
}: SidebarItemProps) {
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  isMobile: boolean;
  isDesktop: boolean;
}

export function Sidebar({ 
  isOpen, 
  onClose, 
  wallet, 
  onConnectWallet, 
  onDisconnectWallet,
  currentPage,
  onPageChange,
  isMobile,
  isDesktop 
}: SidebarProps) {
  const sidebarWidth = isMobile ? `${CONSTANTS.SIDEBAR_WIDTH_MOBILE}px` : isDesktop ? `${CONSTANTS.SIDEBAR_WIDTH_DESKTOP}px` : `${CONSTANTS.SIDEBAR_WIDTH_MOBILE}px`;
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