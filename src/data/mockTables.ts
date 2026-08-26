import { TableSession } from '../types';

export const INITIAL_TABLES: TableSession[] = [
  {
    id: 'mesa-entelequia-dnd5e',
    title: 'El Despertar del Dragón Azul',
    system: 'D&D 5e',
    synopsis: 'Una campaña épica en la Costa de la Espada donde los aventureros deberán investigar rumores sobre un antiguo mal que despierta bajo las minas de Phandalin.',
    setting: 'Fantasía Épica / Forgotten Realms',
    levelRequired: 'Apto Principiantes',
    tags: ['Rol Intenso', 'Combate Táctico', 'Fantasía'],
    slotsTotal: 5,
    slotsTaken: 2,
    venueType: 'store',
    venueName: 'Entelequia',
    addressApprox: 'Juramento 2584',
    zone: 'Belgrano',
    region: 'CABA',
    coordinates: { lat: -34.5615, lng: -58.4552 },
    schedule: {
      frequency: 'Semanal',
      dayOfWeek: 'Sábado',
      time: '15:00',
      durationHours: 4,
      nextSessionDate: '2026-09-05'
    },
    verifiedStatus: {
      isVerified: true,
      type: 'store_verified',
      badgeLabel: 'Tienda Oficial',
      verifiedDate: '2026-01-10',
      dniValidated: true,
      addressValidated: true,
      safetyAudited: true
    },
    dm: {
      id: 'dm-001',
      name: 'Lucas Martínez',
      handle: '@lucas_dm',
      avatar: 'https://i.pravatar.cc/150?u=lucas',
      bio: 'Master de la vieja escuela, amante del rol táctico.',
      experienceYears: 5,
      campaignsFinished: 3,
      rating: 4.8,
      reviewCount: 34,
      badges: ['Master Verificado'],
      reviews: [
        {
          id: 'rev-1',
          authorName: 'Jugador 1',
          authorAvatar: '',
          date: '2026-08-01',
          rating: 5,
          comment: 'Excelente partida',
          campaignPlayed: 'D&D'
        }
      ]
    },
    safetyInfo: {
      tools: ['Tarjeta X', 'Líneas y Velos'],
      atmosphere: 'Intensa pero amigable',
      houseRules: ['Puntualidad requerida'],
      smokingPolicy: 'No se permite fumar',
      petInfo: 'Sin mascotas en el local',
      accessibility: 'Acceso en planta baja',
      snacksPolicy: 'Consumición en el local'
    },
    spacePhotos: [
      { url: 'https://images.unsplash.com/photo-1611843467160-25afb8be5c10?q=80&w=800&auto=format&fit=crop', caption: 'Mesa principal en Entelequia', tag: 'Mesa Principal' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'Consumición en el local ($2500)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mesa-club-caballito-pathfinder',
    title: 'La Maldición de la Corona',
    system: 'Pathfinder 2e',
    synopsis: 'Intrigas políticas y combates mortales en las calles de Korvosa. El Rey ha muerto, y la ciudad se sume en el caos.',
    setting: 'Dark Fantasy / Golarion',
    levelRequired: 'Veteranos',
    tags: ['Intriga', 'Roleplay', 'Política'],
    slotsTotal: 4,
    slotsTaken: 4,
    venueType: 'store',
    venueName: 'El Club del Rol',
    addressApprox: 'Av. Rivadavia 5300',
    zone: 'Caballito',
    region: 'CABA',
    coordinates: { lat: -34.6186, lng: -58.4411 },
    schedule: {
      frequency: 'Quincenal',
      dayOfWeek: 'Viernes',
      time: '20:00',
      durationHours: 4,
      nextSessionDate: '2026-09-11'
    },
    verifiedStatus: {
      isVerified: true,
      type: 'store_verified',
      badgeLabel: 'Club Verificado',
      verifiedDate: '2026-03-20',
      dniValidated: true,
      addressValidated: true,
      safetyAudited: true
    },
    dm: {
      id: 'dm-002',
      name: 'Sofía',
      handle: '@sofi_dnd',
      avatar: 'https://i.pravatar.cc/150?u=sofia',
      bio: 'Fanática del lore profundo y la intriga política.',
      experienceYears: 8,
      campaignsFinished: 5,
      rating: 5.0,
      reviewCount: 42,
      badges: ['Lore Master'],
      reviews: []
    },
    safetyInfo: {
      tools: ['Líneas y Velos', 'Puerta Abierta'],
      atmosphere: 'Misterio y Dark Fantasy',
      houseRules: ['Roleplay intenso'],
      smokingPolicy: 'Balcón habilitado',
      petInfo: 'Tengo un gato',
      accessibility: 'Primer piso por escalera',
      snacksPolicy: 'Traer comida para compartir'
    },
    spacePhotos: [],
    coverImage: 'https://images.unsplash.com/photo-1519082273187-5264b3da3424?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'Bono contribución $3000',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mesa-privada-martin-dnd',
    title: 'Ecos de Barovia',
    system: 'D&D 5e',
    synopsis: 'Atrapados en las brumas. Una adaptación de Curse of Strahd con foco en el terror psicológico y la supervivencia.',
    setting: 'Gótico / Terror',
    levelRequired: 'Nivel Medio',
    tags: ['Horror', 'Supervivencia'],
    slotsTotal: 6,
    slotsTaken: 1,
    venueType: 'private_home',
    venueName: 'Casa de Martín',
    addressApprox: 'Cerca de Plaza San Martín',
    zone: 'San Isidro',
    region: 'GBA Norte',
    coordinates: { lat: -34.4716, lng: -58.5246 },
    schedule: {
      frequency: 'Semanal',
      dayOfWeek: 'Domingo',
      time: '16:00',
      durationHours: 5,
      nextSessionDate: '2026-09-06'
    },
    verifiedStatus: {
      isVerified: true,
      type: 'host_verified',
      badgeLabel: 'Anfitrión Verificado',
      verifiedDate: '2026-05-10',
      dniValidated: true,
      addressValidated: true,
      safetyAudited: true
    },
    dm: {
      id: 'dm-003',
      name: 'Martín',
      handle: '@tincho_dnd',
      avatar: 'https://i.pravatar.cc/150?u=martin',
      bio: 'Especialista en terror y atmósfera.',
      experienceYears: 3,
      campaignsFinished: 1,
      rating: 4.5,
      reviewCount: 15,
      badges: ['Verificado'],
      reviews: []
    },
    safetyInfo: {
      tools: ['Tarjeta X'],
      atmosphere: 'Gótica, terror psicológico',
      houseRules: ['Respetar la inmersión'],
      smokingPolicy: 'Patio disponible',
      petInfo: 'Dos perros amistosos',
      accessibility: 'Casa planta baja',
      snacksPolicy: 'Traer algo para tomar'
    },
    spacePhotos: [],
    coverImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'A la gorra / Traer algo para picar',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mesa-cthulhu-palermo-guillermo',
    title: 'El Horror en las Sombras',
    system: 'Call of Cthulhu',
    synopsis: 'Misterios sin resolver en los locos años 20. Una investigación de asesinato que llevará a los jugadores a dudar de su propia cordura.',
    setting: 'Misterio / Años 20',
    levelRequired: 'Nivel Medio',
    tags: ['Misterio', 'Investigación'],
    slotsTotal: 4,
    slotsTaken: 2,
    venueType: 'store',
    venueName: 'Café de los Tableros',
    addressApprox: 'Av. Santa Fe 3400',
    zone: 'Palermo',
    region: 'CABA',
    coordinates: { lat: -34.5878, lng: -58.4116 },
    schedule: {
      frequency: 'Mensual',
      dayOfWeek: 'Jueves',
      time: '19:00',
      durationHours: 4,
      nextSessionDate: '2026-09-17'
    },
    verifiedStatus: {
      isVerified: false,
      type: 'host_verified',
      badgeLabel: 'Pendiente',
      verifiedDate: '',
      dniValidated: false,
      addressValidated: false,
      safetyAudited: false
    },
    dm: {
      id: 'dm-004',
      name: 'Guillermo',
      handle: '@guille_cthulhu',
      avatar: 'https://i.pravatar.cc/150?u=guille',
      bio: 'Lector empedernido de H.P. Lovecraft.',
      experienceYears: 1,
      campaignsFinished: 0,
      rating: 0,
      reviewCount: 0,
      badges: [],
      reviews: []
    },
    safetyInfo: {
      tools: ['Tarjeta X'],
      atmosphere: 'Seria y misteriosa',
      houseRules: ['Cero tolerancia a faltas de respeto'],
      smokingPolicy: 'No se fuma',
      petInfo: 'Lugar libre de mascotas',
      accessibility: 'Baño para discapacitados',
      snacksPolicy: 'Cafetería en el lugar'
    },
    spacePhotos: [],
    coverImage: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'Gratis',
    createdAt: new Date().toISOString()
  }
];
