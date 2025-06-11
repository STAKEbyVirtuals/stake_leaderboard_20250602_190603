# === STAKE 리더보드 통합 시스템 (Apps Script Web App 연동) ===
import requests
import pandas as pd
import json
import logging
import time
import schedule
from datetime import datetime, timezone
from collections import defaultdict
import traceback
import os

# === 체크포인트 관리 함수들 ===
def load_checkpoint():
    """체크포인트 파일 로드"""
    checkpoint_file = 'checkpoint.json'
    try:
        with open(checkpoint_file, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # 초기 체크포인트 생성
        initial_checkpoint = {
            "last_full_scan": {
                "block": GENESIS_BLOCK,
                "timestamp": None,
                "total_users": 0
            },
            "last_incremental": {
                "block": GENESIS_BLOCK,
                "timestamp": None
            },
            "genesis_scan_completed": False
        }
        save_checkpoint(initial_checkpoint)
        return initial_checkpoint

def save_checkpoint(checkpoint_data):
    """체크포인트 파일 저장"""
    checkpoint_file = 'checkpoint.json'
    with open(checkpoint_file, 'w') as f:
        json.dump(checkpoint_data, f, indent=2)
    logger.info(f"✅ 체크포인트 저장 완료")

# 로깅 설정
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('stake_leaderboard.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# === 설정 변경: Sheet.best → Apps Script Web App ===
SAFE_MODE = os.environ.get('SAFE_MODE', 'false').lower() == 'true'
UPDATE_RANGE = os.environ.get('UPDATE_RANGE', 'A:U')

if SAFE_MODE:
    logger.info("🛡️ 안전 모드 활성화: 기존 21개 컬럼만 업데이트")
    logger.info(f"📊 업데이트 범위: {UPDATE_RANGE}")
else:
    logger.info("⚠️ 일반 모드: 전체 범위 업데이트")

# === 설정 ===
RPC_URL = "https://mainnet.base.org"
STAKING_ADDRESS = "0xBa13ae24684bee910820Be1Fcf52067332F8412f"
TOKEN_ADDRESS = "0xA9C8bDDcb113068713193D030abB86C7e8D1F5bB"
STAKE_METHOD_ID = "0xa694fc3a"
UNSTAKE_METHOD_ID = "0xf48355b9"
GENESIS_BLOCK = 30732159

# 🚀 Apps Script Web App URL (GitHub Actions 환경변수 사용)
APPS_SCRIPT_WEB_APP_URL = os.environ.get('APPS_SCRIPT_WEB_APP_URL')

if not APPS_SCRIPT_WEB_APP_URL:
    # 로컬 개발 시 기본값
    APPS_SCRIPT_WEB_APP_URL = ''
    logger.warning("⚠️ APPS_SCRIPT_WEB_APP_URL 환경변수가 설정되지 않았습니다.")
else:
    logger.info(f"✅ Apps Script Web App URL 설정 완료: {APPS_SCRIPT_WEB_APP_URL[:50]}...")

# 페이즈 설정
CURRENT_PHASE = 1
TOTAL_PHASES = 6
TOTAL_SUPPLY = 1_000_000_000
AIRDROP_PERCENT = 0.25
PHASE_REWARD = (TOTAL_SUPPLY * AIRDROP_PERCENT) / TOTAL_PHASES

# 전체 데이터 저장소
staking_data = defaultdict(lambda: {
    'total_staked': 0,
    'stake_count': 0,
    'unstake_count': 0,
    'unstake_attempts': [],
    'is_active': True,
    'first_stake_time': None,
    'last_action_time': None,
    'stake_transactions': [],
    'unstake_transactions': []
})

# === 안전 모드용 컬럼 정의 ===
SAFE_MODE_COLUMNS = [
    'address', 'rank', 'grade', 'grade_emoji', 'percentile',
    'total_staked', 'time_score', 'holding_days', 'stake_count', 'unstake_count',
    'is_active', 'current_phase', 'phase_score', 'total_score_all_phases',
    'airdrop_share_phase', 'airdrop_share_total', 'first_stake_time', 'last_action_time',
    'rank_change_24h', 'score_change_24h', 'phase_rank_history'
]

def apply_safe_mode_filter(data):
    """안전 모드: 기존 21개 컬럼만 필터링"""
    if not SAFE_MODE:
        return data
    
    logger.info("🛡️ 안전 모드 필터 적용: 21개 컬럼만 추출")
    
    filtered_data = []
    for item in data:
        filtered_item = {}
        for column in SAFE_MODE_COLUMNS:
            filtered_item[column] = item.get(column, '')
        filtered_data.append(filtered_item)
    
    logger.info(f"✅ 안전 모드 필터링 완료: {len(filtered_data)}개 항목, {len(SAFE_MODE_COLUMNS)}개 컬럼")
    return filtered_data

def rpc_call(method, params):
    """RPC 호출 with 에러 핸들링"""
    try:
        response = requests.post(RPC_URL, json={
            "jsonrpc": "2.0",
            "method": method,
            "params": params,
            "id": 1
        }, timeout=30)
        
        result = response.json()
        if 'error' in result:
            logger.error(f"RPC Error: {result['error']}")
            return None
        return result
    except Exception as e:
        logger.error(f"RPC 호출 실패: {e}")
        return None

def get_latest_block():
    """최신 블록 번호 조회"""
    result = rpc_call("eth_blockNumber", [])
    if result and 'result' in result:
        return int(result['result'], 16)
    return 0

def decode_amount(input_data):
    """스테이킹 수량 디코드"""
    try:
        if len(input_data) < 74:
            return 0
        amount_hex = input_data[10:74]
        return int(amount_hex, 16) / (10**18)
    except:
        return 0

def safe_scan_chunk(start_block, end_block, max_retries=3):
    """안전한 청크 스캔 with 재시도"""
    chunk_size = end_block - start_block + 1
    
    # 1500블록 초과하면 나누기
    if chunk_size > 1500:
        mid = start_block + 1499
        logs1 = safe_scan_chunk(start_block, mid, max_retries)
        logs2 = safe_scan_chunk(mid + 1, end_block, max_retries)
        return logs1 + logs2
    
    # 재시도 로직
    for attempt in range(max_retries):
        try:
            result = rpc_call("eth_getLogs", [{
                "fromBlock": hex(start_block),
                "toBlock": hex(end_block),
                "address": STAKING_ADDRESS
            }])
            
            if result and 'error' in result:
                if chunk_size > 1000:
                    mid = start_block + 999
                    logs1 = safe_scan_chunk(start_block, mid, max_retries)
                    logs2 = safe_scan_chunk(mid + 1, end_block, max_retries)
                    return logs1 + logs2
                else:
                    logger.warning(f"청크 스캔 실패: {result['error']}")
                    return []
            
            elif result and 'result' in result:
                return result['result']
            else:
                logger.warning(f"빈 결과: 블록 {start_block}-{end_block}")
                return []
                
        except Exception as e:
            logger.error(f"청크 스캔 시도 {attempt + 1} 실패: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)
            
    return []

def calculate_grade_percentile(data, genesis_deadline, all_active_wallets):
    """등급 계산 (퍼센타일 기준)"""
    # Genesis: 제네시스 블록 이후 1일 내 스테이킹 + 언스테이킹 시도 없음
    if (data['first_stake_time'] and 
        data['first_stake_time'] <= genesis_deadline and 
        data['is_active'] and 
        data['unstake_count'] == 0):
        return "Genesis OG", 0.0
    
    # 언스테이킹 시도한 경우
    if not data['is_active']:
        return "Jeeted", 100.0
    
    # 활성 지갑들의 타임스코어 기준 퍼센타일 계산
    current_time = int(datetime.now(timezone.utc).timestamp())
    holding_days = (current_time - data['first_stake_time']) / 86400 if data['first_stake_time'] else 0
    time_score = data['total_staked'] * holding_days
    
    # 모든 활성 지갑의 타임스코어 계산
    all_scores = []
    for _, wallet_data in all_active_wallets:
        if wallet_data['first_stake_time']:
            w_holding_days = (current_time - wallet_data['first_stake_time']) / 86400
            w_time_score = wallet_data['total_staked'] * w_holding_days
            all_scores.append(w_time_score)
    
    if not all_scores:
        return "Sizzlin' Noob", 100.0
    
    all_scores.sort(reverse=True)
    rank = len([s for s in all_scores if s > time_score]) + 1
    percentile = (rank / len(all_scores)) * 100
    
    # 퍼센타일 기준 등급
    if percentile <= 0.5:
        return "Smoke Flexer", percentile
    elif percentile <= 2:
        return "Steak Wizard", percentile
    elif percentile <= 5:
        return "Grilluminati", percentile
    elif percentile <= 15:
        return "Flame Juggler", percentile
    elif percentile <= 40:
        return "Flipstarter", percentile
    else:
        return "Sizzlin' Noob", percentile

def get_grade_emoji(grade):
    """등급별 이모지"""
    grade_emojis = {
        "Genesis OG": "🌌",
        "Smoke Flexer": "🔥",
        "Steak Wizard": "🎭",
        "Grilluminati": "👁️",
        "Flame Juggler": "🔥",
        "Flipstarter": "🥩",
        "Sizzlin' Noob": "🔰",
        "Jeeted": "💀"
    }
    return grade_emojis.get(grade, "❓")

def extract_all_stake_data():
    """완전한 STAKE 데이터 추출"""
    logger.info("🚀 전체 STAKE 데이터 추출 시작...")
    
    try:
        latest_block = get_latest_block()
        if not latest_block:
            raise Exception("최신 블록 조회 실패")
        
        total_blocks = latest_block - GENESIS_BLOCK
        logger.info(f"📊 스캔 범위: {GENESIS_BLOCK:,} → {latest_block:,} ({total_blocks:,}블록)")
        
        # 초기화
        staking_data.clear()
        
        total_stake_txs = 0
        total_unstake_txs = 0
        processed = 0
        
        current_block = GENESIS_BLOCK
        chunk_num = 1
        
        while current_block <= latest_block:
            chunk_end = min(current_block + 1499, latest_block)
            chunk_size = chunk_end - current_block + 1
            
            progress = processed / total_blocks * 100
            logger.info(f"🔄 {progress:.1f}% | 청크#{chunk_num} | 블록 {current_block:,}→{chunk_end:,}")
            
            logs = safe_scan_chunk(current_block, chunk_end)
            
            if not logs:
                current_block = chunk_end + 1
                processed += chunk_size
                chunk_num += 1
                continue
            
            # 트랜잭션 처리
            tx_hashes = list(set(log['transactionHash'] for log in logs))
            
            for tx_hash in tx_hashes:
                try:
                    tx_result = rpc_call("eth_getTransactionByHash", [tx_hash])
                    
                    if not tx_result or 'result' not in tx_result or not tx_result['result']:
                        continue
                    
                    tx = tx_result['result']
                    input_data = tx.get('input', '0x')
                    
                    if len(input_data) >= 10:
                        method_id = input_data[:10]
                        from_addr = tx['from'].lower()
                        block_num = int(tx['blockNumber'], 16)
                        
                        # 블록 타임스탬프
                        block_result = rpc_call("eth_getBlockByNumber", [tx['blockNumber'], False])
                        timestamp = 0
                        if block_result and 'result' in block_result and block_result['result']:
                            timestamp = int(block_result['result']['timestamp'], 16)
                        
                        if method_id == STAKE_METHOD_ID:
                            # 스테이킹 트랜잭션
                            amount = decode_amount(input_data)
                            
                            staking_data[from_addr]['total_staked'] += amount
                            staking_data[from_addr]['stake_count'] += 1
                            staking_data[from_addr]['is_active'] = True
                            
                            if not staking_data[from_addr]['first_stake_time']:
                                staking_data[from_addr]['first_stake_time'] = timestamp
                            
                            staking_data[from_addr]['last_action_time'] = timestamp
                            
                            staking_data[from_addr]['stake_transactions'].append({
                                'amount': amount,
                                'block': block_num,
                                'timestamp': timestamp,
                                'hash': tx_hash
                            })
                            
                            total_stake_txs += 1
                        
                        elif method_id == UNSTAKE_METHOD_ID:
                            # 언스테이킹 시도
                            staking_data[from_addr]['unstake_count'] += 1
                            staking_data[from_addr]['is_active'] = False
                            staking_data[from_addr]['last_action_time'] = timestamp
                            
                            staking_data[from_addr]['unstake_attempts'].append({
                                'block': block_num,
                                'timestamp': timestamp,
                                'hash': tx_hash
                            })
                            
                            total_unstake_txs += 1
                
                except Exception as e:
                    continue
                    
                time.sleep(0.005)
            
            current_block = chunk_end + 1
            processed += chunk_size
            chunk_num += 1
            time.sleep(0.1)
        
        logger.info(f"🎉 데이터 추출 완료!")
        logger.info(f"   총 Stake 트랜잭션: {total_stake_txs:,}개")
        logger.info(f"   총 Unstake 시도: {total_unstake_txs:,}개")
        logger.info(f"   총 지갑 수: {len(staking_data):,}개")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 데이터 추출 실패: {e}")
        logger.error(traceback.format_exc())
        return False
    
def extract_incremental_stake_data():
    """증분 모드: 최근 변경사항만 추출"""
    logger.info("🚀 증분 STAKE 데이터 추출 시작...")
    
    try:
        # 체크포인트 로드
        checkpoint = load_checkpoint()
        latest_block = get_latest_block()
        
        if not latest_block:
            raise Exception("최신 블록 조회 실패")
        
        # 🆕 초기 스캔이 없으면 최근 블록만 처리
        if not checkpoint.get('genesis_scan_completed', False):
            logger.warning("⚠️ 초기 전체 스캔이 아직 실행되지 않았습니다.")
            logger.info("📊 최근 10,000블록만 스캔합니다.")
            
            # 최근 10,000블록부터 시작
            start_block = max(GENESIS_BLOCK, latest_block - 10000)
            
            # 백업 데이터 로드 시도
            try:
                import glob
                backup_files = glob.glob('backup/stake_leaderboard_*.json')
                if backup_files:
                    latest_backup = max(backup_files)
                    logger.info(f"📂 백업 파일 발견: {latest_backup}")
                    with open(latest_backup, 'r') as f:
                        backup_data = json.load(f)
                        # staking_data 복원
                        for item in backup_data:
                            addr = item['address'].lower()
                            staking_data[addr] = {
                                'total_staked': item.get('total_staked', 0),
                                'stake_count': item.get('stake_count', 0),
                                'unstake_count': item.get('unstake_count', 0),
                                'unstake_attempts': [],
                                'is_active': item.get('is_active', True),
                                'first_stake_time': item.get('first_stake_time'),
                                'last_action_time': item.get('last_action_time'),
                                'stake_transactions': [],
                                'unstake_transactions': []
                            }
                        logger.info(f"✅ {len(staking_data)}개 기존 데이터 로드 완료")
                else:
                    # public/leaderboard.json 시도
                    if os.path.exists('../public/leaderboard.json'):
                        with open('../public/leaderboard.json', 'r') as f:
                            public_data = json.load(f)
                            if 'leaderboard' in public_data:
                                for item in public_data['leaderboard']:
                                    addr = item['address'].lower()
                                    staking_data[addr] = {
                                        'total_staked': item.get('total_staked', 0),
                                        'stake_count': item.get('stake_count', 0),
                                        'unstake_count': item.get('unstake_count', 0),
                                        'unstake_attempts': [],
                                        'is_active': item.get('is_active', True),
                                        'first_stake_time': item.get('first_stake_time'),
                                        'last_action_time': item.get('last_action_time'),
                                        'stake_transactions': [],
                                        'unstake_transactions': []
                                    }
                                logger.info(f"✅ public에서 {len(staking_data)}개 데이터 로드")
            except Exception as e:
                logger.warning(f"⚠️ 기존 데이터 로드 실패: {e}")
                logger.info("🆕 새로운 데이터로 시작합니다.")
        else:
            # 정상적인 증분 처리
            start_block = checkpoint['last_incremental']['block'] + 1
            
            # 너무 많은 블록 방지 (최대 10,000블록)
            if latest_block - start_block > 10000:
                start_block = latest_block - 10000
                logger.warning(f"⚠️ 블록 범위 제한: 최근 10,000블록만 스캔")
        
        if start_block > latest_block:
            logger.info("✅ 새로운 블록 없음")
            return True
        
        total_blocks = latest_block - start_block
        logger.info(f"📊 증분 스캔 범위: {start_block:,} → {latest_block:,} ({total_blocks:,}블록)")
        
        # 기존 데이터 유지 (전체 초기화하지 않음)
        # staking_data는 전역 변수이므로 기존 데이터 유지됨
        
        total_stake_txs = 0
        total_unstake_txs = 0
        processed = 0
        
        current_block = start_block
        chunk_num = 1
        
        while current_block <= latest_block:
            chunk_end = min(current_block + 1499, latest_block)
            chunk_size = chunk_end - current_block + 1
            
            progress = processed / total_blocks * 100
            logger.info(f"🔄 증분 {progress:.1f}% | 청크#{chunk_num} | 블록 {current_block:,}→{chunk_end:,}")
            
            logs = safe_scan_chunk(current_block, chunk_end)
            
            if not logs:
                current_block = chunk_end + 1
                processed += chunk_size
                chunk_num += 1
                continue
            
            # 트랜잭션 처리 (기존 로직 재사용)
            tx_hashes = list(set(log['transactionHash'] for log in logs))
            
            for tx_hash in tx_hashes:
                try:
                    tx_result = rpc_call("eth_getTransactionByHash", [tx_hash])
                    
                    if not tx_result or 'result' not in tx_result or not tx_result['result']:
                        continue
                    
                    tx = tx_result['result']
                    input_data = tx.get('input', '0x')
                    
                    if len(input_data) >= 10:
                        method_id = input_data[:10]
                        from_addr = tx['from'].lower()
                        block_num = int(tx['blockNumber'], 16)
                        
                        # 블록 타임스탬프
                        block_result = rpc_call("eth_getBlockByNumber", [tx['blockNumber'], False])
                        timestamp = 0
                        if block_result and 'result' in block_result and block_result['result']:
                            timestamp = int(block_result['result']['timestamp'], 16)
                        
                        if method_id == STAKE_METHOD_ID:
                            # 스테이킹 트랜잭션
                            amount = decode_amount(input_data)
                            
                            staking_data[from_addr]['total_staked'] += amount
                            staking_data[from_addr]['stake_count'] += 1
                            staking_data[from_addr]['is_active'] = True
                            
                            if not staking_data[from_addr]['first_stake_time']:
                                staking_data[from_addr]['first_stake_time'] = timestamp
                            
                            staking_data[from_addr]['last_action_time'] = timestamp
                            
                            staking_data[from_addr]['stake_transactions'].append({
                                'amount': amount,
                                'block': block_num,
                                'timestamp': timestamp,
                                'hash': tx_hash
                            })
                            
                            total_stake_txs += 1
                            logger.info(f"✅ 새 스테이킹: {from_addr[:8]}... +{amount:.4f}")
                        
                        elif method_id == UNSTAKE_METHOD_ID:
                            # 언스테이킹 시도
                            staking_data[from_addr]['unstake_count'] += 1
                            staking_data[from_addr]['is_active'] = False
                            staking_data[from_addr]['last_action_time'] = timestamp
                            
                            staking_data[from_addr]['unstake_attempts'].append({
                                'block': block_num,
                                'timestamp': timestamp,
                                'hash': tx_hash
                            })
                            
                            total_unstake_txs += 1
                            logger.info(f"❌ 언스테이킹: {from_addr[:8]}...")
                
                except Exception as e:
                    continue
                    
                time.sleep(0.005)
            
            current_block = chunk_end + 1
            processed += chunk_size
            chunk_num += 1
            time.sleep(0.1)
        
        # 체크포인트 업데이트
        checkpoint['last_incremental'] = {
            'block': latest_block,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        save_checkpoint(checkpoint)
        
        logger.info(f"🎉 증분 데이터 추출 완료!")
        logger.info(f"   새 Stake 트랜잭션: {total_stake_txs:,}개")
        logger.info(f"   새 Unstake 시도: {total_unstake_txs:,}개")
        logger.info(f"   영향받은 지갑: {total_stake_txs + total_unstake_txs}개")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ 증분 데이터 추출 실패: {e}")
        logger.error(traceback.format_exc())
        return False    

def process_leaderboard_data():
    """리더보드 데이터 처리 및 생성 (안전 모드 지원)"""
    logger.info("📊 리더보드 데이터 처리 시작...")
    
    try:
        # 제네시스 블록 타임스탬프 계산
        block_result = rpc_call("eth_getBlockByNumber", [hex(GENESIS_BLOCK), False])
        genesis_timestamp = 0
        if block_result and 'result' in block_result and block_result['result']:
            genesis_timestamp = int(block_result['result']['timestamp'], 16)
        
        genesis_deadline = genesis_timestamp + 86400  # 1일 후
        
        # 활성 지갑만 추출
        all_wallets = [(addr, data) for addr, data in staking_data.items() if data['total_staked'] > 0]
        active_wallets = [(addr, data) for addr, data in all_wallets if data['is_active']]
        
        # 타임스코어 기준 정렬
        sorted_wallets = sorted(all_wallets, key=lambda x: (
            x[1]['total_staked'] * ((int(datetime.now(timezone.utc).timestamp()) - x[1]['first_stake_time']) / 86400)
            if x[1]['first_stake_time'] else 0
        ), reverse=True)
        
        leaderboard_data = []
        total_time_score = 0
        
        # 전체 타임스코어 계산 (에어드랍 비율 계산용)
        current_time = int(datetime.now(timezone.utc).timestamp())
        for _, data in active_wallets:
            if data['first_stake_time']:
                holding_days = (current_time - data['first_stake_time']) / 86400
                total_time_score += data['total_staked'] * holding_days
        
        for rank, (address, data) in enumerate(sorted_wallets, 1):
            # 등급 및 퍼센타일 계산
            grade, percentile = calculate_grade_percentile(data, genesis_deadline, active_wallets)
            
            # 타임스코어 계산
            holding_days = 0
            time_score = 0
            if data['first_stake_time']:
                holding_days = (current_time - data['first_stake_time']) / 86400
                time_score = data['total_staked'] * holding_days
            
            # 에어드랍 할당 비율 계산
            airdrop_share_phase = 0
            airdrop_share_total = 0
            if data['is_active'] and total_time_score > 0:
                airdrop_share_phase = (time_score / total_time_score) * 100
                airdrop_share_total = airdrop_share_phase * TOTAL_PHASES
            
            # 24시간 변동 (임시로 0 설정, 향후 이전 데이터와 비교)
            rank_change_24h = 0
            score_change_24h = 0
            
            # 기본 21개 컬럼 데이터
            item_data = {
                'address': address,
                'rank': rank,
                'grade': grade,
                'grade_emoji': get_grade_emoji(grade),
                'percentile': round(percentile, 2),
                'total_staked': round(data['total_staked'], 4),
                'time_score': round(time_score, 2),
                'holding_days': round(holding_days, 1),
                'stake_count': data['stake_count'],
                'unstake_count': data['unstake_count'],
                'is_active': data['is_active'],
                'current_phase': CURRENT_PHASE,
                'phase_score': round(time_score, 2),
                'total_score_all_phases': round(time_score, 2),
                'airdrop_share_phase': round(airdrop_share_phase, 6),
                'airdrop_share_total': round(airdrop_share_total, 6),
                'first_stake_time': data['first_stake_time'],
                'last_action_time': data['last_action_time'],
                'rank_change_24h': rank_change_24h,
                'score_change_24h': score_change_24h,
                'phase_rank_history': f"P1:{rank}"
            }
            
            leaderboard_data.append(item_data)
        
        # 🛡️ 안전 모드 필터 적용
        if SAFE_MODE:
            leaderboard_data = apply_safe_mode_filter(leaderboard_data)
            logger.info("🛡️ 안전 모드: 신규 18개 컬럼은 Apps Script에서 자동 생성됩니다")
        
        logger.info(f"✅ 리더보드 데이터 처리 완료: {len(leaderboard_data)}개 항목")
        return leaderboard_data
        
    except Exception as e:
        logger.error(f"❌ 리더보드 데이터 처리 실패: {e}")
        logger.error(traceback.format_exc())
        return []

def upload_to_apps_script_web_app(data, mode='full'):  # 🆕 mode 파라미터 추가
    """🚀 Apps Script Web App으로 데이터 전송 (JSON 안전 처리)"""
    logger.info("📤 Apps Script Web App 업로드 시작...")
    
    if not data:
        logger.error("❌ 업로드할 데이터가 없습니다")
        return False
    
    if not APPS_SCRIPT_WEB_APP_URL:
        logger.error("❌ APPS_SCRIPT_WEB_APP_URL이 설정되지 않았습니다")
        return save_to_github_pages(data)
    
    if SAFE_MODE:
        logger.info("🛡️ 안전 모드: 기존 21개 컬럼만 업로드")
    
    try:
        # 🔧 데이터 정제 및 안전 처리
        cleaned_data = clean_data_for_json(data)
        logger.info(f"🧹 데이터 정제 완료: {len(cleaned_data)}개 항목")
        
        # 🆕 모드 정보 포함
        request_data = {
            'mode': mode,  # 'incremental' or 'full'
            'data': cleaned_data
        }
        
        # JSON 데이터 준비 (안전한 직렬화)
        json_data = json.dumps(request_data, ensure_ascii=True, separators=(',', ':'))
        
        # 📊 데이터 크기 체크
        data_size_mb = len(json_data.encode('utf-8')) / (1024 * 1024)
        logger.info(f"📊 JSON 크기: {data_size_mb:.2f}MB")
        
        # 크기가 너무 크면 청크 단위로 전송
        if data_size_mb > 5:  # 5MB 초과시
            return upload_large_data_in_chunks(cleaned_data)
        
        headers = {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'STAKE-Leaderboard-GitHub-Action/1.0'
        }
        
        logger.info(f"📤 Apps Script Web App으로 POST 요청")
        logger.info(f"📊 데이터 크기: {len(cleaned_data)}개 항목, {data_size_mb:.2f}MB")
        
        response = requests.post(
            APPS_SCRIPT_WEB_APP_URL,
            data=json_data,
            headers=headers,
            timeout=300  # 5분으로 증가
        )
        
        logger.info(f"📡 Apps Script 응답: {response.status_code}")
        logger.info(f"📄 응답 내용: {response.text[:500]}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get('status') == 'success':
                    logger.info("✅ Apps Script Web App 업로드 성공!")
                    logger.info(f"📊 기본 컬럼 업데이트: {result.get('basic_columns', 0)}개")
                    logger.info(f"🔧 확장 컬럼 처리: {result.get('enhanced_columns', 0)}개")
                    return True
                else:
                    logger.error(f"❌ Apps Script 처리 실패: {result.get('message', 'Unknown error')}")
                    return False
            except json.JSONDecodeError:
                logger.warning("⚠️ Apps Script 응답이 JSON이 아님 (하지만 200 OK)")
                return True
        else:
            logger.error(f"❌ Apps Script Web App 업로드 실패: {response.status_code}")
            logger.error(f"📄 에러 응답: {response.text}")
            return False
        
    except requests.exceptions.Timeout:
        logger.error("⏰ Apps Script Web App 요청 타임아웃 (300초)")
        return False
    except Exception as e:
        logger.error(f"❌ Apps Script Web App 오류: {e}")
        return False

def clean_data_for_json(data):
    """🧹 JSON 안전 처리를 위한 데이터 정제"""
    logger.info("🧹 JSON 안전 처리 시작...")
    
    cleaned_data = []
    
    for item in data:
        cleaned_item = {}
        
        for key, value in item.items():
            # 🔧 특수문자 처리
            if isinstance(value, str):
                # 문제가 될 수 있는 문자들 제거/교체
                cleaned_value = value.replace('\n', ' ').replace('\r', ' ')
                cleaned_value = cleaned_value.replace('\t', ' ').replace('\\', '/')
                cleaned_value = cleaned_value.replace('"', "'").replace('\b', ' ')
                cleaned_value = cleaned_value.replace('\f', ' ').replace('\v', ' ')
                
                # 제어 문자 제거
                cleaned_value = ''.join(char for char in cleaned_value if ord(char) >= 32 or char in ['\n', '\r', '\t'])
                
                # 너무 긴 문자열 자르기
                if len(cleaned_value) > 1000:
                    cleaned_value = cleaned_value[:997] + "..."
                
                cleaned_item[key] = cleaned_value.strip()
                
            elif isinstance(value, (int, float)):
                # 숫자값 안전 처리
                if isinstance(value, float):
                    if value != value:  # NaN 체크
                        cleaned_item[key] = 0
                    elif value == float('inf') or value == float('-inf'):
                        cleaned_item[key] = 0
                    else:
                        cleaned_item[key] = round(value, 6)
                else:
                    cleaned_item[key] = value
                    
            elif isinstance(value, bool):
                cleaned_item[key] = value
                
            elif value is None:
                cleaned_item[key] = ""
                
            else:
                # 기타 타입은 문자열로 변환
                cleaned_item[key] = str(value)
        
        cleaned_data.append(cleaned_item)
    
    logger.info(f"✅ 데이터 정제 완료: {len(cleaned_data)}개 항목")
    return cleaned_data

def upload_large_data_in_chunks(data):
    """📦 대용량 데이터 청크 단위 업로드"""
    logger.info("📦 대용량 데이터 청크 업로드 시작...")
    
    chunk_size = 100  # 100개씩 나누어 전송
    total_chunks = (len(data) + chunk_size - 1) // chunk_size
    
    try:
        for i in range(0, len(data), chunk_size):
            chunk = data[i:i + chunk_size]
            chunk_num = (i // chunk_size) + 1
            
            logger.info(f"📦 청크 {chunk_num}/{total_chunks} 업로드 중... ({len(chunk)}개 항목)")
            
            # 청크 데이터 준비
            chunk_data = {
                "chunk_number": chunk_num,
                "total_chunks": total_chunks,
                "data": chunk,
                "is_chunk": True
            }
            
            json_data = json.dumps(chunk_data, ensure_ascii=True, separators=(',', ':'))
            
            headers = {
                'Content-Type': 'application/json; charset=utf-8',
                'User-Agent': 'STAKE-Leaderboard-GitHub-Action/1.0'
            }
            
            response = requests.post(
                APPS_SCRIPT_WEB_APP_URL,
                data=json_data,
                headers=headers,
                timeout=120
            )
            
            if response.status_code != 200:
                logger.error(f"❌ 청크 {chunk_num} 업로드 실패: {response.status_code}")
                return False
            
            logger.info(f"✅ 청크 {chunk_num}/{total_chunks} 업로드 완료")
            
            # 청크 간 대기
            time.sleep(1)
        
        logger.info("✅ 모든 청크 업로드 완료")
        return True
        
    except Exception as e:
        logger.error(f"❌ 청크 업로드 실패: {e}")
        return False

def save_to_github_pages(data):
    """GitHub Pages용 JSON 파일 생성 및 자동 커밋 (백업용)"""
    logger.info("📄 GitHub Pages용 JSON 파일 생성...")
    
    try:
        # public 폴더 생성
        public_dir = '../public'
        os.makedirs(public_dir, exist_ok=True)
        
        # API 형식으로 데이터 정리
        api_data = {
            "last_updated": datetime.now(timezone.utc).isoformat(),
            "total_wallets": len(data),
            "active_wallets": len([d for d in data if d.get('is_active')]),
            "phase": 1,
            "safe_mode": SAFE_MODE,
            "update_range": UPDATE_RANGE if SAFE_MODE else "A:AM",
            "leaderboard": data[:100]  # 상위 100개
        }
        
        # JSON 파일 저장
        json_file = f'{public_dir}/leaderboard.json'
        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(api_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"✅ JSON 파일 생성: {json_file}")
        logger.info(f"📊 데이터 크기: {len(api_data['leaderboard'])}개 항목")
        
        if SAFE_MODE:
            logger.info("🛡️ 안전 모드: 신규 18개 컬럼은 Apps Script에서 자동 추가됩니다")
        
        # Git 자동 커밋 (GitHub Actions 환경에서)
        try:
            import subprocess
            
            # Git 설정
            subprocess.run(['git', 'config', 'user.name', 'STAKE-Bot'], 
                         cwd='..', check=False)
            subprocess.run(['git', 'config', 'user.email', 'stake-bot@noreply.github.com'], 
                         cwd='..', check=False)
            
            # 파일 추가 및 커밋
            subprocess.run(['git', 'add', 'public/leaderboard.json'], 
                         cwd='..', check=True)
            
            commit_msg = f"Update leaderboard data (Apps Script Web App) - {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
            subprocess.run(['git', 'commit', '-m', commit_msg], 
                         cwd='..', check=True)
            
            subprocess.run(['git', 'push'], cwd='..', check=True)
            
            logger.info("✅ GitHub에 자동 커밋 완료")
            
        except subprocess.CalledProcessError as e:
            logger.warning(f"⚠️ Git 커밋 실패: {e}")
            logger.info("📁 파일은 로컬에 저장됨")
        
        return True
        
    except Exception as e:
        logger.error(f"❌ GitHub Pages 생성 실패: {e}")
        logger.error(traceback.format_exc())
        return False

def save_backup_data(data):
    """백업 데이터 저장"""
    try:
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        safe_mode_suffix = "_safe" if SAFE_MODE else ""
        backup_file = f'backup/stake_leaderboard_{timestamp}{safe_mode_suffix}.json'
        
        # 백업 디렉토리 생성
        os.makedirs('backup', exist_ok=True)
        
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"💾 백업 저장 완료: {backup_file}")
        
        # CSV도 저장
        df = pd.DataFrame(data)
        csv_file = f'backup/stake_leaderboard_{timestamp}{safe_mode_suffix}.csv'
        df.to_csv(csv_file, index=False, encoding='utf-8-sig')
        logger.info(f"💾 CSV 백업 저장 완료: {csv_file}")
        
    except Exception as e:
        logger.error(f"❌ 백업 저장 실패: {e}")

def update_leaderboard():
    """전체 리더보드 업데이트 프로세스 (Apps Script Web App 연동)"""
    logger.info("🎯 === STAKE 리더보드 업데이트 시작 ===")
    
    if SAFE_MODE:
        logger.info("🛡️ 안전 모드: 기존 21개 컬럼만 업데이트")
        logger.info("🔒 신규 18개 컬럼 보호 (Apps Script에서 자동 처리)")
    
    start_time = datetime.now()
    
    try:
        # 1. STAKE 데이터 추출
        if not extract_all_stake_data():
            raise Exception("STAKE 데이터 추출 실패")
        
        # 2. 리더보드 데이터 처리
        leaderboard_data = process_leaderboard_data()
        if not leaderboard_data:
            raise Exception("리더보드 데이터 처리 실패")
        
        # 3. 백업 저장
        save_backup_data(leaderboard_data)
        
        # 4. 🚀 Apps Script Web App 업로드 (전체 모드)
        if not upload_to_apps_script_web_app(leaderboard_data, mode='full'):
            logger.warning("⚠️ Apps Script Web App 실패, GitHub Pages로 전환...")
            if not save_to_github_pages(leaderboard_data):
                raise Exception("모든 업로드 방법 실패")
        
        # 5. 성공 로그
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info("🎉 === 리더보드 업데이트 완료 ===")
        logger.info(f"⏱️ 소요 시간: {duration:.1f}초")
        logger.info(f"📊 처리된 항목: {len(leaderboard_data)}개")
        logger.info(f"📅 완료 시간: {end_time.strftime('%Y-%m-%d %H:%M:%S')}")
        
        if SAFE_MODE:
            logger.info("🛡️ 안전 모드 완료: Apps Script가 신규 컬럼을 자동 계산합니다")
        
    except Exception as e:
        logger.error(f"💥 === 리더보드 업데이트 실패 ===")
        logger.error(f"❌ 오류: {e}")
        logger.error(traceback.format_exc())

def start_scheduler():
    """스케줄러 시작"""
    logger.info("⏰ STAKE 리더보드 스케줄러 시작")
    logger.info(f"📋 설정: 6시간마다 자동 업데이트")
    logger.info(f"🛡️ 안전 모드: {SAFE_MODE}")
    logger.info(f"🚀 Apps Script Web App 연동")
    logger.info(f"🎯 다음 실행: {datetime.now() + pd.Timedelta(hours=6)}")
    
    # 6시간마다 실행
    schedule.every(6).hours.do(update_leaderboard)
    
    # 즉시 한 번 실행
    logger.info("🚀 첫 번째 업데이트 즉시 실행...")
    update_leaderboard()
    
    # 스케줄러 실행
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # 1분마다 체크
        except KeyboardInterrupt:
            logger.info("⏹️ 스케줄러 중지됨")
            break
        except Exception as e:
            logger.error(f"❌ 스케줄러 오류: {e}")
            time.sleep(300)  # 5분 후 재시도

if __name__ == "__main__":
    import sys
    
    logger.info("🥩 STAKE 리더보드 시스템 시작 (Apps Script Web App 연동)")
    logger.info(f"🔗 RPC URL: {RPC_URL}")
    logger.info(f"📋 스테이킹 컨트랙트: {STAKING_ADDRESS}")
    logger.info(f"🎯 제네시스 블록: {GENESIS_BLOCK:,}")
    logger.info(f"📊 현재 페이즈: {CURRENT_PHASE}/{TOTAL_PHASES}")
    logger.info(f"🛡️ 안전 모드: {SAFE_MODE}")
    logger.info(f"🚀 Apps Script Web App: {'설정됨' if APPS_SCRIPT_WEB_APP_URL else '미설정'}")
    
    try:
        # 커맨드라인 인자 확인
        if '--incremental' in sys.argv or os.environ.get('INCREMENTAL_MODE') == 'true':
            logger.info("📈 === 증분 업데이트 모드 ===")
            
            # 1. 증분 데이터 추출
            if not extract_incremental_stake_data():
                raise Exception("증분 데이터 추출 실패")
            
            # 2. 리더보드 데이터 처리
            leaderboard_data = process_leaderboard_data()
            if not leaderboard_data:
                raise Exception("리더보드 데이터 처리 실패")
            
            # 3. 백업 저장
            save_backup_data(leaderboard_data)
            
            # 4. Apps Script Web App 업로드
            if not upload_to_apps_script_web_app(leaderboard_data):
                logger.warning("⚠️ Apps Script Web App 실패, GitHub Pages로 전환...")
                if not save_to_github_pages(leaderboard_data):
                    raise Exception("모든 업로드 방법 실패")
            
            logger.info("✅ 증분 업데이트 완료")
            
        elif '--full-integrity' in sys.argv:
            logger.info("🔍 === 전체 무결성 검증 모드 ===")
            # 나중에 구현
            logger.warning("⚠️ 전체 무결성 검증은 아직 구현되지 않았습니다")
            
        else:
            logger.info("🔄 === 전체 업데이트 모드 (스케줄러) ===")
            start_scheduler()
            
    except Exception as e:
        logger.error(f"💥 시스템 시작 실패: {e}")
        logger.error(traceback.format_exc())
        sys.exit(1)