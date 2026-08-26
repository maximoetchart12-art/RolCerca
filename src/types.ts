export type VenueType = 'store' | 'private_home' | 'club_public';

export type RPGSystem = 
  | 'D&D 5e'
  | 'D&D 2024'
  | 'Pathfinder 2e'
  | 'Call of Cthulhu'
  | 'Vampiro: La Mascarada'
  | 'Cyberpunk RED'
  | 'Sistemas Indie';

export type ExperienceLevel = 
  | 'Apto Principiantes'
  | 'Nivel Medio'
  | 'Veteranos'
  | 'Todos los niveles';

export type AgeCategory = 'ADULTO' | 'MENOR_JUVENIL' | 'BLOQUEADO_MENOR_13';

export type UserRole = 'guest' | 'minor' | 'adult_verified' | 'moderator' | 'admin';

export type AccountVerificationStatus = 'PENDIENTE_VERIFICACION' | 'VERIFICADO' | 'RECHAZADO' | 'NO_REGISTRADO';

export interface AppUser {
  id: string;
  name: string; // Nombre y Apellido
  handle: string; // Apodo de aventurero
  email: string;
  avatarUrl?: string;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  role: UserRole;
  birthDate: string; // YYYY-MM-DD
  age: number;
  ageCategory: AgeCategory;
  dni: string; // 7-8 digits
  tramiteNumber?: string; // Número de trámite DNI RENAPER
  phone?: string;
  dniFrontPhoto?: string;
  dniBackPhoto?: string;
  selfieValidationPhoto?: string;
  verificationStatus: AccountVerificationStatus;
  isVerified: boolean;
  rejectionReason?: string;
  registeredAt: string;
  verifiedAt?: string;
  address?: string;
  location?: { lat: number; lng: number } | null;
}

export function calculateAgeFromBirthDate(birthDateString: string): {
  age: number;
  category: AgeCategory;
  isValidDate: boolean;
} {
  if (!birthDateString) {
    return { age: 0, category: 'BLOQUEADO_MENOR_13', isValidDate: false };
  }
  const birth = new Date(birthDateString);
  if (isNaN(birth.getTime())) {
    return { age: 0, category: 'BLOQUEADO_MENOR_13', isValidDate: false };
  }
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  if (age < 0) {
    return { age: 0, category: 'BLOQUEADO_MENOR_13', isValidDate: false };
  }

  if (age < 13) {
    return { age, category: 'BLOQUEADO_MENOR_13', isValidDate: true };
  } else if (age < 18) {
    return { age, category: 'MENOR_JUVENIL', isValidDate: true };
  } else {
    return { age, category: 'ADULTO', isValidDate: true };
  }
}

export interface GMReview {
  id: string;
  authorName: string;
  authorAvatar: string;
  date: string;
  rating: number;
  comment: string;
  campaignPlayed: string;
}

export type DMReview = GMReview;

export interface GMProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  experienceYears: number;
  campaignsFinished: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  gmStyle?: string[];
  dmStyle?: string[];
  reviews: GMReview[];
}

export type DMProfile = GMProfile;

export interface SpacePhoto {
  url: string;
  caption: string;
  tag: string;
}

export interface TableSafetyInfo {
  tools: string[];
  atmosphere: string;
  houseRules: string[];
  smokingPolicy: string;
  petInfo: string;
  accessibility: string;
  snacksPolicy: string;
}

export interface TableSchedule {
  frequency: 'Semanal' | 'Quincenal' | 'Mensual' | 'One-shot';
  dayOfWeek: string;
  time: string;
  durationHours: number;
  nextSessionDate: string;
}

export interface VerifiedStatus {
  isVerified: boolean;
  type: 'store_verified' | 'host_verified';
  badgeLabel: string;
  verifiedDate: string;
  dniValidated: boolean;
  addressValidated: boolean;
  safetyAudited: boolean;
}

