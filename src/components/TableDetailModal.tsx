import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  ShieldAlert,
  Store, 
  Home, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Star, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Sparkles, 
  Image as ImageIcon,
  Award,
  HeartHandshake,
  Coffee,
  Ban,
  Accessibility,
  Flame,
  MessageSquare,
  BadgeCheck,
  Send,
  Lock,
  AlertTriangle
} from 'lucide-react';
import { TableSession, AppUser } from '../types';

interface TableDetailModalProps {
  table: TableSession | null;
  isOpen: boolean;
  currentUser: AppUser | null;
  onClose: () => void;
  onOpenJoin: (table: TableSession) => void;
  onRequestAuth?: () => void;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  isOpen,
  currentUser,
  onClose,
  onOpenJoin,
  onRequestAuth,
}) => {
  const [activeTab, setActiveTab] = useState<'safety' | 'dm' | 'campaign'>('safety');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  if (!isOpen || !table) return null;

  const isStore = table.venueType === 'store' || table.venueType === 'club_public';
  const isPrivateHome = table.venueType === 'private_home';
  const availableSlots = table.slotsTotal - table.slotsTaken;
  const isFull = availableSlots <= 0;

  // Minor security logic
  const isUserMinor = currentUser?.role === 'minor' || currentUser?.ageCategory === 'MENOR_JUVENIL';
  const isBlockedForMinor = isUserMinor && isPrivateHome;

  const handleApplyClick = () => {
    if (isBlockedForMinor) return;
    if (!currentUser || currentUser.role === 'guest') {
      if (onRequestAuth) onRequestAuth();
      return;
    }
    onOpenJoin(table);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div 
        id="table-detail-modal"
        className="relative w-full max-w-3xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Hero Image */}
        <div className="relative h-44 sm:h-52 w-full bg-[#0F0F11] shrink-0">
          <img
            src={table.coverImage}
            alt={table.title}
            className="w-full h-full object-cover object-center opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#161618] via-[#161618]/60 to-transparent" />

          {/* Close Button */}
          <button
            id="btn-close-detail-modal"
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-[#0F0F11]/80 hover:bg-[#242429] text-[#cbd5e1] hover:text-white border border-[#2A2A2E] transition-colors z-20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Verification Badge & System */}
          <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#0F0F11]/90 text-amber-300 border border-amber-500/50 backdrop-blur">
              {table.system}
            </span>
            <div
              className={`px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 backdrop-blur border ${
                isStore
                  ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/70'
                  : 'bg-amber-950/90 text-amber-200 border-amber-500/60'
              }`}
            >
              {isStore ? (
                <>
                  <Store className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Espacio Público Verificado - Apto Menores</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Casa Particular (Exclusivo +18 Auditado)</span>
                </>
              )}
            </div>
          </div>

          {/* Campaign Title in Hero */}
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="font-fantasy text-xl sm:text-2xl font-bold text-[#f8fafc] leading-tight">
              {table.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#cbd5e1]">
              <span className="text-amber-400 font-semibold">{table.setting}</span>
              <span>•</span>
              <span className="text-[#e2e8f0] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                {table.zone}
              </span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                {availableSlots > 0 ? `${availableSlots} cupos libres` : 'Completa'}
              </span>
            </div>
          </div>
        </div>

        {/* Security Alert for Minors viewing Private Home */}
        {isBlockedForMinor && (
          <div className="bg-amber-950/90 border-b border-amber-500/60 p-3.5 text-xs text-amber-200 flex items-start gap-3 shrink-0">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-100 font-bold mb-0.5">
                ⚠️ Partida Restringida por Protocolo de Protección de Menores
              </strong>
              <p className="text-amber-200/90 leading-relaxed">
                Por políticas de seguridad y protección de menores, las mesas en domicilios particulares solo están disponibles para mayores de 18 años verificados. Podés sumarte a mesas en comiquerías, tiendas y clubes oficiales.
              </p>
            </div>
          </div>
        )}

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-[#2A2A2E] bg-[#0F0F11]/80 px-4 shrink-0 overflow-x-auto">
          <button
            id="tab-safety"
            onClick={() => setActiveTab('safety')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'safety'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Ficha de Seguridad & Espacio</span>
          </button>

          <button
            id="tab-dm"
            onClick={() => setActiveTab('dm')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dm'
                ? 'border-[#800020] text-rose-400'
                : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Perfil del GM & Reseñas ({table.dm.reviews.length})</span>
          </button>

          <button
            id="tab-campaign"
            onClick={() => setActiveTab('campaign')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'campaign'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-[#94a3b8] hover:text-[#f1f5f9]'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Ambientación & Horarios</span>
          </button>
        </div>

        {/* Scrollable Tab Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: SAFETY & VENUE DETAILS */}
          {activeTab === 'safety' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Venue / Host Verification Card */}
              <div className="p-4 rounded-xl bg-[#0F0F11]/80 border border-[#2A2A2E]">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    {isStore ? (
                      <Store className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Home className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <h4 className="font-fantasy text-sm font-bold text-[#f8fafc]">
                        {isStore ? 'Sede Comercial Oficial' : 'Sede Particular Auditada'}
                      </h4>
                      <p className="text-xs text-[#94a3b8]">
                        {table.venueName} • {table.zone}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
                      Auditado {table.verifiedStatus.verifiedDate}
                    </span>
                  </div>
                </div>

                {/* Verification Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-2 border-t border-[#2A2A2E]">
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>DNI y Teléfono Validados</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Ubicación Georreferenciada</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Protocolo de Seguridad Aceptado</span>
                  </div>
                </div>

                {isPrivateHome && (
                  <div className="mt-3 p-2.5 rounded-lg bg-[#161618] border border-[#2A2A2E] text-xs text-[#cbd5e1] flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      <strong>Dirección exacta protegida:</strong> Por seguridad del anfitrión, la dirección exacta se revela en tu panel una vez que el GM aprueba tu solicitud.
                    </span>
                  </div>
                )}
              </div>

              {/* Safety Tools in Place */}
              <div>
                <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] mb-2.5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Herramientas de Seguridad en Mesa</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(table.safetyInfo?.tools || []).map((tool, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#0F0F11] border border-emerald-950/60 text-xs text-emerald-200 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-medium">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Photos of the Space */}
              {table.spacePhotos.length > 0 && (
                <div>
                  <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] mb-2.5 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Fotos del Espacio de Juego</span>
                  </h4>

                  <div className="relative rounded-xl overflow-hidden border border-[#2A2A2E] bg-[#0F0F11] h-48 sm:h-64 mb-2">
                    <img
                      src={table.spacePhotos[selectedPhotoIndex]?.url || table.spacePhotos[0].url}
                      alt="Espacio"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#0F0F11] to-transparent p-3">
                      <span className="text-xs font-semibold text-white">
                        {table.spacePhotos[selectedPhotoIndex]?.caption}
                      </span>
                    </div>
                  </div>

                  {table.spacePhotos && table.spacePhotos.length > 1 && (
                    <div className="flex gap-2">
                      {table.spacePhotos.map((photo, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedPhotoIndex(i)}
                          className={`w-16 h-12 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                            selectedPhotoIndex === i
                              ? 'border-[#800020] ring-2 ring-[#800020]'
                              : 'border-[#2A2A2E] opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={photo.url} alt={photo.tag} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* House Rules & Policies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-[#0F0F11] border border-[#2A2A2E]">
                  <div className="flex items-center gap-2 text-rose-300 font-bold mb-1.5">
                    <Ban className="w-4 h-4 text-rose-400" />
                    <span>Reglas de Convivencia</span>
                  </div>
                  <ul className="space-y-1 text-[#cbd5e1] list-disc list-inside">
                    {(table.safetyInfo?.houseRules || []).map((rule, idx) => (
                      <li key={idx}>{rule}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] space-y-2 text-[#cbd5e1]">
                  <div className="flex items-center gap-2 text-amber-300 font-bold">
                    <Coffee className="w-4 h-4 text-amber-400" />
                    <span>Logística & Comodidades</span>
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Mascotas:</span> {table.safetyInfo.petInfo}
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Fumadores:</span> {table.safetyInfo.smokingPolicy}
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Snacks:</span> {table.safetyInfo.snacksPolicy}
                  </div>
                  <div>
                    <span className="text-[#94a3b8]">Accesibilidad:</span> {table.safetyInfo.accessibility}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GM PROFILE & REVIEWS */}
          {activeTab === 'dm' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* GM Card */}
              <div className="p-4 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <img
                  src={table.dm.avatar}
                  alt={table.dm.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#800020] shadow-md shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-fantasy text-lg font-bold text-[#f8fafc]">
                      {table.dm.name}
                    </h3>
                    <span className="text-xs text-rose-400 font-semibold">{table.dm.handle}</span>
                    <span className="bg-[#800020]/40 text-rose-200 border border-[#991b1b]/60 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      GM Verificado
                    </span>
                  </div>

                  <p className="text-xs text-[#cbd5e1] mt-1 line-clamp-2">
                    {table.dm.bio}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs">
                    <div className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{table.dm.rating}</span>
                      <span className="text-[#71717a]">({table.dm.reviewCount} reseñas)</span>
                    </div>
                    <span className="text-[#71717a]">•</span>
                    <span className="text-[#cbd5e1]">{table.dm.experienceYears} años narrando</span>
                    <span className="text-[#71717a]">•</span>
                    <span className="text-[#cbd5e1]">{table.dm.campaignsFinished} campañas concluidas</span>
                  </div>
                </div>
              </div>

              {/* GM Style Tags */}
              <div>
                <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] mb-2">
                  Estilo de Narración del GM
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(table.dm.dmStyle || []).map((style, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-[#242429] text-rose-200 border border-[#2A2A2E] text-xs font-semibold"
                    >
                      ✦ {style}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews List */}
              <div>
                <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] mb-3 flex items-center justify-between">
                  <span>Reseñas de Jugadores ({table.dm.reviews.length})</span>
                </h4>

                {table.dm.reviews.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] text-center text-xs text-[#71717a]">
                    Esta es una nueva campaña publicada en RolCerca. ¡Sé el primero en dejar una reseña tras la sesión!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(table.dm.reviews || []).map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={rev.authorAvatar}
                              alt={rev.authorName}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                            <span className="text-xs font-bold text-[#f1f5f9]">
                              {rev.authorName}
                            </span>
                            <span className="text-[10px] text-[#71717a]">{rev.date}</span>
                          </div>
                          <div className="flex text-amber-400">
                            {Array.from({ length: rev.rating }).map((_, rIdx) => (
                              <Star key={rIdx} className="w-3 h-3 fill-amber-400" />
                            ))}
                          </div>
                        </div>

                        <p className="text-xs text-[#cbd5e1] leading-relaxed italic">
                          "{rev.comment}"
                        </p>

                        <div className="text-[10px] text-[#71717a] font-medium">
                          Campaña jugada: <span className="text-[#94a3b8]">{rev.campaignPlayed}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CAMPAIGN DETAILS & SCHEDULE */}
          {activeTab === 'campaign' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Detailed Synopsis */}
              <div>
                <h4 className="font-fantasy text-base font-bold text-[#f8fafc] mb-2">
                  Sinopsis de la Aventura
                </h4>
                <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed bg-[#0F0F11]/70 p-4 rounded-xl border border-[#2A2A2E]">
                  {table.synopsis}
                </p>
              </div>

              {/* Tags & Level */}
              <div>
                <h4 className="font-fantasy text-sm font-bold text-[#f1f5f9] mb-2">
                  Estilo de Juego & Temáticas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(table.tags || []).map((t, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-[#0F0F11] text-[#cbd5e1] border border-[#2A2A2E] text-xs font-medium"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Schedule & Logistics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#0F0F11]/80 p-4 rounded-xl border border-[#2A2A2E]">
                <div>
                  <span className="text-[#94a3b8] block mb-0.5">Día y Horario:</span>
                  <strong className="text-[#f1f5f9] text-sm">
                    {table.schedule.dayOfWeek} a las {table.schedule.time}
                  </strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block mb-0.5">Frecuencia & Duración:</span>
                  <strong className="text-[#f1f5f9] text-sm">
                    {table.schedule.frequency} ({table.schedule.durationHours} horas por sesión)
                  </strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block mb-0.5">Dirección / Zona aproximada:</span>
                  <strong className="text-[#f1f5f9] text-sm">{table.addressApprox}</strong>
                </div>
                <div>
                  <span className="text-[#94a3b8] block mb-0.5">Costo / Aporte por sesión:</span>
                  <strong className="text-emerald-400 text-sm">{table.costPerSession}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Call to Action */}
        <div className="p-4 bg-[#0F0F11] border-t border-[#2A2A2E] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <span className="text-xs text-[#94a3b8] block">Disponibilidad en mesa:</span>
            <span className={`text-sm font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isFull ? 'Cupos agotados' : `${availableSlots} de ${table.slotsTotal} jugadores libres`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#e2e8f0] text-xs font-semibold border border-[#2A2A2E] transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {isBlockedForMinor ? (
              <button
                disabled
                className="px-5 py-2 rounded-lg text-xs sm:text-sm font-bold bg-amber-950/80 text-amber-300 border border-amber-600/60 cursor-not-allowed flex items-center gap-2"
                title="Por políticas de seguridad y protección de menores, las mesas en domicilios particulares solo están disponibles para mayores de 18 años verificados."
              >
                <Lock className="w-4 h-4 text-amber-400" />
                <span>Restringido: Exclusivo +18</span>
              </button>
            ) : (
              <button
                id="btn-apply-from-detail"
                onClick={handleApplyClick}
                disabled={isFull}
                className={`px-5 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isFull
                    ? 'bg-[#1f1f23] text-[#52525b] cursor-not-allowed border border-[#2A2A2E]'
                    : 'bg-gradient-to-r from-[#800020] via-[#991b1b] to-[#b91c1c] hover:from-[#991b1b] hover:to-[#dc2626] text-white shadow-black/60 border border-[#991b1b]/80 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>{isFull ? 'Mesa completa' : 'Solicitar unirme a la mesa'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
