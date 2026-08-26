import React from 'react';
import { 
  X, 
  CalendarCheck, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Clock3, 
  Dice5, 
  ChevronRight, 
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { JoinApplication, TableSession } from '../types';

interface MyApplicationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JoinApplication[];
  tables: TableSession[];
  onOpenTableDetail: (table: TableSession) => void;
}

export const MyApplicationsDrawer: React.FC<MyApplicationsDrawerProps> = ({
  isOpen,
  onClose,
  applications,
  tables,
  onOpenTableDetail,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#0F0F11]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="applications-drawer"
        className="w-full max-w-md h-full bg-[#161618] border-l border-[#2A2A2E] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#0F0F11] border-b border-[#2A2A2E] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#d97706]/30 border border-amber-600/50 flex items-center justify-center text-amber-300">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-fantasy text-base font-bold text-[#f8fafc]">
                Mis Solicitudes a Mesas
              </h3>
              <p className="text-xs text-[#94a3b8]">
                {applications.length} {applications.length === 1 ? 'postulación activa' : 'postulaciones activas'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-[#161618] hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {applications.length === 0 ? (
            <div className="py-12 text-center text-[#71717a] space-y-2">
              <Dice5 className="w-10 h-10 mx-auto text-[#52525b] animate-pulse" />
              <p className="text-sm font-semibold text-[#cbd5e1]">
                Aún no te postulaste a ninguna mesa
              </p>
              <p className="text-xs text-[#71717a] max-w-xs mx-auto">
                Explorá el mapa y enviá una solicitud a una mesa de D&D o rol presencial en tu zona.
              </p>
            </div>
          ) : (
            applications.map((app) => {
              const matchedTable = tables.find((t) => t.id === app.tableId);

              return (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl bg-[#0F0F11]/80 border border-[#2A2A2E] space-y-2.5 hover:border-[#800020]/50 transition-colors"
                >
                  {/* Top Status */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#d97706]/20 text-amber-300 border border-amber-700/50">
                      <Clock3 className="w-3 h-3" />
                      <span>Pendiente de respuesta del GM</span>
                    </span>
                    <span className="text-[10px] text-[#71717a]">{app.appliedAt}</span>
                  </div>

                  {/* Table Info */}
                  {matchedTable && (
                    <div>
                      <h4 className="font-fantasy font-bold text-[#f8fafc] text-sm leading-snug">
                        {matchedTable.title}
                      </h4>
                      <div className="text-xs text-[#94a3b8] mt-0.5 flex items-center gap-1.5">
                        <span className="text-rose-400 font-semibold">{matchedTable.system}</span>
                        <span>•</span>
                        <span className="text-[#cbd5e1]">{matchedTable.zone}</span>
                        <span>•</span>
                        <span>GM: {matchedTable.dm.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Submitted Pitch */}
                  <div className="p-2.5 rounded-lg bg-[#161618] border border-[#2A2A2E] text-xs text-[#cbd5e1] space-y-1">
                    <span className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider block">
                      Tu propuesta de personaje:
                    </span>
                    <p className="italic text-[#f1f5f9] text-xs">
                      "{app.characterConcept}" ({app.preferredRole})
                    </p>
                  </div>

                  {/* Action */}
                  {matchedTable && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTableDetail(matchedTable);
                      }}
                      className="w-full py-1.5 px-3 rounded-lg bg-[#242429] hover:bg-[#2e2e36] text-[#f1f5f9] text-xs font-semibold border border-[#2A2A2E] flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Ver Ficha de la Mesa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 bg-[#0F0F11] border-t border-[#2A2A2E] text-center text-xs text-[#71717a]">
          Las solicitudes son evaluadas por los GMs según compatibilidad del grupo.
        </div>
      </div>
    </div>
  );
};