export interface TableSession {
  id: string;
  title: string;
  system: RPGSystem;
  synopsis: string;
  setting: string;
  levelRequired: ExperienceLevel;
  tags: string[];
  slotsTotal: number;
  slotsTaken: number;
  venueType: VenueType;
  venueName: string;
  addressApprox: string;
  zone: string;
  region: 'CABA' | 'GBA Norte' | 'GBA Oeste' | 'GBA Sur' | 'PBA Interior';
  coordinates: {
    lat: number;
    lng: number;
  };
  distanceKm?: number;
  schedule: TableSchedule;
  verifiedStatus: VerifiedStatus;
  dm: DMProfile;
  safetyInfo: TableSafetyInfo;
  spacePhotos: SpacePhoto[];
  coverImage: string;
  costPerSession: string;
  createdAt: string;
}

export interface FilterState {
  searchQuery: string;
  region: string;
  maxDistanceKm: number | null;
  venueType: string;
  system: string;
  experienceLevel: string;
  availableOnly: boolean;
  dayType: string;
}

export interface JoinApplication {
  id: string;
  tableId: string;
  playerName: string;
  playerEmail: string;
  playerPhone: string;
  characterConcept: string;
  preferredRole: string;
  experienceLevel: string;
  safetyAcceptance: boolean;
  messageToGM: string;
  messageToDM?: string;
  appliedAt: string;
  status: 'pending' | 'accepted' | 'declined';
}

export type ProfileVerificationStatus = 'unsubmitted' | 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  name: string;
  handle: string;
  email?: string;
  isEmailVerified?: boolean;
  emailVerifiedAt?: string;
  bio: string;
  playerBio?: string;
  gmBio?: string;
  roleType?: 'player' | 'gm' | 'both';
  favoriteSystems?: string[];
  playerExperience?: 'Principiante' | 'Intermedio' | 'Veterano';
  gmExperienceYears?: number;
  gmStyle?: string[];
  dni: string;
  tramiteNumber?: string;
  birthDate?: string;
  age?: number;
  ageCategory?: AgeCategory;
  phone: string;
  dniPhotoUploaded: boolean;
  dniFrontPhoto?: string;
  dniBackPhoto?: string;
  selfieValidationPhoto?: string;
  address: string;
  location: { lat: number; lng: number } | null;
  photos: string[];
  isVerified: boolean;
  isGMVerified?: boolean;
  verificationStatus: ProfileVerificationStatus;
  gmVerificationStatus?: ProfileVerificationStatus;
  rejectionReason?: string;
  submittedAt?: string;
  verifiedDate?: string;
  updatedAt?: string;
}

export interface GMVerificationRequest {
  id: string;
  name: string;
  handle: string;
  email?: string;
  isEmailVerified?: boolean;
  bio: string;
  gmBio?: string;
  experienceYears?: number;
  gmStyle?: string[];
  favoriteSystems?: string[];
  dni: string;
  tramiteNumber?: string;
  birthDate?: string;
  age?: number;
  ageCategory?: AgeCategory;
  phone: string;
  address: string;
  location: { lat: number; lng: number } | null;
  dniFrontPhoto?: string;
  dniBackPhoto?: string;
  selfieValidationPhoto?: string;
  photos: string[];
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  rejectionReason?: string;
  reviewedBy?: string;
}

export type DMVerificationRequest = GMVerificationRequest;

export function checkUserProfileVerification(profile: Partial<UserProfile> | null | undefined): {
  isComplete: boolean;
  missingSteps: string[];
} {
  if (!profile) {
    return {
      isComplete: false,
      missingSteps: [
        'Completar Nombre y Usuario en Datos Personales',
        'Ingresar DNI y Teléfono Móvil',
        'Subir foto de validación de DNI',
        'Definir ubicación o barrio de referencia en el mapa'
      ],
    };
  }

  const missing: string[] = [];

  if (!profile.name?.trim() || !profile.handle?.trim()) {
    missing.push('Completar Nombre y Usuario en Datos Personales');
  }

  if (!profile.dni?.trim() || !profile.phone?.trim()) {
    missing.push('Ingresar DNI y Teléfono Móvil');
  }

  if (!profile.dniPhotoUploaded) {
    missing.push('Subir foto de comprobante de identidad (DNI)');
  }

  if (!profile.address?.trim() || !profile.location) {
    missing.push('Seleccionar Ubicación de referencia en el mapa');
  }

  return {
    isComplete: missing.length === 0,
    missingSteps: missing,
  };
}

