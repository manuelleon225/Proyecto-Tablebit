import { API_URL, TEST_RESTAURANTE, TEST_MESA } from './test-data';

let counter = 0;

function uniqueEmail(base: string) {
  counter++;
  return `e2e-${base}-${Date.now()}-${counter}@tablebit.com`;
}

async function api(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status >= 400 ? { error: await res.text() } : await res.json();
  return { status: res.status, data };
}

export async function registerUser(name: string, email: string, password: string) {
  return api('POST', '/register', { name, email, password });
}

export async function loginUser(email: string, password: string) {
  return api('POST', '/login', { email, password });
}

export async function createRestaurante(token: string, userId: number, nombre?: string) {
  return api('POST', '/restaurantes', {
    ...TEST_RESTAURANTE,
    nombre: nombre || `${TEST_RESTAURANTE.nombre} ${Date.now()}`,
    user_id: userId,
  }, token);
}

export async function createMesa(token: string, restauranteId: number) {
  return api('POST', '/mesas', { ...TEST_MESA, restaurante_id: restauranteId }, token);
}

export async function setupAdminEnvironment() {
  const email = uniqueEmail('admin');
  const regRes = await registerUser('Admin E2E', email, 'admin123456');
  const userData = regRes.data.user || regRes.data;
  const token = regRes.data.token;

  const restRes = await createRestaurante(token, userData.id);
  const restaurante = restRes.data.restaurante || restRes.data;

  const mesaRes = await createMesa(token, restaurante.id);

  return {
    adminToken: token,
    adminUser: userData,
    restaurante,
    mesa: mesaRes.data.mesa || mesaRes.data,
    email,
    password: 'admin123456',
  };
}

export async function setupClienteEnvironment() {
  const email = uniqueEmail('cliente');
  const regRes = await registerUser('Cliente E2E', email, 'test123456');
  const userData = regRes.data.user || regRes.data;
  const token = regRes.data.token;

  return {
    clienteToken: token,
    clienteUser: userData,
    email,
    password: 'test123456',
  };
}
