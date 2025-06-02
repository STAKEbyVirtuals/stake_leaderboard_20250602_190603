   # VS Code용 STAKE 토큰 완전 추적기
# 설치 필요: pip install requests pandas openpyxl

import requests
import pandas as pd
from datetime import datetime, timezone
import time
from collections import defaultdict
import json

class STAKETokenTracker:
    def __init__(self):
        """초기화"""
        print("🚀 STAKE 토큰 추적기 초기화...")
        
        # Base 체인 RPC URLs (무료)
        self.rpc_urls = [
            "https://mainnet.base.org",
            "https://base-mainnet.public.blastapi.io",
            "https://1rpc.io/base",
            "https://base.gateway.tenderly.co"
        ]
        self.current_rpc = 0
        
        # 컨트랙트 주소
        self.staking_address = "0xBa13ae24684bee910820Be1Fcf52067332F8412f"
        self.token_address = "0xA9C8bDDcb113068713193D030abB86C7e8D1F5bB"
        
        # 함수 시그니처
        self.stake_method_id = "0xa694fc3a"      # stake(uint256)
        self.unstake_method_id = "0xf48355b9"    # toggleAutoRenew(uint256)
        
        # 추가 가능한 함수들 (차이나는 원인 찾기 위해)
        self.other_methods = {
            "0x23b872dd": "transferFrom",
            "0xa9059cbb": "transfer", 
            "0xd0e30db0": "deposit",
            "0xb6b55f25": "deposit(uint256)"
        }
        
        # 런칭 시점
        self.launch_time = int(datetime(2025, 5, 27, 10, 0, tzinfo=timezone.utc).timestamp())
        self.og_deadline = int(datetime(2025, 5, 28, 9, 59, tzinfo=timezone.utc).timestamp())
        
        # 데이터 저장소
        self.staking_data = defaultdict(lambda: {
            'total_staked': 0,
            'stake_count': 0,
            'unstake_count': 0,
            'is_active': True,
            'first_stake_time': None,
            'last_action_time': None,
            'transactions': []
        })
        
        print("✅ 초기화 완료")
    
    def get_rpc_url(self):
        """RPC URL 순환"""
        url = self.rpc_urls[self.current_rpc]
        self.current_rpc = (self.current_rpc + 1) % len(self.rpc_urls)
        return url
    
    def make_rpc_call(self, method, params, retry=3):
        """RPC 호출 (재시도 포함)"""
        for attempt in range(retry):
            try:
                rpc_url = self.get_rpc_url()
                payload = {
                    "jsonrpc": "2.0",
                    "method": method,
                    "params": params,
                    "id": 1
                }
                
                response = requests.post(rpc_url, json=payload, timeout=15)
                response.raise_for_status()
                result = response.json()
                
                if 'error' in result:
                    print(f"RPC 오류: {result['error']}")
                    continue
                    
                return result
                
            except Exception as e:
                if attempt == retry - 1:
                    print(f"RPC 호출 최종 실패: {e}")
                else:
                    time.sleep(1)
                    
        return None
    
    def get_latest_block(self):
        """최신 블록 번호"""
        result = self.make_rpc_call("eth_blockNumber", [])
        if result and 'result' in result:
            return int(result['result'], 16)
        return 0
    
    def find_launch_block(self):
        """런칭 시점 블록 찾기"""
        print("🔍 런칭 시점 블록 찾는 중...")
        
        latest_block = self.get_latest_block()
        current_time = int(datetime.now(timezone.utc).timestamp())
        time_diff = current_time - self.launch_time
        estimated_blocks = time_diff // 2  # Base = 2초/블록
        
        launch_block = max(0, latest_block - estimated_blocks)
        
        print(f"예상 런칭 블록: {launch_block:,}")
        print(f"최신 블록: {latest_block:,}")
        print(f"검색 블록 수: {estimated_blocks:,}개")
        
        return launch_block, latest_block
    
    def decode_stake_amount(self, input_data):
        """스테이킹 수량 디코드"""
        try:
            if len(input_data) < 74:
                return 0
            amount_hex = input_data[10:74]
            amount_wei = int(amount_hex, 16)
            return amount_wei / (10**18)
        except Exception as e:
            print(f"디코딩 오류: {e}, input: {input_data[:20]}...")
            return 0
    
    def analyze_specific_wallet(self, wallet_address, extended_search=True):
        """특정 지갑 상세 분석"""
        wallet_address = wallet_address.lower()
        print(f"\n🔍 지갑 {wallet_address[:8]}... 상세 분석")
        
        # 1. 현재 토큰 잔고 확인
        self.check_token_balance(wallet_address)
        
        # 2. 모든 트랜잭션 검색
        if extended_search:
            search_blocks = 200000  # 더 넓은 범위
        else:
            search_blocks = 50000
            
        transactions = self.search_wallet_transactions(wallet_address, search_blocks)
        
        # 3. 트랜잭션 분석
        total_staked = 0
        stake_txs = []
        unstake_txs = []
        
        for tx in transactions:
            method_id = tx['input'][:10] if len(tx['input']) >= 10 else ''
            
            if method_id == self.stake_method_id:
                amount = self.decode_stake_amount(tx['input'])
                total_staked += amount
                stake_txs.append({
                    'amount': amount,
                    'block': tx['block'],
                    'hash': tx['hash'],
                    'timestamp': tx.get('timestamp', 0)
                })
                
            elif method_id == self.unstake_method_id:
                unstake_txs.append({
                    'block': tx['block'],
                    'hash': tx['hash'],
                    'timestamp': tx.get('timestamp', 0)
                })
        
        print(f"📊 분석 결과:")
        print(f"  총 스테이킹량: {total_staked:,.4f} STAKE")
        print(f"  Stake 트랜잭션: {len(stake_txs)}개")
        print(f"  Unstake 트랜잭션: {len(unstake_txs)}개")
        
        # 상세 트랜잭션 리스트
        if stake_txs:
            print(f"\n📋 Stake 트랜잭션 상세:")
            for i, tx in enumerate(stake_txs[-10:], 1):  # 최근 10개만
                date_str = ""
                if tx['timestamp']:
                    date_str = datetime.fromtimestamp(tx['timestamp'], tz=timezone.utc).strftime('%m-%d %H:%M')
                print(f"  {i}. {tx['amount']:,.2f} STAKE (블록 {tx['block']:,}) {date_str}")
        
        return total_staked, stake_txs, unstake_txs
    
    def check_token_balance(self, wallet_address):
        """토큰 잔고 확인"""
        try:
            # balanceOf(address) 호출
            data = "0x70a08231" + wallet_address[2:].zfill(64)
            
            result = self.make_rpc_call("eth_call", [{
                "to": self.token_address,
                "data": data
            }, "latest"])
            
            if result and 'result' in result and result['result'] != '0x':
                balance_wei = int(result['result'], 16)
                balance_tokens = balance_wei / (10**18)
                print(f"💰 현재 토큰 잔고: {balance_tokens:,.4f} STAKE")
                return balance_tokens
            else:
                print("💰 토큰 잔고: 0 STAKE")
                return 0
                
        except Exception as e:
            print(f"❌ 잔고 확인 오류: {e}")
            return 0
    
    def search_wallet_transactions(self, wallet_address, num_blocks=50000):
        """특정 지갑의 모든 스테이킹 트랜잭션 검색"""
        print(f"🔍 {num_blocks:,}블록 범위에서 트랜잭션 검색...")
        
        latest_block = self.get_latest_block()
        from_block = max(0, latest_block - num_blocks)
        
        found_transactions = []
        chunk_size = 5000
        
        for start_block in range(from_block, latest_block + 1, chunk_size):
            end_block = min(start_block + chunk_size - 1, latest_block)
            progress = (start_block - from_block) / num_blocks * 100
            
            print(f"  진행률 {progress:.1f}% | 블록 {start_block:,}-{end_block:,}", end=" ")
            
            try:
                # 스테이킹 컨트랙트 로그 조회
                result = self.make_rpc_call("eth_getLogs", [{
                    "fromBlock": hex(start_block),
                    "toBlock": hex(end_block),
                    "address": self.staking_address
                }])
                
                if not result or 'result' not in result:
                    print("❌")
                    continue
                
                logs = result['result']
                if not logs:
                    print("✅")
                    continue
                
                # 트랜잭션 해시 수집
                tx_hashes = list(set(log['transactionHash'] for log in logs))
                wallet_txs = []
                
                # 각 트랜잭션 확인
                for tx_hash in tx_hashes:
                    tx_result = self.make_rpc_call("eth_getTransactionByHash", [tx_hash])
                    
                    if (tx_result and 'result' in tx_result and tx_result['result'] and
                        tx_result['result'].get('from', '').lower() == wallet_address):
                        
                        tx_data = tx_result['result']
                        
                        # 블록 타임스탬프 가져오기
                        block_result = self.make_rpc_call("eth_getBlockByNumber", [tx_data['blockNumber'], False])
                        timestamp = 0
                        if block_result and 'result' in block_result and block_result['result']:
                            timestamp = int(block_result['result']['timestamp'], 16)
                        
                        wallet_txs.append({
                            'hash': tx_hash,
                            'input': tx_data.get('input', ''),
                            'block': int(tx_data['blockNumber'], 16),
                            'timestamp': timestamp
                        })
                
                found_transactions.extend(wallet_txs)
                print(f"✅ ({len(wallet_txs)}개)")
                
            except Exception as e:
                print(f"❌ {e}")
            
            time.sleep(0.3)  # API 제한 고려
        
        print(f"🎯 총 발견: {len(found_transactions)}개 트랜잭션")
        return found_transactions
    
    def full_scan_from_launch(self, save_to_file=True):
        """런칭일부터 전체 스캔"""
        print("🚀 런칭일부터 전체 스캔 시작...")
        
        launch_block, latest_block = self.find_launch_block()
        total_blocks = latest_block - launch_block
        
        print(f"📊 검색 범위: {launch_block:,} → {latest_block:,} ({total_blocks:,}블록)")
        
        chunk_size = 1000
        total_stake_txs = 0
        total_unstake_txs = 0
        
        for start_block in range(launch_block, latest_block + 1, chunk_size):
            end_block = min(start_block + chunk_size - 1, latest_block)
            progress = (start_block - launch_block) / total_blocks * 100
            
            print(f"\n🔄 진행률 {progress:.1f}% | 블록 {start_block:,} → {end_block:,}")
            
            try:
                # 로그 검색
                result = self.make_rpc_call("eth_getLogs", [{
                    "fromBlock": hex(start_block),
                    "toBlock": hex(end_block),
                    "address": self.staking_address
                }])
                
                if not result or 'result' not in result:
                    print("   ❌ RPC 오류")
                    continue
                
                logs = result['result']
                if not logs:
                    print("   ✅ 활동 없음")
                    continue
                
                print(f"   📋 {len(logs)}개 로그 처리 중...")
                
                # 트랜잭션 처리
                tx_hashes = list(set(log['transactionHash'] for log in logs))
                
                for tx_hash in tx_hashes:
                    try:
                        tx_result = self.make_rpc_call("eth_getTransactionByHash", [tx_hash])
                        
                        if not tx_result or 'result' not in tx_result or not tx_result['result']:
                            continue
                        
                        tx_data = tx_result['result']
                        input_data = tx_data.get('input', '0x')
                        
                        if len(input_data) < 10:
                            continue
                        
                        method_id = input_data[:10]
                        from_address = tx_data['from'].lower()
                        
                        # 블록 타임스탬프
                        block_result = self.make_rpc_call("eth_getBlockByNumber", [tx_data['blockNumber'], False])
                        timestamp = 0
                        if block_result and 'result' in block_result and block_result['result']:
                            timestamp = int(block_result['result']['timestamp'], 16)
                        
                        # 트랜잭션 처리
                        if method_id == self.stake_method_id:
                            # Stake 트랜잭션
                            amount = self.decode_stake_amount(input_data)
                            
                            self.staking_data[from_address]['total_staked'] += amount
                            self.staking_data[from_address]['stake_count'] += 1
                            self.staking_data[from_address]['is_active'] = True
                            
                            if not self.staking_data[from_address]['first_stake_time']:
                                self.staking_data[from_address]['first_stake_time'] = timestamp
                            
                            self.staking_data[from_address]['last_action_time'] = timestamp
                            self.staking_data[from_address]['transactions'].append({
                                'type': 'stake',
                                'amount': amount,
                                'timestamp': timestamp,
                                'block': int(tx_data['blockNumber'], 16),
                                'tx_hash': tx_hash
                            })
                            
                            total_stake_txs += 1
                            
                            date_str = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime('%m-%d %H:%M')
                            print(f"     ✅ Stake: {from_address[:8]}... → {amount:.2f} STAKE ({date_str})")
                            
                        elif method_id == self.unstake_method_id:
                            # Unstake 트랜잭션
                            self.staking_data[from_address]['unstake_count'] += 1
                            self.staking_data[from_address]['is_active'] = False
                            self.staking_data[from_address]['last_action_time'] = timestamp
                            self.staking_data[from_address]['transactions'].append({
                                'type': 'unstake',
                                'timestamp': timestamp,
                                'block': int(tx_data['blockNumber'], 16),
                                'tx_hash': tx_hash
                            })
                            
                            total_unstake_txs += 1
                            
                            date_str = datetime.fromtimestamp(timestamp, tz=timezone.utc).strftime('%m-%d %H:%M')
                            print(f"     ❌ Jeet: {from_address[:8]}... ({date_str})")
                    
                    except Exception as e:
                        continue
                
            except Exception as e:
                print(f"   ❌ 블록 스캔 오류: {e}")
            
            time.sleep(0.5)
        
        print(f"\n🎉 스캔 완료!")
        print(f"   총 Stake 트랜잭션: {total_stake_txs:,}개")
        print(f"   총 Unstake 트랜잭션: {total_unstake_txs:,}개")
        print(f"   고유 지갑 수: {len(self.staking_data):,}개")
        
        if save_to_file:
            self.save_results()
        
        return len(self.staking_data)
    
    def save_results(self):
        """결과 저장"""
        print("\n💾 결과 저장 중...")
        
        # 데이터프레임 생성
        data_list = []
        
        for address, info in self.staking_data.items():
            if info['total_staked'] > 0:
                # 상태 판정
                if (info['first_stake_time'] and 
                    info['first_stake_time'] <= self.og_deadline and 
                    info['is_active']):
                    status = "OG"
                elif info['is_active']:
                    status = "VIRGEN"
                else:
                    status = "Jeeted"
                
                # 보유 기간
                holding_days = 0
                if info['first_stake_time']:
                    current_time = int(datetime.now(timezone.utc).timestamp())
                    holding_days = (current_time - info['first_stake_time']) / 86400
                
                # 시간 가중치 점수
                time_score = info['total_staked'] * holding_days
                
                # 첫 스테이킹 날짜
                first_stake_date = ""
                if info['first_stake_time']:
                    first_stake_date = datetime.fromtimestamp(
                        info['first_stake_time'], tz=timezone.utc
                    ).strftime('%Y-%m-%d %H:%M')
                
                data_list.append({
                    'Address': address[:6] + "**" + address[6:12] + "**" + address[-6:],
                    'Full_Address': address,
                    'Total_Staked': round(info['total_staked'], 4),
                    'Status': status,
                    'Time_Score': round(time_score, 2),
                    'Holding_Days': round(holding_days, 1),
                    'First_Stake': first_stake_date,
                    'Stake_Count': info['stake_count'],
                    'Unstake_Count': info['unstake_count'],
                    'Is_Active': info['is_active'],
                    'Total_Transactions': len(info['transactions'])
                })
        
        # 데이터프레임 생성 및 정렬
        df = pd.DataFrame(data_list)
        df = df.sort_values('Total_Staked', ascending=False).reset_index(drop=True)
        df['Rank'] = range(1, len(df) + 1)
        df['Alias'] = [f'VIRGEN#{i:04d}' for i in df['Rank']]
        
        # 파일 저장
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        # CSV 저장
        df.to_csv(f'stake_complete_{timestamp}.csv', index=False, encoding='utf-8-sig')
        
        # 활성 유저만
        active_df = df[df['Is_Active']]
        active_df.to_csv(f'stake_active_{timestamp}.csv', index=False, encoding='utf-8-sig')
        
        # OG만
        og_df = df[df['Status'] == 'OG']
        if len(og_df) > 0:
            og_df.to_csv(f'stake_og_{timestamp}.csv', index=False, encoding='utf-8-sig')
        
        # Excel 저장 (더 보기 좋음)
        try:
            with pd.ExcelWriter(f'stake_leaderboard_{timestamp}.xlsx', engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name='전체', index=False)
                active_df.to_excel(writer, sheet_name='활성유저', index=False)
                if len(og_df) > 0:
                    og_df.to_excel(writer, sheet_name='OG', index=False)
        except:
            print("Excel 저장 실패 (openpyxl 설치 필요)")
        
        # 통계 출력
        print(f"✅ 파일 저장 완료:")
        print(f"   📋 stake_complete_{timestamp}.csv (전체 {len(df):,}명)")
        print(f"   💎 stake_active_{timestamp}.csv (활성 {len(active_df):,}명)")
        if len(og_df) > 0:
            print(f"   👑 stake_og_{timestamp}.csv (OG {len(og_df):,}명)")
        print(f"   📊 stake_leaderboard_{timestamp}.xlsx (Excel)")
        
        # 통계 출력
        print(f"\n📊 최종 통계:")
        print(f"   전체 참여자: {len(df):,}명")
        print(f"   활성 스테이커: {len(active_df):,}명")
        print(f"   총 스테이킹량: {active_df['Total_Staked'].sum():,.2f} STAKE")
        print(f"   OG: {len(og_df):,}명")
        print(f"   VIRGEN: {len(df[df['Status'] == 'VIRGEN']):,}명")
        print(f"   Jeeted: {len(df[df['Status'] == 'Jeeted']):,}명")
        
        # 상위 20명 출력
        print(f"\n🏆 TOP 20 리더보드:")
        top20 = df[['Rank', 'Alias', 'Address', 'Total_Staked', 'Status', 'Time_Score']].head(20)
        print(top20.to_string(index=False))
        
        return df

def main():
    """메인 실행 함수"""
    print("🥩 STAKE 토큰 추적기 (VS Code 버전)")
    print("=" * 60)
    
    tracker = STAKETokenTracker()
    
    while True:
        print(f"\n🎯 선택하세요:")
        print("1. 전체 스캔 (런칭일부터)")
        print("2. 특정 지갑 분석")
        print("3. 종료")
        
        choice = input("\n선택 (1-3): ").strip()
        
        if choice == '1':
            tracker.full_scan_from_launch()
            
        elif choice == '2':
            wallet = input("지갑 주소 입력: ").strip()
            if wallet:
                tracker.analyze_specific_wallet(wallet, extended_search=True)
            
        elif choice == '3':
            print("👋 종료합니다!")
            break
            
        else:
            print("❌ 잘못된 선택입니다.")

if __name__ == "__main__":
    main()