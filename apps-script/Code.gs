 // === STAKE Apps Script Web App - 수정된 버전 ===
// Jeeted 완전 제외 + 그릴온도 계산 개선 + 활성 유저만 순위
// ✅ Smoke Flexer 제거 + 7단계 구조 적용 + 상자 시스템 추가

const SHEET_ID = '1xsRKXVYtGuw6KQnl9LIcIqmfXOAtij2art9FjXgA9_Y';
const SHEET_NAME = 'stake_leaderboard_20250602_190603';
const LAUNCH_DATE = new Date('2025-05-27').getTime() / 1000;
const SNAPSHOT_DEADLINE = LAUNCH_DATE + (24 * 60 * 60);
const BOX_CURRENT_SHEET = 'box_current';
const BOX_DAILY_SHEET = 'box_daily';

// ==================== Web App 엔드포인트 ====================

function doPost(e) {
  try {
    console.log('📥 GitHub Action POST 요청 받음');
    
    // JSON 데이터 파싱
    let postData;
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      throw new Error(`JSON 파싱 오류: ${parseError.message}`);
    }
    
    // 🆕 상자 동기화 요청 처리
    if (postData.type === 'box_sync') {
      return processBoxSync(postData);
    }
    
    // 청크 데이터 처리 확인
    if (postData.is_chunk) {
      console.log(`📦 청크 데이터 받음: ${postData.chunk_number}/${postData.total_chunks}`);
      return processChunkData(postData);
    }
    
    console.log(`📊 받은 데이터: ${postData.length}개 항목`);
    
    // 1. 기존 21개 컬럼 시트 업데이트 (순위 재계산 포함)
    const updateResult = updateSheetWithBasicData(postData);
    
    if (!updateResult.success) {
      throw new Error(updateResult.error);
    }
    
    // 2. 39개 컬럼 완전 처리 (신규 18개 컬럼 계산)
    const enhanceResult = processComplete39Columns();
    
    if (!enhanceResult.success) {
      console.warn('⚠️ 39개 컬럼 처리 중 일부 오류:', enhanceResult.error);
    }
    
    // 3. JSON 파일 생성
    generateCompleteJSON();
    
    console.log('✅ 전체 처리 완료');
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'STAKE 데이터 완전 처리 완료',
        basic_columns: updateResult.updatedRows,
        enhanced_columns: enhanceResult.processedRows || 0,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ POST 처리 실패:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    console.log('📤 GET 요청 받음');
    
    const sheet = getTargetSheet();
    const data = getCompleteSheetData(sheet);
    
    console.log(`📊 반환 데이터: ${data.length}개 항목`);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        last_updated: new Date().toISOString(),
        total_rows: data.length,
        columns: 39,
        leaderboard: data
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ GET 처리 실패:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== 상자 시스템 관련 함수들 ====================

// box_current 시트 생성/접근
function getBoxCurrentSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(BOX_CURRENT_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(BOX_CURRENT_SHEET);
    const headers = [
      'address', 'timestamp', 'box_type', 'box_multiplier', 
      'user_multiplier', 'points', 'date_kr'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#e8f0fe');
    
    console.log('📦 box_current 시트 생성 완료');
  }
  
  return sheet;
}

// box_daily 시트 생성/접근
function getBoxDailySheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(BOX_DAILY_SHEET);
  
  if (!sheet) {
    sheet = spreadsheet.insertSheet(BOX_DAILY_SHEET);
    const headers = [
      'address', 'date', 'common_count', 'uncommon_count', 
      'rare_count', 'epic_count', 'unique_count', 
      'legendary_count', 'genesis_count', 'total_points', 'total_boxes'
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#e8f0fe');
    
    console.log('📊 box_daily 시트 생성 완료');
  }
  
  return sheet;
}

// 🎁 상자 동기화 처리
function processBoxSync(data) {
  // 스크립트 전체 잠금 (동시 실행 방지)
  const lock = LockService.getScriptLock();
  
  try {
    // 10초 대기
    lock.waitLock(10000);
    
    console.log(`📦 상자 동기화 시작: ${data.address}`);
    
    const currentSheet = getBoxCurrentSheet();
    const newRows = [];
    const now = new Date();
    const dateKr = Utilities.formatDate(now, 'Asia/Seoul', 'yyyy-MM-dd');
    
    // 데이터 준비
    data.boxes.forEach(box => {
      newRows.push([
        data.address,
        box.timestamp,
        box.type,
        box.boxMultiplier,
        box.userMultiplier,
        box.points,
        dateKr
      ]);
    });
    
    // 한 번에 추가 (원자적 연산)
    if (newRows.length > 0) {
      const lastRow = currentSheet.getLastRow();
      currentSheet.getRange(lastRow + 1, 1, newRows.length, 7).setValues(newRows);
    }
    
    // 일별 집계 업데이트
    updateDailyAggregation(data.address, data.boxes, dateKr);
    
    // 메인 시트 업데이트
    updateMainSheetBoxPoints(data.address);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        synced: newRows.length,
        message: '상자 포인트 저장 완료'
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('❌ 상자 동기화 실패:', error);
    
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } finally {
    // 반드시 잠금 해제
    try {
      lock.releaseLock();
    } catch (e) {
      console.error('Lock 해제 실패:', e);
    }
  }
}

// 📊 일별 집계 실시간 업데이트
function updateDailyAggregation(address, boxes, dateStr) {
  const dailySheet = getBoxDailySheet();
  const data = dailySheet.getDataRange().getValues();
  
  // 해당 주소와 날짜의 행 찾기
  let targetRow = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === address.toLowerCase() && 
        data[i][1] === dateStr) {
      targetRow = i + 1; // 시트는 1부터 시작
      break;
    }
  }
  
  // 없으면 새 행 추가
  if (targetRow === -1) {
    targetRow = dailySheet.getLastRow() + 1;
    dailySheet.getRange(targetRow, 1).setValue(address);
    dailySheet.getRange(targetRow, 2).setValue(dateStr);
    
    // 카운트 초기화
    for (let col = 3; col <= 11; col++) {
      dailySheet.getRange(targetRow, col).setValue(0);
    }
  }
  
  // 상자 타입별 카운트 증가
  const boxTypeColumns = {
    'COMMON': 3,
    'UNCOMMON': 4,
    'RARE': 5,
    'EPIC': 6,
    'UNIQUE': 7,
    'LEGENDARY': 8,
    'GENESIS': 9
  };
  
  let totalNewPoints = 0;
  
  boxes.forEach(box => {
    const col = boxTypeColumns[box.type];
    if (col) {
      const currentCount = dailySheet.getRange(targetRow, col).getValue() || 0;
      dailySheet.getRange(targetRow, col).setValue(currentCount + 1);
    }
    totalNewPoints += box.points;
  });
  
  // 총 포인트와 상자 수 업데이트
  const currentPoints = dailySheet.getRange(targetRow, 10).getValue() || 0;
  const currentBoxes = dailySheet.getRange(targetRow, 11).getValue() || 0;
  
  dailySheet.getRange(targetRow, 10).setValue(currentPoints + totalNewPoints);
  dailySheet.getRange(targetRow, 11).setValue(currentBoxes + boxes.length);
  
  console.log(`📊 일별 집계 업데이트: ${address} - ${dateStr}`);
}

