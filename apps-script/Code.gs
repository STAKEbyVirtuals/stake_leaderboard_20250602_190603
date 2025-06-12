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

    // 🆕 디버그 로그 시트 생성/접근
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let logSheet = spreadsheet.getSheetByName('debug_log');
    if (!logSheet) {
      logSheet = spreadsheet.insertSheet('debug_log');
      // 헤더 추가
      logSheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Mode', 'Data Count', 'Action', 'Details']]);
      logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    }

    // JSON 데이터 파싱
    let postData;
    try {
      postData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      console.error('❌ JSON 파싱 실패:', parseError);
      // 🆕 에러도 로그에 기록
      logSheet.appendRow([new Date(), 'error', 0, 'JSON 파싱 실패', parseError.message]);
      throw new Error(`JSON 파싱 오류: ${parseError.message}`);
    }

    // 🆕 요청 정보 로그 기록
    const dataCount = postData.data ? postData.data.length : (postData.length || 0);
    logSheet.appendRow([
      new Date(),
      postData.mode || 'unknown',
      dataCount,
      'doPost 시작',
      postData.type || 'normal'
    ]);

    // 🆕 상자 동기화 요청 처리
    if (postData.type === 'box_sync') {
      return processBoxSync(postData);
    }

    // 🆕 업데이트 모드 확인
    const updateMode = postData.mode || 'full';  // 기본값: full
    console.log(`📊 업데이트 모드: ${updateMode}`);

    // 🆕 모드별 처리 시작 로그
    logSheet.appendRow([
      new Date(),
      updateMode,
      dataCount,
      '모드별 처리 시작',
      updateMode === 'incremental' ? 'Live만 업데이트' : 'Master+Live 업데이트'
    ]);

    console.log(`📊 받은 데이터: ${postData.length || postData.data?.length || 0}개 항목`);

    // 실제 데이터 추출 (청크 처리 고려)
    const actualData = postData.data || postData;

    // 🆕 모드별 처리
    let updateResult;
    let incrementalEnhanceResult = { success: true, processedRows: 0 };

    if (updateMode === 'incremental') {
      try {
        // 로그
        logSheet.appendRow([
          new Date(),
          updateMode,
          dataCount,
          'updateLiveSheet 호출',
          'Live 시트만 업데이트 예정'
        ]);

        // Live 시트만 업데이트
        updateResult = updateLiveSheet(actualData);

        // 로그
        logSheet.appendRow([
          new Date(),
          updateMode,
          updateResult.updatedRows || 0,
          'updateLiveSheet 완료',
          `성공: ${updateResult.success}`
        ]);

        // 39컬럼 처리 - 조건 단순화
        if (updateResult.success) {
          logSheet.appendRow([
            new Date(),
            'incremental',
            0,
            'processIncrementalEnhancement 호출',
            '전체 Live 시트 39컬럼 업데이트'
          ]);

          // 전체 39컬럼 업데이트 -> 증분 처리 함수 호출로 변경
          const enhanceResult = processIncrementalEnhancement(updateResult.targetSheet, updateResult.updatedAddresses);

          logSheet.appendRow([
            new Date(),
            'incremental',
            enhanceResult.processedRows || 0,
            'processIncrementalEnhancement 완료',
            `처리: ${enhanceResult.processedRows}개`
          ]);
        }

      } catch (error) {
        logSheet.appendRow([
          new Date(),
          'incremental',
          0,
          'ERROR',
          error.toString()
        ]);
      }
    } else {
      // 🆕 전체 모드 처리 로그
      logSheet.appendRow([new Date(), updateMode, dataCount, 'updateMasterAndLiveSheets 호출', 'Master+Live 업데이트 예정']);

      updateResult = updateMasterAndLiveSheets(actualData);

      // 🆕 결과 로그
      logSheet.appendRow([
        new Date(),
        updateMode,
        updateResult.updatedRows || 0,
        'updateMasterAndLiveSheets 완료',
        `성공: ${updateResult.success}`
      ]);

      // 전체 모드에서는 기존대로
      const enhanceResult = updateNewColumnsInBatch(updateResult.targetSheet);

      if (!enhanceResult.success) {
        console.warn('⚠️ 39개 컬럼 처리 중 일부 오류:', enhanceResult.error);
      }

      // JSON 파일은 전체 모드에서만 생성
      generateCompleteJSON();
    }
    console.log(`✅ ${updateMode} 모드 처리 완료`);

    // 결과 변수 준비
    let processedRows = 0;
    if (updateMode === 'incremental') {
      processedRows = incrementalEnhanceResult.processedRows || 0;
    } else {
      processedRows = enhanceResult.processedRows || 0;
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: `STAKE 데이터 처리 완료 (${updateMode} 모드)`,
        mode: updateMode,
        basic_columns: updateResult.updatedRows,
        enhanced_columns: processedRows,
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

    // 🆕 항상 Live 시트에서 읽기
    const sheet = getLiveSheet();
    const data = getCompleteSheetData(sheet);

    console.log(`📊 Live 시트에서 반환: ${data.length}개 항목`);

    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        sheet_type: 'live',
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

    // 메인 시트 업데이트 -> 실시간 총점 반영 로직으로 강화
    updateMainSheetAfterBoxSync(data.address);

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

// 🔄 [신규/강화] 상자 동기화 후 메인(Live) 시트의 상자 포인트와 총점을 업데이트
function updateMainSheetAfterBoxSync(address) {
  try {
    const liveSheet = getLiveSheet();
    const headers = liveSheet.getRange(1, 1, 1, liveSheet.getLastColumn()).getValues()[0];
    
    // 컬럼 인덱스 찾기
    const addressIndex = headers.indexOf('address');
    const timeScoreIndex = headers.indexOf('time_score');
    const referralBonusEarnedIndex = headers.indexOf('referral_bonus_earned');
    const boxPointsEarnedIndex = headers.indexOf('box_points_earned');
    const totalBoxesOpenedIndex = headers.indexOf('total_boxes_opened');
    const totalScoreAllPhasesIndex = headers.indexOf('total_score_all_phases');

    // 필수 컬럼 확인
    if ([addressIndex, timeScoreIndex, boxPointsEarnedIndex, totalScoreAllPhasesIndex].includes(-1)) {
        console.error('❌ [BoxSync] Live 시트에서 필수 컬럼을 찾을 수 없습니다.');
        return;
    }

    // 1. box_daily 시트에서 해당 유저의 최신 상자 데이터 합산
    const dailySheet = getBoxDailySheet();
    const dailyData = dailySheet.getDataRange().getValues();
    let totalPoints = 0;
    let totalBoxes = 0;
    const lowerCaseAddress = address.toLowerCase();

    for (let i = 1; i < dailyData.length; i++) {
        if (String(dailyData[i][0]).toLowerCase() === lowerCaseAddress) {
            totalPoints += parseFloat(dailyData[i][9]) || 0;
            totalBoxes += parseInt(dailyData[i][10]) || 0;
        }
    }

    // 2. Live 시트에서 해당 유저의 행 찾기
    const liveData = liveSheet.getDataRange().getValues();
    let targetRow = -1;
    for (let i = 1; i < liveData.length; i++) {
        if (String(liveData[i][addressIndex]).toLowerCase() === lowerCaseAddress) {
            targetRow = i + 1; // 시트 행 번호는 1-based
            break;
        }
    }
    
    if (targetRow === -1) {
        console.warn(`⚠️ [BoxSync] Live 시트에서 주소 ${address}를 찾을 수 없습니다.`);
        return;
    }

    // 3. 포인트 재계산 및 업데이트
    const currentRowData = liveData[targetRow - 1];
    const timeScore = parseFloat(currentRowData[timeScoreIndex]) || 0;
    // 레퍼럴 보너스는 Y열(25) 또는 헤더 기반으로 조회, 현재는 0으로 가정
    const referralBonus = parseFloat(currentRowData[referralBonusEarnedIndex]) || 0;
    
    const newTotalScore = timeScore + referralBonus + totalPoints;

    // Live 시트의 상자 포인트, 상자 개수, 총점 업데이트
    liveSheet.getRange(targetRow, boxPointsEarnedIndex + 1).setValue(totalPoints);
    liveSheet.getRange(targetRow, totalBoxesOpenedIndex + 1).setValue(totalBoxes);
    liveSheet.getRange(targetRow, totalScoreAllPhasesIndex + 1).setValue(newTotalScore);
    
    console.log(`✅ [BoxSync] ${address}의 Live 시트 점수 실시간 업데이트 완료. 새로운 총점: ${newTotalScore}`);

  } catch(e) {
    console.error(`❌ [BoxSync] Live 시트 업데이트 중 오류 발생: ${e.toString()}`);
  }
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
    // [수정] 이제 이 함수는 항상 Live 시트를 반환하여 데이터 소스를 통일합니다.
    return getLiveSheet();
  } catch (error) {
    console.error('❌ getTargetSheet 실패 (getLiveSheet 호출 중):', error);
    throw new Error(`getTargetSheet -> getLiveSheet 실패: ${error.toString()}`);
  }
}

