import { test as base, expect } from '@playwright/test';
import { setupAdminEnvironment, setupClienteEnvironment } from './tests/e2e/fixtures/api-helpers';

type E2EFixtures = {
  adminContext: { token: string; restauranteId: number; mesaId: number; email: string; password: string };
  clienteContext: { token: string; email: string; password: string };
};

export const test = base.extend<E2EFixtures>({
  adminContext: [async ({}, use) => {
    const env = await setupAdminEnvironment();
    await use({
      token: env.adminToken,
      restauranteId: env.restaurante.id,
      mesaId: env.mesa.id,
      email: env.email,
      password: env.password,
    });
  }, { scope: 'test' }],

  clienteContext: [async ({}, use) => {
    const env = await setupClienteEnvironment();
    await use({
      token: env.clienteToken,
      email: env.email,
      password: env.password,
    });
  }, { scope: 'test' }],
});

export { expect };
