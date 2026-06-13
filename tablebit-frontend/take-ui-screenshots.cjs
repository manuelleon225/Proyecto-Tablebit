const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1366, height: 768 } });
  const page = await context.newPage();
  const dir = 'screenshots';

  // C-12: Home page with restaurants
  console.log('Capturing C-12: Home page...');
  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${dir}/C12-home-page.png`, fullPage: false });
    console.log('   C12 saved');
  } catch(e) {
    console.log('   C12 FAILED:', e.message);
  }

  // C-13: Login page
  console.log('Capturing C-13: Login page...');
  try {
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${dir}/C13-login-page.png`, fullPage: false });
    console.log('   C13 saved');
  } catch(e) {
    console.log('   C13 FAILED:', e.message);
  }

  // C-14: Restaurant detail page
  console.log('Capturing C-14: Restaurant detail...');
  try {
    await page.goto('http://localhost:5173/restaurantes/8', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${dir}/C14-restaurant-detail.png`, fullPage: true });
    console.log('   C14 saved');
  } catch(e) {
    console.log('   C14 FAILED:', e.message);
  }

  console.log('\nUI screenshots captured!');
  await browser.close();
})();
