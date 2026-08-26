import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Camera, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Upload,
  Dice5,
  Sparkles,
  ArrowRight,
  Info,
  Check,
  FileCheck,
  Clock,
  XCircle,
  Send,
  Crown,
  BookOpen,
  Heart,
  Swords,
  Compass,
  Phone,
  CreditCard,
  PlusCircle,
  Lock,
  Mail,
  AlertTriangle,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { 
  TableSession, 
  UserProfile, 
  ProfileVerificationStatus, 
  checkUserProfileVerification, 
  GMVerificationRequest 
} from '../types';
import { OpenStreetMapAutocomplete } from './OpenStreetMapAutocomplete';
import { LeafletMap } from './LeafletMap';
import { EmailVerificationModal } from './EmailVerificationModal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: TableSession[];
  onUpdateTable?: (updatedTable: TableSession) => void;
  onDeleteTable?: (tableId: string) => void;
  onEditTable?: (table: TableSession) => void;
  onProfileSaved?: (profile: UserProfile) => void;
  publishAttemptBlockedNotice?: boolean;
  onProceedToPublish?: () => void;
}

const COMMON_SYSTEMS = [
  'D&D 5e',
  'Pathfinder 2e',
  'Call of Cthulhu',
  'Cyberpunk RED',
  'Vampiro: La Mascarada',
  'Star Wars RPG',
  'Tormenta 20',
  'Sistemas Indie / OSR',
  'FATE Core / Ligero'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  isOpen, 
  onClose, 
  tables, 
  onUpdateTable, 
  onDeleteTable, 
  onEditTable,
  onProfileSaved,
  publishAttemptBlockedNotice = false,
  onProceedToPublish
}) => {
  // Main Navigation Tabs
  const [activeTab, setActiveTab] = useState<'player' | 'gm' | 'tables'>(
    publishAttemptBlockedNotice ? 'gm' : 'player'
  );
  
  // Basic & Player Profile State
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [playerBio, setPlayerBio] = useState('');
  const [playerExperience, setPlayerExperience] = useState<'Principiante' | 'Intermedio' | 'Veterano'>('Intermedio');
  const [preferredRole, setPreferredRole] = useState('Roleplay e Inmersión');
  const [favoriteSystems, setFavoriteSystems] = useState<string[]>(['D&D 5e']);
  const [roleType, setRoleType] = useState<'player' | 'gm' | 'both'>('player');

  // GM Verification State
  const [gmBio, setGmBio] = useState('');
  const [gmExperienceYears, setGmExperienceYears] = useState<number>(3);
  const [gmStyle, setGmStyle] = useState<string>('Narración colaborativa y seguridad en mesa');
  const [dni, setDni] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  
  // Verification Submission Status
  const [dniPhotoUploaded, setDniPhotoUploaded] = useState(false);
  const [dniFrontFileName, setDniFrontFileName] = useState<string>('');
  const [dniBackFileName, setDniBackFileName] = useState<string>('');
  const [dniFrontPhotoUrl, setDniFrontPhotoUrl] = useState<string>('');
  const [dniBackPhotoUrl, setDniBackPhotoUrl] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<ProfileVerificationStatus>('unsubmitted');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [hasSaved, setHasSaved] = useState(false);
  const [gmValidationErrors, setGmValidationErrors] = useState<string[]>([]);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);
  const [deletingTableId, setDeletingTableId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (publishAttemptBlockedNotice) {
        setActiveTab('gm');
      }

      // Load saved profile data
      try {
        let loaded = false;
        const saved = localStorage.getItem('mesasrol_user_profile');
        if (saved) {
          const data: Partial<UserProfile> = JSON.parse(saved);
          setName(data.name || '');
          setHandle(data.handle || '');
          setEmail(data.email || '');
          setIsEmailVerified(data.isEmailVerified !== undefined ? data.isEmailVerified : true);
          setPlayerBio(data.playerBio || data.bio || '');
          setGmBio(data.gmBio || data.bio || '');
          setRoleType(data.roleType || (data.verificationStatus === 'approved' ? 'both' : 'player'));
          setDni(data.dni || '');
          setPhone(data.phone || '');
          setPhotos(data.photos || []);
          setLocation(data.location || null);
          setAddress(data.address || '');
          setDniPhotoUploaded(data.dniPhotoUploaded || false);
          setDniFrontPhotoUrl(data.dniFrontPhoto || '');
          setDniBackPhotoUrl(data.dniBackPhoto || '');
          if (data.favoriteSystems && data.favoriteSystems.length > 0) {
            setFavoriteSystems(data.favoriteSystems);
          }
          if (data.dniPhotoUploaded) {
            setDniFrontFileName('DNI_Frente_Validado.jpg');
            setDniBackFileName('DNI_Dorso_Validado.jpg');
          }
          
          setVerificationStatus(data.verificationStatus || (data.isVerified ? 'approved' : 'unsubmitted'));
          setRejectionReason(data.rejectionReason || '');
          loaded = true;
        }

        // Also check if current user is logged in in v2 session
        const userSaved = localStorage.getItem('rolcerca_current_user_v2');
        if (userSaved) {
          const u = JSON.parse(userSaved);
          if (!loaded || !name) {
            setName(u.name || '');
            setHandle(u.handle || '');
            setEmail(u.email || '');
            setIsEmailVerified(u.isEmailVerified !== undefined ? u.isEmailVerified : true);
            setDni(u.dni || '');
            setPhone(u.phone || '');
            setAddress(u.address || '');
            setLocation(u.location || null);
            if (u.dniFrontPhoto) {
              setDniFrontPhotoUrl(u.dniFrontPhoto);
              setDniPhotoUploaded(true);
              setDniFrontFileName('DNI_Frente.jpg');
            }
          }
        }
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }
  }, [isOpen, publishAttemptBlockedNotice]);

  if (!isOpen) return null;

  const toggleFavoriteSystem = (sys: string) => {
    if (favoriteSystems.includes(sys)) {
      if (favoriteSystems.length > 1) {
        setFavoriteSystems(favoriteSystems.filter(s => s !== sys));
      }
    } else {
      setFavoriteSystems([...favoriteSystems, sys]);
    }
  };

  // Save Player Profile Changes (instant, no admin audit required)
  const handleSavePlayerProfile = () => {
    if (!name.trim()) return;

    const formattedHandle = handle.startsWith('@') ? handle : `@${handle.replace(/\s+/g, '_').toLowerCase() || name.toLowerCase().replace(/\s+/g, '_')}`;

    const profileData: UserProfile = {
      name: name.trim(),
      handle: formattedHandle,
      email: email.trim(),
      isEmailVerified,
      bio: playerBio.trim(),
      playerBio: playerBio.trim(),
      gmBio: gmBio.trim(),
      favoriteSystems,
      roleType,
      dni: dni.trim(),
      phone: phone.trim(),
      address: address.trim(),
      location,
      photos,
      dniPhotoUploaded,
      dniFrontPhoto: dniFrontPhotoUrl,
      dniBackPhoto: dniBackPhotoUrl,
      isVerified: verificationStatus === 'approved',
      verificationStatus,
      rejectionReason,
      gmVerificationStatus: verificationStatus,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('mesasrol_user_profile', JSON.stringify(profileData));

    // Update logged in user state too
    const userSaved = localStorage.getItem('rolcerca_current_user_v2');
    if (userSaved) {
      try {
        const u = JSON.parse(userSaved);
        const updatedUser = {
          ...u,
          name: profileData.name,
          handle: profileData.handle,
          email: profileData.email || u.email,
          isEmailVerified,
        };
        localStorage.setItem('rolcerca_current_user_v2', JSON.stringify(updatedUser));
      } catch {
        // ignore
      }
    }

    if (onProfileSaved) {
      onProfileSaved(profileData);
    }

    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  // Submit GM Verification Request to Admin
  const handleSubmitGMVerification = () => {
    const errors: string[] = [];
    if (!name.trim()) errors.push('Tu nombre o apodo de rol es obligatorio.');
    if (!dni.trim() || dni.length < 7) errors.push('El DNI debe tener al menos 7 u 8 dígitos.');
    if (!phone.trim() || phone.length < 8) errors.push('Ingresá un teléfono móvil o WhatsApp válido para coordinación.');
    if (!address.trim()) errors.push('Ingresá tu barrio o zona de referencia en el mapa.');
    if (!dniPhotoUploaded) errors.push('Adjuntá las fotos de tu DNI (Frente y Dorso) para la auditoría.');

    if (errors.length > 0) {
      setGmValidationErrors(errors);
      return;
    }

    setGmValidationErrors([]);
    const formattedHandle = handle.startsWith('@') ? handle : `@${handle.replace(/\s+/g, '_').toLowerCase() || name.toLowerCase().replace(/\s+/g, '_')}`;

    const newStatus: ProfileVerificationStatus = 'pending';
    setVerificationStatus(newStatus);
    setRoleType('both');

    const profileData: UserProfile = {
      name: name.trim(),
      handle: formattedHandle,
      email: email.trim(),
      bio: gmBio.trim() || playerBio.trim(),
      playerBio: playerBio.trim(),
      gmBio: gmBio.trim(),
      favoriteSystems,
      roleType: 'both',
      dni: dni.trim(),
      phone: phone.trim(),
      address: address.trim(),
      location,
      photos,
      dniPhotoUploaded: true,
      dniFrontPhoto: dniFrontPhotoUrl || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      dniBackPhoto: dniBackPhotoUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80',
      isVerified: false,
      verificationStatus: 'pending',
      gmVerificationStatus: 'pending',
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('mesasrol_user_profile', JSON.stringify(profileData));

    // Save request to Admin Queue
    const adminReq: GMVerificationRequest = {
      id: 'req-' + Date.now(),
      name: profileData.name,
      handle: profileData.handle,
      dni: profileData.dni,
      phone: profileData.phone,
      address: profileData.address,
      email: profileData.email || 'aventurero@rolcerca.com',
      bio: profileData.gmBio || 'Nuevo postulante a GM en RolCerca',
      location: profileData.location,
      dniFrontPhoto: profileData.dniFrontPhoto,
      dniBackPhoto: profileData.dniBackPhoto,
      photos: profileData.photos,
      status: 'pending',
      submittedAt: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    try {
      const existingReqsRaw = localStorage.getItem('rolcerca_admin_verification_requests');
      const reqList: GMVerificationRequest[] = existingReqsRaw ? JSON.parse(existingReqsRaw) : [];
      const updatedList = [adminReq, ...reqList.filter(r => r.dni !== profileData.dni && r.handle !== profileData.handle)];
      localStorage.setItem('rolcerca_admin_verification_requests', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Error saving admin verification request:', e);
    }

    if (onProfileSaved) {
      onProfileSaved(profileData);
    }

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  const isGMVerified = verificationStatus === 'approved';
  const isGMPending = verificationStatus === 'pending';
  const isGMRejected = verificationStatus === 'rejected';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="user-profile-modal"
        className="relative w-full max-w-3xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F0F11] via-[#161618] to-[#800020]/25 border-b border-[#2A2A2E] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#800020] to-[#991b1b] border border-[#991b1b] flex items-center justify-center text-rose-200 shadow-md">
              {isGMVerified ? <Crown className="w-5 h-5 text-amber-300" /> : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fantasy text-lg font-bold text-[#f8fafc]">
                  Mi Perfil de Aventurero
                </h3>
                {isGMVerified ? (
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-300" /> GM Verificado
                  </span>
                ) : isGMPending ? (
                  <span className="bg-amber-950 text-amber-300 border border-amber-600/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Clock className="w-3 h-3" /> GM en Revisión
                  </span>
                ) : (
                  <span className="bg-[#242429] text-[#cbd5e1] border border-[#3F3F46] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <User className="w-3 h-3 text-rose-400" /> Jugador
                  </span>
                )}
              </div>
              <p className="text-xs text-[#94a3b8]">
                {isGMVerified 
                  ? 'Podés sumarte a mesas y crear convocatorias presenciales' 
                  : 'Configurá tus preferencias de jugador o habilitate para dirigir mesas como GM'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-profile-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F0F11]/80 hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice if user was redirected because they clicked "Publicar Mesa" without being GM */}
        {publishAttemptBlockedNotice && !isGMVerified && (
          <div className="bg-amber-950/40 border-b border-amber-700/50 px-4 py-2.5 flex items-center gap-2.5 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Paso previo para publicar:</strong> Para dirigir y publicar mesas presenciales en RolCerca, primero debés completar tu solicitud de <strong>Habilitación como GM</strong> para auditoría de seguridad.
            </span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-[#2A2A2E] bg-[#0F0F11] px-4 overflow-x-auto gap-1">
          <button
            id="tab-btn-player-profile"
            onClick={() => setActiveTab('player')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'player'
                ? 'border-[#800020] text-rose-400'
                : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Mi Ficha de Jugador</span>
          </button>

          <button
            id="tab-btn-gm-verification"
            onClick={() => setActiveTab('gm')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'gm'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>2. Habilitación como GM / Anfitrión</span>
            {isGMVerified && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
            {isGMPending && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>

          <button
            id="tab-btn-my-tables"
            onClick={() => setActiveTab('tables')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'tables'
                ? 'border-rose-500 text-rose-300'
                : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            <Dice5 className="w-4 h-4" />
            <span>3. Mis Mesas Dirigidas ({tables.filter(t => t.dm.name === name || t.dm.handle === handle).length})</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* TAB 1: PLAYER PROFILE */}
          {activeTab === 'player' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-fantasy text-[#f8fafc] font-bold text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-rose-400" />
                    Datos de tu Ficha de Jugador
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Esta información es visible para los GMs cuando te postulás a una mesa de rol presencial.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E]">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Nombre o Apodo de Aventurero *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Lucas 'Thorin'"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Usuario (@handle)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. @lucas_rol"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-[#cbd5e1]">
                      Correo Electrónico de Contacto
                    </label>
                    {isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3" /> Email Verificado
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsEmailModalOpen(true)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/60 hover:bg-amber-900/70 px-2 py-0.5 rounded-full border border-amber-500/50 cursor-pointer transition-colors"
                      >
                        <AlertTriangle className="w-3 h-3 text-amber-400" /> Verificar Ahora
                      </button>
                    )}
                  </div>
                  <input
                    type="email"
                    placeholder="aventurero@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Nivel de Experiencia como Jugador
                  </label>
                  <select
                    value={playerExperience}
                    onChange={(e) => setPlayerExperience(e.target.value as any)}
                    className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                  >
                    <option value="Principiante">Principiante (Buscando mis primeras mesas)</option>
                    <option value="Intermedio">Intermedio (Jugué varias partidas / campañas)</option>
                    <option value="Veterano">Veterano (Años en el hobby)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Estilo de Juego Preferido
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: '🎭 Roleplay & Drama', val: 'Roleplay e Inmersión' },
                      { label: '⚔️ Combate Táctico', val: 'Combate y Estrategia' },
                      { label: '🗺️ Exploración / Mazmorreo', val: 'Exploración y Mazmorreo' },
                      { label: '🎲 Narrativo Ligero', val: 'Narrativo Relajado' }
                    ].map((style) => (
                      <button
                        key={style.val}
                        type="button"
                        onClick={() => setPreferredRole(style.val)}
                        className={`p-2 rounded-lg border text-xs font-semibold text-center transition-all cursor-pointer ${
                          preferredRole === style.val
                            ? 'bg-[#800020]/40 text-rose-200 border-[#991b1b]'
                            : 'bg-[#161618] text-[#94a3b8] border-[#2A2A2E] hover:text-[#f1f5f9]'
                        }`}
                      >
                        {style.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5">
                    Sistemas de Rol que te interesan
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {COMMON_SYSTEMS.map((sys) => {
                      const isSelected = favoriteSystems.includes(sys);
                      return (
                        <button
                          key={sys}
                          type="button"
                          onClick={() => toggleFavoriteSystem(sys)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-rose-950/80 text-rose-200 border-rose-700/80 shadow-sm'
                              : 'bg-[#161618] text-[#71717a] border-[#2A2A2E] hover:text-[#cbd5e1]'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '} {sys}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                    Bio de Jugador / Qué buscás en una mesa
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Contale a la comunidad sobre tus personajes favoritos, disponibilidad horaria o qué tipo de historias te divierten jugar..."
                    value={playerBio}
                    onChange={(e) => setPlayerBio(e.target.value)}
                    className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                  />
                </div>
              </div>

              {/* Save Player Profile Button */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-[#94a3b8]">
                  Como jugador podés sumarte a cualquier mesa disponible en la plataforma.
                </div>
                <button
                  type="button"
                  onClick={handleSavePlayerProfile}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white text-xs font-bold shadow transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {hasSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>¡Ficha Guardada!</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Guardar Ficha de Jugador</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: GM VERIFICATION / HABILITATION */}
          {activeTab === 'gm' && (
            <div className="space-y-5 animate-in fade-in">
              
              {/* GM Status Banner */}
              {isGMVerified ? (
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/60 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300 shrink-0">
                    <Crown className="w-5 h-5 text-amber-300" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-fantasy text-sm font-bold text-emerald-200">
                      ¡Sos Game Master Verificado en RolCerca!
                    </h4>
                    <p className="text-xs text-emerald-300/90 mt-0.5">
                      Tu identidad y zona de juego fueron auditadas por la administración. Podés publicar y gestionar mesas presenciales sin restricciones.
                    </p>
                    {onProceedToPublish && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onProceedToPublish();
                        }}
                        className="mt-3 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer transition-all"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Publicar Nueva Mesa de Rol</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : isGMPending ? (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-700/60 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-900/60 border border-amber-500/50 flex items-center justify-center text-amber-300 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-fantasy text-sm font-bold text-amber-200">
                      Solicitud de GM en Proceso de Auditoría
                    </h4>
                    <p className="text-xs text-amber-300/90 mt-0.5">
                      Tus comprobantes de DNI y ubicación de referencia están siendo revisados por el equipo de moderación. Recibirás respuesta a la brevedad.
                    </p>
                  </div>
                </div>
              ) : isGMRejected ? (
                <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-900/60 border border-rose-500/50 flex items-center justify-center text-rose-300 shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-fantasy text-sm font-bold text-rose-200">
                      Observaciones en tu Solicitud de GM
                    </h4>
                    <p className="text-xs text-rose-300/90 mt-0.5">
                      {rejectionReason || 'La foto del documento no era legible o los datos ingresados no coincidieron. Podés corregirlos y reenviar.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-700/50 flex items-center justify-center text-amber-300 shrink-0">
                    <Crown className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-fantasy text-sm font-bold text-[#f8fafc]">
                      ¿Querés convocar y narrar tus propias partidas presenciales?
                    </h4>
                    <p className="text-xs text-[#94a3b8] mt-0.5 leading-relaxed">
                      Para garantizar la seguridad y confianza de todos los jugadores que asisten a mesas en casas particulares o clubes, los <strong>Game Masters (GM)</strong> deben validar su identidad con DNI, teléfono y zona de juego.
                    </p>
                  </div>
                </div>
              )}

              {/* Validation errors alert if any */}
              {gmValidationErrors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/80 text-xs text-rose-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-rose-300">
                    <AlertCircle className="w-4 h-4" /> Por favor completá los siguientes requisitos:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-300/90">
                    {gmValidationErrors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* GM Form */}
              <div className="space-y-4">
                {/* Step A: Identity & Contact for Safety */}
                <div className="bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E] space-y-3">
                  <h5 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>A. Validación de Identidad del Anfitrión</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                        DNI Argentino (Legal) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. 38123456"
                        value={dni}
                        onChange={(e) => setDni(e.target.value.replace(/[^\d]/g, ''))}
                        className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-amber-500 focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm font-mono"
                      />
                      <p className="text-[11px] text-[#71717a] mt-1">Uso estrictamente confidencial para auditoría interna.</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                        Teléfono Móvil / WhatsApp de Contacto <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="Ej. +54 9 11 4455-6677"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-amber-500 focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm font-mono"
                      />
                      <p className="text-[11px] text-[#71717a] mt-1">Para coordinación y validación con la administración.</p>
                    </div>

                    {/* DNI File Upload */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 flex items-center justify-between">
                        <span>Fotos de DNI (Frente y Dorso) <span className="text-rose-400">*</span></span>
                        {dniPhotoUploaded && (
                          <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" /> Comprobantes listos
                          </span>
                        )}
                      </label>

                      <label className={`w-full border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group ${
                        dniPhotoUploaded 
                          ? 'border-emerald-700/60 bg-emerald-950/20' 
                          : 'border-[#2A2A2E] bg-[#161618] hover:bg-[#1a1a20] hover:border-amber-600'
                      }`}>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple
                          onChange={(e) => {
                            const fileList = e.target.files;
                            if (fileList && fileList.length > 0) {
                              setDniPhotoUploaded(true);
                              setDniFrontFileName(fileList[0]?.name || 'DNI_Frente.jpg');
                              setDniBackFileName(fileList[1]?.name || 'DNI_Dorso.jpg');
                              
                              const url0 = URL.createObjectURL(fileList[0]);
                              setDniFrontPhotoUrl(url0);
                              if (fileList[1]) {
                                const url1 = URL.createObjectURL(fileList[1]);
                                setDniBackPhotoUrl(url1);
                              } else {
                                setDniBackPhotoUrl(url0);
                              }
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />

                        {dniPhotoUploaded ? (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-emerald-900/50 border border-emerald-700 flex items-center justify-center text-emerald-400 mb-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-emerald-300 font-bold">Comprobantes de DNI cargados</span>
                            <span className="text-[11px] text-[#94a3b8] mt-0.5">
                              {dniFrontFileName} {dniBackFileName && `• ${dniBackFileName}`}
                            </span>
                            <span className="text-[10px] text-emerald-400/80 mt-1 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900">
                              Tocar para cambiar imágenes
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <div className="w-8 h-8 rounded-full bg-[#0F0F11] border border-[#2A2A2E] flex items-center justify-center text-[#71717a] group-hover:text-amber-400 group-hover:border-amber-700 transition-colors mb-1.5">
                              <Camera className="w-4 h-4" />
                            </div>
                            <span className="text-xs text-[#cbd5e1] font-semibold group-hover:text-amber-300 transition-colors">
                              Subir fotos de frente y dorso de tu DNI
                            </span>
                            <span className="text-[11px] text-[#71717a] mt-0.5">
                              Formatos JPG o PNG (Serán auditados por el Administrador)
                            </span>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                </div>

                {/* Step B: GM Profile & Narrative Style */}
                <div className="bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E] space-y-3">
                  <h5 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-2">
                    <BookOpen className="w-4 h-4 text-rose-400" />
                    <span>B. Estilo Narrativo y Experiencia de GM</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                        Años Narrando / Mastereando
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={gmExperienceYears}
                        onChange={(e) => setGmExperienceYears(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-amber-500 focus:outline-none text-xs sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                        Enfoque Narrativo Principal
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Sandbox libre, Roleplay inmersivo, Reglas claras"
                        value={gmStyle}
                        onChange={(e) => setGmStyle(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-amber-500 focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                        Presentación de GM para tus Mesas
                      </label>
                      <textarea
                        rows={3}
                        placeholder="Contale a los aventureros cómo son tus sesiones, qué herramientas de seguridad utilizás (Tarjeta X, Líneas y Velos) y cómo ambientás la mesa..."
                        value={gmBio}
                        onChange={(e) => setGmBio(e.target.value)}
                        className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-amber-500 focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Step C: Location on Map */}
                <div className="bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E] space-y-3">
                  <h5 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span>C. Zona de Referencia en el Mapa de RolCerca</span>
                  </h5>

                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                      Barrio / Zona / Ciudad <span className="text-rose-400">*</span>
                    </label>
                    <OpenStreetMapAutocomplete 
                      defaultValue={address} 
                      onPlaceSelect={(newAddress, lat, lng) => {
                        setAddress(newAddress);
                        setLocation({ lat, lng });
                      }}
                    />
                    <p className="text-[11px] text-[#71717a] mt-1">
                      Ej: "Caballito, CABA", "Palermo", "Quilmes", "La Plata". Tus mesas aparecerán en esta zona geográfica.
                    </p>
                  </div>
                  
                  <div className="w-full h-48 rounded-xl border border-[#2A2A2E] overflow-hidden bg-[#161618] relative z-0">
                    <LeafletMap 
                      location={location} 
                      onLocationSelect={(lat, lng) => {
                        setLocation({ lat, lng });
                        if (!address) {
                          setAddress(`Ubicación fijada (${lat.toFixed(3)}, ${lng.toFixed(3)})`);
                        }
                      }}
                    />
                  </div>

                  {location && (
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-950/40 p-2 rounded-lg border border-emerald-900/50">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Coordenadas fijadas: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit to Admin Button */}
              <div className="flex items-center justify-between pt-2 border-t border-[#2A2A2E]">
                <div className="text-xs text-[#94a3b8]">
                  {isGMVerified 
                    ? 'Tus datos de GM están auditados y aprobados.' 
                    : 'La solicitud será auditada por el panel de administración.'}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitGMVerification}
                  className={`px-5 py-2.5 rounded-lg text-white text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                    isGMVerified
                      ? 'bg-emerald-600 hover:bg-emerald-500 border border-emerald-500'
                      : 'bg-gradient-to-r from-amber-600 via-amber-700 to-[#800020] hover:from-amber-500 hover:to-[#991b1b] border border-amber-500/50'
                  }`}
                >
                  {hasSaved ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Solicitud Enviada a Moderación!</span>
                    </>
                  ) : isGMVerified ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Actualizar Datos de GM</span>
                    </>
                  ) : isGMPending ? (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Actualizar y Reenviar Solicitud</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de GM a Revisión</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MY HOSTED TABLES */}
          {activeTab === 'tables' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-fantasy text-[#f8fafc] font-bold text-base flex items-center gap-2">
                    <Dice5 className="w-4 h-4 text-rose-400" />
                    Mis Mesas Presenciales Dirigidas
                  </h4>
                  <p className="text-xs text-[#94a3b8] mt-0.5">
                    Administrá las partidas donde sos el Game Master / Anfitrión.
                  </p>
                </div>

                {isGMVerified && onProceedToPublish && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceedToPublish();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white text-xs font-semibold shadow flex items-center gap-1.5 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Nueva Mesa</span>
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-3">
                {tables.filter(t => t.dm.name === name || t.dm.handle === handle).length > 0 ? (
                  tables.filter(t => t.dm.name === name || t.dm.handle === handle).map(table => (
                    <div key={table.id} className="p-3.5 sm:p-4 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] flex flex-col sm:flex-row gap-3 sm:items-center justify-between transition-all duration-300">
                      {deletingTableId === table.id ? (
                        <div className="w-full flex items-center justify-center gap-2 text-rose-400 py-3 animate-in fade-in zoom-in duration-300">
                          <Trash2 className="w-5 h-5 animate-bounce" />
                          <span className="font-semibold text-sm">Mesa eliminada</span>
                        </div>
                      ) : tableToDelete === table.id ? (
                        <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
                          <div>
                            <h5 className="font-bold text-rose-400 text-sm flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> ¿Eliminar esta mesa?</h5>
                            <p className="text-xs text-[#94a3b8] mt-1">Esta acción no se puede deshacer.</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => setTableToDelete(null)}
                              className="px-3 py-1.5 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] hover:text-white text-xs font-semibold border border-[#2A2A2E] transition-colors w-full sm:w-auto text-center cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeletingTableId(table.id);
                                setTimeout(() => {
                                  onDeleteTable?.(table.id);
                                  setDeletingTableId(null);
                                  setTableToDelete(null);
                                }, 1200);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors w-full sm:w-auto text-center cursor-pointer shadow-md"
                            >
                              Sí, eliminar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <h5 className="font-bold text-[#f1f5f9] text-sm">{table.title}</h5>
                            <p className="text-xs text-[#94a3b8] mt-1">{table.system} • {table.slotsTotal - table.slotsTaken} lugares disponibles • {table.zone}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onEditTable?.(table)}
                              className="px-3 py-1.5 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] hover:text-white text-xs font-semibold border border-[#2A2A2E] transition-colors w-full sm:w-auto text-center cursor-pointer"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => setTableToDelete(table.id)}
                              className="px-3 py-1.5 rounded-lg bg-rose-950/30 hover:bg-rose-900/50 text-rose-400 hover:text-rose-300 text-xs font-semibold border border-rose-900/50 transition-colors w-full sm:w-auto text-center cursor-pointer"
                            >
                              Eliminar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-[#0F0F11] border border-[#2A2A2E] rounded-xl space-y-3">
                    <Dice5 className="w-10 h-10 mx-auto text-[#2A2A2E]" />
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#cbd5e1]">No tenés ninguna mesa publicada todavía.</p>
                      <p className="text-[11px] text-[#71717a] max-w-sm mx-auto">
                        {!isGMVerified 
                          ? 'Completá tu Habilitación como GM en la pestaña anterior para poder crear tus convocatorias.'
                          : '¡Ya estás habilitado! Hacé clic en Publicar Mesa para crear tu primera convocatoria.'}
                      </p>
                    </div>

                    {!isGMVerified ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('gm')}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Ir a Habilitación de GM</span>
                      </button>
                    ) : onProceedToPublish ? (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onProceedToPublish();
                        }}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white text-xs font-bold shadow inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Publicar Mi Primera Mesa</span>
                      </button>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#2A2A2E] bg-[#0F0F11] flex items-center justify-between shrink-0 rounded-b-2xl">
          <div className="text-xs text-[#94a3b8] flex items-center gap-1.5">
            {isGMVerified ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Cuenta de GM Verificada
              </span>
            ) : isGMPending ? (
              <span className="text-amber-400 font-semibold flex items-center gap-1">
                <Clock className="w-4 h-4" /> Solicitud de GM en espera de revisión
              </span>
            ) : (
              <span className="text-[#94a3b8] flex items-center gap-1">
                <User className="w-4 h-4 text-rose-400" /> Perfil de Jugador Activo
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] text-xs font-semibold border border-[#2A2A2E] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        userEmail={email || 'aventurero@ejemplo.com'}
        userName={name || 'Aventurero'}
        onVerificationSuccess={() => {
          setIsEmailVerified(true);
          // Persist updated verification in storage
          try {
            const saved = localStorage.getItem('mesasrol_user_profile');
            if (saved) {
              const parsed = JSON.parse(saved);
              parsed.isEmailVerified = true;
              parsed.emailVerifiedAt = new Date().toISOString();
              localStorage.setItem('mesasrol_user_profile', JSON.stringify(parsed));
            }
            const userSaved = localStorage.getItem('rolcerca_current_user_v2');
            if (userSaved) {
              const u = JSON.parse(userSaved);
              u.isEmailVerified = true;
              u.emailVerifiedAt = new Date().toISOString();
              localStorage.setItem('rolcerca_current_user_v2', JSON.stringify(u));
            }
          } catch (e) {
            // ignore
          }
        }}
      />
    </div>
  );
};
