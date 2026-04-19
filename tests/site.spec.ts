import { test, expect } from '@playwright/test';

test('히어로에서 상담/결제 CTA가 노출된다', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  await expect(page.getByRole('button', { name: '무료 상담 신청' })).toBeVisible();
  await expect(page.getByRole('link', { name: '지금 결제하기' })).toBeVisible();
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
});
