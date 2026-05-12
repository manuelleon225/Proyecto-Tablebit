export const TEST_USERS = {
  cliente: {
    name: 'Test Cliente',
    email: 'e2e-cliente@tablebit.com',
    password: 'test123456',
    role: 'cliente',
  },
  admin: {
    name: 'Test Admin',
    email: 'e2e-admin@tablebit.com',
    password: 'admin123456',
    role: 'admin',
  },
  adminRestaurante: {
    name: 'Test Admin Rest',
    email: 'e2e-admin-rest@tablebit.com',
    password: 'admin123456',
    role: 'admin_restaurante',
  },
};

export const TEST_RESTAURANTE = {
  nombre: 'E2E Test Restaurante',
  direccion: 'Calle Test 123',
  ciudad: 'Test City',
  tipo_comida: 'Test Food',
  capacidad_total: 50,
  telefono: '555-0100',
};

export const TEST_MESA = {
  numero: 1,
  capacidad: 4,
};

export const API_URL = 'http://localhost:8000/api';
export const FRONTEND_URL = 'http://localhost:5173';
