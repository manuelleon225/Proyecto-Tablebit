import { Page } from '@playwright/test';
import { FRONTEND_URL, TEST_USERS } from '../fixtures/test-data';

type UserType = keyof typeof TEST_USERS;

export async function loginAs(page: Page, userType: UserType = 'cliente') {
  const user = TEST_USERS[userType];
  await page.goto(`${FRONTEND_URL}/login`);
  await page.waitForSelector('form');

  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await page.click('button[type="submit"]');

  await page.waitForURL('**/');
}

export async function getTokenViaAPI(userType: UserType = 'cliente') {
  const user = TEST_USERS[userType];
  const res = await fetch(`${FRONTEND_URL.replace('5173', '8000')}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: user.email, password: user.password }),
  });
  const data = await res.json();
  return data.token;
}
