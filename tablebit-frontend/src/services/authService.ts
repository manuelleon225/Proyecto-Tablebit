import api, { handleApiError } from "./api";
import type { ApiError } from "./api";

export type UserRole = "cliente" | "admin" | "admin_restaurante" | "superadmin";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  estado?: string;
  avatar?: string;
  restaurante?: { id: number; nombre: string };
  requires_onboarding?: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordConfirmData {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  requires_onboarding?: boolean;
}

export const validateLogin = (data: LoginData): ApiError | null => {
  if (!data.email.trim()) return { message: "El email es requerido", status: 400 };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { message: "Email inválido", status: 400 };
  if (!data.password || data.password.length < 6)
    return { message: "La contraseña debe tener al menos 6 caracteres", status: 400 };
  return null;
};

export const validateRegister = (data: RegisterData & { passwordConfirm: string }): ApiError | null => {
  if (!data.name.trim()) return { message: "El nombre es requerido", status: 400 };
  if (!data.email.trim()) return { message: "El email es requerido", status: 400 };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    return { message: "Email inválido", status: 400 };
  if (!data.password || data.password.length < 6)
    return { message: "La contraseña debe tener al menos 6 caracteres", status: 400 };
  if (data.password !== data.passwordConfirm)
    return { message: "Las contraseñas no coinciden", status: 400 };
  return null;
};

export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const validation = validateLogin(data);
    if (validation) throw new Error(validation.message);
    const response = await api.post<AuthResponse>("/login", data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/register", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/logout");
    } catch {
      // Ignore logout errors
    }
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<User>("/usuarios/me");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await api.put<User>("/usuarios/me", data);
    return response.data;
  },

  forgotPassword: async (data: PasswordResetData): Promise<{ message: string }> => {
    const response = await api.post("/password/forgot", data);
    return response.data;
  },

  resetPassword: async (data: PasswordConfirmData): Promise<{ message: string }> => {
    const response = await api.post("/password/reset", data);
    return response.data;
  },
};