// === 시트 관리 함수들 ===

function getMasterSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME + '_master');

    if (!sheet) {
      // Master 시트가 없으면 생성
      sheet = spreadsheet.insertSheet(SHEET_NAME + '_master');
      ensure39ColumnHeaders(sheet);
      console.log('📋 Master 시트 생성 완료');
    }

    return sheet;
  } catch (error) {
    console.error('❌ Master 시트 접근 실패:', error);
    throw error;
  }
}

function getLiveSheet() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME + '_live');

    if (!sheet) {
      // Live 시트가 없으면 생성
      sheet = spreadsheet.insertSheet(SHEET_NAME + '_live');
      ensure39ColumnHeaders(sheet);
      console.log('📋 Live 시트 생성 완료');
    }

    return sheet;
  } catch (error) {
    console.error('❌ Live 시트 접근 실패:', error);
    throw error;
  }
}

function updateLiveSheet(dataArray) {
  // 🆕 맨 처음 로그
  console.log('🔍 updateLiveSheet 함수 진입');

  try {
    const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('debug_log');
    // 🆕 로그 시트 확인
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'incremental',
        dataArray ? dataArray.length : 0,
        'updateLiveSheet 함수 시작',
        '진입 성공'
      ]);
    }

    // 🆕 getLiveSheet 전후 로그
    if (logSheet) {
      logSheet.appendRow([new Date(), 'incremental', 0, 'getLiveSheet 호출 전', 'OK']);
    }

    let liveSheet;
    try {
      liveSheet = getLiveSheet();
      if (logSheet) {
        logSheet.appendRow([new Date(), 'incremental', 0, 'getLiveSheet 성공', liveSheet.getName()]);
      }
    } catch (error) {
      if (logSheet) {
        logSheet.appendRow([new Date(), 'incremental', 0, 'getLiveSheet 에러!', error.toString()]);
      }
      throw error;
    }

    if (!dataArray || dataArray.length === 0) {
      return { success: false, error: '빈 데이터 배열' };
    }

    console.log('📝 Live 시트 증분 업데이트 시작');

    // 기존 데이터 읽기
    const existingData = liveSheet.getDataRange().getValues();
    const headers = existingData[0];
    const addressIndex = headers.indexOf('address');

    // 주소별 기존 데이터 맵 생성
    const existingMap = new Map();
    for (let i = 1; i < existingData.length; i++) {
      existingMap.set(existingData[i][addressIndex], i + 1);
    }

    // 업데이트할 행과 새로 추가할 행 분리
    const updateRows = [];
    const newRows = [];
    const updatedAddresses = new Set();

    dataArray.forEach(item => {
      const existingRow = existingMap.get(item.address);
      if (existingRow) {
        updateRows.push({ row: existingRow, data: item });
        updatedAddresses.add(item.address);
      } else {
        newRows.push(item);
        updatedAddresses.add(item.address);
      }
    });


    updateRows.forEach(({ row, data }) => {
      // 특정 컬럼만 업데이트
      const addressCol = headers.indexOf('address') + 1;
      const rankCol = headers.indexOf('rank') + 1;
      const totalStakedCol = headers.indexOf('total_staked') + 1;
      const timeScoreCol = headers.indexOf('time_score') + 1;

      // 개별 셀 업데이트 (박스 컬럼은 건드리지 않음)
      if (data.rank !== undefined) liveSheet.getRange(row, rankCol).setValue(data.rank);
      if (data.total_staked !== undefined) liveSheet.getRange(row, totalStakedCol).setValue(data.total_staked);
      if (data.time_score !== undefined) liveSheet.getRange(row, timeScoreCol).setValue(data.time_score);
    });

    // 새 행 추가
    if (newRows.length > 0) {
      const newRowsData = newRows.map(item => {
        const row = [];
        headers.forEach(header => {
          row.push(item[header] || '');
        });
        return row;
      });

      const lastRow = liveSheet.getLastRow();
      liveSheet.getRange(lastRow + 1, 1, newRows.length, headers.length).setValues(newRowsData);
    }

    console.log(`✅ Live 시트 증분 업데이트 완료: ${updateRows.length}개 수정, ${newRows.length}개 추가`);

    // 🆕 디버그 로그
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'incremental',
        updatedAddresses.size,
        'updateLiveSheet 완료',
        `성공: true`
      ]);
    }

    return {
      success: true,
      updatedRows: updateRows.length + newRows.length,
      targetSheet: liveSheet,
      updatedAddresses: Array.from(updatedAddresses)
    };

  } catch (error) {
    console.error('❌ Live 시트 업데이트 실패:', error);

    const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('debug_log');
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'incremental',
        0,
        'updateLiveSheet 에러',
        error.toString()
      ]);
    }

    return {
      success: false,
      error: error.toString()
    };
  }
}

