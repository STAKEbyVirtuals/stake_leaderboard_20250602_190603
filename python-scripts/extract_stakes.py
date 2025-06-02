from web3 import Web3

# Base 메인넷 RPC
RPC_URL = "https://mainnet.base.org"
web3 = Web3(Web3.HTTPProvider(RPC_URL))

STAKE_CONTRACT = "0xBa13ae24684bee910820Be1Fcf52067332F8412f"
USER_ADDRESS = "0x048f5AcA96B043A178C6018ECc29eF4e65637171"

contract_abi = [
    {
        "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
        "name": "getUserStakes",
        "outputs": [{"internalType": "uint256[]", "name": "", "type": "uint256[]"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "uint256", "name": "id", "type": "uint256"}],
        "name": "positions",
        "outputs": [
            {"internalType": "address", "name": "owner", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"},
            {"internalType": "uint256", "name": "start", "type": "uint256"},
            {"internalType": "uint256", "name": "end", "type": "uint256"},
            {"internalType": "bool", "name": "autoRenew", "type": "bool"},
        ],
        "stateMutability": "view",
        "type": "function"
    }
]

contract = web3.eth.contract(address=STAKE_CONTRACT, abi=contract_abi)

stake_ids = contract.functions.getUserStakes(USER_ADDRESS).call()
print(f"Stake IDs: {stake_ids}")

for sid in stake_ids:
    pos = contract.functions.positions(sid).call()
    amount = Web3.from_wei(pos[1], 'ether')
    print(f"Stake ID: {sid} | Amount: {amount} STAKE | AutoRenew: {pos[4]}")
