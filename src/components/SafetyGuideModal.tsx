import React from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Store, 
  Home, 
  HeartHandshake, 
  AlertTriangle, 
  Users,
  BadgeCheck,
  FileCheck
} from 'lucide-react';

interface SafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyGuideModal: React.FC<SafetyGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="safety-guide-modal"
        className="relative w-full max-w-2xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F0F11] via-[#161618] to-[#064e3b]/30 border-b border-[#2A2A2E] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-900/80 border border-emerald-500/60 flex items-center justify-center text-emerald-200 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-fantasy text-lg font-bold text-[#f8fafc]">
                Protocolo de Seguridad y Verificación
              </h3>
              <p className="text-xs text-emerald-400">
                Estándar de confianza para juegos de rol presenciales en Argentina
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F0F11]/80 hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-[#cbd5e1]">
          {/* Section 1: Verification Badges */}
          <div>
            <h4 className="font-fantasy text-base font-bold text-[#f8fafc] mb-3 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-amber-400" />
              <span>1. Diferenciación de Sedes y Anfitriones</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Store Badge */}
              <div className="p-3.5 rounded-xl bg-[#800020]/20 border border-[#800020]/50 space-y-2">
                <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                  <Store className="w-4 h-4 text-rose-400" />
                  <span>Sede Verificada (Tiendas / Clubes)</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  Espacios comerciales o clubes lúdicos abiertos al público con dirección exacta, habilitación y mesas amplias acondicionadas para eventos.
                </p>
              </div>

              {/* Host Badge */}
              <div className="p-3.5 rounded-xl bg-[#d97706]/15 border border-amber-600/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>Anfitrión Verificado (Casas Particulares)</span>
                </div>
                <p className="text-xs text-[#cbd5e1] leading-relaxed">
                  GMs que validaron su identidad mediante DNI argentino, domicilio y referencias previas. La dirección exacta solo se comparte una vez aceptada la solicitud.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Tabletop Safety Tools */}
          <div>
            <h4 className="font-fantasy text-base font-bold text-[#f8fafc] mb-3 flex items-center gap-2">
              <HeartHandshake className="w-4 h-4 text-rose-400" />
              <span>2. Herramientas de Seguridad Lúdica Obligatorias</span>
            </h4>

            <div className="space-y-2.5">
              <div className="p-3 bg-[#0F0F11]/80 rounded-xl border border-[#2A2A2E]">
                <strong className="text-[#f1f5f9] text-xs block mb-1">
                  • Líneas y Velos (Lines & Veils)
                </strong>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Acuerdo explícito al inicio de la campaña sobre temas prohibidos (líneas que no se cruzan) y temas que ocurren fuera de cámara (velos).
                </p>
              </div>

              <div className="p-3 bg-[#0F0F11]/80 rounded-xl border border-[#2A2A2E]">
                <strong className="text-[#f1f5f9] text-xs block mb-1">
                  • Tarjeta X (X-Card)
                </strong>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Cualquier participante puede tocar la Tarjeta X (física o digital) para editar o pausar un elemento narrativo incómodo de inmediato, sin dar explicaciones obligatorias.
                </p>
              </div>

              <div className="p-3 bg-[#0F0F11]/80 rounded-xl border border-[#2A2A2E]">
                <strong className="text-[#f1f5f9] text-xs block mb-1">
                  • Protocolo de Puertas Abiertas
                </strong>
                <p className="text-xs text-[#94a3b8] leading-relaxed">
                  Cualquier jugador es libre de retirarse de una sesión en cualquier momento si siente incomodidad, con total apoyo de la comunidad.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Recommended Guidelines */}
          <div className="p-3.5 bg-[#064e3b]/20 border border-emerald-800/40 rounded-xl space-y-2">
            <h5 className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Consejos para Jugadores en Partidas Presenciales</span>
            </h5>
            <ul className="text-xs text-[#cbd5e1] space-y-1 list-disc list-inside">
              <li>Mantené puntualidad y avisá con al menos 24hs si no podés asistir.</li>
              <li>Aclarar si tenés alergias alimentarias o a mascotas antes de la sesión.</li>
              <li>Respetá la separación entre el conflicto del personaje (rol) y las personas reales.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0F0F11] border-t border-[#2A2A2E] flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
