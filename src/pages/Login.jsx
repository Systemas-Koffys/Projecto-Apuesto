import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  ChevronRight, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { 
  fetchSignInMethodsForEmail, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../firebase.config';

const Login = () => {
  const [step, setStep] = useState('INITIAL'); // INITIAL, EMAIL_INPUT, PASSWORD_INPUT, SETUP_PASSWORD
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tempUser, setTempUser] = useState(null);
  const isSubmitting = useRef(false);
  
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const isAlphanumeric = (str) => /^[a-z0-9]+$/i.test(str);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await loginWithGoogle();
      const user = result.user;
      setEmail(user.email);
      setTempUser(user);
      const isNew = result._tokenResponse?.isNewUser;

      if (isNew) {
        setStep('SETUP_PASSWORD');
        toast.success('Cuenta Google vinculada');
      } else {
        setStep('PASSWORD_INPUT');
      }
    } catch (error) {
      toast.error('Error en Google Sign-In');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailFlow = async () => {
    if (isSubmitting.current) return;
    if (!email || !email.includes('@')) {
      toast.error('Ingresa un correo válido');
      return;
    }
    
    isSubmitting.current = true;
    setIsLoading(true);
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        setStep('PASSWORD_INPUT');
      } else {
        setStep('SETUP_PASSWORD');
        toast('Usuario no detectado. Vamos a registrarte.', { icon: '🚀' });
      }
    } catch (error) {
      setStep('SETUP_PASSWORD');
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleAuthFinal = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;

    if (password.length < 8 || !isAlphanumeric(password)) {
      toast.error('Clave inválida (8+ caracteres alfanuméricos)');
      return;
    }

    isSubmitting.current = true;
    setIsLoading(true);
    try {
      if (step === 'PASSWORD_INPUT') {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Acceso Autorizado');
      } else {
        if (password !== confirmPassword) {
          toast.error('Las contraseñas no coinciden');
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Registro completado');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error("Detalles del error de autenticación:", error);
      toast.error(`Error: ${error.message || 'Verifica tus datos'}`);
    } finally {
      setIsLoading(false);
      isSubmitting.current = false;
    }
  };

  const handleResetPassword = async () => {
    if (!email) return;
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Correo de recuperación enviado a ' + email);
    } catch (error) {
      toast.error('No se pudo enviar el correo');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg relative overflow-hidden p-4">
      <div className="radial-bg absolute inset-0 pointer-events-none"></div>
      <div className="grid-bg"></div>

      <motion.div layout className="w-full max-w-[460px] bg-brand-surface border border-brand-border2 rounded-[2rem] p-10 md:p-14 shadow-2xl relative z-10">
        
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl overflow-hidden mb-6 shadow-lg shadow-brand-accent/20">
            <img src="/icon-192.png" alt="RichBet" className="w-full h-full object-cover" />
          </div>
          <h1 className="font-display text-4xl tracking-[0.2em] text-white">RICHBET</h1>
          <p className="font-display text-lg tracking-[0.15em] text-brand-accent/80">ANALYTICS</p>
          <p className="koffy-mono text-[8px] text-brand-gray mt-2 tracking-[0.3em] uppercase">El Nuevo Método Apostador · Beta Tester</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'INITIAL' && (
            <motion.div key="1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
              <button onClick={handleGoogleLogin} className="w-full py-4 px-6 rounded-2xl bg-white text-black font-display tracking-widest text-sm hover:bg-gray-100 transition-all flex items-center justify-center gap-3 shadow-xl">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="G" />
                ACCESO GOOGLE
              </button>
              <button onClick={() => setStep('EMAIL_INPUT')} className="w-full py-4 px-6 rounded-2xl border border-brand-border2 text-white font-display tracking-widest text-sm hover:bg-brand-card transition-all flex items-center justify-center gap-3">
                <Mail size={18} />
                USAR CORREO ELECTRÓNICO
              </button>
            </motion.div>
          )}

          {step === 'EMAIL_INPUT' && (
            <motion.div key="2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <button onClick={() => setStep('INITIAL')} className="p-2 text-brand-gray hover:text-white"><ArrowLeft size={20} /></button>
                <h2 className="koffy-title text-xl">TU IDENTIFICADOR</h2>
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
                <input type="email" className="koffy-input pl-12" placeholder="usuario@koffy.com" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
              </div>
              <button onClick={handleEmailFlow} disabled={isLoading} className="w-full koffy-btn flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'IDENTIFICAR USUARIO'} <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {(step === 'PASSWORD_INPUT' || step === 'SETUP_PASSWORD') && (
            <motion.form key="3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onSubmit={handleAuthFinal} className="space-y-6">
              <div className="text-center p-4 bg-brand-bg/50 rounded-2xl border border-brand-border mb-6">
                <p className="font-mono text-xs text-brand-accent font-bold truncate">{email}</p>
              </div>

              <div className="flex items-center justify-between px-1">
                <h2 className="koffy-title text-xl">
                  {step === 'PASSWORD_INPUT' ? 'INGRESA CLAVE' : 'NUEVA CLAVE'}
                </h2>
                {step === 'PASSWORD_INPUT' && (
                  <button type="button" onClick={handleResetPassword} className="koffy-mono text-[7px] text-brand-gray hover:text-brand-accent flex items-center gap-1 uppercase">
                    <HelpCircle size={10} /> ¿Olvidaste la clave?
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
                  <input type={showPassword ? "text" : "password"} className="koffy-input pl-12 pr-12" placeholder="Contraseña de la Terminal" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-gray">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {step === 'SETUP_PASSWORD' && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-gray" size={16} />
                    <input type="password" className="koffy-input pl-12" placeholder="Confirma tu nueva clave" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                )}
              </div>

              <div className="p-4 bg-brand-accent/5 rounded-xl border border-brand-accent/20">
                <div className="flex gap-4">
                  <span className={`koffy-mono text-[7px] ${password.length >= 8 ? 'text-brand-green' : 'text-brand-gray'}`}>• 8+ CARACTERES</span>
                  <span className={`koffy-mono text-[7px] ${isAlphanumeric(password) && password !== '' ? 'text-brand-green' : 'text-brand-gray'}`}>• ALFANUMÉRICO</span>
                </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full koffy-btn flex items-center justify-center gap-2">
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'ABRIR TERMINAL'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Login;