// 🔄 메인 시트 상자 포인트 업데이트
function updateMainSheetBoxPoints(address) {
  const mainSheet = getTargetSheet();
  const dailySheet = getBoxDailySheet();
  
  // 일별 데이터 합산
  const dailyData = dailySheet.getDataRange().getValues();
  let totalPoints = 0, totalBoxes = 0;
  
  for (let i = 1; i < dailyData.length; i++) {
    if (dailyData[i][0].toLowerCase() === address.toLowerCase()) {
      totalPoints += dailyData[i][9] || 0;
      totalBoxes += dailyData[i][10] || 0;
    }
  }
  
  // 유저 행 찾거나 생성
  const userRow = findOrCreateUserRow(mainSheet, address);
  
  // 상자 데이터 업데이트
  mainSheet.getRange(userRow, 35).setValue(totalBoxes);   // AI열
  mainSheet.getRange(userRow, 36).setValue(totalPoints);  // AJ열
}

// 🧹 24시간 이상 된 데이터 정리
function cleanOldCurrentData() {
  try {
    const currentSheet = getBoxCurrentSheet();
    const data = currentSheet.getDataRange().getValues();
    
    if (data.length <= 1) return;
    
    const now = Date.now();
    const cutoffTime = now - (24 * 60 * 60 * 1000); // 24시간 전
    
    let rowsToDelete = [];
    
    // 삭제할 행 찾기 (뒤에서부터)
    for (let i = data.length - 1; i >= 1; i--) {
      const timestamp = data[i][1];
      if (timestamp && timestamp < cutoffTime) {
        rowsToDelete.push(i + 1); // 시트 행 번호는 1부터
      }
    }
    
    // 행 삭제 (뒤에서부터 삭제해야 인덱스가 꼬이지 않음)
    rowsToDelete.forEach(row => {
      currentSheet.deleteRow(row);
    });
    
    if (rowsToDelete.length > 0) {
      console.log(`🧹 ${rowsToDelete.length}개의 오래된 기록 삭제`);
    }
  } catch (error) {
    console.error('❌ 데이터 정리 실패:', error);
  }
}

// 📅 일일 집계 스케줄러 (트리거로 설정)
function dailyMaintenanceTrigger() {
  console.log('📅 일일 유지보수 시작');
  
  // 1. 어제 데이터 최종 집계 확인
  verifyYesterdayAggregation();
  
  // 2. 오래된 current 데이터 정리
  cleanOldCurrentData();
  
  // 3. 통계 리포트
  generateDailyStats();
  
  console.log('✅ 일일 유지보수 완료');
}

