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
  logo?: string;
  banner?: string;
  ciudad?: string;
  tipo_comida?: string;
  horario_apertura?: string;
  horario_cierre?: string;
  capacidad_total?: number;
  lat?: string;
  lng?: string;
  slug?: string;
  amenities?: string[];
  imagenes?: Imagen[];
  mesas?: Mesa[];
  reservas?: Reserva[];
  rating_promedio?: number;
  total_resenas?: number;
  abierto_ahora?: boolean;
  branding?: {
    primary_color?: string;
    secondary_color?: string;
    accent_color?: string;
  };
}

export interface Imagen {
  id: number;
  restaurante_id: number;
  ruta: string;
  tipo?: string;
  nombre_original?: string;
  tamanio_kb?: number;
  orden?: number;
  created_at?: string;
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
