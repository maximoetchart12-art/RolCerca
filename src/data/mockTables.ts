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
  },
  {
    id: 'mesa-navarro-laguna-dnd5e',
    title: 'Misterios en la Laguna de Navarro',
    system: 'D&D 5e',
    synopsis: 'Una emocionante campaña de exploración y supervivencia donde una compañía de aventureros investiga extraños sucesos y ruinas anegadas en las orillas de una mística laguna.',
    setting: 'Fantasía Medieval & Supervivencia / Reinos Olvidados',
    levelRequired: 'Apto Principiantes',
    tags: ['Exploración', 'Rol Inmersivo', 'Principiantes'],
    slotsTotal: 5,
    slotsTaken: 2,
    venueType: 'store',
    venueName: 'Club Social & Lúdico Navarro',
    addressApprox: 'Calle 107 y Calle 24 (cerca de Plaza San Lorenzo y Laguna)',
    zone: 'Navarro',
    region: 'PBA Interior',
    coordinates: { lat: -34.9961, lng: -59.2778 },
    schedule: {
      frequency: 'Quincenal',
      dayOfWeek: 'Sábado',
      time: '16:30',
      durationHours: 4,
      nextSessionDate: '2026-09-12'
    },
    verifiedStatus: {
      isVerified: true,
      type: 'store_verified',
      badgeLabel: 'Club Lúdico Verificado',
      verifiedDate: '2026-04-15',
      dniValidated: true,
      addressValidated: true,
      safetyAudited: true
    },
    dm: {
      id: 'dm-005',
      name: 'Emiliano Rossi',
      handle: '@emi_navarro_dm',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'Master apasionado por la narrativa inmersiva y la creación de mundos. Bienvenidos tanto jugadores novatos como veteranos.',
      experienceYears: 4,
      campaignsFinished: 2,
      rating: 4.9,
      reviewCount: 18,
      badges: ['Master Verificado', 'Iniciación Amigable'],
      reviews: [
        {
          id: 'rev-navarro-1',
          authorName: 'Camila G.',
          authorAvatar: '',
          date: '2026-07-20',
          rating: 5,
          comment: 'Hermoso grupo y el master explica todo con una paciencia increíble.',
          campaignPlayed: 'D&D 5e - Campaña Laguna'
        }
      ]
    },
    safetyInfo: {
      tools: ['Tarjeta X', 'Líneas y Velos', 'Puerta Abierta', 'Sesión Cero'],
      atmosphere: 'Distendida, mateada y rol amigable',
      houseRules: ['Puntualidad y buena onda', 'Apto todo público'],
      smokingPolicy: 'Patio al aire libre disponible',
      petInfo: 'Sin mascotas en la sala de juego',
      accessibility: 'Planta baja con rampa de acceso',
      snacksPolicy: 'Traer mate y cosas para compartir'
    },
    spacePhotos: [
      { url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80', caption: 'Espacio de juego en Club Social Navarro', tag: 'Mesa Principal' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'Bono contribución $2000 (incluye sala)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mesa-lobos-cthulhu',
    title: 'La Sombra sobre Lobos: Años 1920',
    system: 'Call of Cthulhu',
    synopsis: 'Un grupo de investigadores llega a las casonas centenarias de la zona tras misteriosas desapariciones vinculadas a un eclipse de luna y extraños cultos campestres.',
    setting: 'Horror Cósmico & Misterio Rural / Años 20',
    levelRequired: 'Nivel Medio',
    tags: ['Misterio', 'Investigación', 'Horror Cósmico', 'Roleplay'],
    slotsTotal: 4,
    slotsTaken: 3,
    venueType: 'private_home',
    venueName: 'Casona de Juani (Anfitrión Verificado)',
    addressApprox: 'Calle 9 de Julio 350, Centro de Lobos',
    zone: 'Lobos',
    region: 'PBA Interior',
    coordinates: { lat: -35.1856, lng: -59.0964 },
    schedule: {
      frequency: 'Quincenal',
      dayOfWeek: 'Domingo',
      time: '17:00',
      durationHours: 4,
      nextSessionDate: '2026-09-13'
    },
    verifiedStatus: {
      isVerified: true,
      type: 'host_verified',
      badgeLabel: 'Anfitrión Verificado (+18)',
      verifiedDate: '2026-05-22',
      dniValidated: true,
      addressValidated: true,
      safetyAudited: true
    },
    dm: {
      id: 'dm-006',
      name: 'Juan Ignacio (Juani)',
      handle: '@juani_cthulhu_lobos',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'Guardián de los Arcanos desde hace 6 años. Gran ambientación con velas, efectos de sonido y pistas físicas en papel envejecido.',
      experienceYears: 6,
      campaignsFinished: 4,
      rating: 5.0,
      reviewCount: 23,
      badges: ['Master Verificado', 'Atmósfera Top'],
      reviews: [
        {
          id: 'rev-lobos-1',
          authorName: 'Gonzalo R.',
          authorAvatar: '',
          date: '2026-08-10',
          rating: 5,
          comment: 'La mejor ambientación de Call of Cthulhu de la provincia, te hace meter de lleno en la trama.',
          campaignPlayed: 'Call of Cthulhu - Sombras de la Pampa'
        }
      ]
    },
    safetyInfo: {
      tools: ['Tarjeta X', 'Líneas y Velos', 'Puerta Abierta'],
      atmosphere: 'Inmersiva, suspenso y música ambiental suave',
      houseRules: ['Respeto por el clima de terror', 'Mayor de 18 años'],
      smokingPolicy: 'Patio exterior disponible',
      petInfo: 'Un perro rescatado muy tranquilo en el patio',
      accessibility: 'Casa en planta baja',
      snacksPolicy: 'Cafetería y galletitas incluidas / A la canasta'
    },
    spacePhotos: [
      { url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80', caption: 'Sala de juego acondicionada en Lobos', tag: 'Sala de Juego' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'A la gorra / Aporte refrigerio ($1500)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mesa-mercedes-pathfinder',
    title: 'Crónicas de la Frontera Oeste',
    system: 'Pathfinder 2e',
    synopsis: 'Una épica campaña de alta fantasía y táctica. Los héroes han sido contratados por el Consejo Local para cartografiar y proteger antiguas ruinas subterráneas repletas de tesoros y trampas.',
    setting: 'Alta Fantasía & Combate Táctico / Golarion',
    levelRequired: 'Todos los niveles',
    tags: ['Combate Táctico', 'Mapas con Miniaturas', 'Fantasía Épica'],
    slotsTotal: 6,
    slotsTaken: 4,
    venueType: 'store',
    venueName: 'Espacio Lúdico & Comic Mercedes',
    addressApprox: 'Calle 25 e/ 20 y 22, Centro de Mercedes',
    zone: 'Mercedes',
    region: 'PBA Interior',
    coordinates: { lat: -34.6514, lng: -59.4308 },
    schedule: {
      frequency: 'Semanal',
      dayOfWeek: 'Viernes',
      time: '19:30',
      durationHours: 4,
      nextSessionDate: '2026-09-11'
    },
    verifiedStatus: {
      isVerified: true,
      type: 'store_verified',
      badgeLabel: 'Tienda Oficial',
      verifiedDate: '2026-02-18',
      dniValidated: true,
      addressValidated: true,
      safetyAudited: true
    },
    dm: {
      id: 'dm-007',
      name: 'Federico "Fede" Albornoz',
      handle: '@fede_pathfinder_mercedes',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'Fanático de Pathfinder 2e y las miniaturas pintadas a mano. Llevo más de 7 años dirigiendo partidas presenciales.',
      experienceYears: 7,
      campaignsFinished: 6,
      rating: 4.9,
      reviewCount: 31,
      badges: ['Master Veterano', 'Miniaturas & Grid 3D'],
      reviews: [
        {
          id: 'rev-mercedes-1',
          authorName: 'Matías L.',
          authorAvatar: '',
          date: '2026-07-28',
          rating: 5,
          comment: 'Los mapas con miniaturas y el ritmo de los combates son una locura. Muy recomendado.',
          campaignPlayed: 'Pathfinder 2e - Frontera Oeste'
        }
      ]
    },
    safetyInfo: {
      tools: ['Tarjeta X', 'Líneas y Velos', 'Protocolo de Puertas Abiertas'],
      atmosphere: 'Competitiva pero cooperativa, emocionante',
      houseRules: ['Puntualidad', 'Cuidar las miniaturas de la mesa'],
      smokingPolicy: 'No se fuma en el local comercial',
      petInfo: 'Local pet-friendly (con correa)',
      accessibility: 'Entrada sin escalones, salón amplio',
      snacksPolicy: 'Consumición libre en cafetería del local'
    },
    spacePhotos: [
      { url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80', caption: 'Mesa de juego con miniaturas y escenografía 3D en Mercedes', tag: 'Mesa Principal' }
    ],
    coverImage: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=800&auto=format&fit=crop',
    costPerSession: 'Consumición en cafetería / Entrada $2500',
    createdAt: new Date().toISOString()
  }
];