// 🧪 상자 시스템 테스트 함수
function testBoxSystem() {
  console.log('🧪 상자 시스템 테스트');
  
  // 테스트 데이터
  const testData = {
    type: 'box_sync',
    address: '0x1234567890abcdef',
    boxes: [
      {
        timestamp: Date.now(),
        type: 'RARE',
        boxMultiplier: 2,
        userMultiplier: 1.25,
        points: 100000
      },
      {
        timestamp: Date.now() - 1000,
        type: 'EPIC',
        boxMultiplier: 3.5,
        userMultiplier: 1.25,
        points: 175000
      }
    ]
  };
  
  const result = processBoxSync(testData);
  console.log('테스트 결과:', result.getContent());
}

// ==================== 시트 접근 함수 ====================

function getTargetSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    if (!sheet) {
      throw new Error(`시트 '${SHEET_NAME}'를 찾을 수 없습니다.`);
    }
    
    console.log(`✅ 시트 접근 성공: ${sheet.getName()}`);
    return sheet;
    
  } catch (error) {
    console.error('❌ 시트 접근 실패:', error);
    throw new Error(`시트 접근 실패: ${error.toString()}`);
  }
}

// ==================== 데이터 처리 함수들 (수정됨) ====================

function findOrCreateUserRow(sheet, address) {
  const data = sheet.getDataRange().getValues();
  
  // 기존 유저 찾기
  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toLowerCase() === address.toLowerCase()) {
      return i + 1;  // 행 번호 반환 (1-based)
    }
  }
  
  // 없으면 새 행 생성
  const lastRow = sheet.getLastRow();
  const newRowNum = lastRow + 1;
  
  // 기본값으로 새 행 생성
  sheet.getRange(newRowNum, 1).setValue(address);
  sheet.getRange(newRowNum, 2).setValue(9999);  // rank
  sheet.getRange(newRowNum, 3).setValue('VIRGEN');  // grade
  sheet.getRange(newRowNum, 4).setValue('🐸');  // emoji
  sheet.getRange(newRowNum, 5).setValue(100.0);  // percentile
  sheet.getRange(newRowNum, 6).setValue(0);  // total_staked
  
  return newRowNum;
}

