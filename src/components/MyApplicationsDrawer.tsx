import React, { useState } from 'react';
import { 
  X, 
  CalendarCheck, 
  Clock3, 
  Dice5, 
  ChevronRight, 
  MessageSquare,
  UserCheck,
  Crown,
  Trash2,
  Mail,
  Phone
} from 'lucide-react';
import { JoinApplication, TableSession, AppUser } from '../types';
import { db } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

interface MyApplicationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  applications: JoinApplication[];
  tables: TableSession[];
  currentUser: AppUser | null;
  onOpenTableDetail: (table: TableSession) => void;
}

export const MyApplicationsDrawer: React.FC<MyApplicationsDrawerProps> = ({
  isOpen,
  onClose,
  applications,
  tables,
  currentUser,
  onOpenTableDetail,
}) => {
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  if (!isOpen) return null;

  // Filter Sent Apps (Applications the user made)
  const sentApps = applications.filter(app => 
    app.playerId === currentUser?.id || app.playerEmail === currentUser?.email
  );

  // Filter Received Apps (Applications made TO tables owned by the user)
  const myTableIds = tables.filter(t => t.dmId === currentUser?.id || t.dmName === currentUser?.name).map(t => t.id);
  const receivedApps = applications.filter(app => myTableIds.includes(app.tableId));

  const displayApps = activeTab === 'sent' ? sentApps : receivedApps;

  const handleDeleteApplication = async (appId: string) => {
    if (window.confirm('¿Seguro que querés eliminar esta solicitud?')) {
      try {
        await deleteDoc(doc(db, 'applications', appId));
      } catch (e) {
        console.error("Error al eliminar postulación", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-[#0F0F11]/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="applications-drawer"
        className="w-full max-w-md h-full bg-[#161618] border-l border-[#2A2A2E] shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-[#0F0F11] border-b border-[#2A2A2E] flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#d97706]/30 border border-amber-600/50 flex items-center justify-center text-amber-300">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-fantasy text-base font-bold text-[#f8fafc]">
                  Gestión de Postulaciones
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#161618] hover:bg-[#242429] text-[#94a3b8] hover:text-white border border-[#2A2A2E] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#161618] p-1 rounded-xl border border-[#2A2A2E]">
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'sent' ? 'bg-[#2A2A2E] text-white shadow' : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              Enviadas ({sentApps.length})
            </button>
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'received' ? 'bg-[#2A2A2E] text-white shadow' : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              Recibidas ({receivedApps.length})
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5">
          {displayApps.length === 0 ? (
            <div className="py-12 text-center text-[#71717a] space-y-2">
              <Dice5 className="w-10 h-10 mx-auto text-[#52525b] animate-pulse" />
              <p className="text-sm font-semibold text-[#cbd5e1]">
                {activeTab === 'sent' 
                  ? 'Aún no te postulaste a ninguna mesa' 
                  : 'Aún no recibiste postulaciones en tus mesas'}
              </p>
            </div>
          ) : (
            displayApps.map((app) => {
              const matchedTable = tables.find((t) => t.id === app.tableId);
              return (
                <div key={app.id} className="bg-[#1C1C1F] border border-[#2A2A2E] rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteApplication(app.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      title="Eliminar postulación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {activeTab === 'sent' ? (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-[#d97706] mb-0.5">Postulación Enviada</p>
                          <h4 className="font-bold text-[#f8fafc] text-sm">
                            {matchedTable ? matchedTable.title : 'Mesa Desconocida'}
                          </h4>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-[#94a3b8]">
                        <div className="flex items-center gap-1.5">
                          <Clock3 className="w-3.5 h-3.5" />
                          <span>{app.appliedAt}</span>
                        </div>
                        {matchedTable && (
                          <div className="flex items-center gap-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-500/70" />
                            <span>GM {matchedTable.dm?.name || matchedTable.dmName}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-1 bg-[#161618] border border-[#2A2A2E] p-3 rounded-lg text-[#cbd5e1] text-xs italic flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 text-[#52525b]" shrink-0 />
                        <span className="line-clamp-2">"{app.messageToGM}"</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-semibold text-emerald-500 mb-0.5">Nueva Solicitud: {matchedTable?.title}</p>
                          <h4 className="font-bold text-[#f8fafc] text-sm flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-[#94a3b8]" />
                            {app.playerName}
                          </h4>
                        </div>
                      </div>
                      
                      <div className="bg-[#161618] p-3 rounded-lg border border-[#2A2A2E] text-xs space-y-2 text-[#cbd5e1]">
                        <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#71717a]"/> {app.playerEmail}</p>
                        <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#71717a]"/> {app.playerPhone}</p>
                        {app.characterConcept && (
                          <div className="pt-2 mt-2 border-t border-[#2A2A2E]">
                            <p className="text-[#71717a] font-semibold mb-1 flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5"/> Personaje / Mensaje:</p>
                            <p className="italic">"{app.messageToGM || app.characterConcept}"</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {matchedTable && activeTab === 'sent' && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenTableDetail(matchedTable);
                      }}
                      className="mt-1 flex items-center justify-center gap-1.5 w-full py-2 bg-[#2A2A2E] hover:bg-[#3f3f46] text-[#e2e8f0] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Ver Mesa <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
