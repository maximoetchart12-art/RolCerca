import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  Store, 
  Home, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Dice5, 
  ShieldCheck, 
  Sparkles, 
  Image as ImageIcon, 
  Loader2, 
  Bot,
  CheckCircle2,
  AlertCircle,
  User
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TableSession, RPGSystem, VenueType, ExperienceLevel, AppUser } from '../types';

interface PublishTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCreated: (newTable: TableSession) => void;
  tableToEdit?: TableSession;
  onTableUpdated?: (updatedTable: TableSession) => void;
  isProfileVerified?: boolean;
  onOpenProfile?: () => void;
  currentUser?: AppUser | null;
}

// Regional center coordinates for Argentina
const REGION_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'CABA': { lat: -34.6037, lng: -58.3816 },
  'GBA Norte': { lat: -34.5050, lng: -58.5020 },
  'GBA Oeste': { lat: -34.6548, lng: -58.5630 },
  'GBA Sur': { lat: -34.7438, lng: -58.3976 },
  'PBA Interior': { lat: -34.9214, lng: -57.9545 },
};

const DEFAULT_SPACE_PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=800&auto=format&fit=crop&q=80',
    caption: 'Mesa amplia acondicionada para rol presencial con tapete cuadriculado',
    tag: 'Mesa de Juego',
  },
  {
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop&q=80',
    caption: 'Espacio cómodo, iluminado y con asientos confortables',
    tag: 'Espacio Cómodo',
  },
  {
    url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&auto=format&fit=crop&q=80',
    caption: 'Iluminación ambiental y equipo de sonido para música de fondo',
    tag: 'Clima & Luces',
  },
];