function updateSheetWithBasicData(dataArray) {
  try {
    const sheet = getTargetSheet();
    
    if (!dataArray || dataArray.length === 0) {
      return { success: false, error: '빈 데이터 배열' };
    }
    
    console.log('📝 기존 21개 컬럼 업데이트 시작 (Jeeted 제외 로직 적용)');
    
    // 39개 컬럼 헤더 확인/생성
    ensure39ColumnHeaders(sheet);
    
    // 기존 데이터 삭제 (헤더 제외)
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    
    // 🔥 수정: Jeeted 처리 및 활성 유저만 순위 계산
    const processedData = processJeetedAndRanking(dataArray);
    
    // 데이터 행 추가
    const basicHeaders = [
      'address', 'rank', 'grade', 'grade_emoji', 'percentile',
      'total_staked', 'time_score', 'holding_days', 'stake_count', 'unstake_count',
      'is_active', 'current_phase', 'phase_score', 'total_score_all_phases',
      'airdrop_share_phase', 'airdrop_share_total', 'first_stake_time', 'last_action_time',
      'rank_change_24h', 'score_change_24h', 'phase_rank_history'
    ];
    
    const newRows = [];
    processedData.forEach(item => {
      const row = [];
      basicHeaders.forEach(header => {
        row.push(item[header] || '');
      });
      // 신규 18개 컬럼은 빈값으로 초기화
      for (let i = 0; i < 18; i++) {
        row.push('');
      }
      newRows.push(row);
    });
    
    // 한 번에 모든 데이터 입력
    if (newRows.length > 0) {
      const range = sheet.getRange(2, 1, newRows.length, 39);
      range.setValues(newRows);
    }
    
    console.log(`✅ ${newRows.length}개 행 기본 데이터 업데이트 완료`);
    
    return { 
      success: true, 
      updatedRows: newRows.length 
    };
    
  } catch (error) {
    console.error('❌ 기본 데이터 업데이트 실패:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

// 🆕 Jeeted 처리 및 순위 재계산 함수
function processJeetedAndRanking(dataArray) {
  console.log('🔄 Jeeted 제외 및 순위 재계산 시작');
  
  // 1. 활성/비활성 분리
  const activeUsers = [];
  const jeetedUsers = [];
  
  dataArray.forEach(user => {
    if (user.is_active === true || user.is_active === 'TRUE' || user.is_active === 'true') {
      activeUsers.push(user);
    } else {
      // Jeeted 유저는 모든 점수 0으로 초기화
      const jeetedUser = {...user};
      jeetedUser.time_score = 0;
      jeetedUser.phase_score = 0;
      jeetedUser.total_score_all_phases = 0;
      jeetedUser.airdrop_share_phase = 0;
      jeetedUser.airdrop_share_total = 0;
      jeetedUser.percentile = 100; // 최하위
      jeetedUsers.push(jeetedUser);
    }
  });
  
  console.log(`📊 활성: ${activeUsers.length}명, Jeeted: ${jeetedUsers.length}명`);
  
  // 2. 활성 유저만 time_score 기준 정렬
  activeUsers.sort((a, b) => (b.time_score || 0) - (a.time_score || 0));
  
  // 3. 활성 유저 순위 재계산
  const current_time = Math.floor(Date.now() / 1000);
  let totalTimeScore = 0;
  
  // 전체 타임스코어 계산 (에어드랍 비율용)
  activeUsers.forEach(user => {
    totalTimeScore += user.time_score || 0;
  });
  
  // 순위 및 퍼센타일 재계산
  activeUsers.forEach((user, index) => {
    user.rank = index + 1;
    user.percentile = ((index + 1) / activeUsers.length) * 100;
    
    // 에어드랍 비율 재계산
    if (totalTimeScore > 0) {
      user.airdrop_share_phase = ((user.time_score || 0) / totalTimeScore) * 100;
      user.airdrop_share_total = user.airdrop_share_phase * 6; // 6 phases
    }
    
    // 등급 재계산
    const gradeInfo = calculateGradeByPercentile(user, activeUsers, current_time);
    user.grade = gradeInfo.grade;
    user.grade_emoji = gradeInfo.emoji;
  });
  
  // 4. Jeeted 유저는 활성 유저 다음 순위
  const startRankForJeeted = activeUsers.length + 1;
  jeetedUsers.forEach((user, index) => {
    user.rank = startRankForJeeted + index;
    user.grade = 'Jeeted';
    user.grade_emoji = '💀';
  });
  
  // 5. 전체 데이터 합치기 (활성 먼저, 그 다음 Jeeted)
  const processedData = [...activeUsers, ...jeetedUsers];
  
  console.log('✅ Jeeted 제외 및 순위 재계산 완료');
  return processedData;
}

// 🆕 퍼센타일 기반 등급 계산 - 7단계 구조
function calculateGradeByPercentile(user, activeUsers, current_time) {
  // Genesis 자격 확인
  if (user.first_stake_time && 
      user.first_stake_time <= SNAPSHOT_DEADLINE && 
      user.unstake_count === 0) {
    return { grade: 'Genesis OG', emoji: '🌌' };
  }
  
  const percentile = user.percentile;
  
  // ✅ 7단계 구조 (Smoke Flexer 제거)
  if (percentile <= 5) {
    return { grade: 'Heavy Eater', emoji: '💨' };
  } else if (percentile <= 15) {
    return { grade: 'Stake Wizard', emoji: '🧙' };
  } else if (percentile <= 30) {
    return { grade: 'Grilluminati', emoji: '👁️' };
  } else if (percentile <= 50) {
    return { grade: 'Flame Juggler', emoji: '🔥' };
  } else if (percentile <= 75) {
    return { grade: 'Flipstarter', emoji: '🥩' };
  } else {
    return { grade: 'Sizzlin\' Noob', emoji: '🆕' };
  }
}

function processComplete39Columns() {
  try {
    console.log('🔄 39개 컬럼 완전 처리 시작');
    
    const sheet = getTargetSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    if (values.length <= 1) {
      return { success: false, error: '처리할 데이터 없음' };
    }
    
    const headers = values[0];
    const dataRows = values.slice(1);
    
    // 전체 사용자 데이터 처리
    const allUsers = [];
    const activeUsers = [];
    
    dataRows.forEach((row, index) => {
      const userData = {
        index: index + 1,
        address: row[0] || '',
        rank: parseInt(row[1]) || 0,
        grade: row[2] || '',
        totalStaked: parseFloat(row[5]) || 0,
        isActive: row[10] === true || row[10] === 'TRUE' || row[10] === 'true',
        firstStakeTime: parseInt(row[16]) || 0,
        unstakeCount: parseInt(row[9]) || 0,
        holdingDays: parseFloat(row[7]) || 0,
        stakeCount: parseInt(row[8]) || 0
      };
      
      allUsers.push(userData);
      
      if (userData.isActive) {
        activeUsers.push(userData);
      }
    });
    
    console.log(`🔥 활성 사용자: ${activeUsers.length}명`);
    console.log(`💀 Jeeted 사용자: ${allUsers.length - activeUsers.length}명`);
    
    // 🔥 활성 사용자만 초당 파워 계산 및 정렬
    activeUsers.forEach(user => {
      user.pointsPerSecond = user.totalStaked / (24 * 60 * 60);
    });
    
    // 초당 파워 기준 정렬 (그릴온도 순위용)
    activeUsers.sort((a, b) => b.pointsPerSecond - a.pointsPerSecond);
    
    // 활성 사용자에게 파워 순위 부여
    activeUsers.forEach((user, index) => {
      user.powerRank = index + 1;
    });
    
    // 신규 18개 컬럼 계산 및 업데이트
    allUsers.forEach(user => {
      calculateAndUpdateNewColumns(sheet, user, activeUsers);
    });
    
    console.log('✅ 39개 컬럼 완전 처리 완료');
    
    return { 
      success: true, 
      processedRows: allUsers.length 
    };
    
  } catch (error) {
    console.error('❌ 39개 컬럼 처리 실패:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

function calculateAndUpdateNewColumns(sheet, user, activeUsers) {
  const rowNum = user.index + 1;
  
  // 🔑 추천인 시스템 (4개 컬럼: V-Y열)
  const referralCode = generateReferralCode(user.address);
  sheet.getRange(rowNum, 22).setValue(referralCode); // V열
  sheet.getRange(rowNum, 23).setValue(''); // W열: referred_by
  sheet.getRange(rowNum, 24).setValue(0); // X열: referral_count
  sheet.getRange(rowNum, 25).setValue(0); // Y열: referral_bonus_earned
  
  // 💰 가상 스테이킹 (1개 컬럼: Z열)
  sheet.getRange(rowNum, 26).setValue(0); // Z열: virtual_staked
  
  // 🌡️ 그릴온도 시스템 (4개 컬럼: AA-AD열)
  if (user.isActive) {
    // 활성 유저 중에서 파워 순위 찾기
    const activeUser = activeUsers.find(au => au.address === user.address);
    if (activeUser) {
      const grillTemp = calculateImprovedGrillTemperature(activeUser.powerRank, activeUsers.length);
      const pointsPerSec = Math.round(user.totalStaked / (24 * 60 * 60) * 100) / 100;
      
      sheet.getRange(rowNum, 27).setValue(grillTemp); // AA열: grill_temperature
      sheet.getRange(rowNum, 28).setValue(pointsPerSec); // AB열: points_per_second
      sheet.getRange(rowNum, 29).setValue(predictNextPhaseTier(grillTemp, activeUsers.length)); // AC열: predicted_next_tier
      sheet.getRange(rowNum, 30).setValue(''); // AD열: temperature_trend (폐기)
    }
  } else {
    // Jeeted는 모두 0
    sheet.getRange(rowNum, 27).setValue(0); // AA열: grill_temperature
    sheet.getRange(rowNum, 28).setValue(0); // AB열: points_per_second
    sheet.getRange(rowNum, 29).setValue('Jeeted'); // AC열: predicted_next_tier
    sheet.getRange(rowNum, 30).setValue(''); // AD열: temperature_trend (폐기)
  }
  
  // 🎁 선물상자 시스템 (6개 컬럼: AE-AJ열)
  if (user.isActive) {
    const currentBox = calculateCurrentBox(user);
    // 6시간마다 드롭, 하루 최대 4개
    const maxBoxesPerDay = 4;
    const boxesOpened = Math.min(Math.floor(user.holdingDays * maxBoxesPerDay), 100); // 최대 100개로 제한
    
    sheet.getRange(rowNum, 31).setValue(currentBox); // AE열: current_box_type
    sheet.getRange(rowNum, 32).setValue(''); // AF열: box_drop_time
    sheet.getRange(rowNum, 33).setValue(''); // AG열: box_expire_time
    sheet.getRange(rowNum, 34).setValue(''); // AH열: next_box_drop
    sheet.getRange(rowNum, 35).setValue(boxesOpened); // AI열: total_boxes_opened
    sheet.getRange(rowNum, 36).setValue(0); // AJ열: box_points_earned
  } else {
    // Jeeted는 상자 없음
    sheet.getRange(rowNum, 31).setValue(''); // AE열: current_box_type
    sheet.getRange(rowNum, 32).setValue(''); // AF열: box_drop_time
    sheet.getRange(rowNum, 33).setValue(''); // AG열: box_expire_time
    sheet.getRange(rowNum, 34).setValue(''); // AH열: next_box_drop
    sheet.getRange(rowNum, 35).setValue(0); // AI열: total_boxes_opened
    sheet.getRange(rowNum, 36).setValue(0); // AJ열: box_points_earned
  }
  
  // 📊 페이즈 시스템 (3개 컬럼: AK-AM열)
  sheet.getRange(rowNum, 37).setValue('P1'); // AK열: phase_participation
  sheet.getRange(rowNum, 38).setValue(user.rank); // AL열: best_rank_achieved
  const genesisQualified = user.isActive && checkGenesisQualification(user.firstStakeTime, user.unstakeCount);
  sheet.getRange(rowNum, 39).setValue(genesisQualified); // AM열: genesis_snapshot_qualified
}

// 🆕 개선된 그릴온도 계산 함수
function calculateImprovedGrillTemperature(powerRank, totalActiveUsers) {
  if (powerRank <= 0 || totalActiveUsers <= 0) return 0;
  
  const percentile = ((powerRank - 1) / totalActiveUsers) * 100;
  
  // Genesis OG (상위 1%): 991-1000°F
  if (percentile < 1) {
    const genesisCount = Math.ceil(totalActiveUsers * 0.01);
    const positionInTier = powerRank - 1;
    const tempRange = 10; // 991-1000
    const tempStep = tempRange / genesisCount;
    return Math.round((1000 - (positionInTier * tempStep)) * 10) / 10;
  }
  // Heavy Eater (상위 1-5%): 951-990°F
  else if (percentile < 5) {
    const tierStart = Math.ceil(totalActiveUsers * 0.01) + 1;
    const tierCount = Math.ceil(totalActiveUsers * 0.05) - Math.ceil(totalActiveUsers * 0.01);
    const positionInTier = powerRank - tierStart;
    const tempRange = 40; // 951-990
    const tempStep = tempRange / tierCount;
    return Math.round((990 - (positionInTier * tempStep)) * 10) / 10;
  }
  // Stake Wizard (상위 5-15%): 851-950°F
  else if (percentile < 15) {
    const tierStart = Math.ceil(totalActiveUsers * 0.05) + 1;
    const tierCount = Math.ceil(totalActiveUsers * 0.15) - Math.ceil(totalActiveUsers * 0.05);
    const positionInTier = powerRank - tierStart;
    const tempRange = 100; // 851-950
    const tempStep = tempRange / tierCount;
    return Math.round((950 - (positionInTier * tempStep)) * 10) / 10;
  }
  // Grilluminati (상위 15-30%): 701-850°F
  else if (percentile < 30) {
    const tierStart = Math.ceil(totalActiveUsers * 0.15) + 1;
    const tierCount = Math.ceil(totalActiveUsers * 0.30) - Math.ceil(totalActiveUsers * 0.15);
    const positionInTier = powerRank - tierStart;
    const tempRange = 150; // 701-850
    const tempStep = tempRange / tierCount;
    return Math.round((850 - (positionInTier * tempStep)) * 10) / 10;
  }
  // Flame Juggler (상위 30-50%): 501-700°F
  else if (percentile < 50) {
    const tierStart = Math.ceil(totalActiveUsers * 0.30) + 1;
    const tierCount = Math.ceil(totalActiveUsers * 0.50) - Math.ceil(totalActiveUsers * 0.30);
    const positionInTier = powerRank - tierStart;
    const tempRange = 200; // 501-700
    const tempStep = tempRange / tierCount;
    return Math.round((700 - (positionInTier * tempStep)) * 10) / 10;
  }
  // Flipstarter (상위 50-75%): 201-500°F
  else if (percentile < 75) {
    const tierStart = Math.ceil(totalActiveUsers * 0.50) + 1;
    const tierCount = Math.ceil(totalActiveUsers * 0.75) - Math.ceil(totalActiveUsers * 0.50);
    const positionInTier = powerRank - tierStart;
    const tempRange = 300; // 201-500
    const tempStep = tempRange / tierCount;
    return Math.round((500 - (positionInTier * tempStep)) * 10) / 10;
  }
  // Sizzlin' Noob (나머지): 1-200°F
  else {
    const tierStart = Math.ceil(totalActiveUsers * 0.75) + 1;
    const tierCount = totalActiveUsers - Math.ceil(totalActiveUsers * 0.75);
    const positionInTier = powerRank - tierStart;
    const tempRange = 200; // 1-200
    const tempStep = tempRange / tierCount;
    return Math.max(1, Math.round((200 - (positionInTier * tempStep)) * 10) / 10);
  }
}

// 🆕 그릴온도 기반 다음 페이즈 예상 티어
function predictNextPhaseTier(grillTemp, totalActiveUsers) {
  if (grillTemp >= 991) return 'Genesis OG';
  else if (grillTemp >= 951) return 'Heavy Eater';
  else if (grillTemp >= 851) return 'Stake Wizard';
  else if (grillTemp >= 701) return 'Grilluminati';
  else if (grillTemp >= 501) return 'Flame Juggler';
  else if (grillTemp >= 201) return 'Flipstarter';
  else if (grillTemp >= 1) return 'Sizzlin\' Noob';
  else return 'Jeeted';
}

// ==================== 유틸리티 함수들 ====================

function ensure39ColumnHeaders(sheet) {
  const headers = [
    // 기존 21개 컬럼
    'address', 'rank', 'grade', 'grade_emoji', 'percentile',
    'total_staked', 'time_score', 'holding_days', 'stake_count', 'unstake_count',
    'is_active', 'current_phase', 'phase_score', 'total_score_all_phases',
    'airdrop_share_phase', 'airdrop_share_total', 'first_stake_time', 'last_action_time',
    'rank_change_24h', 'score_change_24h', 'phase_rank_history',
    
    // 신규 18개 컬럼
    'referral_code', 'referred_by', 'referral_count', 'referral_bonus_earned',
    'virtual_staked', 'grill_temperature', 'points_per_second', 'predicted_next_tier',
    'temperature_trend', 'current_box_type', 'box_drop_time', 'box_expire_time',
    'next_box_drop', 'total_boxes_opened', 'box_points_earned', 'phase_participation',
    'best_rank_achieved', 'genesis_snapshot_qualified'
  ];
  
  // 헤더 확인 및 생성
  if (sheet.getLastRow() === 0 || sheet.getLastColumn() < 39) {
    sheet.clear();
    sheet.getRange(1, 1, 1, 39).setValues([headers]);
    
    // 헤더 스타일링
    const headerRange = sheet.getRange(1, 1, 1, 39);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#e8f0fe');
    
    console.log('📋 39개 컬럼 헤더 생성 완료');
  }
}

function generateReferralCode(address) {
  if (!address || address.length < 8) return '';
  return `STAKE${address.slice(-6).toUpperCase()}`;
}

function checkGenesisQualification(firstStakeTime, unstakeCount) {
  return firstStakeTime > 0 && firstStakeTime <= SNAPSHOT_DEADLINE && unstakeCount === 0;
}

// ✅ Smoke Flexer 제거된 버전
function calculateCurrentBox(user) {
  if (!user.isActive) return '';
  
  const gradeBoxMap = {
    'Sizzlin\' Noob': 'COMMON',
    'Flipstarter': 'UNCOMMON',
    'Flame Juggler': 'RARE',
    'Grilluminati': 'EPIC',
    'Stake Wizard': 'UNIQUE',
    'Heavy Eater': 'LEGENDARY',
    'Genesis OG': 'GENESIS'
  };
  
  return gradeBoxMap[user.grade] || 'COMMON';
}

function getCompleteSheetData(sheet) {
  const dataRange = sheet.getDataRange();
  if (dataRange.getNumRows() <= 1) {
    return [];
  }
  
  const values = dataRange.getValues();
  const headers = values[0];
  const dataRows = values.slice(1);
  
  return dataRows.map(row => {
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index];
    });
    return item;
  });
}

function generateCompleteJSON() {
  try {
    const sheet = getTargetSheet();
    const data = getCompleteSheetData(sheet);
    
    const jsonData = {
      last_updated: new Date().toISOString(),
      total_users: data.length,
      active_users: data.filter(u => u.is_active === true || u.is_active === 'TRUE').length,
      jeeted_users: data.filter(u => !(u.is_active === true || u.is_active === 'TRUE')).length,
      phase: 1,
      system_stats: {
        blazing: data.filter(u => (u.grill_temperature || 0) >= 991).length,
        hot: data.filter(u => (u.grill_temperature || 0) >= 851 && (u.grill_temperature || 0) < 991).length,
        perfect: data.filter(u => (u.grill_temperature || 0) >= 500 && (u.grill_temperature || 0) < 851).length,
        active: data.filter(u => (u.grill_temperature || 0) >= 201 && (u.grill_temperature || 0) < 500).length,
        starting: data.filter(u => (u.grill_temperature || 0) >= 1 && (u.grill_temperature || 0) < 201).length,
        genesis_qualified: data.filter(u => u.genesis_snapshot_qualified === true || u.genesis_snapshot_qualified === 'TRUE').length
      },
      leaderboard: data
    };
    
    // Google Drive에 저장
    const blob = Utilities.newBlob(JSON.stringify(jsonData, null, 2), 'application/json', 'stake_complete_leaderboard.json');
    const file = DriveApp.createFile(blob);
    
    console.log(`📁 완전한 JSON 파일 저장: ${file.getId()}`);
    
  } catch (error) {
    console.error('❌ JSON 생성 실패:', error);
  }
}

// ==================== 청크 처리 함수 ====================

function processChunkData(chunkData) {
  try {
    console.log(`📦 청크 처리: ${chunkData.chunk_number}/${chunkData.total_chunks}`);
    
    // 첫 번째 청크인 경우 기존 데이터 삭제
    if (chunkData.chunk_number === 1) {
      const sheet = getTargetSheet();
      ensure39ColumnHeaders(sheet);
      
      // 기존 데이터 삭제 (헤더 제외)
      const lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.deleteRows(2, lastRow - 1);
      }
      console.log('🗑️ 기존 데이터 삭제 완료');
    }
    
    // 청크 데이터 추가
    const result = appendChunkToSheet(chunkData.data);
    
    // 마지막 청크인 경우 전체 처리 수행
    if (chunkData.chunk_number === chunkData.total_chunks) {
      console.log('🔄 마지막 청크 - 전체 처리 시작');
      
      const enhanceResult = processComplete39Columns();
      generateCompleteJSON();
      
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          message: '청크 업로드 및 전체 처리 완료',
          total_chunks: chunkData.total_chunks,
          enhanced_columns: enhanceResult.processedRows || 0,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: 'success',
          message: `청크 ${chunkData.chunk_number} 처리 완료`,
          chunk_number: chunkData.chunk_number,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    console.error('❌ 청크 처리 실패:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: `청크 처리 실패: ${error.toString()}`,
        chunk_number: chunkData.chunk_number,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function appendChunkToSheet(chunkDataArray) {
  try {
    const sheet = getTargetSheet();
    
    // 🔥 청크 데이터도 Jeeted 처리 적용
    const processedData = processJeetedAndRanking(chunkDataArray);
    
    const basicHeaders = [
      'address', 'rank', 'grade', 'grade_emoji', 'percentile',
      'total_staked', 'time_score', 'holding_days', 'stake_count', 'unstake_count',
      'is_active', 'current_phase', 'phase_score', 'total_score_all_phases',
      'airdrop_share_phase', 'airdrop_share_total', 'first_stake_time', 'last_action_time',
      'rank_change_24h', 'score_change_24h', 'phase_rank_history'
    ];
    
    const newRows = [];
    processedData.forEach(item => {
      const row = [];
      basicHeaders.forEach(header => {
        row.push(item[header] || '');
      });
      // 신규 18개 컬럼은 빈값으로 초기화
      for (let i = 0; i < 18; i++) {
        row.push('');
      }
      newRows.push(row);
    });
    
    // 현재 마지막 행 다음에 추가
    const lastRow = sheet.getLastRow();
    const startRow = lastRow + 1;
    
    if (newRows.length > 0) {
      const range = sheet.getRange(startRow, 1, newRows.length, 39);
      range.setValues(newRows);
    }
    
    console.log(`✅ 청크 데이터 ${newRows.length}개 행 추가 완료`);
    
    return { 
      success: true, 
      addedRows: newRows.length 
    };
    
  } catch (error) {
    console.error('❌ 청크 데이터 추가 실패:', error);
    return { 
      success: false, 
      error: error.toString() 
    };
  }
}

// ==================== 추가 유틸리티 함수들 ====================

// 어제 데이터 최종 집계 확인 (스케줄러용)
function verifyYesterdayAggregation() {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = Utilities.formatDate(yesterday, 'Asia/Seoul', 'yyyy-MM-dd');
    
    console.log(`📊 ${dateStr} 데이터 집계 확인 중...`);
    
    const dailySheet = getBoxDailySheet();
    const data = dailySheet.getDataRange().getValues();
    
    let recordCount = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === dateStr) {
        recordCount++;
      }
    }
    
    console.log(`✅ ${dateStr}: ${recordCount}개 기록 확인`);
    
  } catch (error) {
    console.error('❌ 어제 데이터 확인 실패:', error);
  }
}

// 일일 통계 리포트 생성 (스케줄러용)
function generateDailyStats() {
  try {
    console.log('📈 일일 통계 생성 중...');
    
    const today = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd');
    const dailySheet = getBoxDailySheet();
    const data = dailySheet.getDataRange().getValues();
    
    let totalBoxesToday = 0;
    let totalPointsToday = 0;
    let activeUsersToday = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] === today) {
        activeUsersToday++;
        totalBoxesToday += data[i][10] || 0;
        totalPointsToday += data[i][9] || 0;
      }
    }
    
    console.log(`📊 ${today} 통계:`);
    console.log(`  - 활성 사용자: ${activeUsersToday}명`);
    console.log(`  - 총 상자 수: ${totalBoxesToday}개`);
    console.log(`  - 총 포인트: ${totalPointsToday.toLocaleString()}점`);
    
  } catch (error) {
    console.error('❌ 일일 통계 생성 실패:', error);
  }
}

