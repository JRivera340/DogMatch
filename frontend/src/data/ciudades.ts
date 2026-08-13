export interface Ciudad {
  nombre: string;
  departamento: string;
  lat: number;
  lng: number;
  zoom: number;
}

// Capital de cada uno de los 32 departamentos de Colombia + Bogotá D.C.
export const CIUDADES_COLOMBIA: Ciudad[] = [
  { nombre: 'Bogotá', departamento: 'Bogotá D.C.', lat: 4.711, lng: -74.0721, zoom: 12 },
  { nombre: 'Medellín', departamento: 'Antioquia', lat: 6.2442, lng: -75.5812, zoom: 12 },
  { nombre: 'Cali', departamento: 'Valle del Cauca', lat: 3.4516, lng: -76.532, zoom: 12 },
  { nombre: 'Barranquilla', departamento: 'Atlántico', lat: 10.9639, lng: -74.7964, zoom: 12 },
  { nombre: 'Cartagena', departamento: 'Bolívar', lat: 10.391, lng: -75.4794, zoom: 12 },
  { nombre: 'Bucaramanga', departamento: 'Santander', lat: 7.1193, lng: -73.1227, zoom: 13 },
  { nombre: 'Pereira', departamento: 'Risaralda', lat: 4.8143, lng: -75.6946, zoom: 13 },
  { nombre: 'Manizales', departamento: 'Caldas', lat: 5.0689, lng: -75.5174, zoom: 13 },
  { nombre: 'Cúcuta', departamento: 'Norte de Santander', lat: 7.8939, lng: -72.5078, zoom: 13 },
  { nombre: 'Santa Marta', departamento: 'Magdalena', lat: 11.2408, lng: -74.199, zoom: 13 },
  { nombre: 'Ibagué', departamento: 'Tolima', lat: 4.4389, lng: -75.2322, zoom: 13 },
  { nombre: 'Villavicencio', departamento: 'Meta', lat: 4.142, lng: -73.6266, zoom: 13 },
  { nombre: 'Armenia', departamento: 'Quindío', lat: 4.5339, lng: -75.6811, zoom: 13 },
  { nombre: 'Leticia', departamento: 'Amazonas', lat: -4.2153, lng: -69.9406, zoom: 13 },
  { nombre: 'Arauca', departamento: 'Arauca', lat: 7.0847, lng: -70.7591, zoom: 13 },
  { nombre: 'Tunja', departamento: 'Boyacá', lat: 5.5353, lng: -73.3678, zoom: 13 },
  { nombre: 'Florencia', departamento: 'Caquetá', lat: 1.6144, lng: -75.6062, zoom: 13 },
  { nombre: 'Yopal', departamento: 'Casanare', lat: 5.3378, lng: -72.3959, zoom: 13 },
  { nombre: 'Popayán', departamento: 'Cauca', lat: 2.4448, lng: -76.6147, zoom: 13 },
  { nombre: 'Valledupar', departamento: 'Cesar', lat: 10.4631, lng: -73.2532, zoom: 13 },
  { nombre: 'Quibdó', departamento: 'Chocó', lat: 5.6947, lng: -76.6583, zoom: 13 },
  { nombre: 'Montería', departamento: 'Córdoba', lat: 8.7479, lng: -75.8814, zoom: 13 },
  { nombre: 'Zipaquirá', departamento: 'Cundinamarca', lat: 5.0264, lng: -74.0035, zoom: 13 },
  { nombre: 'Inírida', departamento: 'Guainía', lat: 3.8653, lng: -67.9239, zoom: 13 },
  { nombre: 'San José del Guaviare', departamento: 'Guaviare', lat: 2.5709, lng: -72.6437, zoom: 13 },
  { nombre: 'Neiva', departamento: 'Huila', lat: 2.9273, lng: -75.2819, zoom: 13 },
  { nombre: 'Riohacha', departamento: 'La Guajira', lat: 11.5444, lng: -72.9072, zoom: 13 },
  { nombre: 'Pasto', departamento: 'Nariño', lat: 1.2136, lng: -77.2811, zoom: 13 },
  { nombre: 'Mocoa', departamento: 'Putumayo', lat: 1.1487, lng: -76.6478, zoom: 13 },
  { nombre: 'San Andrés', departamento: 'San Andrés y Providencia', lat: 12.5847, lng: -81.7006, zoom: 13 },
  { nombre: 'Sincelejo', departamento: 'Sucre', lat: 9.3047, lng: -75.3978, zoom: 13 },
  { nombre: 'Mitú', departamento: 'Vaupés', lat: 1.1983, lng: -70.1733, zoom: 13 },
  { nombre: 'Puerto Carreño', departamento: 'Vichada', lat: 6.1891, lng: -67.4859, zoom: 13 },

];

