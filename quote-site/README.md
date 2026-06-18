# 오늘의 명언 카드 ✦

위인의 실제 명언·속담·격언을 AI가 감성 이미지로 만들어주는 사이트

---

## 배포 방법 (10분이면 완료)

### 1단계 — GitHub에 올리기

압축 풀고 폴더 안에서:

```bash
git init
git add .
git commit -m "첫 배포"
```

GitHub에서 새 Repository 만들고 (이름 예: `quote-card`):

```bash
git remote add origin https://github.com/내아이디/quote-card.git
git push -u origin main
```

### 2단계 — Vercel 배포

1. https://vercel.com 접속 → GitHub로 로그인
2. "Add New Project" → 방금 만든 repository 선택
3. Framework Preset: **Vite** 선택
4. Environment Variables 추가:
   - Name: `ANTHROPIC_API_KEY`
   - Value: Anthropic API 키 붙여넣기
5. "Deploy" 클릭

### 3단계 — 완료!

`https://quote-card.vercel.app` 주소로 바로 접속 🎉

---

## 홈화면에 앱처럼 추가하기 (PWA)

**아이폰:** Safari로 접속 → 공유 버튼 → "홈 화면에 추가"

**안드로이드:** Chrome으로 접속 → 메뉴 → "앱 설치" 또는 "홈 화면에 추가"

---

## Anthropic API 키 발급

https://console.anthropic.com → API Keys → Create Key

---

## 로컬 개발

```bash
npm install
```

`.env.local` 파일 만들고:
```
ANTHROPIC_API_KEY=sk-ant-...
```

```bash
npm run dev
```
