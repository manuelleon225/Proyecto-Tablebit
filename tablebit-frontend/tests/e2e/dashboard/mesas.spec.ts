import { test, expect } from '../../../playwright-fixture';
import { FRONTEND_URL } from '../fixtures/test-data';

test.describe('Dashboard Admin', () => {
  test('debe cargar metricas del dashboard', async ({ page, adminContext }) => {
    // Login como admin
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', adminContext.email);
    await page.fill('input[type="password"]', adminContext.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/);

    // Navegar al dashboard
    await page.goto(`${FRONTEND_URL}/dashboard`);
    await page.waitForLoadState('networkidle');

    // Verificar que las metricas se cargan
    await expect(page.locator('text=Reservas hoy').or(page.locator('text=Dashboard'))).toBeVisible();
    await expect(page.locator('text=Ocupación').or(page.locator('text=Sin datos'))).toBeVisible({ timeout: 5000 });
  });

  test('debe mostrar panel de gestion de mesas', async ({ page, adminContext }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', adminContext.email);
    await page.fill('input[type="password"]', adminContext.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/);

    await page.goto(`${FRONTEND_URL}/dashboard/mesas`);
    await page.waitForLoadState('networkidle');

    await expect(page.locator('text=Gestión de Mesas').or(page.locator('text=Agregar mesa'))).toBeVisible();
  });

  test('debe proteger dashboard contra clientes', async ({ page, clienteContext }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', clienteContext.email);
    await page.fill('input[type="password"]', clienteContext.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/);

    await page.goto(`${FRONTEND_URL}/dashboard`);
    await expect(page).toHaveURL(/\/$/);
  });
});
