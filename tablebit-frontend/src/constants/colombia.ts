export const TIPOS_COMIDA = [
  "Colombiana", "Italiana", "Japonesa", "Mexicana", "Parrilla",
  "Sushi", "Cafetería", "Vegana", "Mediterránea", "Mariscos",
  "Rápida", "Internacional", "Postres", "Bar", "Otra",
];

export interface DepartamentoInfo {
  departamento: string;
  ciudades: string[];
}

export const DEPARTAMENTOS: Record<string, string[]> = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Bello", "Envigado", "Itagüí", "Rionegro", "Sabaneta", "Apartadó", "Turbo", "Segovia", "Caucasia", "Titiribí", "Yarumal", "Santa Rosa de Osos", "San Pedro de los Milagros", "La Ceja", "Jardín", "Santa Fe de Antioquia"],
  "Arauca": ["Arauca", "Saravena", "Tame"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Puerto Colombia", "Baranoa", "Sabanalarga", "Santo Tomás", "Galapa", "Polonuevo"],
  "Bogotá D.C.": ["Bogotá"],
  "Bolívar": ["Cartagena de Indias", "Magangué", "Turbaco", "El Carmen de Bolívar", "Mompós", "San Juan Nepomuceno", "Arjona", "María la Baja"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Samaná", "Ramiriquí", "Villa de Leyva", "Monguí", "Nobsa", "Tibasosa", "Soatá"],
  "Caldas": ["Manizales", "Villamaría", "Chinchiná", "Riosucio", "Salamina", "Aguadas", "Anserma", "La Dorada"],
  "Caquetá": ["Florencia", "San Vicente del Caguán", "Cartagena del Chairá", "Puerto Rico", "La Montañita"],
  "Casanare": ["Yopal", "Aguazul", "Paz de Ariporo", "Villanueva", "Tauramena", "Monterrey", "Trinidad"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Miranda", "Corinto", "Piendamó", "Silvia", "El Tambo", "Caldono", "Balboa"],
  "Cesar": ["Valledupar", "Aguachica", "Codazzi", "La Paz", "San Alberto", "Río de Oro", "Chiriguaná", "Curumaní"],
  "Chocó": ["Quibdó", "Istmina", "Turbo", "Bahía Solano", "Nuquí", "Acandí"],
  "Córdoba": ["Montería", "Lorica", "Cereté", "Sahagún", "Planeta Rica", "Tierralta", "San Antero", "Puerto Escondido", "Ciénaga de Oro"],
  "Cundinamarca": ["Soacha", "Zipaquirá", "Facatativá", "Chía", "Mosquera", "Madrid", "Fusagasugá", "Girardot", "Ubaté", "Cajicá", "Cota", "Tabio", "Tenjo", "Funza", "Sopó", "La Calera", "Sibaté", "Villeta", "Pacho", "San Francisco"],
  "Guainía": ["Inírida", "Puerto Colombia"],
  "Guaviare": ["San José del Guaviare", "Calamar", "El Retorno"],
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "San Agustín", "Baraya", "Palermo", "Villavieja"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia", "Fonseca", "Albania", "Barrancas", "San Juan del Cesar", "Dibulla", "Manaure"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "El Banco", "Plato", "Aracataca", "Algarrobo", "Pivijay", "San Sebastián de Buenavista"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "Puerto López", "San Martín", "Restrepo", "Cumaral", "Puerto Gaitán", "Cabuyaro"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales", "Túquerres", "La Unión", "Barbacoas", "Samaniego", "Sandoná", "El Charco", "Mocondino", "Yacuanquer", "Cumbal"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Los Patios", "Villa del Rosario", "Chinácota", "Ábrego", "Convención", "Tibú", "Sardinata"],
  "Putumayo": ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuez", "San Miguel", "Puerto Leguízamo", "Sibundoy"],
  "Quindío": ["Armenia", "Calarcá", "Salento", "Montenegro", "Quimbaya", "Filandia", "Buenavista"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Marsella", "Quinchía", "Belén de Umbría", "Apía"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "San Gil", "Socorro", "Lebrija", "Barbosa", "Puente Nacional", "San Vicente de Chucurí", "Málaga", "Vélez", "Cimitarra"],
  "Sucre": ["Sincelejo", "Corozal", "San Marcos", "Sampués", "Tolú", "San Benito Abad", "Ovejas", "Los Palmitos", "Coveñas"],
  "Tolima": ["Ibagué", "Espinal", "Honda", "Rovira", "Mariquita", "Líbano", "Melgar", "Purificación", "Chaparral", "Falan", "San Luis", "Saldaña"],
  "Valle del Cauca": ["Cali", "Palmira", "Buenaventura", "Tuluá", "Yumbo", "Jamundí", "Cartago", "Buga", "Sevilla", "Roldanillo", "Candelaria", "Dagua", "Zarzal", "Caicedonia", "El Cerrito", "La Unión", "Ansermanuevo", "Toro", "Obando"],
  "Vaupés": ["Mitú", "Carurú", "Taraira"],
  "Vichada": ["Puerto Carreño", "La Primavera", "Santa Rosalía", "Cumaribo"],
};

export const DEPARTAMENTOS_LIST = Object.keys(DEPARTAMENTOS);