// ==================== 테스트 함수 ====================

// ==================== 안전한 테스트 함수 (수정됨) ====================

function testWebApp() {
  console.log('🧪 Web App 연결 테스트 (데이터 건드리지 않음)');
  
  try {
    console.log(`📋 시트 ID: ${SHEET_ID}`);
    console.log(`📋 시트명: ${SHEET_NAME}`);
    
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    console.log(`✅ 스프레드시트 접근 성공: ${spreadsheet.getName()}`);
    
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);
    if (sheet) {
      console.log(`✅ 시트 접근 성공: ${sheet.getName()}`);
      console.log(`📊 현재 행 수: ${sheet.getLastRow()}`);
      console.log(`📊 현재 열 수: ${sheet.getLastColumn()}`);
      
      // 📖 데이터 읽기만 테스트 (수정하지 않음)
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      
      if (values.length > 1) {
        console.log(`📊 데이터 확인: ${values.length - 1}개 행 존재`);
        console.log(`📋 헤더: ${values[0].slice(0, 5).join(', ')}...`);
        
        if (values.length > 1) {
          const firstUser = values[1];
          console.log(`👤 첫 번째 사용자: ${firstUser[0]} (${firstUser[2]})`);
        }
      } else {
        console.log('📊 데이터 없음');
      }
      
      // 🎁 상자 시트 연결 테스트
      try {
        const boxCurrentSheet = getBoxCurrentSheet();
        console.log(`✅ box_current 시트 접근 성공: ${boxCurrentSheet.getLastRow()}행`);
        
        const boxDailySheet = getBoxDailySheet();
        console.log(`✅ box_daily 시트 접근 성공: ${boxDailySheet.getLastRow()}행`);
      } catch (boxError) {
        console.log(`⚠️ 상자 시트 접근 실패: ${boxError}`);
      }
      
      console.log('✅ 모든 연결 테스트 완료 (데이터 수정 없음)');
      
    } else {
      console.log(`❌ 시트 '${SHEET_NAME}'를 찾을 수 없습니다`);
      
      // 사용 가능한 시트 목록 출력
      const sheets = spreadsheet.getSheets();
      console.log('📋 사용 가능한 시트들:');
      sheets.forEach(s => console.log(`  - "${s.getName()}"`));
    }
    
  } catch (error) {
    console.error('❌ 테스트 실패:', error);
    console.log('🔍 시트 ID 또는 권한을 확인하세요');
  }
}