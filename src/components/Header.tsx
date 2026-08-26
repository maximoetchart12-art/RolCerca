import React from 'react';
import { 
  Compass, 
  MapPin, 
  PlusCircle, 
  ShieldCheck, 
  ShieldAlert,
  SlidersHorizontal, 
  Sparkles, 
  Store, 
  Home, 
  Search, 
  Scroll, 
  Users, 
  X, 
  Dice5,
  CalendarCheck,
  UserCheck,
  UserPlus,
  User as UserIcon,
  Crown,
  LogOut
} from 'lucide-react';
import { FilterState, AppUser, UserRole } from '../types';
import { RolCercaLogo } from './RolCercaLogo';

interface HeaderProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  onOpenPublishModal: () => void;
  onOpenSafetyGuide: () => void;
  onOpenApplications: () => void;
  onOpenProfile: () => void;
  onOpenRegisterModal: () => void;
  onOpenAdmin?: () => void;
  onLogout?: () => void;
  pendingRequestsCount?: number;
  applicationsCount: number;
  totalTablesCount: number;
  filteredCount: number;
  viewMode: 'split' | 'list' | 'map';
  onViewModeChange: (mode: 'split' | 'list' | 'map') => void;
  isProfileVerified: boolean;
  currentUser: AppUser | null;
}

