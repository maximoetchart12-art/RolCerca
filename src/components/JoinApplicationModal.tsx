import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Dice5, 
  ShieldCheck, 
  CheckCircle2, 
  Bot, 
  Loader2, 
  User, 
  Mail, 
  Phone, 
  MessageSquareQuote,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TableSession, JoinApplication, AppUser } from '../types';

interface JoinApplicationModalProps {
  table: TableSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitApplication: (application: JoinApplication) => void;
  currentUser?: AppUser | null;
}

export const JoinApplicationModal: React.FC<JoinApplicationModalProps> = ({
  table,
  isOpen,
  onClose,
  onSubmitApplication,
  currentUser,
}) => {
  const [playerName, setPlayerName] = useState(currentUser?.name || '');
  const [playerEmail, setPlayerEmail] = useState(currentUser?.email || '');
  const [playerPhone, setPlayerPhone] = useState(currentUser?.phone || '');
  const [characterConcept, setCharacterConcept] = useState('');
  const [preferredRole, setPreferredRole] = useState('Roleplay e Inmersión');
  const [experienceLevel, setExperienceLevel] = useState('Intermedio');
  const [messageToGM, setMessageToGM] = useState('');
  const [safetyAcceptance, setSafetyAcceptance] = useState(true);

  // Sync state if currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      if (!playerName) setPlayerName(currentUser.name);
      if (!playerEmail) setPlayerEmail(currentUser.email);
      if (!playerPhone && currentUser.phone) setPlayerPhone(currentUser.phone);
    }
  }, [currentUser]);

  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!isOpen || !table) return null;

  // Handle AI Character & Application Generator using Gemini server-side endpoint
  const handleGeneratePitchWithAI = async () => {
    setIsGeneratingPitch(true);
    setAiError(null);

    try {
      const response = await fetch('/api/gemini/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignTitle: table.title,
          system: table.system,
          setting: table.setting,
          playerStyle: preferredRole,
          characterConcept: characterConcept || 'Un personaje versátil que complemente al grupo',
          experience: experienceLevel,
        }),
      });

      const data = await response.json();
      if (data.pitch) {
        setMessageToGM(data.pitch);
      } else if (data.fallbackPitch) {
        setMessageToGM(data.fallbackPitch);
      }
    } catch (err) {
      console.warn('AI generator fallback:', err);
      setMessageToGM(
        `¡Hola ${table.dm.name}! Me interesa sumarme a tu mesa de "${table.title}". Tengo disponibilidad para los ${table.schedule.dayOfWeek} a las ${table.schedule.time} y muchas ganas de rolear en un ambiente sano y respetuoso. Mi idea es llevar un personaje con rol de ${preferredRole}. ¡Saludos!`
      );
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!playerName.trim() || !playerEmail.trim()) {
      return;
    }

    const newApplication: JoinApplication = {
      id: 'app-' + Date.now(),
      tableId: table.id,
      playerId: currentUser?.id,
      playerName,
      playerEmail,
      playerPhone: playerPhone || 'No especificado',
      characterConcept: characterConcept || 'Por definir en sesión cero',
      preferredRole,
      experienceLevel,
      safetyAcceptance,
      messageToGM: messageToGM || `¡Hola! Me gustaría sumarme a la mesa de ${table.title}.`,
      messageToDM: messageToGM || `¡Hola! Me gustaría sumarme a la mesa de ${table.title}.`,
      appliedAt: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'pending',
    };

    // Confetti effect!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e11d48', '#f59e0b', '#10b981', '#ffffff'],
      });
    } catch (e) {
      // ignore
    }

    onSubmitApplication(newApplication);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="join-application-modal"
        className="relative w-full max-w-2xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F0F11] via-[#161618] to-[#800020]/30 border-b border-[#2A2A2E] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#800020] border border-[#991b1b] flex items-center justify-center text-rose-200 shrink-0">
              <Dice5 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-fantasy text-lg font-bold text-[#f8fafc] truncate">
                Solicitud para unirse a la mesa
              </h3>
              <p className="text-xs text-rose-400 font-semibold truncate">
                {table.title} ({table.system}) • GM: {table.dm.name}
              </p>
            </div>
          </div>

          <button
            id="btn-close-join-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#0F0F11]/80 hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
          {/* Quick Summary Pill */}
          <div className="p-3 bg-[#0F0F11]/70 rounded-xl border border-[#2A2A2E] flex flex-wrap items-center justify-between gap-2 text-xs text-[#cbd5e1]">
            <div className="flex items-center gap-1.5">
              <span className="text-[#94a3b8]">Próxima sesión:</span>
              <strong className="text-amber-300 font-semibold">
                {table.schedule.dayOfWeek} a las {table.schedule.time}
              </strong>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#94a3b8]">Sede:</span>
              <strong className="text-[#f1f5f9]">{table.zone} ({table.venueName})</strong>
            </div>
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentUser && (
              <div className="sm:col-span-2 p-2.5 rounded-lg bg-[#0F0F11] border border-[#2A2A2E] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#f1f5f9]">{currentUser.name} ({currentUser.handle})</span>
                </div>
                {currentUser.ageCategory === 'MENOR_JUVENIL' ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/70 border border-amber-500/50 px-2 py-0.5 rounded">
                    🌱 Aventurero Juvenil (13-17)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded">
                    🛡️ DNI Verificado (+18)
                  </span>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-rose-400" />
                Nombre / Apodo de Rol *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. Lucas 'Thorin'"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-rose-400" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                required
                placeholder="tu_email@ejemplo.com"
                value={playerEmail}
                onChange={(e) => setPlayerEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp / Teléfono (opcional para grupo)
              </label>
              <input
                type="text"
                placeholder="Ej. 11 4455-6677"
                value={playerPhone}
                onChange={(e) => setPlayerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                Tu Experiencia en Rol
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none text-xs sm:text-sm"
              >
                <option value="Principiante absoluto">Principiante absoluto (Primera vez)</option>
                <option value="Intermedio">Intermedio (Jugué varias partidas)</option>
                <option value="Veterano">Veterano (Años jugando rol)</option>
              </select>
            </div>
          </div>

          {/* Character Pitch & Playstyle */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                Idea preliminar de personaje o arquetipo
              </label>
              <input
                type="text"
                placeholder="Ej. Clérigo devoto de la tormenta o Pícaro explorador urbano"
                value={characterConcept}
                onChange={(e) => setCharacterConcept(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm"
              />
            </div>

            {/* AI Assistant Button */}
            <div className="bg-gradient-to-r from-[#800020]/20 via-[#d97706]/10 to-[#0F0F11] p-3 rounded-xl border border-[#800020]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                <span className="text-xs text-[#cbd5e1]">
                  ¿Querés una presentación personalizada para el GM?
                </span>
              </div>

              <button
                type="button"
                onClick={handleGeneratePitchWithAI}
                disabled={isGeneratingPitch}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow flex items-center gap-1.5 border border-amber-400/40 transition-all shrink-0 cursor-pointer"
              >
                {isGeneratingPitch ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Redactando con Gemini...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5" />
                    <span>Generar con Asistente IA</span>
                  </>
                )}
              </button>
            </div>

            {/* Message to GM */}
            <div>
              <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center justify-between">
                <span>Mensaje de Presentación para el GM *</span>
                <span className="text-[11px] text-[#71717a] font-normal">
                  Podés editar o escribir libremente
                </span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Contale al GM sobre tus expectativas, disponibilidad y por qué te interesa sumarte a la mesa..."
                value={messageToGM}
                onChange={(e) => setMessageToGM(e.target.value)}
                className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-[#800020] focus:outline-none placeholder:text-[#52525b] text-xs sm:text-sm leading-relaxed"
              />
            </div>
          </div>

          {/* Safety Acknowledgment */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-[#064e3b]/20 border border-emerald-800/60 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={safetyAcceptance}
                onChange={(e) => setSafetyAcceptance(e.target.checked)}
                className="mt-0.5 rounded border-emerald-700 text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-[#0F0F11] shrink-0"
              />
              <span className="text-xs text-[#cbd5e1] leading-snug">
                Me comprometo a respetar las <strong>Herramientas de Seguridad Lúdica</strong> de la mesa (Líneas y Velos, Tarjeta X), mantener puntualidad y cuidar el espacio de juego presencial.
              </span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#2A2A2E] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] text-xs font-semibold border border-[#2A2A2E] transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#800020] via-[#991b1b] to-[#b91c1c] hover:from-[#991b1b] hover:to-[#dc2626] text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/70 border border-[#991b1b]/80 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Enviar Solicitud al GM</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
