import api from "./api";

export interface Restaurante {
  id: number;
  user_id?: number;
  nombre: string;
  direccion: string;
  telefono?: string;
  estado?: string;
  descripcion?: string;
  imagen?: string;
  portada?: string;
  ciudad?: string;
  tipo_comida?: string;
  horario_apertura?: string;
  horario_cierre?: string;
  capacidad_total?: number;
  mesas?: Mesa[];
  reservas?: Reserva[];
  rating_promedio?: number;
  total_resenas?: number;
  abierto_ahora?: boolean;
}

export interface Mesa {
  id: number;
  restaurante_id: number;
  numero: number;
  capacidad: number;
  estado: "disponible" | "ocupada" | "inactiva" | "mantenimiento";
  restaurante?: Restaurante;
  reservas?: Reserva[];
}

export type ReservaEstado = "pendiente" | "confirmada" | "completada" | "cancelada" | "no_show";

export interface Reserva {
  id: number;
  cliente_id: number;
  restaurante_id: number;
  mesa_id: number;
  fecha: string;
  hora: string;
  hora_fin?: string;
  duracion: number;
  cantidad_personas: number;
  tipo_evento?: string;
  notas?: string;
  estado: ReservaEstado;
  cliente?: { id: number; name: string; email: string };
  restaurante?: Restaurante;
  mesa?: Mesa;
  created_at?: string;
  updated_at?: string;
}

export interface Resena {
  id: number;
  cliente_id: number;
  restaurante_id: number;
  reserva_id?: number;
  rating: number;
  comentario?: string;
  cliente?: { id: number; name: string };
  created_at?: string;
}

export interface HorarioDia {
  id: number;
  restaurante_id: number;
  dia: string;
  activo: boolean;
  hora_apertura?: string;
  hora_cierre?: string;
  hora_apertura_tarde?: string;
  hora_cierre_tarde?: string;
}

export interface DashboardAnalytics {
  reservas_hoy: number;
  total_reservas_periodo: number;
  confirmadas: number;
  completadas: number;
  canceladas: number;
  no_shows: number;
  tasa_cancelacion: number;
  tasa_no_show: number;
  ocupacion_hoy: number;
  mesas_totales: number;
  mesas_ocupadas_hoy: number;
  mesas_libres_hoy: number;
  personas_promedio: number;
  horas_pico: { hora: number; total: number }[];
  reservas_por_dia: { fecha: string; total: number }[];
  reservas_por_semana: { semana: string; total: number }[];
}

export interface CalendarioEvento {
  id: number;
  title: string;
  start: string;
  end?: string;
  backgroundColor: string;
  borderColor: string;
  extendedProps: {
    estado: ReservaEstado;
    mesa?: string;
    personas: number;
    cliente_email?: string;
    notas?: string;
    duracion: number;
  };
}

export interface DisponibilidadRequest {
  restaurante_id: number;
  fecha: string;
  hora: string;
  duracion?: number;
  personas: number;
}

export interface DisponibilidadResponse {
  disponible: boolean;
  mesas?: Mesa[];
  total_disponibles: number;
  error?: string;
}

export interface ReservaRequest {
  restaurante_id: number;
  mesa_id?: number;
  fecha: string;
  hora: string;
  duracion?: number;
  cantidad_personas: number;
  tipo_evento?: string;
  notas?: string;
}

export interface CrearMesaRequest {
  restaurante_id: number;
  numero: number;
  capacidad: number;
  estado?: string;
}

export interface ResenaRequest {
  rating: number;
  comentario?: string;
  reserva_id?: number;
}

