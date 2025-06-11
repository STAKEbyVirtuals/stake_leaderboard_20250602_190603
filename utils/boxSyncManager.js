// utils/boxSyncManager.js
export class BoxSyncManager {
  constructor(webAppUrl, userAddress) {
    this.webAppUrl = webAppUrl;
    this.userAddress = userAddress;
    this.syncQueue = [];
    this.syncInterval = null;
    this.isSyncing = false;
  }
  
  // 상자 기록 추가
  recordBox(boxData) {
    const record = {
      timestamp: Date.now(),
      type: boxData.type,
      boxMultiplier: boxData.boxMultiplier,
      userMultiplier: boxData.userMultiplier,
      points: boxData.points
    };
    
    this.syncQueue.push(record);
    
    // 로컬 총합 업데이트
    this.updateLocalTotal(boxData.points);
    
    // 10개 쌓이면 즉시 동기화
    if (this.syncQueue.length >= 10) {
      this.syncNow();
    }
    
    return record;
  }
  
  // 로컬 총합 관리
  updateLocalTotal(points) {
    const key = `boxTotalPoints_${this.userAddress}`;
    const current = parseFloat(localStorage.getItem(key) || 0);
    const newTotal = current + points;
    localStorage.setItem(key, newTotal);
    
    // 이벤트 발생
    window.dispatchEvent(new CustomEvent('boxPointsUpdated', {
      detail: { 
        address: this.userAddress,
        newPoints: points,
        totalPoints: newTotal 
      }
    }));
  }
  
  // 즉시 동기화
  async syncNow() {
    if (this.isSyncing || this.syncQueue.length === 0) return;
    
    this.isSyncing = true;
    const itemsToSync = [...this.syncQueue];
    this.syncQueue = [];
    
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'box_sync',
          address: this.userAddress,
          boxes: itemsToSync
        })
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        console.log(`✅ ${result.synced}개 상자 동기화 완료`);
        
        // 동기화 성공 표시
        this.markSynced(itemsToSync);
      } else {
        // 실패시 다시 큐에 추가
        this.syncQueue.unshift(...itemsToSync);
        console.error('❌ 동기화 실패:', result.message);
      }
    } catch (error) {
      console.error('❌ 동기화 오류:', error);
      this.syncQueue.unshift(...itemsToSync);
    } finally {
      this.isSyncing = false;
    }
  }
  
  // 동기화 완료 표시
  markSynced(items) {
    const historyKey = `boxHistory_${this.userAddress}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    items.forEach(item => {
      const found = history.find(h => 
        h.timestamp === item.timestamp && h.type === item.type
      );
      if (found) {
        found.synced = true;
      }
    });
    
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
  
  // 자동 동기화 시작
  startAutoSync() {
    // 10분마다 동기화
    this.syncInterval = setInterval(() => {
      this.syncNow();
    }, 10 * 60 * 1000);
    
    // 페이지 떠날 때 동기화
    window.addEventListener('beforeunload', () => {
      this.syncNow();
    });
  }
  
  // 정리
  cleanup() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncNow(); // 마지막 동기화
  }
}