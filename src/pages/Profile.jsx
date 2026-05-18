import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, Zap, LogOut, Terminal, User, Edit3, Save, X, Tag, HelpCircle, Eye, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '../firebase.config';
import { doc, updateDoc } from 'firebase/firestore';

const Profile = () => {
  const { user, logout, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.displayName || '');
  const [editPhoto, setEditPhoto] = useState(user?.photoURL || '');
  const [promoCode, setPromoCode] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Calculo real de dias restantes basado en createdAt (30 dias de acceso)
  const PLAN_DAYS = 30;
  const { daysRemaining, expiryDate, isExpired } = useMemo(() => {
    if (user?.role === 'admin') return { daysRemaining: null, expiryDate: null, isExpired: false };
    const rawDate = user?.unlockedAt || user?.createdAt;
    if (!rawDate) return { daysRemaining: PLAN_DAYS, expiryDate: null, isExpired: false };
    // Parsear fecha DD/MM/YYYY
    const parts = rawDate.split('/');
    const startDate = parts.length === 3
      ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
      : new Date(rawDate);
    const expiry = new Date(startDate);
    expiry.setDate(expiry.getDate() + PLAN_DAYS);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return {
      daysRemaining: Math.max(0, diff),
      expiryDate: expiry.toLocaleDateString('es-ES'),
      isExpired: diff <= 0
    };
  }, [user?.createdAt, user?.unlockedAt, user?.role]);

  // Auto-bloqueo cuando expira el plan
  useEffect(() => {
    if (isExpired && user?.role !== 'admin' && user?.status === 'active' && user?.uid && db) {
      const autoBlock = async () => {
        try {
          await updateDoc(doc(db, 'users', user.uid), { status: 'suspended' });
          toast.error('Tu acceso de 30 días ha expirado. Contacta al administrador.');
        } catch (e) {
          console.warn('No se pudo auto-bloquear:', e.message);
        }
      };
      autoBlock();
    }
  }, [isExpired, user?.role, user?.status, user?.uid]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    try {
      await updateUserProfile(editName, editPhoto);
      toast.success('Perfil de la terminal actualizado');
      setIsEditing(false);
      setImgError(false);
    } catch (error) {
      toast.error('Error al actualizar perfil');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleRedeemCode = (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return toast.error('Ingresa un código promocional');
    setIsRedeeming(true);
    
    setTimeout(() => {
      const code = promoCode.toUpperCase().trim();
      if (code === 'KOFFY-PRO-30' || code === 'FREE-KOFFY' || code === 'SCORES24') {
        setSubscriptionDays(prev => prev + 30);
        toast.success('¡Código canjeado! +30 Días Añadidos');
        setPromoCode('');
      } else {
        toast.error('Código inválido o ya expirado');
      }
      setIsRedeeming(false);
    }, 1000);
  };

  const handleCancel = () => {
    setEditName(user?.displayName || '');
    setEditPhoto(user?.photoURL || '');
    setPromoCode('');
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header>
        <h3 className="koffy-mono text-brand-accent">Perfil del Miembro</h3>
        <h1 className="koffy-title text-4xl mt-2">
          {isEditing ? 'CONFIGURAR TERMINAL' : 'MI CUENTA'}
        </h1>
      </header>

      <AnimatePresence mode="wait">
        {!isEditing ? (
          <motion.div 
            key="view-profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="koffy-card overflow-hidden"
          >
            {/* Banner con degradado */}
            <div className="h-28 bg-gradient-neon relative">
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute -bottom-10 left-8">
                <div className="w-20 h-20 rounded-xl bg-brand-card p-1 shadow-2xl border border-brand-border2">
                  <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-brand-bg">
                    {user?.photoURL && !imgError ? (
                      <img 
                        src={user.photoURL} 
                        alt="Foto de perfil" 
                        className="w-full h-full object-cover" 
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-brand-accent to-white flex items-center justify-center text-brand-bg text-3xl font-display">
                        {(user?.displayName?.[0] || user?.email?.[0] || 'K').toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Datos y estadísticas del perfil */}
            <div className="px-8 pt-14 pb-8 space-y-8">
              <div>
                <h2 className="koffy-title text-2xl tracking-wider">
                  {user?.displayName || 'SIN ALIAS CONFIGURADO'}
                </h2>
                <p className="koffy-mono text-xs text-brand-gray mt-1">{user?.email}</p>
              </div>

              {/* Grid de 3 celdas Bento style */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-brand-bg border border-brand-border rounded-lg flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-brand-gray mb-2">
                    <User size={12} className="text-brand-accent" />
                    <span className="koffy-mono text-[8px] uppercase">Alias Actual</span>
                  </div>
                  <p className="font-mono text-xs truncate font-bold text-brand-text">
                    {user?.displayName || 'No configurado'}
                  </p>
                </div>

                <div className="p-4 bg-brand-bg border border-brand-border rounded-lg flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-brand-gray mb-2">
                    <Mail size={12} className="text-brand-accent" />
                    <span className="koffy-mono text-[8px] uppercase">ID de Correo</span>
                  </div>
                  <p className="font-mono text-[10px] truncate text-brand-text">
                    {user?.email}
                  </p>
                </div>

                <div className="p-4 bg-brand-bg border border-brand-border rounded-lg flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-brand-gray mb-2">
                    <Shield size={12} className="text-brand-accent" />
                    <span className="koffy-mono text-[8px] uppercase">Rango Sistema</span>
                  </div>
                  <p className="koffy-mono text-xs text-brand-accent font-bold uppercase truncate">
                    {user?.role === 'admin' ? 'SUPER ROOT' : 'PREMIUM'}
                  </p>
                </div>
              </div>

              {/* Tarjeta de Suscripción Dinámica */}
              <div className={`koffy-card p-6 flex items-center justify-between ${isExpired ? 'bg-brand-red/5 border-brand-red/20' : 'bg-brand-accent/5 border-brand-accent/20'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isExpired ? 'bg-brand-red/10 text-brand-red' : 'bg-brand-accent/10 text-brand-accent'}`}>
                    {isExpired ? <AlertTriangle size={24} /> : <Zap size={24} />}
                  </div>
                  {user?.role === 'admin' ? (
                    <div>
                      <p className="koffy-title text-lg leading-tight text-brand-accent">ACCESO ROOT ILIMITADO</p>
                      <p className="koffy-mono text-[9px] text-brand-gray mt-1">Control total · Sistemas Koffys</p>
                    </div>
                  ) : (
                    <div>
                      <p className={`koffy-title text-lg leading-tight ${isExpired ? 'text-brand-red' : ''}`}>
                        {isExpired ? 'ACCESO EXPIRADO' : 'BETA TESTER ACTIVO'}
                      </p>
                      <p className="koffy-mono text-[9px] text-brand-gray mt-1">
                        {isExpired ? 'Contacta al administrador para renovar' : `RichBet Analytics · Método Richart`}
                      </p>
                    </div>
                  )}
                </div>
                {user?.role !== 'admin' && (
                  <div className="text-right shrink-0 ml-4">
                    <p className="koffy-mono text-[9px] text-brand-gray">VENCE EN:</p>
                    <p className={`koffy-mono text-xl font-bold ${
                      isExpired ? 'text-brand-red' :
                      daysRemaining <= 5 ? 'text-brand-red animate-pulse' :
                      daysRemaining <= 10 ? 'text-brand-gold' :
                      'text-brand-green'
                    }`}>
                      {isExpired ? '0 DÍAS' : `${daysRemaining} DÍAS`}
                    </p>
                    {expiryDate && (
                      <p className="koffy-mono text-[7px] text-brand-gray mt-0.5">{expiryDate}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Botonera Principal */}
              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex-1 koffy-btn bg-brand-accent/10 border border-brand-accent/30 text-brand-accent hover:bg-brand-accent/20 flex items-center justify-center gap-2"
                >
                  <Edit3 size={16} />
                  EDITAR PERFIL
                </button>
                <a 
                  href="https://t.me/+59169309970"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-6 rounded-lg border border-brand-border2 text-brand-text font-display tracking-widest text-center text-xs hover:bg-brand-card hover:border-brand-accent transition-all flex items-center justify-center gap-2"
                >
                  <HelpCircle size={16} />
                  CONTACTAR SOPORTE
                </a>
                <button 
                  onClick={logout}
                  className="flex-1 py-3 px-6 rounded-lg border border-brand-red/30 text-brand-red font-display tracking-widest text-xs hover:bg-brand-red/5 transition-all flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  CERRAR TERMINAL
                </button>
              </div>
            </div>

            <div className="bg-brand-bg p-4 border-t border-brand-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Terminal size={14} className="text-brand-accent animate-pulse" />
                <span className="koffy-mono text-[8px] text-brand-gray italic">ID Terminal: {user?.uid}</span>
              </div>
              <div className="flex items-center gap-4 koffy-mono text-[8px] text-brand-gray">
                <span>|</span>
                <span>MOTOR IA: <span className="text-brand-green font-bold">ONLINE (GEMINI-2.5-FLASH)</span></span>
                <span>|</span>
                <span>SECURE BOOT: <span className="text-brand-gold">{new Date().toLocaleDateString()}</span></span>
                <span>|</span>
                <span>FIRMWARE: <span className="text-brand-accent">v3.1.3-PRO</span></span>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="edit-profile"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="koffy-card p-8 space-y-8"
          >
            <h2 className="koffy-title text-xl border-b border-brand-border pb-4 flex items-center gap-2 text-brand-accent">
              <Edit3 size={18} />
              MODIFICAR CONFIGURACIÓN DE USUARIO
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Vista previa en tiempo real */}
              <div className="flex items-center gap-4 p-4 bg-brand-bg border border-brand-border rounded-lg">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-brand-card border border-brand-border2 flex items-center justify-center">
                  {editPhoto ? (
                    <img 
                      src={editPhoto} 
                      alt="Vista previa" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.src = 'https://media.api-sports.io/football/teams/unknown.png';
                      }}
                    />
                  ) : (
                    <User className="text-brand-gray" size={24} />
                  )}
                </div>
                <div>
                  <h4 className="koffy-mono text-[10px] text-brand-accent uppercase">Vista Previa de Avatar</h4>
                  <p className="text-[9px] text-brand-gray mt-0.5">Se actualizará inmediatamente en tu terminal al guardar.</p>
                </div>
              </div>

              {/* Alias Input */}
              <div className="space-y-2">
                <label className="koffy-mono text-[9px] text-brand-gray uppercase block">Alias / Nombre de Usuario</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" size={14} />
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Escribe tu alias (Ej: Koffy Apuesta)"
                    className="koffy-input pl-10 py-3 text-sm focus:border-brand-accent"
                    required
                  />
                </div>
              </div>

              {/* Avatar URL Input */}
              <div className="space-y-2">
                <label className="koffy-mono text-[9px] text-brand-gray uppercase block">Enlace de Imagen de Perfil (URL)</label>
                <div className="relative">
                  <Eye className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" size={14} />
                  <input 
                    type="url" 
                    value={editPhoto}
                    onChange={(e) => setEditPhoto(e.target.value)}
                    placeholder="Pega el enlace de tu avatar (Ej: https://...)"
                    className="koffy-input pl-10 py-3 text-sm focus:border-brand-accent"
                  />
                </div>
                <p className="text-[8px] text-brand-gray italic">Puedes pegar un enlace de Gravatar, Imgur, o cualquier imagen web.</p>
              </div>
              
              <div className="pt-4 flex gap-4">
                <button 
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 koffy-btn bg-brand-accent text-brand-bg hover:shadow-neon flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {saveLoading ? 'GUARDANDO...' : 'GUARDAR CONFIGURACIÓN'}
                </button>
                <button 
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 rounded-lg border border-brand-border2 text-brand-gray hover:bg-brand-card hover:text-brand-text transition-all flex items-center justify-center gap-2"
                >
                  <X size={16} />
                  CANCELAR
                </button>
              </div>
            </form>

            {/* Sistema de Código Promocional - Solo si NO es Admin */}
            {user?.role !== 'admin' && (
              <div className="mt-8 pt-8 border-t border-brand-border space-y-4">
                <div>
                  <h3 className="koffy-title text-sm flex items-center gap-2 text-brand-gold">
                    <Tag size={16} />
                    CANJEAR CÓDIGO DE SUSCRIPCIÓN
                  </h3>
                  <p className="text-[9px] text-brand-gray mt-1">
                    ¿Tienes un código de promoción? Introdúcelo aquí para extender tus días premium. (Ej: <span className="text-brand-accent font-bold">KOFFY-PRO-30</span>)
                  </p>
                </div>

                <form onSubmit={handleRedeemCode} className="flex gap-3">
                  <input 
                    type="text" 
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Escribe el código promocional..."
                    className="koffy-input py-2 text-xs focus:border-brand-gold uppercase flex-1"
                  />
                  <button 
                    type="submit"
                    disabled={isRedeeming}
                    className="py-2 px-6 rounded-lg bg-brand-gold/10 border border-brand-gold/30 text-brand-gold hover:bg-brand-gold/20 font-display tracking-widest text-xs transition-all uppercase"
                  >
                    {isRedeeming ? 'Validando...' : 'Canjear'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