export const PublishTableModal: React.FC<PublishTableModalProps> = ({
  isOpen,
  onClose,
  onTableCreated,
  tableToEdit,
  onTableUpdated,
  isProfileVerified = true,
  onOpenProfile,
  currentUser,
}) => {
  const isUserMinor = currentUser?.role === 'minor' || currentUser?.ageCategory === 'MENOR_JUVENIL';
  // Form State
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState<RPGSystem>('D&D 5e');
  const [synopsis, setSynopsis] = useState('');
  const [setting, setSetting] = useState('');
  const [levelRequired, setLevelRequired] = useState<ExperienceLevel>('Apto Principiantes');
  const [venueType, setVenueType] = useState<VenueType>('store');
  const [venueName, setVenueName] = useState('');
  
  // Custom Location fields
  const [region, setRegion] = useState<'CABA' | 'GBA Norte' | 'GBA Oeste' | 'GBA Sur' | 'PBA Interior'>('CABA');
  const [zone, setZone] = useState('');
  const [addressApprox, setAddressApprox] = useState('');
  const [customLat, setCustomLat] = useState<string>('');
  const [customLng, setCustomLng] = useState<string>('');

  // DM Details
  const [dmName, setDmName] = useState('');
  const [dmHandle, setDmHandle] = useState('');
  const [dmBio, setDmBio] = useState('');
  const [dmExperience, setDmExperience] = useState<number>(3);

  // Logistics
  const [slotsTotal, setSlotsTotal] = useState(5);
  const [slotsTaken, setSlotsTaken] = useState(1);
  const [frequency, setFrequency] = useState<'Semanal' | 'Quincenal' | 'Mensual' | 'One-shot'>('Quincenal');
  const [dayOfWeek, setDayOfWeek] = useState('Sábados');
  const [time, setTime] = useState('16:00 hs');
  const [costPerSession, setCostPerSession] = useState('Gratuito / Consumición del lugar');

  // Space photos selection
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([0, 1]);

  // Safety tools selected
  const [safetyTools, setSafetyTools] = useState<string[]>([
    'Líneas y Velos',
    'Tarjeta X Física en Mesa',
    'Protocolo de Puertas Abiertas',
    'Sesión Cero Obligatoria',
  ]);

  // AI Generator state
  const [isGeneratingWithAI, setIsGeneratingWithAI] = useState(false);

  useEffect(() => {
    if (tableToEdit) {
      setTitle(tableToEdit.title);
      setSystem(tableToEdit.system);
      setSynopsis(tableToEdit.synopsis);
      setSetting(tableToEdit.setting);
      setLevelRequired(tableToEdit.levelRequired);
      setVenueType(tableToEdit.venueType);
      setVenueName(tableToEdit.venueName);
      setRegion(tableToEdit.region);
      setZone(tableToEdit.zone);
      setAddressApprox(tableToEdit.addressApprox);
      setCustomLat(tableToEdit.coordinates.lat.toString());
      setCustomLng(tableToEdit.coordinates.lng.toString());
      
      setDmName(tableToEdit.dm.name);
      setDmHandle(tableToEdit.dm.handle || '');
      setDmBio(tableToEdit.dm.bio || '');
      setDmExperience(tableToEdit.dm.experienceYears);

      setSlotsTotal(tableToEdit.slotsTotal);
      setSlotsTaken(tableToEdit.slotsTaken);
      setFrequency(tableToEdit.schedule.frequency);
      setDayOfWeek(tableToEdit.schedule.dayOfWeek);
      setTime(tableToEdit.schedule.time);
      setCostPerSession(tableToEdit.costPerSession);
      
      if (tableToEdit.safetyInfo?.tools) {
        setSafetyTools(tableToEdit.safetyInfo.tools);
      }
    } else {
      // Load verified profile data to pre-populate DM info
      let profileName = '';
      let profileHandle = '';
      let profileBio = '';
      let profileAddress = '';
      let profileLat = '';
      let profileLng = '';

      if (currentUser) {
        if (currentUser.name) profileName = currentUser.name;
        if (currentUser.handle) profileHandle = currentUser.handle;
        if (currentUser.gmBio || currentUser.bio) profileBio = currentUser.gmBio || currentUser.bio || '';
        if (currentUser.address) profileAddress = currentUser.address;
        if (currentUser.location?.lat) profileLat = currentUser.location.lat.toString();
        if (currentUser.location?.lng) profileLng = currentUser.location.lng.toString();
      }

      // Reset form if creating new table
      setTitle('');
      setSystem('D&D 5e');
      setSynopsis('');
      setSetting('');
      setLevelRequired('Apto Principiantes');
      setVenueType('store');
      setVenueName('');
      setRegion('CABA');
      setZone(profileAddress ? profileAddress.split(',')[0].trim() : '');
      setAddressApprox(profileAddress);
      setCustomLat(profileLat);
      setCustomLng(profileLng);
      setDmName(profileName);
      setDmHandle(profileHandle);
      setDmBio(profileBio);
      setDmExperience(3);
      setSlotsTotal(5);
      setSlotsTaken(1);
      setFrequency('Quincenal');
      setDayOfWeek('Sábados');
      setTime('16:00 hs');
      setCostPerSession('Gratuito / Consumición del lugar');
      setSafetyTools([
        'Líneas y Velos',
        'Tarjeta X Física en Mesa',
        'Protocolo de Puertas Abiertas',
        'Sesión Cero Obligatoria',
      ]);
    }
  }, [tableToEdit, isOpen]);

  if (!isOpen) return null;

  // If user is not verified and is attempting to create a new table, block and show verification required screen
  if (!isProfileVerified && !tableToEdit) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F11]/85 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="relative w-full max-w-lg bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-950/50 border border-amber-800/60 flex items-center justify-center mx-auto text-amber-400 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="font-fantasy text-xl font-bold text-[#f8fafc]">
              Verificación de Cuenta Requerida
            </h3>
            <p className="text-xs sm:text-sm text-[#94a3b8] leading-relaxed">
              Para publicar una mesa presencial en RolCerca y proteger a la comunidad de jugadores, primero debés registrarte y verificar tu perfil.
            </p>
          </div>
          
          <div className="p-4 bg-[#0F0F11] rounded-xl border border-[#2A2A2E] text-left text-xs text-[#cbd5e1] space-y-2.5">
            <div className="font-bold text-rose-300 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              Pasos obligatorios para habilitar publicaciones:
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1e1e24] text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
              <span>Completar Nombre o Apodo y Usuario</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1e1e24] text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
              <span>Validar DNI y Teléfono Móvil con foto de comprobante</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="w-5 h-5 rounded-full bg-[#1e1e24] text-rose-300 font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
              <span>Seleccionar tu barrio y ubicación de referencia en el mapa</span>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-center pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] text-xs font-semibold border border-[#2A2A2E] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                onClose();
                if (onOpenProfile) onOpenProfile();
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white text-xs font-bold border border-rose-600/70 shadow-lg shadow-black/50 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-rose-200" />
              <span>Crear y Verificar Perfil</span>
            </button>
          </div>
        </div>
      </div>
    );
  }


  const handleToggleSafetyTool = (tool: string) => {
    if (safetyTools.includes(tool)) {
      setSafetyTools(safetyTools.filter((t) => t !== tool));
    } else {
      setSafetyTools([...safetyTools, tool]);
    }
  };

  const handleTogglePhoto = (idx: number) => {
    if (selectedPhotos.includes(idx)) {
      if (selectedPhotos.length > 1) {
        setSelectedPhotos(selectedPhotos.filter((i) => i !== idx));
      }
    } else {
      setSelectedPhotos([...selectedPhotos, idx]);
    }
  };

  // AI Campaign Generator
  const handleGenerateCampaignWithAI = async () => {
    setIsGeneratingWithAI(true);
    const locationText = zone || region;

    try {
      const res = await fetch('/api/gemini/generate-campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Aventuras en ' + locationText,
          system,
          tone: 'Aventura heroica con misterio, exploración y juego en equipo',
          venueType: venueType === 'store' ? 'Tienda Lúdica' : 'Casa Particular',
          zone: locationText,
        }),
      });

      const data = await res.json();
      if (data.campaignDescription) {
        setSynopsis(data.campaignDescription);
        if (!title) setTitle(`Crónicas de ${locationText}`);
      }
    } catch (e) {
      setSynopsis(
        `Una nueva campaña de ${system} ambientada en ${setting || 'un mundo fantástico'}. Buscamos jugadores con ganas de rolear en equipo, explorar tramas profundas y disfrutar de un ambiente de juego presencial sano y distendido.`
      );
    } finally {
      setIsGeneratingWithAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !synopsis.trim() || !zone.trim() || !dmName.trim()) {
      return;
    }

    const isStore = venueType === 'store' || venueType === 'club_public';
    
    // Resolve coordinates
    const defaultCoords = REGION_COORDINATES[region] || REGION_COORDINATES['CABA'];
    const parsedLat = parseFloat(customLat);
    const parsedLng = parseFloat(customLng);
    
    // Minor random offset around the regional center if no custom lat/lng is given so markers don't overlap exactly
    const randomOffset = (Math.random() - 0.5) * 0.03;
    const finalLat = (!isNaN(parsedLat) && isFinite(parsedLat) && parsedLat >= -90 && parsedLat <= 90)
      ? parsedLat
      : defaultCoords.lat + randomOffset;
    const finalLng = (!isNaN(parsedLng) && isFinite(parsedLng) && parsedLng >= -180 && parsedLng <= 180)
      ? parsedLng
      : defaultCoords.lng + randomOffset;

    const tableData: TableSession = {
      id: tableToEdit ? tableToEdit.id : 'mesa-' + Date.now(),
      title: title.trim(),
      system,
      synopsis: synopsis.trim(),
      setting: setting.trim() || 'Fantasía / Libre',
      levelRequired,
      tags: [system, levelRequired, isStore ? 'Tienda Oficial' : 'Casa Particular', frequency],
      slotsTotal: Number(slotsTotal),
      slotsTaken: Number(slotsTaken),
      venueType,
      venueName: venueName.trim() || (isStore ? 'Tienda / Espacio Lúdico' : 'Casa del Anfitrión'),
      addressApprox: addressApprox.trim() || `${zone}, ${region}`,
      zone: zone.trim(),
      region,
      coordinates: { lat: finalLat, lng: finalLng },
      distanceKm: 2.5,
      schedule: {
        frequency,
        dayOfWeek,
        time,
        durationHours: 4,
        nextSessionDate: `${dayOfWeek} ${time}`,
      },
      verifiedStatus: tableToEdit?.verifiedStatus || {
        isVerified: true,
        type: isStore ? 'store_verified' : 'host_verified',
        badgeLabel: isStore ? 'Sede Verificada' : 'Anfitrión Verificado',
        verifiedDate: new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' }),
        dniValidated: true,
        addressValidated: true,
        safetyAudited: true,
      },
      dm: {
        id: tableToEdit?.dm?.id || 'dm-' + Date.now(),
        name: dmName.trim(),
        handle: dmHandle.trim() || `@${dmName.toLowerCase().replace(/\\s+/g, '_')}`,
        avatar: tableToEdit?.dm?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        bio: dmBio.trim() || `Game Master con ${dmExperience} años de experiencia narrando historias y organizando partidas presenciales.`,
        experienceYears: Number(dmExperience) || 1,
        campaignsFinished: tableToEdit?.dm?.campaignsFinished || 0,
        rating: tableToEdit?.dm?.rating || 5.0,
        reviewCount: tableToEdit?.dm?.reviewCount || 0,
        badges: tableToEdit?.dm?.badges || ['Nueva Mesa Activa', isStore ? 'Sede Verificada' : 'Anfitrión Verificado'],
        dmStyle: tableToEdit?.dm?.dmStyle || ['Narración colaborativa', 'Seguridad en mesa', 'Buena onda'],
        reviews: tableToEdit?.dm?.reviews || [],
      },
      safetyInfo: {
        tools: safetyTools,
        atmosphere: 'Ambiente cómodo con mesa de juego amplia, iluminación adecuada y respeto mutuo.',
        houseRules: [
          'Puntualidad en el inicio de la sesión.',
          'Respeto irrestricto de las herramientas de seguridad lúdica.',
          'Cero tolerancia a conductas tóxicas o discriminatorias.'
        ],
        smokingPolicy: 'Prohibido fumar en la sala de juego.',
        petInfo: 'Sin mascotas en la mesa de juego.',
        accessibility: 'Acceso coordinado.',
        snacksPolicy: 'Mate libre y snacks para compartir.'
      },
      spacePhotos: selectedPhotos.map((idx) => DEFAULT_SPACE_PHOTOS[idx]).filter(Boolean),
      coverImage: tableToEdit?.coverImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
      costPerSession: costPerSession.trim() || 'Gratuito',
      createdAt: tableToEdit?.createdAt || new Date().toISOString().split('T')[0],
    };

    // Confetti celebration
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
      });
    } catch {
      // ignore
    }

    if (tableToEdit && onTableUpdated) {
      onTableUpdated(tableData);
    } else {
      onTableCreated(tableData);
    }
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="publish-table-modal"
        className="relative w-full max-w-3xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F0F11] via-[#161618] to-[#800020]/30 border-b border-[#2A2A2E] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#800020] border border-[#991b1b] flex items-center justify-center text-rose-100 shadow-md">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fantasy text-lg font-bold text-[#f8fafc]">
                Publicar Nueva Mesa de Rol
              </h3>
              <p className="text-xs text-rose-400">
                Creá tu convocatoria presencial con tu ubicación real y datos de anfitrión
              </p>
            </div>
          </div>

          <button
            id="btn-close-publish-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F0F11]/80 hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* STEP 1: CAMPAIGN CORE */}
          <div className="space-y-3.5">
            <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-1.5">
              <Dice5 className="w-4 h-4 text-rose-400" />
              <span>1. Información de la Campaña & Sistema</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Título de la Campaña / Aventura *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. La Maldición de Strahd / Campaña Homebrew"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Sistema de Rol *
                </label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value as RPGSystem)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                >
                  <option value="D&D 5e">D&D 5e</option>
                  <option value="D&D 2024">D&D 2024 (Nuevo PHB)</option>
                  <option value="Pathfinder 2e">Pathfinder 2e</option>
                  <option value="Call of Cthulhu">Call of Cthulhu (La Llamada)</option>
                  <option value="Vampiro: La Mascarada">Vampiro: La Mascarada (V5)</option>
                  <option value="Cyberpunk RED">Cyberpunk RED</option>
                  <option value="Sistemas Indie">Sistemas Indie (PbtA / OSR / Fate)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Ambientación / Mundo
                </label>
                <input
                  type="text"
                  placeholder="Ej. Forgotten Realms, Ravenloft, Fantasía oscura, etc."
                  value={setting}
                  onChange={(e) => setSetting(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Nivel de Experiencia Requerido
                </label>
                <select
                  value={levelRequired}
                  onChange={(e) => setLevelRequired(e.target.value as ExperienceLevel)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                >
                  <option value="Apto Principiantes">Apto Principiantes (Iniciación)</option>
                  <option value="Nivel Medio">Nivel Medio</option>
                  <option value="Veteranos">Veteranos</option>
                  <option value="Todos los niveles">Todos los niveles</option>
                </select>
              </div>
            </div>

            {/* AI Generator Helper */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-[#cbd5e1]">
                  Sinopsis / Resumen de la Aventura *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateCampaignWithAI}
                  disabled={isGeneratingWithAI}
                  className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-[#d97706]/20 px-2 py-0.5 rounded border border-amber-600/50 cursor-pointer transition-colors"
                >
                  {isGeneratingWithAI ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Generando con Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>Generar Sinopsis con IA</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                required
                rows={3}
                placeholder="Describí la premisa principal, el tono y qué tipo de aventura experimentarán los jugadores..."
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* STEP 2: VENUE & LOCATION */}
          <div className="space-y-3.5 pt-2">
            <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-1.5">
              <MapPin className="w-4 h-4 text-rose-400" />
              <span>2. Ubicación Real de la Mesa</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Venue Type */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Tipo de Sede *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVenueType('store');
                      if (!venueName) setVenueName('Tienda / Club Lúdico');
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      venueType === 'store'
                        ? 'bg-[#800020] text-rose-100 border-[#991b1b] shadow'
                        : 'bg-[#0F0F11] text-[#94a3b8] border-[#2A2A2E] hover:text-[#f1f5f9]'
                    }`}
                  >
                    <Store className="w-4 h-4 text-rose-300" />
                    <span>Tienda / Club</span>
                  </button>

                  <button
                    type="button"
                    disabled={isUserMinor}
                    onClick={() => {
                      if (isUserMinor) return;
                      setVenueType('private_home');
                      if (!venueName) setVenueName('Casa Particular');
                    }}
                    title={
                      isUserMinor
                        ? 'Por políticas de seguridad, los menores de edad solo pueden convocar mesas en tiendas comerciales o clubes oficiales.'
                        : 'Casa particular / Domicilio privado'
                    }
                    className={`p-2.5 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isUserMinor
                        ? 'bg-[#18181b] text-[#52525b] border-[#27272a] cursor-not-allowed opacity-60'
                        : venueType === 'private_home'
                        ? 'bg-[#d97706]/40 text-amber-200 border-amber-500 shadow cursor-pointer'
                        : 'bg-[#0F0F11] text-[#94a3b8] border-[#2A2A2E] hover:text-[#f1f5f9] cursor-pointer'
                    }`}
                  >
                    <Home className="w-4 h-4 text-amber-400" />
                    <span>{isUserMinor ? 'Casa Particular (Solo +18)' : 'Casa Particular'}</span>
                  </button>
                </div>
                {isUserMinor && (
                  <div className="mt-1.5 text-[11px] text-amber-300 flex items-center gap-1">
                    <span>⚠️ Cuentas juveniles solo pueden proponer mesas en tiendas o clubes oficiales.</span>
                  </div>
                )}
              </div>

              {/* Region Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Provincia / Región *
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                >
                  <option value="CABA">Ciudad Autónoma de Buenos Aires (CABA)</option>
                  <option value="GBA Norte">Gran Buenos Aires Norte (GBA Norte)</option>
                  <option value="GBA Oeste">Gran Buenos Aires Oeste (GBA Oeste)</option>
                  <option value="GBA Sur">Gran Buenos Aires Sur (GBA Sur)</option>
                  <option value="PBA Interior">Provincia de Buenos Aires (Interior)</option>
                </select>
              </div>

              {/* Zone / Barrio input */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Barrio o Localidad *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Caballito, Palermo, Vicente López, Banfield, etc."
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>

              {/* Venue Name */}
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Nombre del Lugar / Espacio
                </label>
                <input
                  type="text"
                  placeholder="Ej. 2D6 Bar, Club El Tablero o Casa de Lucas"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>

              {/* Address */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Dirección o Referencia de Encuentro
                </label>
                <input
                  type="text"
                  placeholder="Ej. Av. Rivadavia al 5400 (se comparte dirección exacta al confirmar cupo)"
                  value={addressApprox}
                  onChange={(e) => setAddressApprox(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* STEP 3: GM / HOST PROFILE */}
          <div className="space-y-3.5 pt-2">
            <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-1.5">
              <User className="w-4 h-4 text-rose-400" />
              <span>3. Perfil del Game Master / Anfitrión</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Tu Nombre o Apodo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Lucas, Sofía, Martín D."
                  value={dmName}
                  onChange={(e) => setDmName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Contacto / Red Social
                </label>
                <input
                  type="text"
                  placeholder="Ej. @tu_usuario o Discord: usuario#1234"
                  value={dmHandle}
                  onChange={(e) => setDmHandle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Años Narrando
                </label>
                <input
                  type="number"
                  min={0}
                  max={40}
                  value={dmExperience}
                  onChange={(e) => setDmExperience(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Breve presentación de tu estilo como GM
                </label>
                <input
                  type="text"
                  placeholder="Ej. Me gusta combinar mapas tácticos con música ambiental y foco en la historia compartida."
                  value={dmBio}
                  onChange={(e) => setDmBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: SCHEDULE & SLOTS */}
          <div className="space-y-3.5 pt-2">
            <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-1.5">
              <Users className="w-4 h-4 text-rose-400" />
              <span>4. Cupos, Horarios & Aporte</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Cupos Totales
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={slotsTotal}
                  onChange={(e) => setSlotsTotal(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Jugadores Confirmados
                </label>
                <input
                  type="number"
                  min={0}
                  max={slotsTotal - 1}
                  value={slotsTaken}
                  onChange={(e) => setSlotsTaken(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Frecuencia
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                >
                  <option value="Semanal">Semanal</option>
                  <option value="Quincenal">Quincenal</option>
                  <option value="Mensual">Mensual</option>
                  <option value="One-shot">One-shot (Única sesión)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Día y Horario
                </label>
                <input
                  type="text"
                  placeholder="Ej. Sábados 16:30 hs"
                  value={`${dayOfWeek} ${time}`}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    if (parts[0]) setDayOfWeek(parts[0]);
                    if (parts[1]) setTime(parts[1]);
                  }}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                Costo / Aporte por sesión
              </label>
              <input
                type="text"
                placeholder="Ej. Gratuito, Consumición del bar o Aporte de snacks"
                value={costPerSession}
                onChange={(e) => setCostPerSession(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
              />
            </div>
          </div>

          {/* STEP 5: SAFETY TOOLS */}
          <div className="space-y-3.5 pt-2">
            <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] flex items-center gap-2 border-b border-[#2A2A2E] pb-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>5. Herramientas de Seguridad Lúdica</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                'Líneas y Velos',
                'Tarjeta X Física en Mesa',
                'Protocolo de Puertas Abiertas',
                'Sesión Cero Obligatoria',
                'Control de Fobias Individual',
                'Pausa Comunitaria',
              ].map((tool) => (
                <label
                  key={tool}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                    safetyTools.includes(tool)
                      ? 'bg-[#064e3b]/30 border-emerald-700/60 text-emerald-200'
                      : 'bg-[#0F0F11] border-[#2A2A2E] text-[#94a3b8] hover:text-[#f1f5f9]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={safetyTools.includes(tool)}
                    onChange={() => handleToggleSafetyTool(tool)}
                    className="rounded border-emerald-700 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 bg-[#0F0F11]"
                  />
                  <span>{tool}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-[#2A2A2E] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] text-xs font-semibold border border-[#2A2A2E] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#800020] via-[#991b1b] to-[#b91c1c] hover:from-[#991b1b] hover:to-[#dc2626] text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/70 border border-[#991b1b]/80 transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Mesa en el Mapa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