// Todos los municipios de los 5 departamentos de la zona del desastre temporal
// (Caldas, Quindío, Risaralda, Chocó, Valle del Cauca) — capitales ya están arriba.
export const MUNICIPIOS_ZONA_DESASTRE: Ciudad[] = [
  // Caldas
  { nombre: 'Aguadas', departamento: 'Caldas', lat: 5.6108, lng: -75.4772, zoom: 14 },
  { nombre: 'Anserma', departamento: 'Caldas', lat: 5.2331, lng: -75.7847, zoom: 14 },
  { nombre: 'Aranzazu', departamento: 'Caldas', lat: 5.2667, lng: -75.4975, zoom: 14 },
  { nombre: 'Belalcázar', departamento: 'Caldas', lat: 5.2144, lng: -75.8161, zoom: 14 },
  { nombre: 'Chinchiná', departamento: 'Caldas', lat: 4.9836, lng: -75.6069, zoom: 14 },
  { nombre: 'Filadelfia', departamento: 'Caldas', lat: 5.2967, lng: -75.5619, zoom: 14 },
  { nombre: 'La Dorada', departamento: 'Caldas', lat: 5.4519, lng: -74.6608, zoom: 14 },
  { nombre: 'La Merced', departamento: 'Caldas', lat: 5.3572, lng: -75.5467, zoom: 14 },
  { nombre: 'Manzanares', departamento: 'Caldas', lat: 5.2494, lng: -75.1522, zoom: 14 },
  { nombre: 'Marmato', departamento: 'Caldas', lat: 5.4692, lng: -75.5928, zoom: 14 },
  { nombre: 'Marquetalia', departamento: 'Caldas', lat: 5.2925, lng: -75.0578, zoom: 14 },
  { nombre: 'Marulanda', departamento: 'Caldas', lat: 5.2836, lng: -75.2417, zoom: 14 },
  { nombre: 'Neira', departamento: 'Caldas', lat: 5.1656, lng: -75.5222, zoom: 14 },
  { nombre: 'Norcasia', departamento: 'Caldas', lat: 5.5719, lng: -74.8875, zoom: 14 },
  { nombre: 'Pácora', departamento: 'Caldas', lat: 5.5175, lng: -75.4625, zoom: 14 },
  { nombre: 'Palestina', departamento: 'Caldas', lat: 5.0292, lng: -75.5822, zoom: 14 },
  { nombre: 'Pensilvania', departamento: 'Caldas', lat: 5.3897, lng: -75.1339, zoom: 14 },
  { nombre: 'Riosucio (Caldas)', departamento: 'Caldas', lat: 5.4257, lng: -75.7014, zoom: 14 },
  { nombre: 'Risaralda (Caldas)', departamento: 'Caldas', lat: 5.1667, lng: -75.7833, zoom: 14 },
  { nombre: 'Salamina', departamento: 'Caldas', lat: 5.4083, lng: -75.4886, zoom: 14 },
  { nombre: 'Samaná', departamento: 'Caldas', lat: 5.4053, lng: -74.9908, zoom: 14 },
  { nombre: 'San José (Caldas)', departamento: 'Caldas', lat: 5.1097, lng: -75.7842, zoom: 14 },
  { nombre: 'Supía', departamento: 'Caldas', lat: 5.4547, lng: -75.6547, zoom: 14 },
  { nombre: 'Victoria (Caldas)', departamento: 'Caldas', lat: 5.3172, lng: -74.9139, zoom: 14 },
  { nombre: 'Villamaría', departamento: 'Caldas', lat: 5.05, lng: -75.5083, zoom: 14 },
  { nombre: 'Viterbo', departamento: 'Caldas', lat: 5.0644, lng: -75.8683, zoom: 14 },

  // Quindío
  { nombre: 'Buenavista (Quindío)', departamento: 'Quindío', lat: 4.3439, lng: -75.7439, zoom: 14 },
  { nombre: 'Calarcá', departamento: 'Quindío', lat: 4.5292, lng: -75.6436, zoom: 14 },
  { nombre: 'Circasia', departamento: 'Quindío', lat: 4.6167, lng: -75.6333, zoom: 14 },
  { nombre: 'Córdoba (Quindío)', departamento: 'Quindío', lat: 4.3856, lng: -75.6867, zoom: 14 },
  { nombre: 'Filandia', departamento: 'Quindío', lat: 4.6742, lng: -75.6647, zoom: 14 },
  { nombre: 'Génova', departamento: 'Quindío', lat: 4.1997, lng: -75.7369, zoom: 14 },
  { nombre: 'La Tebaida', departamento: 'Quindío', lat: 4.453, lng: -75.797, zoom: 14 },
  { nombre: 'Montenegro', departamento: 'Quindío', lat: 4.5675, lng: -75.7513, zoom: 14 },
  { nombre: 'Pijao', departamento: 'Quindío', lat: 4.3389, lng: -75.7028, zoom: 14 },
  { nombre: 'Quimbaya', departamento: 'Quindío', lat: 4.6247, lng: -75.7614, zoom: 14 },
  { nombre: 'Salento', departamento: 'Quindío', lat: 4.6392, lng: -75.5711, zoom: 14 },

  // Risaralda
  { nombre: 'Apía', departamento: 'Risaralda', lat: 5.1075, lng: -75.9439, zoom: 14 },
  { nombre: 'Balboa (Risaralda)', departamento: 'Risaralda', lat: 4.9497, lng: -75.9578, zoom: 14 },
  { nombre: 'Belén de Umbría', departamento: 'Risaralda', lat: 5.1975, lng: -75.8703, zoom: 14 },
  { nombre: 'Dosquebradas', departamento: 'Risaralda', lat: 4.8355, lng: -75.6704, zoom: 14 },
  { nombre: 'Guática', departamento: 'Risaralda', lat: 5.3, lng: -75.7981, zoom: 14 },
  { nombre: 'La Celia', departamento: 'Risaralda', lat: 5.0044, lng: -76.0022, zoom: 14 },
  { nombre: 'La Virginia', departamento: 'Risaralda', lat: 4.8983, lng: -75.8767, zoom: 14 },
  { nombre: 'Marsella', departamento: 'Risaralda', lat: 4.9377, lng: -75.7376, zoom: 14 },
  { nombre: 'Mistrató', departamento: 'Risaralda', lat: 5.2864, lng: -75.8828, zoom: 14 },
  { nombre: 'Pueblo Rico', departamento: 'Risaralda', lat: 5.2192, lng: -76.0397, zoom: 14 },
  { nombre: 'Quinchía', departamento: 'Risaralda', lat: 5.3364, lng: -75.7367, zoom: 14 },
  { nombre: 'Santa Rosa de Cabal', departamento: 'Risaralda', lat: 4.8703, lng: -75.6216, zoom: 14 },
  { nombre: 'Santuario', departamento: 'Risaralda', lat: 5.05, lng: -75.9636, zoom: 14 },

  // Chocó
  { nombre: 'Acandí', departamento: 'Chocó', lat: 8.5136, lng: -77.2769, zoom: 13 },
  { nombre: 'Alto Baudó', departamento: 'Chocó', lat: 5.4667, lng: -76.9667, zoom: 13 },
  { nombre: 'Atrato', departamento: 'Chocó', lat: 5.5333, lng: -76.6833, zoom: 13 },
  { nombre: 'Bagadó', departamento: 'Chocó', lat: 5.4167, lng: -76.4167, zoom: 13 },
  { nombre: 'Bahía Solano', departamento: 'Chocó', lat: 6.2202, lng: -77.4056, zoom: 13 },
  { nombre: 'Bajo Baudó', departamento: 'Chocó', lat: 4.9667, lng: -77.3667, zoom: 13 },
  { nombre: 'Bojayá', departamento: 'Chocó', lat: 6.15, lng: -76.9667, zoom: 13 },
  { nombre: 'Cantón de San Pablo', departamento: 'Chocó', lat: 5.35, lng: -76.75, zoom: 13 },
  { nombre: 'Carmen del Darién', departamento: 'Chocó', lat: 6.85, lng: -76.9, zoom: 13 },
  { nombre: 'Cértegui', departamento: 'Chocó', lat: 5.3944, lng: -76.6294, zoom: 14 },
  { nombre: 'Condoto', departamento: 'Chocó', lat: 5.0964, lng: -76.6467, zoom: 14 },
  { nombre: 'El Carmen de Atrato', departamento: 'Chocó', lat: 5.9083, lng: -76.15, zoom: 13 },
  { nombre: 'El Litoral del San Juan', departamento: 'Chocó', lat: 4.4667, lng: -77.35, zoom: 13 },
  { nombre: 'Istmina', departamento: 'Chocó', lat: 5.1546, lng: -76.6845, zoom: 14 },
  { nombre: 'Juradó', departamento: 'Chocó', lat: 7.1083, lng: -77.7667, zoom: 13 },
  { nombre: 'Lloró', departamento: 'Chocó', lat: 5.5, lng: -76.5333, zoom: 14 },
  { nombre: 'Medio Atrato', departamento: 'Chocó', lat: 5.9667, lng: -76.75, zoom: 13 },
  { nombre: 'Medio Baudó', departamento: 'Chocó', lat: 5.2833, lng: -77.0, zoom: 13 },
  { nombre: 'Medio San Juan', departamento: 'Chocó', lat: 5.0833, lng: -76.6833, zoom: 14 },
  { nombre: 'Nóvita', departamento: 'Chocó', lat: 4.95, lng: -76.6167, zoom: 14 },
  { nombre: 'Nuquí', departamento: 'Chocó', lat: 5.7108, lng: -77.2686, zoom: 13 },
  { nombre: 'Río Iró', departamento: 'Chocó', lat: 5.15, lng: -76.55, zoom: 14 },
  { nombre: 'Río Quito', departamento: 'Chocó', lat: 5.4667, lng: -76.75, zoom: 14 },
  { nombre: 'Riosucio (Chocó)', departamento: 'Chocó', lat: 7.4372, lng: -77.1103, zoom: 13 },
  { nombre: 'San José del Palmar', departamento: 'Chocó', lat: 4.9667, lng: -76.2667, zoom: 14 },
  { nombre: 'Sipí', departamento: 'Chocó', lat: 4.6667, lng: -76.75, zoom: 14 },
  { nombre: 'Tadó', departamento: 'Chocó', lat: 5.2664, lng: -76.5606, zoom: 14 },
  { nombre: 'Unguía', departamento: 'Chocó', lat: 8.0447, lng: -77.0839, zoom: 13 },
  { nombre: 'Unión Panamericana', departamento: 'Chocó', lat: 5.2833, lng: -76.6333, zoom: 14 },

  // Valle del Cauca
  { nombre: 'Alcalá', departamento: 'Valle del Cauca', lat: 4.6725, lng: -75.7825, zoom: 14 },
  { nombre: 'Andalucía', departamento: 'Valle del Cauca', lat: 4.1717, lng: -76.1583, zoom: 14 },
  { nombre: 'Ansermanuevo', departamento: 'Valle del Cauca', lat: 4.7889, lng: -75.9908, zoom: 14 },
  { nombre: 'Argelia (Valle)', departamento: 'Valle del Cauca', lat: 4.7275, lng: -76.0433, zoom: 14 },
  { nombre: 'Bolívar (Valle)', departamento: 'Valle del Cauca', lat: 4.35, lng: -76.1833, zoom: 14 },
  { nombre: 'Buenaventura', departamento: 'Valle del Cauca', lat: 3.8801, lng: -77.0312, zoom: 13 },
  { nombre: 'Buga', departamento: 'Valle del Cauca', lat: 3.9009, lng: -76.2983, zoom: 14 },
  { nombre: 'Bugalagrande', departamento: 'Valle del Cauca', lat: 4.2075, lng: -76.1614, zoom: 14 },
  { nombre: 'Caicedonia', departamento: 'Valle del Cauca', lat: 4.3325, lng: -75.8256, zoom: 14 },
  { nombre: 'Calima (Darién)', departamento: 'Valle del Cauca', lat: 3.9436, lng: -76.4964, zoom: 14 },
  { nombre: 'Candelaria', departamento: 'Valle del Cauca', lat: 3.4108, lng: -76.35, zoom: 14 },
  { nombre: 'Cartago', departamento: 'Valle del Cauca', lat: 4.7455, lng: -75.9096, zoom: 14 },
  { nombre: 'Dagua', departamento: 'Valle del Cauca', lat: 3.6572, lng: -76.6883, zoom: 14 },
  { nombre: 'El Águila', departamento: 'Valle del Cauca', lat: 4.9236, lng: -75.9686, zoom: 14 },
  { nombre: 'El Cairo', departamento: 'Valle del Cauca', lat: 4.7492, lng: -76.2519, zoom: 14 },
  { nombre: 'El Cerrito', departamento: 'Valle del Cauca', lat: 3.6817, lng: -76.3178, zoom: 14 },
  { nombre: 'El Dovio', departamento: 'Valle del Cauca', lat: 4.5089, lng: -76.2358, zoom: 14 },
  { nombre: 'Florida (Valle)', departamento: 'Valle del Cauca', lat: 3.3236, lng: -76.2336, zoom: 14 },
  { nombre: 'Ginebra', departamento: 'Valle del Cauca', lat: 3.7247, lng: -76.2664, zoom: 14 },
  { nombre: 'Guacarí', departamento: 'Valle del Cauca', lat: 3.7625, lng: -76.3325, zoom: 14 },
  { nombre: 'Jamundí', departamento: 'Valle del Cauca', lat: 3.2617, lng: -76.5375, zoom: 14 },
  { nombre: 'La Cumbre', departamento: 'Valle del Cauca', lat: 3.65, lng: -76.5667, zoom: 14 },
  { nombre: 'La Unión', departamento: 'Valle del Cauca', lat: 4.5325, lng: -76.1094, zoom: 14 },
  { nombre: 'La Victoria (Valle)', departamento: 'Valle del Cauca', lat: 4.5136, lng: -76.0175, zoom: 14 },
  { nombre: 'Obando', departamento: 'Valle del Cauca', lat: 4.5719, lng: -75.9917, zoom: 14 },
  { nombre: 'Palmira', departamento: 'Valle del Cauca', lat: 3.5322, lng: -76.3039, zoom: 14 },
  { nombre: 'Pradera', departamento: 'Valle del Cauca', lat: 3.4239, lng: -76.2378, zoom: 14 },
  { nombre: 'Restrepo (Valle)', departamento: 'Valle del Cauca', lat: 3.8181, lng: -76.5219, zoom: 14 },
  { nombre: 'Riofrío', departamento: 'Valle del Cauca', lat: 4.1558, lng: -76.2892, zoom: 14 },
  { nombre: 'Roldanillo', departamento: 'Valle del Cauca', lat: 4.4147, lng: -76.1519, zoom: 14 },
  { nombre: 'San Pedro (Valle)', departamento: 'Valle del Cauca', lat: 4.3239, lng: -76.2314, zoom: 14 },
  { nombre: 'Sevilla', departamento: 'Valle del Cauca', lat: 4.2681, lng: -75.9294, zoom: 14 },
  { nombre: 'Toro', departamento: 'Valle del Cauca', lat: 4.6058, lng: -76.0806, zoom: 14 },
  { nombre: 'Trujillo (Valle)', departamento: 'Valle del Cauca', lat: 4.2156, lng: -76.3225, zoom: 14 },
  { nombre: 'Tuluá', departamento: 'Valle del Cauca', lat: 4.0847, lng: -76.1954, zoom: 14 },
  { nombre: 'Ulloa', departamento: 'Valle del Cauca', lat: 4.7167, lng: -75.75, zoom: 14 },
  { nombre: 'Versalles', departamento: 'Valle del Cauca', lat: 4.5972, lng: -76.1958, zoom: 14 },
  { nombre: 'Vijes', departamento: 'Valle del Cauca', lat: 3.6903, lng: -76.4436, zoom: 14 },
  { nombre: 'Yotoco', departamento: 'Valle del Cauca', lat: 3.8544, lng: -76.3892, zoom: 14 },
  { nombre: 'Yumbo', departamento: 'Valle del Cauca', lat: 3.5828, lng: -76.4941, zoom: 14 },
  { nombre: 'Zarzal', departamento: 'Valle del Cauca', lat: 4.3939, lng: -76.0994, zoom: 14 },
];

