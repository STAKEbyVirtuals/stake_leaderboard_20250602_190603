import { useState } from "react";
import { Sidebar } from './Sidebar';
import { CONSTANTS } from './constants';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  wallet: string | null;
  onConnectWallet: () => void;
  onDisconnectWallet: () => void;
  isMobile: boolean;
  isDesktop: boolean;
}

export function Layout({ 
  children, 
  currentPage, 
  onPageChange,
  wallet,
  onConnectWallet,
  onDisconnectWallet,
  isMobile,
  isDesktop 
}: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarWidth = isDesktop ? CONSTANTS.SIDEBAR_WIDTH_DESKTOP : 0;

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