export const restauranteService = {
  getAll: () => api.get<Restaurante[]>("/restaurantes"),

  getById: (id: number) => api.get<{ restaurante: Restaurante; rating_promedio: number; total_resenas: number; abierto_ahora: boolean }>(`/restaurantes/${id}`),

  buscar: (params: { nombre?: string; ciudad?: string; tipo_comida?: string; ordenar?: string; per_page?: number }) =>
    api.get("/buscar-restaurantes", { params }),

  crear: (data: { nombre: string; direccion: string; telefono?: string; ciudad?: string; tipo_comida?: string; capacidad_total?: number }) =>
    api.post("/restaurantes", data),

  actualizar: (id: number, data: Partial<Restaurante>) =>
    api.put(`/restaurantes/${id}`, data),

  eliminar: (id: number) =>
    api.delete(`/restaurantes/${id}`),

  getPublic: (id: number) =>
    api.get(`/restaurantes/${id}/public`),

  getPublicBySlug: (slug: string) =>
    api.get(`/public/restaurantes/${slug}`),

  getResenas: (restauranteId: number, page = 1) =>
    api.get(`/restaurantes/${restauranteId}/resenas`, { params: { page } }),

  crearResena: (restauranteId: number, data: ResenaRequest) =>
    api.post(`/restaurantes/${restauranteId}/resenas`, data),

  eliminarResena: (id: number) =>
    api.delete(`/resenas/${id}`),

  misResenas: (page = 1) =>
    api.get("/mis-resenas", { params: { page } }),

  getMisRestaurantes: () =>
    api.get<Restaurante[]>("/mis-restaurantes"),

  // Reservas
  getReservas: (params?: { restaurante_id?: number; estado?: string; fecha_inicio?: string; fecha_fin?: string; fecha?: string; per_page?: number }) =>
    api.get("/reservas", { params }),

  crearReserva: (data: ReservaRequest) =>
    api.post("/reservas", data),

  obtenerReserva: (id: number) =>
    api.get<Reserva>(`/reservas/${id}`),

  actualizarReserva: (id: number, data: Partial<Reserva>) =>
    api.put(`/reservas/${id}`, data),

  eliminarReserva: (id: number) =>
    api.delete(`/reservas/${id}`),

  cambiarEstadoReserva: (id: number, estado: ReservaEstado) =>
    api.patch(`/reservas/${id}/estado`, { estado }),

  misReservas: (params?: { estado?: string; futuras?: string }) =>
    api.get<Reserva[]>("/mis-reservas", { params }),

  cancelarReserva: (id: number) =>
    api.patch(`/reservas/${id}/cancelar`),

  reservaAutomatica: (data: Omit<ReservaRequest, "mesa_id">) =>
    api.post("/reserva-automatica", data),

  verificarDisponibilidad: (data: DisponibilidadRequest) =>
    api.post<DisponibilidadResponse>("/disponibilidad", data),

  // Mesas
  getMesas: (params?: { restaurante_id?: number; estado?: string }) =>
    api.get<Mesa[]>("/mesas", { params }),

  getMesasRestaurante: (restauranteId: number) =>
    api.get<Mesa[]>(`/mesas/restaurante/${restauranteId}`),

  crearMesa: (data: CrearMesaRequest) => api.post("/mesas", data),

  actualizarMesa: (id: number, data: Partial<Mesa>) =>
    api.put(`/mesas/${id}`, data),

  eliminarMesa: (id: number) =>
    api.delete(`/mesas/${id}`),

  // Dashboard
  getDashboard: (restauranteId: number, params?: { fecha_inicio?: string; fecha_fin?: string }) =>
    api.get<DashboardAnalytics>(`/dashboard/restaurante/${restauranteId}`, { params }),

  getCalendario: (restauranteId: number, fechaInicio: string, fechaFin: string) =>
    api.get<{ eventos: CalendarioEvento[] }>(`/calendario/restaurante/${restauranteId}`, {
      params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin },
    }),

  // Horarios
  getHorarios: (restauranteId: number) =>
    api.get<HorarioDia[]>(`/restaurantes/${restauranteId}/horarios`),

  crearHorario: (restauranteId: number, data: Partial<HorarioDia>) =>
    api.post(`/restaurantes/${restauranteId}/horarios`, data),

  actualizarHorario: (id: number, data: Partial<HorarioDia>) =>
    api.put(`/horarios/${id}`, data),

  eliminarHorario: (id: number) =>
    api.delete(`/horarios/${id}`),

  seedHorarios: (restauranteId: number) =>
    api.post(`/restaurantes/${restauranteId}/horarios/seed`),

  // Restaurant Hours (new)
  getHours: (restauranteId: number) =>
    api.get(`/restaurantes/${restauranteId}/hours`),

  updateHours: (restauranteId: number, data: { hours: any[] }) =>
    api.put(`/restaurantes/${restauranteId}/hours`, data),

  // Favoritos
  getFavoritos: () => api.get("/favoritos"),

  toggleFavorito: (restauranteId: number) =>
    api.post(`/favoritos/${restauranteId}`),

  verificarFavorito: (restauranteId: number) =>
    api.get<{ es_favorito: boolean }>(`/favoritos/${restauranteId}/verificar`),
};
