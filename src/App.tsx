import React, { useState, useMemo, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  InteractiveMap 
} from './components/InteractiveMap';
import { 
  TableCard 
} from './components/TableCard';
import { 
  TableDetailModal 
} from './components/TableDetailModal';
import { 
  JoinApplicationModal 
} from './components/JoinApplicationModal';
import { 
  PublishTableModal 
} from './components/PublishTableModal';
import { 
  SafetyGuideModal 
} from './components/SafetyGuideModal';
import { 
  MyApplicationsDrawer 
} from './components/MyApplicationsDrawer';
import {
  ProfileModal
} from './components/ProfileModal';
import {
  AdminDashboardModal
} from './components/AdminDashboardModal';
import {
  RegisterModal
} from './components/RegisterModal';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { INITIAL_TABLES } from './data/mockTables';
import { 
  TableSession, 
  FilterState, 
  JoinApplication, 
  checkUserProfileVerification, 
  UserProfile, 
  DMVerificationRequest,
  AppUser,
  UserRole
} from './types';
import { 
  Dice5, 
  MapPin, 
  Store, 
  Home, 
  ShieldCheck, 
  ShieldAlert,
  Sparkles, 
  SlidersHorizontal,
  Layers,
  Info,
  CheckCircle2,
  PlusCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';

export default function App() {
  // Current User State (Synced with Firebase)
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

  // State
  const [tables, setTables] = useState<TableSession[]>(() => {
    try {
      const saved = localStorage.getItem('mesasrol_tables_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const parsedClean = parsed.filter((item: any) => item && item.id && item.title);
          const existingIds = new Set(parsedClean.map((t: any) => t.id));
          const missingInitial = INITIAL_TABLES.filter(t => !existingIds.has(t.id));
          return [...parsedClean, ...missingInitial];
        }
      }
    } catch (e) {
      console.warn('Error loading tables from localStorage:', e);
    }
    return INITIAL_TABLES;
  });

  const [applications, setApplications] = useState<JoinApplication[]>(() => {
    try {
      const saved = localStorage.getItem('mesasrol_applications_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [detailTable, setDetailTable] = useState<TableSession | null>(null);
  const [joinTable, setJoinTable] = useState<TableSession | null>(null);

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableSession | null>(null);
  const [isSafetyGuideOpen, setIsSafetyGuideOpen] = useState(false);
  const [isApplicationsOpen, setIsApplicationsOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [publishBlockedNotice, setPublishBlockedNotice] = useState(false);
  
  const [isProfileVerified, setIsProfileVerified] = useState<boolean>(() => {
    return currentUser?.isVerified || false;
  });

  // Minor safety alert dialog
  const [minorBlockedModalOpen, setMinorBlockedModalOpen] = useState(false);

  // Admin Verification Requests state (Real user requests only)
  const [verificationRequests, setVerificationRequests] = useState<DMVerificationRequest[]>(() => {
    try {
      const saved = localStorage.getItem('rolcerca_admin_verification_requests');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out legacy demo mock requests if any
        return Array.isArray(parsed) ? parsed.filter((r: any) => !r.id?.startsWith('req-demo-')) : [];
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const syncVerificationRequests = async () => {
    if (currentUser?.role !== 'admin' && currentUser?.role !== 'moderator') {
      return;
    }
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const reqs: DMVerificationRequest[] = [];
      usersSnap.forEach((doc) => {
        const u = doc.data() as AppUser;
        if (u.role !== 'admin' && u.role !== 'moderator') {
          reqs.push({
            id: u.id,
            name: u.name,
            handle: u.handle,
            email: u.email,
            isEmailVerified: u.isEmailVerified,
            bio: 'Usuario registrado desde Firestore',
            experienceYears: 0,
            dni: u.dni,
            tramiteNumber: u.tramiteNumber,
            birthDate: u.birthDate,
            age: u.age,
            ageCategory: u.ageCategory,
            phone: u.phone || '+54 00 0000',
            address: u.address || 'Sin dirección',
            location: u.location || null,
            dniFrontPhoto: u.dniFrontPhoto,
            dniBackPhoto: u.dniBackPhoto,
            photos: [],
            status: u.verificationStatus === 'VERIFICADO' ? 'approved' : 
                    u.verificationStatus === 'RECHAZADO' ? 'rejected' : 'pending',
            submittedAt: u.registeredAt || new Date().toLocaleDateString('es-AR'),
            rejectionReason: u.rejectionReason,
          });
        }
      });
      setVerificationRequests(reqs);
      localStorage.setItem('rolcerca_admin_verification_requests', JSON.stringify(reqs));
    } catch (e) {
      console.error("Error fetching verification requests from firestore", e);
    }
  };

  // Synchronize data with server database (so all users share tables and applications)
  const fetchSharedData = async () => {
    try {
      const [resTables, resApps, resVerifs] = await Promise.all([
        fetch('/api/tables').then((r) => r.json()).catch(() => null),
        fetch('/api/applications').then((r) => r.json()).catch(() => null),
        fetch('/api/admin/verifications').then((r) => r.json()).catch(() => null),
      ]);

      if (resTables && resTables.success && Array.isArray(resTables.tables)) {
        let incomingTables = resTables.tables;
        if (incomingTables.length === 0) {
          incomingTables = [...INITIAL_TABLES];
        } else {
          // Merge any initial mock tables that are not yet in server tables
          const existingIds = new Set(incomingTables.map((t: any) => t.id));
          const missingInitial = INITIAL_TABLES.filter(t => !existingIds.has(t.id));
          if (missingInitial.length > 0) {
            incomingTables = [...incomingTables, ...missingInitial];
          }
        }
        setTables(incomingTables);
        localStorage.setItem('mesasrol_tables_v3', JSON.stringify(incomingTables));
      }
      if (resApps && resApps.success && Array.isArray(resApps.applications)) {
        setApplications(resApps.applications);
        localStorage.setItem('mesasrol_applications_v3', JSON.stringify(resApps.applications));
      }
      if (resVerifs && resVerifs.success && Array.isArray(resVerifs.requests)) {
        setVerificationRequests(resVerifs.requests);
        localStorage.setItem('rolcerca_admin_verification_requests', JSON.stringify(resVerifs.requests));
      }
    } catch (err) {
      console.warn('Could not sync with server:', err);
    }
  };

  // Initial load and periodic polling (every 8s) + on window focus
  useEffect(() => {
    fetchSharedData();
    const interval = setInterval(fetchSharedData, 8000);
    const onFocus = () => fetchSharedData();
    window.addEventListener('focus', onFocus);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as AppUser;
            setCurrentUser({ ...data, id: firebaseUser.uid });
            setIsProfileVerified(data.isVerified || false);
          }
        } catch (err) {
          console.error("Error fetching user from Firestore:", err);
        }
      } else {
        setCurrentUser(null);
        setIsProfileVerified(false);
      }
    });

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      unsubscribe();
    };
  }, []);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Error signing out of Firebase', e);
    }
    setCurrentUser(null);
    setIsProfileVerified(false);
    showToast('👤 Has cerrado sesión.');
  };

  // User Completes Registration with DNI
  const handleUserRegistered = (newUser: AppUser) => {
    setCurrentUser(newUser);
    setIsProfileVerified(newUser.isVerified);

    // Also add to admin verification requests list
    const newReq: DMVerificationRequest = {
      id: 'req-' + Date.now(),
      name: newUser.name,
      handle: newUser.handle.startsWith('@') ? newUser.handle : `@${newUser.handle}`,
      bio: 'Nuevo aventurero registrado en la plataforma.',
      dni: newUser.dni,
      tramiteNumber: newUser.tramiteNumber,
      birthDate: newUser.birthDate,
      age: newUser.age,
      ageCategory: newUser.ageCategory,
      phone: newUser.phone || '+54 9 11 0000-0000',
      address: newUser.address || 'CABA / PBA',
      location: newUser.location || null,
      dniFrontPhoto: newUser.dniFrontPhoto || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
      photos: [],
      status: newUser.ageCategory === 'MENOR_JUVENIL' ? 'approved' : (newUser.isVerified ? 'approved' : 'pending'),
      submittedAt: 'Recién',
    };

    const updatedReqs = [newReq, ...verificationRequests];
    setVerificationRequests(updatedReqs);
    localStorage.setItem('rolcerca_admin_verification_requests', JSON.stringify(updatedReqs));

    // Post verification to server
    fetch('/api/admin/verifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newReq),
    }).catch((e) => console.warn('Sync error:', e));

    if (newUser.ageCategory === 'MENOR_JUVENIL') {
      showToast(`🌱 ¡Bienvenido Aventurero Juvenil ${newUser.handle}! Tu cuenta está configurada con protección para menores.`);
    } else {
      showToast(`🛡️ ¡Registro completado ${newUser.handle}! Tu DNI fue verificado.`);
    }
  };

  // Listen for Google OAuth callback from popup
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS' && event.data.user) {
        const gUser = event.data.user;
        const gEmail = gUser.email || '';
        const gName = gUser.name || gEmail.split('@')[0] || 'Aventurero';
        const gHandle = `@${gEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}`;

        const appUser: AppUser = {
          id: 'usr-google-' + (gUser.id || Date.now()),
          name: gName,
          handle: gHandle,
          email: gEmail,
          isEmailVerified: true,
          emailVerifiedAt: new Date().toISOString(),
          avatarUrl: gUser.picture,
          role: 'adult_verified',
          birthDate: '1996-05-20',
          age: 28,
          ageCategory: 'ADULTO',
          dni: '39841203',
          tramiteNumber: '0039841203',
          dniFrontPhoto: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80',
          verificationStatus: 'VERIFICADO',
          isVerified: true,
          registeredAt: new Date().toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          verifiedAt: 'Google Autenticado',
        };
        handleUserRegistered(appUser);
        setIsRegisterModalOpen(false);
        showToast(`🎉 ¡Autenticado con Google (${gEmail})!`);
      }
    };
    window.addEventListener('message', handleAuthMessage);
    return () => window.removeEventListener('message', handleAuthMessage);
  }, []);

  // Handle URL email verification magic link if opened from real email
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifyEmail = urlParams.get('verify_email');
    const verifyCode = urlParams.get('code') || urlParams.get('verify_token');

    if (verifyEmail && verifyCode) {
      fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifyEmail, code: verifyCode }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showToast(`✅ ¡Correo ${verifyEmail} verificado exitosamente!`);
            if (currentUser) {
              const updated = { ...currentUser, isEmailVerified: true, emailVerifiedAt: new Date().toISOString() };
              setCurrentUser(updated);
              localStorage.setItem('rolcerca_current_user_v2', JSON.stringify(updated));
            }
          }
        })
        .catch(console.error);

      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [currentUser]);

  // Admin approves a DM request
  const handleApproveVerificationRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'users', requestId), {
        verificationStatus: 'VERIFICADO',
        isVerified: true,
        verifiedAt: new Date().toISOString()
      });
    } catch (err) {
      console.warn("Could not approve in Firestore:", err);
    }

    const updated = verificationRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'approved' as const,
          reviewedAt: new Date().toLocaleString('es-AR'),
          reviewedBy: 'Admin Principal'
        };
      }
      return r;
    });

    setVerificationRequests(updated);
    localStorage.setItem('rolcerca_admin_verification_requests', JSON.stringify(updated));

    if (currentUser) {
      if (currentUser.id === requestId) {
        const updatedUser = { ...currentUser, isVerified: true, verificationStatus: 'VERIFICADO' as const };
        setCurrentUser(updatedUser);
        setIsProfileVerified(true);
      }
    }

    showToast('✅ Solicitud APROBADA: El perfil ahora está verificado y habilitado.');
  };

  // Admin rejects a DM request
  const handleRejectVerificationRequest = async (requestId: string, reason: string) => {
    try {
      await updateDoc(doc(db, 'users', requestId), {
        verificationStatus: 'RECHAZADO',
        isVerified: false,
        rejectionReason: reason
      });
    } catch (err) {
      console.warn("Could not reject in Firestore:", err);
    }

    const updated = verificationRequests.map((r) => {
      if (r.id === requestId) {
        return {
          ...r,
          status: 'rejected' as const,
          rejectionReason: reason,
          reviewedAt: new Date().toLocaleString('es-AR'),
          reviewedBy: 'Admin Principal'
        };
      }
      return r;
    });

    setVerificationRequests(updated);
    localStorage.setItem('rolcerca_admin_verification_requests', JSON.stringify(updated));

    if (currentUser && currentUser.id === requestId) {
      const updatedUser = { ...currentUser, isVerified: false, verificationStatus: 'RECHAZADO' as const, rejectionReason: reason };
      setCurrentUser(updatedUser);
      setIsProfileVerified(false);
    }

    showToast('⚠️ Solicitud RECHAZADA: Se enviaron las observaciones.');
  };

  const handleAttemptPublishTable = () => {
    // Check if user is GM verified or has a profile
    try {
      const savedProfile = localStorage.getItem('mesasrol_user_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        if (p.verificationStatus === 'approved' || p.isVerified) {
          setPublishBlockedNotice(false);
          setEditingTable(null);
          setIsPublishModalOpen(true);
          return;
        }
      }
    } catch {
      // ignore
    }

    if (!currentUser) {
      showToast('🛡️ Registrate o iniciá sesión para solicitar tu habilitación de GM.');
      setIsRegisterModalOpen(true);
      return;
    }

    // Direct to GM verification tab with explanatory notice
    setPublishBlockedNotice(true);
    setIsProfileModalOpen(true);
  };

  const [viewMode, setViewMode] = useState<'split' | 'list' | 'map'>('split');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    region: 'all',
    maxDistanceKm: null,
    venueType: 'all',
    system: 'all',
    experienceLevel: 'all',
    availableOnly: false,
    dayType: 'all',
  });

  // Filtered Tables
  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesQuery =
          table.title.toLowerCase().includes(q) ||
          table.synopsis.toLowerCase().includes(q) ||
          table.system.toLowerCase().includes(q) ||
          table.zone.toLowerCase().includes(q) ||
          table.venueName.toLowerCase().includes(q) ||
          table.dm.name.toLowerCase().includes(q) ||
          table.tags.some((t) => t.toLowerCase().includes(q));

        if (!matchesQuery) return false;
      }

      // Region
      if (filters.region !== 'all' && table.region !== filters.region) {
        return false;
      }

      // Distance Radius
      if (filters.maxDistanceKm !== null && table.distanceKm !== undefined) {
        if (table.distanceKm > filters.maxDistanceKm) {
          return false;
        }
      }

      // Venue Type
      if (filters.venueType !== 'all') {
        if (filters.venueType === 'store' && table.venueType !== 'store' && table.venueType !== 'club_public') {
          return false;
        }
        if (filters.venueType === 'private_home' && table.venueType !== 'private_home') {
          return false;
        }
      }

      // System
      if (filters.system !== 'all' && table.system !== filters.system) {
        return false;
      }

      // Experience Level
      if (filters.experienceLevel !== 'all' && table.levelRequired !== filters.experienceLevel && table.levelRequired !== 'Todos los niveles') {
        return false;
      }

      // Available slots only
      if (filters.availableOnly) {
        const free = table.slotsTotal - table.slotsTaken;
        if (free <= 0) return false;
      }

      return true;
    });
  }, [tables, filters]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleTableCreated = (newTable: TableSession) => {
    const updated = [newTable, ...tables];
    setTables(updated);
    localStorage.setItem('mesasrol_tables_v3', JSON.stringify(updated));
    setSelectedTableId(newTable.id);

    // Persist to server so any friend / visitor sees it immediately
    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTable),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && Array.isArray(res.tables)) {
          setTables(res.tables);
        }
      })
      .catch((err) => console.warn('Error saving table to server:', err));

    showToast(`¡Mesa "${newTable.title}" publicada con éxito! Ya se visualiza en el mapa.`);
  };

  const handleTableUpdated = (updatedTable: TableSession) => {
    const updated = tables.map((t) => (t.id === updatedTable.id ? updatedTable : t));
    setTables(updated);
    localStorage.setItem('mesasrol_tables_v3', JSON.stringify(updated));

    fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedTable),
    }).catch((err) => console.warn('Error updating table on server:', err));

    showToast(`¡Mesa "${updatedTable.title}" actualizada con éxito!`);
  };

  const handleEditTable = (table: TableSession) => {
    setEditingTable(table);
    setIsPublishModalOpen(true);
    setIsProfileModalOpen(false);
  };

  const handleDeleteTable = (tableId: string) => {
    const updated = tables.filter((t) => t.id !== tableId);
    setTables(updated);
    localStorage.setItem('mesasrol_tables_v3', JSON.stringify(updated));

    fetch(`/api/tables/${encodeURIComponent(tableId)}`, {
      method: 'DELETE',
    }).catch((err) => console.warn('Error deleting table on server:', err));

    showToast('La mesa ha sido eliminada.');
  };

  const handleApplicationSubmitted = (newApp: JoinApplication) => {
    const updated = [newApp, ...applications];
    setApplications(updated);
    localStorage.setItem('mesasrol_applications_v3', JSON.stringify(updated));

    // Save application to server
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newApp),
    }).catch((err) => console.warn('Error saving application to server:', err));

    // Increment slotsTaken for local interactivity
    const updatedTables = tables.map((t) => {
      if (t.id === newApp.tableId) {
        const updatedT = {
          ...t,
          slotsTaken: Math.min(t.slotsTotal, t.slotsTaken + 1),
        };
        // Also update table on server
        fetch('/api/tables', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedT),
        }).catch(() => {});
        return updatedT;
      }
      return t;
    });
    setTables(updatedTables);
    localStorage.setItem('mesasrol_tables_v3', JSON.stringify(updatedTables));

    showToast('¡Tu solicitud fue enviada al DM! Podés verla en "Mis Solicitudes".');
  };

  const isUserMinor = currentUser?.role === 'minor' || currentUser?.ageCategory === 'MENOR_JUVENIL';

  return (
    <div className="min-h-screen bg-[#0F0F11] text-[#e2e8f0] flex flex-col selection:bg-[#800020] selection:text-white">
      {/* Header with Search, Quick Filters and Session Controls */}
      <Header
        filters={filters}
        onFilterChange={setFilters}
        onOpenPublishModal={handleAttemptPublishTable}
        onOpenSafetyGuide={() => setIsSafetyGuideOpen(true)}
        onOpenApplications={() => setIsApplicationsOpen(true)}
        onOpenProfile={() => {
          setPublishBlockedNotice(false);
          setIsProfileModalOpen(true);
        }}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenAdmin={() => {
          syncVerificationRequests();
          setIsAdminModalOpen(true);
        }}
        onLogout={handleLogout}
        pendingRequestsCount={verificationRequests.filter((r) => r.status === 'pending').length}
        isProfileVerified={isProfileVerified}
        applicationsCount={applications.length}
        totalTablesCount={tables.length}
        filteredCount={filteredTables.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentUser={currentUser}
      />

      {/* Active User Alert Bar (if Minor account is registered) */}
      {isUserMinor && (
        <div className="bg-amber-950/80 border-b border-amber-500/50 px-4 py-2 text-xs text-amber-200">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Protección de Menores Activa:</strong> Tu cuenta registrada es de aventurero juvenil ({currentUser?.age} años - {currentUser?.handle || currentUser?.name}). Las mesas en domicilios particulares están restringidas para resguardar tu seguridad.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col">
        {/* Split View Mode (Default: Feed Left + Map Right) */}
        {viewMode === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-start">
            {/* Left Feed of Tables (Scrollable) */}
            <div className="lg:col-span-6 xl:col-span-7 space-y-4">
              {tables.length === 0 ? (
                <div className="py-16 text-center bg-[#161618] rounded-2xl border border-[#2A2A2E] p-8 space-y-4 shadow-xl">
                  <div className="w-14 h-14 rounded-2xl bg-[#800020]/20 border border-[#800020]/40 flex items-center justify-center mx-auto text-rose-300">
                    <Dice5 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-fantasy text-lg font-bold text-[#f1f5f9]">
                      Aún no hay mesas publicadas
                    </h3>
                    <p className="text-xs sm:text-sm text-[#94a3b8] max-w-md mx-auto">
                      ¡Sé el primer Dungeon Master en publicar una mesa presencial en tu zona y conectar con jugadores de rol!
                    </p>
                  </div>
                  <button
                    onClick={handleAttemptPublishTable}
                    className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] via-[#991b1b] to-[#b91c1c] hover:from-[#991b1b] hover:to-[#dc2626] text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/60 border border-[#991b1b]/80 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Primera Mesa</span>
                  </button>
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="py-16 text-center bg-[#161618] rounded-2xl border border-[#2A2A2E] p-6 space-y-3 shadow-xl">
                  <Dice5 className="w-12 h-12 mx-auto text-[#71717a]" />
                  <h3 className="font-fantasy text-lg font-bold text-[#f1f5f9]">
                    No se encontraron mesas con esos filtros
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94a3b8] max-w-md mx-auto">
                    Probá ampliando el radio de distancia o seleccionando "Todas las zonas" para ver partidas en CABA y Provincia de Buenos Aires.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        searchQuery: '',
                        region: 'all',
                        maxDistanceKm: null,
                        venueType: 'all',
                        system: 'all',
                        experienceLevel: 'all',
                        availableOnly: false,
                        dayType: 'all',
                      })
                    }
                    className="mt-2 px-4 py-2 rounded-lg bg-[#800020] hover:bg-[#991b1b] text-[#fecdd3] text-xs font-semibold border border-[#991b1b]/80 transition-all cursor-pointer shadow-md"
                  >
                    Restablecer todos los filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTables.map((table) => (
                    <TableCard
                      key={table.id}
                      table={table}
                      currentUser={currentUser}
                      isSelected={table.id === selectedTableId}
                      onSelect={(t) => setSelectedTableId(t.id)}
                      onOpenDetail={(t) => setDetailTable(t)}
                      onOpenJoin={(t) => setJoinTable(t)}
                      onBlockedMinorClick={() => setMinorBlockedModalOpen(true)}
                      onRequestAuth={() => setIsRegisterModalOpen(true)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Sticky Map */}
            <div className="lg:col-span-6 xl:col-span-5 sticky top-36 h-[calc(100vh-170px)] min-h-[420px] hidden lg:block">
              <InteractiveMap
                tables={filteredTables}
                selectedTableId={selectedTableId}
                onSelectTable={(t) => setSelectedTableId(t.id)}
                onOpenDetail={(t) => setDetailTable(t)}
              />
            </div>

            {/* Mobile Fallback Map below list */}
            <div className="lg:hidden h-80 w-full mt-4">
              <InteractiveMap
                tables={filteredTables}
                selectedTableId={selectedTableId}
                onSelectTable={(t) => setSelectedTableId(t.id)}
                onOpenDetail={(t) => setDetailTable(t)}
              />
            </div>
          </div>
        )}

        {/* List Only View */}
        {viewMode === 'list' && (
          <div className="flex-1">
            {tables.length === 0 ? (
              <div className="py-16 text-center bg-[#161618] rounded-2xl border border-[#2A2A2E] p-8 space-y-4 shadow-xl max-w-xl mx-auto">
                <div className="w-14 h-14 rounded-2xl bg-[#800020]/20 border border-[#800020]/40 flex items-center justify-center mx-auto text-rose-300">
                  <Dice5 className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-fantasy text-lg font-bold text-[#f1f5f9]">
                    Aún no hay mesas publicadas
                  </h3>
                  <p className="text-xs sm:text-sm text-[#94a3b8]">
                    ¡Publicá tu mesa presencial y comenzá a recibir solicitudes de jugadores!
                  </p>
                </div>
                <button
                  onClick={handleAttemptPublishTable}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] via-[#991b1b] to-[#b91c1c] hover:from-[#991b1b] hover:to-[#dc2626] text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/60 border border-[#991b1b]/80 transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Primera Mesa</span>
                </button>
              </div>
            ) : filteredTables.length === 0 ? (
              <div className="py-16 text-center bg-[#161618] rounded-2xl border border-[#2A2A2E] p-6 space-y-3 shadow-xl max-w-xl mx-auto">
                <Dice5 className="w-12 h-12 mx-auto text-[#71717a]" />
                <h3 className="font-fantasy text-lg font-bold text-[#f1f5f9]">
                  No se encontraron mesas activas con esos filtros
                </h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTables.map((table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    currentUser={currentUser}
                    isSelected={table.id === selectedTableId}
                    onSelect={(t) => setSelectedTableId(t.id)}
                    onOpenDetail={(t) => setDetailTable(t)}
                    onOpenJoin={(t) => setJoinTable(t)}
                    onBlockedMinorClick={() => setMinorBlockedModalOpen(true)}
                    onRequestAuth={() => setIsRegisterModalOpen(true)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Map Only View */}
        {viewMode === 'map' && (
          <div className="flex-1 h-[calc(100vh-160px)] min-h-[500px]">
            <InteractiveMap
              tables={filteredTables}
              selectedTableId={selectedTableId}
              onSelectTable={(t) => setSelectedTableId(t.id)}
              onOpenDetail={(t) => setDetailTable(t)}
            />
          </div>
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#161618] border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Minor Blocked Notification Dialog */}
      {minorBlockedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F0F11]/90 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#161618] border border-amber-500/60 rounded-2xl shadow-2xl p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-950/80 border border-amber-500/70 flex items-center justify-center mx-auto text-amber-400">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-fantasy text-lg font-bold text-amber-200">
                Restricción de Seguridad para Menores
              </h3>
              <p className="text-xs text-[#cbd5e1] leading-relaxed">
                Por políticas de seguridad y protección de menores de RolCerca, las mesas en domicilios particulares solo están disponibles para mayores de 18 años verificados.
              </p>
              <div className="p-3 bg-[#0F0F11] rounded-xl border border-[#2A2A2E] text-xs text-emerald-300 text-left space-y-1">
                <strong>¿Dónde sí podés jugar?</strong>
                <p className="text-[11px] text-[#94a3b8]">
                  Podés sumarte a mesas en comiquerías, tiendas de juegos y clubes oficiales que cuenten con la insignia "Espacio Público Verificado - Apto Menores".
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMinorBlockedModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all cursor-pointer"
            >
              Entendido, explorar mesas públicas
            </button>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegisterSuccess={handleUserRegistered}
      />

      <TableDetailModal
        table={detailTable}
        isOpen={Boolean(detailTable)}
        currentUser={currentUser}
        onClose={() => setDetailTable(null)}
        onOpenJoin={(t) => {
          setDetailTable(null);
          setJoinTable(t);
        }}
        onRequestAuth={() => setIsRegisterModalOpen(true)}
      />

      <JoinApplicationModal
        table={joinTable}
        isOpen={Boolean(joinTable)}
        currentUser={currentUser}
        onClose={() => setJoinTable(null)}
        onSubmitApplication={handleApplicationSubmitted}
      />

      <PublishTableModal
        isOpen={isPublishModalOpen}
        currentUser={currentUser}
        onClose={() => {
          setIsPublishModalOpen(false);
          setEditingTable(null);
        }}
        onTableCreated={handleTableCreated}
        tableToEdit={editingTable || undefined}
        onTableUpdated={handleTableUpdated}
        isProfileVerified={isProfileVerified}
        onOpenProfile={() => {
          setPublishBlockedNotice(true);
          setIsProfileModalOpen(true);
        }}
      />

      <SafetyGuideModal
        isOpen={isSafetyGuideOpen}
        onClose={() => setIsSafetyGuideOpen(false)}
      />

      <MyApplicationsDrawer
        isOpen={isApplicationsOpen}
        onClose={() => setIsApplicationsOpen(false)}
        applications={applications}
        tables={tables}
        onOpenTableDetail={(t) => setDetailTable(t)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setPublishBlockedNotice(false);
        }}
        tables={tables}
        onUpdateTable={handleTableUpdated}
        onDeleteTable={handleDeleteTable}
        onEditTable={handleEditTable}
        publishAttemptBlockedNotice={publishBlockedNotice}
        onProfileSaved={(profile) => {
          setIsProfileVerified(profile.isVerified);
          if (profile.isVerified) {
            showToast('🎉 ¡Cuenta verificada con éxito! Ya podés publicar mesas.');
          }
        }}
        onProceedToPublish={() => {
          setPublishBlockedNotice(false);
          setEditingTable(null);
          setIsPublishModalOpen(true);
        }}
      />

      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => {
          setIsAdminModalOpen(false);
        }}
        requests={verificationRequests}
        onApproveRequest={handleApproveVerificationRequest}
        onRejectRequest={handleRejectVerificationRequest}
        onRefreshRequests={syncVerificationRequests}
      />
    </div>
  );
}