export const DEPARTAMENTOS_COLOMBIA: string[] = Array.from(
  new Set(CIUDADES_COLOMBIA.map((c) => c.departamento)),
).sort((a, b) => a.localeCompare(b));

// Departamentos priorizados por la campaña del desastre temporal — usados para
// acotar los filtros de departamento/municipio en los mapas (público y admin).
export const DEPARTAMENTOS_AFECTADOS: string[] = ['Caldas', 'Chocó', 'Quindío', 'Risaralda', 'Valle del Cauca'];

// Todas las ciudades/municipios conocidos (capitales + municipios de la zona del desastre),
// usado para búsquedas puntuales (BuscadorCiudad, lookup de la ciudad elegida en un filtro).
export const TODAS_LAS_CIUDADES: Ciudad[] = [...CIUDADES_COLOMBIA, ...MUNICIPIOS_ZONA_DESASTRE];

// Absolutamente todos los municipios de los 5 departamentos afectados — capital incluida.
export const CIUDADES_AFECTADAS: Ciudad[] = TODAS_LAS_CIUDADES.filter((c) =>
  DEPARTAMENTOS_AFECTADOS.includes(c.departamento),
).sort((a, b) => a.nombre.localeCompare(b.nombre));

/** Centroide (promedio) de las ciudades/municipios conocidos de un departamento, con un zoom más abierto que el de ciudad. */
export function centroDepartamento(departamento: string): Ciudad | null {
  const ciudades = TODAS_LAS_CIUDADES.filter((c) => c.departamento === departamento);
  if (ciudades.length === 0) return null;

  const lat = ciudades.reduce((suma, c) => suma + c.lat, 0) / ciudades.length;
  const lng = ciudades.reduce((suma, c) => suma + c.lng, 0) / ciudades.length;
  const zoom = Math.min(...ciudades.map((c) => c.zoom)) - 2;

  return { nombre: departamento, departamento, lat, lng, zoom };
}
