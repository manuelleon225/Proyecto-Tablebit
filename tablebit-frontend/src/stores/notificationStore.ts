import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "reserva" | "cancelacion" | "sistema" | "cliente";
  read: boolean;
  timestamp: Date;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const initialNotifications: Notification[] = [
  { id: generateId(), title: "Nueva reserva", description: "Ana Martínez reservó Mesa 3 para las 20:00", type: "reserva", read: false, timestamp: new Date(Date.now() - 1000 * 60 * 2) },
  { id: generateId(), title: "Reserva cancelada", description: "Pedro Rodríguez canceló su reserva para el sábado", type: "cancelacion", read: false, timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  { id: generateId(), title: "Mesa liberada", description: "Mesa 7 ya está disponible (limpieza completada)", type: "sistema", read: true, timestamp: new Date(Date.now() - 1000 * 60 * 45) },
  { id: generateId(), title: "Cliente frecuente", description: "María García hizo su 5ta reserva este mes", type: "cliente", read: true, timestamp: new Date(Date.now() - 1000 * 60 * 120) },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: initialNotifications,
  unreadCount: initialNotifications.filter((n) => !n.read).length,

  addNotification: (n) => {
    const newNotif: Notification = { ...n, id: generateId(), timestamp: new Date(), read: false };
    set((state) => ({
      notifications: [newNotif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },

  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),
}));
