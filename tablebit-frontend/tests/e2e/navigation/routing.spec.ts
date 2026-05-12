import { test, expect } from '../../../playwright-fixture';
import { FRONTEND_URL } from '../fixtures/test-data';

test.describe('Navigation', () => {
  test('debe redirigir al login desde ruta protegida sin autenticar', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/mis-reservas`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe mostrar pagina 404 para rutas inexistentes', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/ruta-inexistente`);
    await expect(page.locator('text=404 | Page not found').or(page.locator('text=No encontrado'))).toBeVisible();
  });

  test('debe tener titulo dinamico en Home', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await expect(page).toHaveTitle(/TableBit/);
  });

  test('debe tener titulo dinamico en Login', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await expect(page).toHaveTitle(/Iniciar sesión/);
  });

  test('debe tener titulo dinamico en Register', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/register`);
    await expect(page).toHaveTitle(/Crear cuenta/);
  });

  test('debe cargar restaurantes en Home', async ({ page }) => {
    await page.goto(FRONTEND_URL);
    await page.waitForLoadState('networkidle');
    const cards = page.locator('text=Mexicana, Italiana, Japonesa, Española');
    await expect(cards.first()).toBeVisible();
  });
});
