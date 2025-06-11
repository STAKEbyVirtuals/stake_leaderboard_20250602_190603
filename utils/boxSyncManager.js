// utils/boxSyncManager.js
// STAKE 프로젝트 상자 백엔드 동기화 시스템

export class BoxSyncManager {
  constructor(webAppUrl, userAddress) {
    this.webAppUrl = webAppUrl;
    this.userAddress = userAddress;
    this.syncQueue = [];
    this.syncInterval = null;
    this.isSyncing = false;

    // 🆕 초기화 시 localStorage에서 큐 복원
    this.loadQueueFromStorage();
  }
  // 🆕 localStorage에서 큐 로드
  loadQueueFromStorage() {
    const savedQueue = localStorage.getItem(`boxSyncQueue_${this.userAddress}`);
    if (savedQueue) {
      try {
        this.syncQueue = JSON.parse(savedQueue);
        console.log(`📦 복원된 동기화 큐: ${this.syncQueue.length}개 항목`);

        // 복원된 큐가 있으면 즉시 동기화 시도
        if (this.syncQueue.length > 0) {
          setTimeout(() => this.syncNow(), 1000);
        }
      } catch (e) {
        console.error('큐 복원 실패:', e);
        this.syncQueue = [];
      }
    }
  }

  // 🆕 localStorage에 큐 저장
  saveQueueToStorage() {
    localStorage.setItem(`boxSyncQueue_${this.userAddress}`, JSON.stringify(this.syncQueue));
  }

  // 🆕 pending 포인트 계산
  getPendingPoints() {
    return this.syncQueue.reduce((total, item) => total + (item.points || 0), 0);
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

    // 🆕 큐를 localStorage에 저장
    this.saveQueueToStorage();

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
    localStorage.setItem(key, newTotal.toString());

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
      // 🆕 localhost 체크
      const isLocalhost = window.location.hostname === 'localhost';

      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        mode: isLocalhost ? 'no-cors' : 'cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'box_sync',
          address: this.userAddress,
          boxes: itemsToSync
        })
      });

      // 🆕 localhost면 무조건 성공 처리
      if (isLocalhost) {
        console.log(`✅ ${itemsToSync.length}개 상자 동기화 완료 (no-cors mode)`);
        this.markSynced(itemsToSync);
        this.saveQueueToStorage();
        return;
      }

      if (response.ok) {
        const result = await response.json();

        if (result.status === 'success') {
          console.log(`✅ ${result.synced || itemsToSync.length}개 상자 동기화 완료`);

          // 동기화 성공 표시
          this.markSynced(itemsToSync);

          // 🆕 큐를 localStorage에 저장 (비어있는 큐 저장)
          this.saveQueueToStorage();
        } else {
          // 실패시 다시 큐에 추가
          this.syncQueue.unshift(...itemsToSync);
          // 🆕 실패한 큐도 저장
          this.saveQueueToStorage();
          console.error('❌ 동기화 실패:', result.message);
        }
      } else {
        // HTTP 에러시 다시 큐에 추가
        // 실패시 다시 큐에 추가
        this.syncQueue.unshift(...itemsToSync);
        // 🆕 실패한 큐도 저장
        this.saveQueueToStorage();
        console.error('❌ HTTP 에러:', response.status);
      }
    } catch (error) {
      console.error('❌ 동기화 오류:', error);
      // 실패시 다시 큐에 추가
      this.syncQueue.unshift(...itemsToSync);
      // 🆕 실패한 큐도 저장
      this.saveQueueToStorage();
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