export const Header: React.FC<HeaderProps> = ({
  filters,
  onFilterChange,
  onOpenPublishModal,
  onOpenSafetyGuide,
  onOpenApplications,
  onOpenProfile,
  onOpenRegisterModal,
  onOpenAdmin,
  onLogout,
  pendingRequestsCount = 0,
  applicationsCount,
  totalTablesCount,
  filteredCount,
  viewMode,
  onViewModeChange,
  isProfileVerified,
  currentUser,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  const systemsList = [
    'Todos',
    'D&D 5e',
    'D&D 2024',
    'Pathfinder 2e',
    'Call of Cthulhu',
    'Vampiro: La Mascarada',
    'Cyberpunk RED',
    'Sistemas Indie',
  ];

  const distanceRadiuses = [
    { value: null, label: 'Cualquier distancia' },
    { value: 5, label: 'A menos de 5 km' },
    { value: 10, label: 'A menos de 10 km' },
    { value: 25, label: 'A menos de 25 km' },
    { value: 50, label: 'A menos de 50 km' },
  ];

  const hasActiveFilters = 
    filters.searchQuery !== '' || 
    filters.region !== 'all' || 
    filters.maxDistanceKm !== null || 
    filters.venueType !== 'all' || 
    filters.system !== 'all' || 
    filters.experienceLevel !== 'all' || 
    filters.availableOnly;

  const resetFilters = () => {
    onFilterChange({
      searchQuery: '',
      region: 'all',
      maxDistanceKm: null,
      venueType: 'all',
      system: 'all',
      experienceLevel: 'all',
      availableOnly: false,
      dayType: 'all',
    });
  };

  const isUserMinor = currentUser?.ageCategory === 'MENOR_JUVENIL';

  return (
    <header className="border-b border-[#2A2A2E] bg-[#0F0F11]/95 backdrop-blur sticky top-0 z-30 transition-all">
      {/* Top Navbar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={onOpenProfile}
            title={currentUser ? "Mi Perfil" : "Iniciar sesión o Registrarse"}
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-gradient-to-br from-[#800020] via-[#4c0519] to-[#161618] flex items-center justify-center shadow-lg shadow-black/60 border border-[#800020]/70 relative cursor-pointer hover:scale-105 transition-transform group p-1.5"
          >
            <RolCercaLogo className="w-full h-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)] transition-transform group-hover:rotate-6" />
            {currentUser && !isProfileVerified && (
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border border-[#0F0F11]"></span>
              </span>
            )}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-fantasy text-lg sm:text-2xl font-bold tracking-wider text-[#f8fafc] flex items-center">
                Rol<span className="text-[#e11d48]">Cerca</span>
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-[#cbd5e1] font-medium tracking-tight">
              Encontrá tu mesa presencial
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* User Status / Register / Login */}
          {!currentUser ? (
            <button
              id="btn-open-register"
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-[#800020]/30 hover:from-amber-500/30 hover:to-[#800020]/50 text-amber-200 border border-amber-500/40 text-xs font-semibold transition-all cursor-pointer hover:scale-[1.02] shadow-sm"
              title="Registrarme con DNI y validación de edad"
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>Registrarme con DNI</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id="btn-active-user-badge"
                onClick={onOpenProfile}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer hover:opacity-90 ${
                  isUserMinor
                    ? 'bg-amber-950/70 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
                    : 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                }`}
                title="Ver mi perfil"
              >
                {isUserMinor ? (
                  <>
                    <span>🌱</span>
                    <span className="truncate max-w-[120px]">{currentUser.handle || currentUser.name}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[120px]">{currentUser.handle || currentUser.name}</span>
                  </>
                )}
              </button>

              {onLogout && (
                <button
                  id="btn-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1 p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-[#161618] hover:bg-[#27272a] text-[#a1a1aa] hover:text-rose-400 text-xs border border-[#2A2A2E] transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Salir</span>
                </button>
              )}
            </div>
          )}

          {/* Applications Button */}
          <button
            id="btn-my-applications"
            onClick={onOpenApplications}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#161618] hover:bg-[#1f1f24] text-[#e2e8f0] text-xs font-medium border border-[#2A2A2E] transition-colors relative cursor-pointer"
            title="Ver mis solicitudes a mesas"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Solicitudes</span>
            {applicationsCount > 0 && (
              <span className="bg-[#800020] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#991b1b]/80">
                {applicationsCount}
              </span>
            )}
          </button>

          {/* Safety Guide Button */}
          <button
            id="btn-safety-guide"
            onClick={onOpenSafetyGuide}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#161618] hover:bg-[#1f1f24] text-emerald-400 text-xs font-medium border border-emerald-900/50 transition-colors cursor-pointer"
            title="Protocolo de Seguridad"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline">Seguridad</span>
          </button>

          {/* Admin Panel Access Button (Only for moderators or if enabled) */}
          {currentUser?.role === 'moderator' && onOpenAdmin && (
            <button
              id="btn-admin-panel"
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#18181b] hover:bg-[#27272a] text-amber-300 hover:text-amber-200 text-xs font-medium border border-amber-600/40 transition-colors cursor-pointer relative"
              title="Panel de Auditoría y Verificación de Anfitriones"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden xl:inline">Moderación</span>
              {pendingRequestsCount > 0 && (
                <span className="bg-amber-500 text-black text-[10px] font-black px-1.5 py-0.2 rounded-full border border-amber-400 animate-pulse">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
          )}

          {/* Publish Table Button */}
          <button
            id="btn-publish-table"
            onClick={onOpenPublishModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white text-xs font-semibold shadow-lg shadow-black/40 border border-[#991b1b]/70 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5 text-rose-100" />
            <span className="hidden sm:inline">Publicar Mesa</span>
            <span className="sm:hidden">Publicar</span>
          </button>
        </div>
      </div>

      {/* Main Filter & Search Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 bg-[#161618]/90 border-t border-[#2A2A2E]">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Left side: Search Icon + active filters indicator */}
          <div className="flex flex-1 items-center gap-2">
            {!showSearch ? (
              <button 
                onClick={() => setShowSearch(true)} 
                className="p-2 rounded-lg text-[#94a3b8] hover:text-[#f1f5f9] hover:bg-[#242429] transition-colors cursor-pointer flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span className="text-[#6b7280] hidden sm:inline">Buscar mesas...</span>
              </button>
            ) : (
              <div className="relative flex items-center w-full max-w-xs animate-in slide-in-from-left-2 fade-in duration-200">
                <input
                  id="input-search-tables"
                  type="text"
                  autoFocus
                  placeholder="Buscar ciudad, barrio, sistema..."
                  value={filters.searchQuery}
                  onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
                  className="block w-full pl-8 pr-8 py-1.5 bg-[#1e1e24] border border-[#3f3f46] text-[#f8fafc] text-xs rounded-full focus:ring-1 focus:ring-[#800020] focus:border-[#800020] outline-none transition-all"
                />
                <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-3" />
                <button
                  onClick={() => { setShowSearch(false); onFilterChange({ ...filters, searchQuery: '' }) }}
                  className="absolute right-2 p-1 text-[#6b7280] hover:text-[#f8fafc] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {/* Minimalist count / applied filters */}
            {!showSearch && (
              <div className="flex items-center gap-1.5 ml-2">
                <span className="text-[#6b7280] font-medium hidden sm:inline-block">
                  {filteredCount} {filteredCount === 1 ? 'mesa' : 'mesas'}
                </span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" title="Filtros aplicados"></span>
                )}
              </div>
            )}
          </div>

          {/* Right side: View controls & Filters toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-[#0F0F11] p-0.5 rounded-lg border border-[#2A2A2E] hidden sm:flex">
              <button
                id="view-btn-split"
                onClick={() => onViewModeChange('split')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'split'
                    ? 'bg-[#800020] text-white font-semibold shadow'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
                title="Vista dividida de mapa y lista"
              >
                Dividido
              </button>
              <button
                id="view-btn-list"
                onClick={() => onViewModeChange('list')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-[#800020] text-white font-semibold shadow'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
                title="Solo lista de mesas"
              >
                Lista
              </button>
              <button
                id="view-btn-map"
                onClick={() => onViewModeChange('map')}
                className={`px-2 py-1 rounded text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'map'
                    ? 'bg-[#800020] text-white font-semibold shadow'
                    : 'text-[#94a3b8] hover:text-[#f1f5f9]'
                }`}
                title="Solo mapa de Argentina"
              >
                Mapa
              </button>
            </div>
            
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-[#242429] border-[#800020] text-rose-400'
                  : 'bg-[#0F0F11] border-[#2A2A2E] text-[#94a3b8] hover:text-[#f1f5f9]'
              }`}
              title="Filtros"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Filtros</span>
            </button>
          </div>
        </div>

        {/* Expanded Filters Drawer */}
        {showAdvancedFilters && (
          <div className="mt-3 pt-3 border-t border-[#2A2A2E] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs animate-in fade-in duration-150">
            {/* System Selector */}
            <div>
              <label className="text-[#94a3b8] block mb-1 font-medium">Sistema de juego:</label>
              <select
                value={filters.system}
                onChange={(e) => onFilterChange({ ...filters, system: e.target.value })}
                className="w-full bg-[#0F0F11] text-[#e2e8f0] rounded-md border border-[#2A2A2E] px-2.5 py-1.5 focus:outline-none focus:border-[#800020]"
              >
                {systemsList.map((s) => (
                  <option key={s} value={s}>{s === 'Todos' ? 'Todos los Sistemas' : s}</option>
                ))}
              </select>
            </div>

            {/* Venue Type */}
            <div>
              <label className="text-[#94a3b8] block mb-1 font-medium">Tipo de lugar:</label>
              <select
                value={filters.venueType}
                onChange={(e) => onFilterChange({ ...filters, venueType: e.target.value })}
                className="w-full bg-[#0F0F11] text-[#e2e8f0] rounded-md border border-[#2A2A2E] px-2.5 py-1.5 focus:outline-none focus:border-[#800020]"
              >
                <option value="all">Todas las mesas</option>
                <option value="store">Públicas (Tiendas/Clubes)</option>
                <option value="private_home">Privadas (Casas +18)</option>
              </select>
            </div>

            {/* Distance Radius */}
            <div>
              <label className="text-[#94a3b8] block mb-1 font-medium">Radio de distancia:</label>
              <select
                value={filters.maxDistanceKm === null ? '' : filters.maxDistanceKm}
                onChange={(e) => 
                  onFilterChange({ 
                    ...filters, 
                    maxDistanceKm: e.target.value === '' ? null : Number(e.target.value) 
                  })
                }
                className="w-full bg-[#0F0F11] text-[#e2e8f0] rounded-md border border-[#2A2A2E] px-2.5 py-1.5 focus:outline-none focus:border-[#800020]"
              >
                {distanceRadiuses.map((d, i) => (
                  <option key={i} value={d.value === null ? '' : d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-[#94a3b8] block mb-1 font-medium">Nivel de experiencia:</label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => onFilterChange({ ...filters, experienceLevel: e.target.value })}
                className="w-full bg-[#0F0F11] text-[#e2e8f0] rounded-md border border-[#2A2A2E] px-2.5 py-1.5 focus:outline-none focus:border-[#800020]"
              >
                <option value="all">Todos los niveles</option>
                <option value="Apto Principiantes">Apto Principiantes</option>
                <option value="Nivel Medio">Nivel Medio</option>
                <option value="Veteranos">Veteranos / Complejas</option>
              </select>
            </div>

            {/* Available Only Checkbox */}
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer py-1.5 px-2 bg-[#0F0F11] rounded-md border border-[#2A2A2E] w-full hover:border-[#3f3f46]">
                <input
                  type="checkbox"
                  checked={filters.availableOnly}
                  onChange={(e) => onFilterChange({ ...filters, availableOnly: e.target.checked })}
                  className="rounded border-[#3f3f46] text-[#800020] focus:ring-[#800020] h-4 w-4 bg-[#161618]"
                />
                <span className="text-[#cbd5e1] font-medium truncate">Solo cupos libres</span>
              </label>
            </div>

            {/* Reset Button */}
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                disabled={!hasActiveFilters}
                className={`w-full py-1.5 px-3 rounded-md font-medium text-center transition-all ${
                  hasActiveFilters
                    ? 'bg-[#242429] hover:bg-[#2d2d34] text-rose-300 border border-[#3f3f46] cursor-pointer'
                    : 'bg-[#0F0F11] text-[#52525b] border border-[#2A2A2E] cursor-not-allowed'
                }`}
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
