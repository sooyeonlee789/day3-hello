import { test, expect, type Page } from '@playwright/test';

test('히어로에서 상담/결제 CTA가 노출된다', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  await expect(page.getByRole('button', { name: '무료 상담 신청' })).toBeVisible();
  await expect(page.getByRole('link', { name: '지금 결제하기' })).toBeVisible();
});

test('성과 수치 카드 3개가 노출된다', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  const outcomes = page.locator('#outcomes');

  await expect(outcomes.locator('.metric-card')).toHaveCount(3);
  await expect(outcomes.getByText('보고서 작성 시간 60% 단축', { exact: true })).toBeVisible();
  await expect(outcomes.getByText('회의록 정리 시간 50% 단축', { exact: true })).toBeVisible();
  await expect(outcomes.getByText('반복 메일 작성 시간 70% 단축', { exact: true })).toBeVisible();
});

test('원페이지 핵심 섹션이 순서대로 존재한다', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  const sectionIds = ['problem', 'outcomes', 'program', 'curriculum', 'pricing', 'consult-form', 'faq'];

  for (const id of sectionIds) {
    await expect(page.locator(`#${id}`)).toBeVisible();
  }

  const orderedIds = await page.locator('section[id]').evaluateAll((sections) =>
    sections.map((section) => section.id),
  );

  expect(orderedIds).toEqual(expect.arrayContaining(sectionIds));

  let previousIndex = -1;
  for (const id of sectionIds) {
    const currentIndex = orderedIds.indexOf(id);
    expect(currentIndex).toBeGreaterThan(previousIndex);
    previousIndex = currentIndex;
  }

  await expect(page.locator('header.site-header .brand')).toBeVisible();
  await expect(page.locator('#outcomes .metric-card')).toHaveCount(3);
  await expect(page.locator('#program .modules article')).toHaveCount(4);
  await expect(page.locator('#curriculum .curriculum-grid article')).toHaveCount(4);
  await expect(page.locator('#pricing .pricing-wrap')).toBeVisible();
  await expect(page.locator('#consult-form .consult-form')).toBeVisible();
  await expect(page.locator('#faq .faq-grid article')).toHaveCount(3);
});

const fillConsultationForm = async (page: Page) => {
  await page.getByLabel('성함').fill('홍길동');
  await page.getByLabel('이메일').fill('hong@example.com');
  await page.getByLabel('연락처').fill('010-1234-5678');
  await page.getByLabel('역할/현재 직무').fill('마케팅 매니저');
  await page.getByLabel('자동화하고 싶은 주제').fill('보고서 자동화');
  await page.getByLabel('상세 문의 내용').fill('주간 보고서 자동화를 도입하고 싶습니다.');
  await page.getByRole('checkbox', { name: '개인정보 수집 및 이용에 동의합니다. (상담 진행 목적 외 사용하지 않습니다.)' }).check();
};

test('상담 폼 제출 성공 메시지를 표시한다', async ({ page }) => {
  await page.route('**/api/consultation', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto('http://127.0.0.1:4173');

  await fillConsultationForm(page);

  await page.locator('#consultation-form button[type="submit"]').click();

  await expect(page.getByText('자료가 이메일로 발송됩니다.', { exact: true })).toBeVisible();
});

test('상담 폼 제출 실패 시 오류 메시지를 표시한다', async ({ page }) => {
  await page.route('**/api/consultation', async (route) => {
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ ok: false }),
    });
  });

  await page.goto('http://127.0.0.1:4173');

  await fillConsultationForm(page);

  await page.locator('#consultation-form button[type="submit"]').click();

  await expect(page.getByText('요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.', { exact: true })).toBeVisible();
  await expect(page.getByText('자료가 이메일로 발송됩니다.', { exact: true })).toBeHidden();
});

test('결제 CTA가 설정된 외부 URL을 가진다', async ({ page }) => {
  await page.route('**/assets/config.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: "window.APP_CONFIG={consultationFormUrl:'/api/consultation',paymentUrl:'https://payments.example.com/checkout/pro-plan'};",
    });
  });

  await page.goto('http://127.0.0.1:4173');

  const paymentCta = page.locator('#payment-cta');

  await expect(paymentCta).toBeVisible();
  await expect(paymentCta).toHaveAttribute('href', 'https://payments.example.com/checkout/pro-plan');
  await expect(paymentCta).toHaveAttribute('target', '_blank');
  await expect(paymentCta).toHaveAttribute('href', /https?:\/\/.*checkout/i);
});

test('결제 CTA 클릭 시 추적 이벤트를 기록한다', async ({ page }) => {
  await page.route('**/assets/config.js', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/javascript',
      body: "window.APP_CONFIG={consultationFormUrl:'/api/consultation',paymentUrl:'https://payments.example.com/checkout/pro-plan'};",
    });
  });

  await page.addInitScript(() => {
    (window as Window & { gtag?: unknown; dataLayer?: unknown[] }).gtag = undefined;
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
  });

  await page.goto('http://127.0.0.1:4173');
  await page.locator('#payment-cta').click();

  const dataLayer = await page.evaluate(() => (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer || []);
  expect(dataLayer).toContainEqual(expect.objectContaining({ event: 'click_payment_cta', location: 'pricing' }));
});

test('상담 CTA 클릭 시 추적 이벤트를 기록한다', async ({ page }) => {
  await page.addInitScript(() => {
    (window as Window & { gtag?: unknown; dataLayer?: unknown[] }).gtag = undefined;
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
  });

  await page.goto('http://127.0.0.1:4173');
  await page.locator('header .top-cta').click();

  const dataLayer = await page.evaluate(() => (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer || []);
  expect(dataLayer).toContainEqual(expect.objectContaining({ event: 'click_consult_cta', location: 'header' }));
});

test('상담 폼 성공 제출 시 추적 이벤트를 기록한다', async ({ page }) => {
  await page.route('**/api/consultation', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.addInitScript(() => {
    (window as Window & { gtag?: unknown; dataLayer?: unknown[] }).gtag = undefined;
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
  });

  await page.goto('http://127.0.0.1:4173');
  await fillConsultationForm(page);
  await page.locator('#consultation-form button[type="submit"]').click();
  await expect(page.getByText('자료가 이메일로 발송됩니다.', { exact: true })).toBeVisible();

  const dataLayer = await page.evaluate(() => (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer || []);
  expect(dataLayer).toContainEqual(expect.objectContaining({ event: 'submit_consult_form_success' }));
});
