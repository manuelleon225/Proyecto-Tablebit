import { test, expect } from '../../../playwright-fixture';
import { FRONTEND_URL } from '../fixtures/test-data';

const uniqueEmail = () => `e2e-test-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@tablebit.com`;

test.describe('Auth - Registro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/register`);
    await page.waitForSelector('form');
  });

  test('debe registrar un usuario correctamente', async ({ page }) => {
    const email = uniqueEmail();

    await page.fill('input[id="name"]', 'Test E2E');
    await page.fill('input[type="email"]', email);
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="passwordConfirm"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/$/);
  });

  test('debe rechazar registro con email invalido', async ({ page }) => {
    await page.fill('input[id="name"]', 'Test');
    await page.fill('input[type="email"]', 'email-invalido');
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="passwordConfirm"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Ingresa un email válido')).toBeVisible();
  });

  test('debe rechazar registro con contrasenas diferentes', async ({ page }) => {
    await page.fill('input[id="name"]', 'Test');
    await page.fill('input[type="email"]', uniqueEmail());
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="passwordConfirm"]', 'different');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Las contraseñas no coinciden')).toBeVisible();
  });

  test('debe rechazar registro con password corta', async ({ page }) => {
    await page.fill('input[id="name"]', 'Test');
    await page.fill('input[type="email"]', uniqueEmail());
    await page.fill('input[id="password"]', '12');
    await page.fill('input[id="passwordConfirm"]', '12');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Mínimo 6 caracteres')).toBeVisible();
  });
});

test.describe('Auth - Login/Logout', () => {
  test('debe iniciar sesion con credenciales validas', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${FRONTEND_URL}/register`);
    await page.waitForSelector('form');
    await page.fill('input[id="name"]', 'Test Login');
    await page.fill('input[type="email"]', email);
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="passwordConfirm"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/);

    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('text=Salir')).toBeVisible();
  });

  test('debe rechazar login con contrasena incorrecta', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/login`);
    await page.waitForSelector('form');
    await page.fill('input[type="email"]', 'noexiste@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Error')).toBeVisible();
  });

  test('debe redirigir al login desde ruta protegida', async ({ page }) => {
    await page.goto(`${FRONTEND_URL}/mis-reservas`);
    await expect(page).toHaveURL(/\/login/);
  });

  test('debe poder cerrar sesion', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto(`${FRONTEND_URL}/register`);
    await page.waitForSelector('form');
    await page.fill('input[id="name"]', 'Test Logout');
    await page.fill('input[type="email"]', email);
    await page.fill('input[id="password"]', 'password123');
    await page.fill('input[id="passwordConfirm"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/$/);

    await page.locator('text=Salir').click();
    await expect(page.locator('text=Iniciar sesión')).toBeVisible();
  });
});
