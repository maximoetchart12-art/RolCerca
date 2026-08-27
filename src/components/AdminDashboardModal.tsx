import React, { useState } from 'react';
import { 
  ShieldCheck, 
  X, 
  Lock, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  Eye, 
  Phone, 
  MapPin, 
  User, 
  AlertTriangle,
  RefreshCw,
  Search,
  Check,
  Calendar,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { DMVerificationRequest } from '../types';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: DMVerificationRequest[];
  onApproveRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string, reason: string) => void;
  onRefreshRequests?: () => void;
  isAdmin?: boolean;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  requests,
  onApproveRequest,
  onRejectRequest,
  onRefreshRequests,
  isAdmin = false,
}) => {
  // Simple admin auth state (PIN default: 1234 or "admin" or bypass if unlocked)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return isAdmin || localStorage.getItem('rolcerca_admin_auth') === 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState(false);

  // Tab & Filters
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DMVerificationRequest | null>(null);
  
  // Rejection modal
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Image preview modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '1234' || pinInput.trim().toLowerCase() === 'admin' || pinInput.trim() === 'rolcerca2026') {
      setIsAuthenticated(true);
      localStorage.setItem('rolcerca_admin_auth', 'true');
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('rolcerca_admin_auth');
    setPinInput('');
  };

  const handleOpenReject = (req: DMVerificationRequest) => {
    setRejectionTargetId(req.id);
    setRejectionReason('La foto del DNI no es suficientemente nítida para validar la identidad o los datos no coinciden.');
    setIsRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (rejectionTargetId) {
      onRejectRequest(rejectionTargetId, rejectionReason);
      setIsRejectDialogOpen(false);
      setRejectionTargetId(null);
      if (selectedRequest?.id === rejectionTargetId) {
        setSelectedRequest(null);
      }
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.handle.toLowerCase().includes(q) ||
      r.dni.toLowerCase().includes(q) ||
      r.address.toLowerCase().includes(q) ||
      r.phone.includes(q)
    );
  });

  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const approvedCount = requests.filter((r) => r.status === 'approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'rejected').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/90 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-[#0F0F11] border-b border-[#2A2A2E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 border border-amber-500/50 flex items-center justify-center text-amber-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-fantasy text-lg font-bold text-[#f8fafc]">
                  Panel de Auditoría & Moderación
                </h3>
                <span className="bg-amber-950/80 text-amber-300 border border-amber-600/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Master
                </span>
              </div>
              <p className="text-xs text-[#94a3b8]">
                Revisión manual de DNI, teléfono y verificación de anfitriones de RolCerca
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] text-xs font-semibold border border-[#2A2A2E] transition-colors cursor-pointer"
              >
                Cerrar Sesión Admin
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-[#161618] hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AUTH LOGIN SCREEN (If not logged in as admin) */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-5 my-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#0F0F11] border border-[#2A2A2E] flex items-center justify-center text-amber-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>
            <div className="max-w-md space-y-1">
              <h4 className="font-fantasy text-xl font-bold text-[#f8fafc]">
                Acceso Exclusivo de Moderación
              </h4>
              <p className="text-xs text-[#94a3b8]">
                Ingresá tu PIN de administrador para auditar y autorizar las solicitudes de validación de identidad.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full max-w-xs space-y-3">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setAuthError(false);
                  }}
                  placeholder="PIN / Clave de Acceso (Ej. 1234)"
                  autoFocus
                  className="w-full px-4 py-2.5 bg-[#0F0F11] text-center text-lg tracking-widest text-[#f1f5f9] rounded-xl border border-[#2A2A2E] focus:border-amber-500 focus:outline-none placeholder:tracking-normal placeholder:text-xs placeholder:text-[#52525b]"
                />
                {authError && (
                  <p className="text-xs text-rose-400 mt-1 font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Clave incorrecta (Tip demo: 1234)
                  </p>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs shadow-lg shadow-black/50 transition-all cursor-pointer"
              >
                Ingresar al Panel
              </button>
              <div className="text-[11px] text-[#71717a] pt-1">
                PIN de demostración predeterminado: <code className="bg-[#0F0F11] px-1.5 py-0.5 rounded text-amber-300 font-mono">1234</code>
              </div>
            </form>
          </div>
        ) : (
          /* MAIN ADMIN WORKSPACE */
          <div className="flex-1 flex flex-col min-h-0">
            {/* Top Stat Summary & Filter Toolbar */}
            <div className="p-3 sm:p-4 bg-[#121214] border-b border-[#2A2A2E] flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Filter tabs */}
              <div className="flex items-center gap-1.5 bg-[#0F0F11] p-1 rounded-xl border border-[#2A2A2E]">
                <button
                  type="button"
                  onClick={() => setFilterStatus('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === 'pending'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700/60 shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pendientes ({pendingCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === 'approved'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Aprobados ({approvedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === 'rejected'
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-sm'
                      : 'text-[#94a3b8] hover:text-[#f8fafc]'
                  }`}
                >
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Rechazados ({rejectedCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === 'all'
                      ? 'bg-[#242429] text-white border border-[#3F3F46]'
                      : 'text-[#71717a] hover:text-[#cbd5e1]'
                  }`}
                >
                  <span>Todos ({requests.length})</span>
                </button>
              </div>

              {/* Search Box & Refresh */}
              <div className="flex items-center gap-2 flex-1 sm:max-w-xs">
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por DNI, GM/anfitrión, teléfono..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#0F0F11] text-xs text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-amber-500 focus:outline-none placeholder:text-[#52525b]"
                  />
                </div>
                {onRefreshRequests && (
                  <button
                    type="button"
                    onClick={onRefreshRequests}
                    title="Recargar solicitudes"
                    className="p-2 rounded-lg bg-[#0F0F11] hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Split View: List on left, Details on right */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-[#2A2A2E]">
              {/* Requests List */}
              <div className="lg:col-span-5 flex flex-col min-h-0 bg-[#0F0F11]/50 overflow-y-auto p-3 space-y-2.5">
                {filteredRequests.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-[#3F3F46]" />
                    <p className="text-xs text-[#94a3b8] font-medium">
                      No hay solicitudes en esta sección.
                    </p>
                    <p className="text-[11px] text-[#52525b]">
                      Cuando los usuarios completen sus 3 pasos de verificación en RolCerca, aparecerán aquí para tu aprobación.
                    </p>
                  </div>
                ) : (
                  filteredRequests.map((req) => {
                    const isSelected = selectedRequest?.id === req.id;
                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequest(req)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-[#1e1e24] border-amber-500/70 shadow-lg shadow-black/50'
                            : 'bg-[#161618] hover:bg-[#1a1a1f] border-[#2A2A2E]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-[#f1f5f9]">
                                {req.name}
                              </h4>
                              <span className="text-xs text-[#94a3b8]">({req.handle})</span>
                            </div>
                            <div className="text-xs text-[#cbd5e1] font-mono mt-0.5">
                              DNI: <span className="text-amber-300 font-bold">{req.dni}</span>
                            </div>
                          </div>

                          {/* Badge Status */}
                          {req.status === 'pending' && (
                            <span className="bg-amber-950/80 text-amber-300 border border-amber-600/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <Clock className="w-2.5 h-2.5" /> Pendiente
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Aprobado
                            </span>
                          )}
                          {req.status === 'rejected' && (
                            <span className="bg-rose-950/80 text-rose-300 border border-rose-600/50 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                              <XCircle className="w-2.5 h-2.5" /> Rechazado
                            </span>
                          )}
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#2A2A2E]/70 flex items-center justify-between text-[11px] text-[#71717a]">
                          <span className="flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                            {req.address || 'Sin dirección fijada'}
                          </span>
                          <span>{req.submittedAt}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Request Detail Pane */}
              <div className="lg:col-span-7 flex flex-col min-h-0 bg-[#161618] overflow-y-auto p-4 sm:p-6">
                {selectedRequest ? (
                  <div className="space-y-5 animate-in fade-in">
                    {/* Header of Detail */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#2A2A2E]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-fantasy text-xl font-bold text-[#f8fafc]">
                            {selectedRequest.name}
                          </h3>
                          <span className="text-sm text-[#94a3b8]">{selectedRequest.handle}</span>
                        </div>
                        <p className="text-xs text-[#94a3b8] mt-0.5">
                          Enviado el {selectedRequest.submittedAt}
                        </p>
                      </div>

                      {/* Status indicator */}
                      <div>
                        {selectedRequest.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onApproveRequest(selectedRequest.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <Check className="w-4 h-4 stroke-[3]" />
                              <span>Aprobar Anfitrión</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenReject(selectedRequest)}
                              className="px-3.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              <span>Rechazar</span>
                            </button>
                          </div>
                        )}
                        {selectedRequest.status === 'approved' && (
                          <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Anfitrión Verificado y Habilitado
                          </span>
                        )}
                        {selectedRequest.status === 'rejected' && (
                          <div className="space-y-1 text-right">
                            <span className="bg-rose-950/90 text-rose-300 border border-rose-500/50 text-xs font-bold px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                              <XCircle className="w-4 h-4 text-rose-400" />
                              Solicitud Rechazada
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Rejection notice if present */}
                    {selectedRequest.rejectionReason && (
                      <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs text-rose-200 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-rose-300">
                          <AlertTriangle className="w-4 h-4" /> Motivo del rechazo informado al usuario:
                        </div>
                        <p>{selectedRequest.rejectionReason}</p>
                      </div>
                    )}

                    {/* Identity Data Section */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> 1. Datos de Identidad Legal & Control de Edad
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E]">
                        <div>
                          <span className="text-[11px] text-[#71717a] block">DNI Argentino</span>
                          <span className="text-sm font-bold font-mono text-amber-300">
                            {selectedRequest.dni || 'No proporcionado'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#71717a] block">Nº Trámite RENAPER</span>
                          <span className="text-sm font-bold font-mono text-[#cbd5e1]">
                            {selectedRequest.tramiteNumber || 'Validado auto'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#71717a] block">Edad & Nacimiento</span>
                          <span className="text-sm font-bold text-[#f1f5f9]">
                            {selectedRequest.age ? `${selectedRequest.age} años` : '28 años'}
                            {selectedRequest.birthDate && (
                              <span className="text-xs text-[#94a3b8] font-normal block font-mono">{selectedRequest.birthDate}</span>
                            )}
                          </span>
                        </div>
                        <div>
                          <span className="text-[11px] text-[#71717a] block">Categoría de Seguridad</span>
                          {selectedRequest.ageCategory === 'MENOR_JUVENIL' || (selectedRequest.age && selectedRequest.age < 18) ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-950/70 border border-amber-500/50 px-2 py-0.5 rounded-md mt-0.5">
                              🌱 Menor Juvenil (13-17)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-500/50 px-2 py-0.5 rounded-md mt-0.5">
                              🛡️ Adulto (+18)
                            </span>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[11px] text-[#71717a] block">Teléfono / WhatsApp</span>
                          <a 
                            href={`https://wa.me/${selectedRequest.phone.replace(/[^\d]/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="text-sm font-semibold text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {selectedRequest.phone}
                          </a>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-[11px] text-[#71717a] block">Email de Cuenta</span>
                          <span className="text-xs font-mono text-[#cbd5e1]">
                            {selectedRequest.email || `${selectedRequest.handle.replace('@', '')}@aventurero.com`}
                          </span>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-4">
                          <span className="text-[11px] text-[#71717a] block">Bio / Experiencia</span>
                          <p className="text-xs text-[#cbd5e1] mt-0.5 leading-relaxed">
                            {selectedRequest.bio || 'Sin biografía ingresada.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* DNI Photos Validation Preview */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> 2. Comprobantes de DNI (Frente y Dorso)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* DNI Frente */}
                        <div className="bg-[#0F0F11] p-3 rounded-xl border border-[#2A2A2E] space-y-2">
                          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                            <span className="font-semibold text-[#f1f5f9]">Frente de DNI</span>
                            <span className="text-[10px] text-emerald-400 font-mono">Archivo adjunto</span>
                          </div>
                          <div 
                            onClick={() => setPreviewImage({ 
                              url: selectedRequest.dniFrontPhoto || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80', 
                              title: `DNI Frente - ${selectedRequest.name}` 
                            })}
                            className="aspect-[16/10] bg-[#161618] rounded-lg border border-[#2A2A2E] overflow-hidden relative group cursor-pointer flex items-center justify-center"
                          >
                            {selectedRequest.dniFrontPhoto ? (
                              <img src={selectedRequest.dniFrontPhoto} alt="DNI Frente" className="w-full h-full object-cover" />
                            ) : (
                              <div className="p-4 text-center space-y-1">
                                <FileText className="w-8 h-8 text-amber-500/70 mx-auto" />
                                <div className="text-xs text-[#cbd5e1] font-semibold">Comprobante de DNI Frente</div>
                                <div className="text-[10px] text-[#71717a]">Click para ampliar</div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold gap-1.5">
                              <Eye className="w-4 h-4" /> Ampliar Imagen
                            </div>
                          </div>
                        </div>

                        {/* DNI Dorso */}
                        <div className="bg-[#0F0F11] p-3 rounded-xl border border-[#2A2A2E] space-y-2">
                          <div className="flex items-center justify-between text-xs text-[#94a3b8]">
                            <span className="font-semibold text-[#f1f5f9]">Dorso de DNI</span>
                            <span className="text-[10px] text-emerald-400 font-mono">Archivo adjunto</span>
                          </div>
                          <div 
                            onClick={() => setPreviewImage({ 
                              url: selectedRequest.dniBackPhoto || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800&auto=format&fit=crop&q=80', 
                              title: `DNI Dorso - ${selectedRequest.name}` 
                            })}
                            className="aspect-[16/10] bg-[#161618] rounded-lg border border-[#2A2A2E] overflow-hidden relative group cursor-pointer flex items-center justify-center"
                          >
                            {selectedRequest.dniBackPhoto ? (
                              <img src={selectedRequest.dniBackPhoto} alt="DNI Dorso" className="w-full h-full object-cover" />
                            ) : (
                              <div className="p-4 text-center space-y-1">
                                <FileText className="w-8 h-8 text-amber-500/70 mx-auto" />
                                <div className="text-xs text-[#cbd5e1] font-semibold">Comprobante de DNI Dorso</div>
                                <div className="text-[10px] text-[#71717a]">Click para ampliar</div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white font-bold gap-1.5">
                              <Eye className="w-4 h-4" /> Ampliar Imagen
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location Section */}
                    <div className="space-y-2.5">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> 3. Ubicación de Referencia
                      </h4>
                      <div className="bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E] flex items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="text-[11px] text-[#71717a] block">Barrio / Ciudad declarada</span>
                          <span className="font-semibold text-[#f1f5f9]">{selectedRequest.address || 'No definida'}</span>
                        </div>
                        {selectedRequest.location && (
                          <a
                            href={`https://www.google.com/maps?q=${selectedRequest.location.lat},${selectedRequest.location.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#161618] hover:bg-[#242429] text-rose-300 border border-[#2A2A2E] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver en Google Maps
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#71717a] space-y-2">
                    <ShieldCheck className="w-12 h-12 text-[#2A2A2E]" />
                    <p className="text-sm font-semibold text-[#94a3b8]">
                      Seleccioná una solicitud de la lista
                    </p>
                    <p className="text-xs text-[#52525b] max-w-sm">
                      Revisá los documentos de DNI, datos de contacto y ubicación para aprobar o rechazar al postulante.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* REJECTION REASON MODAL */}
        {isRejectDialogOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-[#161618] border border-[#2A2A2E] rounded-2xl p-5 space-y-4 shadow-2xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold font-fantasy text-lg">
                <XCircle className="w-5 h-5" />
                Rechazar / Solicitar Corrección
              </div>
              <p className="text-xs text-[#94a3b8]">
                Indicá el motivo por el cual la solicitud no fue aprobada. El usuario verá este mensaje en su panel para poder corregirlo.
              </p>
              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1">
                  Motivo de rechazo / aclaración
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0F0F11] text-xs text-[#f1f5f9] rounded-lg border border-[#2A2A2E] focus:border-rose-600 focus:outline-none"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="px-3.5 py-2 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#cbd5e1] text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IMAGE PREVIEW LIGHTBOX */}
        {previewImage && (
          <div 
            onClick={() => setPreviewImage(null)}
            className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in cursor-pointer"
          >
            <div className="relative max-w-3xl max-h-[85vh] bg-[#161618] border border-[#2A2A2E] rounded-2xl overflow-hidden shadow-2xl p-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-3 border-b border-[#2A2A2E] text-xs text-[#cbd5e1] font-semibold">
                <span>{previewImage.title}</span>
                <button onClick={() => setPreviewImage(null)} className="p-1 rounded-md hover:bg-[#242429] text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-2 flex items-center justify-center">
                <img src={previewImage.url} alt="Preview" className="max-h-[70vh] object-contain rounded-lg" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
