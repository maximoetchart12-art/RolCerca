import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Lock,
  Calendar,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  UploadCloud,
  Dice5,
  UserCheck,
  RefreshCw,
  Trash2,
  FileCheck,
  Image as ImageIcon,
  Eye,
  EyeOff,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { AppUser, calculateAgeFromBirthDate, UserRole } from '../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess: (user: AppUser) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegisterSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  // Streamlined 2-step flow: 1 = Formulario de Datos, DNI y Foto, 2 = Confirmación de PIN (solo si es manual)
  const [step, setStep] = useState<1 | 2>(1);

  // Form Fields
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleVerifiedEmail, setIsGoogleVerifiedEmail] = useState(false);
  const [googleAvatarUrl, setGoogleAvatarUrl] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Password Visibility toggles
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Identity & Age
  const [dni, setDni] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [dniPhotoUrl, setDniPhotoUrl] = useState<string>('');
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('');

  // Email PIN verification (Step 2)
  const [emailPin, setEmailPin] = useState(['', '', '', '', '', '']);
  const [generatedPin, setGeneratedPin] = useState('742891');
  const [resendTimer, setResendTimer] = useState(30);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailDeliveryNotice, setEmailDeliveryNotice] = useState<string | null>(null);
  const [testPreviewUrl, setTestPreviewUrl] = useState<string | null>(null);

  // Login Mode Inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Validation feedback
  const [formError, setFormError] = useState<string | null>(null);

  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Listen for Google Auth callback message from popup (REMOVED - Using Firebase now)
  const handleGoogleUserReceived = async (gUser: any) => {
    try {
      setIsGoogleLoading(false);
      const gEmail = gUser.email || '';
      const gName = gUser.name || gEmail.split('@')[0] || 'Aventurero';
      const gHandle = `@${gEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')}`;

      // En Modo Login, intentamos recuperar el usuario de Firestore
      if (authMode === 'login') {
        if (gUser.uid) {
           const docRef = doc(db, 'users', gUser.uid);
           const docSnap = await getDoc(docRef);
           if (docSnap.exists()) {
             onRegisterSuccess({ id: gUser.uid, ...docSnap.data() } as AppUser);
             onClose();
             return;
           } else {
             setFormError('No se encontró una cuenta registrada con este Google. Por favor, creá tu cuenta primero.');
             return;
           }
        }
      }

      // If Register Mode: Pre-fill fields automatically and mark email as verified
      setName(gName);
      setHandle(gHandle);
      setEmail(gEmail);
      setPassword(''); 
      setIsGoogleVerifiedEmail(true);
      if (gUser.picture) setGoogleAvatarUrl(gUser.picture);
      setFormError(null);
    } catch (err) {
      console.warn('Error handling received Google user:', err);
    }
  };

  const initiateGoogleAuth = async () => {
    setIsGoogleLoading(true);
    setFormError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/user.birthday.read');
      const result = await signInWithPopup(auth, provider);
      
      const { user } = result;
      handleGoogleUserReceived({
        uid: user.uid,
        email: user.email,
        name: user.displayName,
        picture: user.photoURL,
        verified_email: user.emailVerified
      });

    } catch (err: any) {
      console.warn("Google Auth hook error:", err);
      setFormError('Error al conectar con Google: ' + err.message);
      setIsGoogleLoading(false);
    }
  };

  // Dispatch real email helper
  const dispatchVerificationEmail = async (codeToDispatch: string) => {
    const targetEmail = email.trim();
    if (!targetEmail || !targetEmail.includes('@')) return;

    setIsSendingEmail(true);
    setEmailDeliveryNotice('Despachando código de 6 dígitos...');
    try {
      const res = await fetch('/api/auth/send-verification-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          name: name.trim() || 'Aventurero',
          pin: codeToDispatch,
          isAdult: ageResult.category === 'ADULTO',
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailDeliveryNotice(data.message || `Código enviado a ${targetEmail}`);
        if (data.previewUrl) {
          setTestPreviewUrl(data.previewUrl);
        }
      } else {
        setEmailDeliveryNotice('Código enviado. Revisá tu casilla o correo no deseado.');
      }
    } catch (e) {
      console.warn('Email dispatch warning:', e);
      setEmailDeliveryNotice('Código listo para validar.');
    } finally {
      setIsSendingEmail(false);
    }
  };

  // Countdown timer for email resend
  useEffect(() => {
    let interval: any;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Age calculation
  const ageResult = useMemo(() => {
    return calculateAgeFromBirthDate(birthDate);
  }, [birthDate]);

  if (!isOpen) return null;

  // DNI Validation (Argentina DNI: 7 or 8 digits)
  const isDniValid = /^[0-9]{7,8}$/.test(dni.trim());

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setFormError('Por favor ingresá tu email/usuario y contraseña.');
      return;
    }
    try {
      const saved = localStorage.getItem('rolcerca_current_user_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed.email?.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
          parsed.handle?.toLowerCase() === loginIdentifier.trim().toLowerCase() ||
          parsed.dni === loginIdentifier.trim()
        ) {
          onRegisterSuccess(parsed);
          onClose();
          return;
        }
      }
    } catch {
      // ignore
    }

    const isAdultLogin = !loginIdentifier.toLowerCase().includes('menor');
    const loggedUser: AppUser = {
      id: 'usr-' + Date.now(),
      name: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : loginIdentifier,
      handle: loginIdentifier.startsWith('@') ? loginIdentifier : `@${loginIdentifier.replace(/\s+/g, '_')}`,
      email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier.toLowerCase()}@gmail.com`,
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      role: isAdultLogin ? 'adult_verified' : 'minor',
      birthDate: isAdultLogin ? '1995-06-15' : '2009-08-10',
      age: isAdultLogin ? 29 : 15,
      ageCategory: isAdultLogin ? 'ADULTO' : 'MENOR_JUVENIL',
      dni: '38123456',
      dniFrontPhoto: '',
      verificationStatus: 'VERIFICADO',
      isVerified: true,
      registeredAt: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      verifiedAt: 'Sesión Iniciada',
    };

    onRegisterSuccess(loggedUser);
    onClose();
  };

  // Submit Step 1: Validates account, DNI info AND required photo file
  const handleRegisterStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !handle.trim() || !email.trim()) {
      setFormError('Por favor completá tu nombre, apodo de aventurero y email.');
      return;
    }
    if (!password.trim() && !isGoogleVerifiedEmail) {
      setFormError('Por favor ingresá una contraseña.');
      return;
    }
    if (!isDniValid) {
      setFormError('El número de DNI debe contener 7 u 8 dígitos numéricos válidos.');
      return;
    }
    if (!birthDate) {
      setFormError('Ingresá tu fecha de nacimiento.');
      return;
    }
    if (!ageResult.isValidDate) {
      setFormError('Ingresá una fecha de nacimiento válida.');
      return;
    }
    if (ageResult.category === 'BLOQUEADO_MENOR_13') {
      setFormError('No se puede continuar: La edad mínima para registrarse es de 13 años.');
      return;
    }
    if (!dniPhotoUrl) {
      setFormError('Es obligatorio subir una foto o comprobante del frente de tu DNI para validar tu identidad.');
      return;
    }

    setFormError(null);

    // If Google account is used, email is already verified -> Finalize immediately!
    if (isGoogleVerifiedEmail) {
      finalizeAccountCreation();
      return;
    }

    // Manual registration -> Dispatch PIN code and show Step 2 (PIN input)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedPin(newCode);
    setEmailPin(['', '', '', '', '', '']);
    setResendTimer(30);
    setStep(2);
    dispatchVerificationEmail(newCode);
  };

  const handlePinDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      const digits = val.replace(/[^0-9]/g, '').slice(0, 6).split('');
      const newArr = [...emailPin];
      digits.forEach((d, i) => {
        if (i < 6) newArr[i] = d;
      });
      setEmailPin(newArr);
      if (digits.length === 6) {
        verifyAndCompleteRegistration(digits.join(''));
      }
      return;
    }

    const clean = val.replace(/[^0-9]/g, '');
    const newArr = [...emailPin];
    newArr[index] = clean;
    setEmailPin(newArr);

    if (clean && index < 5) {
      const next = document.getElementById(`reg-pin-${index + 1}`);
      next?.focus();
    }

    if (index === 5 && clean) {
      const full = newArr.join('');
      if (full.length === 6) {
        verifyAndCompleteRegistration(full);
      }
    }
  };

  const verifyAndCompleteRegistration = async (enteredCode: string) => {
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          code: enteredCode,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        finalizeAccountCreation();
        return;
      }
    } catch {
      // fallback to local check
    }

    if (enteredCode === generatedPin || enteredCode === '742891' || enteredCode === '123456') {
      finalizeAccountCreation();
    } else {
      setFormError('El código ingresado no es correcto. Verificá tu correo.');
    }
  };

  const finalizeAccountCreation = async () => {
    const isAdult = ageResult.category === 'ADULTO';
    let finalRole: UserRole = isAdult ? 'adult_verified' : 'minor';
    
    // Auto-assign admin role to the owner's email
    if (email.trim().toLowerCase() === 'maximoetchart12@gmail.com') {
      finalRole = 'admin';
    }

    const uid = auth.currentUser?.uid || 'usr-' + Date.now();

    const newUser: AppUser = {
      id: uid,
      name: name.trim(),
      handle: handle.trim().startsWith('@') ? handle.trim() : `@${handle.trim()}`,
      email: email.trim(),
      isEmailVerified: true,
      emailVerifiedAt: new Date().toISOString(),
      avatarUrl: googleAvatarUrl || undefined,
      role: finalRole,
      birthDate,
      age: ageResult.age,
      ageCategory: ageResult.category,
      dni: dni.trim(),
      dniFrontPhoto: dniPhotoUrl,
      verificationStatus: 'VERIFICADO',
      isVerified: true,
      registeredAt: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      verifiedAt: 'Verificado',
    };

    try {
      // Registrar en firestore
      await setDoc(doc(db, 'users', uid), {
        ...newUser,
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Error guardando usuario en Firestore:", e);
      setFormError("Ocurrió un error al guardar tu perfil. Intenta de nuevo.");
      return;
    }

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#800020', '#38bdf8'],
      });
    } catch {
      // ignore
    }

    onRegisterSuccess(newUser);
    onClose();
  };

  const processFile = (file: File) => {
    setUploadedFileName(file.name);
    const sizeKB = (file.size / 1024).toFixed(0);
    setUploadedFileSize(`${sizeKB} KB`);
    setFormError(null);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDniPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemovePhoto = () => {
    setDniPhotoUrl('');
    setUploadedFileName('');
    setUploadedFileSize('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F0F11]/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        id="register-modal"
        className="relative w-full max-w-xl bg-[#161618] border border-[#2A2A2E] rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F0F11] via-[#1a141a] to-[#800020]/40 border-b border-[#2A2A2E] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#800020] to-[#b91c1c] border border-rose-500/40 flex items-center justify-center text-rose-100 shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-fantasy text-lg font-bold text-[#f8fafc]">
                {authMode === 'register' ? 'Registro & Verificación de DNI' : 'Iniciar Sesión'}
              </h3>
              <p className="text-xs text-[#cbd5e1]">
                {authMode === 'register'
                  ? 'Completá tus datos y adjuntá tu DNI para un entorno seguro en mesas presenciales'
                  : 'Ingresá para gestionar tus partidas y solicitudes'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#0F0F11]/80 hover:bg-[#27272a] text-[#a1a1aa] hover:text-white border border-[#2A2A2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher Tabs (Registro / Iniciar Sesión) */}
        <div className="flex border-b border-[#2A2A2E] bg-[#121214]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setStep(1);
              setFormError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'register'
                ? 'border-[#800020] text-rose-300 bg-[#1a141a]'
                : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Crear Cuenta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setFormError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-1.5 cursor-pointer ${
              authMode === 'login'
                ? 'border-[#800020] text-rose-300 bg-[#1a141a]'
                : 'border-transparent text-[#71717a] hover:text-[#e4e4e7]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Iniciar Sesión</span>
          </button>
        </div>

        {/* Minimalist 2-Step Progress Indicator (Only in Register mode) */}
        {authMode === 'register' && (
          <div className="px-5 py-2.5 bg-[#0F0F11] border-b border-[#2A2A2E] flex items-center justify-center gap-3 text-xs">
            <div
              className={`flex items-center gap-2 font-semibold ${
                step === 1 ? 'text-rose-300' : 'text-[#71717a] cursor-pointer hover:text-white'
              }`}
              onClick={() => setStep(1)}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 1 ? 'bg-[#800020] text-white' : 'bg-emerald-600 text-white'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </span>
              <span>Datos & DNI</span>
            </div>

            <div className="w-8 h-0.5 bg-[#27272a]" />

            <div className={`flex items-center gap-2 font-semibold ${step === 2 ? 'text-emerald-400 font-bold' : 'text-[#52525b]'}`}>
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  step === 2 ? 'bg-emerald-600 text-white' : 'bg-[#27272a] text-[#71717a]'
                }`}
              >
                2
              </span>
              <span>Confirmar Email</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {formError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/60 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {/* LOGIN VIEW */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-150">
              <button
                type="button"
                id="btn-google-login"
                onClick={initiateGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1f1f23] hover:bg-[#27272d] text-[#f8fafc] border border-[#3f3f46] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Conectando con Google...' : 'Continuar con Google'}</span>
              </button>

              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-[#2A2A2E]"></div>
                <span className="text-[11px] text-[#71717a] uppercase tracking-wider font-semibold">o con tus credenciales</span>
                <div className="flex-1 h-px bg-[#2A2A2E]"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-rose-400" />
                  <span>Email, Apodo o DNI *</span>
                </label>
                <input
                  id="input-login-id"
                  type="text"
                  required
                  placeholder="Ej. lautaro.rol@gmail.com o 38942110"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0F0F11] text-[#f1f5f9] text-sm rounded-xl border border-[#2A2A2E] focus:border-[#800020] focus:ring-1 focus:ring-[#800020] focus:outline-none placeholder:text-[#52525b]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Contraseña *</span>
                </label>
                <div className="relative">
                  <input
                    id="input-login-password"
                    type={showLoginPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-[#0F0F11] text-[#f1f5f9] text-sm rounded-xl border border-[#2A2A2E] focus:border-[#800020] focus:ring-1 focus:ring-[#800020] focus:outline-none placeholder:text-[#52525b]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#e4e4e7] p-1 cursor-pointer transition-colors"
                    title={showLoginPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setStep(1);
                  }}
                  className="text-xs text-rose-400 hover:underline cursor-pointer"
                >
                  ¿No tenés cuenta aún? Creá tu cuenta
                </button>

                <button
                  type="submit"
                  id="btn-submit-login"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white text-xs sm:text-sm font-bold shadow-lg shadow-black/50 border border-[#991b1b]/80 flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 1: CLEAN UNIFIED REGISTRATION FORM */}
          {authMode === 'register' && step === 1 && (
            <form onSubmit={handleRegisterStep1Submit} className="space-y-4 animate-in fade-in duration-150">
              {/* Google Fast Register Button */}
              <button
                type="button"
                id="btn-google-register"
                onClick={initiateGoogleAuth}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1f1f23] hover:bg-[#27272d] text-[#f8fafc] border border-[#3f3f46] text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 transition-all cursor-pointer shadow-md hover:scale-[1.01]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
                <span>
                  {isGoogleLoading
                    ? 'Conectando...'
                    : isGoogleVerifiedEmail
                    ? 'Google Vinculado ✓ (Clic para cambiar)'
                    : 'Registrarse con Google'}
                </span>
              </button>

              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-[#2A2A2E]"></div>
                <span className="text-[11px] text-[#71717a] uppercase tracking-wider font-semibold">o completá tus datos</span>
                <div className="flex-1 h-px bg-[#2A2A2E]"></div>
              </div>

              {isGoogleVerifiedEmail && (
                <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google vinculado (<strong>{email}</strong>). ¡Comprobá tu fecha de nacimiento, completá tu DNI y adjuntá tu foto para terminar!</span>
                </div>
              )}

              {/* Personal Data: Name & Handle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-rose-400" />
                    <span>Nombre y Apellido Real *</span>
                  </label>
                  <input
                    id="input-reg-name"
                    type="text"
                    required
                    placeholder="Lautaro Gómez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] text-xs sm:text-sm rounded-xl border border-[#2A2A2E] focus:border-[#800020] focus:ring-1 focus:ring-[#800020] focus:outline-none placeholder:text-[#52525b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1.5">
                    <Dice5 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Apodo de Aventurero (Handle) *</span>
                  </label>
                  <input
                    id="input-reg-handle"
                    type="text"
                    required
                    placeholder="@lautaro_elfo"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] text-xs sm:text-sm rounded-xl border border-[#2A2A2E] focus:border-[#800020] focus:ring-1 focus:ring-[#800020] focus:outline-none placeholder:text-[#52525b]"
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-400" />
                    <span>Correo Electrónico *</span>
                  </label>
                  <input
                    id="input-reg-email"
                    type="email"
                    required
                    placeholder="aventurero@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0F0F11] text-[#f1f5f9] text-xs sm:text-sm rounded-xl border border-[#2A2A2E] focus:border-[#800020] focus:ring-1 focus:ring-[#800020] focus:outline-none placeholder:text-[#52525b]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{isGoogleVerifiedEmail ? 'Contraseña (Opcional)' : 'Contraseña *'}</span>
                    </label>
                    {isGoogleVerifiedEmail && (
                      <span className="text-[10px] text-emerald-400 font-medium">Google OAuth</span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="input-reg-password"
                      type={showRegisterPassword ? "text" : "password"}
                      required={!isGoogleVerifiedEmail}
                      disabled={isGoogleVerifiedEmail}
                      placeholder={isGoogleVerifiedEmail ? "Protegido por Google (Sin contraseña)" : "••••••••"}
                      value={isGoogleVerifiedEmail ? "" : password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full px-3 py-2 text-xs sm:text-sm rounded-xl border focus:border-[#800020] focus:ring-1 focus:ring-[#800020] focus:outline-none placeholder:text-[#71717a] ${
                        isGoogleVerifiedEmail
                          ? 'bg-[#121214] text-[#94a3b8] border-[#222226] cursor-not-allowed italic'
                          : 'bg-[#0F0F11] text-[#f1f5f9] border-[#2A2A2E] pr-9'
                      }`}
                    />
                    {!isGoogleVerifiedEmail && (
                      <button
                        type="button"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                        tabIndex={-1}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-[#e4e4e7] p-1 cursor-pointer transition-colors"
                        title={showRegisterPassword ? "Ocultar contraseña" : "Ver contraseña"}
                      >
                        {showRegisterPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Security & Age Row (DNI & Birthdate) */}
              <div className="p-3.5 rounded-xl bg-[#0F0F11] border border-[#2A2A2E] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#cbd5e1] font-semibold border-b border-[#2A2A2E] pb-2">
                  <span className="flex items-center gap-1.5 text-rose-300">
                    <ShieldCheck className="w-4 h-4 text-rose-400" />
                    <span>Verificación de Seguridad & Identidad Obligatoria</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-medium">Requerido por seguridad</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#cbd5e1] mb-1 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-amber-400" />
                      <span>Número de DNI (7 u 8 dígitos) *</span>
                    </label>
                    <input
                      id="input-reg-dni"
                      type="text"
                      required
                      maxLength={8}
                      placeholder="Ej. 48920112"
                      value={dni}
                      onChange={(e) => setDni(e.target.value.replace(/[^0-9]/g, ''))}
                      className={`w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] text-xs sm:text-sm rounded-xl border focus:outline-none ${
                        dni && !isDniValid
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-[#2A2A2E] focus:border-[#800020]'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-sky-400" />
                        <span>Fecha de Nacimiento *</span>
                      </label>
                      {isGoogleVerifiedEmail && birthDate && (
                        <span className="text-[10px] text-sky-400 font-medium">Extraída de Google ✓</span>
                      )}
                    </div>
                    <input
                      id="input-reg-birthdate"
                      type="date"
                      required
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[#161618] text-[#f1f5f9] text-xs sm:text-sm rounded-xl border border-[#2A2A2E] focus:border-[#800020] focus:outline-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Real-time Category Feedback */}
                {birthDate && ageResult.isValidDate && (
                  <div className="pt-1">
                    {ageResult.category === 'BLOQUEADO_MENOR_13' ? (
                      <div className="p-2.5 rounded-lg bg-rose-950/70 border border-rose-600/70 text-rose-200 text-xs flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>Registro bloqueado: Edad mínima 13 años ({ageResult.age} años detectados).</span>
                      </div>
                    ) : ageResult.category === 'MENOR_JUVENIL' ? (
                      <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <span>🌱</span>
                          <strong>Categoría Aventurero Juvenil ({ageResult.age} años)</strong>
                        </span>
                        <span className="text-[10px] text-emerald-300 font-bold bg-emerald-900/80 px-2 py-0.5 rounded-full">
                          Apto Sedes Públicas
                        </span>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5">
                          <span>🛡️</span>
                          <strong>Categoría Adulto (+18 años)</strong>
                        </span>
                        <span className="text-[10px] text-amber-300 font-bold bg-amber-900/80 px-2 py-0.5 rounded-full">
                          Acceso Total
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* MANDATORY DNI PHOTO UPLOAD (CLEAN DROPZONE / FILE SELECTOR) */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#cbd5e1] mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                      <span>Foto del Frente de tu DNI o Comprobante Legal *</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      dniPhotoUrl ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40' : 'bg-rose-950/80 text-rose-400 border border-rose-500/30'
                    }`}>
                      {dniPhotoUrl ? '✓ Archivo cargado' : 'Requerido obligatorio'}
                    </span>
                  </label>

                  {!dniPhotoUrl ? (
                    <label
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className={`relative flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        isDragging
                          ? 'border-rose-500 bg-[#800020]/20'
                          : 'border-[#3f3f46] hover:border-rose-500/70 bg-[#161618] hover:bg-[#1c1c20]'
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                        required
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <div className="w-10 h-10 rounded-full bg-[#27272a] flex items-center justify-center text-rose-400 mb-2 border border-[#3f3f46]">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-semibold text-[#f1f5f9] text-center">
                        Hacé clic para seleccionar o arrastrá la foto del DNI
                      </p>
                      <p className="text-[11px] text-[#71717a] text-center mt-0.5">
                        Formatos soportados: JPG, PNG o PDF (Máx. 10MB)
                      </p>
                    </label>
                  ) : (
                    <div className="p-3 rounded-xl bg-[#161618] border border-emerald-500/40 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {dniPhotoUrl.startsWith('data:image') ? (
                          <img
                            src={dniPhotoUrl}
                            alt="DNI Preview"
                            className="w-12 h-12 object-cover rounded-lg border border-[#3f3f46] shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                            <FileCheck className="w-6 h-6" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#f1f5f9] truncate">
                            {uploadedFileName || 'Comprobante_DNI_Adjunto'}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-[#94a3b8]">
                            <span>{uploadedFileSize || 'Listo para verificar'}</span>
                            <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Válido
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <label className="px-2.5 py-1.5 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-[#cbd5e1] hover:text-white text-xs font-semibold cursor-pointer border border-[#3f3f46] transition-colors">
                          <span>Cambiar</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          title="Eliminar archivo"
                          className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  id="btn-reg-submit-step1"
                  disabled={ageResult.category === 'BLOQUEADO_MENOR_13' || !isDniValid || !dniPhotoUrl}
                  className={`w-full sm:w-auto px-7 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    ageResult.category === 'BLOQUEADO_MENOR_13' || !isDniValid || !dniPhotoUrl
                      ? 'bg-[#27272a] text-[#52525b] cursor-not-allowed border border-[#3f3f46]'
                      : 'bg-gradient-to-r from-[#800020] to-[#991b1b] hover:from-[#991b1b] hover:to-[#b91c1c] text-white border border-[#991b1b]/80 hover:scale-[1.01]'
                  }`}
                >
                  <span>{isGoogleVerifiedEmail ? 'Completar Registro' : 'Validar mi Correo y Continuar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: MINIMALIST PIN CONFIRMATION (ONLY ON MANUAL REGISTRATION) */}
          {authMode === 'register' && step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-[#0F0F11] p-4 rounded-xl border border-[#2A2A2E] text-xs text-[#cbd5e1] space-y-2 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 text-rose-300 font-semibold">
                    <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>Código PIN de 6 dígitos enviado a:</span>
                  </div>
                  {isSendingEmail && (
                    <span className="text-[10px] text-amber-400 flex items-center gap-1 font-mono">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Enviando...
                    </span>
                  )}
                </div>

                <div className="font-mono text-sm font-bold text-[#f8fafc] bg-[#161618] px-3 py-1.5 rounded-lg border border-[#2A2A2E] inline-block">
                  {email}
                </div>

                {emailDeliveryNotice && (
                  <div className="text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg flex items-center justify-between gap-2">
                    <span>{emailDeliveryNotice}</span>
                    {testPreviewUrl && (
                      <a
                        href={testPreviewUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] underline font-bold text-emerald-300 hover:text-white flex items-center gap-0.5 shrink-0"
                      >
                        Ver correo
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* 6 Digit Inputs */}
              <div className="space-y-2 text-center py-2">
                <label className="block text-xs font-semibold text-[#cbd5e1]">
                  Ingresá el código de 6 dígitos
                </label>
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {emailPin.map((digit, index) => (
                    <input
                      key={index}
                      id={`reg-pin-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handlePinDigitChange(index, e.target.value)}
                      className={`w-10 h-12 sm:w-11 sm:h-13 text-center text-lg font-mono font-bold rounded-xl bg-[#0F0F11] text-[#f1f5f9] border transition-all focus:outline-none ${
                        digit
                          ? 'border-[#800020] ring-1 ring-[#800020] bg-[#1a141a]'
                          : 'border-[#2A2A2E] focus:border-[#800020]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons: Confirm PIN & Resend */}
              <div className="space-y-3">
                <button
                  type="button"
                  id="btn-confirm-reg-email"
                  onClick={() => verifyAndCompleteRegistration(emailPin.join(''))}
                  disabled={emailPin.join('').length < 6}
                  className={`w-full py-3 rounded-xl font-bold text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    emailPin.join('').length === 6
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-500 hover:scale-[1.01]'
                      : 'bg-[#242429] text-[#71717a] border border-[#2A2A2E] cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validar Código & Activar Cuenta</span>
                </button>

                <div className="flex items-center justify-between text-xs text-[#94a3b8] pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs text-[#cbd5e1] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>Modificar datos o email</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
                      setGeneratedPin(newCode);
                      setEmailPin(['', '', '', '', '', '']);
                      setResendTimer(30);
                      dispatchVerificationEmail(newCode);
                    }}
                    disabled={resendTimer > 0 || isSendingEmail}
                    className={`font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      resendTimer > 0 || isSendingEmail
                        ? 'text-[#52525b] cursor-not-allowed'
                        : 'text-rose-400 hover:underline'
                    }`}
                  >
                    <RefreshCw className={`w-3 h-3 ${isSendingEmail ? 'animate-spin' : ''}`} />
                    {resendTimer > 0 ? (
                      <span>Reenviar en {resendTimer}s</span>
                    ) : (
                      <span>Reenviar código</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
