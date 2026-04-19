# AI Sales Site

정적 랜딩 페이지(HTML/CSS/JS)와 Playwright E2E 테스트를 포함한 작업 디렉터리입니다.

## 로컬 실행

아래 명령으로 정적 서버를 4173 포트에서 실행합니다.

```bash
npx vite --host 127.0.0.1 --port 4173 --strictPort
```

브라우저에서 `http://127.0.0.1:4173` 접속 후 화면을 확인합니다.

## 테스트 실행

서버를 실행한 상태에서 아래 명령으로 테스트를 실행합니다.

```bash
npx playwright test
```

특정 테스트만 실행하려면 `--grep` 옵션을 사용합니다.

```bash
npx playwright test --grep "FAQ 섹션에 상담 및 결제 관련 안내가 있다"
```