// 전체 업데이트: Master 업데이트 후 Live에 복사
function updateMasterAndLiveSheets(dataArray) {
  try {
    // 🆕 로그 시트 접근
    const logSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('debug_log');

    const masterSheet = getMasterSheet();
    const liveSheet = getLiveSheet();

    // 🆕 어떤 시트들을 가져왔는지 로그
    if (logSheet) {
      logSheet.appendRow([
        new Date(),
        'full',
        dataArray ? dataArray.length : 0,
        'updateMasterAndLiveSheets 시작',
        `Master: ${masterSheet.getName()}, Live: ${liveSheet.getName()}`
      ]);
    }

    if (!dataArray || dataArray.length === 0) {
      return { success: false, error: '빈 데이터 배열' };
    }

    console.log('📝 Master 시트 전체 업데이트 시작');

    // 39개 컬럼 헤더 확인/생성
    ensure39ColumnHeaders(masterSheet);

    // Master 시트 전체 교체
    const lastRow = masterSheet.getLastRow();
    if (lastRow > 1) {
      masterSheet.deleteRows(2, lastRow - 1);
    }

    // 🔥 Jeeted 처리 및 활성 유저만 순위 계산
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

    // Master 시트에 데이터 입력
    if (newRows.length > 0) {
      const range = masterSheet.getRange(2, 1, newRows.length, 39);
      range.setValues(newRows);
    }

    console.log(`✅ Master 시트 업데이트 완료: ${newRows.length}개 행`);

    // Master → Live 복사
    console.log('📋 Master → Live 시트 복사 중...');

    // Live 시트 초기화
    const liveLastRow = liveSheet.getLastRow();
    if (liveLastRow > 1) {
      liveSheet.deleteRows(2, liveLastRow - 1);
    }

    // Master 데이터 복사
    if (newRows.length > 0) {
      const liveRange = liveSheet.getRange(2, 1, newRows.length, 39);
      liveRange.setValues(newRows);
    }

    console.log('✅ Live 시트 복사 완료');

    return {
      success: true,
      updatedRows: updateRows.length + newRows.length,
      targetSheet: liveSheet,
      mode: 'incremental'  // 🆕 모드 정보 추가
    };

  } catch (error) {
    console.error('❌ Master/Live 시트 업데이트 실패:', error);
    return {
      success: false,
      error: error.toString()
    };
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
      const jeetedUser = { ...user };
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

/**
 * [복원됨] 개선된 그릴온도 계산 함수
 * @param {number} powerRank 파워 순위 (total_score_all_phases 기준)
 * @param {number} totalActiveUsers 전체 활성 사용자 수
 * @returns {number} 계산된 그릴 온도
 */
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

/**
 * [리팩터링됨] 신규 18개 컬럼을 배치 방식으로 업데이트합니다. (Phase 1, 2, 3, 4 적용)
 * 기존의 processComplete39Columns, processIncrementalEnhancement, calculateAndUpdateNewColumns 함수를 대체합니다.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} targetSheet 처리할 시트 객체
 * @returns {{success: boolean, processedRows: number, error?: string}} 처리 결과
 */
function updateNewColumnsInBatch(targetSheet) {
  try {
    console.log('🔄 [Batch] 신규 18개 컬럼 처리 시작 (Phase 1, 2, 3, 4)');
    const sheet = targetSheet || getTargetSheet();
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();

    if (values.length <= 1) {
      return { success: false, error: '처리할 데이터 없음', processedRows: 0 };
    }

    const headers = values[0];
    const dataRows = values.slice(1);

    // 컬럼 인덱스를 헤더 기반으로 찾기 (견고성 강화)
    const addressIndex = headers.indexOf('address');
    const rankIndex = headers.indexOf('rank');
    const isActiveIndex = headers.indexOf('is_active');
    const firstStakeTimeIndex = headers.indexOf('first_stake_time');
    const unstakeCountIndex = headers.indexOf('unstake_count');
    const totalStakedIndex = headers.indexOf('total_staked');
    const totalScoreAllPhasesIndex = headers.indexOf('total_score_all_phases');
    const gradeIndex = headers.indexOf('grade'); // Phase 4용
    const timeScoreIndex = headers.indexOf('time_score'); // 포인트 합산용

    // 필수 컬럼 확인
    if ([addressIndex, rankIndex, isActiveIndex, firstStakeTimeIndex, unstakeCountIndex, totalStakedIndex, totalScoreAllPhasesIndex, gradeIndex, timeScoreIndex].includes(-1)) {
        throw new Error("하나 이상의 필수 컬럼(address, rank, grade, is_active, total_staked, total_score_all_phases, time_score 등)을 시트에서 찾을 수 없습니다.");
    }
    
    // --- Phase 4: 선물상자 시스템을 위한 데이터 준비 ---
    const boxDataMap = new Map();
    try {
        const boxSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BOX_DAILY_SHEET);
        if (boxSheet) {
            const boxValues = boxSheet.getDataRange().getValues();
            const boxAddressIndex = 0; // A열
            const boxPointsIndex = 9;  // J열
            const boxCountIndex = 10;  // K열

            // 헤더 제외하고 1행부터 시작
            for (let i = 1; i < boxValues.length; i++) {
                const row = boxValues[i];
                const address = String(row[boxAddressIndex]).toLowerCase();
                if (!address) continue;

                const points = parseFloat(row[boxPointsIndex]) || 0;
                const count = parseInt(row[boxCountIndex]) || 0;

                if (boxDataMap.has(address)) {
                    const existing = boxDataMap.get(address);
                    existing.totalPoints += points;
                    existing.totalBoxes += count;
                } else {
                    boxDataMap.set(address, { totalPoints: points, totalBoxes: count });
                }
            }
            console.log(`📦 ${BOX_DAILY_SHEET} 시트에서 ${boxDataMap.size}명의 상자 데이터 집계 완료.`);
        } else {
            console.warn(`⚠️ ${BOX_DAILY_SHEET} 시트를 찾을 수 없어 상자 데이터를 스킵합니다.`);
        }
    } catch (e) {
        console.error(`❌ ${BOX_DAILY_SHEET} 시트 처리 중 오류 발생:`, e);
    }
    // ----------------------------------------------------

    // --- Phase 3: 그릴온도 시스템을 위한 데이터 준비 ---
    // 1. 활성 유저 필터링
    const activeUsers = dataRows.map((row, index) => ({
        address: row[addressIndex],
        totalScore: parseFloat(row[totalScoreAllPhasesIndex]) || 0,
        totalStaked: parseFloat(row[totalStakedIndex]) || 0,
        originalIndex: index // 원래 순서를 기억하여 나중에 매칭
    })).filter(user => dataRows[user.originalIndex][isActiveIndex] === true || String(dataRows[user.originalIndex][isActiveIndex]).toLowerCase() === 'true');

    // 2. total_score_all_phases 기준으로 정렬하여 파워 랭킹 부여
    activeUsers.sort((a, b) => b.totalScore - a.totalScore);
    
    // 3. 파워 랭킹을 Map에 저장하여 빠른 조회를 위함 (key: address, value: { rank, totalStaked })
    const powerRankMap = new Map();
    activeUsers.forEach((user, index) => {
        powerRankMap.set(user.address, {
            powerRank: index + 1,
            totalStaked: user.totalStaked
        });
    });
    console.log(`🔥 활성 사용자 ${activeUsers.length}명의 파워 랭킹 계산 완료.`);
    // ----------------------------------------------------

    // 업데이트할 18개 컬럼 데이터를 담을 2차원 배열
    const newColumnsUpdateData = [];
    const totalScoresUpdateData = []; // 총점 업데이트용 배열

    dataRows.forEach(row => {
      const address = row[addressIndex];
      const rank = row[rankIndex];
      const grade = row[gradeIndex];
      const isActive = row[isActiveIndex] === true || String(row[isActiveIndex]).toLowerCase() === 'true';
      const firstStakeTime = row[firstStakeTimeIndex];
      const unstakeCount = row[unstakeCountIndex];
      const timeScore = parseFloat(row[timeScoreIndex]) || 0;

      // Phase 1-2 & 2: 단순 값 설정
      const referralCode = generateReferralCode(address); // V
      const referredBy = ''; // W
      const referralCount = 0; // X
      const referralBonusEarned = 0; // Y
      const virtualStaked = 0; // Z
      const phaseParticipation = 'P1'; // AK
      const bestRankAchieved = rank; // AL
      const genesisQualified = isActive && checkGenesisQualification(firstStakeTime, unstakeCount); // AM

      // Phase 4: 선물상자 시스템
      const userBoxData = boxDataMap.get(address.toLowerCase()) || { totalPoints: 0, totalBoxes: 0 };
      const boxPointsEarned = userBoxData.totalPoints; // AJ
      
      // 총점 재계산 (핵심)
      const totalScore = timeScore + referralBonusEarned + boxPointsEarned;
      totalScoresUpdateData.push([totalScore]);

      // Phase 3: 그릴온도 시스템
      let grillTemperature = 0;
      let pointsPerSecond = 0;
      let predictedNextTier = 'Jeeted';

      if (isActive && powerRankMap.has(address)) {
        const { powerRank, totalStaked } = powerRankMap.get(address);
        
        grillTemperature = calculateImprovedGrillTemperature(powerRank, activeUsers.length);
        pointsPerSecond = totalStaked / (24 * 60 * 60);
        predictedNextTier = predictNextPhaseTier(grillTemperature);
      }
      
      const temperatureTrend = ''; // AD (폐기)

      // Phase 4 값들
      const currentBoxType = ''; // AE - 이 값은 box_sync를 통해 개별 처리되므로 여기서는 비워둠
      const boxDropTime = ''; // AF
      const boxExpireTime = ''; // AG
      const nextBoxDrop = ''; // AH
      const totalBoxesOpened = userBoxData.totalBoxes; // AI
      
      // 마스터 플랜 순서에 맞게 배열 생성 (V-AM, 총 18개 컬럼)
      const newRowData = [
        referralCode, referredBy, referralCount, referralBonusEarned, // V-Y
        virtualStaked, // Z
        grillTemperature, pointsPerSecond, predictedNextTier, temperatureTrend, // AA-AD
        currentBoxType, boxDropTime, boxExpireTime, nextBoxDrop, totalBoxesOpened, boxPointsEarned, // AE-AJ
        phaseParticipation, bestRankAchieved, genesisQualified // AK-AM
      ];

      newColumnsUpdateData.push(newRowData);
    });

    // V열(22번째 컬럼)부터 18개 컬럼에 대해 한 번에 업데이트
    if (newColumnsUpdateData.length > 0) {
      sheet.getRange(2, 22, newColumnsUpdateData.length, 18).setValues(newColumnsUpdateData);
      // 총점(total_score_all_phases, N열) 업데이트
      sheet.getRange(2, totalScoreAllPhasesIndex + 1, totalScoresUpdateData.length, 1).setValues(totalScoresUpdateData);
      console.log(`✅ [Batch] ${newColumnsUpdateData.length}개 행의 신규 컬럼 및 총점 업데이트 완료.`);
    }

    return { success: true, processedRows: newColumnsUpdateData.length };

  } catch (error) {
    console.error('❌ [Batch] 신규 18개 컬럼 처리 실패:', error.toString());
    return { success: false, error: error.toString(), processedRows: 0 };
  }
}

// 🆕 그릴온도 기반 다음 페이즈 예상 티어
function predictNextPhaseTier(grillTemp) {
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

      const enhanceResult = updateNewColumnsInBatch(getTargetSheet());
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

// 🆕 디버그 로그 테스트 함수
function testDebugLog() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let logSheet = spreadsheet.getSheetByName('debug_log');

  if (!logSheet) {
    logSheet = spreadsheet.insertSheet('debug_log');
    logSheet.getRange(1, 1, 1, 5).setValues([['Timestamp', 'Mode', 'Data Count', 'Action', 'Details']]);
    logSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
    console.log('✅ debug_log 시트 생성 완료');
  } else {
    console.log('✅ debug_log 시트 이미 존재');
  }

  // 테스트 로그 추가
  logSheet.appendRow([new Date(), 'test', 0, '테스트', '시트 생성 확인']);
}
// 박스 시트 합산 디버그
function testBoxPointsUpdate() {
  // 특정 주소로 테스트
  const testAddress = '0x...' // 박스 포인트가 있는 주소

  console.log('🔍 box_daily 시트 확인');
  const dailySheet = getBoxDailySheet();
  const dailyData = dailySheet.getDataRange().getValues();

  let found = false;
  for (let i = 1; i < dailyData.length; i++) {
    if (dailyData[i][0].toLowerCase() === testAddress.toLowerCase()) {
      console.log('✅ 찾음:', dailyData[i]);
      found = true;
    }
  }

  if (!found) {
    console.log('❌ box_daily에서 못 찾음');
  }

  // Master 시트 업데이트 테스트
  const masterSheet = getMasterSheet();
  updateMainSheetBoxPoints(testAddress, masterSheet);

  console.log('📊 Master 시트 확인');
  const userRow = findOrCreateUserRow(masterSheet, testAddress);
  console.log('박스 개수:', masterSheet.getRange(userRow, 35).getValue());
  console.log('박스 포인트:', masterSheet.getRange(userRow, 36).getValue());
}

function testUpdateLiveSheet() {
  const testData = [{
    address: '0x123...',
    rank: 1,
    total_staked: 1000
    // ... 다른 필드들
  }];

  const result = updateLiveSheet(testData);
  console.log('반환값:', JSON.stringify(result));
  console.log('updatedAddresses 있음?', !!result.updatedAddresses);
  console.log('updatedAddresses 길이:', result.updatedAddresses ? result.updatedAddresses.length : 'undefined');
}

/**
 * [신규] 증분 모드용 39컬럼 처리 함수
 * 변경된 주소에 대해서만 신규 컬럼들을 계산하고 업데이트합니다.
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet 처리할 시트 객체
 * @param {string[]} updatedAddresses 변경된 주소 목록
 * @returns {{success: boolean, processedRows: number, error?: string}} 처리 결과
 */
function processIncrementalEnhancement(sheet, updatedAddresses) {
  try {
    if (!updatedAddresses || updatedAddresses.length === 0) {
      console.log('🔍 증분 처리할 주소가 없습니다. 건너뜁니다.');
      return { success: true, processedRows: 0 };
    }
    console.log(`🔄 [Incremental] ${updatedAddresses.length}개 주소에 대한 증분 처리 시작`);
    
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values[0];

    // 컬럼 인덱스 찾기
    const addressIndex = headers.indexOf('address');
    const gradeIndex = headers.indexOf('grade');
    const isActiveIndex = headers.indexOf('is_active');
    const firstStakeTimeIndex = headers.indexOf('first_stake_time');
    const unstakeCountIndex = headers.indexOf('unstake_count');
    const totalStakedIndex = headers.indexOf('total_staked');
    const totalScoreAllPhasesIndex = headers.indexOf('total_score_all_phases');
    const timeScoreIndex = headers.indexOf('time_score');
    const referralBonusEarnedIndex = headers.indexOf('referral_bonus_earned');
    const boxPointsEarnedIndex = headers.indexOf('box_points_earned');

    // box_daily 데이터 집계 (Full 모드와 동일한 로직)
    const boxDataMap = new Map();
    try {
        const boxSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(BOX_DAILY_SHEET);
        if (boxSheet) {
            const boxValues = boxSheet.getDataRange().getValues();
            for (let i = 1; i < boxValues.length; i++) {
                const address = String(boxValues[i][0]).toLowerCase();
                if (!address) continue;
                const points = parseFloat(boxValues[i][9]) || 0;
                const count = parseInt(boxValues[i][10]) || 0;
                if (boxDataMap.has(address)) {
                    const existing = boxDataMap.get(address);
                    existing.totalPoints += points;
                    existing.totalBoxes += count;
                } else {
                    boxDataMap.set(address, { totalPoints: points, totalBoxes: count });
                }
            }
        }
    } catch (e) {
      console.error(`❌ ${BOX_DAILY_SHEET} 시트 처리 중 오류(증분):`, e);
    }
    
    // 주소와 행 인덱스 매핑
    const addressToRowIndexMap = new Map();
    values.slice(1).forEach((row, index) => {
      addressToRowIndexMap.set(String(row[addressIndex]).toLowerCase(), index + 2); // 시트 행 번호는 2부터 시작
    });

    // 전체 활성 사용자 데이터 수집 (그릴온도 계산용)
    const activeUsersForRanking = values.slice(1).map((row, index) => ({
      address: row[addressIndex],
      totalScore: parseFloat(row[totalScoreAllPhasesIndex]) || 0,
      isActive: row[isActiveIndex] === true || String(row[isActiveIndex]).toLowerCase() === 'true'
    })).filter(u => u.isActive);
    
    activeUsersForRanking.sort((a, b) => b.totalScore - a.totalScore);
    const powerRankMap = new Map();
    activeUsersForRanking.forEach((user, index) => {
        powerRankMap.set(user.address, { powerRank: index + 1 });
    });

    let processedCount = 0;
    
    // 업데이트할 주소들만 순회
    for (const address of updatedAddresses) {
      const rowNum = addressToRowIndexMap.get(String(address).toLowerCase());
      if (!rowNum) continue;

      const row = values[rowNum - 1]; // values 배열은 0부터 시작
      
      // 필요한 데이터 추출
      const rank = row[headers.indexOf('rank')];
      const grade = row[gradeIndex];
      const isActive = row[isActiveIndex] === true || String(row[isActiveIndex]).toLowerCase() === 'true';
      const firstStakeTime = row[firstStakeTimeIndex];
      const unstakeCount = row[unstakeCountIndex];
      const totalStaked = parseFloat(row[totalStakedIndex]) || 0;
      const timeScore = parseFloat(row[timeScoreIndex]) || 0;

      // 18개 컬럼 값 계산
      const referralCode = generateReferralCode(address);
      const referralBonusEarned = 0; // Phase 2: 일단 0으로 고정
      const userBoxData = boxDataMap.get(address.toLowerCase()) || { totalPoints: 0, totalBoxes: 0 };
      const boxPointsEarned = userBoxData.totalPoints;
      const genesisQualified = isActive && checkGenesisQualification(firstStakeTime, unstakeCount);
      
      // 총점 재계산 (핵심)
      const totalScore = timeScore + referralBonusEarned + boxPointsEarned;

      let grillTemperature = 0, pointsPerSecond = 0, predictedNextTier = 'Jeeted';
      if (isActive && powerRankMap.has(address)) {
        const { powerRank } = powerRankMap.get(address);
        grillTemperature = calculateImprovedGrillTemperature(powerRank, activeUsersForRanking.length);
        pointsPerSecond = totalStaked / (24 * 60 * 60);
        predictedNextTier = predictNextPhaseTier(grillTemperature);
      }
      
      // 개별 셀 업데이트
      sheet.getRange(rowNum, totalScoreAllPhasesIndex + 1).setValue(totalScore); // 총점 업데이트
      sheet.getRange(rowNum, 22, 1, 18).setValues([[
        referralCode, '', referralBonusEarned, referralBonusEarned, // V-Y
        0, // Z
        grillTemperature, pointsPerSecond, predictedNextTier, '', // AA-AD
        '', '', '', '', userBoxData.totalBoxes, boxPointsEarned, // AE-AJ
        'P1', rank, genesisQualified // AK-AM
      ]]);
      
      processedCount++;
    }

    console.log(`✅ [Incremental] ${processedCount}개 행 증분 처리 완료`);
    return { success: true, processedRows: processedCount };

  } catch (error) {
    console.error('❌ [Incremental] 증분 처리 실패:', error.toString());
    return { success: false, error: error.toString(), processedRows: 0 };
  }
}

