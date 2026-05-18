import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, LogOut, Terminal, PhoneCall } from 'lucide-react';

const MainLayout = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si el usuario está suspendido, renderizamos la pantalla de bloqueo Cyberpunk en tiempo real
  if (user?.status === 'suspended') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070202] relative overflow-hidden p-6 select-none">
        {/* Glows y Scanlines de fondo cyberpunk rojo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.08)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="grid-bg opacity-[0.03] pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[500px] bg-[#0c0505]/90 border border-red-950/60 rounded-[2.5rem] p-10 md:p-12 shadow-[0_0_50px_rgba(220,38,38,0.05)] text-center relative z-10 backdrop-blur-xl"
        >
          {/* Animación del escudo de bloqueo parpadeante */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-950/30 border border-red-500/30 mb-8 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.1)]">
            <ShieldAlert className="text-red-500" size={40} />
          </div>

          <h1 className="font-display text-2xl tracking-[0.2em] text-red-500 uppercase mb-2">Terminal Suspendida</h1>
          <p className="font-mono text-[9px] text-red-700 tracking-[0.4em] font-bold uppercase mb-6">Access Revoked</p>

          <div className="space-y-4 p-5 bg-red-950/10 rounded-2xl border border-red-950/40 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Terminal size={14} className="text-red-700 mt-1 flex-shrink-0" />
              <p className="font-mono text-[10px] text-red-400/80 leading-relaxed uppercase">
                Se ha detectado un bloqueo activo en tu terminal de seguridad. El administrador del sistema ha revocado de forma segura los accesos autorizados para este dispositivo.
              </p>
            </div>
            <div className="border-t border-red-950/40 pt-3 flex justify-between items-center">
              <span className="font-mono text-[7px] text-red-700">SUB-SYSTEM LOCKOUT</span>
              <span className="font-mono text-[7px] text-red-500 font-bold bg-red-950/30 px-2 py-0.5 rounded border border-red-900/30">SEC_ERR_REVOKED_v3.1.3</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a 
              href="https://t.me/+59169309970" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-white font-display tracking-widest text-[11px] hover:from-red-500 hover:to-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-900/20 uppercase"
            >
              <PhoneCall size={14} />
              Contactar Soporte Técnico
            </a>
            
            <button 
              onClick={logout}
              className="w-full py-4 px-6 rounded-2xl border border-red-950/40 text-red-500 hover:text-red-400 hover:bg-red-950/10 font-display tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 uppercase"
            >
              <LogOut size={14} />
              Cerrar Sesión de Terminal
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-bg selection:bg-brand-accent/30">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 md:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
