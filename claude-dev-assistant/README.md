# 🤖 Claude Dev Assistant - 설치 및 사용 가이드

## 📦 설치 방법

### 1단계: Extension 폴더 생성
```bash
# STAKE 프로젝트 루트에서 실행
mkdir claude-dev-assistant
cd claude-dev-assistant
```

### 2단계: 파일 생성
위에서 제공된 모든 파일들을 다음 구조로 생성하세요:

```
claude-dev-assistant/
├── 📄 package.json
├── 📄 extension.ts
├── 📄 tsconfig.json
├── 📁 src/
│   ├── 📄 claudeAPI.ts
│   ├── 📄 fileManager.ts
│   └── 📄 chatPanel.ts
└── 📁 webview/
    ├── 📄 chat.html
    └── 📄 chat.js
```

### 3단계: 의존성 설치
```bash
npm install
```

### 4단계: TypeScript 컴파일
```bash
npm run compile
```

### 5단계: VS Code에서 Extension 실행
```bash
# VS Code로 extension 폴더 열기
code .

# F5 키를 눌러서 Extension Development Host 실행
# 새로운 VS Code 창이 열립니다
```

---

## 🔑 Claude API 키 설정

### 방법 1: VS Code 설정 (추천)
1. `Ctrl+Shift+P` → "Claude: Configure API Key" 실행
2. Claude API 키 입력 (sk-ant-api...로 시작)
3. 자동으로 안전하게 저장됨

### 방법 2: 설정 파일에서 직접
1. `Ctrl+,` → 설정 열기
2. "claude" 검색
3. "Claude: Api Key" 필드에 입력

---

## 🚀 사용 방법

### 기본 사용법

#### 1. 채팅 시작
```
방법 1: Ctrl+Shift+C (단축키)
방법 2: Ctrl+Shift+P → "Claude: Start Chat"
방법 3: 왼쪽 사이드바 → "Claude Assistant"
```

#### 2. 빠른 분석
```
방법 1: Ctrl+Shift+A (현재 파일 분석)
방법 2: 우클릭 → "Claude: Analyze Current File"
```

#### 3. 코드 수정
```
방법 1: 우클릭 → "Claude: Fix Code Issues"
방법 2: 채팅에서 "현재 파일 버그 수정해줘"
```

---

## 💬 채팅 예시

### STAKE 프로젝트 관련 요청들

#### 🆕 새 컴포넌트 생성
```
"추천인 네트워크 시각화 컴포넌트 만들어줘"
→ Claude가 ReferralNetworkVisualization.jsx 자동 생성
→ "Apply" 버튼으로 즉시 적용
```

#### 🐛 버그 수정
```
"추천인 코드 생성할 때 중복 체크 안되는 버그 고쳐줘"
→ Claude가 관련 파일 분석 후 수정된 코드 제공
→ 원클릭으로 적용 가능
```

#### 🎨 스타일링 개선
```
"등급별 글로우 효과를 더 강하게 만들어줘"
→ CSS 파일 자동 수정
→ 브라우저에서 즉시 확인 가능
```

#### 📊 데이터 업데이트
```
"리더보드 JSON 구조를 개선해줘"
→ 새로운 데이터 구조 제안
→ 자동으로 public/leaderboard.json 업데이트
```

---

## 🎯 고급 기능

### 자동 코드 적용
- **Apply 버튼**: 기존 파일에 코드 덮어쓰기
- **Create 버튼**: 새 파일로 생성
- **Auto-save**: 설정에서 활성화 시 자동 저장

### 프로젝트 컨텍스트
```javascript
// STAKE 프로젝트 자동 인식
// Claude가 다음 정보를 자동으로 파악:
- Next.js + TypeScript 환경
- RainbowKit Web3 연동
- Tailwind CSS 스타일링
- STAKE 게이밍 테마
- 모바일 반응형 필수
```

### 빠른 액션 버튼
```
🆕 New Component    🔧 Fix Bug
📊 Update Data      ⚡ Optimize Code
🔷 Add Types
```

---

## ⚙️ 설정 옵션

### VS Code 설정 (`Ctrl+,`)
```json
{
  "claude.model": "claude-3-sonnet-20240229",
  "claude.maxTokens": 4000,
  "claude.autoSave": true,
  "claude.projectContext": "STAKE Leaderboard Project"
}
```

### 키보드 단축키
```
Ctrl+Shift+C  : 채팅 열기
Ctrl+Shift+A  : 파일 분석
Ctrl+Enter    : 메시지 전송
Ctrl+L        : 채팅 히스토리 지우기
Ctrl+F        : 현재 파일 정보
```

---

## 🔧 문제 해결

### API 키 관련
```
❌ "API key not configured"
✅ Ctrl+Shift+P → "Claude: Configure API Key"

❌ "Invalid API key"  
✅ Claude 콘솔에서 새 API 키 생성

❌ "Rate limit exceeded"
✅ 잠시 대기 후 재시도
```

### Extension 관련
```
❌ Extension이 활성화 안됨
✅ F5로 Development Host 재실행

❌ 채팅창이 안열림
✅ npm run compile 후 F5 재실행

❌ 파일 수정이 안됨
✅ VS Code 권한 및 파일 경로 확인
```

---

## 📝 개발 팁

### 효율적인 대화 방법
```
1. 구체적으로 요청
   ❌ "코드 수정해줘"
   ✅ "추천인 대시보드에 실시간 차트 추가해줘"

2. 현재 파일 활용
   📄 파일을 열고 → Ctrl+Shift+A로 분석 요청

3. 단계별 요청
   1단계: "ReferralChart 컴포넌트 만들어줘"
   2단계: "이 차트를 대시보드에 연결해줘"
   3단계: "모바일에서도 보기 좋게 스타일링해줘"
```

### STAKE 프로젝트 특화 명령어
```
"새로운 등급 Heavy Eater 추가해줘"
"추천인 포인트 계산 로직 최적화해줘"
"모바일 반응형 버그 수정해줘"
"Phase 2 전환 시스템 만들어줘"
"GitHub Actions 워크플로우 개선해줘"
```

---

## 🎉 완료!

이제 Claude Dev Assistant가 준비되었습니다!

**다음 단계는:**
1. `F5`로 Extension 실행
2. `Ctrl+Shift+C`로 채팅 시작  
3. "안녕하세요! STAKE 프로젝트 도와주세요" 입력
4. 개발 속도 5배 향상 체험! ⚡

**문제가 있으면 알려주세요. 즉시 해결해드리겠습니다!** 🤖