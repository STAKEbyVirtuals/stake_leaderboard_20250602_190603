# 청크 크기 확인 테스트
import requests

def test_chunk_sizes():
    """청크 크기 실제 테스트"""
    print("🧪 청크 크기 테스트")
    
    rpc_url = "https://mainnet.base.org"
    staking_address = "0xBa13ae24684bee910820Be1Fcf52067332F8412f"
    
    def rpc_call(method, params):
        try:
            response = requests.post(rpc_url, json={
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 1
            }, timeout=15)
            return response.json()
        except Exception as e:
            print(f"RPC 오류: {e}")
            return None
    
    # 최신 블록
    result = rpc_call("eth_blockNumber", [])
    if not result or 'result' not in result:
        print("❌ 최신 블록 가져오기 실패")
        return
    
    latest_block = int(result['result'], 16)
    print(f"최신 블록: {latest_block:,}")
    
    # 다양한 크기 테스트
    test_sizes = [100, 200, 300, 500, 999, 1000, 1001]
    
    for size in test_sizes:
        start_block = latest_block - size
        end_block = latest_block
        
        print(f"\n테스트 크기: {size}블록")
        print(f"  범위: {start_block:,} → {end_block:,}")
        print(f"  실제 차이: {end_block - start_block}블록")
        
        result = rpc_call("eth_getLogs", [{
            "fromBlock": hex(start_block),
            "toBlock": hex(end_block),
            "address": staking_address
        }])
        
        if result:
            if 'error' in result:
                error_msg = result['error'].get('message', '')
                print(f"  ❌ 오류: {error_msg}")
                if 'too large' in error_msg or 'max is' in error_msg:
                    print(f"  🚨 {size}블록에서 제한 걸림!")
                    break
            else:
                logs = result.get('result', [])
                print(f"  ✅ 성공: {len(logs)}개 로그")
        else:
            print(f"  ❌ 연결 실패")

def simple_scan_test():
    """간단한 스캔 테스트"""
    print("\n🔍 간단한 스캔 테스트")
    
    rpc_url = "https://mainnet.base.org"
    staking_address = "0xBa13ae24684bee910820Be1Fcf52067332F8412f"
    
    def rpc_call(method, params):
        try:
            response = requests.post(rpc_url, json={
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 1
            }, timeout=15)
            return response.json()
        except Exception as e:
            return None
    
    # 최신 블록
    result = rpc_call("eth_blockNumber", [])
    latest_block = int(result['result'], 16)
    
    # 200블록씩 3번 테스트
    chunk_size = 200
    
    for i in range(3):
        start_block = latest_block - (chunk_size * (i + 1))
        end_block = start_block + chunk_size - 1
        
        actual_size = end_block - start_block + 1
        
        print(f"\n테스트 {i+1}:")
        print(f"  설정: {chunk_size}블록")
        print(f"  범위: {start_block:,} → {end_block:,}")
        print(f"  실제: {actual_size}블록")
        
        if actual_size != chunk_size:
            print(f"  ⚠️ 크기 불일치! 설정:{chunk_size} vs 실제:{actual_size}")
        
        result = rpc_call("eth_getLogs", [{
            "fromBlock": hex(start_block),
            "toBlock": hex(end_block),
            "address": staking_address
        }])
        
        if result and 'error' in result:
            print(f"  ❌ 오류: {result['error'].get('message', '')}")
        elif result and 'result' in result:
            print(f"  ✅ 성공: {len(result['result'])}개")
        else:
            print(f"  ❌ 실패")

def find_max_safe_chunk():
    """안전한 최대 청크 크기 찾기"""
    print("\n🎯 안전한 최대 청크 크기 찾기")
    
    rpc_url = "https://mainnet.base.org"
    staking_address = "0xBa13ae24684bee910820Be1Fcf52067332F8412f"
    
    def rpc_call(method, params):
        try:
            response = requests.post(rpc_url, json={
                "jsonrpc": "2.0",
                "method": method,
                "params": params,
                "id": 1
            }, timeout=15)
            return response.json()
        except Exception as e:
            return None
    
    # 최신 블록
    result = rpc_call("eth_blockNumber", [])
    latest_block = int(result['result'], 16)
    
    # 이진 탐색으로 최대 크기 찾기
    low, high = 1, 2000
    max_safe_size = 0
    
    while low <= high:
        mid = (low + high) // 2
        start_block = latest_block - mid
        end_block = latest_block
        
        print(f"  테스트 크기: {mid}블록", end=" ")
        
        result = rpc_call("eth_getLogs", [{
            "fromBlock": hex(start_block),
            "toBlock": hex(end_block),
            "address": staking_address
        }])
        
        if result and 'error' in result:
            print("❌ 실패")
            high = mid - 1
        elif result and 'result' in result:
            print("✅ 성공")
            max_safe_size = mid
            low = mid + 1
        else:
            print("❌ 연결 실패")
            high = mid - 1
    
    print(f"\n🎯 안전한 최대 크기: {max_safe_size}블록")
    return max_safe_size

def main():
    """메인 테스트"""
    print("🧪 STAKE RPC 한계 테스트")
    print("=" * 40)
    
    # 1. 다양한 크기 테스트
    test_chunk_sizes()
    
    # 2. 간단한 스캔 테스트
    simple_scan_test()
    
    # 3. 최대 안전 크기 찾기
    max_size = find_max_safe_chunk()
    
    print(f"\n📊 결론:")
    print(f"   이 RPC에서 안전한 최대 크기: {max_size}블록")
    print(f"   권장 사용 크기: {max_size // 2}블록 (안전 마진)")

if __name__ == "__main__":
    main()