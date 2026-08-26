import React from 'react';
import { 
  ShieldCheck, 
  Store, 
  Home, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronRight, 
  Dice5,
  Lock,
  Coins
} from 'lucide-react';
import { TableSession, AppUser } from '../types';

interface TableCardProps {
  table: TableSession;
  isSelected: boolean;
  currentUser: AppUser | null;
  onSelect: (table: TableSession) => void;
  onOpenDetail: (table: TableSession) => void;
  onOpenJoin?: (table: TableSession) => void;
  onBlockedMinorClick?: () => void;
  onRequestAuth?: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({
  table,
  isSelected,
  currentUser,
  onSelect,
  onOpenDetail,
}) => {
  const isStore = table.venueType === 'store' || table.venueType === 'club_public';
  const isPrivateHome = table.venueType === 'private_home';
  const availableSlots = table.slotsTotal - table.slotsTaken;
  const isFull = availableSlots <= 0;

  // Minor Security Rule
  const isUserMinor = currentUser?.role === 'minor' || currentUser?.ageCategory === 'MENOR_JUVENIL';
  const isBlockedForMinor = isUserMinor && isPrivateHome;

  const handleCardClick = () => {
    onSelect(table);
    onOpenDetail(table);
  };

  return (
    <div
      id={`table-card-${table.id}`}
      onClick={handleCardClick}
      className={`group relative rounded-xl p-3.5 sm:p-4 transition-all duration-200 border cursor-pointer flex flex-col justify-between gap-2.5 ${
        isSelected
          ? 'bg-[#1a171c] border-[#800020] shadow-lg shadow-black/60 ring-1 ring-[#800020]/80'
          : 'bg-[#161618] hover:bg-[#1a1a1e] border-[#2A2A2E] hover:border-[#3f3f46] shadow-sm'
      }`}
    >
      {/* Top Meta Badges Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Game System Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#0F0F11] text-amber-300 border border-amber-500/30">
            <Dice5 className="w-3 h-3 text-amber-400" />
            <span>{table.system}</span>
          </span>

          {/* Venue Type Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border ${
              isStore
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-[#1f1a18] text-amber-200/90 border-amber-500/30'
            }`}
          >
            {isStore ? (
              <>
                <Store className="w-3 h-3 text-emerald-400" />
                <span>Local</span>
              </>
            ) : (
              <>
                <Home className="w-3 h-3 text-amber-400" />
                <span>Particular</span>
              </>
            )}
          </span>

          {/* Minor Safety Tag */}
          {isBlockedForMinor && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/50">
              <Lock className="w-2.5 h-2.5" />
              <span>Solo +18</span>
            </span>
          )}
        </div>

        {/* Available Slots Badge */}
        <div className="flex items-center gap-1">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
              isFull
                ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>{isFull ? 'Completa' : `${availableSlots} ${availableSlots === 1 ? 'libre' : 'libres'}`}</span>
          </span>
        </div>
      </div>

      {/* Title & Setting */}
      <div className="min-w-0">
        <h3 className="font-fantasy text-sm sm:text-base font-bold text-[#f8fafc] group-hover:text-rose-400 transition-colors leading-snug line-clamp-1">
          {table.title}
        </h3>
        {table.setting && (
          <p className="text-[11px] text-[#94a3b8] truncate mt-0.5">
            {table.setting} • {table.levelRequired}
          </p>
        )}
      </div>

      {/* Essential Bottom Info Row */}
      <div className="pt-2 border-t border-[#232327] flex items-center justify-between gap-2 text-xs text-[#cbd5e1]">
        {/* Left: Location & Day */}
        <div className="flex items-center gap-3 min-w-0 overflow-hidden text-[11px] sm:text-xs">
          <div className="flex items-center gap-1 text-[#94a3b8] truncate" title={table.zone}>
            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
            <span className="truncate text-[#e2e8f0] font-medium">{table.zone}</span>
          </div>

          <div className="flex items-center gap-1 text-[#94a3b8] shrink-0" title={`${table.schedule.dayOfWeek} ${table.schedule.time}`}>
            <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>{table.schedule.dayOfWeek} {table.schedule.time}</span>
          </div>
        </div>

        {/* Right: DM info & Cost / Action Cue */}
        <div className="flex items-center gap-2 shrink-0">
          {table.costPerSession && table.costPerSession !== 'Gratis' && table.costPerSession !== '$0' && table.costPerSession !== '0' ? (
            <span className="text-[11px] font-semibold text-amber-300 flex items-center gap-0.5">
              <Coins className="w-3 h-3" />
              <span>{table.costPerSession.startsWith('$') ? table.costPerSession : `$${table.costPerSession}`}</span>
            </span>
          ) : (
            <span className="text-[11px] font-medium text-emerald-400">
              Gratis
            </span>
          )}

          <div className="flex items-center gap-1 pl-1 text-[11px] font-semibold text-rose-300 group-hover:text-rose-400 transition-colors">
            <span className="hidden sm:inline">Ver</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
};

