import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { authService, type User, type LoginData, type RegisterData, type UpdateProfileData } from "@/services/authService";
import { handleApiError } from "@/services/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requiresOnboarding: boolean;
  login: (data: LoginData) => Promise<{ success: boolean; error?: string; user?: User }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateToken = useCallback(async () => {
    const savedToken = localStorage.getItem("tablebit_token");
    const savedUser = localStorage.getItem("tablebit_user");
    if (savedToken && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser) as User;
        setToken(savedToken);
        setUser(parsedUser);
        setRequiresOnboarding(parsedUser.requires_onboarding ?? false);

        try {
          const me = await authService.getMe();
          setUser(me);
          setRequiresOnboarding(me.requires_onboarding ?? false);
          localStorage.setItem("tablebit_user", JSON.stringify(me));
        } catch {
          localStorage.removeItem("tablebit_token");
          localStorage.removeItem("tablebit_user");
          localStorage.removeItem("tablebit_restaurante_id");
          setUser(null);
          setToken(null);
          setRequiresOnboarding(false);
        }
      } catch {
        localStorage.removeItem("tablebit_token");
        localStorage.removeItem("tablebit_user");
        localStorage.removeItem("tablebit_restaurante_id");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    validateToken();
  }, [validateToken]);

  useEffect(() => {
    const handleLogout = () => {
      setUser(null);
      setToken(null);
      setRequiresOnboarding(false);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = useCallback(async (data: LoginData) => {
    try {
      const result = await authService.login(data);
      setUser(result.user);
      setToken(result.token);
      setRequiresOnboarding(result.requires_onboarding ?? false);
      localStorage.setItem("tablebit_token", result.token);
      localStorage.setItem("tablebit_user", JSON.stringify(result.user));
      return { success: true, user: result.user };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    try {
      const result = await authService.register(data);
      setUser(result.user);
      setToken(result.token);
      setRequiresOnboarding(result.requires_onboarding ?? false);
      localStorage.setItem("tablebit_token", result.token);
      localStorage.setItem("tablebit_user", JSON.stringify(result.user));
      return { success: true, user: result.user };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  }, []);

  const queryClient = useQueryClient();

  const logout = useCallback(async () => {
    await authService.logout();
    queryClient.clear();
    setUser(null);
    setToken(null);
    setRequiresOnboarding(false);
    localStorage.removeItem("tablebit_token");
    localStorage.removeItem("tablebit_user");
    localStorage.removeItem("tablebit_restaurante_id");
  }, [queryClient]);

  const updateProfile = useCallback(async (data: UpdateProfileData) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      localStorage.setItem("tablebit_user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  }, []);

  const updateUser = useCallback((newUser: User) => {
    setUser(newUser);
    localStorage.setItem("tablebit_user", JSON.stringify(newUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!user, isLoading, requiresOnboarding, login, register, logout, updateProfile, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
