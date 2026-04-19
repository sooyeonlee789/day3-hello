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

## 사전 런칭 검증 체크리스트 (Runbook)

배포 직전 아래 항목을 순서대로 확인합니다.

### 1) 설정값 점검
- [ ] `assets/config.js`의 `consultationFormUrl`가 실제 상담 API 엔드포인트를 가리키는지 확인
- [ ] `assets/config.js`의 `paymentUrl`이 운영 결제 링크인지 확인
- [ ] 로컬/스테이징에서 `assets/config.example.js`와 비교해 누락된 키가 없는지 확인

### 2) 결제 CTA 링크 점검
- [ ] 페이지에서 `#payment-cta` 클릭 시 올바른 결제 도메인으로 이동하는지 확인
- [ ] 결제 CTA가 새 탭(`target="_blank"`)에서 열리는지 확인
- [ ] 결제 URL에 테스트/더미 도메인이 남아있지 않은지 확인

### 3) 상담 폼 성공/실패 시나리오 점검
- [ ] 필수 입력값 + 동의 체크 후 제출 시 성공 메시지(`자료가 이메일로 발송됩니다.`)가 표시되는지 확인
- [ ] API 실패(500 등) 상황에서 오류 메시지(`요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.`)가 표시되는지 확인
- [ ] 실패 시 성공 메시지는 노출되지 않는지 확인

### 4) 분석(Analytics) 이벤트 점검
- [ ] 상담 CTA 클릭 시 `click_consult_cta` 이벤트가 수집되는지 확인
- [ ] 결제 CTA 클릭 시 `click_payment_cta` 이벤트가 수집되는지 확인
- [ ] 상담 폼 성공 제출 시 `submit_consult_form_success` 이벤트가 수집되는지 확인
- [ ] 이벤트에 위치 정보(예: header/pricing)가 포함되는지 확인

### 5) 모바일/데스크톱 스모크 점검
- [ ] 모바일(375x812)에서 헤더 CTA/주요 섹션 이동/히어로 CTA가 보이는지 확인
- [ ] 데스크톱에서 원페이지 핵심 섹션(problem/outcomes/program/curriculum/pricing/consult-form/faq)이 순서대로 노출되는지 확인
- [ ] 주요 카드/폼/FAQ 블록이 레이아웃 깨짐 없이 렌더링되는지 확인
