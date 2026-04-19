import { test, expect } from '@playwright/test';

test('히어로에서 상담/결제 CTA가 노출된다', async ({ page }) => {
  await page.goto('http://127.0.0.1:4173');

  await expect(page.getByRole('button', { name: '무료 상담 신청' })).toBeVisible();
  await expect(page.getByRole('link', { name: '지금 결제하기' })).toBeVisible();
});
